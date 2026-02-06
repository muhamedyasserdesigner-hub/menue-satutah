// ====== Data (تقدر تغيّره براحتك) ======
const MENU = [
  { id: 1, name: "ساندوتش طعمية", desc: "طعمية مقرمشة + سلطة + طحينة.", price: 18, cat: "ساندوتشات", badge: "الأكثر طلبًا" },
  { id: 2, name: "ساندوتش فول", desc: "فول بالطعم الأصيل + إضافات.", price: 16, cat: "ساندوتشات", badge: "جديد" },
  { id: 3, name: "طبق فول", desc: "طبق فول سخن مع زيت وليمون.", price: 22, cat: "أطباق", badge: "" },
  { id: 4, name: "طبق طعمية", desc: "طعمية + سلطة + طحينة.", price: 24, cat: "أطباق", badge: "" },
  { id: 5, name: "بطاطس", desc: "مقرمشة ومتبلة.", price: 12, cat: "إضافات", badge: "" },
  { id: 6, name: "طحينة", desc: "إضافة جانبية.", price: 6, cat: "إضافات", badge: "" },
  { id: 7, name: "شاي كرك", desc: "مناسب مع الفطار.", price: 10, cat: "مشروبات", badge: "" },
  { id: 8, name: "عصير", desc: "اختيار اليوم.", price: 14, cat: "مشروبات", badge: "" },
];

const THEMES = [
  { key: "classic", label: "Classic" },
  { key: "dark", label: "Dark" },
  { key: "minimal", label: "Minimal" },
];

// ====== State ======
let activeCat = "الكل";
let searchText = "";
let cart = {}; // {id: qty}
let themeIndex = 0;

// ====== Helpers ======
const fmt = (n) => `${n.toFixed(2)}`;
const byId = (id) => document.getElementById(id);

function getCats() {
  const set = new Set(MENU.map(x => x.cat));
  return ["الكل", ...Array.from(set)];
}

function filteredMenu() {
  return MENU.filter(item => {
    const catOk = (activeCat === "الكل") ? true : item.cat === activeCat;
    const searchOk = item.name.includes(searchText) || item.desc.includes(searchText);
    return catOk && searchOk;
  });
}

function cartQty() {
  return Object.values(cart).reduce((a,b)=>a+b,0);
}

function cartTotal() {
  let total = 0;
  for (const [idStr, qty] of Object.entries(cart)) {
    const id = Number(idStr);
    const item = MENU.find(x => x.id === id);
    if (item) total += item.price * qty;
  }
  return total;
}

// ====== Render Categories ======
function renderCats() {
  const catsWrap = byId("cats");
  catsWrap.innerHTML = "";
  getCats().forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "chip" + (cat === activeCat ? " active" : "");
    btn.type = "button";
    btn.textContent = cat;
    btn.onclick = () => {
      activeCat = cat;
      renderAll();
    };
    catsWrap.appendChild(btn);
  });
}

// ====== Render Menu Cards ======
function renderCards() {
  const list = filteredMenu();
  const cards = byId("cards");
  cards.innerHTML = "";

  byId("countMeta").textContent = `${list.length} صنف`;
  byId("sectionTitle").textContent = activeCat === "الكل" ? "الأصناف" : activeCat;

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    const thumb = document.createElement("div");
    thumb.className = "thumb";

    const img = document.createElement("img");
    img.className = "thumb-img";
    img.alt = item.name;
    img.loading = "lazy";
    img.src = encodeURI(`./img/${item.name}.png`);
    img.onerror = () => { img.style.display = "none"; };

    thumb.appendChild(img);
    card.appendChild(thumb);

    const info = document.createElement("div");
    info.style.flex = "1";

    const h = document.createElement("h3");
    h.textContent = item.name;
    info.appendChild(h);

    const p = document.createElement("p");
    p.textContent = item.desc;
    info.appendChild(p);

    const row = document.createElement("div");
    row.className = "row";

    const price = document.createElement("div");
    price.className = "price";
    price.textContent = `${item.price} ر.س`;
    row.appendChild(price);

    const add = document.createElement("button");
    add.className = "btn btn-primary";
    add.type = "button";
    add.textContent = "أضف +";
    add.onclick = () => addToCart(item.id);
    row.appendChild(add);

    info.appendChild(row);

    // badge (اختياري)
    if (item.badge) {
      const b = document.createElement("div");
      b.style.marginTop = "8px";
      b.style.display = "inline-block";
      b.style.padding = "6px 10px";
      b.style.borderRadius = "999px";
      b.style.border = "1px solid var(--border)";
      b.style.color = "var(--primary)";
      b.style.background = "color-mix(in srgb, var(--primary) 10%, var(--panel))";
      b.style.fontSize = "12px";
      b.textContent = item.badge;
      info.appendChild(b);
    }

    card.appendChild(info);
    cards.appendChild(card);
  });
}

