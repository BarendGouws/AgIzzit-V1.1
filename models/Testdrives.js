const mongoose = require("mongoose");

const testDriveSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Types.ObjectId,
      ref: "inventory",
      required: true,
    },

    user: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },

    nameAndSurname: { type: String, required: true },
    idOrPassportNr: { type: String, required: true },
    timestamp: { type: Date, default: new Date() },
    startedTimestamp: { type: Date },
    isCompleted: { type: Boolean, default: false },
    completedTimestamp: { type: Date },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

testDriveSchema.set("collection", "testDrives");

testDriveSchema.index({ "$**": "text" });

const TestDrives =
  mongoose.models.testDrives || mongoose.model("testDrives", testDriveSchema);
export default TestDrives;
