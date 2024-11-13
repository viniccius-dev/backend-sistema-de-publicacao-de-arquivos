const knex = require("../database/knex");

class TypesOfPublicationRepository {
    async findByName(name) {
        const typeName = await knex("types_of_publication").where({ name }).first();

        return typeName;
    }

    async create({ name, number_title, date_title, description_title, file_title }) {
        const [typeId] = await knex("types_of_publication").insert({
            name,
            number_title,
            date_title,
            description_title,
            file_title
        });

        return { id: typeId };
    }
};

module.exports = TypesOfPublicationRepository;