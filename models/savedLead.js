const mongoose = require("mongoose");

const savedLeadSchema = new mongoose.Schema(
    {
        // ── References ────────────────────────────────────────────────
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // ── Lead Status ───────────────────────────────────────────────
        status: {
            type: String,
            enum: [
                "New",
                "Contacted",
                "Qualified",
                "Proposal Sent",
                "Negotiation",
                "Closed Won",
                "Closed Lost",
                "Not Interested",
            ],
            default: "New",
            index: true,
        },

        // ── List Membership ───────────────────────────────────────────
        // Array of List document IDs this lead belongs to
        listIds: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "List" }],
            default: [],
        },

        // ── Notes ─────────────────────────────────────────────────────
        notes: { type: String, default: "" },
    },
    {
        timestamps: true,
    }
);

// Prevent the same business from being saved twice by the same user
savedLeadSchema.index({ business: 1, user: 1 }, { unique: true });

const Lead = mongoose.models.Lead || mongoose.model("Lead", savedLeadSchema);

module.exports = Lead;
