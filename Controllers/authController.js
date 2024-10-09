const User = require("../Models/studentModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const express = require("express");
const { catchAsync } = require("../utils/catchAsync");
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
exports.signup = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    const url = `${req.protocol}://${req.get("host")}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 200, res);
  } catch (err) {
    console.log(err);
    res.status(404).send({
      status: "failed",
      msg: err,
    });
  }
};
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }
  const user = await User.findOne({ email: email }).select("+password");
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
  }
  console.log(token);
  if (!token) {
    return next(new AppError("you are not logged in! please login", 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_S);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new Error("The user belonging to this token no longer exist", 401)
    );
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("user recently changed the password", 401));
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
        return next();
      }
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
    } catch (error) {
      return next();
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
