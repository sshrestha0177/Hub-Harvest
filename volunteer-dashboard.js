// volunteer-dashboard.js - UPDATED FOR MAP-BASED SHELTER SELECTION

let map;
let directionsService;
let directionsRenderer;
let currentMission = null;
let currentTravelMode = 'DRIVING';
let currentPosition = { lat: 42.3601, lng: -71.0589 };
let shelterMarkers = [];
let pickupMarker = null;
let selectedShelter = null;
let infoWindows = [];

// Enhanced shelter data with more details
const shelterData = [
    { 
        id: 1, 
        name: 'Hope Community Shelter', 
        address: '123 Hope St, Boston, MA', 
        lat: 42.348, 
        lng: -71.075, 
        capacity: 'Medium',
        description: 'Accepts prepared meals and fresh produce',
        hours: '9AM-5PM Daily',
        phone: '(555) 123-4567'
    },
    { 
        id: 2, 
        name: 'North End Community Fridge', 
        address: '456 North St, Boston, MA', 
        lat: 42.363, 
        lng: -71.050, 
        capacity: 'Small',
        description: 'Accepts small packaged items and snacks',
        hours: '24/7 Access',
        phone: '(555) 234-5678'
    },
    { 
        id: 3, 
        name: 'Central Food Bank', 
        address: '789 Central Ave, Boston, MA', 
        lat: 42.375, 
        lng: -71.060, 
        capacity: 'Large',
        description: 'Accepts bulk donations of all food types',
        hours: '8AM-6PM Mon-Fri',
        phone: '(555) 345-6789'
    },
    { 
        id: 4, 
        name: 'South End Soup Kitchen', 
        address: '321 South St, Boston, MA', 
        lat: 42.340, 
        lng: -71.070, 
        capacity: 'Medium',
        description: 'Accepts prepared meals and pantry items',
        hours: '10AM-7PM Daily',
        phone: '(555) 456-7890'
    }
];

function goBackToRegistration() {
    window.location.href = 'volunteer.html';
}

// Check if user is registered
if (!localStorage.getItem('volunteerId')) {
    window.location.href = 'volunteer.html';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadFoodDonations();
    getCurrentLocation();
    loadVolunteerPreferences();
});

// Load volunteer's preferred transportation from registration
function loadVolunteerPreferences() {
    const volunteerData = JSON.parse(localStorage.getItem('volunteerData') || '{}');
    if (volunteerData.vehicleType) {
        switch(volunteerData.vehicleType) {
            case 'bike':
                changeTravelMode('BICYCLING');
                break;
            case 'car':
            case 'suv_truck':
            case 'van':
                changeTravelMode('DRIVING');
                break;
            default:
                changeTravelMode('DRIVING');
        }
    }
}

// Get user's current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('Got current location:', currentPosition);
                if (map) {
                    map.setCenter(currentPosition);
                }
            },
            (error) => {
                console.log('Geolocation failed, using default location');
            }
        );
    }
}

// Initialize Google Map
function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        preserveViewport: false,
        polylineOptions: {
            strokeColor: '#28a745',
            strokeOpacity: 0.8,
            strokeWeight: 6
        }
    });
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: currentPosition,
        zoom: 13,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }]
            }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
    });

    directionsRenderer.setMap(map);
    console.log('Google Maps initialized');
}

// Clear all markers from the map
function clearAllMarkers() {
    // Clear shelter markers
    shelterMarkers.forEach(marker => marker.setMap(null));
    shelterMarkers = [];
    
    // Clear info windows
    infoWindows.forEach(window => window.close());
    infoWindows = [];
    
    // Clear pickup marker
    if (pickupMarker) {
        pickupMarker.setMap(null);
        pickupMarker = null;
    }
    
    // Clear directions
    directionsRenderer.setDirections({ routes: [] });
    
    selectedShelter = null;
}

