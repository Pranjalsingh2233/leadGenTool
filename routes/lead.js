const express = require("express");
const router = express.Router();
const { searchLeadController, saveLeadsController, getAllCountryController, getAllStateController } = require("../controllers/lead");

router.get("/country", getAllCountryController);
router.get("/state", getAllStateController);
router.post("/search", searchLeadController);
router.post("/save", saveLeadsController);

module.exports = router;
