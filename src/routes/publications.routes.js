const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const publicationsRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const PublicationsController = require("../controllers/PublicationsController");
const AttachmentsController = require("../controllers/AttachmentsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const publicationsController = new PublicationsController();
const attachmentsController = new AttachmentsController();

publicationsRoutes.get("/", publicationsController.index);

publicationsRoutes.use(ensureAuthenticated);

publicationsRoutes.get("/attachments/:publication_id", attachmentsController.index);
publicationsRoutes.post("/attachments/:publication_id", upload.array("attachment"), attachmentsController.create);
publicationsRoutes.delete("/attachments", attachmentsController.delete);

publicationsRoutes.get("/filters", publicationsController.filters);

publicationsRoutes.post("/", publicationsController.create);
publicationsRoutes.put("/:publication_id", publicationsController.update);
publicationsRoutes.delete("/:publication_id", publicationsController.delete);
publicationsRoutes.get("/:publication_id", publicationsController.show);

module.exports = publicationsRoutes;