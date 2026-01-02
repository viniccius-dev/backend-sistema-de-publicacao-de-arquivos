const { Router } = require("express");
const uploadConfig = require("../configs/upload");
const multer = require("multer");

const domainsRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const DomainsController = require("../controllers/DomainsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const domainsController = new DomainsController();

domainsRoutes.use(ensureAuthenticated);
domainsRoutes.use(verifyUserAuthorization());

domainsRoutes.get("/system-setting/:key", domainsController.getSystemSetting);
domainsRoutes.put("/system-settings", domainsController.updateSystemSettings);

domainsRoutes.post("/", domainsController.create);
domainsRoutes.put("/:domain_id", domainsController.update);
domainsRoutes.delete("/:domain_id", domainsController.delete);

domainsRoutes.get("/backup-logs", domainsController.indexLogsBackup);

domainsRoutes.get("/", domainsController.index);

domainsRoutes.get("/export", domainsController.exportDatabaseAndAttachments);
domainsRoutes.get("/export-progress", domainsController.getExportProgress);
domainsRoutes.get("/import-progress", domainsController.getImportProgress);
domainsRoutes.post("/import/start", upload.single("file"), domainsController.startImport)
domainsRoutes.post("/import/confirm", domainsController.confirmImport);
domainsRoutes.get("/:domain_id", domainsController.show);


module.exports = domainsRoutes;