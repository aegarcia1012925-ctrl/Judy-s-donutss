// Judy's Donuts — navigation, reveal effects, and demo shopping cart
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

// Sample prices are placeholders. Update these values to Judy's real menu prices.
const products = {
  "Strawberry Sprinkle": { price: 2.50, type: "donut" },
  "Vanilla Glazed": { price: 2.25, type: "donut" },
  "Chocolate Dream": { price: 2.75, type: "donut" },
  "Hot Coffee": { price: 2.50, type: "drink" },
  "Iced Coffee": { price: 3.25, type: "drink" },
  "Milk": { price: 1.75, type: "drink" }
};

const recommendations = ["Hot Coffee", "Iced Coffee", "Milk"];
const cart = new Map();
const toast = document.getElementById("toast");
const orderCount = document.getElementById("orderCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartBackdrop = document.getElementById("cartBackdrop");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItems = document.getElementById("cartItems");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartNavCount = document.getElementById("cartNavCount");
const cartFloatingBtn = document.getElementById("cartFloatingBtn");
const cartFloatingCount = document.getElementById("cartFloatingCount");
const recommendationList = document.getElementById("recommendationList");
const checkoutButton = document.getElementById("checkoutButton");
let toastTimer;

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

// Product-card buttons work as persistent add/remove toggles.
function toggleProductInCart(name) {
  if (!products[name]) return;
  if (cart.has(name)) {
    cart.delete(name);
    showToast(name + " removed from your cart.");
  } else {
    cart.set(name, 1);
    showToast(name + " added to your cart!");
  }
  renderCart();
}

// Recommendations and cart controls can still increase quantities.
function addToCart(name) {
  if (!products[name]) return;
  cart.set(name, (cart.get(name) || 0) + 1);
  renderCart();
  showToast(name + " added to your cart!");
}

function changeQuantity(name, change) {
  if (change === "remove") {
    cart.delete(name);
    renderCart();
    showToast(name + " removed from your cart.");
    return;
  }
  const next = (cart.get(name) || 0) + change;
  if (next <= 0) cart.delete(name);
  else cart.set(name, next);
  renderCart();
}

function renderCart() {
  if (!cartItems) return;
  const entries = Array.from(cart.entries());
  const totalQuantity = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const subtotal = entries.reduce((sum, [name, quantity]) => sum + products[name].price * quantity, 0);

  cartItems.replaceChildren();
  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = "Your box is waiting for something delicious.";
    cartItems.append(empty);
  } else {
    entries.forEach(([name, quantity]) => {
      const row = document.createElement("article");
      row.className = "cart-item";
      const info = document.createElement("div");
      info.className = "cart-item-info";
      const title = document.createElement("strong");
      title.textContent = name;
      const price = document.createElement("small");
      price.textContent = money(products[name].price) + " each";
      info.append(title, price);

      const controls = document.createElement("div");
      controls.className = "quantity-controls";
      const minus = document.createElement("button");
      minus.type = "button";
      minus.className = "quantity-button";
      minus.dataset.cartAction = "decrease";
      minus.dataset.product = name;
      minus.setAttribute("aria-label", "Remove one " + name);
      minus.textContent = "−";
      const amount = document.createElement("span");
      amount.textContent = String(quantity);
      amount.setAttribute("aria-label", "Quantity " + quantity);
      const plus = document.createElement("button");
      plus.type = "button";
      plus.className = "quantity-button";
      plus.dataset.cartAction = "increase";
      plus.dataset.product = name;
      plus.setAttribute("aria-label", "Add one " + name);
      plus.textContent = "+";
      controls.append(minus, amount, plus);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "cart-remove";
      remove.dataset.cartAction = "remove";
      remove.dataset.product = name;
      remove.setAttribute("aria-label", "Remove " + name + " from cart");
      remove.textContent = "Remove";
      const lineTotal = document.createElement("strong");
      lineTotal.className = "cart-line-total";
      lineTotal.textContent = money(products[name].price * quantity);
      row.append(info, controls, lineTotal, remove);
      cartItems.append(row);
    });
  }

  // Keep each menu button visually selected while its product is in the cart.
  document.querySelectorAll("[data-donut]").forEach(button => {
    const selected = cart.has(button.dataset.donut);
    button.classList.toggle("is-added", selected);
    button.innerHTML = selected
      ? '<span class="add-icon add-icon-check" aria-hidden="true">✓</span>'
      : '<span class="add-icon" aria-hidden="true">+</span>';
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("aria-label", selected
      ? "Remove " + button.dataset.donut + " from your order"
      : "Add " + button.dataset.donut + " to your order");
  });

  if (cartNavCount) cartNavCount.textContent = String(totalQuantity);
  if (cartFloatingCount) cartFloatingCount.textContent = String(totalQuantity);
  if (orderCount) {
    orderCount.hidden = totalQuantity === 0;
    orderCount.textContent = "Your box: " + totalQuantity + (totalQuantity === 1 ? " item" : " items");
  }
  if (cartSubtotal) cartSubtotal.textContent = money(subtotal);
  if (checkoutButton) checkoutButton.disabled = totalQuantity === 0;
  renderRecommendations();
}