// Add interactive shelter markers to the map with info windows
function addShelterMarkers() {
    clearAllMarkers();
    
    shelterData.forEach(shelter => {
        // Create custom marker
        const marker = new google.maps.Marker({
            position: { lat: shelter.lat, lng: shelter.lng },
            map: map,
            title: shelter.name,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="#007bff" stroke="white" stroke-width="2"/>
                        <circle cx="20" cy="20" r="15" fill="white" fill-opacity="0.2"/>
                        <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">🏠</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20)
            },
            animation: google.maps.Animation.DROP
        });

        // Create info window content
        const infoContent = `
            <div style="padding: 15px; max-width: 280px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <h3 style="margin: 0 0 10px 0; color: #007bff; font-size: 1.1rem;">${shelter.name}</h3>
                <div style="margin-bottom: 12px;">
                    <p style="margin: 4px 0; font-size: 0.9rem; color: #555;">
                        <strong>📍</strong> ${shelter.address}
                    </p>
                    <p style="margin: 4px 0; font-size: 0.9rem; color: #555;">
                        <strong>📞</strong> ${shelter.phone}
                    </p>
                    <p style="margin: 4px 0; font-size: 0.9rem; color: #555;">
                        <strong>🕒</strong> ${shelter.hours}
                    </p>
                    <p style="margin: 4px 0; font-size: 0.85rem; color: #666; font-style: italic;">
                        ${shelter.description}
                    </p>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 10px;">
                    <button onclick="selectShelterFromMap(${shelter.id})" 
                            style="flex: 1; padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem;">
                        🚗 Select This Shelter
                    </button>
                    <button onclick="calculateRoutePreview(${shelter.id})" 
                            style="padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;" 
                            title="Preview Route">
                        👁️
                    </button>
                </div>
            </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
            content: infoContent,
            maxWidth: 300
        });

        // Add click listener to marker
        marker.addListener('click', () => {
            // Close all other info windows
            infoWindows.forEach(window => window.close());
            infoWindow.open(map, marker);
        });

        shelterMarkers.push(marker);
        infoWindows.push(infoWindow);
    });

    // Add pickup location marker
    if (currentMission) {
        const pickupLocation = { 
            lat: parseFloat(currentMission.lat), 
            lng: parseFloat(currentMission.lng) 
        };
        
        pickupMarker = new google.maps.Marker({
            position: pickupLocation,
            map: map,
            title: 'Pickup Location - Food Collected',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="18" cy="18" r="16" fill="#28a745" stroke="white" stroke-width="2"/>
                        <text x="18" y="22" text-anchor="middle" fill="white" font-size="14" font-weight="bold">✓</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(36, 36),
                anchor: new google.maps.Point(18, 18)
            }
        });
    }

    // Fit map to show all shelters and pickup location
    const bounds = new google.maps.LatLngBounds();
    if (currentMission) {
        bounds.extend({ lat: parseFloat(currentMission.lat), lng: parseFloat(currentMission.lng) });
    }
    shelterData.forEach(shelter => {
        bounds.extend({ lat: shelter.lat, lng: shelter.lng });
    });
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
}

// Preview route to a shelter (without selecting it)
function calculateRoutePreview(shelterId) {
    const shelter = shelterData.find(s => s.id === shelterId);
    if (!shelter || !currentMission) return;

    const pickupLocation = { 
        lat: parseFloat(currentMission.lat), 
        lng: parseFloat(currentMission.lng) 
    };

    const request = {
        origin: pickupLocation,
        destination: { lat: shelter.lat, lng: shelter.lng },
        travelMode: google.maps.TravelMode[currentTravelMode],
        provideRouteAlternatives: false
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            // Create a temporary directions renderer for preview
            const tempDirectionsRenderer = new google.maps.DirectionsRenderer({
                suppressMarkers: true,
                preserveViewport: true,
                polylineOptions: {
                    strokeColor: '#ffc107',
                    strokeOpacity: 0.7,
                    strokeWeight: 4,
                    strokeDasharray: '5, 5'
                }
            });
            
            tempDirectionsRenderer.setMap(map);
            tempDirectionsRenderer.setDirections(result);
            
            // Remove the preview after 5 seconds
            setTimeout(() => {
                tempDirectionsRenderer.setMap(null);
            }, 5000);
            
        } else {
            console.error('Preview route failed: ' + status);
        }
    });
}

// Select shelter from map click
function selectShelterFromMap(shelterId) {
    const shelter = shelterData.find(s => s.id === shelterId);
    if (shelter) {
        selectShelter(shelter);
        // Close all info windows
        infoWindows.forEach(window => window.close());
    }
}

// Change travel mode and recalculate route
function changeTravelMode(mode) {
    currentTravelMode = mode;
    
    // Update active button
    document.querySelectorAll('.transport-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // Update display
    const modeDisplay = {
        'DRIVING': '🚗 Driving',
        'WALKING': '🚶 Walking', 
        'BICYCLING': '🚴 Bicycling'
    };
    document.getElementById('current-transport').textContent = modeDisplay[mode];
    
    // Recalculate current route if mission is active
    if (currentMission && selectedShelter) {
        calculateRouteToShelter(selectedShelter);
    }
}

// Load and display food donations
function loadFoodDonations() {
    const container = document.getElementById('donations-container');
    const donations = JSON.parse(localStorage.getItem('hubHarvestDonations') || '[]');
    
    if (donations.length === 0) {
        container.innerHTML = `
            <div class="no-donations">
                <h3>No Food Donations Available</h3>
                <p>When donors post surplus food, it will appear here.</p>
                <p>Check back later or encourage local businesses to donate!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = donations.map(donation => {
        if (!donation.lat || !donation.lng) {
            donation.lat = currentPosition.lat + (Math.random() - 0.5) * 0.02;
            donation.lng = currentPosition.lng + (Math.random() - 0.5) * 0.02;
        }
        
        return `
            <div class="donation-card">
                <div class="donation-header">
                    <h3>${donation.donor || 'Local Business'}</h3>
                    <span class="urgency-badge ${(donation.urgency || 'medium').toLowerCase()}">
                        ${donation.urgency || 'Medium'} Priority
                    </span>
                </div>
                
                <div class="donation-details">
                    <p class="food-type">🍎 <strong>Food Type:</strong> ${donation.foodType || 'Various Food'}</p>
                    <p class="quantity">📦 <strong>Quantity:</strong> ${donation.quantity || 'Not specified'}</p>
                    <p class="location">📍 <strong>Pickup Address:</strong> ${donation.pickupAddress || 'Address not specified'}</p>
                    <p class="deadline">⏰ <strong>Pickup Deadline:</strong> ${donation.pickupDeadline || 'ASAP'}</p>
                </div>
                
                <button class="btn btn-primary claim-btn" onclick="startMission(${JSON.stringify(donation).replace(/"/g, '&quot;')})">
                    🚗 Start Rescue Mission
                </button>
            </div>
        `;
    }).join('');
}

// Start a rescue mission
function startMission(donation) {
    currentMission = donation;
    selectedShelter = null;
    
    // Switch to mission view
    document.getElementById('dashboard-view').classList.remove('active');
    document.getElementById('mission-view').classList.add('active');
    
    // Update mission info
    document.getElementById('mission-title').textContent = `Rescuing: ${donation.donor}`;
    document.getElementById('mission-subtitle').textContent = `Heading to pickup location`;
    document.getElementById('current-destination').textContent = donation.pickupAddress || 'Pickup Location';
    document.getElementById('current-step').textContent = 'Pickup Food';
    
    // Show/hide buttons
    document.getElementById('arrived-btn').style.display = 'block';
    document.getElementById('select-shelter-btn').style.display = 'none';
    document.getElementById('complete-mission-btn').style.display = 'none';
    document.getElementById('shelter-selection').style.display = 'none';
    
    // Clear any existing markers and calculate route
    clearAllMarkers();
    calculateRouteToPickup(donation);
    
    updateMissionProgress(0);
}

// Calculate route to pickup location
function calculateRouteToPickup(donation) {
    const pickupLocation = { lat: parseFloat(donation.lat), lng: parseFloat(donation.lng) };
    
    const request = {
        origin: currentPosition,
        destination: pickupLocation,
        travelMode: google.maps.TravelMode[currentTravelMode],
        provideRouteAlternatives: false
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            // Update route info
            const route = result.routes[0];
            const leg = route.legs[0];
            
            document.getElementById('route-distance').textContent = leg.distance.text;
            document.getElementById('route-eta').textContent = leg.duration.text;
            
            // Fit map to show entire route with padding
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(currentPosition);
            bounds.extend(pickupLocation);
            map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
            
        } else {
            console.error('Directions request failed: ' + status);
            document.getElementById('route-eta').textContent = 'Route failed';
        }
    });
}

