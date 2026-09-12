const axios = require('axios');

const getCountriesFromAPI = async () => {
    try {
        const { data } = await axios.get("https://www.apicountries.com/countries");

        const formattedCountries = data.map(country => ({
            name: country.name,
            isoCode: country.alpha2Code
        }));

        return formattedCountries;
    } catch (error) {
        const apiErrorDetails = error.response?.data || error.message;
        logger.error("Failed to fetch countries", { details: apiErrorDetails });
        throw error;
    }
}

/**
 * Geocodes a location string using the Mapbox Geocoding API.
 * @param {string} location - The address or place name to geocode.
 * @returns {Promise<{ latitude: number, longitude: number } | null>} - Coordinates or null if not found.
 */
const getGeocodingFromMapbox = async (location) => {
    try {
        const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
        const encodedLocation = encodeURIComponent(location);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?access_token=${accessToken}&limit=1`;

        const { data } = await axios.get(url);

        if (!data.features || data.features.length === 0) {
            return null;
        }

        const [longitude, latitude] = data.features[0].geometry.coordinates;

        return { latitude, longitude };
    } catch (error) {
        const apiErrorDetails = error.response?.data || error.message;
        console.error("Failed to geocode location with Mapbox", { details: apiErrorDetails });
        throw error;
    }
};

const getGeocodeAddress = async function (address) {
    const baseUrl = "https://nominatim.openstreetmap.org/search";
    const params = new URLSearchParams({
        addressdetails: "1",
        q: address,
        format: "jsonv2",
        limit: "1",
    });

    const radiusMap = {
        state: 50,
        county: 30,
        city: 15,
        town: 8,
        borough: 8,
        village: 4,
        suburb: 4,
        neighbourhood: 1.5,
        road: 0.5
    };

    try {
        const { data } = await axios.get(`${baseUrl}?${params}`, {
            headers: {
                "User-Agent": "MyGeocoderApp/1.0 ",
            },
        });

        const { lat, lon, type } = data[0];

        const radius = radiusMap[type] || 1000;

        return { lat, lon, radius };
    } catch (error) {
        console.error("Error during geocoding:", error.message);
    }
};

module.exports = { getCountriesFromAPI, getGeocodingFromMapbox, getGeocodeAddress };
