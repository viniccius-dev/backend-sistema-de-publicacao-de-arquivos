const AppError = require("../utils/AppError");

const PublicationRepository = require("../repositories/PublicationRepository");

class TypesOfPublicationService {
    constructor(typesOfPublicationRepository) {
        this.typesOfPublicationRepository = typesOfPublicationRepository;
    };

    async typeCreate({ name, number_title, date_title, description_title, file_title }) {

        if(!name) {
            throw new AppError("Insira o nome do tipo de publicação, por favor");
        };

        const checkNameExist = await this.typesOfPublicationRepository.findByName(name);

        if(checkNameExist) {
            throw new AppError("Já existe um tipo de publicação registrado com esse nome.")
        }

        const typePublicationCreated = await this.typesOfPublicationRepository.create({
            name,
            number_title,
            date_title,
            description_title,
            file_title
        });

        return typePublicationCreated;
    };

    async typeUpdate({ name, number_title, date_title, description_title, file_title, type_id }) {
        const type = await this.typesOfPublicationRepository.findById(type_id);

        if(!type) {
            throw new AppError("Tipo de publicação não encontrado.", 404);
        };

        if(name) {
            const typeWithUpdateName = await this.typesOfPublicationRepository.findByName(name);

            if(typeWithUpdateName && typeWithUpdateName.id !== type.id) {
                throw new AppError("Já existe um tipo de publicação com esse nome. Por favor insira outro nome.");
            };
        };

        if(name !== "") {
            type.name = name ?? type.name;
        };

        // No Front, não deixar mandar o form com os campos escolhidos como "vazio"
        type.number_title = number_title ?? null;
        type.date_title = date_title ?? null;
        type.description_title = description_title ?? null;
        type.file_title = file_title ?? null;

        const typeOfPublicationUpdate = await this.typesOfPublicationRepository.update(type);

        return typeOfPublicationUpdate;
    };

    async typeDelete({ id }) {
        const type = await this.typesOfPublicationRepository.findById(id);

        if(!type) {
            throw new AppError("Tipo de publicação não encontrado.", 404);
        };

        const publicationRepository = new PublicationRepository();
        const publicationsWithType = await publicationRepository.findByType(type.id);

        if(publicationsWithType.length > 0) {
            throw new AppError("O tipo não pode ser deletado. Existem publicações desse tipo registradas no sistema", 409);
        };

        return await this.typesOfPublicationRepository.delete(type.id);
    }
}

module.exports = TypesOfPublicationService;