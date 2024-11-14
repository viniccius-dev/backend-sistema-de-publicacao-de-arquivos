const knex = require("../database/knex");

class PublicationRepository {
    async findByIdAndDomain({ publication_id, domain_id }) {
        const query = knex("publications").where({ id: publication_id }).first();

        if(domain_id) {
            query.where({ domain_id });
        };

        try {
            const publication = await query;
            return publication;
        } catch (err) {
            console.error(err);
            throw err;
        };
    };

    async create({ type_of_publication_id, number, date, description, domain_id }) {
        const [publicationId] = await knex("publications").insert({
            type_of_publication_id,
            number,
            date,
            description,
            domain_id
        });

        return { id: publicationId };
    };

    async update(publication) {
        const publicationUpdated = await knex("publications").update(publication).where({ id: publication.id });

        return publicationUpdated;
    }
};

module.exports = PublicationRepository;