// ====== Cart ======
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  bumpCart();
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

function renderCart() {
  const wrap = byId("cartItems");
  const qty = cartQty();
  const total = cartTotal();

  byId("cartCount").textContent = `${qty} عناصر`;
  byId("totalPrice").textContent = fmt(total);
  byId("stickyQty").textContent = qty;
  byId("stickyTotal").textContent = fmt(total);

  if (qty === 0) {
    wrap.classList.add("empty");
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧺</div>
        <p>السلة فاضية… اختار صنف واضغط “أضف”.</p>
      </div>
    `;
    return;
  }

  wrap.classList.remove("empty");
  wrap.innerHTML = "";

  for (const [idStr, q] of Object.entries(cart)) {
    const id = Number(idStr);
    const item = MENU.find(x => x.id === id);
    if (!item) continue;

    const row = document.createElement("div");
    row.className = "cart-item";

    const left = document.createElement("div");
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = item.name;

    const sub = document.createElement("div");
    sub.className = "sub";
    sub.textContent = `${item.price} ر.س × ${q} = ${item.price * q} ر.س`;

    left.appendChild(name);
    left.appendChild(sub);

    const right = document.createElement("div");
    right.className = "qty";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.onclick = () => changeQty(id, -1);

    const num = document.createElement("strong");
    num.textContent = q;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.onclick = () => changeQty(id, +1);

    right.appendChild(minus);
    right.appendChild(num);
    right.appendChild(plus);

    row.appendChild(left);
    row.appendChild(right);
    wrap.appendChild(row);
  }
}

function bumpCart() {
  const cartPanel = document.querySelector(".cart");
  const sticky = document.querySelector(".sticky-cart");
  [cartPanel, sticky].forEach(el => {
    if (!el) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  });
}

// ====== Theme switch ======
function applyTheme() {
  const t = THEMES[themeIndex];
  // classic = default (no attr). others set attribute
  if (t.key === "classic") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", t.key);
  }
  byId("themeBtn").textContent = `الثيم: ${t.label}`;
}

function nextTheme() {
  themeIndex = (themeIndex + 1) % THEMES.length;
  applyTheme();
}

// ====== Render all ======
function renderAll() {
  renderCats();
  renderCards();
  renderCart();
}

// ====== Wire up ======
byId("searchInput").addEventListener("input", (e) => {
  searchText = e.target.value.trim();
  renderCards();
});

byId("clearBtn").addEventListener("click", () => {
  searchText = "";
  byId("searchInput").value = "";
  renderCards();
});

byId("resetCart").addEventListener("click", () => {
  cart = {};
  renderCart();
});

byId("themeBtn").addEventListener("click", () => {
  nextTheme();
});

// Footer reveal + back to top
const footer = byId("microFooter");
const toTopBtn = byId("toTopBtn");

if (footer) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) footer.classList.add("reveal");
    });
  }, { threshold: 0.2 });

  io.observe(footer);
}

if (toTopBtn) {
  toTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// init
applyTheme();
renderAll();
