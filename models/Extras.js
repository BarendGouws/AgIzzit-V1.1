// models/extras.js
import mongoose from "mongoose";

const extrasSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "staff",
    },
    description: String,
    amount: Number,
    required: {
      type: Boolean,
      default: false,
    },
    isVattable: {
      type: Boolean,
      default: true,
    },
    salesManEditable: {
      type: Boolean,
      default: false,
    },
    url: String,
    saleType: String,
    conditions: [{
      constraints: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      }
    }],
  },
  {
    timestamps: true,
  }
);

extrasSchema.set("collection", "extras");

extrasSchema.index({ "$**": "text" });

extrasSchema.methods.isValidForListing = function(listingDoc) {
  if (!this.conditions || this.conditions.length === 0) return true;

  return this.conditions.some(condition => {
    if (!condition.constraints || Object.keys(condition.constraints).length === 0) return true;

    return Object.entries(condition.constraints).every(([field, ruleValue]) => {
      const listingValue = listingDoc[field];
      if (listingValue === undefined) return false;

      return Object.entries(ruleValue).every(([operator, value]) => {
        switch (operator) {
          case '$gt': return listingValue > value;
          case '$gte': return listingValue >= value;
          case '$lt': return listingValue < value;
          case '$lte': return listingValue <= value;
          case '$eq': return listingValue === value;
          case '$ne': return listingValue !== value;
          default: return false;
        }
      });
    });
  });
};

const Extras = mongoose.models.extras || mongoose.model("extras", extrasSchema);

export default Extras;