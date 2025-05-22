import mongoose from "mongoose";

const ficSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },
    location: {
      type: mongoose.Types.ObjectId,
      ref: "locations",
    },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "purchases",
    },
    account: {
      type: mongoose.Types.ObjectId,
      ref: "accounts",
    },
    reportReason: {
      type: String,
    },
    reportId: {
      type: String,
    },
    reportType: {
      type: String,
    },
    reportGenerated: {
      type: Boolean,
    },
    reportGeneratedAt: {
      type: Date,
    },
    reportGeneratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    xmlUrl: {
      type: String,
    },
    reportUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ficSchema.set("collection", "fic");

ficSchema.index({ "$**": "text" });

const Fic = mongoose.models.fic || mongoose.model("fic", ficSchema);

export default Fic;
