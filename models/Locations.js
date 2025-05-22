const mongoose = require("mongoose");

const locationsSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },
    name: { type: String, required: true },
    isHeadOffice: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    activeDate: { type: Date, default: new Date() },
    closedDate: { type: Date },

    type: { type: String, required: true }, //Store branch, workshop, head office, buying centre

    formattedAddress: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    suburb: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: Number, required: true },
    province: { type: String, required: true },
    country: { type: String, default: "South Africa" },
    countryCode: { type: String, default: "ZA" },
    
    phoneNrPrefix: { type: String, default: "+27" },
    phoneNr: { type: Number, required: true },
    signioCode: { type: String },

    displaySortOrder: { type: Number, required: true },

    locationPictures: {
      type: [{ type: String, required: true }],
      default: undefined,
    },    

    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    ratingCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    placesName: String,
    placesId: String,
    directionsUrl: String,
    placeUrl: String,
   
    operatingHours: {
      mondayOpening: Date,
      mondayClosing: Date,
      mondayIsOpen: { type: Boolean, default: false },
      thuesdayOpening: Date,
      thuesdayClosing: Date,
      thuesdayIsOpen: { type: Boolean, default: false },
      wednesdayOpening: Date,
      wednesdayClosing: Date,
      wednesdayIsOpen: { type: Boolean, default: false },
      thursdayOpening: Date,
      thursdayClosing: Date,
      thursdayIsOpen: { type: Boolean, default: false },
      fridayOpening: Date,
      fridayClosing: Date,
      fridayIsOpen: { type: Boolean, default: false },
      saterdayOpening: Date,
      saterdayClosing: Date,
      saterdayIsOpen: { type: Boolean, default: false },
      sundayOpening: Date,
      sundayClosing: Date,
      sundayIsOpen: { type: Boolean, default: false },
      publicHolidayOpening: Date,
      publicHolidayClosing: Date,
      publicHolidayIsOpen: { type: Boolean, default: false },
    },

    publicHolidays: [
      {
        holidayDate: Date,
        holidayName: String,
        isOpen: Boolean,        
      },
    ],
  },
  {
    timestamps: true,
  }
);

locationsSchema.set("collection", "locations");
locationsSchema.index({ "$**": "text" });

const Locations = mongoose.models.locations || mongoose.model("locations", locationsSchema);
export default Locations;
