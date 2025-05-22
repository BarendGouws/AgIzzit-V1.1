import db from "./db";

// Auction Configuration
export const auction = {

    Dealership: {      
      startTime: "09:00", 
      durationHours: 27, 
      holidayEndTime: "12:00",
      holidayDurationHours: 27,       
      types: [  
          {
            name: 'Regular',
            enabled: true,             
          },
          {
            name: 'New Arrival',
            enabled: true,        
          },
          {
            name: 'Clearance',
            enabled: true,
          },
          {
            name: 'Holiday',
            enabled: true,            
          }, 
          {
            name: 'Black Friday',
            enabled: true,
          },               
          {
            name: 'Repossessed',
            enabled: false,                   
          },
          {
            name: 'Dealers Only',
            enabled: true,                   
          }, 
      ],
    },    
    Property: {
      startTime: "09:00", // Start time in HH:mm format
      endTime: "17:00", // End time in HH:mm format
    },
};
  
// Bank Details
export const banks = [
    {
      name: "ABSA BANK",
      code: "632005",
      logo: "/images/absa.png",
      accountRegex: /^\d{9}$/,
      accountMessage: "ABSA account numbers must be 9 digits",
    },
    {
      name: "CAPITEC BANK",
      code: "470010",
      logo: "/images/capitec.jpg",
      accountRegex: /^\d{10}$/,
      accountMessage: "Capitec account numbers must be 10 digits",
    },
    {
      name: "FIRST NATIONAL BANK",
      code: "250655",
      logo: "/images/fnb.jpg",
      accountRegex: /^\d{11}$/,
      accountMessage: "FNB account numbers must be 11 digits",
    },
    {
      name: "NEDBANK",
      code: "198765",
      logo: "/images/nedbank.jpg",
      accountRegex: /^\d{9}$/,
      accountMessage: "Nedbank account numbers must be 9 digits",
    },
    {
      name: "STANDARD BANK",
      code: "051001",
      logo: "/images/standard.jpg",
      accountRegex: /^\d{10}$/,
      accountMessage: "Standard Bank account numbers must be 10 digits",
    },
];
  
