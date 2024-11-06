const knex = require("../database/knex");

class userRepository {
    async findById(id) {
        const user = await knex("users").where({ id }).first();

        return user;
    }

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
    };

    async update(user) {
        const userUpdated = await knex("users").update(user).where({ id: user.id });

        return userUpdated;
    }
}

module.exports = userRepository;