const express = require("express");
const Router = express.Router();
const userController = require("../Controllers/userController");
const authController = require("../Controllers/authController");

Router.use((req, res, next) => {
  next();
});
Router.route("/").post(userController.postData);
Router.route("/:id").get(userController.getResult);

module.exports = Router;
