const mongoose = require("mongoose");

const leadsSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "listings",
    },
    timestamp: { type: Date, required: true, default: new Date() },
    source: String,
    name: String,
    phoneNr: Number,
    email: String,
    message: String,
    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employees",
    },
    leadNr: { type: Number, required: true },

    smsSend: { type: Boolean, required: true, default: false },
    smsSendTimestamp: { type: Date },
    smsNav: { type: Boolean, required: true, default: false },
    smsNavTimestamp: { type: Date },

    emailSend: { type: Boolean, required: true, default: false },
    emailSendTimestamp: { type: Date },
    emailNav: { type: Boolean, required: true, default: false },
    emailNavTimestamp: { type: Date },

    leadActioned: { type: Boolean, required: true, default: false },
    status: { type: String, required: true, default: "New" },

    comments: [
      {
        timestamp: { type: Date, required: true, default: new Date() },
        comment: { type: String, required: true },
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

leadsSchema.set("collection", "leads");

leadsSchema.index({ "$**": "text" });

const Leads = mongoose.models.Leads || mongoose.model("leads", leadsSchema);
export default Leads;
