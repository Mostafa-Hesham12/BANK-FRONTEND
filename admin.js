document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('adminLoginForm');
    const API_BASE = 'https://bank-backend-production.up.railway.app';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        
        try {
            const response = await fetch(`${API_BASE}/admin/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Admin authentication failed');
            }

            const { access_token } = await response.json();
            localStorage.setItem('banking_token', access_token);
            window.location.href = 'admin-dashboard.html';

        } catch (error) {
            const errorElement = document.getElementById('adminError');
            errorElement.textContent = error.message;
            errorElement.style.color = '#e74c3c';
            console.error('Admin login error:', error);
        }
    });
});