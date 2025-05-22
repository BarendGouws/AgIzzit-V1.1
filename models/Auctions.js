import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const auctionItemSchema = new Schema({
  
    listing: {
      type: Schema.Types.ObjectId,
      ref: "listingBase", 
      required: true,
    },    
    openingBid: { type: Number, required: true },
    currentBid: { type: Number, default: 0 },
    //CURRENT BIDDER
    currentPublicBidder: {
      type: Schema.Types.ObjectId,
      ref: "users",
      default: undefined,
    },
    currentDealerBidder: {
      type: Schema.Types.ObjectId,
      ref: "staff",
      default: undefined,
    },
    //PURCHASED BY
    purchasedByUser: {
      type: Schema.Types.ObjectId,
      ref: "users",
      default: undefined,
    },
    purchasedByDealer: {
      type: Schema.Types.ObjectId,
      ref: "staff",
      default: undefined,
    },
    bids: [
      {
        user: { type: Schema.Types.ObjectId, ref: "users", default: undefined },
        dealer: { type: Schema.Types.ObjectId, ref: "staff", default: undefined },
        amount: { type: Number, required: true },
        time: { type: Date, default: Date.now },
      },
    ],
    addedAt: { type: Date, default: Date.now },
  },{
    timestamps: true,
    _id: true
  }
);

const auctionsSchema = new Schema(
  {

    title: { type: String, trim: true }, // e.g., "11Th Feb 2025 Auction / Summer 2022 Auction"

    auctionType: {
      type: String,  
      default: "Regular",
    },
 
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    auctionStarted: { type: Boolean, default: false },
    auctionEnded: { type: Boolean, default: false },

    depositRequired: { type: Boolean, default: false },
    depositAmount: { type: Number, default: 0 }, // e.g., 5000

    registeredBidders: [
      {
        user: { type: Schema.Types.ObjectId, ref: "users", default: null },
        dealer: { type: Schema.Types.ObjectId, ref: "staff", default: null },
        depositPaid: { type: Boolean, default: false },
        depositPaidAt: { type: Date },
        depositTransaction: {
          type: Schema.Types.ObjectId,
          ref: "transactions",
          default: null,
        },
      },
    ],

    items: [auctionItemSchema],
  },
  { timestamps: true }
);

auctionsSchema.set("collection", "auctions");

auctionsSchema.index({ "$**": "text" });

export const Auctions = models.auctions || model("auctions", auctionsSchema);
