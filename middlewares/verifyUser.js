const User = require("../models/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }
};
