/**
 * Custom Smooth Scroll & Scroll Animations
 * Smoothly scrolls to anchor links and animates elements on scroll
 */
(function() {
    'use strict';

    // ============================================
    // SMOOTH SCROLL FUNCTIONALITY
    // ============================================
    function SmoothScroll(selector) {
        // Easing function for smooth animation
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        // Animate scroll to target position
        function scrollTo(targetPosition, duration) {
            var startPosition = window.pageYOffset;
            var distance = targetPosition - startPosition;
            var startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                var elapsed = currentTime - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var easing = easeInOutCubic(progress);

                window.scrollTo(0, startPosition + distance * easing);

                if (elapsed < duration) {
                    requestAnimationFrame(animation);
                }
            }

            requestAnimationFrame(animation);
        }

        // Get element's position from top of document
        function getElementPosition(element) {
            var position = 0;
            while (element) {
                position += element.offsetTop;
                element = element.offsetParent;
            }
            return position;
        }

        // Handle click events on anchor links
        function handleClick(event) {
            var link = event.target.closest(selector);
            if (!link || link.tagName.toLowerCase() !== 'a') return;

            var href = link.getAttribute('href');
            if (!href || href.indexOf('#') === -1) return;

            var hash = href.substring(href.indexOf('#'));
            if (!hash || hash === '#') return;

            var target;
            if (hash === '#top') {
                target = document.documentElement;
            } else {
                target = document.querySelector(hash);
            }

            if (!target) return;

            event.preventDefault();

            var targetPosition = hash === '#top' ? 0 : getElementPosition(target);
            scrollTo(targetPosition, 600);

            // Update URL hash
            if (history.pushState) {
                history.pushState(null, null, hash);
            }
        }

        // Add click event listener
        document.addEventListener('click', handleClick, false);
    }

    // ============================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // ============================================
    function initScrollAnimations() {
        var animatedElements = document.querySelectorAll('.scroll-animate');

        if (!animatedElements.length) return;

        var observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: Stop observing after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(function(element) {
            observer.observe(element);
        });
    }

    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    function initNavbarEffect() {
        var navbar = document.querySelector('.navbar');
        var lastScrollY = window.scrollY;

        if (!navbar) return;

        function updateNavbar() {
            var currentScrollY = window.scrollY;

            if (currentScrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.85)';
                navbar.style.boxShadow = 'none';
            }

            lastScrollY = currentScrollY;
        }

        // Throttle scroll events for performance
        var ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateNavbar();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ============================================
    // INITIALIZE ON DOM READY
    // ============================================
    function init() {
        initScrollAnimations();
        initNavbarEffect();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose SmoothScroll to global scope
    window.SmoothScroll = SmoothScroll;
})();
