
// Add back button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Back button in header
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', goBackToRoleSelection);
    }
    
    // Back button in form
    const backToRoleSelect = document.getElementById('backToRoleSelect');
    if (backToRoleSelect) {
        backToRoleSelect.addEventListener('click', goBackToRoleSelection);
    }
    
    // Form submission handler
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationFormSubmit);
    }
});

/**
 * Navigates directly back to the role selection page
 */
function goBackToRoleSelection() {
    // Set a flag in sessionStorage so index.html knows to show role selection
    sessionStorage.setItem('showRoleSelection', 'true');
    // Navigate to index.html
    window.location.href = 'index.html';
}

/**
 * Handles the donation form submission
 */
function handleDonationFormSubmit(event) {
    event.preventDefault(); // Stop the default form submission
    
    const form = event.target;
    const messageArea = document.getElementById('submissionMessage');
    
    // Check the required Safety Agreement
    const isAgreed = document.getElementById('safetyAgreement').checked;
    
    if (!isAgreed) {
        setMessage('You must agree to the Food Safety Terms to post food.', 'error');
        return;
    }
    
    // Check if the deadline is in the future
    const deadlineInput = document.getElementById('pickupDeadline');
    const deadline = new Date(deadlineInput.value);
    const now = new Date();
    
    if (deadline <= now) {
        setMessage('The pickup deadline must be a future date and time.', 'error');
        return;
    }

    // --- Data Collection (Client-Side) ---
    const donationData = {
        id: 'DON-' + Date.now(), // Add ID for local storage saving
        foodType: form.foodType.value,
        quantity: form.quantity.value,
        pickupDeadline: deadline.toLocaleString(), // Use local string for volunteer display
        pickupAddress: form.pickupAddress.value,
        hasImage: form.foodImage.files.length > 0, 
        datePosted: now.toISOString(),
        donorId: 'DNR-456' 
        // NOTE: Mock geocoding and local storage saving logic (from previous step) should be here.
    };

    // --- MOCK DATABASE POST (Using localStorage) ---
    let donations = JSON.parse(localStorage.getItem('hubHarvestDonations') || '[]');
    // Only push if the donation is not just a placeholder
    if(donationData.pickupAddress.length > 0) {
        // NOTE: In a complete version, the mockCoordinates logic would be here.
        donations.push(donationData);
        localStorage.setItem('hubHarvestDonations', JSON.stringify(donations));
    }

    setMessage('🚀 **Success!** Your surplus food has been posted for volunteer rescue. Redirecting...', 'success');
    
    // Simulate redirection back to the main app dashboard/index after posting
    setTimeout(() => {
        // Redirect to index.html (home page) after a successful post
        window.location.href = 'index.html'; 
    }, 2500);
}

/**
 * Displays a submission status message.
 */
function setMessage(message, type = 'error') {
    const msgElement = document.getElementById('submissionMessage');
    msgElement.textContent = message;
    msgElement.className = `submission-message ${type}`;
    msgElement.style.display = 'block';
}


function goBackToRoleSelection() {
    // Set a flag so index.html knows to show role selection
    sessionStorage.setItem('showRoleSelection', 'true');
    window.location.href = 'index.html';
}

// In your donor form submission handler, add coordinates:
const donationData = {
    id: 'DON-' + Date.now(),
    foodType: form.foodType.value,
    quantity: form.quantity.value,
    pickupDeadline: deadline.toLocaleString(),
    pickupAddress: form.pickupAddress.value,
    // Add mock coordinates for demo (in real app, use geocoding)
    lat: currentPosition.lat + (Math.random() - 0.5) * 0.02,
    lng: currentPosition.lng + (Math.random() - 0.5) * 0.02,
    hasImage: form.foodImage.files.length > 0, 
    datePosted: now.toISOString(),
    donorId: 'DNR-456',
    urgency: 'Medium' // You can add an urgency field to your form
};