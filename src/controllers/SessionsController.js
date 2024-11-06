const UserRepository = require("../repositories/UserRepository");
const SessionsService = require("../services/SessionsService");

class SessionsController {
    async create(request, response) {
        const { email, password } = request.body;

        const userRepository = new UserRepository();
        const sessionsService = new SessionsService(userRepository);
        const user = await sessionsService.execute({ email, password });

        return response.json(user);
    }
};

module.exports = SessionsController;