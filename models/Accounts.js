const mongoose = require("mongoose");

const accountsSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },
    location: {
      type: mongoose.Types.ObjectId,
      ref: "locations",
    },
    //IF PAYOUT PENDING, THEN BANK DUE NOT CLIENT, USER ONLY IF DEPOSIT APPLIES
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

accountsSchema.set("collection", "accounts");

accountsSchema.index({ "$**": "text" });

const Accounts =  mongoose.models.accounts || mongoose.model("accounts", accountsSchema);

export default Accounts;
