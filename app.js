// JahCloud - Main JavaScript

// ============ DATA ============
// Load products from localStorage (synced with admin) or use defaults
const defaultProducts = [
  { id: 1, name: 'Purple Haze HHC', price: 450, oldPrice: 550, category: 'disposable', flavor: 'fruity', strength: 'medium', image: 'assets/product1.png', badge: 'Хіт', rating: 4.9, reviews: 234, puffs: 3000, description: 'Насичений фруктовий смак з нотками лісових ягід. Ідеальний баланс міцності.', active: true },
  { id: 2, name: 'Mango Kush HHC', price: 420, category: 'disposable', flavor: 'fruity', strength: 'light', image: 'assets/product2.png', rating: 4.8, reviews: 189, puffs: 3000, description: 'Тропічний манго з м\'яким фінішем. Легкий та освіжаючий.', active: true },
  { id: 3, name: 'Ice Mint HHC', price: 400, category: 'disposable', flavor: 'menthol', strength: 'strong', image: 'assets/product3.png', badge: 'Новинка', rating: 4.7, reviews: 156, puffs: 2500, description: 'Крижаний ментол для справжніх цінителів свіжості.', active: true },
  { id: 4, name: 'Blueberry Dream', price: 480, oldPrice: 580, category: 'disposable', flavor: 'fruity', strength: 'medium', image: 'assets/product4.png', badge: '-17%', rating: 4.9, reviews: 312, puffs: 4000, description: 'Соковита чорниця з кремовим післясмаком.', active: true },
  { id: 5, name: 'Strawberry Fields', price: 430, category: 'disposable', flavor: 'fruity', strength: 'light', image: 'assets/product5.png', rating: 4.6, reviews: 98, puffs: 3000, description: 'Стигла полуниця в кожній затяжці.', active: true },
  { id: 6, name: 'Watermelon Ice', price: 440, category: 'disposable', flavor: 'fruity', strength: 'medium', image: 'assets/product7.png', badge: 'Хіт', rating: 4.8, reviews: 245, puffs: 3500, description: 'Кавун з льодяним холодком.', active: true }
];

let products = JSON.parse(localStorage.getItem('siteProducts')) || JSON.parse(localStorage.getItem('adminProducts')) || defaultProducts;
// Filter only active products
products = products.filter(p => p.active !== false);

const testimonials = [
  { name: 'Андрій', avatar: '🧔', rating: 5, text: 'Топова якість! Замовляю вже третій раз. Доставка швидка, упаковка анонімна. Рекомендую!', date: '2 дні тому' },
  { name: 'Марина', avatar: '👩', rating: 5, text: 'Дуже задоволена Purple Haze - смак неймовірний! Дякую за бонуси 🎁', date: '5 днів тому' },
  { name: 'Денис', avatar: '👨', rating: 4, text: 'Швидка доставка, приємне обслуговування. Буду замовляти ще.', date: 'тиждень тому' },
  { name: 'Олена', avatar: '👱‍♀️', rating: 5, text: 'Нарешті знайшла якісний магазин! Оплата через Telegram Stars - супер зручно!', date: '2 тижні тому' }
];

const blogPosts = [
  { id: 1, title: 'Що таке HHC і чим він відрізняється від THC?', excerpt: 'Детальний розбір властивостей гексагідроканабінолу та його легального статусу в Україні.', image: 'assets/blog1.png', date: '10 січня 2026' },
  { id: 2, title: 'Топ-5 смаків HHC одноразок 2026 року', excerpt: 'Огляд найпопулярніших смаків серед наших покупців.', image: 'assets/blog2.png', date: '8 січня 2026' },
  { id: 3, title: 'Як обрати свою першу HHC одноразку?', excerpt: 'Гід для новачків: на що звертати увагу при виборі.', image: 'assets/blog3.png', date: '5 січня 2026' }
];

// Load promo codes from localStorage (synced with admin) or use defaults
const defaultPromoCodes = {
  'JAHCLOUD10': { discount: 10, type: 'percent', active: true },
  'WELCOME': { discount: 50, type: 'fixed', active: true },
  'VIBE20': { discount: 20, type: 'percent', active: true }
};
const promoCodes = JSON.parse(localStorage.getItem('sitePromos')) || JSON.parse(localStorage.getItem('adminPromos')) || defaultPromoCodes;

