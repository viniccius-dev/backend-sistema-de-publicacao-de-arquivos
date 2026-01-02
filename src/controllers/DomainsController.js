const fs = require("fs");

const AppError = require("../utils/AppError");

const DomainRepository = require("../repositories/DomainRepository");
const BackupLogsRepository = require("../repositories/BackupLogsRepository");
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
    };

    async exportDatabaseAndAttachments(request, response) {
        const { domain_id, type_of_publication_id } = request.query;

        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);

        try {
            const zipPath = await domainsService.exportDatabaseAndAttachments({
                domain_id,
                type_of_publication_id
            });

            response.download(zipPath, `export_${Date.now()}.zip`, (err) => {
                if (err) console.error(err);
                if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
            });
        } catch (error) {
            console.error("Erro ao exportar os dados e arquivos anexados", error);
            response.status(500).json({ message: "Erro ao exportar os dados e arquivos anexados" });
        }
    };

    async confirmImport(request, response) {
        const { importId } = request.body;

        const domainsService = new DomainsService();

        try {
            await domainsService.confirmImport(importId);

            return response.json({ message: "Importação concluída com sucesso" });
        } catch(error) {
            throw new AppError(`Erro ao importar arquivos: ${error}`, 500);
        }
    };

    async startImport(request, response) {
        const { path: tempPath } = request.file;

        const domainsService = new DomainsService();

        try {
            const result = await domainsService.startImport(tempPath);

            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            throw new AppError("Erro ao iniciar importação", 500);
        };
    };

    async indexLogsBackup(request, response) {
        const { page } = request.query;

        const backupLogsRepository = new BackupLogsRepository();
        const backupLogs = await backupLogsRepository.getBackupLogs(page);

        return response.json(backupLogs);
    };

    async getExportProgress(request, response) {
        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);
        const exportProgress = await domainsService.getExportProgress();

        response.json({ progress: exportProgress })
    };

    async getImportProgress(request, response) {
        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);
        const { importStage, importStageProgress } = await domainsService.getImportProgress();

        const total =
            importStage * 33 + Math.round(importStageProgress * 0.33);

        response.json({ progress: Math.min(total, 100) })
    }

    async updateSystemSettings(request, response) {
        const { key, value } = request.body;

        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);
        await domainsService.systemSettingUpdate({ key, value });

        return response.json({ message: "Configuração de backup automático atualizado com sucesso." });
    };

    async getSystemSetting(request, response) {
        const { key } = request.params;

        const domainRepository = new DomainRepository();
        const setting = await domainRepository.findSettingByKey({ key });

        return response.json(setting);
    };
};

module.exports = DomainsController;