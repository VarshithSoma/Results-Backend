const fs = require("fs");
const morgan = require("morgan");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.use("/api", userRoutes);
module.exports = app;
