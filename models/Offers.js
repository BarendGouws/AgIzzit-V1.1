import mongoose from "mongoose";

const sellVehicleSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    source: {
      type: String,
      required: true,
      default: "Not Specified",
    },
    category: {
      type: String,
      required: true,
      default: "Vehicle",
    },
    year: {
      type: Number,
      required: true,
    },
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    varient: {
      type: String,
      required: true,
    },
    mmCode: {
      type: String,
      required: true,
    },
    fuelType: {
      type: String,
      required: true,
    },
    transmission: {
      type: String,
      required: true,
    },
    mileage: {
      type: Number,
      required: true,
    },
    condition: {
      type: String,
    },
    expectedPrice: {
      type: Number,
    },
    anythingElseWeNeedToKnow: {
      type: String,
    },
    isUnderFinance: {
      type: Boolean,
      required: true,
      default: false,
    },
    settleAmount: {
      type: Number,
    },
    settleFinanceHouse: {
      type: String,
    },
    firstName: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNr: {
      type: Number,
      required: true,
    },
    suburb: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pictures: [
      {
        type: String,
        required: true,
      },
    ],
    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    buyingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    //INTERNAL

    sellerRating: {
      type: String,
      default: "No Rating",
    },

    insights: [
      {
        name: String,
        value: String,
      },
    ],

    previousOffers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sellVehicles",
      },
    ],

    leadStatus: {
      type: String,
      default: "Unread",
    },
    isActioned: {
      type: Boolean,
      default: false,
    },
    actionedDate: {
      type: Date,
    },

    //QUESTIONS

    isLicenseDiscValid: {
      type: Boolean,
    },
    licenseDiscExpiryDate: {
      type: Date,
    },
    serviceHistory: {
      type: String,
    },
    isNatisInSellerName: {
      type: Boolean,
    },
    dateNatisIsRegistered: {
      type: Date,
    },
    proofOfPurchase: {
      type: Boolean,
      default: false,
    },
    proofOfPurchaseUrls: [
      {
        type: String,
      },
    ],
    proofOfPayment: {
      type: Boolean,
      default: false,
    },
    proofOfPaymentUrls: [
      {
        type: String,
      },
    ],

    noOfferReason: {
      type: String,
    },

    offerAmount: {
      type: Number,
    },

    offerAccepted: {
      type: Boolean,
    },
    offerAcceptedDate: {
      type: Date,
    },
    hasBeenViewed: {
      type: Boolean,
    },
    finalOffer: {
      type: Number,
    },
    isPurchased: {
      type: Boolean,
    },
    purchasedDate: {
      type: Date,
    },
    reasonForNotPurchasing: {
      type: String,
    },
    purchased: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "inventory",
    },

    comments: [
      {
        timestamp: { type: Date, required: true, default: new Date() },
        comment: { type: String, required: true },
        view: { type: Boolean, required: true, default: true },
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "users",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

sellVehicleSchema.set("collection", "sellVehicles");

sellVehicleSchema.index({ "$**": "text" });

const SellVehicle =
  mongoose.models.sellVehicles ||
  mongoose.model("sellVehicles", sellVehicleSchema);

export default SellVehicle;
