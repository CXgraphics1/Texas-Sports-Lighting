// ===================== MOBILE NAV & DROPDOWNS =====================
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // don't let this bubble to document click
    const isOpen = siteNav.classList.toggle('is-open'); // matches CSS
    navToggle.setAttribute('aria-expanded', String(isOpen));

    // When closing the nav, also close any open submenus
    if (!isOpen) {
      document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
      document.querySelectorAll('.has-sub .sub-toggle').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

// Services (and other) submenus
document.querySelectorAll('.has-sub .sub-toggle').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent document click from immediately closing

    const parent = e.currentTarget.closest('.has-sub');
    const isOpen = parent.classList.toggle('open');

    // Update aria-expanded for this button
    btn.setAttribute('aria-expanded', String(isOpen));

    // Close other open submenus
    document.querySelectorAll('.has-sub').forEach(sib => {
      if (sib !== parent) {
        sib.classList.remove('open');
        const sibBtn = sib.querySelector('.sub-toggle');
        if (sibBtn) sibBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });
});

// Close submenus (and optionally nav) when clicking elsewhere
document.addEventListener('click', () => {
  document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.has-sub .sub-toggle').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
  });
  // Note: we are NOT closing the whole nav here so the mobile menu
  // stays open until the user taps the burger again.
});


// ===================== SIMPLE LIGHTBOX =====================
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = '<img alt=""/>';
document.body.appendChild(lightbox);

document.addEventListener('click', (e) => {
  const t = e.target;

  // Open lightbox
  if (t.matches('[data-lightbox]')) {
    e.preventDefault();
    const src = t.getAttribute('href') || t.getAttribute('src');
    lightbox.querySelector('img').src = src;
    lightbox.classList.add('open');
    return;
  }

  // Close lightbox when clicking on the overlay
  if (t === lightbox) {
    lightbox.classList.remove('open');
  }
});


// ===================== BASIC FORM VALIDATION =====================
function validateRequired(form) {
  let ok = true;
  form.querySelectorAll('[required]').forEach(el => {
    if (!el.value.trim()) {
      ok = false;
      el.setCustomValidity('This field is required');
      el.reportValidity();
    } else {
      el.setCustomValidity('');
    }
  });
  return ok;
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!validateRequired(form)) e.preventDefault();
    });
  });
});
