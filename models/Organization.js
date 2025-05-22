const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    //PART 1
    registeredBy: { //registration only
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    landlineNr: String,  //FOR REGISTRATION ONLY
    mobileNr: String,    //FOR REGISTRATION ONLY

    regNumber1: { type: String, required: true },
    regNumber2: { type: String, required: true },
    regNumber3: { type: String, required: true },
    registrationStatus: { type: String, default: "category" },
    registeredName: { type: String, required: true },
    tradingName: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    registrationNumberConverted: String,
    
    websiteUrl: { type: String, required: true },    
    isVatRegistered: { type: Boolean, default: false },
    vatNumber: String,
    vatNumberVerified: { type: Boolean, default: false }, 
    vatNumberVerifiedAt: Date,
    vatNumberVerifyToken: String,
    vatNumberVerifyTokenExpires: Date,
    vatNumberVerifiedByEmail: String,
    vatNumberVerifiedByName: String,

    registrationDate: Date,  
    businessStartDate: Date,
    companyVerified: { type: Boolean, default: false },    
    isActive: { type: Boolean, default: false },
    isComplete: { type: Boolean, default: false },    
    
    tradingNameVerified: { type: Boolean, default: false },
    tradingNameVerifiedAt: Date,
    websiteUrlVerfied: { type: Boolean, default: false },
    websiteUrlVerifiedAt: Date,
    
    directors: [{
      type: mongoose.Types.ObjectId,
      ref: "staff",
    }],
    locations: [{
      type: mongoose.Types.ObjectId,
      ref: "locations",
    }],

    type: String,
    financialYearEnd: String,
    taxNo: String,
    companyType: String, 
    operatingStatus: String, 
    description: String,
    directorCount: Number,

    bankAccounts: [
       {
         name: String,
         titleHolder: String,
         accountNr: String,
         accountType: String,
         branchCode: String,
         isVerified: {
           type: Boolean,
           default: false,
         },
         bankLogo: String,
         reasonVerificationFailed: String,
         addedBy: {
          type: mongoose.Types.ObjectId,
          ref: "staff",
          }
       },
    ],  
    timeline: [{

      timestamp: {
        type: Date,
        default: new Date(),
      },
      description: String,
      staff: {
        type: mongoose.Types.ObjectId,
        ref: "staff",
      },
      
    }],
    consents: [{
      name: { type: String, required: true },
      description: { type: String, required: true },
      isAccepted: { type: Boolean, required: true },
      timestamp: { type: Date, required: true },
    }],
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
    occupations: [{
      name: { type: String, required: true },
      code: { type: String, required: true },
      description: { type: String, required: true },
    }],
    departments: [String],

    //PACKAGE
    package: {
      type: String,
      default: "premium",
    },
    
    //INVENTORY SETTINGS
    forceScan: { type: Boolean, default: false }, //DEALERSHIPS
    flagExpireIn: { type: Number, default: 2 },

    allowToSellOnAuction: { type: Boolean, default: true },      
    allowOnlineOffers: { type: Boolean, default: true },
    
    //CONTACT 
    facebookPageUrl: String,
    instagramPageUrl: String,
    twitterPageUrl: String,
    tiktokPageUrl: String, 
    youtubePageUrl: String,    
    aboutUs: String,
    whyChooseUs: String,   

    leavePolicy: { type: String, default: "No leave policy." }, 

    //STATS
    categories: [String],
    statistics: [{ icon: String, name: String, value: String, displayOrder: Number }],    

    //SETTINGS == DEALERSHIPS
    isIdaMember: { type: Boolean, default: false },
    isRmiMember: { type: Boolean, default: false },
    provideFinance: { type: Boolean, default: false },
    offerFinancialProducts: { type: Boolean, default: false },
    financialProductsLock: { type: Boolean, default: true },
    acceptTradeins: { type: Boolean, default: false },   
    doTestDrives: { type: Boolean, default: true },
    testDriveRange: { type: Number, default: 100 },
    doDeliveries: { type: Boolean, default: true },
    deliveryRange: { type: Number, default: 100 },
    freeDeliveryRange: { type: Number, default: 50 },
    ratePerKm: { type: Number, default: 0 },      

    //GENERAL
    showPreviousPrice: { type: Boolean, default: true },    
    showSalesRepPaidPrice: { type: Boolean, default: false },
    calculateComission: { type: Boolean, default: false }, 

    //THEME
    logoUrl: { type: String, default: "/images/organization.jpg" },
    logoLastUpdated: Date,
    aboutUsBannerUrl: String,
    aboutUsBannerLastUpdated: Date,
    whyChooseUsBannerUrl: String,
    whyChooseUsBannerLastUpdated: Date,

    //THEME   
    theme: {
	
      lang: { type: String, default: "en" },
      dir: { type: String, default: "ltr" },
      dataThemeMode: { type: String, default: "light" },
      dataMenuStyles: { type: String, default: "light" },
      dataNavLayout: { type: String, default: "vertical" },
      dataHeaderStyles: { type: String, default: "color" },
      dataVerticalStyle: { type: String, default: "overlay" },
      StylebodyBg: { type: String, default: "107 64 64" },
      StyleDarkBg: { type: String, default: "93 50 50" },
      toggled: { type: String, default: "" },
      dataNavStyle: { type: String, default: "" },
      horStyle: { type: String, default: "" },
      dataPageStyle: { type: String, default: "regular" },
      dataWidth: { type: String, default: "fullwidth" },
      dataMenuPosition: { type: String, default: "fixed" },
      dataHeaderPosition: { type: String, default: "fixed" },
      iconOverlay: { type: String, default: "" },
      colorPrimaryRgb: { type: String, default: '92 , 56 , 166' },
      colorPrimary: { type: String, default: '100, 61, 179' },
      bodyBg1: { type: String, default: "" },
      bodyBg: { type: String, default: "" },
      darkBg: { type: String, default: "" },
      Light: { type: String, default: "" },
      inputBorder: { type: String, default: "" },
      bgImg: { type: String, default:"" },
      iconText: { type: String, default:"" },
      body:{
        class: { type: String, default:"" }
      },
      logoWhite: { type: String, default: "/images/logo.png" },
      logoDark: { type: String, default: "/images/logo-white.png" },
      logoIconWhite: { type: String, default: "/images/icon.png"},
      logoIconDark: { type: String, default: "/images/icon-white.png"},
      lastUpdated: { type: Date, default: new Date() },
    },

  },
  {
    timestamps: true,
  }
);

organizationSchema.set("collection", "organization");

organizationSchema.index({ "$**": "text" });

const Organization = mongoose.models.organization || mongoose.model("organization", organizationSchema);

export default Organization;