// ============ STATE ============
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let bonuses = parseInt(localStorage.getItem('bonuses')) || 0;
let appliedPromo = null;
let currentPage = 'home';
let currentProduct = null;

// ============ DOM ELEMENTS ============
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initTheme();
  initNavigation();
  initCart();
  initSearch();
  initFAQ();
  initChat();
  initAccountTabs();
  renderPopularProducts();
  renderTestimonials();
  renderBlogPosts();
  renderCatalog();
  updateCartUI();
});

// ============ PRELOADER ============
function initPreloader() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      $('#preloader').classList.add('hidden');
    }, 500);
  });
}

// ============ THEME ============
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  $('#themeToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// ============ NAVIGATION ============
function initNavigation() {
  // Mobile menu
  $('#menuToggle').addEventListener('click', () => {
    $('#nav').classList.toggle('active');
    $('#menuToggle').classList.toggle('active');
  });

  // SPA Navigation
  document.addEventListener('click', (e) => {
    const navLink = e.target.closest('[data-nav]');
    if (navLink) {
      e.preventDefault();
      const page = navLink.dataset.nav;
      navigateTo(page);
      $('#nav').classList.remove('active');
      $('#menuToggle').classList.remove('active');
      closeSidebars();
    }
  });

  // Handle hash on load
  const hash = window.location.hash.slice(1);
  if (hash) navigateTo(hash);
}

function navigateTo(page, productId = null) {
  $$('.page').forEach(p => p.classList.remove('active'));
  $$('.nav-link').forEach(l => l.classList.remove('active'));

  const pageEl = $(`#${page}`);
  if (pageEl) {
    pageEl.classList.add('active');
    $(`.nav-link[data-nav="${page}"]`)?.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    currentPage = page;

    if (page === 'product' && productId) {
      renderProductPage(productId);
    } else if (page === 'cart') {
      renderCartPage();
    } else if (page === 'checkout') {
      renderCheckoutPage();
    }
  }
}

function closeSidebars() {
  $('#cartSidebar').classList.remove('active');
  $('#searchModal').classList.remove('active');
}

// ============ CART ============
function initCart() {
  $('#cartBtn').addEventListener('click', () => {
    $('#cartSidebar').classList.add('active');
    renderCartSidebar();
  });

  $('#cartClose').addEventListener('click', () => {
    $('#cartSidebar').classList.remove('active');
  });

  $('.sidebar-overlay').addEventListener('click', () => {
    $('#cartSidebar').classList.remove('active');
  });

  $('#goToCart').addEventListener('click', () => {
    $('#cartSidebar').classList.remove('active');
  });

  // Promo code
  $('#applyPromo')?.addEventListener('click', applyPromoCode);
}

function addToCart(productId, quantity = 1) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  saveCart();
  updateCartUI();
  showToast(`${product.name} додано в кошик`, 'success');
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
  renderCartPage();
  renderCartSidebar();
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      updateCartUI();
      renderCartPage();
      renderCartSidebar();
    }
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  $('#cartCount').textContent = count;
  $('#cartCount').style.display = count > 0 ? 'flex' : 'none';
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getDiscount() {
  if (!appliedPromo) return 0;
  const total = getCartTotal();
  if (appliedPromo.type === 'percent') {
    return Math.round(total * appliedPromo.discount / 100);
  }
  return appliedPromo.discount;
}

function applyPromoCode() {
  const code = $('#promoInput').value.trim().toUpperCase();
  if (promoCodes[code]) {
    appliedPromo = promoCodes[code];
    showToast(`Промокод застосовано! Знижка ${appliedPromo.discount}${appliedPromo.type === 'percent' ? '%' : '₴'}`, 'success');
    renderCartPage();
  } else {
    showToast('Невірний промокод', 'error');
  }
}

