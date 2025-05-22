import Organization from "@/models/Organization";
import Locations from "@/models/Locations";
import Extras from "@/models/Extras";
import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';

const handler = async (req, res) => { 

  try {

    if(req.method === "GET"){
      
      const token = await getToken({ req, secret: process.env.JWT_SECRET });
  
      if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }
  
      if(!token?.organization?._id) return res.status(401).json({ message: 'Unauthorized' });
  
      await db.connect();
      
      const [organization, extras] = await Promise.all([
          Organization.findById(token.organization._id)
              .populate({ path: 'locations'})
              .populate({ path: 'timeline.staff', select: 'fullNames profileImage' })
              .populate({ path: 'changes.changedBy', select: 'fullNames' }),
          Extras.find({ organization: token.organization._id })
              .populate({ path: 'addedBy', select: 'fullNames' })
      ]);
  
      if(organization?.companyVerified) {
          return res.json({ 
              organization: organization,
              extras: extras 
          });
      }
  
      const message = "Your company is not verified. Please verify your company to access all features.";
  
      if (organization) {
          return res.json({
              organization: organization,
              extras: extras,
              message: message,
          });
      }
  
      res.status(404).json({ msg: "Organization not found." });
    }else if(req.method === "PUT"){

      const token = await getToken({ req, secret: process.env.JWT_SECRET });
      if (!token?.organization?._id) return res.status(401).json({ message: 'Unauthorized' });
     
      await db.connect();

      const currentOrg = await Organization.findById(token.organization._id).lean();
      if (!currentOrg) return res.status(404).json({ message: 'Organization not found' });
     
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      const ignoreKeys = [        
        '__v',
        'updatedAt',
        'createdAt',
        'locations',
        'directors',
        'consents',
        'timeline',          
        'changes',
        'bankAccounts',        
        '_id',   
        'logoLastUpdated',
        'vatNumberVerifiedAt',
        'vatNumberVerifiedByName',
        'vatNumberVerifiedByEmail',
        'websiteUrlVerifiedAt',
        'tradingNameVerifiedAt',
        'registeredBy'
      ];
     
      const changes = compareObjects(currentOrg, data, {
        ignoreKeys: ignoreKeys,
        formatValue: formatValue,
        getFieldName: getFieldName,
        changedBy: token._id
      });
      
      // Remove changes from data to avoid conflict
      const { changes: _, ...updateData } = data;  
      
      const updatedOrg = await Organization.findOneAndUpdate(
        { _id: token.organization._id },
        {
          ...updateData,
          $push: {
            changes: {
              $each: changes,
              $position: 0
            }
          }
        },
        { 
          new: true,
          populate: [
            { path: 'locations' },
            { path: 'timeline.staff', select: 'fullNames profileImage' },
            { path: 'changes.changedBy', select: 'fullNames' }
          ]
        }
      );
     
      res.status(200).json({ organization: updatedOrg, message: "Profile updated successfully!"});

    }else{
      res.status(405).json({ msg: "Method Not Allowed" });
    }

  } catch (error) { console.log(error)
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/organization/")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    res.status(500).send({ message: "Internal Server Error" });
  }

};

export default handler;

//HELPER FUNCTIONS
const formatValue = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "None";
  }

  if (typeof value === "boolean" || value === "true" || value === "false") {
    return value === true || value === "true" ? "Enable" : "Disable";
  }

  if (typeof value === "number") {
    return value.toString();
  }

  // Handle actual Date objects
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value.name ? `name: ${value.name}` : String(value);
  }

  if (Array.isArray(value)) {
    return value.map(item => formatValue(item)).join(', ') || 'None';
  }

  if (typeof value === "string") {
    // Check if it's an ISO date string (strict check)
    const isISODate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value);
    if (isISODate) {
      return value;
    }
    
    // If it's a long text, don't try to parse as date
    if (value.length > 50) {
      return value;
    }

    // For shorter strings, still try to parse as date if it clearly looks like one
    if (value.match(/^\d{4}-\d{2}-\d{2}/) && !isNaN(Date.parse(value))) {
      return new Date(value).toISOString();
    }

    return value;
  }

  return String(value);
};

