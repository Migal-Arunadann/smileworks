/**
 * SMILE WORKS — DENTISTRY BEYOND EXPECTATIONS
 * Frontend Script: Navigation, Header Scroll, Mobile Menu & Smooth Scroll
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initScrollAnimations();
  initSmoothScroll();
});

/**
 * 1. Header scroll transformation
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Trigger initial check
}

/**
 * 2. Mobile slide menu toggle
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const navLinks = document.querySelectorAll('.mobile-nav-link');
  if (!toggleBtn || !drawer) return;

  const toggleMenu = (open) => {
    const isOpen = typeof open === 'boolean' ? open : !drawer.classList.contains('open');
    drawer.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';

    const icon = toggleBtn.querySelector('svg');
    if (icon) {
      icon.innerHTML = isOpen
        ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`
        : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>`;
    }
  };

  toggleBtn.addEventListener('click', () => toggleMenu());

  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

/**
 * 3. Scroll reveal with IntersectionObserver
 */
function initScrollAnimations() {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) {
    // Keep elements visible without animation
    return;
  }

  // Mark HTML as JS ready for animation enhancement
  document.documentElement.classList.add('js-ready');

  const revealElements = document.querySelectorAll('.reveal-fade');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -20px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/**
 * 4. Smooth scroll offset compensation for fixed navigation
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 72;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
}
