const { Router } = require("express");

const publicationsRoutes = Router();

const PublicationsController = require("../controllers/PublicationsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const publicationsController = new PublicationsController();

publicationsRoutes.use(ensureAuthenticated);

publicationsRoutes.post("/", publicationsController.create);
publicationsRoutes.put("/:publication_id", publicationsController.update);

module.exports = publicationsRoutes;