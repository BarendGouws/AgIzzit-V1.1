const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },
    location: {
      type: mongoose.Types.ObjectId,
      ref: "locations",
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    account: {
      type: mongoose.Types.ObjectId,
      ref: "accounts",
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "listings",
    },

    extras: [{ type: mongoose.Schema.Types.ObjectId, ref: "extras" }],

    discount: Number,
    discountAuthBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    discountAuthTimestamp: Date,

    total: Number,
    totalExvat: Number,
    totalVat: Number,

    deposit: Number,

    isFinanced: Boolean,
    financedBy: String,
    financeDic: Number,

    rmcpQ1: String,
    rmcpQ1Score: Number,
    rmcpQ2: String,
    rmcpQ2Score: Number,
    rmcpQ3: String,
    rmcpQ3Score: Number,
    rmcpQ4: String,
    rmcpQ4Score: Number,
    rmcpQ5: String,
    rmcpQ5Score: Number,
    rmcpQ6: String,
    rmcpQ6Score: Number,
    rmcpQ7: String,
    rmcpQ7Score: Number,
    rmcpQ8: String,
    rmcpQ8Score: Number,
    rmcpOverallScore: Number,
    rmcpDocumentUrl: String,

    courierNatis: {
      type: Boolean,
      default: false,
    },
    courierAddress: {
      addressLine1: String,
      addressLine2: String,
      suburb: String,
      city: String,
      zip: Number,
      province: String,
    },
  },
  {
    timestamps: true,
  }
);

purchaseSchema.set("collection", "purchases");

purchaseSchema.index({ "$**": "text" });

const Purchases =
  mongoose.models.purchases || mongoose.model("purchases", purchaseSchema);
export default Purchases;
