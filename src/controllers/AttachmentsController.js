const PublicationRepository = require("../repositories/PublicationRepository");
const PublicationsService = require("../services/PublicationsService");

class AttachmentsController {
    async create(request, response) {
        const { publication_id } = request.params;
        const { domain_id } = request.user;
        const { type } = request.body;

        const uploads = [...request.files];

        const publicationRepository = new PublicationRepository();
        const publicationsService = new PublicationsService(publicationRepository);
        await publicationsService.attachmentsCreate({ publication_id, domain_id, uploads, type });

        return response.json({ message: "Anexo(s) cadastrado(s) com sucesso." });
    };

    async delete(request, response) {
        const { domain_id } = request.user;
        const { attachments } = request.body;

        const publicationRepository = new PublicationRepository();
        const publicationsService = new PublicationsService(publicationRepository);
        await publicationsService.attachmentsDelete({ domain_id, attachments });

        return response.json({ message: "Anexo deletado com sucesso." });
    };

    async index(request, response) {
        const { publication_id } = request.params;

        const publicationRepository = new PublicationRepository();
        const attachments = await publicationRepository.getAttachments({ publication_id });

        return response.json(attachments);
    }
};

module.exports = AttachmentsController;