document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('depositForm');
    const API_BASE = 'https://bank-backend-production.up.railway.app';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const amountInput = document.getElementById('amount');
        const referenceInput = document.getElementById('reference');
        
        const amount = parseFloat(amountInput.value);
        const reference = referenceInput.value.trim();

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/transactions/deposit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('banking_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount,
                    description: reference || 'Cash deposit'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Deposit failed');
            }

            const result = await response.json();
            alert(`Success! New balance: $${result.new_balance.toFixed(2)}`);
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error('Deposit error:', error);
        }
    });
});