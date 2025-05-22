import mongoose from "mongoose";

const alertsSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    allowEmailComms: { type: Boolean, default: true },
    allowSMSComms: { type: Boolean, default: true },
    allowWhatsappComms: { type: Boolean, default: true },
    contactFrequency: { type: String, default: "Daily" },
    categoryType: String, //automotive
    categoryMatch: String, //Vehicle
    make: String,
    model: String,
    maxYear: Number,
    minYear: Number,
    maxMileage: Number,
    minMileage: Number,
    transmission: String,
    bodyType: String,
    fuelType: String,
    maxPrice: Number,
    minPrice: Number,
  },
  {
    timestamps: true,
  }
);

alertsSchema.set("collection", "alerts");

alertsSchema.index({ "$**": "text" });

const Alerts = mongoose.models.alerts || mongoose.model("alerts", alertsSchema);

export default Alerts;
