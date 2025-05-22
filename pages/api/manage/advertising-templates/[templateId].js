import AdvertisingTemplate from "@/models/AdvertisingTemplate";
import { listingBaseModel } from "@/models/Listings";
import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';

const fieldFormatting = {
  Dealership: [
    {
      key: 'price',
      label: 'Price',
      formatting: [
        "`R ${Number(price).toFixed(0)}`",
        "`R ${Number(price).toFixed(2)}`",
        "`R ${Number(price).toLocaleString('en-ZA')}`",
        "`R ${Number(Number(Number(price))/1000).toFixed(0)} k`"          
      ]
    },
    {
      key: 'mileage',
      label: 'Mileage',
      formatting: [           
        "`${Number(mileage).toFixed(0)} km`",
        "`${Number(mileage).toFixed(2)} km`",
        "`${Number(mileage).toLocaleString('en-ZA')} km`",
        "`${Number(Number(Number(mileage))/1000).toFixed(0)} k km`"              
      ]
    },
    {
      key: 'year',
      label: 'Year',
      formatting: [
        "`${year}`"
      ]
    },
    {
      key: 'make',
      label: 'Make',
      formatting: [
        "`${make}`"
      ]
    },
    {
      key: 'model',
      label: 'Model',
      formatting: [
        "`${model}`"
      ]
    },
    {
      key: 'stockNr',
      label: 'Stock Number',
      formatting: [
        "`${stockNr}`",
        "`Stock #${stockNr}`"
      ]
    },
    {
      key: 'fuelType',
      label: 'Fuel Type',
      formatting: [
        "`${fuelType}`"
      ]
    },
    {
      key: 'transmission',
      label: 'Transmission',
      formatting: [
        "`${transmission}`"
      ]
    },
    {
      key: 'colour',
      label: 'Color',
      formatting: [
        "`${colour}`"
      ]
    }
  ],
  Property: [
    {
      key: 'price',
      label: 'Price',
      formatting: [
        "`R ${Number(price).toFixed(0)}`",
        "`R ${Number(price).toFixed(2)}`",
        "`R ${Number(price).toLocaleString('en-ZA')}`",
        "`R ${Number(Number(Number(price))/1000).toFixed(0)} k`",
        "`R ${Number(Number(Number(price))/1000000).toFixed(1)} m`"
      ]
    },
    {
      key: 'rental',
      label: 'Rental',
      formatting: [
        "`R ${Number(rental).toFixed(0)}/month`",
        "`R ${Number(rental).toLocaleString('en-ZA')}/month`"
      ]
    },
    {
      key: 'bedrooms',
      label: 'Bedrooms',
      formatting: [
        "`${bedrooms} Bedroom${bedrooms !== 1 ? 's' : ''}`",
        "`${bedrooms} Bed${bedrooms !== 1 ? 's' : ''}`"
      ]
    },
    {
      key: 'bathrooms',
      label: 'Bathrooms',
      formatting: [
        "`${bathrooms} Bathroom${bathrooms !== 1 ? 's' : ''}`",
        "`${bathrooms} Bath${bathrooms !== 1 ? 's' : ''}`"
      ]
    },
    {
      key: 'garages',
      label: 'Garages',
      formatting: [
        "`${garages} Garage${garages !== 1 ? 's' : ''}`"
      ]
    },
    {
      key: 'propertyType',
      label: 'Property Type',
      formatting: [
        "`${propertyType}`"
      ]
    },
    {
      key: 'erfSize',
      label: 'Erf Size',
      formatting: [
        "`${erfSize} m²`",
        "`${erfSize} sqm`"
      ]
    },
    {
      key: 'floorSize',
      label: 'Floor Size',
      formatting: [
        "`${floorSize} m²`",
        "`${floorSize} sqm`"
      ]
    }
  ],
  Goods: [
    {
      key: 'price',
      label: 'Price',
      formatting: [
        "`R ${Number(price).toFixed(0)}`",
        "`R ${Number(price).toFixed(2)}`",
        "`R ${Number(price).toLocaleString('en-ZA')}`"
      ]
    },
    {
      key: 'brand',
      label: 'Brand',
      formatting: [
        "`${brand}`"
      ]
    },
    {
      key: 'model',
      label: 'Model',
      formatting: [
        "`${model}`"
      ]
    },
    {
      key: 'condition',
      label: 'Condition',
      formatting: [
        "`${condition}`"
      ]
    }
  ],
  Rentals: [
    {
      key: 'rentalRate',
      label: 'Rental Rate',
      formatting: [
        "`R ${Number(rentalRate).toFixed(0)}/${rentalPeriod}`",
        "`R ${Number(rentalRate).toLocaleString('en-ZA')}/${rentalPeriod}`"
      ]
    },
    {
      key: 'depositRequired',
      label: 'Deposit',
      formatting: [
        "`R ${Number(depositRequired).toFixed(0)}`",
        "`R ${Number(depositRequired).toLocaleString('en-ZA')}`"
      ]
    },
    {
      key: 'rentalType',
      label: 'Rental Type',
      formatting: [
        "`${rentalType}`"
      ]
    }
  ],
  Accomodation: [
    {
      key: 'rentalRate',
      label: 'Rental Rate',
      formatting: [
        "`R ${Number(rentalRate).toFixed(0)}/${rentalPeriod}`",
        "`R ${Number(rentalRate).toLocaleString('en-ZA')}/${rentalPeriod}`"
      ]
    },
    {
      key: 'depositRequired',
      label: 'Deposit',
      formatting: [
        "`R ${Number(depositRequired).toFixed(0)}`",
        "`R ${Number(depositRequired).toLocaleString('en-ZA')}`"
      ]
    }
  ],
  Jobs: [
    {
      key: 'title',
      label: 'Job Title',
      formatting: [
        "`${title}`"
      ]
    },
    {
      key: 'positionType',
      label: 'Position Type',
      formatting: [
        "`${positionType}`"
      ]
    },
    {
      key: 'company',
      label: 'Company',
      formatting: [
        "`${company}`"
      ]
    },
    {
      key: 'salaryRange',
      label: 'Salary Range',
      formatting: [
        "`${salaryRange}`"
      ]
    }
  ]
};

