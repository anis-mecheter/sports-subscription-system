document.addEventListener("DOMContentLoaded", () => {
  const sportsList = document.getElementById("sportsList"); // Container for sports table
  const addSportForm = document.getElementById("addSportForm"); // Form to add new sport

  // Fetch all sports and display them
  async function fetchSports() {
    try {
      const res = await fetch("/api/admin/sports"); // API call to get sports
      const sports = await res.json();

      // Populate the sports table
      sportsList.innerHTML = `
        <table border="1" cellpadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${sports.map(sport => `
              <tr>
                <td>${sport.id}</td>
                <td>${sport.name}</td>
                <td>
                  <img src="/sports_img/${sport.sport_img}" width="80" height="60" />
                </td>
                <td>
                  <button class="edit-btn" onclick="editSport(${sport.id}, '${sport.name}')">Edit</button>
                  <button class="delete-btn" onclick="deleteSport(${sport.id})">Delete</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } catch (err) {
      console.error("Error fetching sports:", err); // Log error if API fails
    }
  }

  // Add a new sport
  addSportForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission
    const formData = new FormData(addSportForm); // Collect form data

    try {
      const res = await fetch("/api/admin/sports", {
        method: "POST", // POST request to add sport
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        alert("Sport added successfully"); // Success message
        addSportForm.reset(); // Clear the form
        fetchSports(); // Refresh sports list
      } else {
        alert("Failed to add sport"); // Failure message
      }
    } catch (err) {
      console.error("Error adding sport:", err);
    }
  });

  // Edit a sport
  window.editSport = async (id, currentName) => {
    const newName = prompt("Enter new name for sport:", currentName); // Prompt for new name
    if (!newName) return;

    const formData = new FormData();
    formData.append("name", newName); // Add updated name to form data

    // Optional: change image
    const newImage = prompt("If you want to change the image, type the file name (or leave blank):");
    if (newImage) {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.onchange = async () => {
        formData.append("sport_img", fileInput.files[0]); // Add new image

        await fetch(`/api/admin/sports/${id}`, {
          method: "PUT", // PUT request to update sport
          body: formData
        });
        fetchSports(); // Refresh list
      };
      fileInput.click(); // Open file chooser
    } else {
      await fetch(`/api/admin/sports/${id}`, {
        method: "PUT",
        body: formData
      });
      fetchSports();
    }
  };

  // Delete a sport
  window.deleteSport = async (id) => {
    if (!confirm("Are you sure you want to delete this sport?")) return;

    try {
      const res = await fetch(`/api/admin/sports/${id}`, { method: "DELETE" }); // DELETE request
      const data = await res.json();
      if (data.success) {
        alert("Sport deleted successfully"); // Success message
        fetchSports(); // Refresh list
      } else {
        alert("Failed to delete sport"); // Failure message
      }
    } catch (err) {
      console.error("Error deleting sport:", err);
    }
  };

  // Load sports on page load
  fetchSports();
});
