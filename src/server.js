require("express-async-errors");
require("dotenv/config");
require("./jobs/cleanupTemp");
require("./jobs/backupRunner");

const express = require("express");
const cors = require("cors");

const AppError = require("./utils/AppError");
const routes = require("./routes");
const uploadConfig = require("./configs/upload");
const { refreshAllowedDomains, isAllowedDomain } = require("./utils/corsDomains");

(async () => {
    // Popula a lista de domínios permitidos em memória.
    // Se falhar, o app sobe mesmo assim com a lista mínima (localhost),
    // e o erro fica logado para diagnóstico.
    await refreshAllowedDomains();

    const app = express();

    const corsOptions = {
        origin: function (origin, callback) {
            // Se a origem não for fornecida (por exemplo, para requisições feitas localmente)
            // ou está incluída na lista de permitidos
            if (!origin || isAllowedDomain(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    };

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(routes);

    app.use("/files", express.static(uploadConfig.UPLOADS_FOLDER));

    app.use((error, request, response, next) => {
        if(error instanceof AppError) {
            return response.status(error.statusCode).json({
                status: "Erro",
                message: error.message
            });
        }

        console.error(error);

        return response.status(500).json({
            status: "Erro",
            message: "Erro interno do servidor"
        });
    });

    const PORT = process.env.PORT || 3334;
    app.listen(PORT, () => console.log(`Server is running ${PORT}`));
})();