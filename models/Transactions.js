const mongoose = require("mongoose");

const transactionsSchema = new mongoose.Schema(
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
    proofOfPaymentUrl: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: new Date(),
    },
    transactionNr: {
      type: String,
    },
    //BANK DETAILS FOR FIC STR REPORT, PERSON THAT PAID
    fromBank: String,
    fromAccountNr: Number,
    reference: String,
    amount: Number,
    transNo: String, //PROOF OF PAYMENT TRANSACTION CODE FOR FIC
    firstName: String,
    middleName: String,
    gender: String,
    dob: Date,
    idOrPassportNr: String,
    nasionality: String,
    phoneNr: String,
    address: String,
    city: String,
    residence: String,
    currency: String,
    fic: {
      type: mongoose.Types.ObjectId,
      ref: "fic",
    },

    isAllocated: {
      type: Boolean,
      default: false,
    },
    account: {
      type: mongoose.Types.ObjectId,
      ref: "accounts",
    },
    isCash: {
      type: Boolean,
      default: false,
    },
    allocatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    allocatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

transactionsSchema.set("collection", "transactions");

transactionsSchema.index({ "$**": "text" });

const Transactions =
  mongoose.models.transactions ||
  mongoose.model("transactions", transactionsSchema);

export default Transactions;