const getFieldName = (fieldId) => {
  return fieldId
    .split('.')
    .map(segment => segment.replace(/([A-Z])/g, ' $1'))
    .join(' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};

function compareObjects(oldObj, newObj, options = {}) {
  const {
    path = '',
    changes = [],
    ignoreKeys = [],
    formatValue = (val) => val,
    getFieldName = (fieldId) => fieldId,
    changedBy,
  } = options;

  const allKeys = [
    ...new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]),
  ];

  for (let key of allKeys) {
    if (ignoreKeys.includes(key)) continue;

    const currentPath = path ? `${path}.${key}` : key;
    const oldVal = oldObj ? oldObj[key] : undefined;
    const newVal = newObj[key];

    // Special handling for 'statistics' field
    if (key === 'statistics' && Array.isArray(oldVal) && Array.isArray(newVal)) {
      // Map old and new statistics by '_id'
      const oldStatsMap = new Map();
      oldVal.forEach((stat) => {
        const id = stat._id.toString();
        oldStatsMap.set(id, stat);
      });

      const newStatsMap = new Map();
      newVal.forEach((stat) => {
        const id = stat._id.toString();
        newStatsMap.set(id, stat);
      });

      const allIds = new Set([...oldStatsMap.keys(), ...newStatsMap.keys()]);

      for (let id of allIds) {
        
        const oldStat = oldStatsMap.get(id);
        const newStat = newStatsMap.get(id);

        if (oldStat && newStat) {
          // Both statistics exist, compare 'name' and 'value'
          const oldName = oldStat.name;
          const newName = newStat.name;

          const oldValue = oldStat.value;
          const newValue = newStat.value;

          const fromNested = `${oldName}: ${oldValue}`;
          const toNested = `${newName}: ${newValue}`;

          if (fromNested !== toNested) {
            changes.push({
              fieldId: currentPath,
              fieldName: getFieldName(currentPath),
              from: fromNested,
              to: toNested,
              timestamp: new Date(),
              changedBy: changedBy,
            });
          }
        } else if (oldStat && !newStat) {
          // Statistic was removed
          const fromNested = `${oldStat.name}: ${oldStat.value}`;
          const toNested = 'Removed';

          changes.push({
            fieldId: currentPath,
            fieldName: getFieldName(currentPath),
            from: fromNested,
            to: toNested,
            timestamp: new Date(),
            changedBy: changedBy,
          });
        } else if (!oldStat && newStat) {
          // Statistic was added
          const fromNested = 'Added';
          const toNested = `${newStat.name}: ${newStat.value}`;

          changes.push({
            fieldId: currentPath,
            fieldName: getFieldName(currentPath),
            from: fromNested,
            to: toNested,
            timestamp: new Date(),
            changedBy: changedBy,
          });
        }
      }
      continue;
    }

    // Handle nested objects
    if (
      oldVal &&
      newVal &&
      typeof oldVal === 'object' &&
      typeof newVal === 'object' &&
      !Array.isArray(oldVal) &&
      !Array.isArray(newVal)
    ) {
      compareObjects(oldVal, newVal, {
        ...options,
        path: currentPath,
        changes,
      });
      continue;
    }

    // Regular comparison for other fields
    if (oldVal === undefined && newVal === undefined) continue;
    if (oldVal === null && newVal === null) continue;

    const oldFormatted =
      oldVal !== undefined && oldVal !== null ? formatValue(oldVal) : 'None';
    const newFormatted =
      newVal !== undefined && newVal !== null ? formatValue(newVal) : 'None';

    if (oldFormatted !== newFormatted) {
      changes.push({
        fieldId: currentPath,
        fieldName: getFieldName(currentPath),
        from: oldFormatted,
        to: newFormatted,
        timestamp: new Date(),
        changedBy: changedBy,
      });
    }
  }

  return changes;
}

//TODO THE REST

const hexToRgba = (hexValue, alpha = 1) => {
  if (!isValidHex(hexValue)) {
    return null;
  }
  const chunkSize = Math.floor((hexValue.length - 1) / 3);
  const hexArr = getChunksFromString(hexValue.slice(1), chunkSize);
  const [r, g, b, a] = hexArr.map(convertHexUnitTo256);
  return `rgba(${r}, ${g}, ${b}, ${getAlphafloat(a, alpha)})`;
};

const getAlphafloat = (a, alpha) => {
  if (typeof a !== "undefined") {
    return a / 255;
  }
  if (typeof alpha != "number" || alpha < 0 || alpha > 1) {
    return 1;
  }
  return alpha;
};

const convertHexUnitTo256 = (hexStr) => parseInt(hexStr.repeat(2 / hexStr.length), 16);

const getChunksFromString = (st, chunkSize) => st.match(new RegExp(`.{${chunkSize}}`, "g"));

const isValidHex = (hexValue) => /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hexValue);

// PUT FOR THEME

