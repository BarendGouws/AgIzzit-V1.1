// components/CampaignMap.js
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically load the map component with no SSR
const Map = dynamic(
  () => {
    // Import the react-leaflet components and set up the icons
    return import('react-leaflet').then(async (mod) => {
      const { MapContainer, TileLayer, Circle, Marker, Popup, useMap, GeoJSON, Tooltip } = mod;
      
      // Import leaflet for icon setup
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      
      // Fix for marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      
      // Create custom city marker icon - blue with distinctive shape
      const cityIcon = new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41],
        className: 'city-marker' // Add a custom class for additional styling
      });
      
      // Component to fit map to bounds
      // Updated MapController component to handle per-location radius values
    const MapController = ({ locations, targetType, radius, geoData }) => {
        const map = useMap();
        const [mapReady, setMapReady] = useState(false);
        
        // Initialize map when it's ready
        useEffect(() => {
            try {
                if (map && !mapReady) {
                    // Make sure the map is fully initialized
                    map.whenReady(() => {
                        // Ensure the map container has the correct size
                        map.invalidateSize();
                        setMapReady(true);
                    });
                }
            } catch (err) {
                console.error('Error in map initialization:', err);
            }
        }, [map, mapReady]);
        
        // Function to get bounds of selected provinces for province targeting
        const getProvinceBounds = (geoJsonData) => {
            if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length === 0) {
                return null;
            }

            try {
                const bounds = L.latLngBounds();
                
                geoJsonData.features.forEach(feature => {
                    if (feature.geometry?.coordinates) {
                        // Handle different geometry types
                        if (feature.geometry.type === 'Polygon') {
                            // For Polygon, coordinates are an array of arrays of coordinates
                            feature.geometry.coordinates[0].forEach(coord => {
                                // In GeoJSON, coordinates are [lng, lat], but Leaflet uses [lat, lng]
                                bounds.extend([coord[1], coord[0]]);
                            });
                        } else if (feature.geometry.type === 'MultiPolygon') {
                            // For MultiPolygon, coordinates are an array of arrays of arrays of coordinates
                            feature.geometry.coordinates.forEach(polygonCoords => {
                                polygonCoords[0].forEach(coord => {
                                    bounds.extend([coord[1], coord[0]]);
                                });
                            });
                        }
                    }
                });
                
                return bounds.isValid() ? bounds : null;
            } catch (err) {
                console.error('Error getting province bounds:', err);
                return null;
            }
        };
        
        // Calculate the optimal map view area for multiple locations
        const getOptimalBoundsForLocations = () => {
            if (!locations || locations.length === 0) {
                return null;
            }
            
            try {
                // Create a bounds object to encompass all locations
                const locationsBounds = L.latLngBounds();
                let hasValidLocation = false;
                
                // Add each location to the bounds
                locations.forEach(location => {
                    if (location.latitude && location.longitude) {
                        const lat = parseFloat(location.latitude);
                        const lng = parseFloat(location.longitude);
                        
                        if (isNaN(lat) || isNaN(lng)) {
                            return;
                        }
                        
                        locationsBounds.extend([lat, lng]);
                        hasValidLocation = true;
                    }
                });
                
                if (!hasValidLocation) {
                    return null;
                }
                
                // Instead of using the full bounds, if there are multiple locations, 
                // analyze the distance between them and adjust the zoom accordingly
                if (locations.length > 1) {
                    // Get the center of all the locations
                    const center = locationsBounds.getCenter();
                    
                    // Calculate max distance from center to any point
                    let maxDistance = 0;
                    locations.forEach(location => {
                        if (location.latitude && location.longitude) {
                            const lat = parseFloat(location.latitude);
                            const lng = parseFloat(location.longitude);
                            
                            if (isNaN(lat) || isNaN(lng)) {
                                return;
                            }
                            
                            const point = L.latLng(lat, lng);
                            const distance = center.distanceTo(point);
                            maxDistance = Math.max(maxDistance, distance);
                        }
                    });
                    
                    // Create a new bounds based on center and maxDistance
                    // This helps to not zoom out too much for distant locations
                    // The 1.5 factor adds a bit of padding to ensure all locations are visible
                    const paddingFactor = 1.5;
                    const optimizedBounds = L.latLngBounds(
                        [center.lat - 0.01 * paddingFactor, center.lng - 0.01 * paddingFactor],
                        [center.lat + 0.01 * paddingFactor, center.lng + 0.01 * paddingFactor]
                    );
                    
                    // Ensure all locations are within these bounds
                    locations.forEach(location => {
                        if (location.latitude && location.longitude) {
                            optimizedBounds.extend([
                                parseFloat(location.latitude), 
                                parseFloat(location.longitude)
                            ]);
                        }
                    });
                    
                    return optimizedBounds;
                }
                
                // For a single location or no optimization, return the regular bounds
                return locationsBounds;
            } catch (err) {
                console.error('Error calculating optimal bounds:', err);
                return null;
            }
        };
        
        // Function to get bounds with radius for locations
        const getCircleBounds = () => {
            if (!locations || locations.length === 0) {
                return null;
            }
            
            try {
                const bounds = L.latLngBounds();
                let hasValidLocation = false;
                
                // For each location, calculate the bounds including the radius
                locations.forEach(location => {
                    if (location.latitude && location.longitude) {
                        const lat = parseFloat(location.latitude);
                        const lng = parseFloat(location.longitude);
                        
                        // Check if coordinates are valid numbers
                        if (isNaN(lat) || isNaN(lng)) {
                            return;
                        }
                        
                        const center = L.latLng(lat, lng);
                        
                        // Get the location-specific radius, or fall back to the global radius, or default to 25
                        const radiusInKm = location.radius || radius || 25;
                        
                        // Create a bounding box that includes the circle radius
                        // First, add the center point
                        bounds.extend(center);
                        
                                            // Create a bounding box that includes the circle radius
                        // First, add the center point
                        bounds.extend(center);
                        
                        // For very small radius values, we just add a small padding instead of calculating points
                        if (radiusInKm < 2) {
                            // Just use the center with a small padding for very small radius
                            hasValidLocation = true;
                            return;
                        }
                        
                        // Now add points on the circumference of the circle in cardinal directions
                        const radiusInMeters = radiusInKm * 1000;
                        const earthRadius = 6378137; // Earth's radius in meters
                        
                        // Calculate points in cardinal directions
                        const points = [0, 90, 180, 270].map(angle => {
                            const angleRad = angle * Math.PI / 180;
                            // Calculate offset using haversine approximation
                            const latOffset = (radiusInMeters * Math.cos(angleRad)) / earthRadius * (180 / Math.PI);
                            const lngOffset = (radiusInMeters * Math.sin(angleRad)) / (earthRadius * Math.cos(center.lat * Math.PI / 180)) * (180 / Math.PI);
                            
                            return L.latLng(center.lat + latOffset, center.lng + lngOffset);
                        });
                        
                        // Add all these points to the bounds
                        points.forEach(point => bounds.extend(point));
                        
                        hasValidLocation = true;
                    }
                });
                
                return hasValidLocation ? bounds : null;
            } catch (err) {
                console.error('Error getting circle bounds:', err);
                return null;
            }
        };
        
        // Calculate appropriate zoom level based on distances between locations
        const calculateOptimalZoom = (bounds) => {
            try {
                if (!bounds || !bounds.isValid()) {
                    return null;
                }
                
                // Get the bounds dimensions in degrees
                const width = bounds.getEast() - bounds.getWest();
                const height = bounds.getNorth() - bounds.getSouth();
                
                // Calculate the diagonal distance in degrees (rough approximation)
                const diagonalDistance = Math.sqrt(width * width + height * height);
                
                // Based on diagonal distance in degrees, calculate a reasonable zoom level
                // These values are tuned for South Africa specifically
                if (diagonalDistance < 0.05) return 13; // Very close points (~5km)
                if (diagonalDistance < 0.1) return 12;  // Close points (~10km)
                if (diagonalDistance < 0.3) return 11;  // Nearby towns (~30km)
                if (diagonalDistance < 0.6) return 10;  // Cities in same region (~60km)
                if (diagonalDistance < 1.5) return 9;   // Within same province (~150km)
                if (diagonalDistance < 3.0) return 8;   // Multiple provinces (~300km)
                if (diagonalDistance < 6.0) return 7;   // Large portion of country (~600km)
                if (diagonalDistance < 10.0) return 6;  // Most of country (~1000km)
                return 5; // Full country view
            } catch (err) {
                console.error('Error calculating optimal zoom:', err);
                return null;
            }
        };
        
        // Update map view when locations, target type, or radius changes
        useEffect(() => {
            if (!mapReady || !map) {
                return;
            }
            
            try {
                // For national view, just set a fixed view of South Africa
                if (targetType === 'national') {
                    // Use setView instead of fitBounds for national view
                    map.setView([-30.5595, 22.9375], 5, {
                        animate: true,
                        duration: 0.5
                    });
                    return;
                }
                
                // Get the appropriate bounds based on target type
                let bounds = null;
                
                switch (targetType) {
                    case 'province':
                        // For province targeting, use the filtered GeoJSON bounds
                        if (geoData) {
                            bounds = getProvinceBounds(geoData);
                            
                            // If we got valid bounds from GeoJSON
                            if (bounds && bounds.isValid()) {
                                // Calculate optimal zoom based on the province size
                                const optimalZoom = calculateOptimalZoom(bounds);
                                
                                // Use a smaller padding for province view to show more detail
                                map.fitBounds(bounds, {
                                    padding: [20, 20], // Smaller padding for province view
                                    maxZoom: optimalZoom || 9,
                                    animate: false // Disable animation to avoid _leaflet_pos errors
                                });
                                return;
                            }
                        }
                        
                        // Fallback to location bounds if no GeoJSON or invalid bounds
                        bounds = getOptimalBoundsForLocations();
                        break;
                        
                    case 'city':
                        // For city targeting, get optimal bounds for the selected locations
                        bounds = getOptimalBoundsForLocations();
                        break;
                        
                    case 'radius':
                        // For radius targeting, include the radius in the bounds calculation
                        bounds = getCircleBounds();
                        
                        // If the radius bounds calculation failed, fall back to optimized location bounds
                        if (!bounds || !bounds.isValid()) {
                            bounds = getOptimalBoundsForLocations();
                        }
                        break;
                        
                    default:
                        // Default case, just use optimized location bounds
                        bounds = getOptimalBoundsForLocations();
                        break;
                }
                
                // If we have valid bounds, fit the map to them
                if (bounds && bounds.isValid()) {
                    // Calculate optimal zoom based on the bounds
                    const optimalZoom = calculateOptimalZoom(bounds);
                    
                    // Adjust padding based on number of locations and distance between them
                    let padding = 50; // Default padding
                    
                    if (locations.length > 1) {
                        // The diagonal size in degrees
                        const diagonal = Math.sqrt(
                            Math.pow(bounds.getEast() - bounds.getWest(), 2) + 
                            Math.pow(bounds.getNorth() - bounds.getSouth(), 2)
                        );
                        
                        // Adjust padding inversely to the distance - closer items get more padding
                        if (diagonal < 0.5) {
                            padding = 100; // Closer locations get more padding
                        } else if (diagonal < 2) {
                            padding = 75; // Medium distance
                        } else {
                            padding = 50; // Far apart locations
                        }
                    } else if (targetType === 'radius') {
                        // Check if we have a location-specific radius
                        const locationRadius = locations[0].radius || radius || 25;
                        
                        // For small radius, use larger padding to show context
                        if (locationRadius < 10) {
                            padding = 75;
                        }
                    }
                    
                    // Fit bounds with calculated settings
                    map.fitBounds(bounds, {
                        padding: [padding, padding],
                        maxZoom: optimalZoom || 10,
                        animate: false // Disable animation to avoid _leaflet_pos errors
                    });
                } else {
                    // Default view of South Africa
                    map.setView([-30.5595, 22.9375], 5);
                }
            } catch (err) {
                console.error('Error updating map view:', err);
                
                // Fallback to default view
                try {
                    map.setView([-30.5595, 22.9375], 5);
                } catch (fallbackErr) {
                    console.error('Even fallback view failed:', fallbackErr);
                }
            }
        }, [locations, targetType, radius, map, geoData, mapReady]);
        
        return null;
    };
      


