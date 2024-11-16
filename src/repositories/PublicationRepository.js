const knex = require("../database/knex");

class PublicationRepository {

    /* Publications */

    async findByIdAndDomain({ publication_id, domain_id }) {
        const query = knex("publications")
            .where({ "publications.id": publication_id }) 
            .select(
                'publications.id as id',
                'number',
                'date',
                'description',
                'created_at',
                'types_of_publication.id as type_id',
                'types_of_publication.name',
                'types_of_publication.number_title',
                'types_of_publication.date_title',
                'types_of_publication.description_title',
                'types_of_publication.file_title',
            )
            .leftJoin("types_of_publication", "publications.type_of_publication_id", "types_of_publication.id")
            .groupBy(
                'publications.id',
                'number',
                'date',
                'description',
                'created_at',
                'publications.type_of_publication_id',
                'types_of_publication.name',
                'types_of_publication.number_title',
                'types_of_publication.date_title',
                'types_of_publication.description_title',
                'types_of_publication.file_title',
            )
            .first();

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

    async delete(id) {
        return await knex("publications").where({ id }).delete();
    };

    async getBids({ domain_id, types, years, domains, searchText }) {
        const query = knex("publications")
            .select(
                'publications.id as publication_id',
                'number',
                'date',
                'description',
                'created_at',
                'publications.domain_id',
                'domains.domain_name',
                'publications.type_of_publication_id',
                'types_of_publication.name',
                'types_of_publication.number_title',
                'types_of_publication.date_title',
                'types_of_publication.description_title',
                'types_of_publication.file_title',
                knex.raw("STRFTIME('%Y', created_at) as publication_year"),
                knex.raw("COALESCE(GROUP_CONCAT(JSON_OBJECT('name', attachments.name, 'attachment', attachments.attachment) ORDER BY attachments.id DESC), '') as attachments")
            )
            .whereLike("description", `%${searchText}%`)
            .orderBy("created_at", "desc")
            .leftJoin("domains", "publications.domain_id", "domains.id")
            .leftJoin("attachments", "publications.id", "attachments.publication_id")
            .leftJoin("types_of_publication", "publications.type_of_publication_id", "types_of_publication.id")
            .groupBy(
                'publications.id',
                'number',
                'date',
                'description',
                'created_at',
                'publications.domain_id',
                'domains.domain_name',
                'publications.type_of_publication_id',
                'types_of_publication.name',
                'types_of_publication.number_title',
                'types_of_publication.date_title',
                'types_of_publication.description_title',
                'types_of_publication.file_title',
            );

        if(domain_id) {
            query.where({ 'publications.domain_id': domain_id });
        };

        if(types && types.length) {
            const typesArray = types.split(',');
            query.whereIn('types_of_publication.name', typesArray);
        };

        if(years && years.length) {
            const yearsArray = years.split(',');
            query.whereIn(knex.raw("STRFTIME('%Y', publications.created_at)"), yearsArray);
        };

        if(domains && domains.length) {
            const domainsArray = domains.split(",");
            query.whereIn("domains.domain_name", domainsArray);
        };

        try {
            const publications = await query;

            const publicationsWithAttachments = publications.map(publication => {
                publication.attachments = JSON.parse(publication.attachments).name
                    ? JSON.parse(`[${publication.attachments}]`)
                    : [];
                return publication;
            });

            return publicationsWithAttachments;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    /* Attachments */

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

    /* Filters */

    async getTypes(domain_id) {
        const query = knex("publications")
            .distinct("types_of_publication.name")
            .select('types_of_publication.name')
            .orderBy("types_of_publication.name")
            .leftJoin("types_of_publication", "publications.type_of_publication_id", "types_of_publication.id");

        if(domain_id) {
            query.where({ 'publications.domain_id': domain_id });
        };

        const result = await query;

        return result.map(row => row.name)
    };

    async getYears(domain_id) {
        const query = knex("publications")
            .select(knex.raw("STRFTIME('%Y', created_at) as publication_year"))
            .distinct(knex.raw("STRFTIME('%Y', publications.created_at)"))
            .orderBy(knex.raw("STRFTIME('%Y', publications.created_at)"), "desc");

        if(domain_id) {
            query.where({ domain_id });
        };

        const result = await query;

        return result.map(row => row.publication_year);
    };

    async getDomains() {
        const result = await knex('domains').distinct('domain_name').orderBy('domain_name');
        return result.map(row => row.domain_name);
    };
};

module.exports = PublicationRepository;