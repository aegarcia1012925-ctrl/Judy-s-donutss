// Judy's Donuts — interactive details
const mobileToggle = document.getElementById("mobileToggle");
const navLinks = document.getElementById("navLinks");

if (mobileToggle && navLinks) {
  mobileToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    mobileToggle.setAttribute("aria-expanded", String(isOpen));
    mobileToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      mobileToggle.setAttribute("aria-expanded", "false");
      mobileToggle.setAttribute("aria-label", "Open navigation");
    });
  });

  document.addEventListener("click", event => {
    if (!navLinks.contains(event.target) && !mobileToggle.contains(event.target)) {
      navLinks.classList.remove("open");
      mobileToggle.setAttribute("aria-expanded", "false");
      mobileToggle.setAttribute("aria-label", "Open navigation");
    }
  });
}

// Reveal elements as they enter the viewport.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("visible"));
}

// Small demo order interaction. This does not place or transmit a real order.
let orderItems = [];
let toastTimer;
const toast = document.getElementById("toast");
const orderCount = document.getElementById("orderCount");

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3000);
}

function addToOrder(itemName) {
  orderItems.push(itemName);
  if (orderCount) {
    orderCount.hidden = false;
    orderCount.textContent = `Your box: ${orderItems.length} ${orderItems.length === 1 ? "donut" : "donuts"}`;
  }
  showToast(`Added "${itemName}" to your order box!`);
}

document.querySelectorAll("[data-donut]").forEach(button => {
  button.addEventListener("click", () => addToOrder(button.dataset.donut));
});

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// The contact link uses the visitor's email app; no form data is collected here.
