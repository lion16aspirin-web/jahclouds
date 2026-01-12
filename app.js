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

// ============ USER AUTHENTICATION ============
let currentUser = null; // Start with null, will be set by Firebase auth state

function initAuth() {
  // Check age verification
  if (!localStorage.getItem('ageVerified')) {
    $('#ageModal')?.classList.remove('hidden');
  } else {
    $('#ageModal')?.classList.add('hidden');
  }

  // Age confirm button
  $('#ageConfirm')?.addEventListener('click', () => {
    localStorage.setItem('ageVerified', 'true');
    $('#ageModal')?.classList.add('hidden');
  });

  // User button click
  $('#userBtn')?.addEventListener('click', () => {
    if (currentUser) {
      navigateTo('account');
    } else {
      openLoginModal();
    }
  });

  // Login tabs
  document.querySelectorAll('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.login-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      $(`#${tab.dataset.tab}Content`)?.classList.add('active');
    });
  });

  // Listen to Firebase auth state changes
  setTimeout(() => {
    if (window.firebaseAuth && window.firebaseOnAuthStateChanged) {
      window.firebaseOnAuthStateChanged(window.firebaseAuth, async (user) => {
        if (user) {
          // User is signed in - get their data from Firestore
          try {
            const userRef = window.firestoreDoc(window.firebaseDb, 'users', user.uid);
            const userSnap = await window.firestoreGetDoc(userRef);

            if (userSnap.exists()) {
              currentUser = userSnap.data();
            } else {
              currentUser = {
                id: user.uid,
                name: user.displayName || 'Користувач',
                email: user.email,
                photo: user.photoURL,
                provider: user.providerData[0]?.providerId || 'unknown',
                bonuses: 0,
                createdAt: new Date().toISOString()
              };
            }
            localStorage.setItem('jahcloud_user', JSON.stringify(currentUser));
          } catch (error) {
            console.error('Error getting user data:', error);
          }
        } else {
          // User is signed out
          currentUser = null;
          localStorage.removeItem('jahcloud_user');
        }
        updateUserUI();
      });
    } else {
      // Firebase not loaded yet, try localStorage as fallback
      const savedUser = localStorage.getItem('jahcloud_user');
      if (savedUser) {
        currentUser = JSON.parse(savedUser);
      }
      updateUserUI();
    }
  }, 1000); // Wait for Firebase to initialize

  updateUserUI();
}

