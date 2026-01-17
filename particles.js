/**
 * Interactive Particle Animation
 * Particles that react to mouse movement
 */
(function() {
    'use strict';

    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: null, y: null, radius: 150 };
    var animationId;

    // Particle settings
    var settings = {
        particleCount: 80,
        particleSize: { min: 1, max: 3 },
        particleSpeed: 0.3,
        lineDistance: 120,
        mouseRadius: 150,
        colors: {
            particle: 'rgba(255, 255, 255, 0.6)',
            line: 'rgba(255, 255, 255, 0.1)',
            mouseParticle: 'rgba(6, 182, 212, 0.8)'
        }
    };

    // Resize canvas to fill header
    function resizeCanvas() {
        var header = document.getElementById('header');
        if (header) {
            canvas.width = header.offsetWidth;
            canvas.height = header.offsetHeight;
        }
    }

    // Particle class
    function Particle(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.size = Math.random() * (settings.particleSize.max - settings.particleSize.min) + settings.particleSize.min;
        this.baseSize = this.size;
        this.speedX = (Math.random() - 0.5) * settings.particleSpeed;
        this.speedY = (Math.random() - 0.5) * settings.particleSpeed;
        this.density = Math.random() * 30 + 1;
    }

    Particle.prototype.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = settings.colors.particle;
        ctx.fill();
    };

    Particle.prototype.update = function() {
        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
            var dx = mouse.x - this.x;
            var dy = mouse.y - this.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                // Push particles away from mouse
                var forceDirectionX = dx / distance;
                var forceDirectionY = dy / distance;
                var force = (mouse.radius - distance) / mouse.radius;

                this.x -= forceDirectionX * force * this.density * 0.5;
                this.y -= forceDirectionY * force * this.density * 0.5;

                // Grow particle near mouse
                this.size = this.baseSize + (force * 2);
            } else {
                // Return to base size
                if (this.size > this.baseSize) {
                    this.size -= 0.1;
                }
            }
        }

        // Normal movement
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        this.draw();
    };

    // Initialize particles
    function initParticles() {
        particles = [];
        var count = settings.particleCount;

        // Reduce particles on mobile for performance
        if (window.innerWidth < 768) {
            count = Math.floor(count * 0.5);
        }

        for (var i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    // Draw connecting lines between nearby particles
    function connectParticles() {
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < settings.lineDistance) {
                    var opacity = 1 - (distance / settings.lineDistance);
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 255, 255, ' + (opacity * 0.15) + ')';
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Draw lines from mouse to nearby particles
    function connectToMouse() {
        if (mouse.x === null || mouse.y === null) return;

        for (var i = 0; i < particles.length; i++) {
            var dx = mouse.x - particles[i].x;
            var dy = mouse.y - particles[i].y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                var opacity = 1 - (distance / mouse.radius);
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(6, 182, 212, ' + (opacity * 0.4) + ')';
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
        }

        connectParticles();
        connectToMouse();

        animationId = requestAnimationFrame(animate);
    }

    // Mouse event handlers
    function handleMouseMove(e) {
        var header = document.getElementById('header');
        if (!header) return;

        var rect = header.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    }

    function handleMouseLeave() {
        mouse.x = null;
        mouse.y = null;
    }

    // Touch support
    function handleTouchMove(e) {
        if (e.touches.length > 0) {
            var header = document.getElementById('header');
            if (!header) return;

            var rect = header.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
        }
    }

    function handleTouchEnd() {
        mouse.x = null;
        mouse.y = null;
    }

    // Visibility change handler (pause when tab not visible)
    function handleVisibilityChange() {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    }

    // Initialize
    function init() {
        resizeCanvas();
        initParticles();
        animate();

        // Event listeners
        var header = document.getElementById('header');
        if (header) {
            header.addEventListener('mousemove', handleMouseMove);
            header.addEventListener('mouseleave', handleMouseLeave);
            header.addEventListener('touchmove', handleTouchMove);
            header.addEventListener('touchend', handleTouchEnd);
        }

        window.addEventListener('resize', function() {
            resizeCanvas();
            initParticles();
        });

        document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
