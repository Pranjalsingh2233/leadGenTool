const User = require("../models/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(404).json({ success: false });
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.status(404).json({ success: false });
    } else {
      const user = await User.findById(data.id);
      if (user)
        return res.status(200).json({ success: true, user: user.username });
      else return res.status(404).json({ success: false });
    }
  });
};
