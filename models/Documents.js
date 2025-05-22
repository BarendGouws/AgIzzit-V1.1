const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }, 
  completed: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  order: { // Order in which the signature should be signed, based on top position and page number
    type: Number,
    required: true
  },
  top: {
    type: Number,
    required: true,
  }, 
  left: {
    type: Number,
    required: true,
  },  
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  pageNumber: {
    type: Number,
    required: true, // Page where the signature should appear
  }, 
  
  clickedOn : Date,
  signedAt: Date,
  signature: String,  
  ipAddress: String,  
  device: {
    type: String, // Mobile or Tablet
    osVersion: String, 
    osName: String,
    browserVersion: String,
    browserName: String,
    mobileVendor: String,
    mobileModel: String,
    ua: String,
  }, 

});

const documentSchema = new mongoose.Schema({

  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  documentName: {
    type: String,
    required: true,
  },
  documentUrl: {
    type: String,
  },
  documentStatus: {
    type: String,
    enum: ['Draft', 'In Progress', 'Completed'],
    default: 'Draft',
  },
  restrictIP: {
    type: Boolean,
    default: false,
  },
  facialVerification: {
    type: Boolean,
    default: false,
  },

  fields: [{
    tag: String, 
    text: String,
    value: String,
    schema: String,
    dbKey: String,
    format: String,
    role: String, 
    filledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    filledAt: Date,
  }],

  signatures: [signatureSchema],

  completedOn: Date,
  documentSize: Number,

  auditTrail: [{    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'staff',
    },
    action: String,
    ipAddress: String,
    timestamp: {
      type: Date,
      default: Date.now(),
    }
  }]

},
  {
    timestamps: true,
});

documentSchema.set("collection", "documents");

documentSchema.index({ "$**": "text" });

const Documents = mongoose.models.documents || mongoose.model("documents", documentSchema);

export default Documents;