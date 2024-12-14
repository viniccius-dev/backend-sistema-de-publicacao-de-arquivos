const { format } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");

const AppError = require("../utils/AppError");
const DomainRepository = require("../repositories/DomainRepository");
const TypesOfPublicationRepository = require("../repositories/TypesOfPublicationRepository");
const DiskStorage = require("../providers/DiskStorage");

class PublicationsService {
    constructor(publicationRepository) {
        this.publicationRepository = publicationRepository;
    }

    /* Publications */

    async publicationCreate({ type_of_publication_id, number, date, description, domain_id }) {
        if(!type_of_publication_id || !domain_id) {
            throw new AppError("Favor inserir todas as informações solicitadas.");
        };

        const domainRepository = new DomainRepository();
        const domain = await domainRepository.findById(domain_id);

        if(!domain) {
            throw new AppError("Domínio não encontrado", 404);
        };

        const typesOfPublicationRepository = new TypesOfPublicationRepository();
        const typeOfPublication = await typesOfPublicationRepository.findById(type_of_publication_id);

        if(!typeOfPublication) {
            throw new AppError("Tipo de publicação não encontrado", 404);
        };

        const publicationCreated = await this.publicationRepository.create({
            type_of_publication_id,
            number,
            date,
            description,
            domain_id
        });

        return publicationCreated;
    };

    async publicationUpdate({ publication_id, type_of_publication_id, number, date, description, domain_id }) {
        const publication = await this.publicationRepository.findByIdAndDomainSimple({ publication_id, domain_id });

        if(!publication) {
            throw new AppError("Publicação não encontrada.", 404);
        };

        if(type_of_publication_id) {
            const typesOfPublicationRepository = new TypesOfPublicationRepository();
            const typeOfPublication = await typesOfPublicationRepository.findById(type_of_publication_id);
    
            if(!typeOfPublication) {
                throw new AppError("Insira um tipo de publicação válido.", 404);
            };

            publication.type_of_publication_id = type_of_publication_id;
        }

        publication.number = number ?? null;
        publication.date = date ?? null;
        publication.description = description ?? null;

        const updateAt = new Date();
        const zonedDate = toZonedTime(updateAt, "UTC");
        publication.updated_at = format(zonedDate, "yyyy-MM-dd HH:mm:ss", { timeZone: "UTC" });

        const publicationUpdated = await this.publicationRepository.update(publication);

        return publicationUpdated;
    };

    async publicationDelete({ publication_id, domain_id }) {
        const publication = await this.publicationRepository.findByIdAndDomain({ publication_id, domain_id });

        if(!publication) {
            throw new AppError("Publicação não encontrada.", 404);
        };

        const getAttachments = await this.publicationRepository.getAttachments({ publication_id });
        const attachments = getAttachments.map(attachment => String(attachment.id));

        await this.attachmentsDelete({ domain_id, attachments });

        return await this.publicationRepository.delete(publication.id);
    };

    async showPublication({ publication_id, domain_id }) {
        const publication = await this.publicationRepository.findByIdAndDomain({ publication_id, domain_id });

        if(!publication) {
            throw new AppError("Publicação não encontrada.", 404);
        };

        return publication;
    }

    /* Attachments */

    async attachmentsCreate({ publication_id, domain_id, uploads, type }) {
        const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip", ".ppt", ".pptx", ".png", ".jpg"];

        const diskStorage = new DiskStorage();

        const publication = await this.publicationRepository.findByIdAndDomain({ publication_id, domain_id });

        if(!publication) {
            throw new AppError("Publicação vinculada não encontrada", 404);
        };

        if(!type || type === "main" && uploads.length > 1) {
            throw new AppError("Erro ao adicionar os arquivos. Verifique os anexos ou tente novamente com outros arquivos.");
        }

        const attachmentsCreate = await Promise.all(uploads.map(async upload => {
            const filename = upload?.filename;
            // const type = upload?.filename ? "file" : "link";
            let attachment;
            let attachmentName;

            // Verificar se a extensão é permitida
            const fileExtension = filename.substring(filename.lastIndexOf(".")).toLowerCase();
            if(!allowedExtensions.includes(fileExtension)) {
                return;
            }

            attachment = await diskStorage.saveFile(filename);

            const nameWithoutExtension = filename.substring(0, filename.lastIndexOf("."));
            const firstDashIndex = nameWithoutExtension.indexOf("-");
            attachmentName = Buffer.from(nameWithoutExtension.substring(firstDashIndex + 1).trim(), 'latin1').toString('utf-8');

            return {
                name: attachmentName,
                type,
                attachment,
                publication_id,
                domain_id: publication.domain_id
            };
        }));

        const filteredAttachments = attachmentsCreate.filter(attachment => attachment !== undefined);

        return await this.publicationRepository.createAttachments(filteredAttachments);
    };

    async attachmentsDelete({ domain_id, attachments }) {
        const attachmentDelete = await Promise.all(attachments.map(async attachment => {
            const file = await this.publicationRepository.findAttachmentById(attachment);

            if(!file || domain_id !== null && file?.domain_id !== Number(domain_id)) {
                return;
            };

            const diskStorage = new DiskStorage();

            await diskStorage.deleteFile(file.attachment);
            
            await this.publicationRepository.deleteAttachments(file.id);

            return file;
        }));

        return attachmentDelete;
    };
}

module.exports = PublicationsService;