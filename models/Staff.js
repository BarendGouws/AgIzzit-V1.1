import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true, 
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
    },
    emailVerifyToken: {
      type: String,
    },    
    accountNr: {
      type: String,
    },
    isTempPassword: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordChangedAt:{
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    }, 
    knownAs: {
      type: String, 
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    isInfoVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      required: true,
      default: "/images/user.png",
    }, 
    employeeNr: {
      type: String,
    },
    department: {
      type: String,
    },
    occupation: {
      type: String,
    },
    initials: {
      type: String,
    },
    firstName: {
      type: String,
    },
    middleName: {
      type: String,
    },
    surname: {
      type: String,
    },
    fullNames: {
      type: String,
    },
    idOrPassportNr: {
      type: String,
    },
    gender: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    nasionality: {
      type: String,
      default: "South Africa",
    },
    nasionalityCode: {
      type: String,
      default: "ZA",
    },
    phoneNrExt: {
      type: String,
      default: '+27',
    },
    phoneNr: {
      type: Number,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerifiedAt: {
      type: Date,
    },
    phoneNrVerifyToken: {
      type: String,
    },
    addressLine1: {
      type: String,
    },
    addressLine2: {
      type: String,
    },
    suburb: {
      type: String,
    },
    city: {
      type: String,
    },
    zip: {
      type: Number,
    },
    province: {
      type: String,
    },
    country: {
      type: String,
      required: true,
      default: "South Africa",
    },
    fullAddress: {
      type: String,
    },   
    //BANKING DETAILS
    bankAccountVerified: {
      type: Boolean,
      default: false,
    },
    bankAccountVerifiedOn: {
      type: Date,
    },
    bankName: {
      type: String,
    },
    bankAccountHolderName: {
      type: String,
    },
    bankAccountNr: {
      type: Number,
    },
    bankAccountType: {
      type: String,
    },
    branchCode: {
      type: Number,
    },
    bankAccountVerifications: {
      type: [
        {
          idNumber: String,
          initials: String,
          lastName: String,
          branchCode: String,
          accountOpen: String,
          accountType: String,
          captureDate: String,
          initialMatch: String,
          accountExists: String,
          accountNr: String,
          lastNameMatch: String,
          userReference: String,
          accountIdMatch: String,
          accountTypeValid: String,
          accountAcceptsDebits: String,
          transactionReference: String,
          accountAcceptsCredits: String,
          accountOpenGtThreeMonths: String,
          requestedOn: Date,
        },
      ],
      default: undefined,
    },  
    
    //EMPLOYMENT DETAILS
    privateEmail: {
      type: String,
    },
    privateEmailVerified: {
      type: Boolean,
      default: false,
    },
    privateEmailVerifiedAt: {
      type: Date,
    },
    privateEmailVerifyToken: {
      type: String,
    },
    privatePhoneNr: {
      type: Number,
    },
    privatePhoneNrExt: {
      type: String,
      default: '+27',
    },
    privatePhoneNrVerified: {
      type: Boolean,
      default: false,
    },
    privatePhoneNrVerifiedAt: {
      type: Date,
    },
    privatePhoneNrVerifyToken: {
      type: String,
    },
    nextOfkinName: {
      type: String,
    },
    nextOfkinCellNrExt: {
      type: String,
      default: '+27',
    },
    nextOfkinCellNr: {
      type: Number,
    },
    nextOfKinRelationship: {
      type: String,
    },
    nextOfKinAddress: {
      type: String,
    },    
    medicalAidProvider: {
      type: String,
    },
    medicalAidNr: {
      type: String,
    },   
    allergiesOrMedicalConditions: {
      type: [{ type: String}],
      default: undefined,
    },   

    startDate: {
      type: Date,
      default: new Date(),
    },
    endDate: {
      type: Date,
    },  
    
    //PAYROLL DETAILS
    isSalaryEarner: {        
      type: Boolean,
      default: false,
    },
    employmentType: {
      type: String,
      default: "Permanent",
    },
    payFrequency: {
      type: String,    
      default: "Monthly",  
    },       
 
    basic: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      default: 0,
    }, 
    getComission: {
      type: Boolean,
      default: false,
    },
    currentComission: {
      type: Number,
      default: 0,
    },
    

    //PROFILE VERIFICATION
    identityVerified: {
      type: Boolean,
      default: false,
    },
    identityVerifyToken: {
      type: String,
    },
    identityVerification: {
      stage: {
        type: Number,
        default: 1,
      },

      errorMsg: String,
      //STEP 1 == verify success response
      enrollment: mongoose.Schema.Types.Mixed,
      //STEP 2 == home affairs photo
      homeAffairs: mongoose.Schema.Types.Mixed,
      //STEP 3 == compare success response
      compare: mongoose.Schema.Types.Mixed,
    },

    documents: {
      type: [
        {
          documentType: String,
          documentUrl: String,
          actioned: {
            type: Boolean,
            required: true,
            default: false,
          },
          uploadedDate: {
            type: Date,
            required: true,
            default: new Date(),
          },
          accepted: {
            type: Boolean,
            default: false,
          },
          rejectedReason: {
            type: String,
          },
          validUntil: {
            type: Date,
          },
        },
      ],
      default: undefined,
    },
    consents: {
      type: [
        {
          consentType: {
            type: String,
            required: true,
          },
          dateOfConsent: {
            type: Date,
            required: true,
            default: new Date(),
          },
        },
      ],
      default: undefined,
    },
    loginHistory: [
      {
        loginDate: {
          type: Date,
          required: true,
          default: new Date(),
        },
        loginMethod: {
          type: String,
          required: true,
        },
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

    //EMPLOYEES  
    isAdmin: { type: Boolean, default: false },
    isDirector: { type: Boolean, default: false },
    isSalesman: { type: Boolean, default: false },

    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "locations",
    }, 
    doFinance: {
      type: Boolean,
      default: false,
    },
    limitRange: {
      type: Boolean,
      default: false,
    },
    upperRange: Number,
    lowerRange: Number,
    comissionStructure: {
      type: [
        {
          type: String,
          calculation: String,
        },
      ],
      default: undefined,
    },
    targets: {
      type: [
        {
          type: { type: String, required: true },
          calculation: { type: String, required: true },
        },
      ],
      default: undefined,
    },
    targetHistory: {
      type: [
        {
          date: { type: Date, required: true, default: new Date() },
          period: { type: String, required: true },
          targets: [
            {
              type: { type: String, required: true },
              calculation: { type: String, required: true },
            },
          ],
          reached: { type: Boolean, required: true, default: false },
        },
      ],
      default: undefined,
    },

    additionalFields: mongoose.Schema.Types.Mixed,

    changes: [{
      timestamp: {
       type: Date,
       default: new Date(),       
      },
      fieldId: String,
      fieldName: String,
      from: String,
      to: String,
      user: {
       type: mongoose.Types.ObjectId,
       ref: "staff",
     },
    }]    
  
  },
  {
    timestamps: true,
  }
);

staffSchema.set("collection", "staff");

staffSchema.index({ "$**": "text" });


const Staff = mongoose.models.staff || mongoose.model("staff", staffSchema);

export default Staff;

const calculateLeaveDefaults = (workDaysPerWeek) => {
  // Annual leave: 1.25 days per month for a 5-day week or 1.5 for a 6-day week
  const annualLeaveAmount = workDaysPerWeek === 6 ? 18 : 15;

  // Sick leave: Number of days equivalent to 6 weeks of work in a 36-month cycle
  const sickLeaveAmount = workDaysPerWeek * 6;

  // Family responsibility leave: 3 days per year
  const familyResponsibilityLeaveAmount = 3;

  return [
    {
      type: 'Annual',
      allocatedAt: 'Start of employment',
      amount: annualLeaveAmount,
      balance: annualLeaveAmount,
    },
    {
      type: 'Sick',
      allocatedAt: 'Start of employment',
      amount: sickLeaveAmount,
      balance: sickLeaveAmount,
    },
    {
      type: 'Family responsibility',
      allocatedAt: 'Start of employment',
      amount: familyResponsibilityLeaveAmount,
      balance: familyResponsibilityLeaveAmount,
    },
  ];
};
