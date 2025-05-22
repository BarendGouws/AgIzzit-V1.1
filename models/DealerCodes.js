import mongoose from "mongoose";

const dealerCodesSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },
    location: {
      type: mongoose.Types.ObjectId,
      ref: "locations",
    },
    type: String, //for planet42 or perosnal loans
    name: String,
    invoiceName: String,
    addressLine1: String,
    addressLine2: String,
    addressLine3: String,
    addressLine4: String,
    vatNr: Number,
    dealerCode: String,
  },
  {
    timestamps: true,
  }
);

dealerCodesSchema.set("collection", "dealerCodes");

dealerCodesSchema.index({ "$**": "text" });

const DealerCodes =
  mongoose.models.DealerCodes ||
  mongoose.model("dealerCodes", dealerCodesSchema);

export default DealerCodes;
