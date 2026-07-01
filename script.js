/* =========================================================
   Destiny Airlines — script.js
   Handles nav interactions, search box, ticket status lookup,
   scroll reveal animations, and small UX niceties.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSearchTabs();
  initFlightSearch();
  initTicketStatus();
  initDateField();
  initScrollReveal();
  initHeaderButtons();
  initSocialButtons();
});

/* ---------------------------------------------------------
   1. Top navigation — active state + smooth scroll to section
--------------------------------------------------------- */
function initNav() {
  const navItems = document.querySelectorAll('.nav-item');

  // Map each nav label to the section it should scroll to
  const sectionMap = {
    'Flight': '.hero',
    'Flight Info': '.flight-info-section',
    'Destinations': '.destinations',
    'Ticket Status': '.ticket-section',
    'Fleet': '.fleet-section',
    'Contact': 'footer',
  };

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      navItems.forEach((n) => n.classList.remove('active'));
      item.classList.add('active');

      const targetSelector = sectionMap[item.textContent.trim()];
      const target = targetSelector && document.querySelector(targetSelector);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ---------------------------------------------------------
   2. Search box tabs — One Way / Round Trip / Multi-City
--------------------------------------------------------- */
function initSearchTabs() {
  const tabs = document.querySelectorAll('.stab');
  const dateField = document.querySelector('.search-row .field:nth-child(3)');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      // For round trip, add a "Return" date field if it doesn't exist yet
      const searchRow = document.querySelector('.search-row');
      let returnField = document.querySelector('.field-return');

      if (tab.textContent.trim() === 'Round Trip') {
        if (!returnField) {
          returnField = document.createElement('div');
          returnField.className = 'field field-return';
          returnField.innerHTML = `
            <label>Return</label>
            <input type="date" />
          `;
          dateField.after(returnField);
        }
      } else if (returnField) {
        returnField.remove();
      }
    });
  });
}

/* ---------------------------------------------------------
   3. Flight search form — basic validation + feedback
--------------------------------------------------------- */
function initFlightSearch() {
  const searchBtn = document.querySelector('.btn-search');
  if (!searchBtn) return;

  searchBtn.addEventListener('click', () => {
    const from = document.querySelector('.search-row .field:nth-child(1) input');
    const to = document.querySelector('.search-row .field:nth-child(2) input');
    const date = document.querySelector('.search-row .field:nth-child(3) input');
    const passengers = document.querySelector('.search-row select');

    if (!from.value.trim() || !to.value.trim()) {
      shakeElement(searchBtn);
      showToast('Please enter both an origin and a destination city.');
      return;
    }

    if (!date.value) {
      shakeElement(searchBtn);
      showToast('Please select a departure date.');
      return;
    }

    if (from.value.trim().toLowerCase() === to.value.trim().toLowerCase()) {
      showToast('Origin and destination can\'t be the same city.');
      return;
    }

    showToast(
      `Searching flights: ${from.value} → ${to.value} on ${formatDate(date.value)} for ${passengers.value}…`
    );

    // Scroll to results area (destinations, as a stand-in for a results page)
    document.querySelector('.destinations')?.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ---------------------------------------------------------
   4. Ticket status lookup
--------------------------------------------------------- */
function initTicketStatus() {
  const checkBtn = document.querySelector('.btn-check');
  const ticketPanel = document.querySelector('.ticket-panel');
  if (!checkBtn || !ticketPanel) return;

  const refInput = ticketPanel.querySelector('.ticket-input');
  const nameInput = ticketPanel.querySelectorAll('.ticket-input')[1];
  const sample = ticketPanel.querySelector('.ticket-sample');

  // Demo "database" — matches the sample ticket already shown in the markup
  const demoBooking = {
    ref: 'DA-290514',
    lastName: 'shrestha',
  };

  checkBtn.addEventListener('click', () => {
    const ref = refInput.value.trim();
    const lastName = nameInput.value.trim().toLowerCase();

    if (!ref || !lastName) {
      showToast('Enter both your booking reference and last name.');
      return;
    }

    if (ref.toUpperCase() === demoBooking.ref && lastName === demoBooking.lastName) {
      sample.style.display = '';
      sample.style.opacity = 0;
      sample.style.transition = 'opacity .4s ease';
      requestAnimationFrame(() => (sample.style.opacity = 1));
      showToast('Booking found — details below.');
    } else {
      showToast(`No booking found for reference "${ref}". Double-check and try again.`);
    }
  });
}

/* ---------------------------------------------------------
   5. Departure date field — prevent past dates
--------------------------------------------------------- */
function initDateField() {
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.min = today;
  });
}

/* ---------------------------------------------------------
   6. Scroll reveal animation for cards/sections
--------------------------------------------------------- */
function initScrollReveal() {
  const revealTargets = document.querySelectorAll(
    '.dest-card, .fleet-card, .stat-item, .info-list li'
  );

  revealTargets.forEach((el) => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          setTimeout(() => {
            el.style.opacity = 1;
            el.style.transform = 'translateY(0)';
          }, i * 60);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   7. Header buttons — Login / Book Now placeholders
--------------------------------------------------------- */
function initHeaderButtons() {
  const loginBtn = document.querySelector('.btn-login');
  const bookBtn = document.querySelector('.btn-book');

  loginBtn?.addEventListener('click', () => {
    showToast('Login flow coming soon — this is a demo button.');
  });

  bookBtn?.addEventListener('click', () => {
    document.querySelector('.search-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.querySelector('.search-row .field:nth-child(1) input')?.focus();
  });
}

/* -----------------------------------------
----------------
   8. Social buttons — placeholder feedback
--------------------------------------------------------- */
function initSocialButtons() {
  document.querySelectorAll('.social-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      showToast(`${btn.getAttribute('aria-label')} — link coming soon.`);
    });
  });
}

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
function formatDate(value) {
  const d = new Date(value);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function shakeElement(el) {
  el.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(-4px)' },
      { transform: 'translateX(4px)' },
      { transform: 'translateX(0)' },
    ],
    { duration: 350, easing: 'ease-in-out' }
  );
}

let toastTimeout;
function showToast(message) {
  let toast = document.querySelector('.dz-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'dz-toast';
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      background: '#1a1a1a',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '8px',
      fontFamily: '"Barlow", sans-serif',
      fontSize: '0.9rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      zIndex: 9999,
      opacity: 0,
      transition: 'opacity .3s ease, transform .3s ease',
      maxWidth: '90%',
      textAlign: 'center',
    });
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  clearTimeout(toastTimeout);

  requestAnimationFrame(() => {
    toast.style.opacity = 1;
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  toastTimeout = setTimeout(() => {
    toast.style.opacity = 0;
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3200);
}
