import mongoose from "mongoose";

const financeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "inventory",
    },

    //TRADEIN
    tradeInVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sellVehicles",
    },

    //TODO IS MORE EXPENSIVE SO LET DEALER PAY
    affordability: {
      type: [
        {
          organisation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organization",
          },
          expenses: Number,
          grossIncomeAmount: Number,
          calGrossIncomeAmount: Number,
          netIncomeAmount: Number,
          calNetIncomeAmount: Number,
          gmipValue: String,
          gmipConfidenceLevel: String,
          gmipBand: String,
          bureauExpenses: Number,
          calcLivingExpenses: Number,
          calcExpense: Number,
          disposable_Income: Number,
          enqId: String,
          requestedOn: Date,
        },
      ],
      default: undefined,
    },
    //STRUCTURE
    deposit: {
      type: Number,
      default: 0,
    },
    requestedTerm: {
      type: Number,
    },
    requestedInterestRateType: {
      type: String,
    },
    requestedInterestRate: {
      type: Number,
    },
    financeHousePrefrence: {
      type: String,
    },

    //PERSONAL
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
    },
    surname: {
      type: String,
      required: true,
    },
    idNumber: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    race: {
      type: String,
      required: true,
    },
    maritalStatus: {
      type: String,
      required: true,
    },
    martialContract: {
      type: String,
    },
    martialDate: {
      type: Date,
    },
    email: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
    },
    homeNumber: {
      type: Number,
    },
    workNumber: {
      type: Number,
    },
    residentialAddress: {
      type: String,
    },
    residentialAddress2: {
      type: String,
    },
    residentialSuburb: {
      type: String,
    },
    residentialCity: {
      type: String,
    },
    residentialZipCode: {
      type: String,
    },
    residentialPeriodYears: {
      type: Number,
    },
    residentialPeriodMonths: {
      type: Number,
    },
    postalAddress: {
      type: String,
    },
    postalSuburb: {
      type: String,
    },
    postalCity: {
      type: String,
    },
    postalZipCode: {
      type: String,
    },
    residentialStatus: {
      type: String,
    },
    residentialOwnsership: {
      type: String,
    },
    bondBalance: {
      type: Number,
    },
    purchaseValue: {
      type: Number,
    },
    bondViaBank: {
      type: String,
    },

    //EMPLOYER DETAILS

    presentEmployer: {
      type: String,
    },
    presentEmployerAddress: {
      type: String,
    },
    presentEmployerSuburb: {
      type: String,
    },
    presentEmployerCity: {
      type: String,
    },
    presentEmployerZipCode: {
      type: Number,
    },
    employmentType: {
      type: String,
    },

    occupation: {
      type: String,
    },
    industry: {
      type: String,
    },
    presentEmployerPeriodYears: {
      type: Number,
    },
    presentEmployerPeriodMonths: {
      type: Number,
    },

    //RELATIVE

    relativeName: {
      type: String,
    },
    relativeSurname: {
      type: String,
    },
    relativeMobileNumber: {
      type: Number,
    },
    relativeRelationship: {
      type: String,
    },
    relativeAddress: {
      type: String,
    },
    relativeSuburb: {
      type: String,
    },
    relativeCity: {
      type: String,
    },
    relativeZipCode: {
      type: String,
    },

    //BANKING

    bankName: {
      type: String,
    },
    branchCode: {
      type: Number,
    },
    bankAccountHolder: {
      type: String,
    },
    bankAccountNumber: {
      type: Number,
    },
    bankAccountType: {
      type: String,
    },

    //INCOME

    sourceOfIncome: {
      type: String,
    },
    grossMonthlyIncome: {
      type: Number,
    },
    monthlyComission: {
      type: Number,
    },
    carAllowance: {
      type: Number,
    },
    netMonthlyIncome: {
      type: Number,
    },
    otherIncome: {
      type: Number,
    },

    //EXPENSES

    bondRepayment: {
      type: Number,
    },
    rentPayment: {
      type: Number,
    },
    ratesElectWater: {
      type: Number,
    },
    vehicleInstallments: {
      type: Number,
    },
    personalLoanInstallments: {
      type: Number,
    },
    creditCard: {
      type: Number,
    },
    furniture: {
      type: Number,
    },
    clothing: {
      type: Number,
    },
    overdraft: {
      type: Number,
    },
    insurance: {
      type: Number,
    },
    telephone: {
      type: Number,
    },
    transport: {
      type: Number,
    },
    foodAndEntertainment: {
      type: Number,
    },
    education: {
      type: Number,
    },
    maintenance: {
      type: Number,
    },
    household: {
      type: Number,
    },
    payroll: {
      type: Number,
    },
    other: {
      type: Number,
    },

    documents: [
      {
        documentType: {
          type: String,
          required: true,
        },
        documentUrl: {
          type: String,
          required: true,
        },
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
        },
        rejectedReason: {
          type: String,
        },
        isValid: {
          type: Boolean,
          required: true,
          default: false,
        },
        validUntil: {
          type: Date,
        },
      },
    ],

    consents: [
      {
        consent: {
          type: String,
          required: true,
        },
        dateOfConsent: {
          type: Date,
          required: true,
          default: new Date(),
        },
      },
      {
        timestamps: true,
      },
    ],

    //INTERNAL
    submitted: {
      type: Boolean,
      default: false,
    },
    submittedDate: {
      type: Date,
    },
    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    leadStatus: {
      type: String,
      default: "Unread",
    },
    isActioned: {
      type: Boolean,
      default: false,
    },
    actionedDate: {
      type: Date,
    },
    warrantyAmount: {
      type: Number,
      required: true,
    },
    warrantyDescription: {
      type: String,
      required: true,
    },
    warrantyPackageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "warranties",
    },
    extras: [
      //convert to link to extras schema
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        exVat: { type: Number, required: true },
        vat: { type: Number, required: true },
      },
    ],

    banks: [
      {
        bankName: {
          type: String,
          required: true,
        },
        isApproved: {
          type: Boolean,
          required: true,
        },
        approvedRate: {
          type: Number,
          required: true,
        },
        approvedRateType: {
          type: String,
          required: true,
        },
        isValidated: {
          type: Boolean,
          default: false,
        },
        isTakenUp: {
          type: Boolean,
          default: false,
        },
        takenUpDate: {
          type: Date,
        },
      },
    ],

    isConverted: {
      type: Boolean,
      default: false,
    },

    purchased: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "purchases",
    },

    comments: [
      {
        timestamp: { type: Date, default: new Date() },
        comment: { type: String, required: true },
        view: { type: Boolean, default: true },
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

financeSchema.set("collection", "finances");

financeSchema.index({ "$**": "text" });

const Finance =
  mongoose.models.finances || mongoose.model("finances", financeSchema);

export default Finance;
