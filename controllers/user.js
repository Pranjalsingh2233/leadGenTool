const User = require("../models/user");
const { createSecretToken } = require("../utils/secretToken");
const bcrypt = require("bcrypt");

module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const user = await User.create({ email, password, username, createdAt });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // required for cross-site cookies over HTTPS
      sameSite: "none", //this one too
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: "User signed in successfully",
      success: true,
      user: user.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found incorrect email" });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: "Incorrect password" });
    }
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // required for cross-site cookies over HTTPS
      sameSite: "none", //this one too
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: "User logged in successfully",
      success: true,
      user: user.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

module.exports.Logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    path: "/",
  });
  res.status(201).json({ message: "Logged out successfully", success: true });
};
