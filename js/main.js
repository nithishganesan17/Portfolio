/**
 * NITHISH GANESAN — PORTFOLIO INTERACTION ENGINE
 * Vanilla JS, lightweight, responsive, accessible, zero-dependency.
 */

function initApp() {
  initCustomCursor();
  initHeaderScrollSpy();
  initHero3DTilt();
  initHeroNameHoverSwap();
  initScrollAnimations();
  initSkillFiltering();
  initWorkflowInteractivity();
  initCopyEmail();
  initMobileNav();
  initSmoothScroll();
  initEducationTimelineMotion();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/* --------------------------------------------------------------------------
   1. CUSTOM MAGNETIC & TRAILING CURSOR
   -------------------------------------------------------------------------- */
function initCustomCursor() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  // Disable on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  // Smooth trailing lerp loop
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover states on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, .interactive-hover, .skill-pill, .workflow-node-card, .project-card, .hero-3d-card');
  hoverTargets.forEach((target) => {
    target.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
    target.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
  });
}

/* --------------------------------------------------------------------------
   2. HEADER SCROLL & INTERSECTION OBSERVER SCROLL SPY
   -------------------------------------------------------------------------- */
function initHeaderScrollSpy() {
  const header = document.querySelector('.site-header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const navWrapper = document.querySelector('.nav-wrapper');
  const navActions = document.querySelector('.nav-actions');

  if (!header) return;

  // Calculate shift distance to top-right corner dynamically
  function updateNavCtaPosition() {
    if (!navWrapper || !navActions) return;
    if (window.innerWidth <= 768) {
      header.style.removeProperty('--cta-shift-x');
      return;
    }

    // Measure exact distance from navActions to right boundary of navWrapper + slight right offset
    const shiftX = Math.max(0, navWrapper.clientWidth - (navActions.offsetLeft + navActions.offsetWidth)) + 26;
    header.style.setProperty('--cta-shift-x', `${shiftX}px`);
  }

  updateNavCtaPosition();
  window.addEventListener('resize', updateNavCtaPosition, { passive: true });
  window.addEventListener('orientationchange', updateNavCtaPosition, { passive: true });
  if (document.fonts) {
    document.fonts.ready.then(updateNavCtaPosition);
  }

  function handleScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((sec) => observer.observe(sec));
}

/* --------------------------------------------------------------------------
   3. HERO 3D CARD INTERACTIVE PERSPECTIVE TILT
   -------------------------------------------------------------------------- */
function initHero3DTilt() {
  const card = document.querySelector('.hero-3d-card');
  const stage = document.querySelector('.hero-visual-stage');
  if (!card || !stage) return;

  // Disable on reduced motion or touch
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) {
    return;
  }

  let bounds = stage.getBoundingClientRect();
  window.addEventListener('resize', () => {
    bounds = stage.getBoundingClientRect();
  });

  stage.addEventListener('mousemove', (e) => {
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // max 12 deg tilt
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  stage.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });

  // Touch device toggle for color portrait
  card.addEventListener('click', () => {
    card.classList.toggle('touch-color');
  });
}

/* --------------------------------------------------------------------------
   4. TECHNICAL SKILLS CATEGORY FILTERING
   -------------------------------------------------------------------------- */
function initSkillFiltering() {
  const tabBtns = document.querySelectorAll('.skill-tab-btn');
  const cards = document.querySelectorAll('.skill-category-card');
  if (!tabBtns.length || !cards.length) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   5. WORKFLOW STEP INTERACTIVITY
   -------------------------------------------------------------------------- */
function initWorkflowInteractivity() {
  const nodes = document.querySelectorAll('.workflow-node-card');
  if (!nodes.length) return;

  nodes.forEach((node, index) => {
    node.addEventListener('mouseenter', () => {
      nodes.forEach((n) => n.style.opacity = '0.7');
      node.style.opacity = '1';
      node.style.borderColor = 'var(--accent-primary)';
    });

    node.addEventListener('mouseleave', () => {
      nodes.forEach((n) => {
        n.style.opacity = '1';
        n.style.borderColor = 'var(--border-medium)';
      });
    });
  });
}

/* --------------------------------------------------------------------------
   6. COPY EMAIL WITH TOAST FEEDBACK
   -------------------------------------------------------------------------- */
function initCopyEmail() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const toast = document.getElementById('toastNotice');
  if (!copyBtn || !toast) return;

  const emailToCopy = 'nithishganesh1710@gmail.com';

  copyBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(emailToCopy);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = emailToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }

      showToast('Email copied to clipboard: ' + emailToCopy);
    } catch (err) {
      // Fallback: trigger mailto
      window.location.href = `mailto:${emailToCopy}`;
    }
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

/* --------------------------------------------------------------------------
   7. MOBILE NAVIGATION TOGGLE
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-menu-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-menu-link');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    drawer.classList.toggle('open');
    const isOpen = drawer.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --------------------------------------------------------------------------
   8. ACCESSIBLE SMOOTH SCROLLING
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  internalLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 85;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8b. EDUCATION TIMELINE TRAVELING MOTION & DYNAMIC PROGRESSION
   -------------------------------------------------------------------------- */
