const knex = require("../database/knex");

class userRepository {
    async findByEmail(email) {
        const user = await knex("users").where({ email }).first();

        return user;
    };

    async create({ name, email, password, domain_id }) {
        const [userId] = await knex("users").insert({
            name,
            email,
            password,
            domain_id
        });

        return { id: userId }
    }
}

module.exports = userRepository;