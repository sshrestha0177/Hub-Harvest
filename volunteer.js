function goBackToRoleSelection() {
    // Set a flag so index.html knows to show role selection
    sessionStorage.setItem('showRoleSelection', 'true');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('volunteerRegForm');
    if (form) {
        form.addEventListener('submit', handleRegistration);
    }
});

function handleRegistration(event) {
    event.preventDefault();
    
    const messageArea = document.getElementById('reMessage');
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address.', 'error', messageArea);
        return;
    }
    
    if (!document.getElementById('safetyAgreement').checked) {
        showMessage('You must agree to the Volunteer Safety Terms to register.', 'error', messageArea);
        return;
    }

    // Save volunteer data
    const volunteerData = {
        fullName: document.getElementById('fullName').value,
        email: email,
        phone: document.getElementById('phone').value,
        vehicleType: document.getElementById('vehicleType').value,
        serviceArea: document.getElementById('serviceArea').value,
        availability: document.getElementById('availability').value,
        hasDriversLicense: document.getElementById('hasDriversLicense').checked,
        hasVehicleInsurance: document.getElementById('hasVehicleInsurance').checked,
        registrationDate: new Date().toISOString()
    };

    localStorage.setItem('volunteerData', JSON.stringify(volunteerData));
    localStorage.setItem('volunteerId', 'VOL-' + Date.now());
    
    showMessage('Registration complete! Redirecting to dashboard...', 'success', messageArea);
    
    setTimeout(() => {
        window.location.href = 'volunteer-dashboard.html';
    }, 1500);
}

function showMessage(message, type, element) {
    element.textContent = message;
    element.className = `submission-message ${type}`;
    element.style.display = 'block';
}