const AppError = require("../utils/AppError");

class TypesOfPublicationService {
    constructor(typeOfPublicationRepository) {
        this.typeOfPublicationRepository = typeOfPublicationRepository;
    }

    async userCreate({ name, number_title, date_title, description_title, file_title }) {

        if(!name) {
            throw new AppError("Insira o nome do tipo de publicação, por favor");
        };

        const checkNameExist = await this.typeOfPublicationRepository.findByName(name);

        if(checkNameExist) {
            throw new AppError("Já existe um tipo de publicação registrado com esse nome.")
        }

        const typePublicationCreated = await this.typeOfPublicationRepository.create({
            name,
            number_title,
            date_title,
            description_title,
            file_title
        });

        return typePublicationCreated;
    }
}

module.exports = TypesOfPublicationService;