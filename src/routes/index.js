const { Router } = require("express");

const routes = Router();

const usersRouter = require("./users.routes");
const domainsRouter = require("./domains.routes");
const sessionsRouter = require("./sessions.routes");

routes.use("/users", usersRouter);
routes.use("/domains", domainsRouter);
routes.use("/sessions", sessionsRouter);

module.exports = routes;