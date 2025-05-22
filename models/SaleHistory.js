import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const saleHistoryBaseSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["Dealership", "Property", "Jobs", "Goods", "Rentals", "Accommodation"],
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "listingBase",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organization",
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    soldPrice: { type: Number, required: true },
    soldDate: { type: Date, required: true },
  },
  {
    timestamps: true,
    discriminatorKey: "category",
    collection: "saleHistory",
  }
);

export const saleHistoryBaseModel = models.saleHistoryBase || model("saleHistoryBase", saleHistoryBaseSchema);

const dealershipSaleSchema = new Schema({
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
});

export const dealershipSaleHistory = models.DealershipSale || saleHistoryBaseModel.discriminator("DealershipSale", dealershipSaleSchema);

const propertySaleSchema = new Schema({
  listingType: String, // e.g. "For Sale", "For Rent"
  propertyType: String, // e.g. 'house', 'apartment'
  address: String,
  street: String,
  suburb: String,
  city: String,
  province: String,
  zip: Number,
  country: { type: String, default: "South Africa" },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  bedrooms: Number,
  bathrooms: Number,
  floorSize: Number,
  erfSize: Number,
  furnishedStatus: String, // e.g. 'furnished', 'unfurnished'
  isPetFriendly: { type: Boolean, default: false },
});

export const propertySaleHistory = models.PropertySale || saleHistoryBaseModel.discriminator("PropertySale", propertySaleSchema);

const goodsSaleSchema = new Schema({
  barcode: String,
  brand: String,
  model: String,
  color: String,
  size: String,
  weight: Number,
  quantity: { type: Number, default: 1 },
  condition: String,
});

export const goodsSaleHistory = models.GoodsSale || saleHistoryBaseModel.discriminator("GoodsSale", goodsSaleSchema);

const rentalSaleSchema = new Schema({
  rentalType: String, // e.g. "Vehicle", "Equipment"
  rentalPeriod: String, // e.g. "per day", "per week"
  depositRequired: Number,
  rentedFrom: { type: Date }, // Start date
  rentedTo: { type: Date }, // End date
});

export const rentalSaleHistory = models.RentalSale || saleHistoryBaseModel.discriminator("RentalSale", rentalSaleSchema);

const accommodationSaleSchema = new Schema({
  rentalType: String, // e.g. "Apartment", "House"
  rentalPeriod: String, // e.g. "per month", "per week"
  depositRequired: Number,
  rentedFrom: { type: Date }, // Start date
  rentedTo: { type: Date }, // End date
});

export const accommodationSaleHistory = models.AccommodationSale || saleHistoryBaseModel.discriminator("AccommodationSale", accommodationSaleSchema);

const jobSaleSchema = new Schema({
  title: String,
  positionType: String, // e.g. 'Full-Time', 'Part-Time'
  company: String,
  location: String, // might differ from listing's location
  salaryRange: String,
  placementFee: Number, // If recruitment fee applies
});

export const jobSaleHistory = models.JobSale || saleHistoryBaseModel.discriminator("JobSale", jobSaleSchema);
