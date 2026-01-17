/**
 * Custom Smooth Scroll
 * Smoothly scrolls to anchor links on the page
 */
(function() {
    'use strict';

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
            scrollTo(targetPosition, 500);

            // Update URL hash
            if (history.pushState) {
                history.pushState(null, null, hash);
            }
        }

        // Add click event listener
        document.addEventListener('click', handleClick, false);
    }

    // Expose to global scope
    window.SmoothScroll = SmoothScroll;
})();
