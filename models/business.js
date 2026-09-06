const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    logo: { type: String }, // URL

    // ── Industry & Classification ──────────────────────────────────
    industry: {
      type: String,
      trim: true,
      index: true,
    },
    subIndustry: { type: String, trim: true },
    businessType: {
      type: String,
      enum: ["B2B", "B2C", "B2B2C", "D2C", "Marketplace", "Other"],
      default: "B2B",
    },
    companySize: {
      type: String,
      enum: [
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "501-1000",
        "1001-5000",
        "5000+",
      ],
    },
    foundedYear: { type: Number },
    annualRevenue: { type: String }, // range string e.g. "$1M–$10M"
    tags: [{ type: String, trim: true }],

    // ── Contact Details ────────────────────────────────────────────
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },

    // ── Location ───────────────────────────────────────────────────
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
      postalCode: { type: String, trim: true },
    },

    // ── Lead Pipeline ──────────────────────────────────────────────
    leadStatus: {
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

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },
    score: { type: Number, min: 0, max: 100, default: 0 }, // lead score

    // ── Ownership & Assignment ─────────────────────────────────────
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ── Follow-up & Activity ───────────────────────────────────────
    lastContactedAt: { type: Date },
    nextFollowUpAt: { type: Date, index: true },
    notes: [
      {
        content: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Deals / Opportunities ──────────────────────────────────────
    dealValue: { type: Number, default: 0 }, // expected deal value in INR/USD
    currency: { type: String, default: "INR" },
    closingDate: { type: Date },

    // ── Meta ───────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    customFields: { type: Map, of: String }, // arbitrary extra data
  },
  {
    timestamps: true, // adds createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: full address string ────────────────────────────────────────────
businessSchema.virtual("fullAddress").get(function () {
  const a = this.address;
  if (!a) return "";
  return [a.street, a.city, a.state, a.postalCode, a.country]
    .filter(Boolean)
    .join(", ");
});

// ── Pre-save: auto-generate slug from name ───────────────────────────────────
businessSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// ── Indexes for common queries ───────────────────────────────────────────────
businessSchema.index({ name: "text", description: "text", tags: "text" });
businessSchema.index({ leadStatus: 1, priority: 1 });
businessSchema.index({ "address.city": 1, "address.country": 1 });

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
