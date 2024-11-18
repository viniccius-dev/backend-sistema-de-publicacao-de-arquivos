const { Router } = require("express");

const typesOfPublicationRoutes = Router();

const TypesOfPublicationController = require("../controllers/TypesOfPublicationController");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const typesOfPublicationController = new TypesOfPublicationController();

typesOfPublicationRoutes.get("/", typesOfPublicationController.index);

typesOfPublicationRoutes.use(ensureAuthenticated);
typesOfPublicationRoutes.use(verifyUserAuthorization());

typesOfPublicationRoutes.post("/", typesOfPublicationController.create);
typesOfPublicationRoutes.put("/:type_id", typesOfPublicationController.update);
typesOfPublicationRoutes.delete("/:type_id", typesOfPublicationController.delete);

module.exports = typesOfPublicationRoutes;