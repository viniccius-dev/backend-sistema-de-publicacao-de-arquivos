const knex = require("../database/knex");

class PublicationRepository {

    /* Publications */

    async findByIdAndDomainSimple({ publication_id, domain_id }) {
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

    async findByIdAndDomain({ publication_id, domain_id }) {
        const query = knex("publications")
            .where({ "publications.id": publication_id }) 
            .select(
                'publications.id as id',
                'number',
                'date',
                'description',
                'domain_id',
                'updated_at',
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
                'domain_id',
                'updated_at',
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

    async findByType(type_of_publication_id) {
        const publication = await knex("publications").where({ type_of_publication_id });

        return publication;
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

    async getPublications({
        domain_id, 
        types, 
        years, 
        domains, 
        searchText, 
        startYear, 
        endYear, 
        processNumber, 
        page 
        }) {
        function normalize(str) {
            return (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        }

        const searchTextNormalized = normalize(searchText);

        const baseQuery = knex("publications")
            .select(
            'publications.id as publication_id',
            'number',
            'date',
            'description',
            'updated_at',
            'publications.domain_id',
            'domains.domain_name',
            'publications.type_of_publication_id',
            'types_of_publication.name',
            'types_of_publication.number_title',
            'types_of_publication.date_title',
            'types_of_publication.description_title',
            'types_of_publication.file_title',
            knex.raw("CAST(SUBSTR(date, 7, 4) AS INTEGER) as publication_year"),
            knex.raw(`
                COALESCE(
                GROUP_CONCAT(
                JSON_OBJECT('name', attachments.name, 'attachment', attachments.attachment, 'type', attachments.type)
                ORDER BY attachments.id DESC
                ), 
                '') as attachments
            `)
            )
            .whereNotNull("description")
            .leftJoin("domains", "publications.domain_id", "domains.id")
            .leftJoin("attachments", "publications.id", "attachments.publication_id")
            .leftJoin("types_of_publication", "publications.type_of_publication_id", "types_of_publication.id")
            .groupBy(
            'publications.id',
            'number',
            'date',
            'description',
            'updated_at',
            'publications.domain_id',
            'domains.domain_name',
            'publications.type_of_publication_id',
            'types_of_publication.name',
            'types_of_publication.number_title',
            'types_of_publication.date_title',
            'types_of_publication.description_title',
            'types_of_publication.file_title',
            )
            .orderBy("number", "desc")
            .orderBy(knex.raw("SUBSTR(date, 7, 4) || '-' || SUBSTR(date, 4, 2) || '-' || SUBSTR(date, 1, 2)"), "desc")
            .modify(qb => {
            if (domain_id) qb.where({ 'publications.domain_id': domain_id });
            if (types && types.length) {
                const typesArray = types.split(',');
                qb.whereIn('types_of_publication.name', typesArray);
            }
            if (years && years.length) {
                const yearsArray = years.split(',').map(year => parseInt(year, 10));
                qb.whereIn(knex.raw("CAST(SUBSTR(date, 7, 4) AS INTEGER)"), yearsArray);
            } else if (startYear || endYear) {
                const yearColumn = knex.raw("CAST(SUBSTR(date, 7, 4) AS INTEGER)");
                if (startYear && endYear) qb.whereBetween(yearColumn, [startYear, endYear]);
                else if (startYear) qb.where(yearColumn, '>=', startYear);
                else qb.where(yearColumn, '<=', endYear);
            }
            if (domains && domains.length) {
                const domainsArray = domains.split(",");
                qb.whereIn("domains.domain_name", domainsArray);
            }
            if (processNumber) qb.where('number', 'like', `%${processNumber}%`);
            });

        try {
            const allItems = await baseQuery; // pega todos
            const normalizedItems = allItems.map(pub => {
            pub.attachments = pub.attachments ? JSON.parse(`[${pub.attachments}]`) : [];
            return pub;
            });

            // 🔹 Filtrar no Node, removendo acentos
            const filteredItems = searchText
            ? normalizedItems.filter(pub => {
                const desc = normalize(pub.description);
                return desc.includes(searchTextNormalized);
                })
            : normalizedItems;

            if (page !== undefined && page !== null) {
                const pageNumber = parseInt(page, 10) || 1;
                const pageSize = 20;
                const offset = (pageNumber - 1) * pageSize;
                const paginated = filteredItems.slice(offset, offset + pageSize);
                const totalPages = Math.ceil(filteredItems.length / pageSize);

                return {
                    totalItems: filteredItems.length,
                    totalPages,
                    currentPage: pageNumber,
                    items: paginated
            };
            } else {
                return filteredItems;
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
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
            .select(knex.raw("SUBSTR(date, 7, 4) as publication_year")) // Pega os 4 caracteres do ano
            .distinct(knex.raw("SUBSTR(date, 7, 4)"))
            .orderBy(knex.raw("SUBSTR(date, 7, 4)"), "desc");

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