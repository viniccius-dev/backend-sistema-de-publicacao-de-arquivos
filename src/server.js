require("express-async-errors");
require("dotenv/config");

const express = require("express");
const cors = require("cors");

const AppError = require("./utils/AppError");
const routes = require("./routes");
const uploadConfig = require("./configs/upload");
const knex = require("./database/knex");

async function getAllowedDomains() {
    try {
        const domains = await knex("domains").pluck('url');
        domains.push("https://sistema-de-arquivos-agencianew.netlify.app");
        domains.push("http://localhost:5173");
        return domains;
    } catch (error) {
        console.error("Error fetching domains:", error);
        return [];
    }
}

(async () => {
    const allowedDomains = await getAllowedDomains();

    const app = express();

    const corsOptions = {
        origin: function (origin, callback) {
            // Se a origem não for fornecida (por exemplo, para requisições feitas localmente) ou está incluída na lista de permitidos
            if (!origin || allowedDomains.includes(origin)) {
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

    // const PORT = process.env.PORT || 3333;
    const PORT = 10000;
    app.listen(PORT, () => console.log(`Server is running ${PORT}`));
})();