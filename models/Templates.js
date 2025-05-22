const mongoose = require("mongoose");

const placeholderSchema = new mongoose.Schema({
  role: { type: String, required: true },
  type: { type: String, required: true },
  top: { type: Number, required: true },
  left: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  pageNumber: { type: Number, required: true }
});

const templatesSchema = new mongoose.Schema({

    organization: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
    },  
    templateUrl: {
      type: String,
      required: true,
    }, 
    fileUrl: {
      type: String,
      required: true,
    },        
    name: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    }, 
    restrictIP: {
      type: Boolean,
      default: false,
    },
    facialVerification: {
      type: Boolean,
      default: false,
    },
    fields: [
      {
        tag: String,
        text: String,
        schema: String,
        dbKey: String,
        format: {
          type: String,
          default: "TitleCase",
        },
        role: {
          type: String,
          default: "Recipient",
        },        
      },
    ],
    placeholders: [placeholderSchema],

    vector: {
      type: Array,
      required: true,
    },

    timesUsed: {
      type: Number,
      default: 0,
    },

},{timestamps: true });

templatesSchema.set("collection", "templates");

templatesSchema.index({ "$**": "text" });

const Templates = mongoose.models.templates || mongoose.model("templates", templatesSchema);

export default Templates;
