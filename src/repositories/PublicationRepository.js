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
    };

    async findAttachmentById(id) {
        const attachment = await knex("attachments").where({ id }).first();

        return attachment;
    };

    async getAttachments({ domain_id, publication_id }) {
        const query = knex("attachments").orderBy("id", "desc");

        if(domain_id) {
            query.where({ domain_id });
        };

        if(publication_id) {
            query.where({ publication_id });
        };

        try {
            const attachments = await query;
            return attachments;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    async createAttachments(filteredAttachments) {
        const attachments = await knex("attachments").insert(filteredAttachments);

        return attachments;
    };

    async deleteAttachments(id) {
        return await knex("attachments").where({ id }).delete();
    };
};

module.exports = PublicationRepository;