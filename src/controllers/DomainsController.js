const DomainRepository = require("../repositories/DomainRepository");
const DomainsService = require("../services/DomainsService");

class DomainsController {
    async create(request, response) {
        const { domain_name, url } = request.body;

        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);
        await domainsService.domainCreate({ domain_name, url });

        return response.status(201).json({ message: "Domínio cadastrado com sucesso." });
    }
}

module.exports = DomainsController;