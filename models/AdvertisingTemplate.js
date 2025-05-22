// models/AdvertisingTemplate.js
import mongoose from 'mongoose';

const layerPropertiesSchema = new mongoose.Schema({
  // Common properties
  left: Number,
  top: Number,
  scaleX: Number,
  scaleY: Number,
  angle: Number,
  
  // Image/Design specific
  imageData: String,
  imageIndex: Number,
  width: Number,
  height: Number,
  
  // Text specific
  variable: String,
  text: String,
  fontFamily: String,
  color: String,
  textAlign: String,
  bold: Boolean,
  italic: Boolean,
  underline: Boolean,
  format: String, 

}, { _id: false });

const layerSchema = new mongoose.Schema({
    
  id: String,
  type: {
    type: String,
    enum: ['design', 'picture', 'image', 'text']
  },
  name: String,
  visible: Boolean,
  properties: layerPropertiesSchema

}, { _id: false });

const advertisingTemplateSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },
  designSize: {
    type: String,
    required: true,
    enum: ['1:1', '4:5', '9:16', '16:9']
  },
  layers: [layerSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

advertisingTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const AdvertisingTemplate = mongoose.models.AdvertisingTemplate || mongoose.model('AdvertisingTemplate', advertisingTemplateSchema);

export default AdvertisingTemplate;