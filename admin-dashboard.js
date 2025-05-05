const API_BASE = 'https://bank-backend-production.up.railway.app';
let authToken = localStorage.getItem('banking_token');

async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP Error! Status: ${response.status}`);
    }
    return response.json();
}

async function getAccountBalance() {
    try {
        const accountId = document.getElementById('accountId').value;
        const response = await fetch(`${API_BASE}/admin/accounts/${accountId}/balance`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await handleResponse(response);
        document.getElementById('balanceResult').innerHTML = `
            <p>Balance: $${data.balance}</p>
            <p>Status: ${data.card_status}</p>
            <p>Customer: ${data.customer_name}</p>
        `;
    } catch (error) {
        alert(error.message);
    }
}

async function getAccountStatement() {
    try {
        const accountId = document.getElementById('statementAccountId').value;
        const response = await fetch(`${API_BASE}/admin/accounts/${accountId}/statement`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await handleResponse(response);
        const transactions = data.transactions.map(t => `
            <tr>
                <td>${new Date(t.created_at).toLocaleDateString()}</td>
                <td>$${t.amount}</td>
                <td>${t.description}</td>
            </tr>
        `).join('');
        document.getElementById('statementResult').innerHTML = `
            <h4>Statement for Account ${accountId}</h4>
            <table>
                <tr><th>Date</th><th>Amount</th><th>Description</th></tr>
                ${transactions}
            </table>
        `;
    } catch (error) {
        alert(error.message);
    }
}

async function createLoan() {
    try {
        const loanData = {
            account_id: document.getElementById('loanAccountId').value,
            loan_type_id: document.getElementById('loanType').value,
            amount_paid: document.getElementById('loanAmount').value,
            due_date: document.getElementById('dueDate').value
        };

        const response = await fetch(`${API_BASE}/loans/apply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loanData)
        });
        
        const result = await handleResponse(response);
        alert(`Loan created successfully! Loan ID: ${result.loan_id}`);
    } catch (error) {
        alert(error.message);
    }
}

async function deleteEmployee(employeeId) {
    try {
        const response = await fetch(`${API_BASE}/admin/employees/${employeeId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` }
        });
        await handleResponse(response);
        loadEmployees();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteCustomer(customerId) {
    try {
        const response = await fetch(`${API_BASE}/customers/${customerId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` }
        });
        await handleResponse(response);
        loadCustomers();
    } catch (error) {
        alert(error.message);
    }
}

async function createCustomer() {
    try {
        const customerData = {
            first_name: document.getElementById('custFirstName').value,
            last_name: document.getElementById('custLastName').value,
            email: document.getElementById('custEmail').value,
            password: document.getElementById('custPassword').value,
            date_of_birth: null,
            gender: null,
            phone: null
        };

        const response = await fetch(`${API_BASE}/customers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });

        const result = await handleResponse(response);
        alert(`Customer created successfully! ID: ${result.customer_id}`);
        loadCustomers();
    } catch (error) {
        alert(error.message);
    }
}

async function createEmployee() {
    try {
        const employeeData = {
            first_name: document.getElementById('empFirstName').value,
            last_name: document.getElementById('empLastName').value,
            email: document.getElementById('empEmail').value,
            password: document.getElementById('empPassword').value,
            position: 'Staff'
        };

        const response = await fetch(`${API_BASE}/admin/employees`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });

        const result = await handleResponse(response);
        alert(`Employee created successfully! ID: ${result.employee_id}`);
        loadEmployees();
    } catch (error) {
        alert(error.message);
    }
}

async function loadCustomers() {
    try {
        const response = await fetch(`${API_BASE}/customers`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const customers = await handleResponse(response);
        
        const tbody = document.querySelector('#customersTable tbody');
        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.first_name} ${customer.last_name}</td>
                <td>${customer.email}</td>
                <td>${new Date(customer.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="delete-btn" onclick="deleteCustomer(${customer.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        alert(error.message);
    }
}

async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE}/admin/employees`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const employees = await handleResponse(response);
        
        const tbody = document.querySelector('#employeesTable tbody');
        tbody.innerHTML = employees.map(employee => `
            <tr>
                <td>${employee.employee_id}</td>
                <td>${employee.first_name} ${employee.last_name}</td>
                <td>${employee.position}</td>
                <td>${new Date(employee.hire_date).toLocaleDateString()}</td>
                <td>
                    <button class="delete-btn" onclick="deleteEmployee(${employee.employee_id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        alert(error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!authToken) window.location.href = 'admin.html';
    loadCustomers();
    loadEmployees();
});
