import React, { useState, useEffect, memo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Col, Row, Form, Alert, Nav, Tab, FormGroup, Accordion, Badge, Table } from "react-bootstrap";
import { useRouter } from 'next/router';
import Select from "react-select";
import Pageheader from "@/components/partials/Pageheader";
import StateHandler from "@/components/partials/StateHandler";
import { fetchAdvertisingTemplates } from "@/redux/manage/slices/advertisingTemplates";
import { Edit2, Trash2, Plus } from "lucide-react";
import { campaignTypes, platformOptions, deviceOptions } from '@/utils/config';
import CampaignMap from "@/components/manage/map/CampaignMap";

const NewAdvertisingCampaign = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    
    const { loading, error, success, audienceStats } = useSelector(state => state.advertising);
    const { templates } = useSelector(state => state.advertisingTemplate || { templates: [] });
    const organization = useSelector(state => state.organization?.organization); 
    
    const [activeTab, setActiveTab] = useState("first");
    const [errors, setErrors] = useState({});

    // Default campaign state with simplified structure
    const [campaign, setCampaign] = useState({
        name: '',
        campaignType: '',
        platforms: [],
        template: '',
        action: 'Active',
        campaignId: '',
        locations: [],
        targeting: {
            targetType: 'radius',
            radius: 10,
            locationRadiusValues: {},
            city: '',
            province: '',
            isNational: false,
            audience: 'demographics',
            demographics: {
                ageMin: 18,
                ageMax: 65,
                gender: 'all'
            },
            audienceSelections: {}
        },
        budget: {
            type: 'daily',
            amount: 0,  
            distributionStrategy: 'equal',
            manualDistribution: {}
        },
        devicePreferences: 'all',
        schedule: {
            type: 'immediate',
            startDate: '',
            isActive: true
        },
        searchAds: {
            keywords: [],
            headlines: [],
            descriptions: []
        },
        savedFilters: []
    });

    // Helper input states
    const [keyword, setKeyword] = useState({text: '', matchType: 'EXACT'});
    const [headline, setHeadline] = useState('');
    const [description, setDescription] = useState('');
    const [audienceTargetingValid, setAudienceTargetingValid] = useState(true);

    // Load templates and organization data
    useEffect(() => {
        if (campaign.campaignType && platformOptions[campaign.campaignType]) {
            const allPlatforms = platformOptions[campaign.campaignType].map(option => option.value);
            handleInputChange('platforms', allPlatforms);
        }
        
        if (campaign.campaignType === 'social' || campaign.campaignType === 'shopping') {
            dispatch(fetchAdvertisingTemplates({ page: 1, limit: 100 }));
        }
    }, [campaign.campaignType]);

    // Redirect after successful creation
    useEffect(() => {
        if (success) router.push('/manage/advertising');
    }, [success]);

    // Unified input change handler
    const handleInputChange = (field, value) => {
        // Handle nested paths like 'targeting.radius'
        if (field.includes('.')) {
            const [category, subField] = field.split('.');
            setCampaign(prev => ({
                ...prev,
                [category]: {
                    ...prev[category],
                    [subField]: value
                }
            }));
        } else {
            setCampaign(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };
    
    // Handle campaign type change
    const handleCampaignTypeChange = (selectedOption) => {
        const campaignType = selectedOption?.value || '';
        
        // Get all platforms for the selected campaign type
        const allPlatforms = campaignType ? 
            platformOptions[campaignType]?.map(option => option.value) || [] : [];
        
        setCampaign(prev => ({
            ...prev,
            campaignType: campaignType,
            platforms: allPlatforms,
            template: ''
        }));
    };

    // Validate form for each step
    const validateStep = (step) => {
        let stepErrors = {};
        
        if (step === "first") {
            if (!campaign.name) stepErrors.name = "Campaign name is required";
            if (!campaign.campaignType) stepErrors.campaignType = "Campaign type is required";
        }
        
        else if (step === "second") {
            if (campaign.platforms.length === 0) stepErrors.platforms = "At least one platform is required";
            
            // Add validation for audience targeting
            if (campaign.targeting.audience === 'myAudience') {
                if (!audienceTargetingValid) {
                    stepErrors.audienceTargeting = "You must select a valid campaign purpose";
                }
                if (!campaign.targeting.purpose) {
                    stepErrors.audienceTargeting = "You must select a campaign purpose";
                }
            }     
        }
        
        else if (step === "third") {
            if (campaign.locations.length === 0) stepErrors.locations = "At least one location is required";
        }
        
        else if (step === "fourth") {
            // Validate creative elements based on campaign type
            if (campaign.campaignType === 'search') {
                if (campaign.searchAds.keywords.length === 0) stepErrors.keywords = "At least one keyword is required";
                if (campaign.searchAds.headlines.length === 0) stepErrors.headlines = "At least one headline is required";
                if (campaign.searchAds.descriptions.length === 0) stepErrors.descriptions = "At least one description is required";
            }
            
            if (campaign.campaignType === 'social' || campaign.campaignType === 'shopping') {
                if (!campaign.template) stepErrors.template = "Template selection is required";
            }
        }
        
        else if (step === "fifth") {
            if (!campaign.budget.amount || campaign.budget.amount <= 0) {
                stepErrors.budgetAmount = "Budget amount must be greater than 0";
            }
            
            if (campaign.schedule.type === 'scheduled' && !campaign.schedule.startDate) {
                stepErrors.startDate = "Start date is required for scheduled campaigns";
            }
            
            // Optional: Validate manual budget distribution
            if (campaign.budget.distributionStrategy === 'manual') {
                const totalBudget = Object.values(campaign.budget.manualDistribution).reduce((sum, val) => sum + parseFloat(val || 0), 0);
                if (Math.abs(totalBudget - campaign.budget.amount) > 0.01) {
                    stepErrors.manualDistribution = "The sum of manual budget allocations must equal the total budget";
                }
            }
        }
        
        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    // Handle next tab navigation
    const handleNextClick = () => {
        let nextTab;
        
        switch (activeTab) {
            case "first":
                nextTab = "second";
                break;
            case "second":
                nextTab = "third";
                break;
            case "third":
                nextTab = "fourth";
                break;
            case "fourth":
                nextTab = "fifth";
                break;
            default:
                return;
        }
        
        if (validateStep(activeTab)) {
            setActiveTab(nextTab);
        }
    };
    
    // Handle previous tab navigation
    const handlePreviousClick = () => {
        switch (activeTab) {
            case "second":
                setActiveTab("first");
                break;
            case "third":
                setActiveTab("second");
                break;
            case "fourth":
                setActiveTab("third");
                break;
            case "fifth":
                setActiveTab("fourth");
                break;
            default:
                break;
        }
    };

    // Handle keyword input change
    const handleKeywordChange = (field, value) => {
        setKeyword(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    // Add keyword to searchAds
    const addKeyword = () => {
        if (!keyword.text.trim()) return;
        
        setCampaign(prev => ({
            ...prev,
            searchAds: {
                ...prev.searchAds,
                keywords: [...prev.searchAds.keywords, {...keyword}]
            }
        }));
        
        setKeyword({text: '', matchType: 'EXACT'});
    };
    
    // Remove keyword
    const removeKeyword = (index) => {
        setCampaign(prev => ({
            ...prev,
            searchAds: {
                ...prev.searchAds,
                keywords: prev.searchAds.keywords.filter((_, i) => i !== index)
            }
        }));
    };

    // Add headline
    const addHeadline = () => {
        if (!headline.trim()) return;
        
        setCampaign(prev => ({
            ...prev,
            searchAds: {
                ...prev.searchAds,
                headlines: [...prev.searchAds.headlines, headline]
            }
        }));
        
        setHeadline('');
    };
    
    // Remove headline
    const removeHeadline = (index) => {
        setCampaign(prev => ({
            ...prev,
            searchAds: {
                ...prev.searchAds,
                headlines: prev.searchAds.headlines.filter((_, i) => i !== index)
            }
        }));
    };
    
    // Add description
    const addDescription = () => {
        if (!description.trim()) return;
        
        setCampaign(prev => ({
            ...prev,
            searchAds: {
                ...prev.searchAds,
                descriptions: [...prev.searchAds.descriptions, description]
            }
        }));
        
        setDescription('');
    };
    
    // Remove description
    const removeDescription = (index) => {
        setCampaign(prev => ({
            ...prev,
            searchAds: {
                ...prev.searchAds,
                descriptions: prev.searchAds.descriptions.filter((_, i) => i !== index)
            }
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateStep("fifth")) {
            console.log("Campaign data:", campaign);
            // Uncomment to actually submit
            // dispatch(createAdvertising(campaign));
        }
    };

    // Place this outside any component, at the top of your file
    const buildPurposeValidation = (
        purposes,
        platforms,
        eventConfig,
        calculateMatchedEventsFunc
    ) => {
        const result = {};
        
        purposes.forEach(purpose => {
            const matchedEvents = calculateMatchedEventsFunc(purpose, eventConfig);
            
            // Build platform status object tracking which platforms pass requirements
            const platformStatus = {};
            let highestRequired = 0;
            
            // Check each platform individually
            platforms.forEach(platform => {
                // Only validate platforms that are in the purpose's platforms object
                if (purpose.platforms && purpose.platforms[platform]) {
                    const threshold = purpose.platforms[platform].min;
                    platformStatus[platform] = matchedEvents >= threshold;
                    
                    // Track highest required threshold among selected platforms
                    if (threshold > highestRequired) {
                        highestRequired = threshold;
                    }
                }
            });
            
            // A purpose is valid if ANY selected platform has enough data
            const validPlatforms = platforms.filter(platform => 
                purpose.platforms && purpose.platforms[platform] && platformStatus[platform]
            );
            
            const isValid = validPlatforms.length > 0;
            
            // Build validation result object
            result[purpose.value] = {
                isValid,
                matchedEvents,
                platformStatus,
                highestRequired,
                validPlatforms,
                invalidPlatforms: platforms.filter(platform => 
                    purpose.platforms && purpose.platforms[platform] && !platformStatus[platform]
                )
            };
        });
        
        return result;
    };

    // Audience Targeting Component
   // Replace your current CombinedAudienceTargeting component with this one
    const CombinedAudienceTargeting = React.memo(function CombinedAudienceTargeting({ campaign, handleInputChange, audienceStats, validateNext }) {

        console.log("CombinedAudienceTargeting rendering");
        
        // Define audience options - only 2 options
        const audienceOptions = [
            { value: 'demographics', label: 'Demographics' },
            { value: 'myAudience', label: 'My Audience Targeting' }
        ];
        
        // Event configuration with ordering
        const eventConfig = [
            // CONVERSION EVENTS - Highest priority
            { id: 'purchases', label: 'Completed Sale', value: audienceStats.purchases || 0, category: "Conversion", order: 1 },
            { id: 'financeApplications', label: 'Finance Application', value: audienceStats.financeApplications || 0, category: "Conversion", order: 2 },
            { id: 'checkoutStarted', label: 'Checkout Started', value: audienceStats.checkoutStarted || 0, category: "Conversion", order: 3 },
            { id: 'addedToCart', label: 'Add to Cart', value: audienceStats.addedToCart || 0, category: "Conversion", order: 4 },
            
            // INTENT/LEAD EVENTS
            { id: 'leadInquiries', label: 'Lead Form Submission', value: audienceStats.leadInquiries || 0, category: "Intent / Lead", order: 5 },
            { id: 'callInquiries', label: 'Call Button Click', value: audienceStats.callInquiries || 0, category: "Intent / Lead", order: 6 },
            { id: 'whatsappInquiries', label: 'WhatsApp Inquiry', value: audienceStats.whatsappInquiries || 0, category: "Intent / Lead", order: 7 },
            
            // AWARENESS EVENTS
            { id: 'contentEngagement', label: 'Content Engagement', value: audienceStats.contentEngagement || 0, category: "Awareness / Engagement", order: 8 },
            { id: 'wishlistAdded', label: 'Wishlist Addition', value: audienceStats.wishlistAdded || 0, category: "Awareness / Engagement", order: 9 },
            { id: 'contentSharing', label: 'Content Sharing', value: audienceStats.contentSharing || 0, category: "Awareness / Engagement", order: 10 },
            { id: 'pageViews', label: 'Page Views', value: audienceStats.pageViews || 0, category: "Awareness / Engagement", order: 11 },
            
            // EXCLUDE EVENTS
            { id: 'negativeReviews', label: 'Negative Review', value: audienceStats.negativeReviews || 0, category: "Exclude", order: 12 },
            { id: 'complaint', label: 'Complaint', value: audienceStats.complaint || 0, category: "Exclude", order: 13 },
        ];
        
        // Group events by category - memoized to prevent recalculation
        const eventCategories = React.useMemo(() => {
            return eventConfig.reduce((acc, event) => {
                if (!acc[event.category]) {
                    acc[event.category] = [];
                }
                acc[event.category].push(event);
                return acc;
            }, {});
        }, [eventConfig]);

        // Define campaign purpose options with required audience stats
        const campaignPurposeOptions = [
            { 
                value: 'prospecting', 
                label: 'Prospecting Campaign (Lookalike Audiences)',
                description: 'Target new potential customers who are similar to your existing customers.',
                platforms: {
                    facebook: { name: 'Facebook', min: 100 },
                    instagram: { name: 'Instagram', min: 100 },
                    microsoft: { name: 'Microsoft Ads', min: 100 },
                    google: { name: 'Google Ads', min: 1000 },
                    tiktok: { name: 'TikTok', min: 1000 }
                },
                allowedCategories: ['Conversion', 'Intent / Lead']
            },
            { 
                value: 'midfunnel', 
                label: 'Mid-funnel Remarketing (Website Visitors)',
                description: 'Re-engage visitors who have shown interest but haven\'t converted.',
                platforms: {
                    facebook: { name: 'Facebook', min: 100 },
                    instagram: { name: 'Instagram', min: 100 },
                    microsoft: { name: 'Microsoft Ads', min: 300 },
                    twitter: { name: 'X (Twitter)', min: 300 }
                },
                allowedCategories: ['Awareness / Engagement']
            },
            { 
                value: 'cartabandon', 
                label: 'Cart-abandon / Lead-nurture Ad-set',
                description: 'Target users who added items to cart but didn\'t purchase, or submitted leads.',
                platforms: {
                    facebook: { name: 'Facebook', min: 100 },
                    instagram: { name: 'Instagram', min: 100 },
                    twitter: { name: 'X (Twitter)', min: 100 },
                    microsoft: { name: 'Microsoft Ads', min: 300 }
                },
                allowedCategories: ['Conversion', 'Intent / Lead']
            },
            { 
                value: 'crosssell', 
                label: 'Cross-sell / Win-back (Recent Purchasers)',
                description: 'Target previous customers for repeat purchases or complementary products.',
                platforms: {
                    facebook: { name: 'Facebook', min: 100 },
                    instagram: { name: 'Instagram', min: 100 },
                    microsoft: { name: 'Microsoft Ads', min: 100 },
                    google: { name: 'Google Search', min: 100 }
                },
                allowedCategories: ['Conversion']
            }
        ];
        
        // Initialize state for audience selection
        const [audienceSelections, setAudienceSelections] = useState({});
        const [selectedAudience, setSelectedAudience] = useState(campaign.targeting.audience || 'demographics');
        const [selectedPurpose, setSelectedPurpose] = useState(campaign.targeting.purpose || null);
        
        // Calculate matched events function - memoized to prevent recreation
        const calculateMatchedEvents = React.useCallback((purpose, events) => {
            let runningTotal = 0;
            
            // Get the allowed categories for this purpose
            const allowedCategories = purpose.allowedCategories || [];
            
            // Get all events from allowed categories
            const eventsInAllowedCategories = events.filter(event => 
                allowedCategories.includes(event.category)
            );
            
            // Add up all the values
            for (const event of eventsInAllowedCategories) {
                runningTotal += event.value;
            }
            
            return runningTotal;
        }, []);
        
        // Use useMemo for purposeValidation instead of state
        const purposeValidation = React.useMemo(() => 
            buildPurposeValidation(
                campaignPurposeOptions, 
                campaign.platforms, 
                eventConfig,
                calculateMatchedEvents
            ), 
            [campaign.platforms, eventConfig, campaignPurposeOptions, calculateMatchedEvents]
        );
        
        // Check if all purposes are disabled - memoized to prevent recalculation
        const areAllPurposesDisabled = React.useMemo(() => 
            campaignPurposeOptions.every(option => !purposeValidation[option.value]?.isValid),
            [purposeValidation, campaignPurposeOptions]
        );
        
        // Get platforms that cause issues - memoized to prevent recalculation
        const getProblematicPlatforms = React.useCallback(() => {
            // Find platforms that consistently fail to meet requirements across all purposes
            const problematicPlatforms = [];
            
            campaign.platforms.forEach(platform => {
                // Get all purposes that support this platform
                const supportingPurposes = campaignPurposeOptions.filter(
                    purpose => purpose.platforms && purpose.platforms[platform]
                );
                
                // If no purposes support this platform, it's not defined as problematic
                if (supportingPurposes.length === 0) return;
                
                // Check if this platform fails requirements for all supporting purposes
                const alwaysFails = supportingPurposes.every(purpose => {
                    const validation = purposeValidation[purpose.value];
                    return validation?.platformStatus?.[platform] === false;
                });
                
                if (alwaysFails) {
                    // Find the minimum threshold for this platform across all purposes
                    const minThreshold = Math.min(
                        ...supportingPurposes.map(purpose => purpose.platforms[platform].min)
                    );
                    
                    problematicPlatforms.push({
                        platform,
                        name: supportingPurposes[0]?.platforms[platform]?.name || platform,
                        threshold: minThreshold
                    });
                }
            });
            
            return problematicPlatforms;
        }, [campaign.platforms, purposeValidation, campaignPurposeOptions]);
        
        // Initialize from campaign data
        useEffect(() => {
            if (campaign.targeting && campaign.targeting.audienceSelections) {
                setAudienceSelections(campaign.targeting.audienceSelections);
            }
            
            if (campaign.targeting && campaign.targeting.audience) {
                setSelectedAudience(campaign.targeting.audience);
            } else {
                // Set default if not already set
                handleInputChange('targeting.audience', 'demographics');
            }
            
            if (campaign.targeting && campaign.targeting.purpose) {
                setSelectedPurpose(campaign.targeting.purpose);
            }
        }, [campaign.targeting, handleInputChange]);
        
        // Set validation status for the parent component to prevent navigation
        useEffect(() => {
            if (selectedAudience === 'myAudience') {
                validateNext(selectedPurpose && purposeValidation[selectedPurpose]?.isValid === true);
            } else {
                validateNext(true); // Demographics audience always valid
            }
        }, [selectedAudience, selectedPurpose, purposeValidation, validateNext]);
        
        // Handle audience option selection - memoized to prevent recreation
        const handleAudienceOptionChange = React.useCallback((selected) => {
            const selectedValue = selected ? selected.value : 'demographics';
            setSelectedAudience(selectedValue);
            handleInputChange('targeting.audience', selectedValue);
            
            // Clear purpose if switching to demographics
            if (selectedValue === 'demographics') {
                handleInputChange('targeting.purpose', null);
                setSelectedPurpose(null);
            }
        }, [handleInputChange]);

        // Format number for display
        const formatCount = (count) => {
            if (count >= 1000) {
                return `${(count / 1000).toFixed(1)}k`;
            }
            return count;
        };
        
        // Format number with thousands separator for alerts
        const formatThreshold = (num) => {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        };
        
        // Seed events based on threshold - memoized to prevent recreation
        const seedEvents = React.useCallback((purpose, selectedPlatforms) => {
            if (!purpose) return {};
            
            const result = {};
            let cumulativeValue = 0;
            
            // Get the maximum threshold from the selected platforms
            let maxThreshold = 0;
            
            selectedPlatforms.forEach(platform => {
                if (purpose.platforms && purpose.platforms[platform]) {
                    const platformThreshold = purpose.platforms[platform].min;
                    if (platformThreshold > maxThreshold) {
                        maxThreshold = platformThreshold;
                    }
                }
            });
            
            // If no thresholds found, use default 100
            if (maxThreshold === 0) maxThreshold = 100;
            
            // Get allowed categories for the purpose
            const allowedCategories = purpose.allowedCategories || [];
            
            // Initialize each category with empty array
            allowedCategories.forEach(category => {
                result[category] = [];
            });
            
            // Add all exclusion events
            result["Exclude"] = eventConfig
                .filter(event => event.category === "Exclude")
                .map(event => event.id);
            
            // Sort events by priority/order
            const prioritizedEvents = eventConfig
                .filter(event => allowedCategories.includes(event.category))
                .sort((a, b) => a.order - b.order);
            
            // Add events until we meet the threshold
            for (const event of prioritizedEvents) {
                result[event.category] = result[event.category] || [];
                result[event.category].push(event.id);
                cumulativeValue += event.value;
                
                // Once we've met the threshold, we can stop adding events
                if (cumulativeValue >= maxThreshold) {
                    break;
                }
            }
            
            return result;
        }, [eventConfig]);
        
        // Handle purpose selection - memoized to prevent recreation
        const handlePurposeChange = React.useCallback((purposeValue) => {
            console.log("handlePurposeChange called with:", purposeValue, "current selected:", selectedPurpose);
            
            // Early return if already selected
            if (purposeValue === selectedPurpose) return;
            
            if (!purposeValue) {
                setSelectedPurpose(null);
                handleInputChange('targeting.purpose', null);
                return;
            }
            
            // Don't allow selection of invalid purposes
            const validation = purposeValidation[purposeValue];
            if (!validation || !validation.isValid) {
                return;
            }
            
            // Get the selected purpose details
            const purposeOption = campaignPurposeOptions.find(p => p.value === purposeValue);
            
            // Seed events based on the selected purpose and platforms
            const seededEvents = seedEvents(purposeOption, campaign.platforms);
            
            // Update parent state
            handleInputChange('targeting.purpose', purposeValue);
            handleInputChange('targeting.audienceSelections', seededEvents);
            
            // Update local state
            setAudienceSelections(seededEvents);
            setSelectedPurpose(purposeValue);
        }, [selectedPurpose, purposeValidation, campaignPurposeOptions, campaign.platforms, handleInputChange, seedEvents]);
        
        // Calculate total available events based on selected events
        const calculateTotalSelectedEvents = React.useCallback((selections) => {
            let total = 0;
            
            Object.entries(selections || {}).forEach(([category, eventIds]) => {
                if (category !== "Exclude") { // Don't count exclude events in total
                    eventIds.forEach(eventId => {
                        const event = eventConfig.find(e => e.id === eventId);
                        if (event) {
                            total += event.value;
                        }
                    });
                }
            });
            
            return total;
        }, [eventConfig]);
        
        // Get total number of selected events
        const getSelectedEventsCount = React.useCallback(() => {
            return Object.values(audienceSelections).reduce((total, category) => {
                return total + (category?.length || 0);
            }, 0);
        }, [audienceSelections]);
        
        // Handle event selection change
        const handleEventSelectionChange = React.useCallback((category, eventId, isChecked) => {
            const categoryEvents = audienceSelections[category] || [];
            
            let updatedEvents;
            if (isChecked) {
                updatedEvents = [...categoryEvents, eventId];
            } else {
                updatedEvents = categoryEvents.filter(id => id !== eventId);
            }
            
            const updatedSelections = {
                ...audienceSelections,
                [category]: updatedEvents
            };
            
            setAudienceSelections(updatedSelections);
            handleInputChange('targeting.audienceSelections', updatedSelections);
        }, [audienceSelections, handleInputChange]);
        
        // Remove a specific platform from the selected platforms
        const handleRemovePlatform = React.useCallback((platformToRemove) => {
            const updatedPlatforms = campaign.platforms.filter(p => p !== platformToRemove);
            handleInputChange('platforms', updatedPlatforms);
        }, [campaign.platforms, handleInputChange]);
        
        // Check if event is selected
        const isEventSelected = React.useCallback((category, eventId) => {
            return audienceSelections[category]?.includes(eventId) || false;
        }, [audienceSelections]);
        
        // Memorize checkbox component to prevent re-renders
        const EventCheckbox = memo(({ category, event, checked, onChange }) => (
            <div key={event.id} className="me-3 mb-2" style={{ minWidth: '220px' }}>
                <Form.Check
                    type="checkbox"
                    id={`${category}-${event.id}`}
                    label={`${event.label} (${formatCount(event.value)})`}
                    checked={checked}
                    onChange={(e) => onChange(category, event.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        ));

        // Rendering the component
        return (
            <div className="audience-targeting">
                <Card className="mb-4">
                    <Card.Header>
                        <h6 className="mb-0">Audience Targeting</h6>
                    </Card.Header>
                    <Card.Body>
                        <Form.Group className="form-group mb-4">
                            <Form.Label>Audience Selection</Form.Label>
                            <Select
                                options={audienceOptions}
                                className="basic-select"
                                classNamePrefix="select"
                                onChange={handleAudienceOptionChange}
                                value={audienceOptions.find(option => option.value === selectedAudience)}
                                placeholder="Select audience"
                            />
                        </Form.Group>
                        
                        {selectedAudience === 'demographics' && (
                            <div className="demographics-section mb-4">
                                <h6 className="mb-3">Demographics</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label>Age Range</Form.Label>
                                    <Row>
                                        <Col xs={6}>
                                            <Form.Label>Minimum Age</Form.Label>
                                            <Form.Select
                                                value={campaign.targeting.demographics?.ageMin || 18}
                                                onChange={(e) => {
                                                    const ageMin = parseInt(e.target.value);
                                                    handleInputChange('targeting', {
                                                        ...campaign.targeting,
                                                        demographics: {
                                                            ...campaign.targeting.demographics,
                                                            ageMin
                                                        }
                                                    });
                                                }}
                                            >
                                                {Array.from({ length: 48 }, (_, i) => i + 18).map(age => (
                                                    <option key={age} value={age}>{age}</option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                        <Col xs={6}>
                                            <Form.Label>Maximum Age</Form.Label>
                                            <Form.Select
                                                value={campaign.targeting.demographics?.ageMax || 65}
                                                onChange={(e) => {
                                                    const ageMax = parseInt(e.target.value);
                                                    handleInputChange('targeting', {
                                                        ...campaign.targeting,
                                                        demographics: {
                                                            ...campaign.targeting.demographics,
                                                            ageMax
                                                        }
                                                    });
                                                }}
                                            >
                                                {Array.from({ length: 48 }, (_, i) => i + 18).map(age => (
                                                    <option key={age} value={age}>{age}</option>
                                                ))}
                                                <option value={65}>65+</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Gender</Form.Label>
                                    <Form.Select
                                        value={campaign.targeting.demographics?.gender || 'all'}
                                        onChange={(e) => {
                                            const gender = e.target.value;
                                            handleInputChange('targeting', {
                                                ...campaign.targeting,
                                                demographics: {
                                                    ...campaign.targeting.demographics,
                                                    gender
                                                }
                                            });
                                        }}
                                    >
                                        <option value="all">All Genders</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        )}
                        
                        {selectedAudience === 'myAudience' && (
                            <div className="my-audience-section">
                                <div className="mb-4">
                                    <Form.Group className="mb-4">
                                        <Form.Label>Campaign Purpose</Form.Label>
                                        
                                        {/* Radio button list of alert-style options */}
                                        <div className="campaign-purpose-options">
                                            {campaignPurposeOptions.map((purpose) => {
                                                const validation = purposeValidation[purpose.value] || {};
                                                const isValid = validation.isValid;
                                                
                                                return (
                                                    <Alert 
                                                        key={purpose.value}
                                                        variant={selectedPurpose === purpose.value ? (isValid ? "success" : "warning") : "light"}
                                                        className="mb-3 campaign-purpose-option"
                                                        style={{ cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.7 }}
                                                    >
                                                        <div className="d-flex align-items-center mb-2">
                                                            <Form.Check
                                                                type="radio"
                                                                id={`purpose-${purpose.value}`}
                                                                name="campaign-purpose"
                                                                checked={selectedPurpose === purpose.value}
                                                                onChange={() => {
                                                                    if (isValid) {
                                                                        handlePurposeChange(purpose.value);
                                                                    }
                                                                }}
                                                                className="me-2"
                                                                disabled={!isValid}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <h6 className="mb-0">{purpose.label}</h6>
                                                        </div>
                                                        
                                                        <p className="mb-2">{purpose.description}</p>
                                                        
                                                        {/* Show details if this purpose is selected */}
                                                        {selectedPurpose === purpose.value && (
                                                            <>
                                                                {/* Platform validation status */}
                                                                <div className="mt-2">
                                                                    <strong>Platform Compatibility:</strong>{' '}
                                                                    {validation.validPlatforms && validation.validPlatforms.length > 0 
                                                                        ? validation.validPlatforms.map(p => purpose.platforms[p]?.name || p).join(', ')
                                                                        : 'Not Compatible with Any Selected Platforms'}
                                                                    
                                                                    {validation.invalidPlatforms && validation.invalidPlatforms.length > 0 && (
                                                                        <div className="mt-1">
                                                                            <strong>Insufficient Data For:</strong> {validation.invalidPlatforms.map(p => purpose.platforms[p]?.name || p).join(', ')}
                                                                            {validation.invalidPlatforms.map(platform => (
                                                                                <Button 
                                                                                    key={platform}
                                                                                    variant="outline-danger"
                                                                                    size="sm"
                                                                                    className="ms-2"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleRemovePlatform(platform);
                                                                                    }}
                                                                                >
                                                                                    Remove {purpose.platforms[platform]?.name || platform}
                                                                                </Button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="mt-2">
                                                                        <strong>Total Available Events:</strong> {formatThreshold(validation.matchedEvents || 0)}
                                                                    </div>
                                                                    
                                                                    <div className="mt-2">
                                                                        <strong>Selected Events Total:</strong> {formatThreshold(calculateTotalSelectedEvents(audienceSelections) || 0)}
                                                                        {calculateTotalSelectedEvents(audienceSelections) < validation.highestRequired && (
                                                                            <span className="text-danger ms-2">
                                                                                (Minimum required: {validation.highestRequired})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="mt-3">
                                                                    <Alert variant="info">
                                                                        <strong>Note:</strong> Marketing agent will determine the optimal time window based on available data.
                                                                    </Alert>
                                                                </div>
                                                            </>
                                                        )}
                                                        
                                                        {/* If not selected but not valid, show reason */}
                                                        {selectedPurpose !== purpose.value && !isValid && (
                                                            <div className="mt-2 text-danger">
                                                                <small>
                                                                    Not enough events for this campaign purpose. Minimum required: {validation.highestRequired || 100}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </Alert>
                                                );
                                            })}
                                        </div>
                                        
                                        <Form.Text className="text-muted">
                                            Choose a purpose that matches your advertising goals.
                                        </Form.Text>
                                    </Form.Group>
                                    
                                    {/* No purpose selected warning */}
                                    {selectedAudience === 'myAudience' && !selectedPurpose && (
                                        <Alert variant="warning" className="mb-4">
                                            <strong>Please select a campaign purpose</strong> to continue. This determines how your audience will be targeted.
                                        </Alert>
                                    )}
                                    
                                    {/* All purposes disabled warning */}
                                    {areAllPurposesDisabled && (
                                        <Alert variant="warning" className="mb-4">
                                            <strong>Not enough matched events for any campaign purpose.</strong>
                                            {getProblematicPlatforms().length > 0 && (
                                                <div className="mt-2">
                                                    <strong>Problematic platforms:</strong>
                                                    {getProblematicPlatforms().map((item, index) => (
                                                        <span key={item.platform} className="d-inline-block me-3">
                                                            {item.name} (needs {formatThreshold(item.threshold)} events)
                                                            <Button 
                                                                variant="outline-danger"
                                                                size="sm"
                                                                className="ms-2"
                                                                onClick={() => handleRemovePlatform(item.platform)}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-2">
                                                Remove problematic platforms or collect more data to continue.
                                            </div>
                                        </Alert>
                                    )}
                                    
                                    {/* Not enough total events warning */}
                                    {audienceStats.total < Math.max(...campaignPurposeOptions.flatMap(p => 
                                        Object.values(p.platforms).map(platform => platform.min)
                                    ), 0) && (
                                        <Alert variant="warning" className="mb-4">
                                            <strong>Limited data available:</strong> Your account has fewer events than required for 
                                            optimal targeting. We've pre-selected all available high-quality events, but some campaign 
                                            types may be unavailable until you collect more data.
                                        </Alert>
                                    )}
                                    
                                    {selectedPurpose && (
                                        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                                            <Form.Label className="mb-0 fw-bold">Event-Based Targeting</Form.Label>
                                            <Badge bg="primary" className="px-3 py-2">
                                                {getSelectedEventsCount()} event{getSelectedEventsCount() !== 1 ? 's' : ''} selected
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    {selectedPurpose && campaignPurposeOptions.find(p => p.value === selectedPurpose)?.allowedCategories && (
                                        <Accordion defaultActiveKey={["0", "1", "2", "3"]} className="mb-3" alwaysOpen>
                                            {Object.entries(eventCategories)
                                                .filter(([category]) => 
                                                    category === "Exclude" || 
                                                campaignPurposeOptions.find(p => p.value === selectedPurpose)
                                                    .allowedCategories.includes(category)
                                            )
                                            .map(([category, events], index) => (
                                                <Accordion.Item eventKey={`${index}`} key={category} className="mb-3">
                                                    <Accordion.Header>
                                                        <div className="d-flex justify-content-between align-items-center w-100 me-2">
                                                            <span>{category === "Exclude" ? "Exclude from Campaign" : `Include: ${category}`}</span>
                                                            {(audienceSelections[category]?.length > 0) && (
                                                                <Badge bg={category === "Exclude" ? "danger" : "success"} pill className="me-3">
                                                                    {audienceSelections[category]?.length || 0} selected
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </Accordion.Header>
                                                    <Accordion.Body>
                                                        <div className="event-checkboxes mb-3">
                                                            <div className="d-flex flex-wrap">
                                                                {events.map(event => (
                                                                    <EventCheckbox
                                                                        key={event.id}
                                                                        category={category}
                                                                        event={event}
                                                                        checked={isEventSelected(category, event.id)}
                                                                        onChange={handleEventSelectionChange}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            ))}
                                    </Accordion>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <Form.Group className="form-group mb-3">
                        <Form.Label>Device Preference</Form.Label>
                        <Select
                            options={[
                                { value: 'all', label: 'All Devices (Recommended)' },
                                { value: 'mobile', label: 'Mobile Only' },
                                { value: 'desktop', label: 'Desktop Only' },
                                { value: 'tablet', label: 'Tablet Only' }
                            ]}
                            className="basic-select"
                            classNamePrefix="select"
                            onChange={(selected) => handleInputChange('devicePreferences', selected?.value)}
                            value={{
                                value: campaign.devicePreferences || 'all',
                                label: campaign.devicePreferences === 'all' ? 'All Devices (Recommended)' :
                                    campaign.devicePreferences === 'mobile' ? 'Mobile Only' :
                                    campaign.devicePreferences === 'desktop' ? 'Desktop Only' :
                                    'Tablet Only'
                            }}
                            placeholder="Select device preference"
                        />
                        {campaign.devicePreferences === 'all' && (
                            <Form.Text className="text-muted">
                                <strong>Recommended:</strong> Show ads across all devices for maximum reach
                            </Form.Text>
                        )}
                    </Form.Group>
                </Card.Body>
            </Card>
        </div>
    );
    });
    
    // Location Targeting Component
    const LocationTargeting = ({ campaign, handleInputChange, organization }) => {
        // Instead of single radius, we'll manage a map of locationId -> radius values
        const [localRadiusValues, setLocalRadiusValues] = useState({});
        // State to track if we're in browser environment
        const [isBrowser, setIsBrowser] = useState(false);
        const [errors, setErrors] = useState({});
        
        // Initialize radius values for each location
        useEffect(() => {
            // If campaign has locationRadiusValues set, use those
            if (campaign.targeting.locationRadiusValues) {
                setLocalRadiusValues(campaign.targeting.locationRadiusValues);
            } else if (campaign.locations.length > 0) {
                // Otherwise initialize with the default radius for all locations
                const defaultRadius = campaign.targeting.radius || 25;
                const initialValues = campaign.locations.reduce((acc, locationId) => {
                    acc[locationId] = defaultRadius;
                    return acc;
                }, {});
                setLocalRadiusValues(initialValues);
                
                // Update the campaign state with these initial values
                handleInputChange('targeting.locationRadiusValues', initialValues);
            }
        }, [campaign.locations, campaign.targeting.radius]);
        
        // Set isBrowser to true once component mounts
        useEffect(() => {
            setIsBrowser(true);
        }, []);

        // Select all locations by default if none are selected
        useEffect(() => {
            if (campaign.locations.length === 0 && organization?.locations?.length > 0) {
                const allLocationIds = organization.locations
                    .filter(loc => loc.active)
                    .map(loc => loc._id);
                
                handleInputChange('locations', allLocationIds);
            }
        }, [organization?.locations]);

        // Handle location selection
        const handleLocationChange = (selectedOptions) => {
            const locations = selectedOptions?.map(option => option.value) || [];
            
            // Update locations array
            handleInputChange('locations', locations);
            
            // When locations change, update the radius values map to add/remove entries
            const updatedRadiusValues = { ...localRadiusValues };
            
            // Remove radius values for deselected locations
            Object.keys(updatedRadiusValues).forEach(locationId => {
                if (!locations.includes(locationId)) {
                    delete updatedRadiusValues[locationId];
                }
            });
            
            // Add default radius values for newly selected locations
            const defaultRadius = campaign.targeting.radius || 25;
            locations.forEach(locationId => {
                if (!updatedRadiusValues[locationId]) {
                    updatedRadiusValues[locationId] = defaultRadius;
                }
            });
            
            // Update local state and campaign state
            setLocalRadiusValues(updatedRadiusValues);
            handleInputChange('targeting.locationRadiusValues', updatedRadiusValues);
            
            // Clear error if locations were selected
            if (locations.length > 0) {
                setErrors(prev => ({ ...prev, locations: undefined }));
            }
        };

        // Ensure targetType is set to 'radius' by default if not already set
        useEffect(() => {
            if (!campaign.targeting.targetType) {
                handleInputChange('targeting.targetType', 'radius');
            }
        }, [campaign.targeting.targetType]);

        // Target type options
        const targetTypeOptions = [
            { value: 'radius', label: 'Radius' },
            { value: 'city', label: 'City' },
            { value: 'province', label: 'Province' },
            { value: 'national', label: 'National' }
        ];

        // Handle target type change
        const handleTargetTypeChange = (selected) => {
            handleInputChange('targeting.targetType', selected.value);
            if (selected.value === 'national') {
                handleInputChange('targeting.isNational', true);
            }
        };
        
        // Handle radius change for a specific location
        const handleLocationRadiusChange = (locationId, value) => {
            const newValues = { ...localRadiusValues, [locationId]: parseInt(value) };
            setLocalRadiusValues(newValues);
        };
        
        // When the user has finished dragging (on mouse up), update the parent state
        const handleLocationRadiusChangeComplete = () => {
            handleInputChange('targeting.locationRadiusValues', localRadiusValues);
        };
        
        // Transform locations data for the map component
        const getMapLocations = () => {
            if (!organization?.locations) return [];
            
            return organization.locations
            .filter(loc => campaign.locations.includes(loc._id) && loc.active)
            .map(loc => ({
                id: loc._id,
                name: loc.name,
                latitude: loc.latitude,
                longitude: loc.longitude,
                city: loc.city,
                province: loc.province,
                // Include the radius for this specific location
                radius: localRadiusValues[loc._id] || campaign.targeting.radius || 25
            }));
        };

        return (
            <div className="card mb-4">
                <div className="card-header">
                    <h6 className="mb-0">Location Targeting</h6>
                </div>
                <div className="card-body">
                    <FormGroup className="form-group mb-4">
                        <Form.Label>Select Locations</Form.Label>
                        <Select
                            options={organization?.locations?.filter(loc => loc.active)?.map(location => ({
                                value: location._id,
                                label: location.name
                            })) || []}
                            isMulti
                            className="basic-multi-select"
                            classNamePrefix="select"
                            onChange={handleLocationChange}
                            placeholder="Select one or more locations"
                            value={(organization?.locations?.filter(loc => loc.active) || [])
                                .filter(loc => campaign.locations.includes(loc._id))
                                .map(loc => ({ value: loc._id, label: loc.name }))}
                            isInvalid={!!errors.locations}
                        />
                        {errors.locations ? (
                            <Form.Control.Feedback type="invalid" className="d-block">
                                {errors.locations}
                            </Form.Control.Feedback>
                        ) : (
                            <Form.Text className="text-muted">
                                Choose which locations to advertise from (all selected by default)
                            </Form.Text>
                        )}
                    </FormGroup>
                    
                    {/* Map component */}
                    {campaign.locations.length > 0 && (
                        <div className="mb-4">
                            <CampaignMap 
                                locations={getMapLocations()}
                                targetType={campaign.targeting.targetType}
                                // Pass null for radius since we're using per-location radius values
                                radius={null}
                                height="500px"
                                className="border border-gray-200 rounded"
                            />
                        </div>
                    )}
                    
                    <FormGroup className="form-group mb-3">
                        <Form.Label>Target Type</Form.Label>
                        <Select
                            options={targetTypeOptions}
                            className="basic-select"
                            classNamePrefix="select"
                            onChange={handleTargetTypeChange}
                            value={targetTypeOptions.find(option => option.value === campaign.targeting.targetType) || targetTypeOptions[0]}
                            placeholder="Select target type"
                        />
                        <Form.Text className="text-muted">
                            Choose how to target your audience geographically
                        </Form.Text>
                    </FormGroup>
                    
                    {campaign.targeting.targetType === 'radius' && campaign.locations.length > 0 && (
                        <FormGroup className="form-group mb-3">
                            <Form.Label className="mb-3">Radius Settings</Form.Label>
                            <div className="location-radius-controls">
                                {campaign.locations.map(locationId => {
                                    const location = organization?.locations?.find(loc => loc._id === locationId && loc.active);
                                    if (!location) return null;
                                    
                                    const radius = localRadiusValues[locationId] || campaign.targeting.radius || 25;
                                    
                                    return (
                                        <div key={locationId} className="location-radius-item mb-3 p-3 border rounded">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="fw-bold">{location.name}</div>
                                                <div className="radius-value">{radius} km</div>
                                            </div>
                                            <Form.Range
                                                min={5}
                                                max={100}
                                                step={1}
                                                value={radius}
                                                onChange={(e) => handleLocationRadiusChange(locationId, e.target.value)}
                                                onMouseUp={handleLocationRadiusChangeComplete}
                                                onTouchEnd={handleLocationRadiusChangeComplete}
                                            />
                                            <Form.Text className="text-muted">
                                                Ads will show to people within {radius} km of {location.name}
                                            </Form.Text>
                                        </div>
                                    );
                                })}
                            </div>
                        </FormGroup>
                    )}

{campaign.targeting.targetType === 'city' && (
                        <div className="alert alert-info">
                            Your ads will be shown in the cities where your selected locations are based.
                            {campaign.locations.length > 0 && organization?.locations && (
                                <div className="mt-2">
                                    <strong>Selected cities:</strong> {' '}
                                    {campaign.locations.map(locId => {
                                        const location = organization.locations.find(l => l._id === locId);
                                        return location?.city;
                                    }).filter(Boolean).join(', ')}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {campaign.targeting.targetType === 'province' && (
                        <div className="alert alert-info">
                            Your ads will be shown in the provinces where your selected locations are based.
                            {campaign.locations.length > 0 && organization?.locations && (
                                <div className="mt-2">
                                    <strong>Selected provinces:</strong> {' '}
                                    {campaign.locations.map(locId => {
                                        const location = organization.locations.find(l => l._id === locId);
                                        return location?.province;
                                    }).filter(Boolean).join(', ')}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {campaign.targeting.targetType === 'national' && (
                        <div className="alert alert-info">
                            Your ads will be shown across South Africa. This is recommended for nationwide businesses.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Inventory Filters Component
    const InventoryFilters = ({ filters, campaign, handleInputChange }) => {
        const [showForm, setShowForm] = useState(false);
        const [editingFilter, setEditingFilter] = useState(null);
        const [validationErrors, setValidationErrors] = useState({});
      
        const initialFormState = {
          name: '',
          description: '',
          inventoryType: 'Dealership',
          isActive: true,
          conditions: {}
        };
      
        const [filterForm, setFilterForm] = useState(initialFormState);
        const [conditions, setConditions] = useState({
          price: { operator: '$lte', value: '' },
          year: { operator: '$gte', value: '' },
          mileage: { operator: '$lte', value: '' },
          createdAt: { operator: '$gte', value: '' }
        });

        const toTitleCase = (str) => {
            return str?.toLowerCase().split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        };
      
        const validateForm = () => {
          const errors = {};
          if (!filterForm.name) errors.name = 'Filter name is required';
          if (!filterForm.description) errors.description = 'Description is required';
      
          // Validate numeric conditions
          const conditionErrors = {};
          if (conditions.year.value && !Number.isInteger(Number(conditions.year.value))) {
            conditionErrors.year = 'Year must be a valid number';
          }
          if (conditions.mileage.value && !Number.isInteger(Number(conditions.mileage.value))) {
            conditionErrors.mileage = 'Mileage must be a valid number';
          }
          if (conditions.price.value && !Number.isInteger(Number(conditions.price.value))) {
            conditionErrors.price = 'Price must be a valid number';
          }
          if (Object.keys(conditionErrors).length > 0) {
            errors.conditions = conditionErrors;
          }
      
          setValidationErrors(errors);
          return Object.keys(errors).length === 0;
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (validateForm()) {
              const formData = { ...filterForm };
              
              // Only add conditions if at least one condition has a value
              const constraints = Object.entries(conditions).reduce((acc, [key, value]) => {
                if (value.value) {
                  acc[key] = { [value.operator]: Number(value.value) };
                }
                return acc;
              }, {});
          
              // Only add conditions if there are any constraints
              if (Object.keys(constraints).length > 0) {
                formData.conditions = [{ constraints }];
              } else {
                formData.conditions = [];
              }
          
              try {
                // Create a copy of the current filters array
                const updatedFilters = [...(campaign.savedFilters || [])];
                
                if (editingFilter) {
                    // Replace the edited filter
                    const index = updatedFilters.findIndex(f => f.id === editingFilter.id);
                    if (index !== -1) {
                        updatedFilters[index] = { ...formData, id: editingFilter.id };
                    }
                } else {
                    // Add new filter with a unique ID
                    updatedFilters.push({ ...formData, id: Date.now().toString() });
                }
                
                // Update the campaign state
                handleInputChange('savedFilters', updatedFilters);
                
                // Reset form on success
                setShowForm(false);
                setFilterForm(initialFormState);
                setEditingFilter(null);
                setConditions({
                  price: { operator: '$lte', value: '' },
                  year: { operator: '$gte', value: '' },
                  mileage: { operator: '$lte', value: '' },
                  createdAt: { operator: '$gte', value: '' }
                });
              } catch (err) {
                console.error('Failed to save filter:', err);
              }
            }
        };
      
        const handleEdit = (filter) => {
            setEditingFilter(filter);
            setFilterForm({
                name: filter.name,
                description: filter.description,
                inventoryType: filter.inventoryType,
                isActive: filter.isActive,
            });
            
            if (filter.conditions?.length > 0 && filter.conditions[0].constraints) {
              const newConditions = {
                price: { operator: '$lte', value: '' },
                year: { operator: '$gte', value: '' },
                mileage: { operator: '$lte', value: '' },
                createdAt: { operator: '$gte', value: '' }
              };
              
              Object.entries(filter.conditions[0].constraints).forEach(([key, value]) => {
                const operator = Object.keys(value)[0];
                newConditions[key] = {
                  operator,
                  value: value[operator].toString()
                };
              });
              
              setConditions(newConditions);
            }
            
            setShowForm(true);
        };
      
        const handleDelete = async (filterId) => {     
            const updatedFilters = campaign.savedFilters.filter(filter => filter.id !== filterId);
            handleInputChange('savedFilters', updatedFilters);
        };

        const renderConditionField = (field, label, error) => (
            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>{label}</Form.Label>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={conditions[field].operator}
                  onChange={(e) => setConditions({
                    ...conditions,
                    [field]: { ...conditions[field], operator: e.target.value }
                  })}
                >
                  <option value="$gt">Greater than</option>
                  <option value="$gte">Greater than or equal to</option>
                  <option value="$lt">Less than</option>
                  <option value="$lte">Less than or equal to</option>
                  <option value="$eq">Equal to</option>
                  <option value="$ne">Not equal to</option>
                </Form.Select>
              </Col>
              <Col md={5}>
                <Form.Control
                  type="number"
                  value={conditions[field].value}
                  isInvalid={error}
                  onChange={(e) => setConditions({
                    ...conditions,
                    [field]: { ...conditions[field], value: e.target.value }
                  })}
                />
                {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
              </Col>
            </Row>
          );
  
          const renderDateConditionField = (field, label, error) => (
            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>{label}</Form.Label>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={conditions[field].operator}
                  onChange={(e) => setConditions({
                    ...conditions,
                    [field]: { ...conditions[field], operator: e.target.value }
                  })}
                >
                  <option value="$gt">After</option>
                  <option value="$gte">On or after</option>
                  <option value="$lt">Before</option>
                  <option value="$lte">On or before</option>
                  <option value="$eq">Exactly on</option>
                </Form.Select>
              </Col>
              <Col md={5}>
                <Form.Control
                  type="date"
                  value={conditions[field].value}
                  isInvalid={error}
                  onChange={(e) => setConditions({
                    ...conditions,
                    [field]: { ...conditions[field], value: e.target.value }
                  })}
                />
                {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
              </Col>
            </Row>
          );

          return (
            <div className="inventory-filters">
              <Card className="mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="mb-0 main-content-label text-primary">
                      Inventory Filters
                    </div>
        
                    {!showForm && (
                      <Button 
                        variant="primary" 
                        className="d-flex align-items-center gap-2"
                        onClick={() => setShowForm(true)}
                      >
                        <Plus size={18} />
                        Add Filter
                      </Button>
                    )}
                  </div>
        
                  {showForm ? (
                    <Form onSubmit={handleSubmit} className="mb-4">
                      <Row>
                        <Col md={6} lg={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={filterForm.name}
                              isInvalid={!!validationErrors.name}
                              onChange={(e) => setFilterForm({ ...filterForm, name: toTitleCase(e.target.value) })}
                            />
                            <Form.Control.Feedback type="invalid">
                              {validationErrors.name}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6} lg={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              type="text"
                              value={filterForm.description}
                              isInvalid={!!validationErrors.description}
                              onChange={(e) => setFilterForm({...filterForm, description: e.target.value})}
                            />
                            <Form.Control.Feedback type="invalid">
                              {validationErrors.description}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
        
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              label="Active"
                              checked={filterForm.isActive}
                              onChange={(e) => setFilterForm({...filterForm, isActive: e.target.checked})}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
        
                      <Accordion className="mb-3" defaultActiveKey="0">
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>
                            Filter Conditions
                          </Accordion.Header>
                          <Accordion.Body>
                            {renderConditionField('price', 'Price', validationErrors.conditions?.price)}
                            {renderConditionField('year', 'Year', validationErrors.conditions?.year)}
                            {renderConditionField('mileage', 'Mileage', validationErrors.conditions?.mileage)}
                            {renderDateConditionField('createdAt', 'Created Date', validationErrors.conditions?.createdAt)}
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
        
                      <div className="d-flex justify-content-end gap-2">
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            setShowForm(false);
                            setValidationErrors({});
                            setEditingFilter(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                          {editingFilter ? 'Update Filter' : 'Save Filter'}
                        </Button>
                      </div>
                    </Form>
                  ) : (

                    <>  
                      {campaign.savedFilters?.length > 0 ? (
                      <div className="table-responsive">
                      <Table className="table-nowrap">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th className="d-none d-md-table-cell">Status</th>
                            <th className="d-none d-lg-table-cell">Conditions</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campaign.savedFilters.map((filter) => (
                            <tr key={filter.id}>
                              <td className="text-nowrap">{filter.name}</td>
                              <td className="text-nowrap">{filter.description}</td>
                              
                              <td className="d-none d-md-table-cell text-nowrap">
                                <Badge bg={filter.isActive ? "success" : "warning"}>
                                  {filter.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              
                              <td className="d-none d-lg-table-cell text-nowrap">
                                {filter.conditions?.length > 0 && filter.conditions[0]?.constraints ? (
                                  <Badge bg="dark">
                                    {Object.keys(filter.conditions[0].constraints).length} Condition(s)
                                  </Badge>
                                ) : (
                                  <Badge bg="secondary">No Conditions</Badge>
                                )}
                              </td>
                              
                              <td className="text-nowrap">
                                <div className="d-flex gap-2">
                                  <Button 
                                    variant="light"
                                    size="sm"
                                    onClick={() => handleEdit(filter)}
                                  >
                                    <Edit2 size={16} />
                                  </Button>
                                  <Button 
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(filter.id)}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                      ) : !showForm && (
                      <Alert variant="info" className="text-center mb-0">
                          No inventory filters have been added yet. Click the "Add Filter" button to create your first filter. If you don't add any filters, all your inventory will be advertised.
                      </Alert>
                      )}
                  </>
                  )}
                </Card.Body>
              </Card>
            </div>
          );
    };

    return (
        <StateHandler slice="advertising">
            <Pageheader title="Create New Campaign" heading="Advertising" active="New Campaign" />
    
            <Row className="justify-content-center">
                <Col xl={9}>
                    <Card className="custom-card">
                        <Card.Body className="p-0 product-checkout">
                            <Tab.Container id="campaign-tabs" activeKey={activeTab} >
                                <Nav variant="pills" className="nav-tabs tab-style-2 d-sm-flex d-block border-bottom border-block-end-dashed justify-content-center text-center" role="tablist">
                                    <Nav.Item>
                                        <Nav.Link eventKey="first">
                                            <i className="ri-number-1 me-2 align-middle"></i>
                                            <span className="mt-2">Campaign Details</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="second">
                                            <i className="ri-number-2 me-2 align-middle"></i>
                                            <span className="mt-2">Audience</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="third">
                                            <i className="ri-number-3 me-2 align-middle"></i>
                                            <span className="mt-2">Location</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="fourth">                                     
                                            <i className="ri-number-4 me-2 align-middle"></i>
                                                <span className="mt-2">Creatives</span>
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="fifth">
                                                <i className="ri-number-5 me-2 align-middle"></i>
                                                <span className="mt-2">Budget</span>
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                    <Row>
                                        <Col xl={10} className="mx-auto">
                                            <Tab.Content className="m-4">
                                                {/* STEP 1: Campaign Details */}
                                                <Tab.Pane className="fade border-0 p-0" eventKey="first">
                                                    <div className="p-4">
                                                        <h5 className="text-start mb-2">Campaign Details</h5>
                                                        <p className="mb-4 text-muted fs-13 fw-normal ms-0 text-start">Enter the basic information to create your advertising campaign</p>
                                                        
                                                        <FormGroup className="form-group mb-4">
                                                            <Form.Label>Campaign Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={campaign.name}
                                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                                placeholder="Enter campaign name"
                                                                isInvalid={!!errors.name}
                                                            />
                                                            {errors.name && (
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.name}
                                                                </Form.Control.Feedback>
                                                            )}
                                                        </FormGroup>
                                                        
                                                        <FormGroup className="form-group mb-4">
                                                            <Form.Label>Campaign Type</Form.Label>
                                                            <Select
                                                                options={campaignTypes}
                                                                className={`basic-select ${errors.campaignType ? 'is-invalid' : ''}`}
                                                                classNamePrefix="select"
                                                                onChange={handleCampaignTypeChange}
                                                                placeholder="Select a campaign type"
                                                            />
                                                            {errors.campaignType && (
                                                                <div className="invalid-feedback d-block">
                                                                    {errors.campaignType}
                                                                </div>
                                                            )}
                                                            {campaign.campaignType && (
                                                                <Form.Text className="text-muted">
                                                                    {campaign.campaignType === 'social' && 'Create visual ads for social media platforms'}
                                                                    {campaign.campaignType === 'search' && 'Create text-based ads for search engines'}
                                                                    {campaign.campaignType === 'shopping' && 'Create product feed ads for shopping platforms'}
                                                                </Form.Text>
                                                            )}
                                                        </FormGroup>
                                                        
                                                        <FormGroup className="form-group mb-3">
                                                            <Form.Label>Campaign Status</Form.Label>
                                                            <Form.Select
                                                                value={campaign.action}
                                                                onChange={(e) => handleInputChange('action', e.target.value)}
                                                            >
                                                                <option value="Draft">Draft (Save for Later)</option>
                                                                <option value="Active">Active (Launch Now)</option>
                                                                <option value="Scheduled">Scheduled (Launch Later)</option>
                                                            </Form.Select>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="px-4 py-3 border-top border-block-start-dashed d-flex justify-content-end">
                                                        <Button 
                                                            variant="success" 
                                                            onClick={handleNextClick}
                                                        >
                                                            Next
                                                        </Button>
                                                    </div>
                                                </Tab.Pane>

                                                {/* STEP 2: Audience */}
                                            <Tab.Pane className="fade border-0 p-0" eventKey="second">
                                                <div className="p-4">
                                                    <h5 className="text-start mb-2">Audience Setup</h5>
                                                    <p className="mb-4 text-muted fs-13 fw-normal ms-0 text-start">Define which platforms to use and who should see your ads</p>
                                                    
                                                    {campaign.campaignType && (
                                                        <FormGroup className="form-group mb-4">
                                                            <Form.Label>Select Platforms</Form.Label>
                                                            <Select
                                                                options={platformOptions[campaign.campaignType]}
                                                                isMulti
                                                                className={`basic-multi-select ${errors.platforms ? 'is-invalid' : ''}`}
                                                                classNamePrefix="select"
                                                                onChange={(selectedOptions) => {
                                                                    const platforms = selectedOptions?.map(option => option.value) || [];
                                                                    handleInputChange('platforms', platforms);
                                                                }}
                                                                placeholder="Select one or more platforms"
                                                                value={platformOptions[campaign.campaignType].filter(option => 
                                                                    campaign.platforms.includes(option.value)
                                                                )}
                                                            />
                                                            {errors.platforms ? (
                                                                <div className="invalid-feedback d-block">
                                                                    {errors.platforms}
                                                                </div>
                                                            ) : (
                                                                <Form.Text className="text-muted">
                                                                    Choose which platforms to run your campaign on
                                                                </Form.Text>
                                                            )}
                                                        </FormGroup>
                                                    )}

                                                    <CombinedAudienceTargeting 
                                                        campaign={campaign} 
                                                        handleInputChange={handleInputChange}
                                                        audienceStats={audienceStats}
                                                        validateNext={setAudienceTargetingValid}
                                                    />
                                                </div>
                                                <div className="px-4 py-3 border-top border-block-start-dashed d-flex justify-content-between">
                                                    <Button
                                                        variant="light"
                                                        onClick={handlePreviousClick}
                                                    >
                                                        Previous
                                                    </Button>
                                                    <Button
                                                        variant="success"
                                                        onClick={handleNextClick}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </Tab.Pane>

                                            {/* STEP 3: Location */}
                                            <Tab.Pane className="fade border-0 p-0" eventKey="third">
                                                <div className="p-4">
                                                    <h5 className="text-start mb-2">Location Targeting</h5>
                                                    <p className="mb-4 text-muted fs-13 fw-normal ms-0 text-start">Define where your ads should be displayed</p>
                                                    
                                                    <LocationTargeting 
                                                        campaign={campaign} 
                                                        handleInputChange={handleInputChange}
                                                        organization={organization}
                                                    />
                                                </div>
                                                <div className="px-4 py-3 border-top border-block-start-dashed d-flex justify-content-between">
                                                    <Button
                                                        variant="light"
                                                        onClick={handlePreviousClick}
                                                    >
                                                        Previous
                                                    </Button>
                                                    <Button
                                                        variant="success"
                                                        onClick={handleNextClick}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </Tab.Pane>

                                            {/* STEP 4: Creatives */}
                                            <Tab.Pane className="fade border-0 p-0" eventKey="fourth">
                                                <div className="p-4">
                                                    <h5 className="text-start mb-2">Creative Elements</h5>
                                                    <p className="mb-4 text-muted fs-13 fw-normal ms-0 text-start">Set up your ad content and inventory filters</p>
                                                    
                                                    {/* Inventory Filters */}
                                                    <InventoryFilters 
                                                        filters={campaign.savedFilters} 
                                                        campaign={campaign} 
                                                        handleInputChange={handleInputChange}
                                                    />
                                                    
                                                    {/* Templates for Social and Shopping */}
                                                    {(campaign.campaignType === 'social' || campaign.campaignType === 'shopping') && (
                                                        <Card className="mb-4">
                                                            <Card.Header>
                                                                <h6 className="mb-0">Ad Template</h6>
                                                            </Card.Header>
                                                            <Card.Body>
                                                                <FormGroup className="form-group mb-4">
                                                                    <Form.Label>Select {campaign.campaignType === 'social' ? 'Advertising' : 'Product Feed'} Template</Form.Label>
                                                                    <Select
                                                                        options={templates?.map(template => ({
                                                                            value: template._id,
                                                                            label: template.name
                                                                        }))}
                                                                        className={`basic-select ${errors.template ? 'is-invalid' : ''}`}
                                                                        classNamePrefix="select"
                                                                        onChange={(selected) => handleInputChange('template', selected?.value)}
                                                                        placeholder="Select a template"
                                                                        isSearchable={true}
                                                                        value={templates?.map(template => ({
                                                                            value: template._id,
                                                                            label: template.name
                                                                        })).find(t => t.value === campaign.template)}
                                                                    />
                                                                    {errors.template ? (
                                                                        <div className="invalid-feedback d-block">
                                                                            {errors.template}
                                                                        </div>
                                                                    ) : (
                                                                        <Form.Text className="text-muted">
                                                                            Choose a template for your {campaign.campaignType === 'social' ? 'social carousel ads' : 'product feed ads'}
                                                                        </Form.Text>
                                                                    )}
                                                                </FormGroup>
                                                            </Card.Body>
                                                        </Card>
                                                    )}   

                                                    {/* Search Ads Content */}
                                                    {campaign.campaignType === 'search' && (
                                                        <>
                                                            <Card className="mb-4">
                                                                <Card.Header>
                                                                    <h6 className="mb-0">Keywords and Ad Content</h6>
                                                                </Card.Header>
                                                                <Card.Body>
                                                                    <p className="text-muted fs-13 mb-3">Add 3-5 keywords per AdGroup. System will generate keywords based on inventory, but you can add examples here.</p>
                                                                    
                                                                    <div className="mb-3">
                                                                        <div className="d-flex mb-2">
                                                                            <Form.Control
                                                                                type="text"
                                                                                value={keyword.text}
                                                                                onChange={(e) => handleKeywordChange('text', e.target.value)}
                                                                                placeholder="Enter keyword"
                                                                                className="me-2"
                                                                                isInvalid={errors.keywords && campaign.searchAds.keywords.length === 0}
                                                                            />
                                                                            <Select
                                                                                options={[
                                                                                    { value: 'EXACT', label: 'Exact' },
                                                                                    { value: 'PHRASE', label: 'Phrase' },
                                                                                    { value: 'BROAD', label: 'Broad' }
                                                                                ]}
                                                                                value={{
                                                                                    value: keyword.matchType,
                                                                                    label: keyword.matchType === 'EXACT' ? 'Exact' :
                                                                                           keyword.matchType === 'PHRASE' ? 'Phrase' : 'Broad'
                                                                                }}
                                                                                onChange={(selected) => handleKeywordChange('matchType', selected?.value)}
                                                                                className="w-25"
                                                                                classNamePrefix="select"
                                                                            />
                                                                            <Button 
                                                                                variant="primary" 
                                                                                onClick={addKeyword} 
                                                                                className="ms-2"
                                                                                disabled={!keyword.text.trim()}
                                                                            >
                                                                                Add
                                                                            </Button>
                                                                        </div>

                                                                        {errors.keywords && campaign.searchAds.keywords.length === 0 && (
                                                                            <div className="text-danger mb-3">
                                                                                {errors.keywords}
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {campaign.searchAds.keywords.length > 0 && (
                                                                            <div className="table-responsive">
                                                                                <table className="table table-bordered">
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th>Keyword</th>
                                                                                            <th>Match Type</th>
                                                                                            <th>Action</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {campaign.searchAds.keywords.map((kw, index) => (
                                                                                            <tr key={index}>
                                                                                                <td>{kw.text}</td>
                                                                                                <td>{kw.matchType}</td>
                                                                                                <td>
                                                                                                    <Button
                                                                                                        variant="danger"
                                                                                                        size="sm"
                                                                                                        onClick={() => removeKeyword(index)}
                                                                                                    >
                                                                                                        Remove
                                                                                                    </Button>
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </Card.Body>
                                                            </Card>
                                                            
                                                            <Row>
                                                                <Col md={6}>
                                                                    <Card className="mb-4">
                                                                        <Card.Header>
                                                                            <h6 className="mb-0">Headlines (5-10)</h6>
                                                                        </Card.Header>
                                                                        <Card.Body>
                                                                            <div className="mb-3">
                                                                                <div className="d-flex mb-2">
                                                                                    <Form.Control
                                                                                        type="text"
                                                                                        value={headline}
                                                                                        onChange={(e) => setHeadline(e.target.value)}
                                                                                        placeholder="Enter headline"
                                                                                        className="me-2"
                                                                                        isInvalid={errors.headlines && campaign.searchAds.headlines.length === 0}
                                                                                    />
                                                                                    <Button 
                                                                                        variant="primary" 
                                                                                        onClick={addHeadline} 
                                                                                        disabled={!headline.trim()}
                                                                                    >
                                                                                        Add
                                                                                    </Button>
                                                                                </div>
                                                                                
                                                                                {errors.headlines && campaign.searchAds.headlines.length === 0 && (
                                                                                    <div className="text-danger mb-3">
                                                                                        {errors.headlines}
                                                                                    </div>
                                                                                )}
                                                                                
                                                                                {campaign.searchAds.headlines.length > 0 && (
                                                                                    <ul className="list-group">
                                                                                        {campaign.searchAds.headlines.map((h, index) => (
                                                                                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                                                                {h}
                                                                                                <Button
                                                                                                    variant="danger"
                                                                                                    size="sm"
                                                                                                    onClick={() => removeHeadline(index)}
                                                                                                >
                                                                                                    Remove
                                                                                                </Button>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                )}
                                                                            </div>
                                                                        </Card.Body>
                                                                    </Card>
                                                                </Col>
                                                                <Col md={6}>
                                                                    <Card className="mb-4">
                                                                        <Card.Header>
                                                                            <h6 className="mb-0">Descriptions (2-3)</h6>
                                                                        </Card.Header>
                                                                        <Card.Body>
                                                                            <div className="mb-3">
                                                                                <div className="d-flex mb-2">
                                                                                    <Form.Control
                                                                                        as="textarea"
                                                                                        rows={2}
                                                                                        value={description}
                                                                                        onChange={(e) => setDescription(e.target.value)}
                                                                                        placeholder="Enter description"
                                                                                        className="me-2"
                                                                                        isInvalid={errors.descriptions && campaign.searchAds.descriptions.length === 0}
                                                                                    />
                                                                                    <Button 
                                                                                        variant="primary" 
                                                                                        onClick={addDescription} 
                                                                                        disabled={!description.trim()}
                                                                                    >
                                                                                        Add
                                                                                    </Button>
                                                                                </div>
                                                                                
                                                                                {errors.descriptions && campaign.searchAds.descriptions.length === 0 && (
                                                                                    <div className="text-danger mb-3">
                                                                                        {errors.descriptions}
                                                                                    </div>
                                                                                )}
                                                                                
                                                                                {campaign.searchAds.descriptions.length > 0 && (
                                                                                    <ul className="list-group">
                                                                                        {campaign.searchAds.descriptions.map((d, index) => (
                                                                                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                                                                {d}
                                                                                                <Button
                                                                                                    variant="danger"
                                                                                                    size="sm"
                                                                                                    onClick={() => removeDescription(index)}
                                                                                                >
                                                                                                    Remove
                                                                                                </Button>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                )}
                                                                            </div>
                                                                        </Card.Body>
                                                                    </Card>
                                                                </Col>
                                                            </Row>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="px-4 py-3 border-top border-block-start-dashed d-flex justify-content-between">
                                                    <Button
                                                        variant="light"
                                                        onClick={handlePreviousClick}
                                                    >
                                                        Previous
                                                    </Button>
                                                    <Button
                                                        variant="success"
                                                        onClick={handleNextClick}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </Tab.Pane>

                                            {/* STEP 5: Budget & Schedule */}
                                            <Tab.Pane className="fade border-0 p-0" eventKey="fifth">
                                                <div className="p-4">
                                                    <h5 className="text-start mb-2">Budget & Schedule</h5>
                                                    <p className="mb-4 text-muted fs-13 fw-normal ms-0 text-start">Set your campaign budget and timing</p>
                                                    
                                                    <Card className="mb-4">
                                                        <Card.Header>
                                                            <h6 className="mb-0">Campaign Budget</h6>
                                                        </Card.Header>
                                                        <Card.Body>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Budget Type</Form.Label>
                                                                <Form.Select 
                                                                    value={campaign.budget.type}
                                                                    onChange={(e) => handleInputChange('budget.type', e.target.value)}
                                                                >
                                                                    <option value="daily">Daily Budget</option>
                                                                    <option value="monthly">Monthly Budget</option>
                                                                </Form.Select>
                                                                <Form.Text className="text-muted">
                                                                    {campaign.budget.type === 'daily' 
                                                                        ? 'Set a maximum amount to spend each day'
                                                                        : 'Set a maximum amount to spend for the entire month'}
                                                                </Form.Text>
                                                            </Form.Group>
                                                            
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>
                                                                    {campaign.budget.type === 'daily' ? 'Daily' : 'Monthly'} Amount
                                                                </Form.Label>
                                                                <div className="input-group">
                                                                    <span className="input-group-text">R</span>
                                                                    <Form.Control
                                                                        type="number"
                                                                        min="0"
                                                                        step={campaign.budget.type === 'daily' ? '10' : '100'}
                                                                        value={campaign.budget.amount}
                                                                        onChange={(e) => handleInputChange('budget.amount', parseFloat(e.target.value))}
                                                                        placeholder={`Enter ${campaign.budget.type} budget amount`}
                                                                        isInvalid={!!errors.budgetAmount}
                                                                    />
                                                                    <span className="input-group-text">.00</span>
                                                                </div>
                                                                {errors.budgetAmount ? (
                                                                    <Form.Control.Feedback type="invalid" className="d-block">
                                                                        {errors.budgetAmount}
                                                                    </Form.Control.Feedback>
                                                                ) : (
                                                                    <Form.Text className="text-muted">
                                                                        {campaign.budget.type === 'daily'
                                                                            ? 'Daily amount to spend across all platforms'
                                                                            : 'Monthly amount to spend across all platforms'}
                                                                    </Form.Text>
                                                                )}
                                                            </Form.Group>
                                                        </Card.Body>
                                                    </Card>

                                                    <Card className="mb-4">
                                                        <Card.Header>
                                                            <h6 className="mb-0">Budget Distribution</h6>
                                                        </Card.Header>
                                                        <Card.Body>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Distribution Strategy</Form.Label>
                                                                <Select
                                                                    options={[
                                                                        { value: 'equal', label: 'Equal Distribution' },
                                                                        { value: 'bestPerforming', label: 'Auto-Optimize for Best Results' },
                                                                        { value: 'manual', label: 'Manual Distribution' }
                                                                    ]}
                                                                    className="basic-select"
                                                                    classNamePrefix="select"
                                                                    onChange={(e) => handleInputChange('budget.distributionStrategy', e?.value || 'equal')}
                                                                    value={{
                                                                        value: campaign.budget.distributionStrategy,
                                                                        label: campaign.budget.distributionStrategy === 'equal' ? 'Equal Distribution' :
                                                                               campaign.budget.distributionStrategy === 'bestPerforming' ? 'Auto-Optimize for Best Results' :
                                                                               'Manual Distribution'
                                                                    }}
                                                                    placeholder="Select distribution strategy"
                                                                />
                                                                <Form.Text className="text-muted">
                                                                    {campaign.budget.distributionStrategy === 'equal' && 'Budget will be split equally across all selected platforms'}
                                                                    {campaign.budget.distributionStrategy === 'bestPerforming' && 'Budget will be automatically distributed to best-performing platforms'}
                                                                    {campaign.budget.distributionStrategy === 'manual' && 'Set manual budget allocation for each platform'}
                                                                </Form.Text>
                                                            </Form.Group>

                                                            {campaign.budget.distributionStrategy === 'manual' && campaign.platforms.length > 0 && (
                                                                <div className="mt-3">
                                                                    <h6>Manual Budget Allocation</h6>
                                                                    <div className="table-responsive">
                                                                        <table className="table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Platform</th>
                                                                                    <th>{campaign.budget.type === 'daily' ? 'Daily' : 'Monthly'} Budget (R)</th>
                                                                                    <th>Percentage</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {campaign.platforms.map((platform, index) => {
                                                                                    const platformBudget = campaign.budget.manualDistribution[platform] || 0;
                                                                                    const percentage = campaign.budget.amount > 0 
                                                                                        ? ((platformBudget / campaign.budget.amount) * 100).toFixed(0) 
                                                                                        : 0;
                                                                                        
                                                                                    return (
                                                                                        <tr key={index}>
                                                                                            <td>
                                                                                                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                                                            </td>
                                                                                            <td>
                                                                                                <Form.Control
                                                                                                    type="number"
                                                                                                    min="0"
                                                                                                    step={campaign.budget.type === 'daily' ? '10' : '100'}
                                                                                                    value={platformBudget}
                                                                                                    onChange={(e) => {
                                                                                                        const manualDistribution = {
                                                                                                            ...campaign.budget.manualDistribution,
                                                                                                            [platform]: parseFloat(e.target.value)
                                                                                                        };
                                                                                                        handleInputChange('budget.manualDistribution', manualDistribution);
                                                                                                    }}
                                                                                                />
                                                                                            </td>
                                                                                            <td>{percentage}%</td>
                                                                                        </tr>
                                                                                    );
                                                                                })}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                    
                                                                    {/* Manual budget validation */}
                                                                    {errors.manualDistribution && (
                                                                        <Alert variant="danger" className="mt-3">
                                                                            {errors.manualDistribution}
                                                                        </Alert>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Card.Body>
                                                    </Card>
                                                    
                                                    <Card className="mb-4">
                                                        <Card.Header>
                                                            <h6 className="mb-0">Campaign Scheduling</h6>
                                                        </Card.Header>
                                                        <Card.Body>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Scheduling Type</Form.Label>
                                                                <Form.Select
                                                                    value={campaign.schedule.type}
                                                                    onChange={(e) => handleInputChange('schedule.type', e.target.value)}
                                                                >
                                                                    <option value="immediate">Start Immediately</option>
                                                                    <option value="scheduled">Schedule for Future Date</option>
                                                                </Form.Select>
                                                            </Form.Group>
                                                            
                                                            {campaign.schedule.type === 'scheduled' && (
                                                                <Form.Group className="mb-3">
                                                                    <Form.Label>Start Date</Form.Label>
                                                                    <Form.Control
                                                                        type="date"
                                                                        value={campaign.schedule.startDate}
                                                                        onChange={(e) => handleInputChange('schedule.startDate', e.target.value)}
                                                                        isInvalid={!!errors.startDate}
                                                                    />
                                                                    {errors.startDate && (
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.startDate}
                                                                        </Form.Control.Feedback>
                                                                    )}
                                                                </Form.Group>
                                                            )}
                                                            
                                                            <Form.Group className="mb-3">
                                                                <Form.Check
                                                                    type="switch"
                                                                    id="active-campaign"
                                                                    label="Set as active campaign"
                                                                    checked={campaign.schedule.isActive}
                                                                    onChange={(e) => handleInputChange('schedule.isActive', e.target.checked)}
                                                                />                                                               
                                                                <Form.Text className="text-muted">
                                                                    {campaign.schedule.type === 'immediate' 
                                                                        ? 'Campaign will go live immediately when published if checked'
                                                                        : 'Campaign will go live on the scheduled date if checked'}
                                                                </Form.Text>
                                                            </Form.Group>
                                                        </Card.Body>
                                                    </Card>

                                                    <Card className="mb-4">
                                                        <Card.Header>
                                                            <h6 className="mb-0">Campaign Summary</h6>
                                                        </Card.Header>
                                                        <Card.Body>
                                                            <div className="table-responsive">
                                                                <table className="table table-bordered">
                                                                    <tbody>
                                                                        <tr>
                                                                            <th className="w-25">Campaign Name</th>
                                                                            <td>{campaign.name}</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <th>Campaign Type</th>
                                                                            <td>
                                                                                {campaignTypes.find(type => type.value === campaign.campaignType)?.label || ''}
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <th>Platforms</th>
                                                                            <td>
                                                                                {campaign.platforms.map(platform => {
                                                                                    const platformOption = platformOptions[campaign.campaignType]?.find(opt => opt.value === platform);
                                                                                    return platformOption ? platformOption.label : platform;
                                                                                }).join(', ')}
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <th>Targeting</th>
                                                                            <td>
                                                                                {campaign.targeting.audience === 'demographics' 
                                                                                    ? `Demographics - Ages ${campaign.targeting.demographics?.ageMin || 18} to ${campaign.targeting.demographics?.ageMax || 65}${campaign.targeting.demographics?.gender !== 'all' ? `, ${campaign.targeting.demographics?.gender === 'male' ? 'Male' : 'Female'}` : ''}`
                                                                                    : 'Custom Audience Targeting'}
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <th>Location Target</th>
                                                                            <td>
                                                                                {campaign.targeting.targetType === 'radius' && `${campaign.targeting.radius}km radius around selected locations`}
                                                                                {campaign.targeting.targetType === 'city' && `City-level targeting`}
                                                                                {campaign.targeting.targetType === 'province' && `Province-level targeting`}
                                                                                {campaign.targeting.targetType === 'national' && 'National (All of South Africa)'}
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <th>Budget</th>
                                                                            <td>
                                                                                R {campaign.budget.amount.toFixed(2)} {campaign.budget.type === 'daily' ? 'per day' : 'per month'} 
                                                                                ({campaign.budget.distributionStrategy === 'equal' 
                                                                                    ? 'Equal distribution' 
                                                                                    : campaign.budget.distributionStrategy === 'bestPerforming' 
                                                                                        ? 'Auto-optimized' 
                                                                                        : 'Manual distribution'})
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <th>Schedule</th>
                                                                            <td>
                                                                                {campaign.schedule.type === 'immediate' 
                                                                                    ? 'Start immediately upon publication' 
                                                                                    : `Scheduled to start on ${campaign.schedule.startDate}`}
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <th>Status</th>
                                                                            <td>
                                                                                <span className={`badge bg-${campaign.schedule.isActive ? 'success' : 'warning'}`}>
                                                                                    {campaign.schedule.isActive ? 'Active' : 'Inactive'}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </div>
                                                <div className="px-4 py-3 border-top border-block-start-dashed d-flex justify-content-between">
                                                    <Button
                                                        variant="light"
                                                        onClick={handlePreviousClick}
                                                    >
                                                        Previous
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        onClick={handleSubmit}
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Publishing...' : 'Publish Campaign'}
                                                    </Button>
                                                </div>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </Col>
                                </Row>
                            </Tab.Container>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </StateHandler>
    );
};

NewAdvertisingCampaign.layout = "ManageLayout";

export default NewAdvertisingCampaign;