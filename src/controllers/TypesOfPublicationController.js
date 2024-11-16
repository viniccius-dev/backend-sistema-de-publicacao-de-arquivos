const TypesOfPublicationRepository = require("../repositories/TypesOfPublicationRepository");
const TypesOfPublicationService = require("../services/TypesOfPublicationService");

class TypesOfPublicationController {
    async create(request, response) {
        const { name, number_title, date_title, description_title, file_title } = request.body;

        const typesOfPublicationRepository = new TypesOfPublicationRepository();
        const typesOfPublicationService = new TypesOfPublicationService(typesOfPublicationRepository);
        await typesOfPublicationService.typeCreate({
            name,
            number_title,
            date_title,
            description_title,
            file_title
        });

        return response.status(201).json({ message: "Tipo de publicação criado com sucesso" });
    };

    async update(request, response) {
        const { name, number_title, date_title, description_title, file_title } = request.body;
        const { type_id } = request.params;

        const typesOfPublicationRepository = new TypesOfPublicationRepository();
        const typesOfPublicationService = new TypesOfPublicationService(typesOfPublicationRepository);
        await typesOfPublicationService.typeUpdate({
            name,
            number_title,
            date_title,
            description_title,
            file_title,
            type_id
        });

        return response.json({ message: "Informaçãos do tipo de publicação atualizada(s) com sucesso." });
    }

    async index(request, response) {
        const typesOfPublicationRepository = new TypesOfPublicationRepository();
        const typesOfPublication = await typesOfPublicationRepository.getTypes();

        return response.json(typesOfPublication);
    };

    async delete(request, response) {
        const { type_id } = request.params;
        
        const typesOfPublicationRepository = new TypesOfPublicationRepository();
        const typesOfPublicationService = new TypesOfPublicationService(typesOfPublicationRepository);

        await typesOfPublicationService.typeDelete({ id: type_id });

        return response.json({ message: "Tipo de publicação deletado com sucesso."});
    }
};

module.exports = TypesOfPublicationController;