/* ============================================================
   Terrace Studio — Premium Homestay Website
   Main JavaScript · Production Build
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ----------------------------------------------------------
     0. UTILITY HELPERS
  ---------------------------------------------------------- */

  /**
   * Debounce — delays execution until after `delay` ms of inactivity.
   * @param {Function} fn  Callback
   * @param {number}   delay  Milliseconds
   * @returns {Function}
   */
  const debounce = (fn, delay = 100) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  /**
   * Throttle via requestAnimationFrame — ensures at most one call per frame.
   * @param {Function} fn
   * @returns {Function}
   */
  const rafThrottle = (fn) => {
    let ticking = false;
    return (...args) => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          fn.apply(this, args);
          ticking = false;
        });
      }
    };
  };

  /** Shorthand selectors */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ----------------------------------------------------------
     1. NAVIGATION
  ---------------------------------------------------------- */

  const navbar = $('.navbar');
  const hamburger = $('.hamburger');
  const navMenu = $('.nav-menu');
  const navLinks = $$('.nav-menu a');

  // 1a. Mobile hamburger toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // 1b. Close mobile menu on link click
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      navMenu?.classList.remove('active');
    });
  });

  // 1c & 1d. Navbar scroll behaviour — background + hide/show
  let lastScrollY = window.scrollY;

  const handleNavbarScroll = () => {
    const currentScrollY = window.scrollY;

    // Background on scroll
    if (navbar) {
      navbar.classList.toggle('scrolled', currentScrollY > 50);

      // Hide on scroll-down, show on scroll-up
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        navbar.classList.add('nav-hidden');
      } else {
        navbar.classList.remove('nav-hidden');
      }
    }

    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', rafThrottle(handleNavbarScroll), { passive: true });

  // 1e. Active nav-link highlighting via IntersectionObserver
  const sections = $$('section[id]');

  if (sections.length) {
    const activateLink = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${id}`
        );
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activateLink(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((sec) => sectionObserver.observe(sec));
  }

  /* ----------------------------------------------------------
     2. SMOOTH SCROLLING
  ---------------------------------------------------------- */

  const NAVBAR_OFFSET = 80; // px – height of fixed navbar

  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '#!') return;

      const target = $(targetId);
      if (!target) return;

      e.preventDefault();

      const top =
        target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     3. SCROLL ANIMATIONS  (animate-on-scroll)
  ---------------------------------------------------------- */

  const animatedElements = $$('.animate-on-scroll');

  if (animatedElements.length) {
    const animObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const animation = el.dataset.animation || 'fadeInUp';
            const delay = el.dataset.delay || 0;

            setTimeout(() => {
              el.classList.add('animated', animation);
            }, Number(delay));

            observer.unobserve(el); // animate once
          }
        });
      },
      { threshold: 0.2 }
    );

    animatedElements.forEach((el) => animObserver.observe(el));
  }

  /* ----------------------------------------------------------
     4. IMAGE GALLERY LIGHTBOX
  ---------------------------------------------------------- */

  const galleryItems = $$('.gallery-item, .room-gallery-item');

  if (galleryItems.length) {
    // Use existing lightbox from HTML
    const lightbox = $('#lightbox');
    const lbImg = $('#lightbox-img');
    const lbClose = $('#lightbox-close');
    const lbPrev = $('#lightbox-prev');
    const lbNext = $('#lightbox-next');
    const lbCounter = $('#lightbox-counter');

    let currentGallery = []; // filtered group
    let currentIndex = 0;

    /** Collect gallery group images */
    const getGalleryGroup = (clickedItem) => {
      const group = clickedItem.dataset.gallery || null;
      const pool = group
        ? galleryItems.filter((item) => item.dataset.gallery === group)
        : galleryItems;
      return pool;
    };

    /** Get image src from an item (supports img child or background-image) */
    const getImageSrc = (item) => {
      const img = item.querySelector('img');
      if (img) return img.dataset.src || img.src;
      // Fallback: background-image
      const bg = getComputedStyle(item).backgroundImage;
      return bg ? bg.replace(/url\(["']?(.*?)["']?\)/, '$1') : '';
    };

    /** Show lightbox at index */
    const showLightbox = (index) => {
      currentIndex = index;
      const src = getImageSrc(currentGallery[index]);
      lbImg.src = src;
      lbImg.alt = currentGallery[index].getAttribute('alt') || `Gallery image ${index + 1}`;
      if (lbCounter) lbCounter.textContent = `${index + 1} / ${currentGallery.length}`;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    /** Close lightbox */
    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      lbImg.src = '';
    };

    /** Navigate */
    const navigate = (dir) => {
      currentIndex =
        (currentIndex + dir + currentGallery.length) % currentGallery.length;
      const src = getImageSrc(currentGallery[currentIndex]);
      lbImg.style.opacity = 0;
      setTimeout(() => {
        lbImg.src = src;
        if (lbCounter) lbCounter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
        lbImg.style.opacity = 1;
      }, 200);
    };

    // Click handlers on gallery items
    galleryItems.forEach((item) => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        currentGallery = getGalleryGroup(item);
        const idx = currentGallery.indexOf(item);
        showLightbox(idx >= 0 ? idx : 0);
      });
    });

    // Lightbox controls
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => navigate(-1));
    lbNext.addEventListener('click', () => navigate(1));

    // Close on overlay click (not on image / buttons)
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });

    // Swipe gestures (mobile)
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        navigate(diff > 0 ? 1 : -1); // swipe left → next, swipe right → prev
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     5. REVIEW CAROUSEL
  ---------------------------------------------------------- */

  const carouselContainer = $('.review-carousel');

  if (carouselContainer) {
    const carouselTrack = $('.review-carousel-track', carouselContainer);
    const slides = $$('.review-slide', carouselContainer);
    const dotsContainer = $('.carousel-dots');
    const prevBtn = $('#carousel-prev');
    const nextBtn = $('#carousel-next');
    let currentSlide = 0;
    let autoPlayTimer = null;
    const AUTO_INTERVAL = 5000; // 5 seconds

    // Create dot indicators
    if (dotsContainer && slides.length) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Go to review ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });
    }

    const dots = $$('.carousel-dot', dotsContainer);

    /** Go to specific slide */
    const goToSlide = (index) => {
      currentSlide = index;
      // Slide the carousel track
      const offset = -(currentSlide * 100);
      if (carouselTrack) {
        carouselTrack.style.transform = `translateX(${offset}%)`;
      }

      // Update dots
      dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));

      // Update slides
      slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
    };

    /** Advance to next slide */
    const nextSlide = () => {
      goToSlide((currentSlide + 1) % slides.length);
    };

    /** Start auto-play */
    const startAutoPlay = () => {
      stopAutoPlay();
      autoPlayTimer = setInterval(nextSlide, AUTO_INTERVAL);
    };

    /** Stop auto-play */
    const stopAutoPlay = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    // Pause on hover
    carouselContainer.addEventListener('mouseenter', stopAutoPlay);
    carouselContainer.addEventListener('mouseleave', startAutoPlay);

    // Touch swipe support for carousel
    let carouselTouchStartX = 0;

    carouselContainer.addEventListener('touchstart', (e) => {
      carouselTouchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (e) => {
      const diff = carouselTouchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToSlide((currentSlide + 1) % slides.length);
        } else {
          goToSlide((currentSlide - 1 + slides.length) % slides.length);
        }
      }
      startAutoPlay();
    }, { passive: true });

    // Prev / Next button handlers
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
        stopAutoPlay();
        startAutoPlay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide((currentSlide + 1) % slides.length);
        stopAutoPlay();
        startAutoPlay();
      });
    }

    // Initialise
    goToSlide(0);
    startAutoPlay();
  }

  /* ----------------------------------------------------------
     6. BOOKING FORM — WHATSAPP INTEGRATION
  ---------------------------------------------------------- */

  const bookingForm = $('#booking-form');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather field values
      const checkin = bookingForm.querySelector('#checkin-date')?.value?.trim();
      const checkout = bookingForm.querySelector('#checkout-date')?.value?.trim();
      const name = bookingForm.querySelector('#guest-name')?.value?.trim();
      const phone = bookingForm.querySelector('#guest-phone')?.value?.trim();
      const guests = bookingForm.querySelector('#num-guests')?.value?.trim();
      const specialRequest =
        bookingForm.querySelector('#special-request')?.value?.trim() || 'None';
      const phoneCall =
        bookingForm.querySelector('#phone-call')?.checked || false;

      // Validation
      const required = { checkin, checkout, name, phone, guests };
      const missing = Object.entries(required)
        .filter(([, v]) => !v)
        .map(([k]) => k);

      if (missing.length) {
        alert('Please fill in all required fields before submitting.');
        // Focus the first missing field
        const firstMissing = bookingForm.querySelector(
          `#${Object.keys(required).find((k) => !required[k])}-date, #guest-${Object.keys(required).find((k) => !required[k])}, #${Object.keys(required).find((k) => !required[k])}`
        );
        firstMissing?.focus();
        return;
      }

      // Format dates for readability
      const formatDate = (dateStr) => {
        try {
          const d = new Date(dateStr);
          return d.toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        } catch {
          return dateStr;
        }
      };

      // Build the WhatsApp message
      let message = `Hello Terrace Studio,

I would like to enquire about availability.

Check-in Date: ${formatDate(checkin)}
Check-out Date: ${formatDate(checkout)}

Name: ${name}
Phone: ${phone}
Guests: ${guests}

Special Request:
${specialRequest}

Please contact me regarding availability and booking.`;

      if (phoneCall) {
        message += `\n\nI would appreciate a phone call regarding this booking inquiry.`;
      }

      message += `\n\nThank you.`;

      // Open WhatsApp
      const waUrl = `https://wa.me/919791150471?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    });
  }

  /* ----------------------------------------------------------
     7. BACK TO TOP BUTTON
  ---------------------------------------------------------- */

  const backToTop = $('.back-to-top');

  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle('visible', window.scrollY > 500);
    };

    window.addEventListener('scroll', rafThrottle(toggleBackToTop), {
      passive: true,
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initial check
    toggleBackToTop();
  }

  /* ----------------------------------------------------------
     8. PARALLAX EFFECT (desktop only)
  ---------------------------------------------------------- */

  const parallaxElements = $$('.parallax-bg');

  if (parallaxElements.length && window.innerWidth > 768) {
    const handleParallax = () => {
      const scrollY = window.scrollY;
      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0.5;
        const rect = el.getBoundingClientRect();
        // Only apply when element is near the viewport
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
          const yOffset = -(scrollY * speed);
          el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
        }
      });
    };

    window.addEventListener('scroll', rafThrottle(handleParallax), {
      passive: true,
    });
  }

  /* ----------------------------------------------------------
     9. COUNTER ANIMATION
  ---------------------------------------------------------- */

  const counters = $$('.counter');

  if (counters.length) {
    const COUNTER_DURATION = 2000; // ms

    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / COUNTER_DURATION, 1);
        // Ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(eased * target);

        el.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString();
        }
      };

      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => counterObserver.observe(c));
  }

  /* ----------------------------------------------------------
     10. LAZY LOADING ENHANCEMENT
  ---------------------------------------------------------- */

  const lazyImages = $$('img.lazy[data-src]');

  if (lazyImages.length) {
    const lazyObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;

            img.src = src;
            img.addEventListener(
              'load',
              () => {
                img.classList.add('loaded');
                img.removeAttribute('data-src');
              },
              { once: true }
            );

            img.addEventListener(
              'error',
              () => {
                console.warn(`[LazyLoad] Failed to load: ${src}`);
              },
              { once: true }
            );

            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '200px 0px' } // preload 200px before entering viewport
    );

    lazyImages.forEach((img) => lazyObserver.observe(img));
  }

  /* ----------------------------------------------------------
     11. DATE PICKER ENHANCEMENT
  ---------------------------------------------------------- */

  const checkinInput = $('#checkin-date');
  const checkoutInput = $('#checkout-date');

  if (checkinInput && checkoutInput) {
    // Helper: format a Date to YYYY-MM-DD (local)
    const toDateStr = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    // Set minimum check-in to today
    const today = new Date();
    checkinInput.min = toDateStr(today);

    // Set minimum check-out to tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    checkoutInput.min = toDateStr(tomorrow);

    // When check-in changes, update check-out minimum
    checkinInput.addEventListener('change', () => {
      const checkinDate = new Date(checkinInput.value);
      if (!isNaN(checkinDate)) {
        const minCheckout = new Date(checkinDate);
        minCheckout.setDate(minCheckout.getDate() + 1);
        checkoutInput.min = toDateStr(minCheckout);

        // If current checkout is before new min, reset it
        if (checkoutInput.value && new Date(checkoutInput.value) <= checkinDate) {
          checkoutInput.value = '';
        }

        // Auto-focus checkout
        checkoutInput.focus();
      }
    });
  }

  /* ----------------------------------------------------------
     12. PERFORMANCE — GLOBAL SCROLL HANDLER (debounced)
     Already handled above with rafThrottle and passive listeners.
     This section ties in any remaining scroll-dependent checks.
  ---------------------------------------------------------- */

  // Combined scroll handler (debounced) for non-critical tasks
  const onScrollDebounced = debounce(() => {
    // Placeholder for any additional debounced scroll logic
  }, 150);

  window.addEventListener('scroll', onScrollDebounced, { passive: true });

  /* ----------------------------------------------------------
     13. INITIALISATION COMPLETE — LOG
  ---------------------------------------------------------- */

  console.log(
    '%c✦ Terrace Studio %c— website initialised',
    'color:#c8a86e;font-weight:700;font-size:14px',
    'color:#888;font-size:12px'
  );
});
