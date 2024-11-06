const { Router } = require("express");

const routes = Router();

const usersRouter = require("./users.routes");
const domainsRouter = require("./domains.routes");

routes.use("/users", usersRouter);
routes.use("/domains", domainsRouter);

module.exports = routes;