// Mark arrived at pickup location
function markArrivedAtPickup() {
    if (!currentMission) return;
    
    document.getElementById('mission-subtitle').textContent = 'Food picked up! Click any shelter on the map to select delivery destination';
    document.getElementById('current-destination').textContent = 'Click a shelter on map';
    document.getElementById('current-step').textContent = 'Select Shelter';
    document.getElementById('route-eta').textContent = '--';
    
    updateMissionProgress(1);
    
    // Show shelter selection on map
    document.getElementById('arrived-btn').style.display = 'none';
    document.getElementById('select-shelter-btn').style.display = 'none';
    
    // Clear current route and show shelters on map
    clearAllMarkers();
    addShelterMarkers();
    
    // Show instruction to user
    const mapOverlay = document.querySelector('.map-overlay');
    mapOverlay.innerHTML = `
        <div class="route-info">
            <h4>🎯 Select a Shelter</h4>
            <div class="route-details">
                <span>Click any shelter marker on the map to select it as your delivery destination. Each shelter shows details and a route preview option.</span>
            </div>
        </div>
    `;
}

// Select a shelter and calculate route
function selectShelter(shelter) {
    selectedShelter = shelter;
    
    document.getElementById('mission-subtitle').textContent = `Delivering to ${shelter.name}`;
    document.getElementById('current-destination').textContent = shelter.name;
    document.getElementById('current-step').textContent = 'Deliver Food';
    
    updateMissionProgress(2);
    
    // Show complete mission button
    document.getElementById('complete-mission-btn').style.display = 'block';
    
    // Clear map and calculate route to shelter
    clearAllMarkers();
    calculateRouteToShelter(shelter);
}

