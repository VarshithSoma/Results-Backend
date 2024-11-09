const User = require("../Models/studentModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const express = require("express");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({ status: "success", token, data: { user } });
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_S, {
    expiresIn: process.env.JWT_E,
  });
};
exports.login = async (req, res, next) => {
  const { RollNumber, password } = req.body;
  console.log(req.body);
  if (!RollNumber || !password) {
    return next(new AppError("please provide email and password", 400));
  }
  const user = await User.findOne({ RollNumber: RollNumber }).select(
    "+password"
  );
  const correct = await bcrypt.compare(password, user.password);
  if (!user || !correct) {
    return next(new AppError("incorrect email or password", 401));
  }
  createSendToken(user, 200, res);
};
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log("cookie");
  }
  if (!token) {
    res.status(401).send({
      msg: "you are not logged in! please login",
    });
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_S);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new Error("The user belonging to this token no longer exist", 401)
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_S
      );
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        res.status(401).send({
          msg: "you are not logged in! please login",
        });
      }
      res.locals.user = currentUser;
    } catch (error) {
      res.status(401).send({
        msg: "you are not logged in! please login",
      });
    }
  }
  return next();
};
exports.logOut = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).send({
    status: "success",
  });
});
