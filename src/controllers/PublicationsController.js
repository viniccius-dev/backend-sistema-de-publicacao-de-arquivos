const { verify } = require("jsonwebtoken");

const PublicationRepository = require("../repositories/PublicationRepository");
const PublicationsService = require("../services/PublicationsService");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");

class PublicationsController {
    async create(request, response) {
        const { type_of_publication_id, number, date, description, domain_id } = request.body;
        const { role } = request.user;
        const domainId = role !== "admin" ? request.user.domain_id : domain_id;

        const publicationRepository = new PublicationRepository();
        const publicationsService = new PublicationsService(publicationRepository);
        const publication = await publicationsService.publicationCreate({
            type_of_publication_id,
            number,
            date,
            description,
            domain_id: domainId
        });

        return response.status(201).json({ publication, message: "Publicação cadastrada com sucesso." });
    };

    async update(request, response) {
        const { type_of_publication_id, number, date, description } = request.body;
        const { domain_id } = request.user;
        const { publication_id } = request.params;

        const publicationRepository = new PublicationRepository();
        const publicationsService = new PublicationsService(publicationRepository);
        await publicationsService.publicationUpdate({
            publication_id,
            type_of_publication_id,
            number,
            date,
            description,
            domain_id
        });

        return response.json({ message: "Publicação atualizada com sucesso." });
    };

    async delete(request, response) {
        const { publication_id } = request.params;
        const { domain_id } = request.user;

        const publicationRepository = new PublicationRepository();
        const publicationsService = new PublicationsService(publicationRepository);
        await publicationsService.publicationDelete({ publication_id, domain_id });

        return response.json({ message: "Publicação deletada com sucesso." });
    };

    async index(request, response) {
        let domain_id = null;
        const { 
            types, 
            years, 
            domains, 
            searchText,
            startYear,
            endYear,
            processNumber,
            page 
        } = request.query;
        const authHeader = request.headers.authorization;

        if(authHeader) {
            const [, token] = authHeader.split(" ");

            try {
                const { domain_id: domainId } = verify(token, authConfig.jwt.secret);

                domain_id = domainId;
            } catch {
                throw new AppError("JWT Token Inválido", 401);
            };
        };

        const publicationRepository = new PublicationRepository();
        const publications = await publicationRepository.getPublications({
            domain_id, 
            types, 
            years, 
            domains, 
            searchText,
            startYear,
            endYear,
            processNumber,
            page
        });

        return response.json(publications);
    };

    async show(request, response) {
        const { publication_id } = request.params;
        const { domain_id } = request.user;

        const publicationRepository = new PublicationRepository();
        const publicationsService = new PublicationsService(publicationRepository);
        const publication = await publicationsService.showPublication({ publication_id, domain_id });

        return response.json(publication);
    };

    async filters(request, response) {
        const { domain_id } = request.user;

        const publicationRepository = new PublicationRepository();

        const types = await publicationRepository.getTypes(domain_id);
        const years = await publicationRepository.getYears(domain_id);
        const domains = await publicationRepository.getDomains();

        return response.json({ types, years, domains });
    };
};

module.exports = PublicationsController;