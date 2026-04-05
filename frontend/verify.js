const API_BASE = "http://localhost:5000/api";
const statusMessage = document.getElementById("statusMessage");

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

async function verifyEmail() {
  if (!token) {
    statusMessage.textContent = "Verification token missing.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/verify/${token}`);
    const data = await response.json();

    if (response.ok) {
      statusMessage.textContent = "Email verified successfully. You can login now.";
    } else {
      statusMessage.textContent = data.message || "Verification failed.";
    }
  } catch (error) {
    statusMessage.textContent = "Verification failed. Try again later.";
  }
}

verifyEmail();
