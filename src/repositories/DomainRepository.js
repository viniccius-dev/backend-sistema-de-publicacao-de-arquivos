const knex = require("../database/knex");

class DomainRepository {
    async findByUrl(url) {
        const domain = await knex("domains").where({ url }).first();

        return domain;
    };

    async findById(id) {
        const domain = await knex("domains").where({ id }).first();

        return domain;
    };

    async create({ domain_name, url }) {
        const [domainId] = await knex("domains").insert({
            domain_name,
            url
        });

        return { id: domainId };
    }
}

module.exports = DomainRepository;