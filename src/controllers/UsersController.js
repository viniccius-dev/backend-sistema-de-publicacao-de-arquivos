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

    async update(request, response) {
        const { name, email, password, old_password, domain_id, modify_user_id } = request.body;
        const user_role = request.user.role;
        const user_id = user_role === "admin" && modify_user_id ? modify_user_id : request.user.id;

        const userRepository = new UserRepository();
        const usersService = new UsersService(userRepository);
        const user = await usersService.userUpdate({ name, email, password, old_password, user_id, domain_id, user_role });

        return response.json({ user, message: "Perfil atualizado com sucesso." });
    }
}

module.exports = UsersController;