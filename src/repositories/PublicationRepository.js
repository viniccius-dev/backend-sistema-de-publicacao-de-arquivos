const knex = require("../database/knex");

class PublicationRepository {
    async create({ type_of_publication_id, number, date, description, domain_id }) {
        const [publicationId] = await knex("publications").insert({
            type_of_publication_id,
            number,
            date,
            description,
            domain_id
        });

        return { id: publicationId };
    }
};

module.exports = PublicationRepository;