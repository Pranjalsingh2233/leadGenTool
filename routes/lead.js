const express = require("express");
const router = express.Router();
const { searchLeadController, saveLeadsController, getAllCountryController, getAllStateController } = require("../controllers/lead");


// ── POST /api/leads/search ────────────────────────────────────────────────────
/**
 * Body params (mirrors DataForSEO business_listings/search/live):
 * {
 *   keyword      : string   – search keyword / title (required)
 *   categories   : string[] – DataForSEO category IDs
 *   location     : string   – "lat,lng,radius_km"  e.g. "53.47,-2.24,10"
 *   limit        : number   – max results (default 10),
 *   minRating    : number   – minimum rating filter (default 0)
 *   isClaimed    : boolean
 *   orderBy      : string   – e.g. "rating.value,desc"
 * }
 */
router.get("/country", getAllCountryController);
router.get("/state", getAllStateController);
router.post("/search", searchLeadController);
router.post("/save", saveLeadsController);

module.exports = router;
