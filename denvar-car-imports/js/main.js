// ---------- mobile menu toggle ----------
(function () {
  var menuBtn = document.querySelector('.menu-btn');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mobileMenu.classList.remove('open'); });
    });
  }
})();

// ---------- ambient canvas "video" background ----------
// Stands in for a real background video: no external video host is reachable
// from a published page, and inlining a video file would blow the size
// budget, so this canvas loop draws a slow-moving headlight/road-streak
// backdrop instead.
function initAmbient(canvasId) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var streaks = [];

  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function seed() {
    streaks = [];
    var count = Math.max(14, Math.floor(w / 90));
    for (var i = 0; i < count; i++) {
      streaks.push({
        y: Math.random() * h,
        x: Math.random() * w,
        len: 120 + Math.random() * 260,
        speed: 1.2 + Math.random() * 2.6,
        width: 0.6 + Math.random() * 1.6,
        hue: Math.random() > 0.5 ? '198,162,39' : '44,107,65'
      });
    }
  }
  window.addEventListener('resize', function () { resize(); seed(); });
  resize(); seed();

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function frame() {
    ctx.fillStyle = 'rgba(11,25,19,1)';
    ctx.fillRect(0, 0, w, h);
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(32,74,49,0.55)');
    grad.addColorStop(1, 'rgba(11,25,19,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    streaks.forEach(function (s) {
      ctx.strokeStyle = 'rgba(' + s.hue + ',0.5)';
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.len, s.y);
      ctx.stroke();
      if (!reduce) s.x += s.speed;
      if (s.x - s.len > w) s.x = -20;
    });

    requestAnimationFrame(frame);
  }
  frame();
}

// ---------- inventory data, render, filter (inventory.html only) ----------
var DENVAR_STOCK = [
  {name: "Toyota Land Cruiser Prado TX", origin: "Japan", year: 2021, km: "28,400", fuel: "Diesel", price: "9,200,000"},
  {name: "Subaru Forester X-Break", origin: "Japan", year: 2022, km: "15,900", fuel: "Petrol", price: "4,150,000"},
  {name: "Range Rover Evoque", origin: "United Kingdom", year: 2020, km: "39,200", fuel: "Petrol", price: "6,700,000"},
  {name: "Toyota Harrier Z", origin: "Japan", year: 2021, km: "34,200", fuel: "Hybrid", price: "4,650,000"},
  {name: "Mercedes-Benz GLC 220d", origin: "United Kingdom", year: 2020, km: "44,600", fuel: "Diesel", price: "7,900,000"},
  {name: "Nissan X-Trail", origin: "Japan", year: 2022, km: "21,100", fuel: "Petrol", price: "3,950,000"},
  {name: "Mazda CX-5 Field Journey", origin: "Japan", year: 2022, km: "19,600", fuel: "Petrol", price: "5,300,000"},
  {name: "Toyota Vitz", origin: "Japan", year: 2021, km: "26,800", fuel: "Petrol", price: "1,850,000"},
  {name: "Lexus RX 300", origin: "Japan", year: 2021, km: "17,200", fuel: "Hybrid", price: "8,300,000"},
  {name: "Land Rover Discovery Sport", origin: "United Kingdom", year: 2020, km: "36,500", fuel: "Diesel", price: "7,100,000"},
  {name: "Toyota Premio", origin: "Japan", year: 2021, km: "31,000", fuel: "Petrol", price: "2,950,000"},
  {name: "Nissan Patrol", origin: "UAE", year: 2020, km: "42,000", fuel: "Petrol", price: "9,800,000"},
  {name: "Toyota RAV4", origin: "Japan", year: 2022, km: "12,400", fuel: "Hybrid", price: "5,600,000"},
  {name: "BMW X3", origin: "UAE", year: 2021, km: "27,300", fuel: "Petrol", price: "8,750,000"},
  {name: "Honda Fit", origin: "Japan", year: 2022, km: "9,800", fuel: "Hybrid", price: "1,950,000"},
  {name: "Toyota Hilux Double Cab", origin: "Japan", year: 2021, km: "33,600", fuel: "Diesel", price: "6,400,000"},
  {name: "Mercedes-Benz C200", origin: "United Kingdom", year: 2020, km: "40,100", fuel: "Petrol", price: "6,900,000"},
  {name: "Toyota Alphard", origin: "Japan", year: 2021, km: "23,500", fuel: "Hybrid", price: "9,500,000"}
];

var DENVAR_PALETTE = ['#204A31,#10261A', '#2C6B41,#163524', '#163524,#0B1913'];

function denvarCarCard(item, idx) {
  var stops = DENVAR_PALETTE[idx % 3].split(',');
  return '' +
    '<article class="car-card glass" data-origin="' + item.origin + '">' +
      '<div class="car-illustration">' +
        '<svg viewBox="0 0 400 225" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">' +
          '<rect width="400" height="225" fill="url(#grad' + idx + ')"/>' +
          '<defs><linearGradient id="grad' + idx + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + stops[0] + '"/><stop offset="1" stop-color="' + stops[1] + '"/></linearGradient></defs>' +
          '<path d="M50 150 Q70 100 130 95 L260 95 Q310 98 330 150 L340 150 L340 165 L30 165 L30 150 Z" fill="none" stroke="#E1C158" stroke-width="2.5"/>' +
          '<circle cx="105" cy="165" r="18" fill="none" stroke="#E1C158" stroke-width="2.5"/>' +
          '<circle cx="280" cy="165" r="18" fill="none" stroke="#E1C158" stroke-width="2.5"/>' +
        '</svg>' +
      '</div>' +
      '<span class="origin-tag">' + item.origin + ' &middot; ' + item.year + '</span>' +
      '<h3>' + item.name + '</h3>' +
      '<div class="specs"><span>' + item.km + ' km</span><span>' + item.fuel + '</span><span>RHD</span></div>' +
      '<div class="price-row"><div class="price">KSh ' + item.price + '<small>duty-paid estimate</small></div><a class="reserve" href="contact.html">Reserve &rarr;</a></div>' +
    '</article>';
}

function initInventory() {
  var grid = document.getElementById('inv-grid');
  if (!grid) return;
  grid.innerHTML = DENVAR_STOCK.map(denvarCarCard).join('');

  var filterBtns = document.querySelectorAll('.filter-bar button');
  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      filterBtns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      var f = b.dataset.filter;
      grid.querySelectorAll('.car-card').forEach(function (c) {
        c.hidden = f !== 'all' && c.dataset.origin !== f;
      });
    });
  });
}

// ---------- contact form (static demo, no backend) ----------
function initContactForm() {
  var form = document.querySelector('.form-card');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var existing = form.querySelector('.form-note');
    if (!existing) {
      existing = document.createElement('p');
      existing.className = 'form-note show';
      existing.textContent = "Thanks — we'll reply on WhatsApp or email within 48 hours.";
      form.appendChild(existing);
    }
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initAmbient('canvas-home');
  initAmbient('canvas-inv');
  initInventory();
  initContactForm();
});
