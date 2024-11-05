const knex = require("../database/kenx");

class DomainRepository {
    async findById(id) {
        const domain = await knex("domains").where({ id }).first();

        return domain;
    }
}

module.exports = DomainRepository;