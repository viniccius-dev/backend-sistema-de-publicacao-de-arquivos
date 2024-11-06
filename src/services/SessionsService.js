const { compare } = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const authConfig = require("../configs/auth");
const AppError = require("../utils/AppError");

class SessionsService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ email, password }) {
        if( !email || !password ) {
            throw new AppError("Favor inserir todas as informações");
        };

        const user = await this.userRepository.findByEmail(email);

        if(!user) {
            throw new AppError("Email e/ou senha incorreto", 401);
        };

        const passwordMatched = await compare(password, user.password);

        if(!passwordMatched) {
            throw new AppError("Email e/ou senha incorreto", 401);
        };

        const { secret, expiresIn } = authConfig.jwt;
        const token  = sign({ role: user.role, domain_id: user.domain_id }, secret, {
            subject: String(user.id),
            expiresIn
        });

        delete user.password;

        return { user, token };
    }
}

module.exports = SessionsService;