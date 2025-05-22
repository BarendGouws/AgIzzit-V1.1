import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";   // npm i uuid

const trackingSchema = new mongoose.Schema(
  {
    /* ── organisational context ─────────────────────────────── */
    organization: { type: mongoose.Types.ObjectId, ref: "organization" },
    user:         { type: mongoose.Types.ObjectId, ref: "users"       },

    /* ── first-party browser identifiers ────────────────────── */
    anonymousId: {                           // set once in a SameSite cookie
      type: String,
      index: true,
    },
    cookieIds: {                             // ad-platform cookies (if present)
      fbp:     String,   // Meta browser ID
      fbc:     String,   // Meta click ID
      ga:      String,   // GA/GA4 client ID
      gclid:   String,   // Google click ID
      wbraid:  String,   // Google click ID (iOS)
      gbraid:  String,   // Google click ID (Android)
      msclkid: String,   // Microsoft click ID
      uetsid:  String,   // Microsoft UET session
      uetvid:  String,   // Microsoft UET visitor
      ttclid:  String,   // TikTok click ID
    },
    clickId: {           // optional extra structure if you want to keep it
      id:       String,  //   e.g. "123-456"
      provider: String,  //   "facebook" | "google" | "microsoft" | "tiktok"
    },


    ipAddress:       String,
    longitude:       Number,
    latitude:        Number,
    city:            String,
    region:          String,
    postal:          String,
    country:         String,
    isVpn:           Boolean,
    timezone:        String,
    connectionType:  String,
    ispName:         String,
    organizationName:String,


    platform: {
      type:           String,       
      osVersion:      String,
      osName:         String,
      browserVersion: String,
      browserName:    String,
      mobileVendor:   String,
      mobileModel:    String,
      ua:             String,
    },

    /* ── event core ─────────────────────────────────────────── */
    eventId: {                            // unique per hit → use in offline uploads
      type:    String,
      default: () => uuidv4(),
      index:   true,
    },
    event:     String,                    // page_view, purchase, etc.
    eventData: mongoose.Schema.Types.Mixed,

    /* Add conversionValue to track the value of conversions */
    conversionValue: {                    // monetary value associated with conversions
      type: Number,
      default: 0,                        // default value if not provided
    },

    referrerUrl: String,
    currentUrl:  String,


    marketingConsent: Boolean,
  },
  { timestamps: true }
);

trackingSchema.index({ "$**": "text" });

trackingSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 760 }   // 760 days ≈ 25 months
);

trackingSchema.set("collection", "tracking");

const Tracking =  mongoose.models.tracking || mongoose.model("tracking", trackingSchema);

export default Tracking;

