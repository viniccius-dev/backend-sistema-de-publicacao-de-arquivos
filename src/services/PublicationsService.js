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
        }

        const publicationCreated = await this.publicationRepository.create({
            type_of_publication_id,
            number,
            date,
            description,
            domain_id
        });

        return publicationCreated;
    }
}

module.exports = PublicationsService;