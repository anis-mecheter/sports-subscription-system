// Load user data when the page loads
window.onload = async () => {
  try {
    // Fetch user information from server API
    const response = await fetch('/api/user-info');
    const user = await response.json();

    // Populate form fields with fetched user data
    document.getElementById('id').value = user.id;
    document.getElementById('email').value = user.email;
    document.getElementById('username').value = user.username;
    document.getElementById('password').value = user.password;

    // Format birthdate for input[type="date"]
    const birthdate = new Date(user.birthdate);
    const formattedDate = birthdate.toISOString().split('T')[0];
    document.getElementById('birthdate').value = formattedDate;

    // Set sex selection
    document.getElementById('sex').value = user.sex;
  } catch (error) {
    // Show error toast if fetching fails
    showToast("⚠️ Failed to load user info", true);
  }
};

// Submit account changes with validation
document.getElementById('accountForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  clearAccountErrors(); // Clear previous error messages

  // Get form values
  const id = document.getElementById('id').value;
  const email = document.getElementById('email').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const birthdate = document.getElementById('birthdate').value;
  const sex = document.getElementById('sex').value;

  let valid = true;

  // Validate email format
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('emailError').textContent = "Invalid email format.";
    valid = false;
  }

  // Validate username length
  if (!username || username.length < 3) {
    document.getElementById('usernameError').textContent = "Username must be at least 3 characters.";
    valid = false;
  }

  // Validate password length
  if (!password || password.length < 6) {
    document.getElementById('passwordError').textContent = "Password must be at least 6 characters.";
    valid = false;
  }

  // Validate birthdate and minimum age
  if (!birthdate) {
    document.getElementById('birthdateError').textContent = "Birthdate is required.";
    valid = false;
  } else {
    const birth = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    const fullAge = monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0) ? age : age - 1;

    // Check if user is at least 7 years old
    if (fullAge < 7) {
      document.getElementById('birthdateError').textContent = "You must be at least 7 years old.";
      valid = false;
    }
  }

  // Validate sex selection
  if (!sex) {
    document.getElementById('sexError').textContent = "Sex is required.";
    valid = false;
  }

  // Stop submission if validation failed
  if (!valid) return;

  // Prepare form data to send to server
  const formData = new FormData();
  formData.append('id', id);
  formData.append('email', email);
  formData.append('username', username);
  formData.append('password', password);
  formData.append('birthdate', birthdate);
  formData.append('sex', sex);

  try {
    // Send POST request to update account
    const response = await fetch('/api/update-account', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    // Show success message
    if (result.message) {
      showToast(result.message);
    } else {
      showToast("Account updated successfully!");
    }
  } catch (error) {
    // Show error message if update fails
    showToast("Error updating account", true);
  }
});

// Clear all account error messages
function clearAccountErrors() {
  document.querySelectorAll('.account-error').forEach(el => el.textContent = '');
}

// Go back to previous page
function goBack() {
  window.history.back();
}

// Show toast notification
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 20px";
  toast.style.backgroundColor = isError ? "#e74c3c" : "#007A33";
  toast.style.color = "white";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  toast.style.zIndex = 1000;
  toast.style.fontSize = "1rem";
  toast.style.transition = "opacity 0.5s";
  document.body.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}
