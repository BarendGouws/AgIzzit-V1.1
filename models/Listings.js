import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const listingBaseSchema = new Schema(
  {

    category: {
      type: String,
      required: true, 
      // you could also add enum if you want: enum: ['dealership','property','jobs','goods','rentals']
    },
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
    publicId: {
      type: String,
      unique: true,
      index: true,
    },
    url: { type: String, trim: true },

    fullDescription: String,
    subcategory: String,  //Leisure  
    subType: String,  //Boats
    specificType: String, //Bass Boat

    images: [{
        url: { type: String, required: true },
        localUrl: { type: String },
        caption: { type: String, default: "" },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "staff" },
    }],
    videos: [{
      videoId: String,
      url: String,
      caption: String,
      thumbnailUrl: String,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "staff" },
      uploadedAt: { type: Date, default: Date.now}
    }],
    documents: [{    
          url: { type: String, required: true  },
          localUrl: { type: String },
          caption: { type: String, default: "" },
          uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "staff" },
          uploadedAt: { type: Date, default: Date.now },
          permission: {
            type: String,
            enum: ["private_org", "public_logged_in", "public"],
            default: "public",
          },
          views: { type: Number, default: 0 },
          viewedBy: {
            type: [
              {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
                timestamp: { type: Date, default: Date.now },
              },
            ],
            default: [],
          },         
    }],

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
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    viewHistory: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    favourites: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },    

    additionalInformation: mongoose.Schema.Types.Mixed,

    changes: [{
          timestamp: {
           type: Date,
           default: new Date(),       
          },
          fieldId: String,
          fieldName: String,
          from: String,
          to: String,
          changedBy: {
           type: mongoose.Types.ObjectId,
           ref: "staff",
         },
    }],  

    repDisplayHistory: {
      type: [
        {
          rep: {
            type: mongoose.Schema.ObjectId,
            ref: "staff",
          },
          count: { type: Number, default: 0 },
          conversationsStarted: { type: Number, default: 0 },
        },
      ],
      default: [],
    },

    // Sale history
    saleHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "saleHistoryBase" }]
    
  },
  {
    timestamps: true,
    discriminatorKey: "category",
    collection: "listings",
  }
);

// Example text index on all string fields
listingBaseSchema.index({ "$**": "text" });

listingBaseSchema.pre("save", async function (next) {

  // Handle publicId generation first
  if (this.isNew && !this.publicId) {
    let candidateId = generateShortIdFromObjectId(this._id);
    while (true) {
      const existing = await this.constructor.findOne({ publicId: candidateId });
      if (!existing) {
        this.publicId = candidateId;
        break;
      }  
      candidateId = generateShortIdFromObjectId(new mongoose.Types.ObjectId());
    }
  }

  // Helper function to format URL segments
  const formatUrlSegment = (segment) => {
    if (!segment) return '';
    return segment
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-')
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/\|/g, '') // Remove pipe characters
      .replace(/[^a-zA-Z0-9-]/g, '') // Remove special characters except hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  };

  if (this.isNew && !this.url) {
    if (this.category === "Dealership") {
      const subcategory = this.subcategory === "Cars & Bakkies" ? "cars" : formatUrlSegment(this.subcategory);
      const make = formatUrlSegment(this.make);
      const model = formatUrlSegment(this.model);
      const variant = formatUrlSegment(this.variant);
      this.url = `/${subcategory}-for-sale/${make}/${model}/${variant}/${this.publicId}`;
    } else {
      this.url = `/listing/${this.publicId}`;
    }
  }

  next();
});

export const listingBaseModel = models.listingBase || model("listingBase", listingBaseSchema);

