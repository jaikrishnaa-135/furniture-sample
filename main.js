/* ===== STATE ===== */
const cart = [];
const products = [
  { id: 1, name: 'Serenity Timber Loveseat', price: 1000, old: 1200,
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80',
    desc: 'Handcrafted timber frame with premium linen upholstery. Sustainably sourced wood, built to last generations.' },
  { id: 2, name: 'Block Nomad Sofa — 3 piece', price: 2000, old: 2500,
    img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=80',
    desc: 'Modular 3-piece sofa with deep-seated comfort. Available in multiple fabric options.' },
  { id: 3, name: 'Nomad Sofa — Loveseat', price: 1500, old: 1800,
    img: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=700&q=80',
    desc: 'Compact loveseat with clean lines and plush cushioning. Perfect for intimate living spaces.' },
];

/* ===== HELPERS ===== */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const fmt = n => '₹' + n.toLocaleString('en-IN');

function scrollTo(sel) {
  const el = document.querySelector(sel);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('toast--show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('toast--show'), 2800);
}

function updateCartBadge() {
  const badge = $('cart-badge');
  const total = cart.reduce((s, i) => s + i.qty, 0);
  badge.textContent = total;
  badge.style.display = total ? 'flex' : 'none';
}

/* ===== OVERLAY / PANEL ===== */
function openOverlay(id) {
  $(id).classList.add('active');
  $('backdrop').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeOverlay(id) {
  $(id).classList.remove('active');
  checkBackdrop();
}
function openPanel(id) {
  $(id).classList.add('open');
  $('backdrop').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closePanel(id) {
  $(id).classList.remove('open');
  checkBackdrop();
}
function checkBackdrop() {
  const anyOpen = document.querySelector('.overlay.active, .side-panel.open');
  if (!anyOpen) {
    $('backdrop').classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Backdrop click closes everything
$('backdrop').addEventListener('click', () => {
  $$('.overlay.active').forEach(el => el.classList.remove('active'));
  $$('.side-panel.open').forEach(el => el.classList.remove('open'));
  $('backdrop').classList.remove('active');
  document.body.style.overflow = '';
});

// All [data-close] buttons
$$('[data-close]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const id = btn.dataset.close;
    closeOverlay(id);
    closePanel(id);
  });
});

/* ===== CART ===== */
function renderCart() {
  const list = $('cart-list');
  const footer = $('cart-footer');
  if (!cart.length) {
    list.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    footer.style.display = 'none';
    return;
  }
  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" />
      <div class="cart-item__info">
        <p>${item.name}</p>
        <div class="cart-item__controls">
          <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
        </div>
        <span>${fmt(item.price * item.qty)}</span>
      </div>
      <button class="cart-item__remove" data-id="${item.id}" aria-label="Remove">✕</button>
    </div>`).join('');
  $('cart-total').textContent = fmt(cart.reduce((s, i) => s + i.price * i.qty, 0));
  footer.style.display = 'block';
}

function addToCart(id) {
  const p = products.find(x => x.id === id);
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...p, qty: 1 });
  updateCartBadge();
  showToast(`${p.name} added to cart`);
}

$('cart-panel').addEventListener('click', e => {
  const btn = e.target.closest('[data-id]');
  if (!btn) return;
  const id = +btn.dataset.id;
  if (btn.classList.contains('cart-item__remove')) {
    const idx = cart.findIndex(x => x.id === id);
    if (idx > -1) cart.splice(idx, 1);
    updateCartBadge(); renderCart();
  } else if (btn.classList.contains('qty-btn')) {
    const item = cart.find(x => x.id === id);
    if (item) {
      btn.dataset.action === 'inc' ? item.qty++ : item.qty--;
      if (item.qty < 1) cart.splice(cart.indexOf(item), 1);
      updateCartBadge(); renderCart();
    }
  }
});

$('checkout-btn').addEventListener('click', () => {
  if (!cart.length) { showToast('Your cart is empty.'); return; }
  showToast('Order placed! Thank you for shopping with Nest & Noir.');
  cart.length = 0;
  updateCartBadge(); renderCart();
  closePanel('cart-panel');
});

/* ===== PRODUCT MODAL ===== */
function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const m = $('product-modal');
  m.querySelector('.pm__img').src = p.img;
  m.querySelector('.pm__img').alt = p.name;
  m.querySelector('.pm__name').textContent = p.name;
  m.querySelector('.pm__price-new').textContent = fmt(p.price);
  m.querySelector('.pm__price-old').textContent = fmt(p.old);
  m.querySelector('.pm__desc').textContent = p.desc;
  m.querySelector('.pm__add-btn').dataset.id = p.id;
  openOverlay('product-modal');
}

$('product-modal').addEventListener('click', e => {
  if (e.target.classList.contains('pm__add-btn')) {
    addToCart(+e.target.dataset.id);
    closeOverlay('product-modal');
    renderCart();
    openPanel('cart-panel');
  }
});

/* ===== SEARCH ===== */
const searchIndex = [
  { name: 'Serenity Timber Loveseat', id: 1 },
  { name: 'Block Nomad Sofa — 3 piece', id: 2 },
  { name: 'Nomad Sofa — Loveseat', id: 3 },
  { name: 'Outdoor Living Set', id: null },
  { name: 'Dining Table Oak', id: null },
  { name: 'Bedroom Armchair', id: null },
];

$('search-input').addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  const res = $('search-results');
  if (!q) { res.innerHTML = ''; return; }
  const matches = searchIndex.filter(p => p.name.toLowerCase().includes(q));
  res.innerHTML = matches.length
    ? matches.map(p => `<div class="search-result-item" data-id="${p.id ?? ''}">${p.name}</div>`).join('')
    : '<div class="search-result-item search-result-item--none">No results found</div>';
});

$('search-results').addEventListener('click', e => {
  const item = e.target.closest('.search-result-item');
  if (!item || !item.dataset.id) return;
  closeOverlay('search-overlay');
  $('search-input').value = '';
  $('search-results').innerHTML = '';
  openProduct(+item.dataset.id);
});

/* ===== NAV ===== */
// Search
document.querySelector('[aria-label="Search"]').addEventListener('click', () => {
  openOverlay('search-overlay');
  setTimeout(() => $('search-input').focus(), 80);
});

// Cart
document.querySelector('[aria-label="Cart"]').addEventListener('click', () => {
  renderCart();
  openPanel('cart-panel');
});

// Home → scroll top
document.querySelector('.nav__links li:first-child a').addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Our Story → featured section
document.querySelector('.nav__links li:nth-child(3) a').addEventListener('click', e => {
  e.preventDefault();
  scrollTo('.featured');
});

// Contact Us → testimonials section
document.querySelector('.nav__links li:nth-child(4) a').addEventListener('click', e => {
  e.preventDefault();
  scrollTo('.testimonials');
});

// Logo → scroll top
document.querySelector('.nav__logo').addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Products dropdown — toggle on click, close when clicking a child link
const dropdownLi = document.querySelector('.has-dropdown');
dropdownLi.querySelector('a').addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  dropdownLi.classList.toggle('open');
});
dropdownLi.querySelectorAll('.nav-dropdown a').forEach(a => {
  a.addEventListener('click', () => dropdownLi.classList.remove('open'));
});
document.addEventListener('click', e => {
  if (!dropdownLi.contains(e.target)) dropdownLi.classList.remove('open');
});

// Mobile menu toggle
$('mobile-menu-btn')?.addEventListener('click', e => {
  e.stopPropagation();
  document.querySelector('.nav__links').classList.toggle('nav__links--open');
});
document.addEventListener('click', e => {
  const links = document.querySelector('.nav__links');
  if (!links.contains(e.target) && e.target !== $('mobile-menu-btn')) {
    links.classList.remove('nav__links--open');
  }
});

// Scroll shadow
window.addEventListener('scroll', () => {
  document.querySelector('.nav').style.boxShadow =
    window.scrollY > 10 ? '0 2px 16px rgba(0,0,0,0.08)' : 'none';
}, { passive: true });

/* ===== HERO ===== */
// Shop Now button
document.querySelector('.hero__content .btn').addEventListener('click', e => {
  e.preventDefault();
  scrollTo('.bestsellers');
});

// Thumbnails
$$('.hero__thumbs img').forEach(thumb => {
  thumb.addEventListener('click', () => {
    document.querySelector('.hero__bg img').src = thumb.src.replace('w=200', 'w=1400');
    $$('.hero__thumbs img').forEach(t => t.classList.remove('active-thumb'));
    thumb.classList.add('active-thumb');
  });
});

/* ===== SALE STRIP ===== */
$$('.sale-strip span').forEach(span => {
  span.addEventListener('click', () => scrollTo('.bestsellers'));
});

/* ===== BESTSELLERS ===== */
// "View all Products" link
document.querySelector('.bestsellers .section__head .link-accent').addEventListener('click', e => {
  e.preventDefault();
  scrollTo('.bestsellers');
  showToast('Showing all bestsellers');
});

// Product card "View" links
$$('.product-card__cta').forEach((btn, i) => {
  btn.addEventListener('click', e => { e.preventDefault(); openProduct(i + 1); });
});

// Product card image click
$$('.product-card').forEach((card, i) => {
  card.querySelector('.product-card__img img').style.cursor = 'pointer';
  card.querySelector('.product-card__img img').addEventListener('click', () => openProduct(i + 1));
});

// Wishlist buttons
$$('.wishlist-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const on = btn.dataset.wishlisted === 'true';
    btn.dataset.wishlisted = String(!on);
    btn.innerHTML = on ? '&#9825;' : '&#9829;';
    btn.style.color = on ? '' : '#b5451b';
    showToast(on ? 'Removed from wishlist' : 'Added to wishlist');
  });
});

// Color swatches
$$('.swatch').forEach(sw => {
  sw.addEventListener('click', e => {
    e.stopPropagation();
    sw.closest('.product-card__swatches').querySelectorAll('.swatch')
      .forEach(s => s.classList.remove('swatch--active'));
    sw.classList.add('swatch--active');
  });
});

/* ===== FEATURED SECTION ===== */
// Shop Now button
document.querySelector('.featured .btn--dark').addEventListener('click', e => {
  e.preventDefault();
  scrollTo('.bestsellers');
});

// Featured links (Summer Sale, Leather Sofas, etc.)
$$('.featured__links .link-accent').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    scrollTo('.bestsellers');
  });
});

/* ===== SHOP BY ROOM ===== */
document.querySelector('.room-banner__card .btn').addEventListener('click', e => {
  e.preventDefault();
  scrollTo('.bestsellers');
});

/* ===== FOOTER ===== */
const footerMap = {
  'Living Room': '.bestsellers',
  'Bedroom': '.bestsellers',
  'Dining': '.bestsellers',
  'Outdoor': '.shop-room',
  'Our Story': '.featured',
  'Careers': '.featured',
  'Press': '.featured',
  'Contact': '.testimonials',
  'FAQ': '.testimonials',
  'Shipping': '.testimonials',
  'Returns': '.testimonials',
  'Track Order': '.testimonials',
};
$$('.footer__cols a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = footerMap[a.textContent.trim()];
    if (target) scrollTo(target);
  });
});

/* ===== CART BADGE INJECT ===== */
// (badge already injected via inline script in HTML, just ensure it exists)
if (!$('cart-badge')) {
  const cartBtn = document.querySelector('[aria-label="Cart"]');
  cartBtn.style.position = 'relative';
  const badge = document.createElement('span');
  badge.id = 'cart-badge';
  badge.className = 'cart-badge';
  badge.style.display = 'none';
  cartBtn.appendChild(badge);
}
