import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import Organization from '@/models/Organization';
import Locations from '@/models/Locations';
import { listingBaseModel } from '@/models/Listings';
import {
  dealershipListing,
  propertyListing,
  goodsListing,
  rentalListing,
  accomodationListing,
  jobListing
} from '@/models/Listings';

const modelMap = {
  Dealership: dealershipListing,
  Property: propertyListing,
  Goods: goodsListing,
  Rentals: rentalListing,
  Accomodation: accomodationListing,
  Jobs: jobListing
};

const ignoredKeys = ['category',
  'location', 'createdBy', '__v', 'saleHistory', 'repDisplayHistory', 'changes','additionalInformation','favourites','viewHistory','shareHistory',
  'documents','videos', 'images','organization','flagExpire','auctions','driveType','doors','manufacturerWarrantyActive','manufacturerWarrantyDes',
  'manufacturerServicePlanActive','manufacturerServicePlanDes','manufacturerMaintenanceActive','manufacturerMaintenanceDes','financeExtras','cashExtras',
  'specificConditions','specificConditionsPublic','natisIsDealerStocked','natisDealerStockedDate','natisDealerStockScan','specifications',
  'axles','extras','allowOnlineOffers','autoRejectMinOffer','offers','isSold','soldAt','isUnavailable','isReserved','' ];

// Define which keys are usable as filters
const filterKeys = [
  'year', 'make', 'model', 'variant', 'mmCode',
  'fuelType', 'transmission', 'colour', 'mileage','hours',
  'condition', 'bodyType', 'price', 'isSold', 'onSpecial'
];

const extractSchemaKeys = (schema) => {
  const keys = [];


  Object.entries(schema.paths).forEach(([key]) => { 
    if (key.startsWith('_') || ignoredKeys.includes(key)) return;

    const readableName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    keys.push({
      id: key,
      fieldName: readableName,
      filter: filterKeys.includes(key)
    });
  });

  return keys;
};

const getMostCompleteListing = (listings) => {
  return listings.reduce((prev, curr) =>
    Object.keys(curr || {}).length > Object.keys(prev || {}).length ? curr : prev,
    {}
  );
};

const getValueByPath = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const generateSampleValue = (label) => {
  return `Sample ${label}`;
};

const handler = async (req, res) => {

  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token?.organization?._id) return res.status(401).json({ message: 'Unauthorized' });

    console.log('Token:', token);

    await db.connect();

    const baseListings = await listingBaseModel.find({ organization: token.organization._id }, 'category').lean();
    if (!baseListings.length) return res.status(200).json([]);

    const category = baseListings[0].category;
    const Model = modelMap[category] || listingBaseModel;

    const listings = await Model.find({ organization: token.organization._id, isSold: false, isUnavailable: false, isReserved: false })
      .populate({ path: 'organization' })
      .populate({ path: 'location' })
      .lean();

    const schemaFields = extractSchemaKeys(Model.schema);
    const bestSample = getMostCompleteListing(listings);

    const inventory = schemaFields.map(field => {
      let value = getValueByPath(bestSample, field.id);
      if (value === undefined || value === null) {
        value = generateSampleValue(field.fieldName);
      }
      return {
        ...field,
        value
      };
    });

    return res.status(200).json(inventory);

  } catch (err) {
    console.error('Inventory schema API error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default handler;