function renderRecommendations() {
  if (!recommendationList) return;
  recommendationList.replaceChildren();
  recommendations.forEach(name => {
    const item = document.createElement("div");
    item.className = "recommendation-item";
    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = name;
    const price = document.createElement("small");
    price.textContent = money(products[name].price);
    info.append(title, price);
    const add = document.createElement("button");
    add.type = "button";
    add.className = "recommendation-add";
    add.dataset.recommendation = name;
    add.textContent = "Add +";
    add.setAttribute("aria-label", "Add " + name + " to cart");
    item.append(info, add);
    recommendationList.append(item);
  });
}

function openCart() {
  if (!cartDrawer || !cartBackdrop) return;
  cartBackdrop.hidden = false;
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  if (openCartBtn) openCartBtn.setAttribute("aria-expanded", "true");
  if (cartFloatingBtn) cartFloatingBtn.setAttribute("aria-expanded", "true");
  document.body.classList.add("cart-is-open");
  if (closeCartBtn) closeCartBtn.focus();
}

function closeCart() {
  if (!cartDrawer || !cartBackdrop) return;
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartBackdrop.hidden = true;
  if (openCartBtn) openCartBtn.setAttribute("aria-expanded", "false");
  if (cartFloatingBtn) {
    cartFloatingBtn.setAttribute("aria-expanded", "false");
    cartFloatingBtn.focus();
  }
  document.body.classList.remove("cart-is-open");
}

document.querySelectorAll("[data-donut]").forEach(button => {
  button.addEventListener("click", () => toggleProductInCart(button.dataset.donut));
});
if (openCartBtn) openCartBtn.addEventListener("click", openCart);
if (cartFloatingBtn) cartFloatingBtn.addEventListener("click", openCart);
if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
if (cartBackdrop) cartBackdrop.addEventListener("click", closeCart);
if (cartItems) {
  cartItems.addEventListener("click", event => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    const action = button.dataset.cartAction;
    changeQuantity(button.dataset.product, action === "increase" ? 1 : action === "remove" ? "remove" : -1);
  });
}
if (recommendationList) {
  recommendationList.addEventListener("click", event => {
    const button = event.target.closest("[data-recommendation]");
    if (button) addToCart(button.dataset.recommendation);
  });
}
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartDrawer && cartDrawer.classList.contains("is-open")) closeCart();
});

// Checkout is intentionally a placeholder until real ordering, pickup, and payment details are configured.
if (checkoutButton) {
  checkoutButton.addEventListener("click", () => {
    showToast("Online ordering isn't set up yet. Please contact Judy's Donuts.");
  });
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
renderCart();
