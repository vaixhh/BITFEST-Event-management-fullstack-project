const API_BASE = "http://localhost:5000/api";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");

if (!token || user.role !== "admin") {
  alert("Admin access only.");
  window.location.href = "login.html";
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
}

const form = document.getElementById("eventForm");
const resetBtn = document.getElementById("resetBtn");
const submitBtn = document.getElementById("submitBtn");
const formTitle = document.getElementById("formTitle");
const eventsList = document.getElementById("eventsList");
const registrationsList = document.getElementById("registrationsList");

let editingId = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const eventData = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    venue: document.getElementById("venue").value,
    rules: document.getElementById("rules").value,
    totalSeats: Number(document.getElementById("totalSeats").value || 0),
    fee: Number(document.getElementById("fee").value || 0),
    prize: document.getElementById("prize").value
  };

  const url = editingId ? `${API_BASE}/events/${editingId}` : `${API_BASE}/events`;
  const method = editingId ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(eventData)
    });

    const data = await response.json();
    if (response.ok) {
      alert(editingId ? "Event updated." : "Event created.");
      resetForm();
      loadEvents();
    } else {
      alert(data.message || "Action failed.");
    }
  } catch (error) {
    alert("Server error.");
  }
});

if (resetBtn) {
  resetBtn.addEventListener("click", resetForm);
}

function resetForm() {
  editingId = null;
  form.reset();
  formTitle.textContent = "Create Event";
  submitBtn.textContent = "Add Event";
}

async function loadEvents() {
  try {
    const response = await fetch(`${API_BASE}/events`);
    const data = await response.json();
    eventsList.innerHTML = "";

    data.forEach((event) => {
      const item = document.createElement("div");
      item.className = "admin-item";
      item.innerHTML = `
        <strong>${event.title}</strong>
        <span>${event.category} | ${event.date} | ${event.time}</span>
        <span>Seats: ${event.registeredCount || 0} / ${event.totalSeats || "TBA"}</span>
        <span>Fee: ${event.fee ? "INR " + event.fee : "Free"}</span>
        <div class="admin-actions">
          <button class="btn btn-ghost btn-small" data-action="edit">Edit</button>
          <button class="btn btn-primary btn-small" data-action="delete">Delete</button>
        </div>
      `;

      item.querySelector('[data-action="edit"]').addEventListener("click", () => {
        editingId = event._id;
        document.getElementById("title").value = event.title;
        document.getElementById("description").value = event.description;
        document.getElementById("category").value = event.category;
        document.getElementById("date").value = event.date;
        document.getElementById("time").value = event.time;
        document.getElementById("venue").value = event.venue || "";
        document.getElementById("rules").value = event.rules || "";
        document.getElementById("totalSeats").value = event.totalSeats || "";
        document.getElementById("fee").value = event.fee || 0;
        document.getElementById("prize").value = event.prize || "";
        formTitle.textContent = "Edit Event";
        submitBtn.textContent = "Update Event";
      });

      item.querySelector('[data-action="delete"]').addEventListener("click", async () => {
        if (!confirm("Delete this event?")) return;
        try {
          const response = await fetch(`${API_BASE}/events/${event._id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.ok) {
            loadEvents();
          } else {
            const data = await response.json();
            alert(data.message || "Delete failed.");
          }
        } catch (error) {
          alert("Server error.");
        }
      });

      eventsList.appendChild(item);
    });
  } catch (error) {
    eventsList.innerHTML = "<p>Unable to load events.</p>";
  }
}

async function loadRegistrations() {
  try {
    const response = await fetch(`${API_BASE}/registrations`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    registrationsList.innerHTML = "";

    data.forEach((registration) => {
      const item = document.createElement("div");
      item.className = "admin-item";
      item.innerHTML = `
        <strong>${registration.user?.name || "Student"}</strong>
        <span>${registration.event?.title || "Event"}</span>
        <span>Status: ${registration.status}</span>
        <div class="admin-actions">
          <button class="btn btn-ghost btn-small" data-action="complete">Mark Completed</button>
        </div>
      `;

      const completeBtn = item.querySelector('[data-action="complete"]');
      completeBtn.addEventListener("click", async () => {
        try {
          const response = await fetch(`${API_BASE}/registrations/${registration._id}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status: "completed", certificateAvailable: true })
          });
          if (response.ok) {
            loadRegistrations();
          } else {
            const data = await response.json();
            alert(data.message || "Update failed.");
          }
        } catch (error) {
          alert("Server error.");
        }
      });

      registrationsList.appendChild(item);
    });
  } catch (error) {
    registrationsList.innerHTML = "<p>Unable to load registrations.</p>";
  }
}

loadEvents();
loadRegistrations();
