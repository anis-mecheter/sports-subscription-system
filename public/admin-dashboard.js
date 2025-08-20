document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch overall statistics for dashboard
    const statsRes = await fetch("/api/admin/stats");
    const stats = await statsRes.json();

    // Display statistics in cards
    document.getElementById("userCount").textContent = stats.userCount;
    document.getElementById("subscriptionCount").textContent = stats.subscriptionCount;
    document.getElementById("sportCount").textContent = stats.sportCount;

    // Fetch top 5 most subscribed sports
    const sportsRes = await fetch("/api/admin/top-sports");
    const sports = await sportsRes.json();

    // Clear existing table rows
    const tbody = document.getElementById("topSportsTableBody");
    tbody.innerHTML = "";

    // Add new rows dynamically for each sport
    sports.forEach(sport => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${sport.name}</td>
        <td>${sport.total}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (error) {
    // Log error if fetching fails
    console.error("Error loading dashboard:", error);
  }
});
