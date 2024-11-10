const express = require("express");
const Router = express.Router();
const userController = require("../Controllers/userController");
const authController = require("../Controllers/authController");
Router.route("/signin").post(authController.login);
// Router.use(authController.protect);
Router.route("/myResult").get(authController.protect, userController.getResult);
Router.route("/logOut").get(authController.logOut);

module.exports = Router;
