const PublicationRepository = require("../repositories/PublicationRepository");
const PublicationsService = require("../services/PublicationsService");
const AppError = require("../utils/AppError");

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

    // TODO: Endpoint delete
};

module.exports = PublicationsController;