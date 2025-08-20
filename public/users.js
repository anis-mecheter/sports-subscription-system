// ===== Wait for DOM to load =====
document.addEventListener('DOMContentLoaded', () => {
  fetchUsers(); // Fetch all users when page loads
});

// ===== Fetch all users from the server =====
function fetchUsers() { 
  fetch('/api/admin/users')
    .then(res => res.json()) // Parse JSON response
    .then(users => {
      const tbody = document.getElementById('userTableBody');
      tbody.innerHTML = ''; // Clear existing rows

      // ===== Create table rows for each user =====
      users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${user.email}</td>
          <td>${user.username}</td>
          <td>
            <button class="delete-btn" data-id="${user.id}">
              Delete
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // ===== Add delete button event listeners =====
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          if (confirm('Are you sure you want to delete this user and all their subscriptions?')) {
            deleteUser(id); // Call delete function
          }
        });
      });
    });
}

// ===== Delete user by ID =====
function deleteUser(userId) {
  fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE' // HTTP DELETE request
  })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        fetchUsers(); // Reload users after deletion
      } else {
        alert('Failed to delete user.'); // Show error
      }
    });
}
