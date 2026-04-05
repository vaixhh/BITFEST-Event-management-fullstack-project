const API_BASE = "http://localhost:5000/api";

const form = document.getElementById("loginForm");

const showToast = (message, type = "info") => {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    alert(message);
  }
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const loginData = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const redirectUrl = data.user.role === "admin" ? "admin.html" : "dashboard.html";
      showToast("Login successful.", "success");
      window.location.href = redirectUrl;
    } else {
      showToast(data.message || "Login failed.", "error");
    }
  } catch (error) {
    showToast("Server error.", "error");
  }
});