function initEducationTimelineMotion() {
  const track = document.querySelector('.education-timeline-track');
  if (!track) return;

  const items = Array.from(track.querySelectorAll('.education-item'));
  const progressLine = track.querySelector('.timeline-progress-line');
  const travelPoint = track.querySelector('.timeline-traveling-point');
  if (items.length < 2) return;

  function updateMotion() {
    const windowH = window.innerHeight;
    // Eye focal line is around 52% down the viewport
    const focalY = windowH * 0.52;

    // Measure each item's marker position relative to track
    const itemData = items.map((item, idx) => {
      const marker = item.querySelector('.timeline-marker');
      const itemRect = item.getBoundingClientRect();
      const markerTop = marker ? (item.offsetTop + marker.offsetTop) : (item.offsetTop + 10);
      return {
        idx,
        item,
        markerTop,
        viewportY: itemRect.top + (itemRect.height * 0.35)
      };
    });

    const first = itemData[0];
    const last = itemData[itemData.length - 1];

    // Scroll progress from first item (progress=0) to last item (progress=1)
    const totalDist = last.viewportY - first.viewportY;
    let progress = 0;
    if (totalDist > 0) {
      progress = (focalY - first.viewportY) / totalDist;
      progress = Math.max(0, Math.min(1, progress));
    }

    // Dynamic travel position of the point along the track
    const startTop = first.markerTop;
    const endTop = last.markerTop;
    const currentTop = startTop + progress * (endTop - startTop);
    const lineHeight = currentTop - startTop;

    track.style.setProperty('--edu-line-height', `${Math.max(0, lineHeight)}px`);
    track.style.setProperty('--edu-point-top', `${currentTop - 4}px`);

    // Determine active item based on progress intervals
    let activeIdx = 0;
    const stepSize = 1 / items.length;
    for (let i = 0; i < items.length; i++) {
      const lower = i * stepSize * 0.9;
      if (progress >= lower) {
        activeIdx = i;
      }
    }

    items.forEach((item, i) => {
      if (i === activeIdx) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateMotion, { passive: true });
  window.addEventListener('resize', updateMotion, { passive: true });
  updateMotion();

  // Clicking an education item activates it
  items.forEach((item, clickedIdx) => {
    item.addEventListener('click', () => {
      items.forEach((it, i) => {
        if (i === clickedIdx) it.classList.add('active');
        else it.classList.remove('active');
      });
      const marker = item.querySelector('.timeline-marker');
      const startMarker = items[0].querySelector('.timeline-marker');
      const mTop = marker ? (item.offsetTop + marker.offsetTop) : (item.offsetTop + 10);
      const sTop = startMarker ? (items[0].offsetTop + startMarker.offsetTop) : (items[0].offsetTop + 10);
      track.style.setProperty('--edu-line-height', `${Math.max(0, mTop - sTop)}px`);
      track.style.setProperty('--edu-point-top', `${mTop - 4}px`);
    });
  });
}

/* --------------------------------------------------------------------------
   9. SCROLL-TRIGGERED TEXT & SECTION ENTRANCE ANIMATIONS
   -------------------------------------------------------------------------- */
function replayHeroAnimation() {
  const chars = document.querySelectorAll('.hero-title .char');
  if (!chars.length) return;
  chars.forEach((char) => {
    char.style.animation = 'none';
    char.offsetHeight; // trigger DOM reflow to restart CSS keyframe animation
    char.style.animation = '';
  });
}

function initScrollAnimations() {
  // Ensure refresh starts cleanly at top so hero & scroll entrance animations play fresh
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Replay hero title characters entrance cleanly on load/refresh
  replayHeroAnimation();

  // Mark document as js-ready to activate smooth animation states safely
  document.documentElement.classList.add('js-ready');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll(
    '.section-header, .about-editorial-quote, .about-paragraphs, .highlight-card, .skill-tabs, .skill-category-card, .workflow-node-card, .workflow-summary, .timeline-card, .contact-panel, .reveal-text'
  );
  const projectCards = document.querySelectorAll('.project-card');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('revealed'));
    projectCards.forEach((card) => card.classList.add('in-view'));
    return;
  }

  // Text & section scroll reveal observer — triggers whenever scrolling into view
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      } else {
        // When element scrolls back below the visible viewport, reset so it re-animates on scroll down
        if (entry.boundingClientRect.top > window.innerHeight * 0.8) {
          entry.target.classList.remove('revealed');
        }
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  });

  revealElements.forEach((el) => scrollObserver.observe(el));

  // Project cards smooth staggered scroll entrance
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        if (entry.boundingClientRect.top > window.innerHeight * 0.8) {
          entry.target.classList.remove('in-view');
        }
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  });

  projectCards.forEach((card) => cardObserver.observe(card));
}

/* --------------------------------------------------------------------------
   10. HERO NAME COMPLEMENTARY COLOR SWAP (NITHISH <-> GANESAN)
   -------------------------------------------------------------------------- */
function initHeroNameHoverSwap() {
  const heroTitle = document.querySelector('.hero-title');
  const outline = document.querySelector('.hero-title .title-outline');
  const fill = document.querySelector('.hero-title .title-fill');
  if (!heroTitle || !outline || !fill) return;

  fill.addEventListener('mouseenter', () => heroTitle.classList.add('hover-ganesan'));
  fill.addEventListener('mouseleave', () => heroTitle.classList.remove('hover-ganesan'));

  outline.addEventListener('mouseenter', () => heroTitle.classList.add('hover-nithish'));
  outline.addEventListener('mouseleave', () => heroTitle.classList.remove('hover-nithish'));
}
