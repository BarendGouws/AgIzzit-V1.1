const mongoose = require("mongoose");

const mmCodeSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },

    makes: [
      {
        make: {
          type: String,
          required: true,
        },
        models: [
          {
            model: {
              type: String,
              required: true,
            },
            varients: [
              {
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
                },
                transmission: {
                  type: String,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

mmCodeSchema.set("collection", "mmCodes");

mmCodeSchema.index({ "$**": "text" });

const MMCodes = mongoose.models.MMCodes || mongoose.model("MMCodes", mmCodeSchema);
export default MMCodes;
