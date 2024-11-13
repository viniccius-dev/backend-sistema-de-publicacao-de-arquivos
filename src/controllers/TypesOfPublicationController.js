const TypesOfPublicationRepository = require("../repositories/TypesOfPublicationRepository");
const TypesOfPublicationService = require("../services/TypesOfPublicationService");

class TypesOfPublicationController {
    async create(request, response) {
        const { name, number_title, date_title, description_title, file_title } = request.body;

        const typesOfPublicationRepository = new TypesOfPublicationRepository();
        const typesOfPublicationService = new TypesOfPublicationService(typesOfPublicationRepository);
        await typesOfPublicationService.userCreate({
            name,
            number_title,
            date_title,
            description_title,
            file_title
        });

        return response.status(201).json({ message: "Perfil criado com sucesso" });
    };

    async index(request, response) {
        const typesOfPublicationRepository = new TypesOfPublicationRepository();
        const typesOfPublication = await typesOfPublicationRepository.getTypes();

        return response.json(typesOfPublication);
    }
};

module.exports = TypesOfPublicationController;