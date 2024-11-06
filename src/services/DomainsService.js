const AppError = require("../utils/AppError");

class DomainsService {
    constructor(domainRepository) {
        this.domainRepository = domainRepository;
    };

    async domainCreate({ domain_name, url }) {
        if(!domain_name || !url) {
            throw new AppError("Favor inserir todas as informações");
        };

        const checkDomain = await this.domainRepository.findByUrl(url);

        if(checkDomain) {
            throw new AppError("Este domínio já está cadastrado.");
        };

        const domainCreate = await this.domainRepository.create({ domain_name, url });

        return domainCreate;
    };
};

module.exports = DomainsService;