const dealershipListingSchema = new Schema({
  
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
    hours: Number,    
    axles: Number,
    condition: String,
    serviceHistory: String,
    serviceHistoryBook: { type: Boolean, default: false },
    spareKey: { type: Boolean, default: false },
    ownersManual: { type: Boolean, default: false },    
    extras: { type: [String], default: [] },

    manufacturerWarrantyActive: { type: Boolean, default: false },
    manufacturerWarrantyDes: String,
    manufacturerServicePlanActive: { type: Boolean, default: false },
    manufacturerServicePlanDes: String,
    manufacturerMaintenanceActive: { type: Boolean, default: false },
    manufacturerMaintenanceDes: String,

    isFinanceAvailable: { type: Boolean, default: false },
    financeExtras: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "extras",
    }],
    cashExtras: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "extras",
    }],
    specificConditions: { type: [String], default: [] },
    specificConditionsPublic: { type: Boolean, default: false },

    natisIsDealerStocked: { type: Boolean, default: false },
    natisDealerStockedDate: Date,
    natisDealerStockScan: String,

    bodyType: String,
    seats: Number,
    doors: Number,
    driveType: String,
    specifications: { type: [String], default: [] },  

    // PRICE FIELDS   
    price: Number,
    previousPrice: Number,
    showPreviousPrice: { type: Boolean, default: true },   

    // AUCTION FIELDS
    auctions: [{ type: Schema.Types.ObjectId, ref: "auctions" }],

    // OFFERS
    allowOnlineOffers: { type: Boolean, default: false },
    autoRejectMinOffer: Number,
    offers: {
      type: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
          },
          amount: { type: Number, required: true },
          timestamp: { type: Date, default: Date.now },
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

    // Status flags
    isSold: { type: Boolean, default: false },
    soldAt: Date,
    isUnavailable: { type: Boolean, default: false },
    isReserved: { type: Boolean, default: false },
    saleInProgress: { type: Boolean, default: false },
    isPreApproved: { type: Boolean, default: false },
    onSpecial: { type: Boolean, default: false },
    onSpecialName: String,
    flagExpire: Date,    

});

export const dealershipListing = models.Dealership || listingBaseModel.discriminator("Dealership",dealershipListingSchema);

const propertyListingSchema = new Schema({

  // UNIVERSAL FIELDS (For all listings)
  listingType: { type: String, required: true }, // e.g. "Buy", "Rent", "Buy & Rent", "Auction", "Development"
  propertyType: { type: String, required: true }, // e.g. 'house', 'apartment'
  bedrooms: { type: Number, default: 0 },
  bathrooms: { type: Number, default: 0 },
  kitchens: { type: Number, default: 0 },
  offices: { type: Number, default: 0 },
  lounges: { type: Number, default: 0 },
  garages: { type: Number, default: 0 },
  carports: { type: Number, default: 0 },
  parkingSpaces: { type: Number, default: 0 },
  floorSize: { type: Number },
  erfSize: { type: Number },
  zoning: { type: String },
  ratesAndTaxes: { type: Number },
  levies: { type: Number },
  floors: { type: Number, default: 1 },

  // FEATURES (Applies to all, default false for Booleans)
  pool: { type: Boolean, default: false },
  garden: { type: Boolean, default: false },
  patio: { type: Boolean, default: false },
  balcony: { type: Boolean, default: false },
  braai: { type: Boolean, default: false },
  jacuzzi: { type: Boolean, default: false },
  tennisCourt: { type: Boolean, default: false },
  gym: { type: Boolean, default: false },
  cinema: { type: Boolean, default: false },
  laundry: { type: Boolean, default: false },
  flatlet: { type: Boolean, default: false },
  study: { type: Boolean, default: false },
  fireplace: { type: Boolean, default: false },
  aircon: { type: Boolean, default: false },
  underfloorHeating: { type: Boolean, default: false },
  solarPanels: { type: Boolean, default: false },
  solarGeyser: { type: Boolean, default: false },
  borehole: { type: Boolean, default: false },
  batteryBackup: { type: Boolean, default: false },
  generator: { type: Boolean, default: false },
  waterTank: { type: Boolean, default: false },
  security: { type: Boolean, default: false },
  securityFeatures: { type: [String], default: [] },

  // DETAILS
  formattedAddress: { type: String, required: true },
  suburb: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: Number, required: true },
  province: { type: String, required: true },
  country: { type: String, default: "South Africa" },
  countryCode: { type: String, default: "ZA" },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [longitude, latitude]
  }, 

  // BUY / SALE FIELDS
  powerType: { type: String }, // e.g. 'single phase', 'three phase'
  price: { type: Number, required: function() { return this.listingType === "Buy" || this.listingType === "Buy & Rent"; } },
  previousPrice: { type: Number },
  showPreviousPrice: { type: Boolean, default: true },

  // RENT FIELDS (No default values unless explicitly used)
  isPetFriendly: { type: Boolean },  
  occupationDate: { type: Date },
  rentalDeposit: { type: Number },
  keyDeposit: { type: Number },
  otherDeposit: { type: Number },
  otherDepositDescription: { type: String },
  leasePeriod: { type: String }, // e.g. '12 months', '24 months
  availability: { type: String }, // e.g. 'immediate', '1 month notice'
  internet: { type: Boolean },
  furnished: { type: Boolean }, // e.g. 'furnished', 'unfurnished'
  rental: { type: Number, required: function() { return this.listingType === "Rent" || this.listingType === "Buy & Rent"; } },
  previousRental: { type: Number },
  showPreviousRental: { type: Boolean, default: true },

  // DEVELOPMENT FIELDS (Applies only to "Development" listings)
  developmentType: { type: [String] }, // e.g. "Buy", "Rent", "Buy & Rent"
  developmentStatus: { type: String }, // e.g. 'Off Plan', 'Under Construction', 'Completed'    
  developmentName: { type: String },
  fromPrice: { type: Number },
  toPrice: { type: Number },
  units: { type: Number },

  // AUCTION FIELDS
  auctions: [{ type: Schema.Types.ObjectId, ref: "auctions" }],

  // OFFERS
  allowOnlineOffers: { type: Boolean, default: false },
  autoRejectMinOffer: { type: Number },
  offers: {
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        amount: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "staff" },
        acceptedTimestamp: { type: Date },
      }
    ],
    default: [],
  },

  // STATUS FLAGS (Defaults only where applicable)
  isSold: { type: Boolean, default: false },
  soldAt: { type: Date },
  isReduced: { type: Boolean, default: false },
  saleInProgress: { type: Boolean, default: false },
  isPreApproved: { type: Boolean, default: false },
  onSpecial: { type: Boolean, default: false },
  onSpecialName: { type: String },
  flagExpire: { type: Date },

});

