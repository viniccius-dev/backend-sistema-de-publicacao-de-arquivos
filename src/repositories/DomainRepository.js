const knex = require("../database/knex");

class DomainRepository {
    async findById(id) {
        const domain = await knex("domains").where({ id }).first();

        return domain;
    }
}

module.exports = DomainRepository;