// Categories
export const categories = {
    Dealership: {
      subcategories: [
        {
          label: "Cars & Bakkies",    
          attributes: [
              {
                key: "year",
                type: "select",
                label: "Year",
                placeholder: "Select year",
                required: true,
                validationMessage: "Please select a year",
                options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                onChangeHandler: "handleYear",
              },
              {
                key: "make",
                type: "select",
                label: "Make",
                placeholder: "Select make",
                required: true,
                validationMessage: "Make is required",
                optionsSource: "mmcodeMakes",
                onChangeHandler: "handleMake",
              },
              {
                key: "model",
                type: "select",
                label: "Model",
                placeholder: "Select model",
                required: true,
                validationMessage: "Model is required",
                optionsSource: "mmcodeModels",
                onChangeHandler: "handleModel",
              },
              {
                key: "variant",
                type: "select",
                label: "Variant",
                placeholder: "Select variant",
                required: true,
                validationMessage: "Variant is required",
                optionsSource: "mmcodeVariants",
                onChangeHandler: "handleVariant",
              },
              {
                key: "mmCode",
                type: "text",
                label: "MMCode",
                placeholder: "Not available",
                disabled: true,
              },
              {
                key: "fuelType",
                type: "select",
                label: "Fuel Type",
                placeholder: "Select Fuel Type",
                required: true,
                validationMessage: "Fuel type is required",
                options: ["Petrol", "Diesel", "Hybrid", "Electric"],
              },
              {
                key: "transmission",
                type: "select",
                label: "Transmission",
                placeholder: "Select Transmission",
                required: true,
                validationMessage: "Transmission is required",
                options: ["Auto", "Manual"],
              },
              {
                key: "mileage",
                type: "number",
                label: "Mileage",
                placeholder: "Enter mileage",
                required: true,
                validationMessage: "Mileage is required",
              },
              {
                key: "colour",
                type: "select",
                label: "Colour",
                placeholder: "Select Colour",
                required: true,
                validationMessage: "Colour is required",
                optionsSource: "colors",
              },
              {
                key: "vinNr",
                type: "text",
                label: "VIN Number",
                placeholder: "Enter VIN Number",
                required: true,
                convert: "uppercase",
                validationMessage: "VIN number is required",
                validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                regexMessage: "Invalid VIN number format (must be 17 characters)",
                mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                inputGroup: {
                  append: [
                    {
                      type: "button",
                      label: "Scan",
                      variant: "primary",
                      onClickHandler: "handleVinScan",
                    }
                  ]
                }              
              },
              {
                key: "engineNr",
                type: "text",
                label: "Engine Number",
                placeholder: "Enter Engine Number",
                required: true,
                convert: "uppercase",
                validationMessage: "Engine number is required",
                minLength: 6,
                regexMessage: "Engine number must be at least 6 characters",
                mutedText: "The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.",
              },
              {
                key: "regNr",
                type: "text",
                label: "Registration Number",
                placeholder: "Enter Reg Number",
                required: true,
                convert: "uppercase",
                validationMessage: "Registration number is required",
                mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
              },
              {
                key: "stockNr",
                type: "text",
                label: "Stock Number",
                placeholder: "Enter Stock Number",
                convert: "uppercase",
              },
            ]        
        },
        {
          label: "Bikes",
          attributes: [
            {
              key: "year",
              type: "select",
              label: "Year",
              placeholder: "Select year",
              required: true,
              validationMessage: "Please select a year",
              options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
              onChangeHandler: "handleYear",
            },
            {
              key: "make",
              type: "text",
              label: "Make",
              placeholder: "Enter make",
              required: true,
              convert: "titlecase",
              validationMessage: "Make is required",
            },
            {
              key: "model",
              type: "text",
              label: "Model",
              placeholder: "Enter model",
              required: true,
              convert: "titlecase",
              validationMessage: "Model is required",
            },
            {
              key: "variant",
              type: "text",
              label: "Variant",
              placeholder: "Enter variant",
              required: true,
              convert: "titlecase",
              validationMessage: "Variant is required",
            },
            {
              key: "mmCode",
              type: "text",
              label: "MMCode",
              placeholder: "Not available",
              disabled: true,
            },
            {
              key: "fuelType",
              type: "select",
              label: "Fuel Type",
              placeholder: "Select Fuel Type",
              required: true,
              validationMessage: "Fuel type is required",
              options: ["Petrol", "Diesel", "Hybrid", "Electric"],
            },
            {
              key: "transmission",
              type: "select",
              label: "Transmission",
              placeholder: "Select Transmission",
              required: true,
              validationMessage: "Transmission is required",
              options: ["Auto", "Manual"],
            },
            {
              key: "mileage",
              type: "number",
              label: "Mileage",
              placeholder: "Enter mileage",
              required: true,
              validationMessage: "Mileage is required",
            },
            {
              key: "colour",
              type: "select",
              label: "Colour",
              placeholder: "Select Colour",
              required: true,
              validationMessage: "Colour is required",
              optionsSource: "colors",
            },
            {
              key: "vinNr",
              type: "text",
              label: "VIN Number",
              placeholder: "Enter VIN Number",
              required: true,
              convert: "uppercase",
              validationMessage: "VIN number is required",
              validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
              regexMessage: "Invalid VIN number format (must be 17 characters)",
              mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
              inputGroup: {
                append: [
                  {
                    type: "button",
                    label: "Scan",
                    variant: "primary",
                    onClickHandler: "handleVinScan",
                  }
                ]
              }
            },
            {
              key: "engineNr",
              type: "text",
              label: "Engine Number",
              placeholder: "Enter Engine Number",
              required: true,
              convert: "uppercase",
              validationMessage: "Engine number is required",
              minLength: 6,
              regexMessage: "Engine number must be at least 6 characters",
              mutedText: "The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.",
            },
            {
              key: "regNr",
              type: "text",
              label: "Registration Number",
              placeholder: "Enter Reg Number",
              required: true,
              convert: "uppercase",
              validationMessage: "Registration number is required",
              mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
            },
            {
              key: "stockNr",
              type: "text",
              label: "Stock Number",
              placeholder: "Enter Stock Number",
              convert: "uppercase",
            },
          ]
        },
        {
          label: "Leisure",
          subcategories: [
            {
              label: "Boats",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Model is required",
                },
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },              
                {
                  key: "fuelType",
                  type: "select",
                  label: "Fuel Type",
                  placeholder: "Select Fuel Type",
                  required: true,
                  validationMessage: "Fuel type is required",
                  options: ["Petrol", "Diesel", "Hybrid", "Electric"],
                },
                {
                  key: "hours",
                  type: "number",
                  label: "Engine Hours",
                  placeholder: "Enter engine hours",
                  required: true,
                  validationMessage: "Engine hours are required",
                },
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                }, 
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },             
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                },
              ],
              subcategories: [
                { label: "Barge Boat" },
                { label: "Bass Boat" },
                { label: "Bow rider" },
                { label: "Cabin Boat" },
                { label: "Catamaran" },
                { label: "Centre Console Boat" },
                { label: "Cruiser" },
                { label: "Fish and Ski Boat" },
                { label: "Fishing Boat" },
                { label: "Inflatable" },
                { label: "Jet Ski" },
                { label: "Luxury Yacht" },
                { label: "Motorboat" },
                { label: "Outrigger Canoe" },
                { label: "Pilothouse" },
                { label: "Pontoon Boat" },
                { label: "Powerboat" },
                { label: "Riverboat" },
                { label: "Sail" },
                { label: "Semi-rigid" },
                { label: "Ski boat" },
                { label: "Wakeboard Boat" },
                { label: "Wakesurf Boat" },
                { label: "Yacht" }
              ]
            },
            {
              label: "Caravans & Trailers",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Model is required",
                },
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },
                {
                  key: "axles",
                  type: "number",
                  label: "Number of Axles",
                  placeholder: "Enter number of axles",
                  required: true,
                  validationMessage: "Number of axles is required",
                },
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                },
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                },
              ],
              subcategories: [
                { label: "Touring Caravan" },
                { label: "Static Caravan" },
                { label: "Off-road Caravan" },
                { label: "Pop-up Caravan" },
                { label: "Teardrop Caravan" },
                { label: "Tent Trailer" },
                { label: "Off-road Trailer" },
                { label: "Pop-up Trailer" },
                { label: "Venter Trailer" }
              ]
            }
          ]
        },
        {
          label: "Commercial",
          subcategories: [
            {
              label: "Trucks",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Model is required",
                },
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },              
                {
                  key: "fuelType",
                  type: "select",
                  label: "Fuel Type",
                  placeholder: "Select Fuel Type",
                  required: true,
                  validationMessage: "Fuel type is required",
                  options: ["Petrol", "Diesel", "Hybrid", "Electric"],
                },
                {
                  key: "transmission",
                  type: "select",
                  label: "Transmission",
                  placeholder: "Select Transmission",
                  required: true,
                  validationMessage: "Transmission is required",
                  options: ["Auto", "Manual"],
                },
                {
                  key: "mileage",
                  type: "number",
                  label: "Mileage",
                  placeholder: "Enter mileage",
                  required: true,
                  validationMessage: "Mileage is required",
                },
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                },
                {
                  key: "engineNr",
                  type: "text",
                  label: "Engine Number",
                  placeholder: "Enter Engine Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Engine number is required",
                  minLength: 6,
                  regexMessage: "Engine number must be at least 6 characters",
                  mutedText: "The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                }
              ],
              subcategories: [
                { label: "Bowser Truck" },
                { label: "Cage" },
                { label: "Car Transporter Truck" },
                { label: "Cattle Body" },
                { label: "Chassis Cab" },
                { label: "Cherry Picker Truck" },
                { label: "Compactor" },
                { label: "Concrete Mixer" },
                { label: "Concrete Pump" },
                { label: "Crane Truck" },
                { label: "Curtain Side Truck" },
                { label: "Diesel Tanker" },
                { label: "Dropside Truck" },
                { label: "Dump Truck" },
                { label: "Fire Fighting Unit" },
                { label: "Flatbed" },
                { label: "Honey Sucker" },
                { label: "Hooklift" },
                { label: "Insulated Body" },
                { label: "Mass Side" },
                { label: "Other Specialized" },
                { label: "Pantechnicon" },
                { label: "Petrol Tanker" },
                { label: "Refrigerated Body" },
                { label: "Roll Back" },
                { label: "Side Tipper" },
                { label: "Skip Loader" },
                { label: "Tanker" },
                { label: "Tautliner Truck" },
                { label: "Tipper Truck" },
                { label: "Truck Tractor" },
                { label: "Volume Body" }
              ]
            },
            {
              label: "Buses",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Model is required",
                },
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },              
                {
                  key: "fuelType",
                  type: "select",
                  label: "Fuel Type",
                  placeholder: "Select Fuel Type",
                  required: true,
                  validationMessage: "Fuel type is required",
                  options: ["Petrol", "Diesel", "Hybrid", "Electric"],
                },
                {
                  key: "transmission",
                  type: "select",
                  label: "Transmission",
                  placeholder: "Select Transmission",
                  required: true,
                  validationMessage: "Transmission is required",
                  options: ["Auto", "Manual"],
                },
                {
                  key: "seats",
                  type: "number",
                  label: "Number of Seats",
                  placeholder: "Enter number of seats",
                  required: true,
                  validationMessage: "Number of seats is required",
                },
                {
                  key: "mileage",
                  type: "number",
                  label: "Mileage",
                  placeholder: "Enter mileage",
                  required: true,
                  validationMessage: "Mileage is required",
                },
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                },
                {
                  key: "engineNr",
                  type: "text",
                  label: "Engine Number",
                  placeholder: "Enter Engine Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Engine number is required",
                  minLength: 6,
                  regexMessage: "Engine number must be at least 6 characters",
                  mutedText: "The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                }
              ],
              subcategories: [
                { label: "16 Seater" },
                { label: "22 Seater" },
                { label: "24 Seater" },
                { label: "25 Seater" },
                { label: "28 Seater" },
                { label: "30 Seater" },
                { label: "32 Seater" },
                { label: "40 Seater" },
                { label: "50 Seater" },
                { label: "60 Seater" },
                { label: "65 Seater" },
                { label: "70 Seater" },
                { label: "Luxury Bus" },
                { label: "Mini Bus" },
                { label: "Semi Luxury Bus" }
              ]
            },
            {
              label: "Cranes",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Model is required",
                },
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },                            
                {
                  key: "fuelType",
                  type: "select",
                  label: "Fuel Type",
                  placeholder: "Select Fuel Type",
                  required: true,
                  validationMessage: "Fuel type is required",
                  options: ["Diesel", "Electric", "Hybrid"],
                },
                {
                  key: "hours",
                  type: "number",
                  label: "Operating Hours",
                  placeholder: "Enter operating hours",
                  required: true,
                  validationMessage: "Operating hours are required",
                },
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },              
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                },
                {
                  key: "engineNr",
                  type: "text",
                  label: "Engine Number",
                  placeholder: "Enter Engine Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Engine number is required",
                  minLength: 6,
                  regexMessage: "Engine number must be at least 6 characters",
                  mutedText: "The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                }
              ],
              subcategories: [
                { label: "All Terrain Crane" },
                { label: "Crawler Crane" },
                { label: "Mobile Crane" },
                { label: "Overhead Crane" },
                { label: "Rough Terrain Crane" },
                { label: "Self-Erecting Crane" },
                { label: "Sidelift Crane" },
                { label: "Tower Crane" },
                { label: "Tracked Crane" }
              ]
            },
            {
              label: "Dozers",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Model is required",
                },
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },                           
                {
                  key: "fuelType",
                  type: "select",
                  label: "Fuel Type",
                  placeholder: "Select Fuel Type",
                  required: true,
                  validationMessage: "Fuel type is required",
                  options: ["Diesel", "Electric", "Hybrid"],
                },
                {
                  key: "hours",
                  type: "number",
                  label: "Operating Hours",
                  placeholder: "Enter operating hours",
                  required: true,
                  validationMessage: "Operating hours are required",
                }, 
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },              
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                },
                {
                  key: "engineNr",
                  type: "text",
                  label: "Engine Number",
                  placeholder: "Enter Engine Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Engine number is required",
                  minLength: 6,
                  regexMessage: "Engine number must be at least 6 characters",
                  mutedText: "The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                }
              ],
              subcategories: [
                { label: "Tracked Dozer" },
                { label: "Wheeled Dozer" }
              ]
            },
            {
              label: "Excavators",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Model is required",
                },             
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },
                {
                  key: "fuelType",
                  type: "select",
                  label: "Fuel Type",
                  placeholder: "Select Fuel Type",
                  required: true,
                  validationMessage: "Fuel type is required",
                  options: ["Diesel", "Electric", "Hybrid"],
                },
                {
                  key: "hours",
                  type: "number",
                  label: "Operating Hours",
                  placeholder: "Enter operating hours",
                  required: true,
                  validationMessage: "Operating hours are required",
                },
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                },
                {
                  key: "engineNr",
                  type: "text",
                  label: "Engine Number",
                  placeholder: "Enter Engine Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Engine number is required",
                  minLength: 6,
                  regexMessage: "Engine number must be at least 6 characters",
                  mutedText: "The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                }
              ],
              subcategories: [
                { label: "Micro Excavator" },
                { label: "Midi Excavator" },
                { label: "Mini Excavator" },
                { label: "Track Excavator" },
                { label: "Wheeled Excavator" }
              ]
            },
            {
              label: "Forklifts",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Model is required",
                },
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },                           
                {
                  key: "fuelType",
                  type: "select",
                  label: "Fuel Type",
                  placeholder: "Select Fuel Type",
                  required: true,
                  validationMessage: "Fuel type is required",
                  options: ["Petrol", "Diesel", "Electric", "LPG"],
                },
                {
                  key: "transmission",
                  type: "select",
                  label: "Transmission",
                  placeholder: "Select Transmission",
                  required: true,
                  validationMessage: "Transmission is required",
                  options: ["Manual", "Automatic", "Hydrostatic"],
                },  
                {
                  key: "hours",
                  type: "number",
                  label: "Operating Hours",
                  placeholder: "Enter operating hours",
                  required: true,
                  validationMessage: "Operating hours are required",
                },            
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                },
                {
                  key: "engineNr",
                  type: "text",
                  label: "Engine Number",
                  placeholder: "Enter Engine Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Engine number is required",
                  minLength: 6,
                  regexMessage: "Engine number must be at least 6 characters",
                  mutedText: "The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                }
              ],
              subcategories: [
                { label: "Aerial Platform ForkLift" },
                { label: "All Terrain Forklift" },
                { label: "Cherry Picker Forklift" },
                { label: "Container Handler" },
                { label: "Counter Balanced Forklift" },
                { label: "Narrow Aisle Truck" },
                { label: "Reach Truck" },
                { label: "Side Loader" },
                { label: "Stacker" }
              ]
            },
            {
              label: "Graders",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Model is required",
                },
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },                           
                {
                  key: "fuelType",
                  type: "select",
                  label: "Fuel Type",
                  placeholder: "Select Fuel Type",
                  required: true,
                  validationMessage: "Fuel type is required",
                  options: ["Diesel", "Electric", "Hybrid"],
                },              
                {
                  key: "transmission",
                  type: "select",
                  label: "Transmission",
                  placeholder: "Select Transmission",
                  required: true,
                  validationMessage: "Transmission is required",
                  options: ["Manual", "Automatic", "Hydrostatic"],
                },
                {
                  key: "hours",
                  type: "number",
                  label: "Operating Hours",
                  placeholder: "Enter operating hours",
                  required: true,
                  validationMessage: "Operating hours are required",
                }, 
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                },
                {
                  key: "engineNr",
                  type: "text",
                  label: "Engine Number",
                  placeholder: "Enter Engine Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Engine number is required",
                  minLength: 6,
                  regexMessage: "Engine number must be at least 6 characters",
                  mutedText: "The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                }
              ],
            },
            {
              label: "Loaders",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Model is required",
                },
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },            
                {
                  key: "fuelType",
                  type: "select",
                  label: "Fuel Type",
                  placeholder: "Select Fuel Type",
                  required: true,
                  validationMessage: "Fuel type is required",
                  options: ["Diesel", "Electric", "Hybrid"],
                },
                {
                  key: "transmission",
                  type: "select",
                  label: "Transmission",
                  placeholder: "Select Transmission",
                  required: true,
                  validationMessage: "Transmission is required",
                  options: ["Manual", "Automatic", "Hydrostatic"],
                },    
                {
                  key: "hours",
                  type: "number",
                  label: "Operating Hours",
                  placeholder: "Enter operating hours",
                  required: true,
                  validationMessage: "Operating hours are required",
                },          
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                },
                {
                  key: "engineNr",
                  type: "text",
                  label: "Engine Number",
                  placeholder: "Enter Engine Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Engine number is required",
                  minLength: 6,
                  regexMessage: "Engine number must be at least 6 characters",
                  mutedText: "The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                }
              ],
              subcategories: [
                { label: "Front end Loader" },
                { label: "Multi-terrain Loader" },
                { label: "Rough Terrain Loader" },
                { label: "Skid Steer Loader" },
                { label: "TLB" },
                { label: "Tracked Loader" },
                { label: "Wheeled Loader" }
              ]
            },
            {
              label: "Rollers",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Model is required",
                },
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },              
                {
                  key: "fuelType",
                  type: "select",
                  label: "Fuel Type",
                  placeholder: "Select Fuel Type",
                  required: true,
                  validationMessage: "Fuel type is required",
                  options: ["Diesel", "Electric", "Hybrid"],
                },   
                {
                  key: "hours",
                  type: "number",
                  label: "Operating Hours",
                  placeholder: "Enter operating hours",
                  required: true,
                  validationMessage: "Operating hours are required",
                },           
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                },
                {
                  key: "engineNr",
                  type: "text",
                  label: "Engine Number",
                  placeholder: "Enter Engine Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Engine number is required",
                  minLength: 6,
                  regexMessage: "Engine number must be at least 6 characters",
                  mutedText: "The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },              
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                }
              ],
              subcategories: [
                { label: "Flat" },
                { label: "PadFoot" }
              ]
            },
            {
              label: "Tractors",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Model is required",
                },
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },
                {
                  key: "fuelType",
                  type: "select",
                  label: "Fuel Type",
                  placeholder: "Select Fuel Type",
                  required: true,
                  validationMessage: "Fuel type is required",
                  options: ["Diesel", "Electric", "Hybrid"],
                },
                {
                  key: "transmission",
                  type: "select",
                  label: "Transmission",
                  placeholder: "Select Transmission",
                  required: true,
                  validationMessage: "Transmission is required",
                  options: ["Manual", "Automatic", "Hydrostatic"],
                },
                {
                  key: "hours",
                  type: "number",
                  label: "Operating Hours",
                  placeholder: "Enter operating hours",
                  required: true,
                  validationMessage: "Operating hours are required",
                },
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                },
                {
                  key: "engineNr",
                  type: "text",
                  label: "Engine Number",
                  placeholder: "Enter Engine Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Engine number is required",
                  minLength: 6,
                  regexMessage: "Engine number must be at least 6 characters",
                  mutedText: "The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                }
              ],
              subcategories: [
                { label: "2WD" },
                { label: "4WD" },
                { label: "Tracked" }
              ]
            },
            {
              label: "Trailers",
              attributes: [
                {
                  key: "year",
                  type: "select",
                  label: "Year",
                  placeholder: "Select year",
                  required: true,
                  validationMessage: "Please select a year",
                  options: ["Select Year", ...Array.from({ length: 54 }, (_, i) => 2024 - i)],
                  onChangeHandler: "handleYear",
                },
                {
                  key: "make",
                  type: "text",
                  label: "Make",
                  placeholder: "Enter make",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Make is required",
                },
                {
                  key: "model",
                  type: "text",
                  label: "Model",
                  placeholder: "Enter model",
                  required: true,
                  convert: "titlecase",
                  validationMessage: "Model is required",
                },
                {
                  key: "mmCode",
                  type: "text",
                  label: "MMCode",
                  placeholder: "Not available",
                  disabled: true,
                },
                {
                  key: "axles",
                  type: "number",
                  label: "Number of Axles",
                  placeholder: "Enter number of axles",
                  required: true,
                  validationMessage: "Number of axles is required",
                },                          
                {
                  key: "colour",
                  type: "select",
                  label: "Colour",
                  placeholder: "Select Colour",
                  required: true,
                  validationMessage: "Colour is required",
                  optionsSource: "colors",
                },
                {
                  key: "vinNr",
                  type: "text",
                  label: "VIN Number",
                  placeholder: "Enter VIN Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "VIN number is required",
                  validationRegex: /^[A-HJ-NPR-Z0-9]{17}$/,
                  regexMessage: "Invalid VIN number format (must be 17 characters)",
                  mutedText: "The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.",
                  inputGroup: {
                    append: [
                      {
                        type: "button",
                        label: "Scan",
                        variant: "primary",
                        onClickHandler: "handleVinScan",
                      }
                    ]
                  }
                }, 
                {
                  key: "regNr",
                  type: "text",
                  label: "Registration Number",
                  placeholder: "Enter Reg Number",
                  required: true,
                  convert: "uppercase",
                  validationMessage: "Registration number is required",
                  mutedText: "The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.",
                },
                {
                  key: "stockNr",
                  type: "text",
                  label: "Stock Number",
                  placeholder: "Enter Stock Number",
                  convert: "uppercase",
                }
              ],
              subcategories: [
                { label: "Bale Trailer" },
                { label: "Bowser Trailer" },
                { label: "Box Trailer" },
                { label: "Brick Trailer" },
                { label: "Cage Body Trailer" },
                { label: "Car Transporter Trailer" },
                { label: "Cattle Trailer" },
                { label: "Curtain Side Trailer" },
                { label: "Dolly" },
                { label: "Drawbar Trailer" },
                { label: "Dropside Trailer" },
                { label: "Fire Fighting Trailer" },
                { label: "Flat Deck Trailer" },
                { label: "Folding Goose Neck Trailer" },
                { label: "Front Link Trailer" },
                { label: "High Speed Trailer" },
                { label: "Interlink Trailer" },
                { label: "Logging Trailer" },
                { label: "Lowbed Trailer" },
                { label: "Mass Sides Trailer" },
                { label: "Payloader Trailer" },
                { label: "Refrigerated Trailer" },
                { label: "Semi Trailer" },
                { label: "Skeletal Trailer" },
                { label: "Sloper Trailer" },
                { label: "Step Deck Trailer" },
                { label: "Super Link Trailer" },
                { label: "Tank Trailer" },
                { label: "Tautliner Trailer" },
                { label: "Tipper Trailer" }
              ]
            }
          ]
        }
      ]
    },
    Property: {
      subcategories: [
        {
          label: "Buy",
          attributes: [
            {
              key: "listingType",
              type: "hidden",
              value: "Buy"
            },
            {
              key: "propertyType",
              type: "select",
              label: "Property Type",
              placeholder: "Select property type",
              required: true,
              validationMessage: "Property type is required",
              options: ["House", "Apartment", "Townhouse", "Vacant Land", "Commercial Property", "Industrial Property"]
            },
            {
              key: "bedrooms",
              type: "number",
              label: "Bedrooms",
              placeholder: "Enter number of bedrooms",
              required: true,
              validationMessage: "Bedrooms are required"
            },
            {
              key: "bathrooms",
              type: "number",
              label: "Bathrooms",
              placeholder: "Enter number of bathrooms",
              required: true,
              validationMessage: "Bathrooms are required"
            },
            {
              key: "garages",
              type: "number",
              label: "Garages",
              placeholder: "Enter number of garages"
            },
            {
              key: "parkingSpaces",
              type: "number",
              label: "Parking Spaces",
              placeholder: "Enter number of parking spaces"
            },
            {
              key: "floorSize",
              type: "number",
              label: "Floor Size (m²)",
              placeholder: "Enter floor size"
            },
            {
              key: "erfSize",
              type: "number",
              label: "Erf Size (m²)",
              placeholder: "Enter erf size"
            },
            {
              key: "price",
              type: "number",
              label: "Price",
              placeholder: "Enter selling price",
              required: true,
              validationMessage: "Price is required"
            },
            {
              key: "previousPrice",
              type: "number",
              label: "Previous Price",
              placeholder: "Enter previous selling price"
            },
            {
              key: "showPreviousPrice",
              type: "checkbox",
              label: "Show Previous Price"
            },
            {
              key: "formattedAddress",
              type: "text",
              label: "Address",
              placeholder: "Enter address"
            }
          ]
        },  
        {
          label: "Rent",
          attributes: [
            {
              key: "listingType",
              type: "hidden",
              value: "Rent"
            },
            {
              key: "propertyType",
              type: "select",
              label: "Property Type",
              placeholder: "Select property type",
              required: true,
              validationMessage: "Property type is required",
              options: ["House", "Apartment", "Townhouse", "Vacant Land", "Commercial Property", "Industrial Property"]
            },
            {
              key: "bedrooms",
              type: "number",
              label: "Bedrooms",
              placeholder: "Enter number of bedrooms",
              required: true,
              validationMessage: "Bedrooms are required"
            },
            {
              key: "bathrooms",
              type: "number",
              label: "Bathrooms",
              placeholder: "Enter number of bathrooms",
              required: true,
              validationMessage: "Bathrooms are required"
            },
            {
              key: "garages",
              type: "number",
              label: "Garages",
              placeholder: "Enter number of garages"
            },
            {
              key: "parkingSpaces",
              type: "number",
              label: "Parking Spaces",
              placeholder: "Enter number of parking spaces"
            },
            {
              key: "rental",
              type: "number",
              label: "Rental Price",
              placeholder: "Enter monthly rental price",
              required: true,
              validationMessage: "Rental price is required"
            },
            {
              key: "previousRental",
              type: "number",
              label: "Previous Rental Price",
              placeholder: "Enter previous rental price"
            },
            {
              key: "showPreviousRental",
              type: "checkbox",
              label: "Show Previous Rental Price"
            },
            {
              key: "rentalDeposit",
              type: "number",
              label: "Deposit",
              placeholder: "Enter deposit amount"
            },
            {
              key: "leasePeriod",
              type: "select",
              label: "Lease Period",
              placeholder: "Select lease period",
              options: ["6 months", "12 months", "24 months"]
            },
            {
              key: "isPetFriendly",
              type: "checkbox",
              label: "Pet Friendly"
            },
            {
              key: "furnished",
              type: "checkbox",
              label: "Furnished"
            },
            {
              key: "formattedAddress",
              type: "text",
              label: "Address",
              placeholder: "Enter address"
            }
          ]
        },  
        {
          label: "Buy & Rent",
          attributes: [
            {
              key: "listingType",
              type: "hidden",
              value: "Buy & Rent"
            },
            {
              key: "propertyType",
              type: "select",
              label: "Property Type",
              placeholder: "Select property type",
              required: true,
              validationMessage: "Property type is required",
              options: ["House", "Apartment", "Townhouse", "Vacant Land", "Commercial Property", "Industrial Property"]
            },
            {
              key: "price",
              type: "number",
              label: "Price",
              placeholder: "Enter selling price",
              required: true,
              validationMessage: "Price is required"
            },
            {
              key: "rental",
              type: "number",
              label: "Rental Price",
              placeholder: "Enter monthly rental price",
              required: true,
              validationMessage: "Rental price is required"
            },
            {
              key: "rentalDeposit",
              type: "number",
              label: "Deposit",
              placeholder: "Enter deposit amount"
            },
            {
              key: "leasePeriod",
              type: "select",
              label: "Lease Period",
              placeholder: "Select lease period",
              options: ["6 months", "12 months", "24 months"]
            },
            {
              key: "formattedAddress",
              type: "text",
              label: "Address",
              placeholder: "Enter address"
            }
          ]
        },  
        {
          label: "Development",
          attributes: [
            {
              key: "listingType",
              type: "hidden",
              value: "Development"
            },
            {
              key: "developmentName",
              type: "text",
              label: "Development Name",
              placeholder: "Enter development name",
              required: true,
              validationMessage: "Development name is required"
            },
            {
              key: "developmentType",
              type: "select",
              label: "Development Type",
              placeholder: "Select development type",
              required: true,
              validationMessage: "Development type is required",
              options: ["Buy", "Rent", "Buy & Rent"]
            },
            {
              key: "developmentStatus",
              type: "select",
              label: "Development Status",
              placeholder: "Select development status",
              required: true,
              validationMessage: "Development status is required",
              options: ["Off Plan", "Under Construction", "Completed"]
            },
            {
              key: "fromPrice",
              type: "number",
              label: "Price From",
              placeholder: "Enter starting price"
            },
            {
              key: "toPrice",
              type: "number",
              label: "Price To",
              placeholder: "Enter max price"
            },
            {
              key: "units",
              type: "number",
              label: "Total Units",
              placeholder: "Enter number of units"
            },
            {
              key: "formattedAddress",
              type: "text",
              label: "Address",
              placeholder: "Enter development address"
            }
          ]
        }
      ]
    },
    Goods: {
      subcategories: [
        'Appliances',
        'Automotive Parts',
        'Baby & Kids',
        'Books & Games',
        'Clothing & Accessories', 
        'Electronics',
        'Furniture',
        'Health & Beauty',
        'Home & Garden',
        'Jewelry & Watches',
        'Musical Instruments',
        'Office Supplies',
        'Pet Supplies',
        'Sports & Fitness',
        'Tools & DIY',
        'Toys & Hobbies'
      ]
    }, 
    Rentals: {
      subcategories: [
        'Vehicles',
        'Equipment',
        'Crane',
        'Trucks', 
        'Grader',
        'Compactors'
      ]
    }
};