/*if(organization.domainLinked){          

        let bodyClasses = "ltr layout-fullwidth main-body app";
        let mainHeaderClasses = "";
        let mainContentClasses = "";
        let mainContainerClasses = "";
        let mainSideMenuClasses = "";
        let sideAppClasses = "";
        let appSidebarClasses = "";

        //THEME STYLE
              if(organization.theme.themeStyle == "Light Theme") {
          bodyClasses += " light-theme";
        }else if(organization.theme.themeStyle == "Dark Theme") {
          bodyClasses += " dark-theme";
        }else{
          bodyClasses += " transparent-theme";
        }

        //MENU STYLE
              if(organization.theme.menuStyle == "Light Menu") {
          bodyClasses += " light-menu";
        }else if(organization.theme.menuStyle == "Dark Menu") {
          bodyClasses += " dark-menu";
        }else if(organization.theme.menuStyle == "Colour Menu") {
          bodyClasses += " color-menu";
        }else if(organization.theme.menuStyle == "Gradient Menu") {
          bodyClasses += " gradient-menu";
        }

        //HEADER STYLE
              if(organization.theme.headerStyle == "Light Header") {
          bodyClasses += " light-header";
        }else if(organization.theme.headerStyle == "Dark Header") {
          bodyClasses += " dark-header";
        }else if(organization.theme.headerStyle == "Colour Header") {
          bodyClasses += " color-header";
        }else if(organization.theme.headerStyle == "Gradient Header") {
          bodyClasses += " gradient-header";
        }

        //NAVIGATION STYLE
              if(organization.theme.navigationStyle == "Vertical Menu") {
          bodyClasses += " sidebar-mini";
          mainHeaderClasses += " side-header";
          mainContentClasses += " app-content";
          mainContainerClasses += " container-fluid";
        }else if(organization.theme.navigationStyle == "Horizontal Click Menu") {
          bodyClasses += " horizontal";
          mainHeaderClasses += " hor-header";
          mainContentClasses += " horizontal-content";
          mainContainerClasses += " container";
          mainSideMenuClasses += " container";
          sideAppClasses += " container";
          appSidebarClasses += " horizontal-main";
        }else if(organization.theme.navigationStyle == "Horizontal Hover Menu") {
          bodyClasses += " horizontal-hover horizontal";
          mainHeaderClasses += " hor-header";
          mainContentClasses += " horizontal-content";
          mainContainerClasses += " container";
          mainSideMenuClasses += " container";
          sideAppClasses += " container";
          appSidebarClasses += " horizontal-main";
        }

        //LAYOUT POSITION
              if(organization.theme.layoutPosition == "Fixed") {
          bodyClasses += " fixed-layout";
        }else if(organization.theme.layoutPosition == "Scrollable") {
          bodyClasses += " scrollable-layout";
        }

        const newTheme = {
          active: true,       
          logo: "https://right-cars.co.za/wp-content/uploads/2023/06/RIGHT-CARS-LOGO.png", //organization.logoUrl,
          theme: {
            theme: organization.theme.navigationStyle == "Horizontal Click Menu" ? "horizontalClick" : organization.theme.navigationStyle == "Horizontal Hover Menu" ? "horizontalHover" : "vertical",
            transparentBgColor: hexToRgba(organization.theme.transparentBgColor),
            primaryBgColor: hexToRgba(organization.theme.primaryBgColor),
            primaryBgHover: hexToRgba(organization.theme.primaryBgHover, 0.9),
            primaryBgBorder: hexToRgba(organization.theme.primaryBgBorder),
            primary01: hexToRgba(organization.theme.primaryBgColor, 0.1),
            primary02: hexToRgba(organization.theme.primaryBgColor, 0.2),
            primary03: hexToRgba(organization.theme.primaryBgColor, 0.3),
            primary06: hexToRgba(organization.theme.primaryBgColor, 0.6),
            primary09: hexToRgba(organization.theme.primaryBgColor, 0.9),
            bodyClasses,
            mainHeaderClasses,
            mainContentClasses,
            mainContainerClasses,
            mainSideMenuClasses,
            sideAppClasses,
            appSidebarClasses,
          },
        };

        return res.status(500).json({ msg: "Theme could not be updated!" }); 
    
        /*const domainAfter = await redis.set(organization.domain,JSON.stringify(newTheme));
        if(domainAfter == 'OK'){
          organization.theme.lastUpdated = new Date
        }else{
          return res.status(500).json({ msg: "Theme could not be updated!" });    
        }

        }*/