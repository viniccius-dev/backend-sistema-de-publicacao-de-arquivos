const { Router } = require("express");

const routes = Router();

const usersRouter = require("./users.routes");
const domainsRouter = require("./domains.routes");
const sessionsRouter = require("./sessions.routes");
const typesRouter = require("./types.routes");
const publicationsRouter = require("./publications.routes");

routes.use("/users", usersRouter);
routes.use("/domains", domainsRouter);
routes.use("/sessions", sessionsRouter);
routes.use("/types-of-publication", typesRouter);
routes.use("/publications", publicationsRouter);

module.exports = routes;