// Colors
export const colors = [
    "Black",
    "White",
    "Silver",
    "Grey",
    "Blue",
    "Red",
    "Green",
    "Brown",
    "Yellow",
    "Orange",
    "Purple",
    "Gold",
    "Beige",
    "Bronze",
    "Burgundy",
    "Charcoal",
    "Cream",
    "Magenta",
    "Maroon",
    "Navy",
    "Pink",
    "Tan",
    "Turquoise",
    "Other",
];
  
// Country Data
export const countries = [
    { code: 'ZA', name: 'South Africa', ext: '+27' },
    { code: 'BW', name: 'Botswana', ext: '+267' },
    { code: 'NA', name: 'Namibia', ext: '+264' },
    { code: 'MZ', name: 'Mozambique', ext: '+258' },
    { code: 'ZW', name: 'Zimbabwe', ext: '+263' },
    { code: 'LS', name: 'Lesotho', ext: '+266' },    
    { code: 'AD', name: 'Andorra', ext: '+376' },
    { code: 'AE', name: 'United Arab Emirates', ext: '+971' },
    { code: 'AG', name: 'Antigua & Barbuda', ext: '+1-268' },
    { code: 'AI', name: 'Anguilla', ext: '+1-264' },
    { code: 'AL', name: 'Albania', ext: '+355' },
    { code: 'AM', name: 'Armenia', ext: '+374' },
    { code: 'AO', name: 'Angola', ext: '+244' },
    { code: 'AR', name: 'Argentina', ext: '+54' },
    { code: 'AS', name: 'American Samoa', ext: '+1-684' },
    { code: 'AT', name: 'Austria', ext: '+43' },
    { code: 'AU', name: 'Australia', ext: '+61' },
    { code: 'AW', name: 'Aruba', ext: '+297' },
    { code: 'AX', name: 'Åland Islands', ext: '+358-18' },
    { code: 'AZ', name: 'Azerbaijan', ext: '+994' },
    { code: 'BA', name: 'Bosnia and Herzegovina', ext: '+387' },
    { code: 'BB', name: 'Barbados', ext: '+1-246' },
    { code: 'BD', name: 'Bangladesh', ext: '+880' },
    { code: 'BE', name: 'Belgium', ext: '+32' },
    { code: 'BF', name: 'Burkina Faso', ext: '+226' },
    { code: 'BG', name: 'Bulgaria', ext: '+359' },
    { code: 'BH', name: 'Bahrain', ext: '+973' },
    { code: 'BI', name: 'Burundi', ext: '+257' },
    { code: 'BJ', name: 'Benin', ext: '+229' },
    { code: 'BL', name: 'Saint Barthélemy', ext: '+590' },
    { code: 'BM', name: 'Bermuda', ext: '+1-441' },
    { code: 'BN', name: 'Brunei', ext: '+673' },
    { code: 'BO', name: 'Bolivia', ext: '+591' },
    { code: 'BQ', name: 'Caribbean Netherlands', ext: '+599' },
    { code: 'BR', name: 'Brazil', ext: '+55' },
    { code: 'BS', name: 'Bahamas', ext: '+1-242' },    
    { code: 'BY', name: 'Belarus', ext: '+375' },
    { code: 'BZ', name: 'Belize', ext: '+501' },
    { code: 'CA', name: 'Canada', ext: '+1' },
    { code: 'CC', name: 'Cocos (Keeling) Islands', ext: '+61' },
    { code: 'CD', name: 'Democratic Republic of the Congo', ext: '+243' },
    { code: 'CF', name: 'Central African Republic', ext: '+236' },
    { code: 'CG', name: 'Republic of the Congo', ext: '+242' },
    { code: 'CH', name: 'Switzerland', ext: '+41' },
    { code: 'CI', name: "Côte d'Ivoire", ext: '+225' },
    { code: 'CK', name: 'Cook Islands', ext: '+682' },
    { code: 'CL', name: 'Chile', ext: '+56' },
    { code: 'CM', name: 'Cameroon', ext: '+237' },
    { code: 'CN', name: 'China', ext: '+86' },
    { code: 'CO', name: 'Colombia', ext: '+57' },
    { code: 'CR', name: 'Costa Rica', ext: '+506' },
    { code: 'CU', name: 'Cuba', ext: '+53' },
    { code: 'CV', name: 'Cape Verde', ext: '+238' },
    { code: 'CW', name: 'Curaçao', ext: '+599' },
    { code: 'CX', name: 'Christmas Island', ext: '+61' },
    { code: 'CY', name: 'Cyprus', ext: '+357' },
    { code: 'CZ', name: 'Czech Republic', ext: '+420' },
    { code: 'DE', name: 'Germany', ext: '+49' },
    { code: 'DJ', name: 'Djibouti', ext: '+253' },
    { code: 'DK', name: 'Denmark', ext: '+45' },
    { code: 'DM', name: 'Dominica', ext: '+1-767' },
    { code: 'DO', name: 'Dominican Republic', ext: '+1-809' },
    { code: 'DZ', name: 'Algeria', ext: '+213' },
    { code: 'EC', name: 'Ecuador', ext: '+593' },
    { code: 'EE', name: 'Estonia', ext: '+372' },
    { code: 'EG', name: 'Egypt', ext: '+20' },
    { code: 'EH', name: 'Western Sahara', ext: '+212' },
    { code: 'ER', name: 'Eritrea', ext: '+291' },
    { code: 'ES', name: 'Spain', ext: '+34' },
    { code: 'ET', name: 'Ethiopia', ext: '+251' },
    { code: 'FI', name: 'Finland', ext: '+358' },
    { code: 'FJ', name: 'Fiji', ext: '+679' },
    { code: 'FO', name: 'Faroe Islands', ext: '+298' },
    { code: 'FR', name: 'France', ext: '+33' },
    { code: 'GA', name: 'Gabon', ext: '+241' },
    { code: 'GB', name: 'United Kingdom', ext: '+44' },
    { code: 'GD', name: 'Grenada', ext: '+1-473' },
    { code: 'GE', name: 'Georgia', ext: '+995' },
    { code: 'GF', name: 'French Guiana', ext: '+594' },
    { code: 'GG', name: 'Guernsey', ext: '+44-1481' },
    { code: 'GH', name: 'Ghana', ext: '+233' },
    { code: 'GI', name: 'Gibraltar', ext: '+350' },
    { code: 'GL', name: 'Greenland', ext: '+299' },
    { code: 'GM', name: 'Gambia', ext: '+220' },
    { code: 'GN', name: 'Guinea', ext: '+224' },
    { code: 'GP', name: 'Guadeloupe', ext: '+590' },
    { code: 'GQ', name: 'Equatorial Guinea', ext: '+240' },
    { code: 'GR', name: 'Greece', ext: '+30' },
    { code: 'GT', name: 'Guatemala', ext: '+502' },
    { code: 'GU', name: 'Guam', ext: '+1-671' },
    { code: 'GW', name: 'Guinea-Bissau', ext: '+245' },
    { code: 'GY', name: 'Guyana', ext: '+592' },
    { code: 'HK', name: 'Hong Kong', ext: '+852' },
    { code: 'HN', name: 'Honduras', ext: '+504' },
    { code: 'HR', name: 'Croatia', ext: '+385' },
    { code: 'HT', name: 'Haiti', ext: '+509' },
    { code: 'HU', name: 'Hungary', ext: '+36' },
    { code: 'IC', name: 'Canary Islands', ext: '+34' },
    { code: 'ID', name: 'Indonesia', ext: '+62' },
    { code: 'IE', name: 'Ireland', ext: '+353' },
    { code: 'IL', name: 'Israel', ext: '+972' },
    { code: 'IM', name: 'Isle of Man', ext: '+44-1624' },
    { code: 'IR', name: 'Iran', ext: '+98' },
    { code: 'IS', name: 'Iceland', ext: '+354' },
    { code: 'IT', name: 'Italy', ext: '+39' },
    { code: 'JE', name: 'Jersey', ext: '+44-1534' },
    { code: 'JM', name: 'Jamaica', ext: '+1-876' },
    { code: 'JP', name: 'Japan', ext: '+81' },
    { code: 'KE', name: 'Kenya', ext: '+254' },
    { code: 'KM', name: 'Comoros', ext: '+269' },
    { code: 'KN', name: 'Saint Kitts & Nevis', ext: '+1-869' },
    { code: 'KR', name: 'South Korea', ext: '+82' },
    { code: 'KY', name: 'Cayman Islands', ext: '+1-345' },
    { code: 'LC', name: 'Saint Lucia', ext: '+1-758' },
    { code: 'LI', name: 'Liechtenstein', ext: '+423' },
    { code: 'LR', name: 'Liberia', ext: '+231' },    
    { code: 'LT', name: 'Lithuania', ext: '+370' },
    { code: 'LU', name: 'Luxembourg', ext: '+352' },
    { code: 'LV', name: 'Latvia', ext: '+371' },
    { code: 'LY', name: 'Libya', ext: '+218' },
    { code: 'MA', name: 'Morocco', ext: '+212' },
    { code: 'MC', name: 'Monaco', ext: '+377' },
    { code: 'MD', name: 'Moldova', ext: '+373' },
    { code: 'ME', name: 'Montenegro', ext: '+382' },
    { code: 'MF', name: 'Saint Martin', ext: '+590' },
    { code: 'MG', name: 'Madagascar', ext: '+261' },
    { code: 'MK', name: 'North Macedonia', ext: '+389' },
    { code: 'ML', name: 'Mali', ext: '+223' },
    { code: 'MQ', name: 'Martinique', ext: '+596' },
    { code: 'MR', name: 'Mauritania', ext: '+222' },
    { code: 'MS', name: 'Montserrat', ext: '+1-664' },
    { code: 'MT', name: 'Malta', ext: '+356' },
    { code: 'MW', name: 'Malawi', ext: '+265' },
    { code: 'MX', name: 'Mexico', ext: '+52' },
    { code: 'MY', name: 'Malaysia', ext: '+60' },   
    { code: 'NC', name: 'New Caledonia', ext: '+687' },
    { code: 'NE', name: 'Niger', ext: '+227' },
    { code: 'NG', name: 'Nigeria', ext: '+234' },
    { code: 'NI', name: 'Nicaragua', ext: '+505' },
    { code: 'NL', name: 'Netherlands', ext: '+31' },
    { code: 'NO', name: 'Norway', ext: '+47' },
    { code: 'NZ', name: 'New Zealand', ext: '+64' },
    { code: 'PA', name: 'Panama', ext: '+507' },
    { code: 'PE', name: 'Peru', ext: '+51' },
    { code: 'PH', name: 'Philippines', ext: '+63' },
    { code: 'PL', name: 'Poland', ext: '+48' },
    { code: 'PM', name: 'Saint Pierre & Miquelon', ext: '+508' },
    { code: 'PR', name: 'Puerto Rico', ext: '+1-787' },
    { code: 'PT', name: 'Portugal', ext: '+351' },
    { code: 'PY', name: 'Paraguay', ext: '+595' },
    { code: 'RE', name: 'Réunion', ext: '+262' },
    { code: 'RO', name: 'Romania', ext: '+40' },
    { code: 'RS', name: 'Serbia', ext: '+381' },
    { code: 'RU', name: 'Russia', ext: '+7' },
    { code: 'RW', name: 'Rwanda', ext: '+250' },
    { code: 'SC', name: 'Seychelles', ext: '+248' },
    { code: 'SD', name: 'Sudan', ext: '+249' },
    { code: 'SE', name: 'Sweden', ext: '+46' },
    { code: 'SG', name: 'Singapore', ext: '+65' },
    { code: 'SH', name: 'Saint Helena', ext: '+290' },
    { code: 'SI', name: 'Slovenia', ext: '+386' },
    { code: 'SJ', name: 'Svalbard & Jan Mayen', ext: '+47' },
    { code: 'SK', name: 'Slovakia', ext: '+421' },
    { code: 'SL', name: 'Sierra Leone', ext: '+232' },
    { code: 'SM', name: 'San Marino', ext: '+378' },
    { code: 'SN', name: 'Senegal', ext: '+221' },
    { code: 'SO', name: 'Somalia', ext: '+252' },
    { code: 'SR', name: 'Suriname', ext: '+597' },
    { code: 'SS', name: 'South Sudan', ext: '+211' },
    { code: 'ST', name: 'São Tomé & Príncipe', ext: '+239' },
    { code: 'SV', name: 'El Salvador', ext: '+503' },
    { code: 'SX', name: 'Sint Maarten', ext: '+1-721' },
    { code: 'SZ', name: 'Eswatini', ext: '+268' },
    { code: 'TC', name: 'Turks & Caicos Islands', ext: '+1-649' },
    { code: 'TD', name: 'Chad', ext: '+235' },
    { code: 'TG', name: 'Togo', ext: '+228' },
    { code: 'TH', name: 'Thailand', ext: '+66' },
    { code: 'TN', name: 'Tunisia', ext: '+216' },
    { code: 'TO', name: 'Tonga', ext: '+676' },
    { code: 'TR', name: 'Turkey', ext: '+90' },
    { code: 'TT', name: 'Trinidad & Tobago', ext: '+1-868' },
    { code: 'TW', name: 'Taiwan', ext: '+886' },
    { code: 'TZ', name: 'Tanzania', ext: '+255' },
    { code: 'UA', name: 'Ukraine', ext: '+380' },
    { code: 'UG', name: 'Uganda', ext: '+256' },
    { code: 'US', name: 'United States', ext: '+1' },
    { code: 'UY', name: 'Uruguay', ext: '+598' },
    { code: 'VA', name: 'Vatican City', ext: '+39-06' },
    { code: 'VC', name: 'Saint Vincent & Grenadines', ext: '+1-784' },
    { code: 'VE', name: 'Venezuela', ext: '+58' },
    { code: 'VG', name: 'British Virgin Islands', ext: '+1-284' },
    { code: 'VI', name: 'U.S. Virgin Islands', ext: '+1-340' },
    { code: 'VN', name: 'Vietnam', ext: '+84' },
    { code: 'VU', name: 'Vanuatu', ext: '+678' },
    { code: 'XK', name: 'Kosovo', ext: '+383' },
    { code: 'YT', name: 'Mayotte', ext: '+262' },    
    { code: 'ZM', name: 'Zambia', ext: '+260' }    
];

