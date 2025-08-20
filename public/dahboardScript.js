// Load dashboard data from server
async function loadDashboard() {

    // Reset subscription form fields
    function resetSubscriptionForm() {
        document.getElementById('subscription-form').reset();  // Clear form fields
        document.getElementById("startDateError").textContent = ''; // Clear error message
    }

    try {
        const response = await fetch('/api/dashboard');
        if (response.status === 401) {
            alert('You must log in first.');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        const container = document.getElementById('subscriptions');
        container.innerHTML = '';

        if (data.subscriptions.length === 0) {
            container.innerHTML = '<p>You do not have any subscription.</p>';
            return;
        }

        // Loop through subscriptions and create HTML elements
        data.subscriptions.forEach(sub => {
            const div = document.createElement('div');
            div.className = 'subscription';

            // Format start date
            const date = new Date(sub.start_date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            div.innerHTML = `
                <div>
                  <strong>Sport :</strong> ${sub.sport_name}<br>
                  <strong>Type :</strong> ${sub.type}<br>
                  <strong>Start Date :</strong> from ${formattedDate}
                </div>
                <button class="delete-btn" data-id="${sub.id}">
                    <i class="fi fi-sr-trash"></i>
                </button>
            `;

            container.appendChild(div);
        });

        // Add event listener for delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async function () {
                const id = this.getAttribute('data-id');
                if (confirm("Are you sure you want to delete this subscription?")) {
                    await fetch(`/api/subscription/${id}`, { method: 'DELETE' });
                    loadDashboard(); // Reload list after delete
                }
            });
        });

    } catch (error) {
        alert('An error occurred while loading data.');
        console.error(error);
    }
}

// Delete subscription (alternative function)
function deleteSubscription(subscriptionId) {
    fetch(`/delete-subscription/${subscriptionId}`, {
        method: 'DELETE'
    })
    .then(res => {
        if (res.ok) {
            fetchSubscriptions(); // Reload subscriptions
        } else {
            alert('Error deleting subscription');
        }
    })
    .catch(err => console.error('Error:', err));
}

// Toggle account popup
const accountIcon = document.getElementById("icon2");
const accountPopup = document.getElementById("accountPopup");

accountIcon.addEventListener("click", () => {
    accountPopup.classList.toggle("hidden");
});

// Close popup if clicked outside
document.addEventListener("click", function(event) {
    if (!accountPopup.contains(event.target) && event.target !== accountIcon) {
        accountPopup.classList.add("hidden");
    }
});

// Load user data on page load
document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/user')
        .then(res => res.json())
        .then(user => {
            document.getElementById('username').textContent = user.username;
            document.getElementById('profileImage').src = user.profile_picture;
            document.querySelector('.account-title-word').textContent =user.username;
        })
        .catch(err => console.error('Failed to load user:', err));
});

// Logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
    fetch('/logout')
        .then(() => {
            window.location.href = '/'; // Redirect after logout
        })
        .catch(err => {
            console.error('Logout failed:', err);
        });
});

// Show subscription modal and fetch sports
document.getElementById('add-subscription-btn').addEventListener('click', () => {
    document.getElementById('subscription-modal').style.display = 'block';
    fetch('/api/sports')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('sport-select');
            select.innerHTML = ''; // Clear previous options
            data.forEach(sport => {
                const option = document.createElement('option');
                option.value = sport.id;
                option.textContent = sport.name;
                select.appendChild(option);
            });
        });
});

// Close subscription modal
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('subscription-modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
});

// Submit subscription form with date validation
document.getElementById('subscription-form').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById("startDateError").textContent = '';

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const today = new Date();
    const startDate = new Date(data.start_date);
    today.setHours(0,0,0,0);
    startDate.setHours(0,0,0,0);

    if (startDate < today) {
        document.getElementById("startDateError").textContent = "Start date cannot be in the past.";
        return;
    }

    fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            location.reload(); // Reload page after success
        } else {
            document.getElementById("startDateError").textContent = "Failed to add subscription.";
        }
    });
});

// Show modal with overlay
document.getElementById('add-subscription-btn').addEventListener('click', () => {
    document.getElementById('subscription-modal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
});

// Close modal on overlay click
document.getElementById('overlay').addEventListener('click', () => {
    document.getElementById('subscription-modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
});

// Auto-submit profile image
document.getElementById('fileInput').addEventListener('change', function () {
    this.form.submit();
});

// Initial dashboard load
loadDashboard();
