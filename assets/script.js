/* GSTSyncPro — shared script.js */

// ─── ACTIVE NAV ──────────────────────────────────────────────────────────────
(function () {
  var path = window.location.pathname;
  document.querySelectorAll('.nav-links a[data-nav]').forEach(function (a) {
    var key = a.getAttribute('data-nav');
    if (key === 'home') {
      if (path === '/' || path.endsWith('/index.html') && path.split('/').length <= 2) {
        a.classList.add('active');
      }
    } else if (path.indexOf('/' + key) !== -1) {
      a.classList.add('active');
    }
  });
})();

// ─── MOBILE NAV ──────────────────────────────────────────────────────────────
function toggleMenu() {
  var m = document.getElementById('mobileMenu');
  if (m) m.classList.toggle('open');
}

// ─── SMOOTH ANCHOR SCROLL ────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var href = a.getAttribute('href');
    if (href === '#') return;
    var target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ─── FAQ TOGGLE ──────────────────────────────────────────────────────────────
function toggleFaq(el) {
  var item = el.closest('.faq-item');
  if (!item) item = el.parentElement;
  // Close all others
  document.querySelectorAll('.faq-item.open').forEach(function (o) {
    if (o !== item) o.classList.remove('open');
  });
  item.classList.toggle('open');
}

// ─── PRICING MODAL ───────────────────────────────────────────────────────────
var plans = {
  silver: {
    name: 'Silver Plan', icon: '🥈', desc: '1 User · 1 Year',
    orig: '₹300', curr: '₹150',
    features: ['1 User License', '1 Year Validity', 'All Features Unlocked', 'File Upload Enabled', 'Excel & JSON Export', 'Email Support', 'Price inclusive of GST'],
    link: 'https://pages.razorpay.com/infitaxsolutionsilverplan'
  },
  gold: {
    name: 'Gold Plan', icon: '🥇', desc: 'Up to 5 Users · 1 Year',
    orig: '₹700', curr: '₹350',
    features: ['Up to 5 Users', '1 Year Validity', 'All Features Unlocked', 'File Upload Enabled', 'Excel & JSON Export', 'Priority Email Support', 'Price inclusive of GST'],
    link: 'https://pages.razorpay.com/infitaxsolutiongoldplan'
  },
  platinum: {
    name: 'Platinum Plan', icon: '💎', desc: 'Up to 3 Users · Lifetime',
    orig: '₹10,000', curr: '₹5,000',
    features: ['Up to 3 Users', 'Lifetime Validity', 'All Features Unlocked', 'All Future Updates', 'File Upload Enabled', 'Priority Support Forever', 'Price inclusive of GST'],
    link: 'https://pages.razorpay.com/infitaxsolutionlifetimeplan'
  }
};

function openModal(plan) {
  var p = plans[plan];
  if (!p) return;
  var body = document.getElementById('modal-body');
  if (!body) return;
  var featureItems = p.features.map(function (f) { return '<li>' + f + '</li>'; }).join('');
  body.innerHTML =
    '<div class="plan-tag">' + p.icon + ' ' + p.name + '</div>' +
    '<h3>Complete Your Purchase</h3>' +
    '<div class="modal-price-row">' +
      '<span class="orig">' + p.orig + '</span>' +
      '<span class="curr">' + p.curr + '</span>' +
      '<span class="badge">50% OFF</span>' +
    '</div>' +
    '<ul class="modal-features">' + featureItems + '</ul>' +
    '<button class="pay-btn" onclick="goToPay(\'' + plan + '\')">💳 Pay ' + p.curr + ' — Secure Checkout →</button>' +
    '<p class="modal-note" style="margin-top:14px">🔒 Secure payment via Razorpay &nbsp;|&nbsp; All payment methods accepted<br>License key sent to your email instantly<br><strong>Questions?</strong> WhatsApp us at +91 6354030446</p>';
  var overlay = document.getElementById('payModal');
  if (overlay) overlay.classList.add('open');
}

function goToPay(plan) {
  if (plans[plan]) window.open(plans[plan].link, '_blank');
}

function closeModal() {
  var overlay = document.getElementById('payModal');
  if (overlay) overlay.classList.remove('open');
}

// Close modal on overlay click
document.addEventListener('click', function (e) {
  var overlay = document.getElementById('payModal');
  if (overlay && e.target === overlay) closeModal();
});

// ─── CONTACT FORM (Cloudflare Worker + D1) ───────────────────────────────────
// ↓ Replace this URL with your deployed Cloudflare Worker URL after setup
var WORKER_URL = 'https://gstsyncpro-contact.YOUR_SUBDOMAIN.workers.dev/contact';

async function submitForm() {
  var nameEl    = document.getElementById('cf-name');
  var emailEl   = document.getElementById('cf-email');
  var subjectEl = document.getElementById('cf-subject');
  var msgEl     = document.getElementById('cf-msg');

  var name    = nameEl    ? nameEl.value.trim()    : '';
  var email   = emailEl   ? emailEl.value.trim()   : '';
  var subject = subjectEl ? subjectEl.value        : '';
  var message = msgEl     ? msgEl.value.trim()     : '';

  if (!name || !email || !subject || !message) {
    showToast('⚠️ Please fill all fields before submitting.');
    return;
  }

  var btn = document.querySelector('.submit-btn');
  var origText = btn ? btn.textContent : 'Send Message →';
  if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; btn.style.opacity = '0.6'; }

  function resetBtn() {
    if (btn) { btn.textContent = origText; btn.disabled = false; btn.style.opacity = '1'; }
  }

  try {
    var res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, subject: subject, message: message })
    });

    var data = await res.json();

    if (data.success) {
      showToast('✅ Message sent! We\'ll get back to you soon.');
      [nameEl, emailEl, subjectEl, msgEl].forEach(function(el) { if (el) el.value = ''; });
    } else {
      showToast('❌ ' + (data.error || 'Something went wrong. Please try again.'));
    }
  } catch (err) {
    showToast('❌ Network error. Please check your connection and try again.');
  } finally {
    resetBtn();
  }
}

// ─── NOTIFY FORM (products page) ─────────────────────────────────────────────
function notifyMe(btn, productName) {
  var form = btn.closest('.notify-form');
  var input = form ? form.querySelector('input') : null;
  if (!input || !input.value.trim()) {
    showToast('⚠️ Enter your email to get notified.');
    return;
  }
  btn.textContent = '✓ Noted!';
  btn.disabled = true;
  btn.style.background = '#16a34a';
  showToast('✅ You\'ll be notified when ' + productName + ' launches!');
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 3500);
}
