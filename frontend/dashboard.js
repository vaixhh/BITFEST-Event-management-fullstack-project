const API_BASE = "http://localhost:5000/api";

const token = localStorage.getItem("token");
if (!token) {
  alert("Please login first.");
  window.location.href = "login.html";
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
}

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const registrationsList = document.getElementById("registrationsList");
const totalRegistrations = document.getElementById("totalRegistrations");
const paidCount = document.getElementById("paidCount");
const certificateCount = document.getElementById("certificateCount");

async function loadProfile() {
  try {
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      userName.textContent = data.user.name;
      userEmail.textContent = data.user.email;
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadRegistrations() {
  try {
    const response = await fetch(`${API_BASE}/registrations/my`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    registrationsList.innerHTML = "";

    let paid = 0;
    let certificates = 0;

    data.forEach((registration) => {
      const event = registration.event || {};
      const payment = registration.payment || {};

      if (payment.status === "paid") {
        paid += 1;
      }

      if (registration.certificateAvailable || registration.status === "completed") {
        certificates += 1;
      }

      const card = document.createElement("div");
      card.className = "registration-card";
      card.innerHTML = `
        <h3>${event.title || "Event"}</h3>
        <div class="registration-meta">
          <span>${event.category || "Category"}</span>
          <span>${event.date || "Date"}</span>
          <span>${event.time || "Time"}</span>
          <span>Status: ${registration.status}</span>
          <span>Payment: ${payment.status || "pending"}</span>
        </div>
        <div class="registration-actions"></div>
      `;

      const actions = card.querySelector(".registration-actions");
      if (registration.certificateAvailable || registration.status === "completed") {
        const button = document.createElement("button");
        button.className = "btn btn-primary btn-small";
        button.textContent = "Download certificate";
        button.addEventListener("click", () => downloadCertificate(registration._id));
        actions.appendChild(button);
      }

      registrationsList.appendChild(card);
    });

    totalRegistrations.textContent = data.length;
    paidCount.textContent = paid;
    certificateCount.textContent = certificates;
  } catch (error) {
    registrationsList.innerHTML = "<p>Unable to load registrations.</p>";
  }
}

async function downloadCertificate(registrationId) {
  try {
    const response = await fetch(`${API_BASE}/certificates/${registrationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.message || "Certificate not available.");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bitfest-certificate-${registrationId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert("Unable to download certificate.");
  }
}

loadProfile();
loadRegistrations();