// Document Types
export const documentTypes = {

    Dealership: [
      'Dekra Report',
      'AA Report',
      'Transunion Report',
      'Lightstone Report',
      'Service History',
      'Vehicle Inspection',
      'Warranty Information',      
    ],
    Property: [],
    Goods: [],
    Rentals: [],    
};
  
// User Keys Map
export const userKeysMap = {
    '{email}': 'Email',
    '{knownAs}': 'Known As',
    '{title}': 'Title',
    '{firstName}': 'First Name',
    '{middleName}': 'Middle Name',
    '{surname}': 'Surname',
    '{idOrPassportNr}': 'ID or Passport Number',
    '{gender}': 'Gender',
    '{dateOfBirth}': 'Date of Birth',
    '{nasionality}': 'Nationality',
    '{phoneNr}': 'Phone Number',
    '{addressLine1}': 'Address Line 1',
    '{addressLine2}': 'Address Line 2',
    '{suburb}': 'Suburb',
    '{city}': 'City',
    '{zip}': 'ZIP Code',
    '{province}': 'Province',
    '{country}': 'Country'
};

export const feedStructures = [
  // 1. Google Merchant Center
  {
    platform: 'google-shopping',
    label:    'Google Shopping Feed',
    formats:  ['xml', 'tsv'],
    type: ['Goods'],
    fields: [
      { feed: 'id',            dbKey: '_id' },
      { feed: 'title',         dbKey: 'fullDescription' },
      { feed: 'description',   dbKey: 'description' },
      { feed: 'link',          dbKey: 'permalink' },
      { feed: 'image_link',    dbKey: 'images[0].url' },
      { feed: 'price',         dbKey: 'price' },
      { feed: 'brand',         dbKey: 'brand' },
      { feed: 'availability',  dbKey: 'availability', default: 'in stock', enum: ['in stock', 'out of stock', 'preorder', 'backorder']},
      { feed: 'identifier_exists', dbKey: 'identifierExists', default: 'TRUE', enum:    ['TRUE', 'FALSE']},
      { feed: 'condition',  dbKey:   'condition', default: 'new', enum:    ['new', 'refurbished', 'used']},
      { feed: 'shipping.country',  dbKey: 'location.country', default: 'ZA' },
      { feed: 'shipping.service',  dbKey: 'shipping.service', default: 'Standard' },
      { feed: 'shipping.price',    dbKey: 'shipping.price',   default: '0 ZAR' }      
    ],
    
  },

  // 2. Microsoft Advertising – shopping campaigns
  {
    platform: 'microsoft-shopping',
    label:    'Microsoft Shopping Feed',
    formats:  ['tsv'],
    fields: [
      { feed: 'id',            dbKey: '_id' },
      { feed: 'title',         dbKey: 'fullDescription' },
      { feed: 'description',   dbKey: 'description' },
      { feed: 'link',          dbKey: 'permalink' },
      { feed: 'image_link',    dbKey: 'images[0].url' },
      { feed: 'availability',  dbKey: 'availability' },
      { feed: 'price',         dbKey: 'price' },
      { feed: 'brand',         dbKey: 'brand' },
      { feed: 'condition',     dbKey: 'condition' }
    ]
  },

  // 3. Meta Commerce Manager – powers Facebook & Instagram catalogues
  {
    platform: 'meta-catalog',
    label:    'Meta Catalog Feed (Facebook + Instagram)',
    formats:  ['csv', 'tsv', 'xml', 'google-sheet'],
    fields: [
      { feed: 'retailer_id',   dbKey: '_id' },
      { feed: 'name',          dbKey: 'fullDescription' },
      { feed: 'description',   dbKey: 'description' },
      { feed: 'url',           dbKey: 'permalink' },
      { feed: 'image_url',     dbKey: 'images[0].url' },
      { feed: 'availability',  dbKey: 'availability' },
      { feed: 'price',         dbKey: 'price' },
      { feed: 'brand',         dbKey: 'brand' },
      { feed: 'condition',     dbKey: 'condition' }
    ]
  },

  // 4. TikTok Shop / Commerce
  {
    platform: 'tiktok-catalog',
    label:    'TikTok Catalog Feed',
    formats:  ['csv', 'tsv'],
    fields: [
      { feed: 'product_id',    dbKey: '_id' },
      { feed: 'title',         dbKey: 'fullDescription' },
      { feed: 'description',   dbKey: 'description' },
      { feed: 'product_url',   dbKey: 'permalink' },
      { feed: 'image_url',     dbKey: 'images[0].url' },
      { feed: 'availability',  dbKey: 'availability' },
      { feed: 'price',         dbKey: 'price' },
      { feed: 'brand',         dbKey: 'brand' },
      { feed: 'condition',     dbKey: 'condition' }
    ]
  },

  // 5. Pinterest
  {
    platform: 'pinterest-feed',
    label:    'Pinterest Product Feed',
    formats:  ['csv', 'tsv'],
    fields: [
      { feed: 'id',            dbKey: '_id' },
      { feed: 'title',         dbKey: 'fullDescription' },
      { feed: 'description',   dbKey: 'description' },
      { feed: 'link',          dbKey: 'permalink' },
      { feed: 'image_link',    dbKey: 'images[0].url' },
      { feed: 'availability',  dbKey: 'availability' },
      { feed: 'price',         dbKey: 'price' },
      { feed: 'brand',         dbKey: 'brand' },
      { feed: 'condition',     dbKey: 'condition' }
    ]
  },

  // 6. Snapchat Dynamic Ads
  {
    platform: 'snapchat-feed',
    label:    'Snapchat Product Feed',
    formats:  ['csv', 'tsv'],
    fields: [
      { feed: 'item_id',       dbKey: '_id' },
      { feed: 'title',         dbKey: 'fullDescription' },
      { feed: 'description',   dbKey: 'description' },
      { feed: 'link',          dbKey: 'permalink' },
      { feed: 'image_link',    dbKey: 'images[0].url' },
      { feed: 'availability',  dbKey: 'availability' },
      { feed: 'price',         dbKey: 'price' },
      { feed: 'brand',         dbKey: 'brand' },
      { feed: 'condition',     dbKey: 'condition' }
    ]
  },

  // 7. Twitter / X – dynamic carousel ads
  {
    platform: 'twitter-feed',
    label:    'Twitter / X Product Feed',
    formats:  ['csv'],
    fields: [
      { feed: 'product_id',    dbKey: '_id' },
      { feed: 'product_name',  dbKey: 'fullDescription' },
      { feed: 'product_description', dbKey: 'description' },
      { feed: 'product_url',   dbKey: 'permalink' },
      { feed: 'image_url',     dbKey: 'images[0].url' },
      { feed: 'availability',  dbKey: 'availability' },
      { feed: 'price',         dbKey: 'price' },
      { feed: 'brand',         dbKey: 'brand' },
      { feed: 'condition',     dbKey: 'condition' }
    ]
  }
];

