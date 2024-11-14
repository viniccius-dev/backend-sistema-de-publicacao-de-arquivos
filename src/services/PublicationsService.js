const { format } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");

const AppError = require("../utils/AppError");
const DomainRepository = require("../repositories/DomainRepository");
const TypesOfPublicationRepository = require("../repositories/TypesOfPublicationRepository");

class PublicationsService {
    constructor(publicationRepository) {
        this.publicationRepository = publicationRepository;
    }

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
        const publication = await this.publicationRepository.findByIdAndDomain({ publication_id, domain_id });

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
}

module.exports = PublicationsService;