const userRoute = require("./user");
const leadRoute = require("./lead");
const router = require("express").Router();

router.use("/user", userRoute);
router.use("/lead", leadRoute);

module.exports = router;
