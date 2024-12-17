const knex = require("../database/knex");

class TypesOfPublicationRepository {
    async findByName(name) {
        const typeName = await knex("types_of_publication").where({ name }).first();

        return typeName;
    };

    async findById(id) {
        const type = await knex("types_of_publication").where({ id }).first();

        return type;
    };

    async create({ name, number_title, date_title, description_title, file_title }) {
        const [typeId] = await knex("types_of_publication").insert({
            name,
            number_title,
            date_title,
            description_title,
            file_title
        });

        return { id: typeId };
    };

    async update(typeOfPublication) {
        const typeOfPublicationUpdate = await knex("types_of_publication").update(typeOfPublication)
            .where({ id: typeOfPublication.id });

        return typeOfPublicationUpdate;
    };

    async getTypes() {
        const typesOfPublication = await knex("types_of_publication").orderBy("name", "asc");

        return typesOfPublication;
    };

    async delete(id) {
        return await knex("types_of_publication").where({ id }).delete();
    }
};

module.exports = TypesOfPublicationRepository;