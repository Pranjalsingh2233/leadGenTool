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

module.exports = { getCountriesFromAPI };