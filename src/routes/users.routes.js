const { Router } = require("express");

const usersRoutes = Router();

const UsersController = require("../controllers/UsersController");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");
const UsersController = require("../controllers/UsersController");

const UsersController = new UsersController();