//ADVERTISING

//test

//ADVERTISING PLATFORMS
// Advertising platforms configuration by organization type
export const advertisingPlatforms = {
  Dealership: [
    { value: "meta", label: "Meta (Facebook/Instagram)", feedType: "Vehicle Inventory", format: "CSV, XML, Google Sheet", notes: "For dynamic vehicle ads" },
    { value: "tiktok_inventory", label: "TikTok - Inventory", feedType: "Auto - Inventory", format: "CSV", notes: "For specific car listings" },
    { value: "tiktok_model", label: "TikTok - Model", feedType: "Auto - Model", format: "CSV", notes: "For broader make/model targeting" },
    { value: "microsoft", label: "Microsoft Ads", feedType: "Generic Shopping Feed", format: "TSV", notes: "Treated as products, not vehicle-specific" },
    { value: "evolution", label: "Evolution API", feedType: "JSON/XML", format: "JSON/XML", notes: "Internal SA syndication only" },
    { value: "custom", label: "Custom Feeds", feedType: "CSV/JSON/XML", format: "CSV/JSON/XML", notes: "For B2B, franchises, internal tools" }
  ],
  Goods: [
    { value: "google_shopping", label: "Google Shopping", feedType: "Product Feed", format: "XML, TSV, CSV, Google Sheet", notes: "Fully supported in SA" },
    { value: "meta_catalog", label: "Meta Catalog", feedType: "E-commerce", format: "CSV, XML, TSV, Sheet", notes: "For Facebook/Instagram Shops and ads" },
    { value: "tiktok_commerce", label: "TikTok", feedType: "E-commerce", format: "CSV", notes: "For TikTok Shop and Dynamic Showcase Ads" },
    { value: "microsoft_shopping", label: "Microsoft Shopping", feedType: "Product Feed", format: "TSV", notes: "Limited volume in SA, but supported" },
    { value: "pinterest", label: "Pinterest", feedType: "Product Feed", format: "CSV", notes: "Less common in SA" },
    { value: "snapchat", label: "Snapchat", feedType: "Product Feed", format: "CSV", notes: "Via Dynamic Ads setup" },
    { value: "evolution", label: "Evolution API", feedType: "JSON/XML", format: "JSON/XML", notes: "For SA 3rd-party platforms" },
    { value: "custom", label: "Custom Feeds", feedType: "CSV/JSON/XML", format: "CSV/JSON/XML", notes: "Export to FTP/API, shared with resellers" }
  ],
  Property: [
    { value: "meta_catalog", label: "Meta Catalog", feedType: "Real Estate (Property)", format: "CSV/XML", notes: "Used for Facebook dynamic ads" },
    { value: "tiktok_destination", label: "TikTok", feedType: "Destination", format: "CSV", notes: "Creative workaround for showcasing property as an activity or product" },
    { value: "custom", label: "Custom Feeds", feedType: "CSV/JSON", format: "CSV/JSON", notes: "Internal use or for white-label portals" }
  ],
  Rentals: [
    { value: "meta_catalog", label: "Meta Catalog", feedType: "Rentals (via Property feed)", format: "CSV/XML", notes: "Can tag rentals dynamically" },
    { value: "tiktok_destination", label: "TikTok", feedType: "Destination", format: "CSV", notes: "For showcasing short/long-term rentals" },
    { value: "custom", label: "Custom Feeds", feedType: "CSV/JSON", format: "CSV/JSON", notes: "For internal systems or small portals" }
  ],
  Accomodation: [
    { value: "meta_catalog", label: "Meta Catalog", feedType: "Hotel/Travel Ads", format: "CSV/XML", notes: "For lodging/reservations ads" },
    { value: "tiktok_hotel", label: "TikTok", feedType: "Hotel", format: "CSV", notes: "Dedicated hotel feed option now available" },
    { value: "custom", label: "Custom Feeds", feedType: "CSV/JSON", format: "CSV/JSON", notes: "Used by B&Bs, guesthouses, local booking sites" }
  ]
};