function renderCartSidebar() {
  const container = $('#cartSidebarItems');

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-text">Кошик порожній</p>';
    $('#cartSidebarTotal').textContent = '0 ₴';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item" style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-color);">
      <div style="width:60px;height:60px;background:var(--bg-secondary);border-radius:8px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:24px;">🌿</span>
      </div>
      <div style="flex:1;">
        <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${item.name}</div>
        <div style="font-size:13px;color:var(--text-secondary);">${item.quantity} × ${item.price} ₴</div>
      </div>
      <button onclick="removeFromCart(${item.id})" style="color:var(--rasta-red);padding:8px;">✕</button>
    </div>
  `).join('');

  $('#cartSidebarTotal').textContent = `${getCartTotal()} ₴`;
}

function renderCartPage() {
  const itemsContainer = $('#cartItems');
  const emptyContainer = $('#cartEmpty');
  const summaryContainer = $('#cartSummary');

  if (cart.length === 0) {
    itemsContainer.style.display = 'none';
    summaryContainer.style.display = 'none';
    emptyContainer.style.display = 'block';
    return;
  }

  itemsContainer.style.display = 'flex';
  summaryContainer.style.display = 'block';
  emptyContainer.style.display = 'none';

  itemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;">🌿</div>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-meta">${item.puffs ? item.puffs + ' затяжок' : ''}</div>
      </div>
      <div class="cart-item-actions">
        <div class="quantity-control">
          <button onclick="updateQuantity(${item.id}, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>
        <div class="cart-item-price">${item.price * item.quantity} ₴</div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">🗑</button>
      </div>
    </div>
  `).join('');

  const subtotal = getCartTotal();
  const discount = getDiscount();
  const total = subtotal - discount;
  const bonusEarned = Math.floor(total * 0.05);

  $('#cartItemsCount').textContent = cart.reduce((s, i) => s + i.quantity, 0);
  $('#cartSubtotal').textContent = `${subtotal} ₴`;
  $('#cartDiscount').textContent = `-${discount} ₴`;
  $('#cartTotal').textContent = `${total} ₴`;
  $('#bonusEarned').textContent = bonusEarned;
}

