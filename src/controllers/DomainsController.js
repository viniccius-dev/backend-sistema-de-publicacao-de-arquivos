const DomainRepository = require("../repositories/DomainRepository");
const DomainsService = require("../services/DomainsService");

class DomainsController {
    async create(request, response) {
        const { domain_name, url } = request.body;

        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);
        await domainsService.domainCreate({ domain_name, url });

        return response.status(201).json({ message: "Domínio cadastrado com sucesso." });
    };

    async update(request, response) {
        const { domain_name, url } = request.body;
        const { domain_id } = request.params;

        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);
        await domainsService.domainUpdate({ domain_name, url, domain_id });

        return response.json({ message: "Informações de domínio atualizadas com sucesso." });
    };

    async delete(request, response) {
        const { domain_id } = request.params;

        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);
        await domainsService.domainDelete(domain_id);

        return response.json({ message: "Domínio deletado com sucesso." });
    };

    async index(request, response) {
        const domainRepository = new DomainRepository();
        const domains = await domainRepository.getDomains();

        return response.json(domains);
    };

    async show(request, response) {
        const { domain_id } = request.params;

        const domainRepository = new DomainRepository();
        const domainsService = new DomainsService(domainRepository);
        const domain = await domainsService.showDomain(domain_id);

        return response.json(domain);
    }
}

module.exports = DomainsController;