const handler = async (req, res) => {
  try {
    if (req.method === "GET") {
      const token = await getToken({ req, secret: process.env.JWT_SECRET }); 
      if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }

      await db.connect();
      const { templateId } = req.query;
      
      // Handle new template
      if (templateId === "new") {

        const orgType = token.organization?.type;        

        if (!fieldFormatting[orgType]) {
          return res.status(400).json({ message: `No formatting available for organization type: ${orgType}` });
        }

        let query = {
          organization: token.organization._id,
          'images.0': { $exists: true }, // Ensure there's at least one image
          fullDescription: { $exists: true, $ne: "" } // Ensure description exists and isn't empty
        };
        
        // Find listing with longest description
        const inventory = await listingBaseModel.find(query).sort({ 'fullDescription': -1 }).limit(1);        

        if (!inventory || inventory.length === 0) {
          return res.status(500).json({ message: "No listings with images and description found" });
        }
        
        // Use the first listing
        const listing = inventory[0].toObject();
        
        // Extract images
        const images = listing.images.map(img => img.url);
        
        // Build texts object with all relevant fields
        const texts = {};
        
        // Add each field from the formatting options to the texts object
        for (const option of fieldFormatting[orgType]) {
          const { key, label, formatting } = option;
          if (listing[key] !== undefined && listing[key] !== null) {
            texts[key] = {
              value: listing[key],
              label: label,
              formatting: formatting.map(format => {
                try {
                  // Use Function constructor to create dynamic template strings
                  const value = listing[key];
                  const func = new Function(key, `return ${format}`);
                  return {
                    result: func(value),
                    format: format
                  };
                } catch (error) {
                  return {
                    result: `Error formatting ${key}`,
                    format: format
                  };
                }
              })
            };
          }
        }
        
        // Add description
        texts.fullDescription = {
          value: listing.fullDescription,
          label: 'Full Description',
          formatting: [{
            result: listing.fullDescription,
            format: "`${fullDescription}`"
          }]
        };
        
        return res.json({
          template: { 
            name: '', 
            designSize: "1:1", 
            layers: [] 
          },
          aspectRatio: '4:3',
          images: images,
          texts: texts
        });
      }

      // Handle existing template
      const template = await AdvertisingTemplate.findById(templateId);
      
      if (template) {
        // Get organization type
        const orgType = token.organization?.type;        

        if (!fieldFormatting[orgType]) {
          return res.status(400).json({ message: `No formatting available for organization type: ${orgType}` });
        }
        
        // Set up query with organization filter and requirements
        let query = {
          organization: token.organization._id,
          'images.0': { $exists: true }, // Ensure there's at least one image
          fullDescription: { $exists: true, $ne: "" } // Ensure description exists and isn't empty
        };
        
        // Find listing with longest description
        const inventory = await listingBaseModel.find(query)
          .sort({ 'fullDescription': -1 })
          .limit(1);
        
        // If no listings found, return error
        if (!inventory || inventory.length === 0) {
          return res.status(500).json({ message: "No listings with images and description found" });
        }
        
        // Use the first listing
        const listing = inventory[0].toObject();
        
        // Extract images
        const images = listing.images.map(img => img.url);
        
        // Build texts object with all relevant fields
        const texts = {};
        
        // Add each field from the formatting options to the texts object
        for (const option of fieldFormatting[orgType]) {
          const { key, label, formatting } = option;
          if (listing[key] !== undefined && listing[key] !== null) {
            texts[key] = {
              value: listing[key],
              label: label,
              formatting: formatting.map(format => {
                try {
                  // Use Function constructor to create dynamic template strings
                  const value = listing[key];
                  const func = new Function(key, `return ${format}`);
                  return {
                    result: func(value),
                    format: format
                  };
                } catch (error) {
                  return {
                    result: `Error formatting ${key}`,
                    format: format
                  };
                }
              })
            };
          }
        }
        
        // Add description
        texts.fullDescription = {
          value: listing.fullDescription,
          label: 'Description',
          formatting: [{
            result: listing.fullDescription,
            format: "`${fullDescription}`"
          }]
        };
        
        return res.json({
          template,
          aspectRatio: '4:3',
          images: images,
          texts: texts
        });
      }

      res.status(404).json({ msg: "Advertising template not found." });

    } else if (req.method === "PUT") {
      const token = await getToken({ req, secret: process.env.JWT_SECRET });
      if (!token) return res.status(401).json({ msg: "Unauthorized" });
     
      await db.connect();    
      const { templateId } = req.query;
      const template = await AdvertisingTemplate.findByIdAndUpdate(templateId, req.body, { new: true });

      // Get organization type
      const orgType = token.organization?.type   
      
      // Check if formatting exists for this organization type
      if (!fieldFormatting[orgType]) {
        return res.status(400).json({ message: `No formatting available for organization type: ${orgType}` });
      }
      
      // Set up query with organization filter and requirements
      let query = {
        organization: token.organization._id,
        'images.0': { $exists: true }, // Ensure there's at least one image
        fullDescription: { $exists: true, $ne: "" } // Ensure description exists and isn't empty
      };
      
      // Find listing with longest description
      const inventory = await listingBaseModel.find(query)
        .sort({ 'fullDescription': -1 })
        .limit(1);
      
      // If no listings found, return error
      if (!inventory || inventory.length === 0) {
        return res.status(500).json({ message: "No listings with images and description found" });
      }
      
      // Use the first listing
      const listing = inventory[0].toObject();
      
      // Extract images
      const images = listing.images.map(img => img.url);
      
      // Build texts object with all relevant fields
      const texts = {};
      
      // Add each field from the formatting options to the texts object
      for (const option of fieldFormatting[orgType]) {
        const { key, label, formatting } = option;
        if (listing[key] !== undefined && listing[key] !== null) {
          texts[key] = {
            value: listing[key],
            label: label,
            formatting: formatting.map(format => {
              try {
                // Use Function constructor to create dynamic template strings
                const value = listing[key];
                const func = new Function(key, `return ${format}`);
                return {
                  result: func(value),
                  format: format
                };
              } catch (error) {
                return {
                  result: `Error formatting ${key}`,
                  format: format
                };
              }
            })
          };
        }
      }
      
      // Add description
      texts.fullDescription = {
        value: listing.fullDescription,
        label: 'Description',
        formatting: [{
          result: listing.fullDescription,
          format: "`${fullDescription}`"
        }]
      };

      res.status(200).json({
        template,
        aspectRatio: '4:3',
        images: images,
        texts: texts,
        message: "Advertising template updated"
      });

    } else if (req.method === "DELETE") {
      const token = await getToken({ req, secret: process.env.JWT_SECRET });
      if (!token) return res.status(401).json({ msg: "Unauthorized" });
     
      await db.connect();    
      const { templateId } = req.query;
      await AdvertisingTemplate.findByIdAndDelete(templateId);

      res.status(202).json({ message: "Advertising template deleted" });

    } else {
      res.status(405).send({ message: "Method not allowed" });
    }

  } catch (error) {
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/advertising-templates/:id")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default handler;