function openLoginModal() {
  $('#loginModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
  $('#loginModal').classList.remove('active');
  document.body.style.overflow = '';
}

// function loginWithTelegram() no longer needed as primary, but kept as fallback if needed
// We now use onTelegramAuth callback from the widget

async function onTelegramAuth(user) {
  // Debug alert to confirm widget is firing
  alert(`DEBUG: Telegram Auth!\nID: ${user?.id}\nName: ${user?.first_name}`);
  console.log('Telegram Auth Callback:', user);

  if (!user) {
    alert("User object is missing!");
    showToast('Помилка авторизації Telegram', 'error');
    return;
  }

  const userData = {
    id: `tg_${user.id}`,
    telegramId: user.id,
    name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
    username: user.username || '',
    photo: user.photo_url || '',
    provider: 'telegram',
    bonuses: 50, // Default for new users, will be overwritten if exists
    orders: [],
    createdAt: new Date().toISOString()
  };

  // Sync with Firebase
  if (window.firebaseDb && window.firestoreDoc && window.firestoreSetDoc && window.firestoreGetDoc) {
    try {
      const userRef = window.firestoreDoc(window.firebaseDb, 'users', `tg_${user.id}`);
      const userSnap = await window.firestoreGetDoc(userRef);

      if (userSnap.exists()) {
        const existingData = userSnap.data();
        userData.bonuses = existingData.bonuses || 50;
        userData.orders = existingData.orders || [];
        // Merge updates
        await window.firestoreSetDoc(userRef, userData, { merge: true });
        showToast('Вітаємо назад! 👋');
      } else {
        // New user
        await window.firestoreSetDoc(userRef, userData);
        showToast('Вітаємо! Ви отримали 50 бонусів! 🎁');
      }
    } catch (err) {
      console.error('Firebase sync error:', err);
      // Determine if generic error or network
      showToast('Помилка синхронізації з базою', 'error');
    }
  }

  currentUser = userData;
  saveUser();
  closeLoginModal();
  updateUserUI();
}

// Make it global for the widget to call
window.onTelegramAuth = onTelegramAuth;

function loginWithTelegram() {
  // Legacy fallback or for Mini App specific calls if widget fails
  showToast('Використовуйте кнопку "Log in with Telegram" вище ☝️', 'info');
}

async function loginWithGoogle() {
  // Real Google login with Firebase
  if (!window.firebaseAuth || !window.googleProvider) {
    showToast('Firebase не завантажено. Спробуйте пізніше.', 'error');
    return;
  }

  try {
    const result = await window.firebaseSignInWithPopup(window.firebaseAuth, window.googleProvider);
    const user = result.user;

    // Check if user exists in Firestore
    const userRef = window.firestoreDoc(window.firebaseDb, 'users', user.uid);
    const userSnap = await window.firestoreGetDoc(userRef);

    if (userSnap.exists()) {
      currentUser = userSnap.data();
    } else {
      // Create new user in Firestore
      currentUser = {
        id: user.uid,
        name: user.displayName || 'Користувач',
        email: user.email,
        photo: user.photoURL,
        provider: 'google',
        bonuses: 50,
        orders: [],
        createdAt: new Date().toISOString()
      };
      await window.firestoreSetDoc(userRef, currentUser);
      showToast('Вітаємо! Ви отримали 50 бонусів! 🎁');
    }

    saveUser();
    closeLoginModal();
    showToast('Успішний вхід через Google! 🎉');
  } catch (error) {
    console.error('Google login error:', error);
    showToast('Помилка входу: ' + error.message, 'error');
  }
}

async function loginWithEmail(event) {
  event.preventDefault();
  const email = $('#loginEmail').value;
  const password = $('#loginPassword').value;

  if (!window.firebaseAuth) {
    showToast('Firebase не завантажено', 'error');
    return;
  }

  try {
    const result = await window.firebaseSignInWithEmailAndPassword(window.firebaseAuth, email, password);
    const user = result.user;

    // Get user data from Firestore
    const userRef = window.firestoreDoc(window.firebaseDb, 'users', user.uid);
    const userSnap = await window.firestoreGetDoc(userRef);

    if (userSnap.exists()) {
      currentUser = userSnap.data();
    } else {
      currentUser = {
        id: user.uid,
        email: user.email,
        provider: 'email',
        bonuses: 0,
        orders: [],
        createdAt: new Date().toISOString()
      };
    }

    saveUser();
    closeLoginModal();
    showToast('Вітаємо назад! 👋');
  } catch (error) {
    console.error('Email login error:', error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      showToast('Невірний email або пароль', 'error');
    } else {
      showToast('Помилка входу: ' + error.message, 'error');
    }
  }
}

async function registerWithEmail(event) {
  event.preventDefault();
  const name = $('#registerName').value;
  const email = $('#registerEmail').value;
  const phone = $('#registerPhone').value;
  const password = $('#registerPassword').value;

  if (!window.firebaseAuth) {
    showToast('Firebase не завантажено', 'error');
    return;
  }

  try {
    const result = await window.firebaseCreateUserWithEmailAndPassword(window.firebaseAuth, email, password);
    const user = result.user;

    // Create user in Firestore
    const newUser = {
      id: user.uid,
      name,
      email,
      phone,
      provider: 'email',
      bonuses: 50,
      orders: [],
      createdAt: new Date().toISOString()
    };

    const userRef = window.firestoreDoc(window.firebaseDb, 'users', user.uid);
    await window.firestoreSetDoc(userRef, newUser);

    currentUser = newUser;
    saveUser();
    closeLoginModal();
    showToast('Реєстрація успішна! +50 бонусів 🎁');
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-in-use') {
      showToast('Цей email вже зареєстрований', 'error');
    } else if (error.code === 'auth/weak-password') {
      showToast('Пароль занадто слабкий (мін. 6 символів)', 'error');
    } else {
      showToast('Помилка реєстрації: ' + error.message, 'error');
    }
  }
}

function saveUser() {
  localStorage.setItem('jahcloud_user', JSON.stringify(currentUser));
  updateUserUI();
}