// Calculate route to shelter
function calculateRouteToShelter(shelter) {
    const pickupLocation = { 
        lat: parseFloat(currentMission.lat), 
        lng: parseFloat(currentMission.lng) 
    };
    
    const request = {
        origin: pickupLocation,
        destination: { lat: shelter.lat, lng: shelter.lng },
        travelMode: google.maps.TravelMode[currentTravelMode],
        provideRouteAlternatives: false
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            // Update route info
            const route = result.routes[0];
            const leg = route.legs[0];
            
            document.getElementById('route-distance').textContent = leg.distance.text;
            document.getElementById('route-eta').textContent = leg.duration.text;
            
            // Add destination marker
            const destinationMarker = new google.maps.Marker({
                position: { lat: shelter.lat, lng: shelter.lng },
                map: map,
                title: `Destination: ${shelter.name}`,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#dc3545" stroke="white" stroke-width="2"/>
                            <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">🏠</text>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(40, 40),
                    anchor: new google.maps.Point(20, 20)
                }
            });
            
        } else {
            console.error('Directions to shelter failed: ' + status);
            document.getElementById('route-eta').textContent = 'Route failed';
        }
    });
}

// Update mission progress indicator
function updateMissionProgress(step) {
    const steps = ['step-pickup', 'step-select', 'step-deliver'];
    
    steps.forEach((stepId, index) => {
        const stepElement = document.getElementById(stepId);
        stepElement.classList.remove('active', 'completed');
        
        if (index < step) {
            stepElement.classList.add('completed');
        } else if (index === step) {
            stepElement.classList.add('active');
        }
    });
}

// Complete the mission
function completeMission() {
    if (!currentMission || !selectedShelter) return;
    
    alert(`🎉 Mission Complete! Thank you for delivering food from ${currentMission.donor} to ${selectedShelter.name}`);
    
    // Remove the completed donation from localStorage
    const donations = JSON.parse(localStorage.getItem('hubHarvestDonations') || '[]');
    const updatedDonations = donations.filter(d => d.id !== currentMission.id);
    localStorage.setItem('hubHarvestDonations', JSON.stringify(updatedDonations));
    
    // Save mission history
    const missionHistory = JSON.parse(localStorage.getItem('missionHistory') || '[]');
    missionHistory.push({
        ...currentMission,
        shelter: selectedShelter,
        completedAt: new Date().toISOString(),
        volunteerId: localStorage.getItem('volunteerId'),
        travelMode: currentTravelMode
    });
    localStorage.setItem('missionHistory', JSON.stringify(missionHistory));
    
    // Return to dashboard
    document.getElementById('mission-view').classList.remove('active');
    document.getElementById('dashboard-view').classList.add('active');
    
    // Clear map and reset state
    clearAllMarkers();
    
    // Reload donations
    loadFoodDonations();
    
    currentMission = null;
    selectedShelter = null;
}