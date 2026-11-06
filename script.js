const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const cartCount = document.querySelector(".cart-count");
const cartButton = document.querySelector(".cart-button");
const cartDrawer = document.querySelector(".cart-drawer");
const cartBackdrop = document.querySelector(".cart-backdrop");
const cartClose = document.querySelector(".cart-close");
const cartItems = document.querySelector(".cart-items");
const drawerCount = document.querySelector(".drawer-count");
const cartTotal = document.querySelector(".cart-total strong");
const toast = document.querySelector(".toast");

const products = {
  "Whey Protein": 3490,
  "Creatine Monohydrate": 1890,
  BCAA: 2190,
  "Pre-Workout": 2590
};
const cart = new Map();
let toastTimeout;

function formatPrice(price) {
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₽`;
}

function getItemCount() {
  return Array.from(cart.values()).reduce((sum, quantity) => sum + quantity, 0);
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartBackdrop.classList.remove("is-visible");
  document.body.classList.remove("cart-open");
  cartButton.setAttribute("aria-expanded", "false");
  window.setTimeout(() => {
    if (!cartDrawer.classList.contains("is-open")) {
      cartDrawer.hidden = true;
      cartBackdrop.hidden = true;
      cartButton.focus();
    }
  }, 300);
}

function openCart() {
  closeMenu();
  cartDrawer.hidden = false;
  cartBackdrop.hidden = false;
  window.requestAnimationFrame(() => {
    cartDrawer.classList.add("is-open");
    cartBackdrop.classList.add("is-visible");
  });
  document.body.classList.add("cart-open");
  cartButton.setAttribute("aria-expanded", "true");
  cartClose.focus();
}

function renderCart() {
  const count = getItemCount();
  const total = Array.from(cart.entries()).reduce(
    (sum, [name, quantity]) => sum + products[name] * quantity,
    0
  );
  cartCount.textContent = String(count);
  drawerCount.textContent = `(${count})`;
  cartTotal.textContent = formatPrice(total);
  cartButton.setAttribute("aria-label", `Корзина, товаров: ${count}`);
  cartItems.replaceChildren();

  if (cart.size === 0) {
    const empty = document.createElement("div");
    empty.className = "cart-empty";
    const title = document.createElement("strong");
    title.textContent = "Пока здесь пусто";
    const hint = document.createElement("span");
    hint.textContent = "Добавь товары из каталога — они появятся здесь.";
    empty.append(title, hint);
    cartItems.append(empty);
    return;
  }

  for (const [name, quantity] of cart) {
    const item = document.createElement("article");
    item.className = "cart-item";
    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = name;
    const price = document.createElement("span");
    price.className = "cart-item-price";
    price.textContent = formatPrice(products[name] * quantity);
    const controls = document.createElement("div");
    controls.className = "cart-item-controls";

    const decrease = document.createElement("button");
    decrease.className = "quantity-button";
    decrease.type = "button";
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", `Уменьшить количество ${name}`);
    decrease.addEventListener("click", () => updateQuantity(name, -1));

    const countLabel = document.createElement("span");
    countLabel.className = "cart-item-quantity";
    countLabel.textContent = String(quantity);

    const increase = document.createElement("button");
    increase.className = "quantity-button";
    increase.type = "button";
    increase.textContent = "+";
    increase.setAttribute("aria-label", `Увеличить количество ${name}`);
    increase.addEventListener("click", () => updateQuantity(name, 1));

    controls.append(decrease, countLabel, increase);
    details.append(title, price, controls);

    const remove = document.createElement("button");
    remove.className = "remove-item";
    remove.type = "button";
    remove.textContent = "Удалить";
    remove.setAttribute("aria-label", `Удалить ${name} из корзины`);
    remove.addEventListener("click", () => {
      cart.delete(name);
      renderCart();
    });

    item.append(details, remove);
    cartItems.append(item);
  }
}

function updateQuantity(name, change) {
  const quantity = (cart.get(name) || 0) + change;
  if (quantity <= 0) {
    cart.delete(name);
  } else {
    cart.set(name, quantity);
  }
  renderCart();
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Открыть меню");
  mainNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Открыть меню" : "Закрыть меню");
  mainNav.classList.toggle("is-open", !isExpanded);
  document.body.classList.toggle("menu-open", !isExpanded);
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

cartButton.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cartDrawer.hidden) closeCart();
});

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.dataset.product;
    updateQuantity(product, 1);
    toast.textContent = `${button.dataset.product} добавлен в корзину`;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  });
});

renderCart();