function renderCheckoutPage() {
  const container = $('#checkoutItems');

  container.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <div class="checkout-item-image">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">🌿</div>
      </div>
      <div class="checkout-item-info">
        <div class="checkout-item-title">${item.name}</div>
        <div class="checkout-item-qty">${item.quantity} шт.</div>
      </div>
    </div>
  `).join('');

  const subtotal = getCartTotal();
  const discount = getDiscount();
  const total = subtotal - discount;
  const stars = Math.ceil(total / 2); // Approximate conversion

  $('#checkoutSubtotal').textContent = `${subtotal} ₴`;
  $('#checkoutDiscount').textContent = `-${discount} ₴`;
  $('#checkoutTotal').textContent = `${total} ₴`;
  $('#starsAmount').textContent = stars;
}

// ============ PRODUCTS ============
function renderPopularProducts() {
  const container = $('#popularProducts');
  const popular = products.filter(p => p.badge === 'Хіт' || p.rating >= 4.8).slice(0, 4);
  container.innerHTML = popular.map(renderProductCard).join('');
}

function renderCatalog() {
  const container = $('#productsGrid');
  container.innerHTML = products.map(renderProductCard).join('');
}

function renderProductCard(product) {
  return `
    <div class="product-card" onclick="openProduct(${product.id})">
      <div class="product-image">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <img src="${product.image || 'assets/product1.png'}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.outerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px;\\'>🌿</div>'">
        <button class="product-wishlist">♡</button>
      </div>
      <div class="product-info">
        <div class="product-title">${product.name}</div>
        <div class="product-meta">
          ${product.puffs ? `<span>${product.puffs} затяжок</span>` : ''}
          <span>⭐ ${product.rating}</span>
        </div>
        <div class="product-footer">
          <div class="product-price">
            ${product.price} ₴
            ${product.oldPrice ? `<span class="old">${product.oldPrice} ₴</span>` : ''}
          </div>
          <button class="product-add" onclick="event.stopPropagation(); addToCart(${product.id})">+</button>
        </div>
      </div>
    </div>
  `;
}

function openProduct(productId) {
  navigateTo('product', productId);
}

function renderProductPage(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  currentProduct = product;
  $('#productBreadcrumbName').textContent = product.name;

  const container = $('#productContent');
  container.innerHTML = `
    <div class="product-gallery">
      <div class="product-main-image">
        <img src="${product.image || 'assets/product1.png'}" alt="${product.name}" style="width:100%;height:100%;object-fit:contain;" onerror="this.outerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:120px;\\'>🌿</div>'">
      </div>
    </div>
    <div class="product-details">
      <h1>${product.name}</h1>
      <div class="product-rating">
        <span class="rating-stars">${'⭐'.repeat(Math.floor(product.rating))}</span>
        <span class="rating-count">${product.rating} (${product.reviews} відгуків)</span>
      </div>
      <div class="product-price-block">
        <span class="product-current-price">${product.price} ₴</span>
        ${product.oldPrice ? `<span class="product-old-price">${product.oldPrice} ₴</span>` : ''}
      </div>
      <p class="product-description">${product.description}</p>
      <div class="product-specs">
        ${product.puffs ? `<div class="spec-row"><span class="spec-label">Кількість затяжок</span><span>${product.puffs}</span></div>` : ''}
        ${product.strength ? `<div class="spec-row"><span class="spec-label">Міцність</span><span>${product.strength === 'light' ? 'Легка' : product.strength === 'medium' ? 'Середня' : 'Міцна'}</span></div>` : ''}
        ${product.flavor ? `<div class="spec-row"><span class="spec-label">Смак</span><span>${getFlavorName(product.flavor)}</span></div>` : ''}
      </div>
      <div class="product-actions">
        <button class="btn btn-primary btn-lg" onclick="addToCart(${product.id})">
          <span>Додати в кошик</span>
        </button>
        <button class="btn btn-outline btn-lg">♡ В обране</button>
      </div>
    </div>
  `;

  renderRelatedProducts(product);
}

function getFlavorName(flavor) {
  const names = { fruity: '🍓 Фруктовий', menthol: '❄️ Ментоловий', dessert: '🍰 Десертний', tobacco: '🍂 Тютюновий' };
  return names[flavor] || flavor;
}

function renderRelatedProducts(product) {
  const container = $('#relatedProducts');
  const related = products.filter(p => p.id !== product.id && p.flavor === product.flavor).slice(0, 4);
  container.innerHTML = related.map(renderProductCard).join('');
}

// ============ TESTIMONIALS ============
function renderTestimonials() {
  const container = $('#testimonials');
  container.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-header">
        <div class="testimonial-avatar">${t.avatar}</div>
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-date">${t.date}</div>
        </div>
      </div>
      <div class="testimonial-rating">${'⭐'.repeat(t.rating)}</div>
      <p class="testimonial-text">${t.text}</p>
    </div>
  `).join('');
}

// ============ BLOG ============
function renderBlogPosts() {
  const container = $('#blogGrid');
  container.innerHTML = blogPosts.map(post => `
    <div class="blog-card">
      <div class="blog-image">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:48px;">📝</div>
      </div>
      <div class="blog-content">
        <div class="blog-date">${post.date}</div>
        <h3 class="blog-title">${post.title}</h3>
        <p class="blog-excerpt">${post.excerpt}</p>
      </div>
    </div>
  `).join('');
}

// ============ SEARCH ============
function initSearch() {
  $('#searchBtn').addEventListener('click', () => {
    $('#searchModal').classList.add('active');
    $('#searchInput').focus();
  });

  $('#searchClose').addEventListener('click', () => {
    $('#searchModal').classList.remove('active');
  });

  $('.modal-overlay').addEventListener('click', () => {
    $('#searchModal').classList.remove('active');
  });

  $('#searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) {
      $('#searchResults').innerHTML = '<p class="search-hint">Почніть вводити назву товару...</p>';
      return;
    }

    const results = products.filter(p => p.name.toLowerCase().includes(query));

    if (results.length === 0) {
      $('#searchResults').innerHTML = '<p class="search-hint">Нічого не знайдено</p>';
      return;
    }

    $('#searchResults').innerHTML = results.map(p => `
      <div class="search-result" onclick="$('#searchModal').classList.remove('active'); openProduct(${p.id})" style="display:flex;gap:12px;padding:12px;cursor:pointer;border-radius:8px;transition:background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
        <div style="width:50px;height:50px;background:var(--bg-secondary);border-radius:8px;display:flex;align-items:center;justify-content:center;">🌿</div>
        <div>
          <div style="font-weight:600;">${p.name}</div>
          <div style="color:var(--accent);">${p.price} ₴</div>
        </div>
      </div>
    `).join('');
  });
}

