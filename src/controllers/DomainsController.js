const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const knex = require("../database/knex");
const DomainRepository = require("../repositories/DomainRepository");
const DomainsService = require("../services/DomainsService");

class DomainsController {
    async create(request, response) {
        const { domain_name, url } = request.body;

        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);
        await domainsService.domainCreate({ domain_name, url });

        return response.status(201).json({ message: "Domínio cadastrado com sucesso." });
    };

    async update(request, response) {
        const { domain_name, url } = request.body;
        const { domain_id } = request.params;

        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);
        await domainsService.domainUpdate({ domain_name, url, domain_id });

        return response.json({ message: "Informações de domínio atualizadas com sucesso." });
    };

    async delete(request, response) {
        const { domain_id } = request.params;

        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);
        await domainsService.domainDelete(domain_id);

        return response.json({ message: "Domínio deletado com sucesso." });
    };

    async index(request, response) {
        const domainRepository = new DomainRepository();
        const domains = await domainRepository.getDomains();

        return response.json(domains);
    };

    async show(request, response) {
        const { domain_id } = request.params;

        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);
        const domain = await domainsService.showDomain(domain_id);

        return response.json(domain);
    }

    // TODO: Fragmentar para DomainsService e DomainRepository
    async exportDatabaseAndAttachments(request, response) {
        const { domain_id } = request.params;

        const exportPath = path.resolve(__dirname, "..", "database", `export_${domain_id}.sql`);
        const zipPath = path.resolve(__dirname, "..", "..", "tmp", `export_${domain_id}.zip`);
        const uploadPath = path.resolve(__dirname, "..", "..", "tmp", "uploads");

        // Função para gerar comandos CREATE TABLE
        const createTableStatements = async (tableName) => {
            const tableInfo = await knex.raw(`PRAGMA table_info(${tableName})`);
            const columns = tableInfo.map(column => {
                const name = column.name;
                const type = column.type;
                const notnull = column.notnull ? "NOT NULL" : "";
                const dflt_value = column.dflt_value ? `DEFAULT ${column.dflt_value}` : "";
                const pk = column.pk ? "PRIMARY KEY" : "";
                return `${name} ${type} ${notnull} ${dflt_value} ${pk}`.trim();
            }).join(", ");

            return `CREATE TABLE ${tableName} (${columns});`;
        };

        // Função para criar um SQL dump para uma tabela
        const createInsertStatements = async (tableName, condition) => {
            let rows;
            if (condition) {
                rows = await knex(tableName).where(condition);
            } else {
                rows = await knex(tableName);
            }

            const inserts = rows.map(row => {
                const columns = Object.keys(row).join(", ");
                const values = Object.values(row).map(value => {
                    if (typeof value === "string") {
                        return `'${value.replace(/'/g, "''")}'`; // Escapa apóstrofos
                    }
                    if (value === null) {
                        return "NULL";
                    }
                    return value;
                }).join(", ");
                return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
            });
            return inserts.join("\n");
        };

        try {
            // Cria um arquivo SQL com os dados exportados
            let sqlContent = "";

            sqlContent += `-- Exportando dados para domain_id=${domain_id}\n\n`;

            // Adiciona comandos CREATE TABLE
            sqlContent += await createTableStatements('users');
            sqlContent += "\n";
            sqlContent += await createTableStatements('attachments');
            sqlContent += "\n";
            sqlContent += await createTableStatements('publications');
            sqlContent += "\n";
            sqlContent += await createTableStatements('types_of_publication');
            sqlContent += "\n";
            sqlContent += await createTableStatements('domains');
            sqlContent += "\n";

            // Adiciona dados de cada tabela
            sqlContent += await createInsertStatements('users', { domain_id });
            sqlContent += "\n";
            sqlContent += await createInsertStatements('attachments', { domain_id });
            sqlContent += "\n";
            sqlContent += await createInsertStatements('publications', { domain_id });
            sqlContent += "\n";
            sqlContent += await createInsertStatements('types_of_publication');
            sqlContent += "\n";
            sqlContent += await createInsertStatements('domains', { id: domain_id });
            sqlContent += "\n";

            fs.writeFileSync(exportPath, sqlContent);

            // Selecionar arquivos da tabela attachments filtrados pelo domain_id
            const attachments = await knex('attachments').where({ domain_id }).select('attachment');

            // Criar um arquivo zip
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', function() {
                console.log(archive.pointer() + ' total bytes');
                console.log('Arquivo ZIP foi criado e fechado.');
                // Enviar o arquivo ZIP como resposta
                response.download(zipPath, `export_${domain_id}.zip`, (err) => {
                    if (err) {
                        console.error(err);
                    }
                    // Remover o arquivo ZIP após o download
                    fs.unlinkSync(zipPath);
                });
            });

            archive.on('error', function(err) {
                throw err;
            });

            archive.pipe(output);

            // Adicionar o arquivo SQL ao arquivo ZIP
            archive.file(exportPath, { name: `export_${domain_id}.sql` });

            // Adicionar arquivos de uploads ao arquivo ZIP
            if (attachments.length > 0) {
                for (const attachment of attachments) {
                    const filePath = path.join(uploadPath, attachment.attachment);
                    if (fs.existsSync(filePath)) {
                        archive.file(filePath, { name: `uploads/${attachment.attachment}` });
                    } else {
                        console.warn(`Arquivo ${attachment.attachment} não encontrado.`);
                    }
                }
            } else {
                console.warn('Nenhum arquivo encontrado para este domínio.');
            }

            // Finalizar o arquivo ZIP
            await archive.finalize();

            // Remover o arquivo SQL temporário
            fs.unlinkSync(exportPath);
        } catch (error) {
            console.error("Erro ao exportar os dados e arquivos anexados", error);
            response.status(500).json({ message: "Erro ao exportar os dados e arquivos anexados" });
        }
    };
}

module.exports = DomainsController;