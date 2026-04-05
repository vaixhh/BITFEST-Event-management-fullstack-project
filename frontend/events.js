const API_BASE = "http://localhost:5000/api";

const eventsSections = document.getElementById("eventsSections");
const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("eventModal");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalContent = document.getElementById("modalContent");
const modalRegisterBtn = document.getElementById("modalRegisterBtn");
const modalStatus = document.getElementById("modalStatus");

// Login-required modal elements
const authModal = document.getElementById("authModal");
const authModalOverlay = document.getElementById("authModalOverlay");
const authModalLoginBtn = document.getElementById("authModalLoginBtn");
const authModalCancelBtn = document.getElementById("authModalCancelBtn");
const authModalMessage = document.getElementById("authModalMessage");

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
};

// Check token from localStorage or cookie
const getToken = () => localStorage.getItem("token") || getCookie("token");
const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");

let allEvents = [];
let currentEvent = null;
const categories = ["Tech", "Workshop", "Non-Tech"];
const filterGroup = document.querySelector(".filter-group");
let activeCategory = "Tech";

const showToast = (message, type = "info") => {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    alert(message);
  }
};

const seatsRemaining = (event) => {
  if (typeof event.totalSeats !== "number") return null;
  return Math.max(event.totalSeats - (event.registeredCount || 0), 0);
};

const resolveFee = (event) => {
  if (typeof event.fee === "number" && event.fee > 0) return event.fee;
  if (event.category === "Workshop") return 0;
  return event.participationType === "group" ? 200 : 50;
};

const formatRules = (rules) => {
  if (!rules) return [];
  return rules
    .split(/\n|\r|\u2022|\-/)
    .map((rule) => rule.trim())
    .filter(Boolean);
};

const renderSections = () => {
  if (!eventsSections) return;
  const searchText = (searchInput?.value || "").toLowerCase();
  const filtered = allEvents.filter((event) => {
    const matchesText = event.title.toLowerCase().includes(searchText);
    const matchesCategory = activeCategory ? event.category === activeCategory : true;
    return matchesText && matchesCategory;
  });

  eventsSections.innerHTML = "";

  const categoriesToRender = activeCategory ? [activeCategory] : categories;

  categoriesToRender.forEach((category) => {
    const categoryEvents = filtered.filter((event) => event.category === category);
    if (categoryEvents.length === 0) return;

    const section = document.createElement("div");
    section.className = "events-section";
    section.innerHTML = `
      <h2>${category} Events</h2>
      <div class="events-grid"></div>
    `;

    const grid = section.querySelector(".events-grid");

    categoryEvents.forEach((event) => {
      const remaining = seatsRemaining(event);
      const isClosed = remaining !== null && remaining <= 0;
      const resolvedFee = resolveFee(event);
      const feeLabel = resolvedFee > 0 ? `₹${resolvedFee}` : "Free";

      const card = document.createElement("article");
      card.className = "event-card";
      card.dataset.eventId = event._id;
      card.innerHTML = `
        <div class="event-meta">
          <span>${event.category}</span>
          <span>${event.date}</span>
          <span>${event.time}</span>
        </div>
        <h3>${event.title}</h3>
        <div class="event-footer">
          <span class="event-price">${feeLabel}</span>
          <button class="btn btn-ghost btn-small" data-action="view">View Details</button>
        </div>
        <span class="event-status ${isClosed ? "closed" : ""}">
          ${remaining === null ? "Seats: TBA" : `${remaining} seats remaining`}
        </span>
      `;

      grid.appendChild(card);
    });

    eventsSections.appendChild(section);
  });
};

const openModal = (event) => {
  currentEvent = event;
  const remaining = seatsRemaining(event);
  const isClosed = remaining !== null && remaining <= 0;
  const rules = formatRules(event.rules);
  const isGroup = event.participationType === "group";
  const minTeam = Number(event.minParticipants || (isGroup ? 2 : 1));
  const maxTeam = Number(event.maxParticipants || (isGroup ? 4 : 1));
  const participationLabel = isGroup ? "Group" : "Solo";
  const teamLabel = isGroup ? `${minTeam}-${maxTeam} members` : "1 participant";
  const resolvedFee = resolveFee(event);
  const feeDetail =
    resolvedFee > 0
      ? isGroup
        ? `₹${resolvedFee} per team`
        : `₹${resolvedFee} per participant`
      : "Free";

  modalContent.innerHTML = `
    <h3 id="eventModalTitle">${event.title}</h3>
    <p>${event.description}</p>
    <p><strong>Category:</strong> ${event.category}</p>
    <p><strong>Date:</strong> ${event.date} | <strong>Time:</strong> ${event.time}</p>
    <p><strong>Venue:</strong> ${event.venue || "To be announced"}</p>
    <p><strong>Participation:</strong> ${participationLabel}</p>
    <p><strong>Team Size:</strong> ${teamLabel}</p>
    <p><strong>Fee:</strong> ${feeDetail}</p>
    <p><strong>Total Seats:</strong> ${event.totalSeats ?? "TBA"}</p>
    <p><strong>Seats Remaining:</strong> ${remaining ?? "TBA"}</p>
    <div>
      <p><strong>Rules:</strong></p>
      ${rules.length ? `<ul>${rules.map((r) => `<li>${r}</li>`).join("")}</ul>` : "<p>Rules will be shared soon.</p>"}
    </div>
  `;

  if (modalRegisterBtn) {
    modalRegisterBtn.disabled = isClosed;
    if (isClosed) {
      modalRegisterBtn.textContent = "Registrations Closed";
    } else if (resolvedFee > 0) {
      modalRegisterBtn.textContent = "Register & Pay";
    } else {
      modalRegisterBtn.textContent = "Register (Free)";
    }
  }
  modalStatus.textContent = isClosed ? "Registrations Closed – Seats Full" : "";

  if (!modal) return;
  modal.classList.remove("hidden");
  requestAnimationFrame(() => modal.classList.add("is-active"));
};

