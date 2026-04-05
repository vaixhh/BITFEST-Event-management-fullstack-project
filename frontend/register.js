const API_BASE = "http://localhost:5000/api";

const registerForm = document.getElementById("registerForm");
const otpSection = document.getElementById("otpSection");
const otpForm = document.getElementById("otpForm");
const otpInput = document.getElementById("otpInput");
const otpMessage = document.getElementById("otpMessage");
const otpTimer = document.getElementById("otpTimer");
const resendOtpBtn = document.getElementById("resendOtpBtn");

let registeredEmail = "";
let timerInterval = null;

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const showToast = (message, type = "info") => {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    alert(message);
  }
};

const formatTime = (seconds) => {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
};

const startOtpTimer = (seconds = 300) => {
  if (!otpTimer) return;

  let timeLeft = seconds;
  otpTimer.textContent = `OTP expires in ${formatTime(timeLeft)}`;

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    timeLeft -= 1;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      otpTimer.textContent = "OTP expired. Please resend OTP.";
      return;
    }
    otpTimer.textContent = `OTP expires in ${formatTime(timeLeft)}`;
  }, 1000);
};

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const collegeId = document.getElementById("collegeId").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!name || !email || !collegeId || !password || !confirmPassword) {
    showToast("Please fill all fields.", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showToast("Passwords do not match.", "error");
    return;
  }

  const userData = { name, email, collegeId, password };

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (response.ok) {
      registeredEmail = email;
      registerForm.classList.add("hidden");
      otpSection.classList.remove("hidden");
      otpMessage.textContent = "OTP sent to your email.";
      showToast("OTP sent to your email.", "success");
      startOtpTimer(300);
    } else {
      showToast(data.message || "Registration failed.", "error");
    }
  } catch (error) {
    showToast("Server error.", "error");
  }
});

otpForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const otp = otpInput.value.trim();
  if (!otp) {
    otpMessage.textContent = "Please enter the OTP.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: registeredEmail, otp })
    });

    const data = await response.json();

    if (response.ok) {
      otpMessage.textContent = "Email verified successfully. Redirecting to login...";
      showToast("Email verified successfully.", "success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    } else {
      otpMessage.textContent = data.message || "OTP verification failed.";
      showToast(data.message || "OTP verification failed.", "error");
    }
  } catch (error) {
    otpMessage.textContent = "Server error.";
    showToast("Server error.", "error");
  }
});

if (resendOtpBtn) {
  resendOtpBtn.addEventListener("click", async () => {
    if (!registeredEmail) {
      showToast("Please register first.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: registeredEmail })
      });

      const data = await response.json();

      if (response.ok) {
        showToast("OTP resent to your email.", "success");
        otpMessage.textContent = "OTP resent. Please check your email.";
        startOtpTimer(300);
      } else {
        showToast(data.message || "Unable to resend OTP.", "error");
      }
    } catch (error) {
      showToast("Server error.", "error");
    }
  });
}
