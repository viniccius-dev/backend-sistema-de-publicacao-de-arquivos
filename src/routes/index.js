const { Router } = require("express");

const routes = Router();

const usersRouter = require("./users.routes");
const domainsRouter = require("./domains.routes");
const sessionsRouter = require("./sessions.routes");
const typesRouter = require("./types.routes");

routes.use("/users", usersRouter);
routes.use("/domains", domainsRouter);
routes.use("/sessions", sessionsRouter);
routes.use("/types-of-publication", typesRouter);

module.exports = routes;