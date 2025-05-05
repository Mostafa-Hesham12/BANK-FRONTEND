const API_BASE = 'https://bank-backend-production.up.railway.app';

console.log('[DEBUG] Dashboard script loaded');
console.log('[DEBUG] Initial token:', localStorage.getItem('banking_token'));

async function fetchProtectedData(endpoint) {
    const token = localStorage.getItem('banking_token');
    console.log(`[DEBUG] Attempting to fetch: ${API_BASE}${endpoint}`);
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`[DEBUG] Response for ${endpoint}:`, response);
        
        if (response.status === 401) {
            console.warn('[AUTH] Unauthorized - redirecting to login');
            logout();
            return null;
        }

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[ERROR] Failed to fetch ${endpoint}:`, error);
        throw error;
    }
}

async function loadBalance() {
    try {
        const data = await fetchProtectedData('/accounts/balance');
        if (data) {
            document.getElementById('balanceAmount').textContent = `$${data.balance.toFixed(2)}`;
            document.getElementById('cardStatus').textContent = data.card_status;
            document.getElementById('welcomeHeader').textContent = `Welcome, ${data.customer_name}`;
            
            const blockBtn = document.getElementById('blockBtn');
            blockBtn.textContent = data.card_status === 'Blocked' ? 'Unblock' : 'Block';
            blockBtn.className = `block-btn ${data.card_status === 'Blocked' ? 'unblock' : 'block'}`;
        }
    } catch (error) {
        console.error('Balance load error:', error);
    }
}

async function toggleBlockStatus() {
    try {
        const currentStatus = document.getElementById('cardStatus').textContent === 'Blocked';
        
        const response = await fetch(`${API_BASE}/cards/toggle-block`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('banking_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_blocked: !currentStatus 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail);
        }

        const newStatus = !currentStatus ? 'Blocked' : 'Active';
        document.getElementById('cardStatus').textContent = newStatus;
        document.getElementById('blockBtn').textContent = newStatus === 'Blocked' ? 'Unblock' : 'Block';
        document.getElementById('blockBtn').className = `block-btn ${newStatus === 'Blocked' ? 'unblock' : 'block'}`;

    } catch (error) {
        alert(error.message);
    }
}

async function loadTransactions() {
    try {
        const data = await fetchProtectedData('/accounts/statement');
        const container = document.getElementById('transactionsContainer');
      

        data.transactions.forEach(t => {
            let dateString;
            try {
                const rawDate = t.date; 
                
                const transactionDate = new Date(rawDate);
                
                const options = {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Africa/Cairo',
                    numberingSystem: 'arab'
                };

                dateString = transactionDate.toLocaleString('ar-EG', options);
                
                
                
            } catch (e) {
                console.error('Date error:', e);
                dateString = 'Date Not Available';
            }

            const isDeposit = t.type === 'deposit';
            const amount = parseFloat(t.amount).toFixed(2);
            
            const transactionEl = document.createElement('div');
            transactionEl.className = 'transaction-item';
            transactionEl.innerHTML = `
                <div class="transaction-type ${isDeposit ? 'deposit' : 'withdraw'}">
                    ${isDeposit ? '+' : '-'}
                </div>
                <div class="transaction-details">
                    <div>${t.description || 'No Description'}</div>
                    <div class="transaction-date">${dateString}</div>
                </div>
                <div class="transaction-amount">
                    ${isDeposit ? '+' : '-'}$${amount}
                </div>
            `;
            container.appendChild(transactionEl);
        });

    } catch (error) {
        console.error('Transaction load error:', error);
        container.innerHTML = 'Error loading transactions';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[DEBUG] DOM fully loaded and parsed');
    
    if (!localStorage.getItem('banking_token')) {
        console.warn('[AUTH] No token found - redirecting');
        logout();
        return;
    }

    try {
        console.log('[DEBUG] Starting data load...');
        await Promise.all([loadBalance(), loadTransactions()]);
        console.log('[DEBUG] Data load completed');
    } catch (error) {
        console.error('[ERROR] Dashboard initialization failed:', error);
    }
});

function loadDeposit() { window.location.href = 'deposit.html'; }
function loadWithdraw() { window.location.href = 'withdraw.html'; }
function loadTransfer() { window.location.href = 'transfer.html'; }

function logout() {
    console.log('[AUTH] Initiating logout');
    localStorage.removeItem('banking_token');
    window.location.href = 'index.html';
}
