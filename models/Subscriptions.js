const mongoose = require("mongoose");

//INCLUDE ALL SERVICES THAT CAN BE CHARCED, LIKE AFFORDIBLITY, LIVE, TRANSUNION AND MONTHLY SUSCRIPTION AND ADVERTISING

const subscriptionsSchema = mongoose.Schema(
  {
    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },
    location: {
      type: mongoose.Types.ObjectId,
      ref: "locations",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    dealerCode: {
      type: mongoose.Types.ObjectId,
      ref: "dealerCodes",
    },
    //DEBIT AND CREDIT ON ACCOUNT
    transaction: {
      type: mongoose.Types.ObjectId,
      ref: "transactions",
    },
    purchase: {
      type: mongoose.Types.ObjectId,
      ref: "purchases",
    },
  },
  {
    timestamps: true,
  }
);

subscriptionsSchema.set("collection", "subscriptions");
subscriptionsSchema.index({ "$**": "text" });

const Subscriptions =
  mongoose.models.subscriptions ||
  mongoose.model("subscriptions", subscriptionsSchema);

export default Subscriptions;
