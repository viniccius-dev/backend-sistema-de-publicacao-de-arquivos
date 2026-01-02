const knex = require("../database/knex");

class DomainRepository {
    async findByUrl(url) {
        const domain = await knex("domains").where({ url }).first();

        return domain;
    };

    async findById(id) {
        const domain = await knex("domains").where({ id }).first();

        return domain;
    };

    async findByName(domain_name) {
        const domain = await knex("domains").where({ domain_name }).first();

        return domain;
    };

    async create({ domain_name, url }) {
        const [domainId] = await knex("domains").insert({
            domain_name,
            url
        });

        return { id: domainId };
    };

    async update(domain) {
        const domainUpdate = await knex("domains").update(domain).where({ id: domain.id });

        return domainUpdate;
    };

    async delete(id) {
        return await knex("domains").where({ id }).delete();
    };

    async getDomains() {
        const domains = await knex("domains").orderBy("domain_name");

        return domains;
    };

    async getAttachmentsByDomain(domain_id) {
        return await knex("attachments").where({ domain_id }).select("attachment");
    };

    async findSettingByKey(key) {
        const setting = await knex("system_settings").where(key).first();

        return setting;
    }

    async updateSystemSetting(setting) {
        const updatedSetting = await knex("system_settings").update(setting).where({ key: setting.key });

        return updatedSetting;
    };
}

module.exports = DomainRepository;