const closeModal = () => {
  if (!modal) return;
  modal.classList.remove("is-active");
  setTimeout(() => modal.classList.add("hidden"), 220);
};

modalOverlay?.addEventListener("click", closeModal);
modalClose?.addEventListener("click", closeModal);

const openAuthModal = (message) => {
  if (authModalMessage && message) {
    authModalMessage.textContent = message;
  }
  if (!authModal) return;
  authModal.classList.remove("hidden");
  requestAnimationFrame(() => authModal.classList.add("is-active"));
};

const closeAuthModal = () => {
  if (!authModal) return;
  authModal.classList.remove("is-active");
  setTimeout(() => authModal.classList.add("hidden"), 220);
};

authModalOverlay?.addEventListener("click", closeAuthModal);
authModalCancelBtn?.addEventListener("click", closeAuthModal);
authModalLoginBtn?.addEventListener("click", () => {
  window.location.href = "login.html";
});

modalRegisterBtn?.addEventListener("click", () => {
  if (!currentEvent) return;
  handleRegister(currentEvent);
});

if (eventsSections) {
  eventsSections.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const card = actionButton.closest(".event-card");
    if (!card) return;

    const selectedEvent = allEvents.find((item) => item._id === card.dataset.eventId);
    if (!selectedEvent) return;

    if (actionButton.dataset.action === "view") {
      openModal(selectedEvent);
      return;
    }
  });
}

// Gate registration/payment behind login on the client side
const handleRegister = async (event) => {
  const remaining = seatsRemaining(event);
  if (remaining !== null && remaining <= 0) {
    showToast("Registrations closed for this event.", "error");
    return;
  }

  const token = getToken();
  if (!token) {
    openAuthModal("Please log in to register for this event.");
    return;
  }

  showToast("Processing registration...", "info");
  const resolvedFee = resolveFee(event);
  if (resolvedFee > 0) {
    await startPayment(event);
  } else {
    await registerFree(event._id, getParticipantsCount(event));
  }
};

const getParticipantsCount = (event) => {
  if (event.participationType === "group") {
    return Number(event.minParticipants || 2);
  }
  return 1;
};

async function registerFree(eventId, participantsCount) {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ eventId, participantsCount })
    });
    const data = await response.json();
    if (response.ok) {
      showToast("Registration successful.", "success");
      await fetchEvents();
    } else {
      showToast(data.message || "Registration failed.", "error");
    }
  } catch (error) {
    showToast("Server error.", "error");
  }
}

async function startPayment(event) {
  try {
    const token = getToken();
    const participantsCount = getParticipantsCount(event);
    const response = await fetch(`${API_BASE}/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ eventId: event._id, participantsCount })
    });
    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || "Unable to create order.", "error");
      return;
    }

    if (!window.Razorpay) {
      showToast("Razorpay SDK not loaded.", "error");
      return;
    }

    const user = getUser();
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "BITFEST",
      description: event.title,
      order_id: data.order.id,
      prefill: {
        name: user.name || "",
        email: user.email || ""
      },
      modal: {
        ondismiss: function () {
          showToast("Payment failed or cancelled.", "error");
        }
      },
      handler: async function (response) {
        await verifyPayment(event._id, response, participantsCount);
      }
    };

    const razorpay = new Razorpay(options);
    razorpay.on("payment.failed", function () {
      showToast("Payment failed or cancelled.", "error");
    });
    razorpay.open();
  } catch (error) {
    showToast("Payment initialization failed.", "error");
  }
}

async function verifyPayment(eventId, paymentResponse, participantsCount) {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        eventId,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        participantsCount
      })
    });

    const data = await response.json();
    if (response.ok) {
      showToast("Payment successful. You are registered.", "success");
      await fetchEvents();
    } else {
      showToast(data.message || "Payment verification failed.", "error");
    }
  } catch (error) {
    showToast("Payment verification failed.", "error");
  }
}

async function fetchEvents() {
  try {
    const response = await fetch(`${API_BASE}/events`);
    const data = await response.json();
    allEvents = Array.isArray(data) ? data : [];
    renderSections();
  } catch (error) {
    showToast("Unable to load events.", "error");
  }
}

if (searchInput) {
  searchInput.addEventListener("input", renderSections);
}

if (filterGroup) {
  filterGroup.addEventListener("click", (event) => {
    const tab = event.target.closest(".filter-tab");
    if (!tab) return;

    activeCategory = tab.dataset.category || "Tech";
    filterGroup.querySelectorAll(".filter-tab").forEach((item) => {
      item.classList.toggle("is-active", item === tab);
    });
    renderSections();
  });
}

fetchEvents();
