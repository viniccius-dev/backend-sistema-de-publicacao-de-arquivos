const fs = require("fs");
const path = require("path");

const TEMP_DIR = path.resolve(__dirname, "..", "..", "tmp", "imports");

function ensureTempDir() {
    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
}

function getTempPath(importId) {
    ensureTempDir();
    return path.join(TEMP_DIR, `${importId}.zip`);
}

function cleanupOldTempFiles() {
    ensureTempDir();

    const ONE_HOUR = 60 * 60 * 1000;
    const now = Date.now();

    fs.readdirSync(TEMP_DIR).forEach(item => {
        const fullPath = path.join(TEMP_DIR, item);

        try {
            const stats = fs.statSync(fullPath);
            const ageMs = now - stats.mtimeMs;

            if (ageMs > ONE_HOUR) {
                fs.rmSync(fullPath, { recursive: true, force: true });
            }
        } catch (err) {
            console.error(`Erro ao remover ${fullPath}:`, err.message);
        }
    });
}

module.exports = {
    ensureTempDir,
    getTempPath,
    cleanupOldTempFiles
};
