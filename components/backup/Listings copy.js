import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },
    location: {
      type: mongoose.Types.ObjectId,
      ref: "locations",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "staff",
    },
    slug: {
      type: String,
      trim: true,
    },
    // Main description (title / summary / details)
    fullDescription: String,
    barcode: String,

    // Category & Subcategory
    category: String, // e.g. 'automotive', 'property', 'jobs', 'goods', etc.
    subcategory: String,
    condition: String, // e.g. "New", "Used", "Refurbished"

    images: [
      {
        url: { type: String, required: true },
        caption: { type: String },
        timestamp: { type: Date, default: new Date() },
      },
    ],
    videos: [
      {
        url: { type: String, required: true },
        caption: { type: String },
        timestamp: { type: Date, default: new Date() },
      },
    ],

    // Price fields
    price: Number,
    previousPrice: Number,
    showPreviousPrice: {
      type: Boolean,
      default: true,
    },
    priceChanges: {
      type: [
        {
          timestamp: { type: Date, required: true, default: new Date() },
          from: { type: Number, required: true },
          to: { type: Number, required: true },
          employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
          },
        },
      ],
      default: [],
    },

    // Engagement/analytics counters
    views: { type: Number, default: 0 },
    engagements: { type: Number, default: 0 },
    addedToFavourites: { type: Number, default: 0 },
    addedToCart: { type: Number, default: 0 },
    watsappsStarted: { type: Number, default: 0 },
    callEvents: { type: Number, default: 0 },

    // Sharing, viewing, and favoriting history
    shareHistory: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
          shareMethod: { type: String }, // e.g. 'whatsapp', 'email'
          timestamp: { type: Date, default: new Date() },
        },
      ],
      default: [],
    },
    viewHistory: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
          timestamp: { type: Date, default: new Date() },
        },
      ],
      default: [],
    },
    favourites: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
          timestamp: { type: Date, default: new Date() },
        },
      ],
      default: [],
    },

    // Status flags
    isSold: { type: Boolean, default: false },
    soldAt: Date,
    isReserved: { type: Boolean, default: false },
    saleInProgress: { type: Boolean, default: false },
    isPreApproved: { type: Boolean, default: false },
    flagExpire: Date, 
    additionalInformation: mongoose.Schema.Types.Mixed,

    history: {
      type: [
        {
          timestamp: { type: Date, default: new Date() },
          changes: [{ type: String }], // e.g. "Price changed from X to Y"
          employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "staff",
          },
        },
      ],
      default: [],
    },
    attachments: {
      type: [
        {
          type: { type: String }, // e.g. 'pdf', 'report', 'doc', 'image'
          url: { type: String },
          fileName: { type: String },
          caption: { type: String },
          permission: {
            type: String,
            enum: [
              "private_employee",
              "private_org",
              "public_logged_in",
              "public",
            ],
            default: "private_org",
          },
          views: { type: Number, default: 0 },
          viewedBy: {
            type: [
              {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
                timestamp: { type: Date, default: new Date() },
              },
            ],
            default: [],
          },
          uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
          },
          uploadedAt: {
            type: Date,
            default: new Date(),
          },
        },
      ],
      default: [],
    },
    repDisplayHistory: {
      type: [
        {
          rep: {
            type: mongoose.Schema.ObjectId,
            ref: "staff",
          },
          count: {
            type: Number,
            default: 0,
          },
          conversationsStarted: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [],
    },

    // ====================================================
    // AUCTION FIELDS
    // ====================================================
    allowToSellOnAuction: { type: Boolean, default: false },
    openingBid: { type: Number, default: 0 },
    currentBid: { type: Number, default: 0 },
    auctionStarted: { type: Boolean, default: false },
    auctionEnded: { type: Boolean, default: false },
    auctionStartDate: Date,
    auctionEndedDate: Date,
    purchasedBy: { type: mongoose.Schema.ObjectId, ref: "users" },
    currentBidder: { type: mongoose.Schema.ObjectId, ref: "users" },
    bids: {
      type: [
        {
          user: {
            type: mongoose.Schema.ObjectId,
            ref: "users",
            required: true,
          },
          amount: { type: Number, required: true },
          time: { type: Date, default: new Date() },
        },
      ],
      default: [],
    },
    room: { type: mongoose.Schema.ObjectId, ref: "rooms" },

    // ====================================================
    // OFFERS
    // ====================================================
    allowOnlineOffers: { type: Boolean, default: false },
    autoRejectMinOffer: Number,
    offers: {
      type: [
        {
          user: {
            type: mongoose.Schema.ObjectId,
            ref: "users",
            required: true,
          },
          amount: { type: Number, required: true },
          timestamp: { type: Date, default: new Date() },
          status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
          },
          acceptedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "staff",
          },
          acceptedTimestamp: { type: Date },
        },
      ],
      default: [],
    },

    // ====================================================
    // CATEGORY-SPECIFIC FIELDS
    // ====================================================

    // DEALERSHIP
    dealershipDetails: {

      stockNr: String,

      year: Number,
      make: String,
      model: String,
      variant: String,
      mmCode: String,
      fuelType: String,
      transmission: String,      
      vinNr: String,
      engineNr: String,
      regNr: String,
      colour: String,      
      mileage: Number,     
      serviceHistory: { type: String, default: "No Service History" },  
      spareKey: { type: Boolean, default: false },
      ownersManual: { type: Boolean, default: false },

      extras: { type: [String], default: [] },

      manufacturerWarrantyActive: { type: Boolean, default: false },
      manufacturerWarrantyDes: String,
      manufacturerServicePlanActive: { type: Boolean, default: false },
      manufacturerServicePlanDes: String,
      manufacturerMaintananceActive: { type: Boolean, default: false },
      manufacturerMaintananceDes: String,

      isFinanceAvailable: { type: Boolean, default: true },
      financeExtras: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: "extras",
      }],

      specificConditions: { type: [String], default: [] },
      specificConditionsPublic: { type: Boolean, default: false },
  
      natisIsDealerStocked: { type: Boolean, default: false },
      natisDealerStockedDate: Date,
      natisDealerStockScan: String,

      //SPECS AI GENERATED
      bodyType: String,
      seats: Number,
      doors: Number,
      driveType: String,    
      specifications: { type: [String], default: [] },     

    },
    // PROPERTY
    propertyDetails: {
      listingType: String, // e.g. "For Sale", "For Rent"
      propertyType: String, // e.g. 'house', 'apartment', etc.
      bedrooms: Number,
      bathrooms: Number,
      parkingSpaces: Number,
      floorSize: Number,
      erfSize: Number,
      furnishedStatus: String, // e.g. 'furnished', 'unfurnished'
      isPetFriendly: Boolean,
      address: String,
    },
    // JOBS
    jobDetails: {
      title: String,
      positionType: String, // e.g. 'Full-Time', 'Part-Time'
      company: String,
      location: String, // might differ from listing's location
      salaryRange: String,
      requirements: { type: [String], default: [] },
      responsibilities: { type: [String], default: [] },
    },
    // GOODS
    goodsDetails: {
      brand: String,
      model: String,
      color: String,
      size: String,
      weight: Number,
    },
    // RENTALS
    rentalDetails: {
      rentalType: String, // e.g. "Vehicle", "Equipment"
      depositRequired: Number,
      rentalRate: Number,
      rentalPeriod: String, // e.g. "per day", "per week"
    },
    //VACATIONS == LEAVE SERVICES
   
    
  },
  {
    timestamps: true,
  }
);

listingSchema.index({ "$**": "text" });
listingSchema.set("collection", "listings");

//TODO CLEANUP
listingSchema.pre('save', function(next) {
 if (this.category !== 'automotive') {
   this.automotiveDetails = undefined;
 }
 if (this.category !== 'property') {
   this.propertyDetails = undefined;
 }
 next();
});

const Listings =  mongoose.models.listings || mongoose.model("listings", listingSchema);
export default Listings;