// BoundariesLayer component to show the appropriate geographic boundaries
        const BoundariesLayer = ({ targetType, locations, radius }) => {
            const [nationalGeoJSON, setNationalGeoJSON] = useState(null);
            const [provincialGeoJSON, setProvincialGeoJSON] = useState(null);
            const [filteredGeoJSON, setFilteredGeoJSON] = useState(null);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState(null);
            
            // Style for all GeoJSON features
            const geoJSONStyle = {
                fillColor: '#0d6efd',
                fillOpacity: 0.15,
                color: '#0d6efd',
                weight: 2
            };
            
            // Fetch GeoJSON data from local files
            useEffect(() => {
                const fetchData = async () => {
                    try {
                        setLoading(true);
                        
                        try {
                            // Fetch national GeoJSON
                            const nationalResponse = await fetch('/geo/national.json');
                            if (!nationalResponse.ok) {
                                throw new Error(`HTTP error fetching national GeoJSON! Status: ${nationalResponse.status}`);
                            }
                            const nationalData = await nationalResponse.json();
                            setNationalGeoJSON(nationalData);
                        } catch (nationalError) {
                            console.error('Error fetching national GeoJSON:', nationalError);
                            // Continue with provincial data even if national fails
                        }
                        
                        try {
                            // Fetch provincial GeoJSON
                            const provincialResponse = await fetch('/geo/provincial.json');
                            if (!provincialResponse.ok) {
                                throw new Error(`HTTP error fetching provincial GeoJSON! Status: ${provincialResponse.status}`);
                            }
                            const provincialData = await provincialResponse.json();
                            setProvincialGeoJSON(provincialData);
                        } catch (provincialError) {
                            console.error('Error fetching provincial GeoJSON:', provincialError);
                        }
                        
                        setLoading(false);
                    } catch (err) {
                        console.error('Error fetching GeoJSON data:', err);
                        setError(err.message);
                        setLoading(false);
                    }
                };
                
                fetchData();
            }, []);
            
            // Filter provinces based on selected locations with fuzzy matching
            useEffect(() => {
                if (targetType === 'province' && provincialGeoJSON && locations && locations.length > 0) {
                    try {
                        // Get unique provinces from locations (lowercase for case-insensitive comparison)
                        const wantedProvinces = locations
                            .map(l => l.province?.toLowerCase())
                            .filter(Boolean);
                        
                        // Define province names and their possible variations
                        const provinceVariations = {
                            'western cape': ['western cape', 'wc', 'west cape'],
                            'eastern cape': ['eastern cape', 'ec', 'east cape'],
                            'northern cape': ['northern cape', 'nc', 'north cape'],
                            'north west': ['north west', 'nw', 'northwest'],
                            'free state': ['free state', 'fs'],
                            'kwazulu-natal': ['kwazulu-natal', 'kwazulu natal', 'kzn', 'natal'],
                            'gauteng': ['gauteng', 'gp', 'gt'],
                            'mpumalanga': ['mpumalanga', 'mp'],
                            'limpopo': ['limpopo', 'lp'],
                        };
                        
                        // Prepare normalized province names for fuzzy matching
                        const normalizedWantedProvinces = wantedProvinces.map(province => {
                            // Check if the province matches any of our known variations
                            for (const [standardName, variations] of Object.entries(provinceVariations)) {
                                if (variations.some(variation => 
                                    province.includes(variation) || variation.includes(province)
                                )) {
                                    return standardName;
                                }
                            }
                            return province; // Keep as is if no match found
                        });
                        
                        // Check the data structure - try multiple property fields
                        const matchedFeatures = provincialGeoJSON.features.filter(feature => {
                            // Try all possible property fields that might contain province names
                            const propertyFields = [
                                'ADM1_EN', 'ADM1ALT1EN', 'ADM1ALT2EN', 'name', 'NAME', 'NAME_1', 
                                'province', 'PROVINCE', 'PROV_NAME'
                            ];
                            
                            for (const field of propertyFields) {
                                if (feature.properties?.[field]) {
                                    const featureProvince = feature.properties[field].toLowerCase();
                                    
                                    // Check against all normalized province names
                                    for (const wantedProvince of normalizedWantedProvinces) {
                                        // Check for exact match
                                        if (featureProvince === wantedProvince) {
                                            return true;
                                        }
                                        
                                        // Check for inclusion
                                        if (featureProvince.includes(wantedProvince) || 
                                            wantedProvince.includes(featureProvince)) {
                                            return true;
                                        }
                                        
                                        // Check against known variations
                                        for (const [standardName, variations] of Object.entries(provinceVariations)) {
                                            if (variations.includes(featureProvince) && 
                                                normalizedWantedProvinces.includes(standardName)) {
                                                return true;
                                            }
                                        }
                                    }
                                }
                            }
                            
                            return false;
                        });
                        
                        if (matchedFeatures.length > 0) {
                            console.log(`Found ${matchedFeatures.length} matching provinces`);
                            setFilteredGeoJSON({
                                type: 'FeatureCollection',
                                features: matchedFeatures
                            });
                        } else {
                            console.warn('No matching provinces found for:', normalizedWantedProvinces);
                            setFilteredGeoJSON(null);
                        }
                    } catch (err) {
                        console.error('Error filtering provinces:', err);
                        setFilteredGeoJSON(null);
                    }
                } else {
                    setFilteredGeoJSON(null);
                }
            }, [targetType, provincialGeoJSON, locations]);
            
            // Render location markers based on target type
            const renderLocationMarkers = () => {
                if (!locations || locations.length === 0) return null;
                
                return locations.map((location, index) => {
                    if (!location.latitude || !location.longitude) return null;
                    
                    try {
                        const position = [
                            parseFloat(location.latitude), 
                            parseFloat(location.longitude)
                        ];
                        
                        // Check if position values are valid numbers
                        if (isNaN(position[0]) || isNaN(position[1])) {
                            console.warn('Invalid coordinates for location:', location);
                            return null;
                        }
                        
                        // For city targeting, use a city icon with a tooltip
                        if (targetType === 'city') {
                            return (
                                <Marker 
                                    key={`city-marker-${location.id || index}`}
                                    position={position}
                                    icon={cityIcon}
                                >
                                    <Popup>
                                        <div>
                                            <strong>{location.name}</strong>
                                            {location.city && <div>{location.city}, {location.province || ''}</div>}
                                        </div>
                                    </Popup>
                                    <Tooltip permanent>{location.city || location.name}</Tooltip>
                                </Marker>
                            );
                        }
                        
                        // For other targeting types, use regular markers
                        return (
                            <Marker 
                                key={`marker-${location.id || index}`} 
                                position={position}
                            >
                                <Popup>
                                    <div>
                                        <strong>{location.name}</strong>
                                        {location.city && <div>{location.city}, {location.province || ''}</div>}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    } catch (err) {
                        console.error('Error rendering marker:', err);
                        return null;
                    }
                }).filter(Boolean); // Filter out null values
            };
            
            // Safely render GeoJSON with error handling
            const SafeGeoJSON = ({ data, style }) => {
                if (!data || !data.features || data.features.length === 0) {
                    return null;
                }
                
                try {
                    return <GeoJSON key={targetType} data={data} style={style} />;
                } catch (err) {
                    console.error('Error rendering GeoJSON:', err);
                    return null;
                }
            };
            
            // National targeting - show South Africa national boundary
            if (targetType === 'national') {
                if (loading) return null;
                
                if (error || !nationalGeoJSON) {
                    console.warn('Using fallback for national boundary due to error:', error);
                    return (
                        <>
                            <MapController locations={locations} targetType={targetType} />
                            {renderLocationMarkers()}
                        </>
                    );
                }
                
                return (
                    <>
                        <MapController 
                            locations={locations} 
                            targetType={targetType} 
                            geoData={nationalGeoJSON} 
                        />
                        <SafeGeoJSON 
                            data={nationalGeoJSON} 
                            style={() => geoJSONStyle} 
                        />
                        {renderLocationMarkers()}
                    </>
                );
            }
            
            // Province targeting - show only the provinces of the selected locations
            if (targetType === 'province' && locations && locations.length > 0) {
                if (loading) return null;
                
                // Using the actual provincial data
                if (filteredGeoJSON && filteredGeoJSON.features && filteredGeoJSON.features.length > 0) {
                    return (
                        <>
                            <MapController 
                                locations={locations} 
                                targetType={targetType} 
                                geoData={filteredGeoJSON} 
                            />
                            <SafeGeoJSON 
                                data={filteredGeoJSON} 
                                style={() => geoJSONStyle} 
                            />
                            {renderLocationMarkers()}
                        </>
                    );
                } else if (error || !provincialGeoJSON) {
                    // Fallback to locations if provincial data couldn't be loaded
                    return (
                        <>
                            <MapController 
                                locations={locations} 
                                targetType={targetType} 
                            />
                            {renderLocationMarkers()}
                        </>
                    );
                }
                
                return (
                    <>
                        <MapController locations={locations} targetType={targetType} />
                        {renderLocationMarkers()}
                    </>
                );
            }
            
            // City targeting - show only city markers (no circles)
            if (targetType === 'city' && locations && locations.length > 0) {
                return (
                    <>
                        <MapController 
                            locations={locations} 
                            targetType={targetType} 
                        />
                        {renderLocationMarkers()}
                    </>
                );
            }
            
            // Radius targeting - show the radius circles
            if (targetType === 'radius' && locations && locations.length > 0) {
                return (
                    <>
                        <MapController 
                            locations={locations} 
                            targetType={targetType} 
                            radius={radius} 
                        />
                        {locations.map((location, index) => {
                            if (!location.latitude || !location.longitude) return null;
                            
                            try {
                                const position = [
                                    parseFloat(location.latitude), 
                                    parseFloat(location.longitude)
                                ];
                                
                                if (isNaN(position[0]) || isNaN(position[1])) {
                                    return null;
                                }
                                
                                // Use location-specific radius if available, otherwise fall back to the global radius
                                const locationRadius = location.radius || radius || 25;
                                
                                return (
                                    <Circle
                                        key={`radius-${location.id || index}`}
                                        center={position}
                                        radius={locationRadius * 1000} // Convert km to meters
                                        pathOptions={{
                                            fillColor: '#0d6efd',
                                            fillOpacity: 0.2,
                                            color: '#0d6efd',
                                            weight: 1
                                        }}
                                    />
                                );
                            } catch (err) {
                                console.error('Error rendering radius circle:', err);
                                return null;
                            }
                        }).filter(Boolean)}
                        {renderLocationMarkers()}
                    </>
                );
            }
            
            // Default case, just return the MapController and markers
            return (
                <>
                    <MapController locations={locations} targetType={targetType} />
                    {renderLocationMarkers()}
                </>
            );
        };
      
      // Return the MapComponent
      // Modify the MapComponent function at the end of CampaignMap.js
return function MapComponent({ 
    locations = [], 
    targetType = 'radius', 
    radius = 25,
    height = '500px', // Increased default height
    className = ''
  }) {
    const defaultCenter = [-30.5595, 22.9375]; // South Africa center
    const defaultZoom = 5;
    
    // Add a style object with z-index control
    const mapContainerStyle = {
      height: '100%', 
      width: '100%', 
      borderRadius: '0.375rem',
      position: 'relative',
      zIndex: 1 // Explicitly set z-index to keep it below fixed elements
    };
    
    return (
      <div style={{ height, width: '100%' }} className={className}>
        <MapContainer
          key={targetType} // Force remount when target type changes
          center={defaultCenter}
          zoom={defaultZoom}
          style={mapContainerStyle}
          // Disable zoom animation to prevent _leaflet_pos errors
          zoomAnimation={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <BoundariesLayer 
            targetType={targetType} 
            locations={locations} 
            radius={radius}
          />
        </MapContainer>
      </div>
    );
  };
    });
  },
  { 
    ssr: false,
    loading: () => (
      <div 
        style={{ 
          height: '500px', // Increased loading height to match component
          width: '100%', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '0.375rem', 
          border: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1 // Match the z-index of the actual map
        }}
      >
        <span>Loading map...</span>
      </div>
    )
  }
);

const CampaignMap = (props) => {
  return <Map {...props} />;
};

export default CampaignMap;