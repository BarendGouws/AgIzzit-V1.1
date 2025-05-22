import Organization from "@/models/Organization";
import Locations from "@/models/Locations";
import colors from "colors";
import axios from 'axios'
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';

const handler = async (req, res) => { 

  try {

          if(req.method === "PUT") {

        const token = await getToken({ req, secret: process.env.JWT_SECRET });
        
        if (!token?.organization?._id)  return res.status(401).json({ message: 'Unauthorized' });
        
        await db.connect();

        let updatedLocation = req.body;

        if (!updatedLocation._id) return res.status(400).json({ message: "Location _id is required for updating." });

        // Filter unique public holidays
        if (updatedLocation.publicHolidays && Array.isArray(updatedLocation.publicHolidays)) {
         updatedLocation.publicHolidays = filterUniquePublicHolidays(updatedLocation.publicHolidays);
        }

        // Validate and recheck the address if it has changed
        const existingLocation = await Locations.findById(updatedLocation._id);
        if (!existingLocation) return res.status(404).json({ message: "Location not found" });

        const addressChanged =
        updatedLocation.addressLine1 !== existingLocation.addressLine1 ||
        updatedLocation.city !== existingLocation.city ||
        updatedLocation.zip !== existingLocation.zip ||
        updatedLocation.province !== existingLocation.province ||
        updatedLocation.country !== existingLocation.country;

        if (addressChanged) {

        const encodedAddress = encodeURIComponent(`${updatedLocation.addressLine1}, ${updatedLocation.city}, ${updatedLocation.zip}, ${updatedLocation.province}, ${updatedLocation.country}`);

        const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

        // Call the Google Maps Geocoding API
        const geocodeResponse = await axios.get(geocodingUrl);
        const geocodeData = geocodeResponse.data;

        console.log(geocodeData)

        if (geocodeData.status !== "OK") return res.status(400).json({ message: "Address validation failed with Google Maps API" });

        // Extract the necessary data from the API response
        const result = geocodeData.results[0];
        const formattedAddress = result.formatted_address;
        const latitude = result.geometry.location.lat;
        const longitude = result.geometry.location.lng;
        const placeId = result.place_id;
        const placeUrl = `https://maps.google.com/?q=loc:${latitude},${longitude}&cid=${placeId}`;
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

        // Extract address components from the result
        const components = result.address_components;

        let streetNumber = "";
        let route = "";
        let suburb = updatedLocation.suburb;
        let city = updatedLocation.city;
        let province = updatedLocation.province;
        let country = updatedLocation.country;
        let countryCode = updatedLocation.countryCode;
        let zip = updatedLocation.zip;

        components.forEach((component) => {
            const types = component.types;
            if (types.includes("street_number")) {
            streetNumber = component.long_name;
            }
            if (types.includes("route")) {
            route = component.long_name;
            }
            if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
            suburb = component.long_name;
            }
            if (types.includes("locality")) {
            city = component.long_name;
            }
            if (types.includes("administrative_area_level_1")) {
            province = component.long_name;
            }
            if (types.includes("country")) {
            country = component.long_name;
            countryCode = component.short_name;
            }
            if (types.includes("postal_code")) {
            zip = component.long_name;
            }
        });

        // Overwrite the user's data with validated data
        updatedLocation = {
            ...updatedLocation,
            formattedAddress,
            addressLine1: `${streetNumber} ${route}`.trim() || updatedLocation.addressLine1,
            suburb,
            city,
            province,
            country,
            countryCode,
            zip,
            latitude,
            longitude,
            placesId: placeId,
            placeUrl,
            directionsUrl,
        };

        }

        // Ensure only one head office
        if (updatedLocation.isHeadOffice) {
        await Locations.updateMany({ _id: { $ne: updatedLocation._id }, organization: token.organization._id },{ $set: { isHeadOffice: false } });
        }

        const location = await Locations.findByIdAndUpdate(updatedLocation._id, updatedLocation, {new: true});

        if (!location) return res.status(400).json({ message: "Error updating location" });

        // Ensure there's a head office
        const headOfficeExists = await Locations.findOne({organization: token.organization._id,isHeadOffice: true});

        if (!headOfficeExists) {
        const oldestLocation = await Locations.findOne({ organization: token.organization._id }).sort({activeDate: 1});
        if (oldestLocation) await Locations.findByIdAndUpdate(oldestLocation._id, { isHeadOffice: true });
        }

        const organization = await Organization.findById(token.organization._id)
        .populate({ path: "locations" })
        .populate({ path: "timeline.staff", select: "fullNames profileImage" })
        .populate({ path: "changes.changedBy", select: "fullNames" });

        res.status(200).json({ organization, message: "Location updated successfully!" });

    }else if(req.method === "POST"){

        const token = await getToken({ req, secret: process.env.JWT_SECRET });
        if (!token?.organization?._id) return res.status(401).json({ message: 'Unauthorized' });
        
        await db.connect();

        let location = req.body;
       
        if (location.publicHolidays && Array.isArray(location.publicHolidays)) {
            location.publicHolidays = filterUniquePublicHolidays(location.publicHolidays);
        }

        // Construct the full address from user input
        const addressComponents = [
            location.addressLine1,
            location.addressLine2,
            location.suburb,
            location.city,
            location.province,
            location.country,
            location.zip,
        ].filter(Boolean); // Filter out any empty strings or undefined values

        const fullAddress = addressComponents.join(', ');

        // Encode the address for the API request
        const encodedAddress = encodeURIComponent(fullAddress);

        // Build the Google Maps Geocoding API URL
        const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Ensure this is set in your environment variables
        const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

        // Call the Google Maps Geocoding API
        const geocodeResponse = await axios.get(geocodingUrl);
        const geocodeData = geocodeResponse.data;

        if (geocodeData.status !== 'OK') return res.status(400).json({ message: 'Address validation failed with Google Maps API' });

        // Extract the necessary data from the API response
        const result = geocodeData.results[0];

        const formattedAddress = result.formatted_address;
        const latitude = result.geometry.location.lat;
        const longitude = result.geometry.location.lng;
        const placeId = result.place_id;
        const placeUrl = `https://maps.google.com/?q=loc:${latitude},${longitude}&cid=${placeId}`;
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

        // Extract address components from the result
        const components = result.address_components;

        let streetNumber = '';
        let route = '';
        let suburb = location.suburb;
        let city = location.city;
        let province = location.province;
        let country = location.country;
        let countryCode = location.countryCode;
        let zip = location.zip;

        components.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) {
            streetNumber = component.long_name;
            }
            if (types.includes('route')) {
            route = component.long_name;
            }
            if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
            suburb = component.long_name;
            }
            if (types.includes('locality')) {
            city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
            province = component.long_name;
            }
            if (types.includes('country')) {
            country = component.long_name;
            countryCode = component.short_name;
            }
            if (types.includes('postal_code')) {
            zip = component.long_name;
            }
        });

        // Overwrite the user's data with validated data
        location = {
            ...location,
            formattedAddress,
            addressLine1: `${streetNumber} ${route}`.trim() || location.addressLine1,
            suburb,
            city,
            province,
            country,
            countryCode,
            zip,
            latitude,
            longitude,
            placesId: placeId,
            placeUrl,
            directionsUrl,
        };

        // Create and save the new location
        const newLocation = new Locations({...location, organization: token.organization._id });

        const createdLocation = await newLocation.save();

        if (!createdLocation) return res.status(400).json({ message: 'Error creating location' });

        // Update the organization's locations array
        const organization = await Organization.findByIdAndUpdate(token.organization._id, { $push: { locations: createdLocation._id } },{ new: true })
            .populate({ path: 'locations' })
            .populate({ path: 'timeline.staff', select: 'fullNames profileImage' })
            .populate({ path: 'changes.changedBy', select: 'fullNames' });

        res.status(200).json({ organization, message: "Location created successfully!" });        

    }else{
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) { console.log(error)
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/organization/locations")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    res.status(500).send({ message: "Internal Server Error" });
  }

};

export default handler;

function filterUniquePublicHolidays(publicHolidays) {
    const uniqueHolidays = [];
    const seenDates = new Set();
  
    publicHolidays.forEach(holiday => {
      const holidayDate = new Date(holiday.holidayDate).toISOString(); // Normalize date format
      if (!seenDates.has(holidayDate)) {
        uniqueHolidays.push(holiday);
        seenDates.add(holidayDate);
      }
    });
  
    return uniqueHolidays;
}
