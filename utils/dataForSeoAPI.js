require("dotenv").config();
const axios = require("axios");

const LOGIN = process.env.DATAFORSEO_LOGIN;
const PASSWORD = process.env.DATAFORSEO_PASSWORD;



module.exports.getBusinessData = async (payload) => {
  if (!LOGIN || !PASSWORD) {
    logger.error("DataForSEO credentials not configured.");
    throw new Error("Server configuration error: Missing API credentials.");
  }
  try {
    const authHeader = `Basic ${Buffer.from(`${LOGIN}:${PASSWORD}`).toString("base64")}`;

    const apiRes = await axios.post(
      "https://api.dataforseo.com/v3/business_data/business_listings/search/live",
      payload,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );
    return apiRes.data;
  } catch (error) {
    const apiErrorDetails = error.response?.data || error.message;
    logger.error("DataForSEO API request failed", { details: apiErrorDetails });
    throw error;
  }
};
