const { cleanupOldTempFiles } = require("../utils/tmpManager");

setInterval(() => {
    cleanupOldTempFiles();
}, 30 * 60 * 1000); // A cada 30 minutos

console.log("[Cleanup] Job de remoção de arquivos antigos iniciado");