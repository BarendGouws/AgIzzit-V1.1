const mongoose = require("mongoose");

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
      ref: "users",
    },
    fullDescription: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "Vehicle",
    },
    subcategory: String,
    condition: String,

    //AUTOMOTIVE
    year: Number,
    make: String,
    model: String,
    variant: String,
    mmCode: String,
    bodyType: String,
    vinNr: String,
    engineNr: String,
    colour: String,
    regNr: String,
    mileage: Number,
    fuelType: String,
    transmission: String,
    seats: Number,
    vehicleType: String,    
    serviceHistory: {
      type: String,
      default: "No Service History",
    },


    
    liveData: {
      isVinFound: {
        type: Boolean,
      },
      fullDescription: {
        type: String,
      },
      year: {
        type: Number,
      },
      years: {
        type: [{ type: Number }],
        default: undefined,
      },
      make: {
        type: String,
      },
      model: {
        type: String,
      },
      intoDate: {
        type: String,
      },
      discontinueDate: {
        type: String,
      },
      fuelType: {
        type: String,
      },
      driveType: {
        type: String,
      },
      transmission: {
        type: String,
      },
      bodyShape: {
        type: String,
      },
      engineSize: {
        type: String,
      },
      power: {
        type: String,
      },
      warrantyYear: {
        type: String,
      },
      warrantyActive: {
        type: Boolean,
      },
      warrantyYears: {
        type: String,
      },
      warrantykm: {
        type: String,
      },
      maintenanceActive: {
        type: Boolean,
      },
      maintenanceYears: {
        type: String,
      },
      maintenanceKm: {
        type: String,
      },
      serviceActive: {
        type: Boolean,
      },
      servicePlanYears: {
        type: String,
      },
      servicePlanKm: {
        type: String,
      },
      serviceIntervals: {
        type: String,
      },
      retailEstimate: {
        type: Number,
      },
      retailEstimateHigh: {
        type: Number,
      },
      retailEstimateLow: {
        type: Number,
      },
      costEstimate: {
        type: String,
      },
      costEstimateHigh: {
        type: String,
      },
      costEstimateLow: {
        type: String,
      },
      colour: {
        type: String,
      },
      vinRetured: {
        type: String,
      },
      engineRetured: {
        type: String,
      },
      policeInterest: {
        type: String,
      },
      policeMatchSummary: {
        type: String,
      },
      microdotFitted: {
        type: String,
      },
      microdotDate: {
        type: String,
      },
      liveReportUrl: {
        type: String,
      },
      financialInterest: {
        type: String,
      },
      financialAccountNr: {
        type: String,
      },
      financialContractStarted: {
        type: String,
      },
    },
    liveReportUrl: {
      type: String,
    },
    transunionData: {
      isVinFound: {
        type: Boolean,
      },
      financeCurrent: {
        agreementOrAccountNumber: String,
        agreementType: String,
        financeBranch: String,
        financeProvider: String,
        telNumber: String,
      },

      financeHistory: {
        type: [
          {
            agreementOrAccountNumber: String,
            agreementType: String,
            startDate: String,
            endDate: String,
            financeHouse: String,
            telNumber: String,
          },
        ],
        default: undefined,
      },

      alertInformation: {
        resultCode: String,
        resultCodeDescription: String,
        alertReason: String,
        company: String,
        refrenceNumber: String,
        telNumber: String,
      },

      stolen: {
        resultCode: String,
        resultCodeDescription: String,
        caseNumber: String,
        dateStolen: String,
        engineMathch: String,
        policeStation: String,
        registrationMatch: String,
        vinMatch: String,
      },

      ividHistory: {
        type: [
          {
            referenceNumber: String,
            responceCode: String,
            responceDescription: String,
          },
        ],
        default: undefined,
      },

      microdot: {
        resultCode: String,
        resultCodeDescription: String,
        company: String,
        contactNr: String,
        dateApplied: String,
        referenceNumber: String,
      },

      vesa: {
        type: [
          {
            resultCode: String,
            resultCodeDescription: String,
            brandModel: String,
            brandName: String,
            certificateNumber: String,
            dateFitted: String,
            deviceDescriptionType: String,
          },
        ],
        default: undefined,
      },

      mileageHistory: {
        type: [
          {
            resultCode: String,
            resultCodeDescription: String,
            dateRegistered: String,
            source: String,
            vehicleMileage: String,
          },
        ],

        default: undefined,
      },

      registrationHistory: {
        type: [
          {
            resultCode: String,
            resultCodeDescription: String,
            dateRegistered: String,
            registrationNumber: String,
          },
        ],
        default: undefined,
      },

      enquiryHistory: {
        type: [
          {
            resultCode: String,
            resultCodeDescription: String,
            source: String,
            transactionDate: String,
          },
        ],
        default: undefined,
      },

      factoryFittedExtras: {
        type: [
          {
            resultCode: String,
            resultCodeDescription: String,
            category: String,
            description: String,
            oemCode: String,
            valueAddCode: String,
          },
        ],
        default: undefined,
      },

      diskDriveData: {
        resultCode: String,
        resultCodeDescription: String,
        airbagDetails: String,
        alarm: String,
        aspiration: String,
        autolock: String,
        averageConsumption: String,
        bodyType: String,
        carbonDioxideEmission: String,
        centralLocking: String,
        codeEntry: String,
        derivative: String,
        discontinuedDate: Date,
        driveWheels: String,
        engineCapacity: String,
        engineCylinder: String,
        frontTyres: String,
        fuelCapacity: String,
        fuelConsumptionAverage: String,
        fuelType: String,
        gearLock: String,
        grossVehicleMass: String,
        highwayFuelConsumption: String,
        immobiliser: String,
        introductionDate: String,
        keyless: String,
        killowatts: String,
        mmCode: String,
        majorServiceInterval: String,
        make: String,
        masterModel: String,
        minorServiceInterval: String,
        model: String,
        numberOfAirbags: String,
        numberOfDoors: String,
        numberOfGears: String,
        numberOfWheelsDrive: String,
        powerRPM: String,
        powerToWeightRatio: String,
        rearTyres: String,
        security: String,
        tare: String,
        torque: String,
        torqueRPM: String,
        towingCapacity: String,
        transmission: String,
        urbanFuelConsumption: String,
        warranty: String,
        wheelBase: String,
      },

      vehicleConfirmation: {
        resultCode: String,
        resultCodeDescription: String,
        engine: String,
        hpiNumber: String,
        matchColour: String,
        matchEngineNumber: String,
        matchManufacturer: String,
        matchModel: String,
        matchString: String,
        matchVehicleRegistration: String,
        matchVinorChassis: String,
        matchYear: String,
        vin: String,
      },

      vehicleCodesAndDescription: {
        resultCode: String,
        resultCodeDescription: String,
        vehicleCode: String,
        vehicleTypeCode: String,
        vehicleTypeDescription: String,
        vehicleMake: String,
        vehicleModel: String,
        vehicleVariant: String,
        introductionDate: String,
        discontinuedDate: String,
        cylinders: String,
        cc: String,
        fuelType: String,
        tareMass: String,
        use: String,
        doors: String,
        axleConfiguration: String,
        bodyType: String,
        drive: String,
        seats: String,
        wheelBase: String,
        manualAuto: String,
        noGears: String,
        cooling: String,
        cylinderConfiguration: String,
        engineCycle: String,
        fuelTankSize: String,
        kilowatts: String,
        turboOrSupercharged: String,
        gcm: String,
        gvm: String,
        origin: String,
        frontNoTyres: String,
        frontTyreSize: String,
        rearNoTyres: String,
        rearTyreSize: String,
        makeCode: String,
        modelcode: String,
        modelRange: String,
        variantCode: String,
        vehicleLength: String,
        vehicleHeight: String,
        vehicleWidth: String,
        co2: String,
      },

      vehicleOptionCodes: {
        resultCode: String,
        resultCodeDescription: String,
        maximumRange: String,
        minimunRange: String,
        month: String,
        newOptionCode: String,
        newPrice: String,
        retailPrice: String,
        tradePrice: String,
        usedOptionCode: String,
        year: String,
      },

      vehicleValueInformation: {
        resultCode: String,
        resultCodeDescription: String,
        adjustedEstimatedCostPrice: String,
        adjustedEstimatedCostPrice_MileageAndCondition: String,
        adjustedEstimatedRetailPrice: String,
        adjustedEstimatedRetailPrice_MileageAndCondition: String,
        adjustedEstimatedTradePrice: String,
        adjustedEstimatedTradePrice_MileageAndCondition: String,
        adjustedRetailPrice: String,
        adjustedRetailPrice_MileageAndCondition: String,
        adjustedTradePrice: String,
        adjustedTradePrice_MileageAndCondition: String,
        costPrice: String,
        estimatedCostPrice: String,
        estimatedRetailPrice: String,
        estimatedTradePrice: String,
        guideMonth: String,
        guideYear: String,
        newListPrice: String,
        retailPrice: String,
        tradePrice: String,
        vehicleCode: String,
      },

      transunionReportUrl: String,

      errorCode: String,
      errorMessage: mongoose.Schema.Types.Mixed,
      resultCode: String,
      transactionNumber: String,
    },
    transunionReportUrl: {
      type: String,
    },
    
    spareKey: {
      type: Boolean,
      default: false,
    },
    ownersManual: {
      type: Boolean,
      default: false,
    },
    mechanicalReportType: {
      type: String,
    },
    mechanicalReportUrl: {
      type: String,
    },
    mechanicalReport: {
      inspectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      inspectedAt: { type: Date, default: new Date() },
      location: { type: mongoose.Schema.Types.ObjectId, ref: "locations" },
      inspection: [
        {
          section: { type: String },
          items: [
            {
              nr: { type: Number },
              name: { type: String },
              value: { type: String },
              comment: { type: String },
              inspectedAt: { type: Date, default: new Date() },
              images: [
                {
                  url: { type: String, required: true },
                  caption: { type: String },
                  host: { type: String, required: true },
                  timestamp: {
                    type: Date,
                    required: true,
                    default: new Date(),
                  },
                  id: { type: String, required: true },
                },
              ],
            },
          ],
        },
      ],
      videos: [
        {
          url: { type: String, required: true },
          caption: { type: String },
          timestamp: { type: Date, required: true, default: new Date() },
        },
      ],
    },
    diagnosticReportUrl: {
      type: String,
    },
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String },
        timestamp: { type: Date, required: true, default: new Date() },
      },
    ],
    socialImagesUrl: String,
    videos: [
      {
        url: { type: String, required: true },
        caption: { type: String },
        timestamp: { type: Date, required: true, default: new Date() },
      },
    ],

    exteriorFeatures: [
      {
        type: String,
        required: true,
      },
    ],
    interiorFeatures: [
      {
        type: String,
        required: true,
      },
    ],
    safetyFeatures: [
      {
        type: String,
        required: true,
      },
    ],
    technologyFeatures: [
      {
        type: String,
        required: true,
      },
    ],

    stockNr: {
      type: String,
    },

    additionalInformation: mongoose.Schema.Types.Mixed,

    isScanned: {
      type: Boolean,
      default: false,
    },

    recons: [
      {
        description: String,
        amount: Number,
        url: String,
      },
    ],

    natisScanDealerstock: {
      type: String,
    },

    natisScanClientReg: {
      type: String,
    },

    natisIsRecieved: {
      type: Boolean,
      default: false,
    },

    natisIsDealerStocked: {
      type: Boolean,
    },

    natisDealerStockedDate: {
      type: Date,
    },

    documents: [
      {
        type: { type: String, required: true },
        url: { type: String, required: true },
        fileName: { type: String, required: true },
        timestamp: { type: Date },
        comment: { type: String },
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "users",
        },
      },
    ],

    mechanicalReportViews: {
      type: Number,
      default: 0,
    },
    diagnosticReportViews: {
      type: Number,
      default: 0,
    },
    liveReportViews: {
      type: Number,
      default: 0,
    },
    transunionReportViews: {
      type: Number,
      default: 0,
    },
    financeApplications: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    engagements: {
      type: Number,
      default: 0,
    },
    addedToFavourites: {
      type: Number,
      default: 0,
    },
    addedToCart: {
      type: Number,
      default: 0,
    },
    watsappsStarted: {
      type: Number,
      default: 0,
    },
    callEvents: {
      type: Number,
      default: 0,
    },

    shareHistory: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "users",
        },
        shareMethod: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: new Date(),
        },
      },
    ],

    salesmanDisplayHistory: [
      {
        salesman: {
          type: mongoose.Schema.ObjectId,
          ref: "users",
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

    viewHistory: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "users",
        },
        timestamp: {
          type: Date,
          default: new Date(),
        },
      },
    ],

    favourites: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "users",
        },
        timestamp: {
          type: Date,
          default: new Date(),
        },
      },
    ],

    //MARKETING
    sellingPrice: {
      type: Number,
    },
    previousSellingPrice: {
      type: Number,
    },
    showPreviousPrice: {
      type: Boolean,
      required: true,
      default: true,
    },
    priceChanges: [
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

    //MANUFACTURER WARRANTY
    manufacturerWarrantyActive: {
      type: Boolean,
      default: false,
    },
    manufacturerWarrantyExpireDate: {
      type: Date,
    },
    manufacturerServicePlanActive: {
      type: Boolean,
      default: false,
    },
    manufacturerServicePlanExpireDate: {
      type: Date,
    },
    manufacturerMaintananceActive: {
      type: Boolean,
      default: false,
    },
    manufacturerMaintananceExpireDate: {
      type: Date,
    },

    //FINANCE
    isFinanceAvailable: {
      type: Boolean,
      default: true,
    },

    generalExtras: [
      {
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
        optional: {
          type: Boolean,
          default: false,
        },
      },
    ],
    specificExtras: [
      {
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
        optional: {
          type: Boolean,
          default: false,
        },
      },
    ],

    specificConditions: [String],
    roadworthyRelevantIssues: [String],

    //SOLD
    isSold: {
      type: Boolean,
      default: false,
    },
    soldAt: {
      type: Date,
    },
    isPreApproved: {
      type: Boolean,
      default: false,
    },
    saleInProgress: {
      type: Boolean,
      default: false,
    },
    isReserved: {
      type: Boolean,
      default: false,
    },
    reservedUntil: {
      type: Date,
    },
    history: [
      {
        timestamp: { type: Date, required: true, default: new Date() },
        changes: [{ type: String, required: true }],
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

listingSchema.set("collection", "listings");

listingSchema.index({ "$**": "text" });

const Listings =
  mongoose.models.listings || mongoose.model("listings", listingSchema);
export default Listings;
