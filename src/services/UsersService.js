const { hash } = require("bcryptjs");

const AppError = require("../utils/AppError");

const DomainRepository = require("../repositories/DomainRepository");

class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    };

    async userCreate({ name, email, password, domain_id }) {
        if( !name || !email || !password || !domain_id ) {
            throw new AppError("Favor inserir todas as informações");
        };

        const checkUserExist = await this.userRepository.findByEmail(email);

        if(checkUserExist) {
            throw new AppError("Este e-mail já está em uso.");
        };

        const hashedPassword = await hash(password, 10);

        const domainRepository = new DomainRepository();
        const domain = await domainRepository.findById(domain_id);

        if(!domain) {
            throw new AppError("Domínio não encontrado.", 404);
        };

        const userCreated = await this.userRepository.create({ name, email, password: hashedPassword, domain_id });

        return userCreated;
    };
}

module.exports = UsersService;