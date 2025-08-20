// Load all subscriptions once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadSubscriptions);

// Function to fetch and display subscriptions
function loadSubscriptions() {
  fetch('/api/admin/subscriptions') // Call API to get subscriptions
    .then(res => res.json()) // Parse response as JSON
    .then(data => {
      const tbody = document.getElementById('subscriptionsBody'); // Table body element
      tbody.innerHTML = ''; // Clear existing rows

      // Loop through each subscription and create a table row
      data.forEach(sub => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${sub.username}</td> <!-- User name -->
          <td>${sub.email}</td> <!-- User email -->
          <td>${sub.sport_name}</td> <!-- Sport name -->
          <td>${sub.type}</td> <!-- Subscription type -->
          <td>${new Date(sub.start_date).toLocaleDateString()}</td> <!-- Format start date -->
          <td>
            <button class="delete-btn" onclick="deleteSubscription(${sub.id})">Delete</button> <!-- Delete button -->
          </td>
        `;
        tbody.appendChild(tr); // Append row to table
      });
    });
}

// Function to delete a subscription by ID
function deleteSubscription(id) {
  if (confirm('Are you sure you want to delete this subscription?')) { // Confirm deletion
    fetch(`/api/admin/subscriptions/${id}`, {
      method: 'DELETE' // Send DELETE request
    })
    .then(res => res.json()) // Parse response as JSON
    .then(response => {
      if (response.success) {
        loadSubscriptions(); // Reload subscriptions after successful deletion
      } else {
        alert('Failed to delete subscription.'); // Show error if deletion fails
      }
    });
  }
}
