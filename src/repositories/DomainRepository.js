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

    async findByName(domain_name) {
        const domain = await knex("domains").where({ domain_name }).first();

        return domain;
    };

    async create({ domain_name, url }) {
        const [domainId] = await knex("domains").insert({
            domain_name,
            url
        });

        return { id: domainId };
    };

    async update(domain) {
        const domainUpdate = await knex("domains").update(domain).where({ id: domain.id });

        return domainUpdate;
    };

    async delete(id) {
        return await knex("domains").where({ id }).delete();
    };

    async getDomains() {
        const domains = await knex("domains").orderBy("domain_name");

        return domains;
    }
}

module.exports = DomainRepository;