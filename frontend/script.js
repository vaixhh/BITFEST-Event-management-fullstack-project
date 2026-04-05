const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const preloader = document.getElementById("preloader");

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    header.classList.toggle("open");
  });
}

window.addEventListener("scroll", () => {
  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }
});

if (preloader) {
  window.addEventListener("load", () => {
    preloader.style.display = "none";
  });
}

const anchors = document.querySelectorAll('a[href^="#"]');
anchors.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

const revealItems = document.querySelectorAll(".reveal");
if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

// Toast notifications
const getToastRoot = () => {
  let toastRoot = document.getElementById("toast-root");
  if (!toastRoot) {
    toastRoot = document.createElement("div");
    toastRoot.id = "toast-root";
    document.body.appendChild(toastRoot);
  }
  return toastRoot;
};

window.showToast = (message, type = "info") => {
  const toastRoot = getToastRoot();
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastRoot.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