// ============ FAQ ============
function initFAQ() {
  document.addEventListener('click', (e) => {
    const question = e.target.closest('.faq-question');
    if (question) {
      const item = question.closest('.faq-item');
      item.classList.toggle('active');
    }
  });
}

// ============ CHAT ============
function initChat() {
  $('#chatToggle').addEventListener('click', () => {
    $('#chatPopup').classList.toggle('active');
    $('.chat-badge').style.display = 'none';
  });

  $('#chatPopupClose').addEventListener('click', () => {
    $('#chatPopup').classList.remove('active');
  });
}

// ============ ACCOUNT TABS ============
function initAccountTabs() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.account-link');
    if (link) {
      e.preventDefault();
      const tab = link.dataset.tab;

      $$('.account-link').forEach(l => l.classList.remove('active'));
      $$('.account-tab').forEach(t => t.classList.remove('active'));

      link.classList.add('active');
      $(`#tab-${tab}`).classList.add('active');
    }
  });

  // Update bonus display
  $('#bonusBalance').textContent = bonuses;
  $('#bonusTotal').textContent = bonuses;
}

// ============ CHECKOUT FORM ============
document.addEventListener('submit', (e) => {
  if (e.target.id === 'checkoutForm') {
    e.preventDefault();

    const total = getCartTotal() - getDiscount();
    const stars = Math.ceil(total / 2);

    // Simulate Telegram Stars payment
    showToast(`Перенаправлення на оплату ${stars} ⭐ Stars...`, 'success');

    setTimeout(() => {
      // Add bonuses
      const earnedBonuses = Math.floor(total * 0.05);
      bonuses += earnedBonuses;
      localStorage.setItem('bonuses', bonuses);

      // Clear cart
      cart = [];
      appliedPromo = null;
      saveCart();
      updateCartUI();

      showToast(`Замовлення оформлено! +${earnedBonuses} бонусів`, 'success');
      navigateTo('home');
    }, 2000);
  }
});

// ============ FILTERS ============
$('#filtersToggle')?.addEventListener('click', () => {
  $('#filtersSidebar').classList.toggle('active');
});

$('#filtersReset')?.addEventListener('click', () => {
  $$('.filter-checkbox input').forEach(cb => cb.checked = false);
  renderCatalog();
});

$('#applyFilters')?.addEventListener('click', () => {
  const categories = [...$$('[name="category"]:checked')].map(cb => cb.value);
  const flavors = [...$$('[name="flavor"]:checked')].map(cb => cb.value);
  const strengths = [...$$('[name="strength"]:checked')].map(cb => cb.value);

  let filtered = products;

  if (categories.length) {
    filtered = filtered.filter(p => categories.includes(p.category));
  }
  if (flavors.length) {
    filtered = filtered.filter(p => flavors.includes(p.flavor));
  }
  if (strengths.length) {
    filtered = filtered.filter(p => strengths.includes(p.strength));
  }

  $('#productsGrid').innerHTML = filtered.map(renderProductCard).join('');
  $('#filtersSidebar').classList.remove('active');
});

$('#catalogSearch')?.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(query));
  $('#productsGrid').innerHTML = filtered.map(renderProductCard).join('');
});

$('#catalogSort')?.addEventListener('change', (e) => {
  let sorted = [...products];
  switch (e.target.value) {
    case 'price-asc': sorted.sort((a, b) => a.price - b.price); break;
    case 'price-desc': sorted.sort((a, b) => b.price - a.price); break;
    case 'new': sorted.reverse(); break;
    default: sorted.sort((a, b) => b.rating - a.rating);
  }
  $('#productsGrid').innerHTML = sorted.map(renderProductCard).join('');
});

// ============ TOAST NOTIFICATIONS ============
function showToast(message, type = 'success') {
  const container = $('#toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : '!'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============ GLOBAL FUNCTIONS ============
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.openProduct = openProduct;
