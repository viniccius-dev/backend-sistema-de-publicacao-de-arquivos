const PublicationRepository = require("../repositories/PublicationRepository");
const PublicationsService = require("../services/PublicationsService");

class AttachmentsController {
    async create(request, response) {
        const { publication_id } = request.params;
        const { domain_id } = request.user;
        const urls_links = request.body.urls_links ? JSON.parse(request.body.urls_links) : [];

        const uploads = [...urls_links, ...request.files];

        const publicationRepository = new PublicationRepository();
        const publicationsService = new PublicationsService(publicationRepository);
        await publicationsService.attachmentsCreate({ publication_id, domain_id, uploads });

        return response.json({ message: "Anexo(s) cadastrado(s) com sucesso." });
    }
};

module.exports = AttachmentsController;