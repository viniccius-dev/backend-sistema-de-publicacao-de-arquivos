const { Router } = require("express");

const domainsRoutes = Router();

const DomainsController = require("../controllers/DomainsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const domainsController = new DomainsController();

domainsRoutes.use(ensureAuthenticated);
domainsRoutes.use(verifyUserAuthorization());

domainsRoutes.post("/", domainsController.create);
domainsRoutes.put("/:domain_id", domainsController.update);

module.exports = domainsRoutes;