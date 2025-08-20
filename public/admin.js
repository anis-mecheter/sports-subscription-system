// When page loads, open Dashboard by default
window.addEventListener('DOMContentLoaded', () => {
    // Load Dashboard in iframe
    document.querySelector('iframe[name="contentFrame"]').src = "admin-dashboard.html";
    
    // Activate the first link automatically
    const firstLink = document.querySelector('.menu ul li a');
    if (firstLink) {
      firstLink.classList.add('active');
    }
});

// Highlight clicked link in sidebar
const links = document.querySelectorAll('.menu ul li a');
links.forEach(link => {
  link.addEventListener('click', () => {
    // Remove 'active' from all links
    links.forEach(l => l.classList.remove('active'));
    // Add 'active' to clicked link
    link.classList.add('active');
  });
});
