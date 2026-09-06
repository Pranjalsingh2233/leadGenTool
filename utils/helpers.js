// ── helpers ──────────────────────────────────────────────────────────────────

module.exports.formatTimetable = (timetable = {}) => {
    const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];
    const result = {};
    for (const day of days) {
        const slots = timetable[day];
        if (!slots || slots.length === 0) {
            result[day] = "Closed";
        } else {
            result[day] = slots
                .map(({ open, close }) => {
                    const fmt = ({ hour, minute }) =>
                        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
                    return `${fmt(open)} – ${fmt(close)}`;
                })
                .join(", ");
        }
    }
    return result;
}


module.exports.parseContactInfo = (contactInfo = []) => {
    const phones = [];
    const emails = [];
    for (const entry of contactInfo) {
        if (entry.type === "telephone") phones.push(entry.value);
        if (entry.type === "mail") emails.push(entry.value);
    }
    return { phones: [...new Set(phones)], emails: [...new Set(emails)] };
}

module.exports.formatBusiness = (item) => {
    const { phones, emails } = parseContactInfo(item.contact_info);

    return {
        // ── Identity ──────────────────────────────────────────────────
        name: item.title || null,
        description: item.description || null,
        category: item.category || null,
        additionalCategories: item.additional_categories || [],

        // ── Contact ───────────────────────────────────────────────────
        phone: item.phone || (phones.length ? phones[0] : null),
        allPhones: phones,
        emails,
        website: item.url || null,
        domain: item.domain || null,
        googleMapsUrl: item.check_url || null,

        // ── Location ──────────────────────────────────────────────────
        address: item.address || null,
        addressDetails: item.address_info
            ? {
                street: item.address_info.address || null,
                borough: item.address_info.borough || null,
                city: item.address_info.city || null,
                zip: item.address_info.zip || null,
                region: item.address_info.region || null,
                countryCode: item.address_info.country_code || null,
            }
            : null,
        coordinates: {
            lat: item.latitude ?? null,
            lng: item.longitude ?? null,
        },

        // ── Rating & Reviews ──────────────────────────────────────────
        rating: {
            value: item.rating?.value ?? null,
            totalReviews: item.rating?.votes_count ?? null,
            distribution: item.rating_distribution || null,
        },
        priceLevel: item.price_level || null,

        // ── Media ─────────────────────────────────────────────────────
        logo: item.logo || null,
        mainImage: item.main_image || null,
        totalPhotos: item.total_photos ?? null,

        // ── Status ────────────────────────────────────────────────────
        isClaimed: item.is_claimed ?? null,
        currentStatus: item.work_time?.work_hours?.current_status || null,

        // ── Hours ─────────────────────────────────────────────────────
        workingHours: item.work_time?.work_hours?.timetable
            ? formatTimetable(item.work_time.work_hours.timetable)
            : null,

        // ── Attributes ────────────────────────────────────────────────
        attributes: item.attributes?.available_attributes || null,

        // ── Trending topics from reviews ─────────────────────────────
        placeTopics: item.place_topics || null,

        // ── Similar businesses ────────────────────────────────────────
        similarBusinesses: (item.people_also_search || []).map((s) => ({
            name: s.title,
            rating: s.rating?.value ?? null,
            reviews: s.rating?.votes_count ?? null,
        })),

        // ── Meta ─────────────────────────────────────────────────────
        placeId: item.place_id || null,
        cid: item.cid || null,
        lastUpdated: item.last_updated_time || null,
        firstSeen: item.first_seen || null,
    };
}