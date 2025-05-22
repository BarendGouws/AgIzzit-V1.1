import mongoose from 'mongoose';

const advertisingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    platform: {
      type: String,
      required: [true, 'Please select a platform'],
    },
    platformType: {
      type: String,
      required: [true, 'Please select a platform type'],
    },
    format: {
      type: String,
      required: [true, 'Please select a format'],
    },
    filters: {
      type: Object,
      default: {},
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdvertisingTemplate',
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'inactive'],
      default: 'active',
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inventory: [
      {
        url: String,
        success: Boolean,
        error: String,
        createdAt: Date,
        updatedAt: Date,
        listing: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Listing',
        },
      },
    ],
    feedUrl: {
      type: String,
    },
    fetchHistory: [{
      fetchedAt:   { type: Date,   default: Date.now },   // when the feed was requested
      requester:   { type: String, trim: true },          // “facebookexternalhit/1.1”, “AdsBot-Google”, …
      ip:          { type: String, trim: true },          // optional: remote IP
      statusCode:  { type: Number },                      // 200, 304, 500, …
      bytesSent:   { type: Number }                       // useful for bandwidth stats
    }]
  },
  {
    timestamps: true,
  }
);

advertisingSchema.index({ _id: 1, 'fetchHistory.fetchedAt': -1 },{ name: 'feed_fetch_history_recent' });
advertisingSchema.index({ "$**": "text" });

advertisingSchema.methods.recordFetch = async function ({ requester, ip, statusCode, bytesSent }) {
  this.fetchHistory.push({ requester, ip, statusCode, bytesSent });
  if (this.fetchHistory.length > 100) this.fetchHistory.shift();
  await this.save({ timestamps: false });  
};

advertisingSchema.set('collection', 'advertising');

const Advertising = mongoose.models.advertising || mongoose.model('advertising', advertisingSchema);

export default Advertising;

    