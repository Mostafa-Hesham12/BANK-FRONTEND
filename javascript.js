document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('https://bank-backend-production.up.railway.app/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Login failed');
            }

            const { access_token } = await response.json();
            localStorage.setItem('banking_token', access_token);
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            const errorElement = document.getElementById('errorMessage');
            errorElement.textContent = error.message;
            errorElement.style.color = 'red'; // Make error visible
            console.error('Login error:', error);
        }
    });
});