async function logout() {
  try {
    if (window.firebaseAuth) {
      await window.firebaseSignOut(window.firebaseAuth);
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
  currentUser = null;
  localStorage.removeItem('jahcloud_user');
  updateUserUI();
  navigateTo('home');
  showToast('Ви вийшли з акаунту');
}

function updateUserUI() {
  const userBtn = $('#userBtn');
  const userName = $('#userName');
  const userPhone = $('#userPhone');
  const bonusBalance = $('#bonusBalance');
  const bonusTotal = $('#bonusTotal');

  if (currentUser) {
    userBtn?.classList.add('logged-in');
    if (userName) userName.textContent = currentUser.name;
    if (userPhone) userPhone.textContent = currentUser.phone || currentUser.email || '';
    if (bonusBalance) bonusBalance.textContent = currentUser.bonuses || 0;
    if (bonusTotal) bonusTotal.textContent = currentUser.bonuses || 0;

    // Update bonuses variable
    bonuses = currentUser.bonuses || 0;
    localStorage.setItem('bonuses', bonuses);
  } else {
    userBtn?.classList.remove('logged-in');
  }
}

// ============ TELEGRAM STARS PAYMENT ============
function payWithTelegramStars() {
  const total = getCartTotal() - getDiscount();
  const starsAmount = Math.max(1, Math.ceil(total / 2));

  if (window.Telegram?.WebApp) {
    // Use Telegram WebApp payment
    const tg = window.Telegram.WebApp;

    // Prepare order data
    const orderData = {
      items: cart,
      total: total,
      stars: starsAmount,
      user: currentUser,
      timestamp: new Date().toISOString()
    };

    // Send data to bot
    tg.sendData(JSON.stringify({
      action: 'create_order',
      order: orderData
    }));

    showToast('Переходимо до оплати...');

    // Close Mini App
    setTimeout(() => {
      tg.close();
    }, 1000);
  } else {
    // Fallback - open bot for payment
    const botUsername = 'BBUa_BOT';
    const items = cart.map(i => `${i.name}x${i.quantity}`).join(',');
    window.open(`https://t.me/${botUsername}?start=pay_${total}_${encodeURIComponent(items)}`, '_blank');
    showToast('Перейдіть в Telegram для оплати ⭐');
  }
}

// ============ TELEGRAM MINI APP INTEGRATION ============
function initTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;

    // Expand to full height
    tg.expand();

    // Set theme
    if (tg.colorScheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Enable closing confirmation
    tg.enableClosingConfirmation();

    // Auto-login from Telegram - ALWAYS login when in Mini App
    const tgUser = tg.initDataUnsafe?.user;
    if (tgUser) {
      const userData = {
        id: `tg_${tgUser.id}`,
        telegramId: tgUser.id,
        name: tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : ''),
        username: tgUser.username || '',
        photo: tgUser.photo_url || '',
        provider: 'telegram',
        bonuses: parseInt(localStorage.getItem('bonuses')) || 50,
        orders: [],
        createdAt: new Date().toISOString()
      };

      currentUser = userData;
      saveUser();

      // Save to Firebase
      if (window.firebaseDb && window.firestoreDoc && window.firestoreSetDoc) {
        const userRef = window.firestoreDoc(window.firebaseDb, 'users', `tg_${tgUser.id}`);
        window.firestoreSetDoc(userRef, userData, { merge: true })
          .then(() => {
            console.log('Telegram user synced with Firebase');
            // Show welcome if first time
            if (!localStorage.getItem('tg_welcomed')) {
              localStorage.setItem('tg_welcomed', 'true');
              showToast(`Вітаємо, ${tgUser.first_name}! 🎉`);
            }
          })
          .catch(err => console.error('Firebase sync error:', err));
      } else {
        // Firebase not ready yet, try again
        setTimeout(() => {
          if (window.firebaseDb) {
            const userRef = window.firestoreDoc(window.firebaseDb, 'users', `tg_${tgUser.id}`);
            window.firestoreSetDoc(userRef, userData, { merge: true });
          }
        }, 2000);
      }

      updateUserUI();
    }

    // Set main button for checkout
    tg.MainButton.setText('🛒 Оформити замовлення');
    tg.MainButton.onClick(() => {
      if (cart.length > 0) {
        payWithTelegramStars();
      }
    });

    // Show/hide main button based on cart
    updateTelegramMainButton();
  }
}

function updateTelegramMainButton() {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    if (cart.length > 0) {
      const total = getCartTotal() - getDiscount();
      tg.MainButton.setText(`💳 Оплатити ${total}₴`);
      tg.MainButton.show();
    } else {
      tg.MainButton.hide();
    }
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initTelegramWebApp();
});

// Global functions for HTML onclick
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.loginWithTelegram = loginWithTelegram;
window.loginWithGoogle = loginWithGoogle;
window.loginWithEmail = loginWithEmail;
window.registerWithEmail = registerWithEmail;
window.logout = logout;
window.payWithTelegramStars = payWithTelegramStars;

// Update Telegram button when cart changes
const originalUpdateCartUI = updateCartUI;
updateCartUI = function () {
  originalUpdateCartUI();
  updateTelegramMainButton();
};
