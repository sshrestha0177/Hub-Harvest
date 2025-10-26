const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

// Check if coming back from another page
document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('showRoleSelection') === 'true') {
        sessionStorage.removeItem('showRoleSelection');
        showView('role-view');
    }
});

// Show error/success messages
function setAuthMessage(message, type = 'error') {
    const msgElement = document.getElementById('authMessage');
    msgElement.textContent = message;
    msgElement.className = `auth-message ${type}`;
}

// Switch between different screens
function showView(viewId) {
    if (sessionStorage.getItem('showRoleSelection') === 'true') {
        sessionStorage.removeItem('showRoleSelection');
        viewId = 'role-view';
    }
    
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
    setAuthMessage('');
}

// Toggle between login and signup forms
function toggleAuth(mode) {
    const signInForm = document.getElementById('signInForm');
    const registerForm = document.getElementById('registerForm');
    const signInBtn = document.getElementById('signInBtn');
    const registerBtn = document.getElementById('registerBtn');

    if (mode === 'signIn') {
        signInForm.classList.add('active-form');
        registerForm.classList.remove('active-form');
        signInBtn.classList.add('active');
        registerBtn.classList.remove('active');
    } else {
        signInForm.classList.remove('active-form');
        registerForm.classList.add('active-form');
        signInBtn.classList.remove('active');
        registerBtn.classList.add('active');
    }
    setAuthMessage('');
}

// Handle login/signup form submission
function handleAuth(event, formId) {
    event.preventDefault();
    setAuthMessage('');

    if (formId === 'signInForm') {
        const emailInput = document.getElementById('signInEmail');
        const email = emailInput.value.trim();

        // Check if email is valid
        if (!emailRegex.test(email)) {
            setAuthMessage('❌ Invalid email format. Please check your entry.');
            return;
        }

        setAuthMessage('✅ Signing in...', 'success'); 
        setTimeout(() => {
            showView('role-view');
        }, 1000); 

    } else if (formId === 'registerForm') {
        const emailInput = document.getElementById('registerEmail');
        const email = emailInput.value.trim();

        if (!emailRegex.test(email)) {
            setAuthMessage('❌ Invalid email format. Please check your entry.');
            return;
        }

        setAuthMessage('🎉 Registering your account...', 'success');
        setTimeout(() => {
            showView('role-view');
        }, 1000); 
    }
}

// Redirect to donor or volunteer page
function selectRole(role) {
    if (role === 'donor') {
        window.location.href = 'donor.html'; 
    } else if (role === 'volunteer') {
        window.location.href = 'volunteer.html';
    }
}