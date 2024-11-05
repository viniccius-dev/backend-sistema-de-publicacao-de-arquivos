const UserRepository = require("../repositories/UserRepository");
const UsersService = require("../services/UsersService");

class UsersController {
    async create(request, response) {
        const { name, email, password, domain_id } = request.body;

        const userRepository = new UserRepository();
        const usersService = new UsersService(userRepository);
        await usersService.userCreate({ name, email, password, domain_id });

        return response.status(201).json({ message: "Perfil criado com sucesso." });
    }
}

module.exports = UsersController;