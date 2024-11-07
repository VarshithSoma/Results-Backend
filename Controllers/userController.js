const Student = require("../Models/studentModel");
exports.getResult = async (req, res, next) => {
  try {
    console.log(req.user);
    if (!req.user) {
      res.status(401).send({
        msg: "you are not logged in! please login",
      });
    }
    res.status(200).json({
      status: "success",
      data: req.user,
    });
  } catch (err) {}
};
