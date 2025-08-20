// Show the signup form when clicking the "Sign-up" button
document.querySelector('.Sign-up').addEventListener('click', () => {
  document.getElementById("overlay").style.display = "block"; // Show the overlay
  document.getElementById("multiStepForm").style.display = "block"; // Show the multi-step form
  nextStep(1); // Go to the first step
});

// Close the form when clicking outside (overlay)
document.getElementById("overlay").addEventListener('click', closeWindow);
function closeWindow() {
  document.getElementById("multiStepForm").style.display = "none"; // Hide form
  document.getElementById("overlay").style.display = "none"; // Hide overlay
  clearSignupForm(); // Clear the form inputs
}

// Show or hide the login modal
function toggleLoginModal(show) {
  const modal = document.getElementById('loginModal');
  modal.style.display = show ? 'flex' : 'none'; // Flex to center the modal
  if (!show) clearLoginForm(); // Clear login form on close
}

// Open login modal when clicking "Log-in" button
document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.querySelector(".Log-in");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => toggleLoginModal(true));
  }
});

// Close login modal when clicking outside the modal content
document.getElementById("loginModal").addEventListener("click", function (e) {
  if (e.target === this) toggleLoginModal(false);
});

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Navigate between form steps with validation
function nextStep(step) {
  document.querySelectorAll('.error-message').forEach(e => e.textContent = ''); // Clear previous errors
  let valid = true;

  if (step === 2) {
    // Validate step 1 inputs
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!email || !isValidEmail(email)) {
      document.getElementById("emailError").textContent = "Please enter a valid email address.";
      valid = false;
    }
    if (!username || username.length < 3) {
      document.getElementById("usernameError").textContent = "Username must be at least 3 characters.";
      valid = false;
    }
    if (!password || password.length < 6) {
      document.getElementById("passwordError").textContent = "Password must be at least 6 characters.";
      valid = false;
    }
    if (password !== confirmPassword) {
      document.getElementById("confirmPasswordError").textContent = "Passwords do not match.";
      valid = false;
    }
  } else if (step === 3) {
    // Validate step 2 inputs
    const birthdate = document.getElementById("date").value;
    const sexInput = document.querySelector('input[name="sex"]:checked');

    if (!birthdate) {
      document.getElementById("dateError").textContent = "Please enter your birthdate.";
      valid = false;
    } else {
      const birth = new Date(birthdate);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      const dayDiff = today.getDate() - birth.getDate();
      const fullAge = monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0) ? age : age - 1;
      if (fullAge < 7) {
        document.getElementById("dateError").textContent = "You must be at least 7 years old.";
        valid = false;
      }
    }

    if (!sexInput) {
      document.getElementById("sexError").textContent = "Please select your sex.";
      valid = false;
    }
  }

  if (!valid) return; // Stop if validation failed
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById("step" + step).classList.add('active'); // Show the current step
}

// Handle login request
document.querySelector('.login-submit').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();
  if (result.success) {
    clearLoginForm(); // Clear form after success
    window.location.href = '/dashboard.html'; // Redirect to dashboard
  } else {
    showToast("Email or password is incorrect", true); // Show error toast
  }
});

// Handle final signup button with validation
document.querySelector(".fenish-btn").addEventListener("click", async () => {
  document.querySelectorAll('.error-message').forEach(el => el.textContent = ''); // Clear previous errors

  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const birthdate = document.getElementById("date").value;
  const sexInput = document.querySelector('input[name="sex"]:checked');
  const sex = sexInput ? sexInput.value : "";
  const agreed = document.getElementById("agree-checkbox").checked;

  let valid = true;
  if (!agreed) {
    document.getElementById("agreeError").textContent = "You must agree to the terms.";
    valid = false;
  }

  if (!valid) return;

  const response = await fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, confirmPassword, birthdate, sex, agreed })
  });

  const result = await response.json();
  if (result.success) {
    showToast("Registered successfully!");
    clearSignupForm(); // Clear form after success
    closeWindow();
  } else {
    showToast(result.error || "Registration failed.", true);
  }
});

// Show toast message
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 20px";
  toast.style.backgroundColor = isError ? "#e74c3c" : "#007A33"; // Red for error, green for success
  toast.style.color = "white";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  toast.style.zIndex = 1000;
  toast.style.fontSize = "1rem";
  toast.style.transition = "opacity 0.5s";
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500); // Remove after fade-out
  }, 3000);
}

// Clear signup form inputs
function clearSignupForm() {
  document.getElementById("email").value = "";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("confirm-password").value = "";
  document.getElementById("date").value = "";
  document.getElementById("agree-checkbox").checked = false;
  document.querySelectorAll('input[name="sex"]').forEach(input => input.checked = false);
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

// Clear login form inputs
function clearLoginForm() {
  document.getElementById('loginEmail').value = "";
  document.getElementById('loginPassword').value = "";
}