export const propertyListing = models.Property || listingBaseModel.discriminator("Property",propertyListingSchema);

const goodsListingSchema = new Schema({

    barcode: String,
    brand: String,
    model: String,
    description: String,

    quantity: { type: Number, default: 1 },
    condition: { type: String, enum: ["New", "Used", "Refurbished"], required: true },
    backOrder: { type: Boolean, default: false },
    
    // PRICE FIELDS
    price: Number,
    previousPrice: Number,
    showPreviousPrice: { type: Boolean, default: true },  

    // OFFERS
    allowOnlineOffers: { type: Boolean, default: false },
    autoRejectMinOffer: Number,
    offers: {
      type: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
          },
          amount: { type: Number, required: true },
          timestamp: { type: Date, default: Date.now },
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

    //COURIER FIELDS
    length_cm: Number,
    width_cm: Number,
    height_cm: Number,
    weight_kg: Number,
    
});

export const goodsListing = models.Goods || listingBaseModel.discriminator("Goods",goodsListingSchema);

const rentalListingSchema = new Schema({

    rentalType: String, // e.g. "Vehicle", "Equipment"
    depositRequired: Number,
    rentalRate: Number,
    rentalPeriod: String, // e.g. "per day", "per week"

    // Status flags, PROBLEM HERE IS THAT RENTAL NEEDS DATES THAT ITEM IS RENTED OUT
    flags: { type: [String], default: [] }, 
    
});

export const rentalListing = models.Rentals || listingBaseModel.discriminator("Rentals",rentalListingSchema);

const accomodationListingSchema = new Schema({

  rentalType: String, // e.g. "Vehicle", "Equipment"
  depositRequired: Number,
  rentalRate: Number,
  rentalPeriod: String, // e.g. "per day", "per week"

  // Status flags, PROBLEM HERE IS THAT RENTAL NEEDS DATES THAT ROOM OR UNIT IS RENTED OUT, SAME AS RENTALS
  flags: { type: [String], default: [] }, 
  
});

export const accomodationListing = models.Accomodation || listingBaseModel.discriminator("Accomodation",accomodationListingSchema);

const jobListingSchema = new Schema({

  title: String,
  positionType: String, // e.g. 'Full-Time', 'Part-Time'
  company: String,
  location: String, // might differ from listing's location
  salaryRange: String,
  requirements: { type: [String], default: [] },
  responsibilities: { type: [String], default: [] },

  // Status flags
  isFilled: { type: Boolean, default: false },
  filledAt: Date,
  interviewsInProgress: { type: Boolean, default: false },   
  flagExpire: Date,
  flags: { type: [String], default: [] }, 

});

export const jobListing = models.Jobs || listingBaseModel.discriminator("Jobs", jobListingSchema);

function generateShortIdFromObjectId(oid) {
  // Convert the 24-char hex string to, say, first 8 chars:
  // e.g. "6791f548"
  return oid.toHexString().slice(0, 8);
}