// Campaign type options
export const campaignTypes = [
  { value: "awareness", label: "Brand Awareness", description: "Increase visibility and recognition of your brand" },
  { value: "consideration", label: "Consideration", description: "Drive interest and engagement with your products or services" },
  { value: "conversion", label: "Conversion", description: "Generate leads, sales, or specific customer actions" },
  { value: "loyalty", label: "Loyalty & Retention", description: "Engage existing customers and encourage repeat business" }
];

// Default campaign state
export const defaultCampaignState = {
  name: "",
  campaignType: "",
  action: "Draft",
  platform: "",
  feedType: "",
  audience: {
    ageRange: { min: 18, max: 65 },
    gender: "all",
    interests: [],
    behaviors: [],
    customAudiences: []
  },
  inventory: {
    filters: {},
    selectedItems: []
  },
  budget: {
    total: 0,
    daily: 0,
    bidStrategy: "automatic"
  },
  schedule: {
    startDate: null,
    endDate: null,
    isOngoing: true
  },
  creatives: {
    headlines: [],
    descriptions: [],
    images: [],
    videos: [],
    callToAction: "Learn More"
  }
};

// Helper function to get available platforms based on organization type
export const getPlatformsByType = (orgType) => {
  return advertisingPlatforms[orgType] || [];
};

// Call to Action options
export const callToActionOptions = [
  { value: "learn_more", label: "Learn More" },
  { value: "shop_now", label: "Shop Now" },
  { value: "book_now", label: "Book Now" },
  { value: "sign_up", label: "Sign Up" },
  { value: "contact_us", label: "Contact Us" },
  { value: "apply_now", label: "Apply Now" },
  { value: "get_offer", label: "Get Offer" },
  { value: "get_quote", label: "Get Quote" },
  { value: "download", label: "Download" }
];
