const Business = require("../models/business");
const Lead = require("../models/savedLead");
const { getCountriesFromAPI, getGeocodeAddress } = require("../utils/countryAPI");
const { getBusinessData, getLocationData } = require("../utils/dataForSeoAPI");
const { formatBusiness } = require("../utils/helpers");
const logger = require("../utils/logger");

module.exports.searchLeadController = async (req, res) => {
    try {
        const {
            keyword,
            categories = [],
            location = "",
            limit = 10,
            minRating = 0,
            isClaimed,
            orderBy = "rating.value,desc",
        } = req.body;

        if (!keyword || !location) {
            return res.status(400).json({
                success: false,
                message: "keyword is required",
            });
        }

        const { lat, lon, radius } = await getGeocodeAddress(location);

        // Build DataForSEO request payload
        const payload = [
            {
                title: keyword,
                description: keyword,
                location_coordinate: `${lat},${lon},${radius}`,
                ...(categories.length && { categories }),
                is_claimed: isClaimed ?? true,
                ...(minRating > 0 && { filters: [["rating.value", ">", minRating]] }),
                order_by: [orderBy],
                limit,
            },
        ];

        const apiRes = await getBusinessData(payload);

        const task = apiRes?.tasks?.[0];

        // Surface API-level errors
        if (!task || task.status_code !== 20000) {
            return res.status(502).json({
                success: false,
                message: task?.status_message || "Failed getting lead",
                statusCode: task?.status_code,
            });
        }

        const result = task.result?.[0];
        const rawItems = result?.items || [];

        // Format each business
        const businesses = rawItems.map(formatBusiness);

        return res.status(200).json({
            success: true,
            meta: {
                totalCount: result?.total_count ?? 0,
                returnedCount: businesses.length,
                offset: result?.offset ?? 0,
                nextPageToken: result?.offset_token ?? null,
                cost: apiRes?.cost ?? null,
                timeTaken: apiRes?.time ?? null,
            },
            businesses,
        });
    } catch (error) {
        logger.error("[lead/search] Error:", error.message);

        // Axios HTTP error
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: "DataForSEO API error",
                details: error.response.data,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// ── POST /api/leads/save ──────────────────────────────────────────────────────
/**
 * Body:
 * {
 *   businesses: [
 *     { name, description, category, phone, emails, website, address,
 *       addressDetails, coordinates, rating, logo, mainImage,
 *       isClaimed, currentStatus, placeId, cid, ... }
 *   ]
 * }
 * Requires req.user._id to be set (auth middleware).
 */


module.exports.saveLeadsController = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { businesses } = req.body;
        if (!Array.isArray(businesses) || businesses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Data is required",
            });
        }

        const results = [];

        for (const b of businesses) {
            // ── 1. Upsert business by cid (Google's unique ID) or placeId ──
            const filter = b.cid
                ? { "customFields.cid": b.cid }
                : { "customFields.placeId": b.placeId };

            const businessDoc = await Business.findOneAndUpdate(
                filter,
                {
                    $setOnInsert: {
                        name: b.name || "Unknown",
                        description: b.description || "",
                        industry: b.category || "",
                        email: b.emails?.[0] || "",
                        phone: b.phone || "",
                        website: b.website || "",
                        logo: b.logo || "",
                        address: {
                            street: b.addressDetails?.street || "",
                            city: b.addressDetails?.city || "",
                            state: b.addressDetails?.region || "",
                            country: b.addressDetails?.countryCode || "",
                            postalCode: b.addressDetails?.zip || "",
                        },
                        customFields: new Map([
                            ["cid", b.cid || ""],
                            ["placeId", b.placeId || ""],
                            ["googleMapsUrl", b.googleMapsUrl || ""],
                            ["mainImage", b.mainImage || ""],
                            ["ratingValue", String(b.rating?.value ?? "")],
                            ["totalReviews", String(b.rating?.totalReviews ?? "")],
                            ["currentStatus", b.currentStatus || ""],
                        ]),
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            // ── 2. Upsert Lead (one record per user + business) ──
            const savedLead = await Lead.findOneAndUpdate(
                { business: businessDoc._id, user: userId },
                { $setOnInsert: { business: businessDoc._id, user: userId } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            results.push({
                businessId: businessDoc._id,
                savedLeadId: savedLead._id,
                name: businessDoc.name,
                status: savedLead.status,
                listIds: savedLead.listIds,
                alreadyExisted: !savedLead.isNew,
            });
        }

        return res.status(201).json({
            success: true,
            savedCount: results.length,
            leads: results,
        });
    } catch (error) {
        logger.error("[lead/save] Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports.getAllCountryController = async (req, res) => {
    try {
        const allCountry = await getCountriesFromAPI();

        res.status(200).json({ success: true, data: allCountry })
    } catch (error) {
        logger.error(`[lead/country] Error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

module.exports.getAllStateController = async (req, res) => {
    try {
        const { countryCode } = req.query;
        if (!countryCode) {
            return res.status(400).json({
                success: false,
                message: "Please select country code",
            });
        }
        const response = await getLocationData(countryCode);

        if (response.status_code !== 20000) {
            return res.status(400).json({
                success: false,
                message: data.status_message || "Something went wrong",
            });
        }

        const allLocations = response.result;

        res.status(200).json({ success: true, data: allLocations || [] })
    } catch (error) {
        logger.error("[lead/state] Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}