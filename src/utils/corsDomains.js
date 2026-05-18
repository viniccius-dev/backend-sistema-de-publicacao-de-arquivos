const knex = require("../database/knex");

// Lista de domínios permitidos mantida em memória.
// Inicializa contendo apenas o localhost de desenvolvimento, para evitar
// bloqueio total caso a primeira leitura do banco falhe (falha aberta).
let allowedDomains = new Set(["http://localhost:5173"]);

/**
 * Recarrega a lista de domínios permitidos a partir do banco de dados.
 *
 * Comportamento de falha (aberto):
 * - Se a query falhar, mantém a lista anterior intacta e loga o erro.
 * - O Set novo é construído inteiro antes de substituir o ponteiro,
 *   garantindo que o callback do CORS nunca veja uma lista parcial.
 *
 * @returns {Promise<boolean>} true se a recarga teve sucesso, false caso contrário.
 */
async function refreshAllowedDomains() {
    try {
        const domains = await knex("domains").pluck("url");
        const newSet = new Set(domains);
        newSet.add("http://localhost:5173"); // sempre presente para dev local
        allowedDomains = newSet;
        return true;
    } catch (error) {
        console.error(
            "[CORS] Falha ao recarregar domínios permitidos. " +
            "Mantendo lista anterior em memória.",
            error
        );
        return false;
    }
}

/**
 * Verifica se uma origem está na lista de domínios permitidos.
 * Operação O(1) — segura para ser chamada em todo request.
 *
 * @param {string} origin
 * @returns {boolean}
 */
function isAllowedDomain(origin) {
    return allowedDomains.has(origin);
}

module.exports = {
    refreshAllowedDomains,
    isAllowedDomain
};