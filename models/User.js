import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
    emailVerifyToken: {
      type: String,
    },
    registrationMethodforEmail: {
      type: String,    
    },
    accountNr: {
      type: String,
    },
    password: {
      type: String,
    },
    knownAs: {
      type: String, 
    },
    isSuspended: {
      type: Boolean,
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      required: true,
      default: "/images/avatars/01.png",
    },
    type: {
      type: String,
    },
    title: {
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
    },
    phoneNr: {
      type: Number,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
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
    countryCode: String,

    fullAddress: {
      type: String,
    },

    isFICACompliant: {
      type: Boolean,
      default: false,
    },
    //BUSINESS
    isBuiness: {
      type: Boolean,
    },
    businessName: {
      type: String,
    },
    businessRegistrationNr: {
      type: String,
    },
    businessVerified: {
      type: {
        //STEP 1
        CommercialID: String,
        RegistrationNo: String,
        businessname: String,
        enquiryID: String,
        enquiryResultID: String,
        //STEP 2
        displayText: String,
        commercialName: String,
        registrationNo: String,
        businessStartDate: Date,
        financialYearEnd: String,
        registrationNoOld: String,
        commercialStatus: String,
        commercialType: String,
        sic: String,
        taxNo: String,
        referenceNo: String,
        externalReference: String,
        tradeName: String,
        previousBussName: String,
        physicalAddress: String,
        postalAddress: String,
        registrationDate: Date,
        businessDesc: String,
        telephoneNo: String,
        bussEmail: String,
        bussWebsite: String,
        nameChangeDate: Date,
        ageofBusiness: String,
        registrationNoConverted: String,
        commercialStatusDate: Date,
        directorCount: Number,
        vatNo: Number,
        verified: Boolean,
        directorInformation: [
          {
            displayText: String,
            directorID: String,
            idNo: String,
            firstName: String,
            initials: String,
            surname: String,
            secondName: String,
            birthDate: Date,
            directorStatusCode: String,
            appointmentDate: Date,
            designation: String,
            memberSize: String,
            memberControlPerc: String,
            directorIndicator: String,
            principalType: String,
            cm29Date: Date,
            isRSAResident: String,
            countryCode: String,
            isIDVerified: String,
            isCIPROConfirmed: String,
            physicalAddress: String,
            postalAddress: String,
            name: String,
            homeTelephoneNo: String,
            workTelephoneNo: String,
            cellularNo: String,
            emailAddress: String,
            age: String,
            yearsWithBusiness: String,
            fullname: String,
            surnamePrevious: String,
            directorStatusDate: Date,
            memberControlType: String,
            executor: String,
            executorAppointmentDate: Date,
            estate: String,
            resignationDate: Date,
            verified: Boolean,
            verifiedToken: String,
          },
        ],
      },
      default: undefined,
    },
    businessVatNr: {
      type: Number,
    },
    //BANKING DETAILS
    bankAccountVierified: {
      type: Boolean,
      default: false,
    },
    bankAccountVierifiedOn: {
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

    //CREDIT SCORES
    creditProfile: {
      isBlocked: {
        type: Boolean,
        default: false,
      },
      blockedUntill: {
        type: Date,
      },
      profileHistory: {
        type: [
          {
            resultType: {
              type: String,
              required: true,
            },
            score: {
              type: Number,
              required: true,
            },
            reasons: [
              {
                reasonCode: {
                  type: String,
                  required: true,
                },
                reasonDescription: {
                  type: String,
                  required: true,
                },
              },
            ],
            requestedOn: {
              type: Date,
            },
          },
        ],
        default: undefined,
      },
    },
    kyc: {
      enquiryId: String,
      dateCreated: Date,
      matchData: {
        identityNumber: String,
        identityType: String,
        forename1: String,
        forename2: String,
        forename3: String,
        surname: String,
        dateOfBirth: Date,
        verified: Boolean,
        dateVerified: Date,
        deceased: Boolean,
        deceasedDate: Date,
      },
      addresses: [
        {
          line1: String,
          line2: String,
          line3: String,
          line4: String,
          postalCode: Number,
          addressType: String,
          addressTypeDescription: String,
          firstDateCreated: Date,
          lastDateUpdated: Date,
          numberOfSources: Number,
          addressSources: [
            {
              subscriberCode: String,
              subscriberName: String,
              firstDateCreated: Date,
              lastDateUpdated: Date,
            },
          ],
        },
      ],
      employment: [
        {
          empName: String,
          occupation: String,
          firstDateCreated: Date,
          lastDateUpdated: Date,
          numberOfSources: Number,
          employmentSources: [
            {
              subscriberCode: String,
              subscriberName: String,
              firstDateCreated: Date,
              lastDateUpdated: Date,
            },
          ],
        },
      ],
      contract: [
        {
          contactNumber: Number,
          areaCode: Number,
          countryCode: Number,
          contactType: String,
          contactTypeDescription: String,
          firstDateCreated: Date,
          lastDateUpdated: Date,
          numberOfSources: Number,
          contactSources: [
            {
              subscriberCode: String,
              subscriberName: String,
              firstDateCreated: Date,
              lastDateUpdated: Date,
            },
          ],
        },
      ],
    },

    driversVerified: {
      type: Boolean,
      default: false,
    },

    driversVerfication: mongoose.Schema.Types.Mixed,

    //PROFILE VERIFICATION
    verified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: String,
    },
    verification: {
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
    viewHistory: [
      {
        timestamp: {
          type: Date,
          required: true,
          default: new Date(),
        },
        inventory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "inventory",
        },
      },
    ],
    notificationSettings: {
      newArrivals: {
        type: Boolean,
        default: true,
      },
      specialOffers: {
        type: Boolean,
        default: true,
      },
      priceDrops: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: false,
      },
      whatsapp: {
        type: Boolean,
        default: true,
      },
    },
    favourites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "listings",
      },
    ],
    vehicles: [
      {
        vehicle: {
          type: mongoose.Types.ObjectId,
          ref: "purchases",
        },

        category: String,
        subcategory: String,
        year: Number,
        make: String,
        model: String,
        variant: String,
        mmCode: String,
        vinNr: String,
        engineNr: String,
        colour: String,
        regNr: String,
        mileage: Number,
        fuelType: String,
        transmission: String,
        licenseExpiry: Date,
      },
    ],

    //EMPLOYEES
    isAdmin: Boolean,
    isDirector: Boolean,
    isSalesman: Boolean,

    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "locations",
    },
    position: {
      type: String,
    },
    profileImage: {
      type: String,
      default: "/images/avatars/01.png",
    },
    doFinance: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
  }
);

userSchema.set("collection", "users");

userSchema.index({ "$**": "text" });

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;
