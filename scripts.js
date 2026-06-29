/**
 * Tirenify Pitch — Redesigned Interactive Experience
 * Three-beat loader, scroll animations, mouse parallax, number counting
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    
    const CONFIG = {
        loaderPhrases: ['Zero capital.', 'One mission.'],
        loaderBeatDuration: 900,
        loaderFadeDuration: 400,
        intersectionThreshold: 0.12,
        scrollThreshold: 50,
        smoothScrollOffset: 80,
        parallaxIntensity: 0.02,
        panelParallaxIntensity: -0.015,
        lerpFactor: 0.08,
        numberCountDuration: 1200,
    };

    // ============================================
    // DOM ELEMENTS CACHE
    // ============================================
    
    const elements = {
        loader: null,
        loaderText: null,
        mainContent: null,
        body: null,
        navbar: null,
        navbarToggle: null,
        navbarOverlay: null,
        revealElements: null,
        heroSection: null,
        heroAmbients: null,
        heroPanel: null,
        statValues: null,
        roadmapLine: null,
    };

    // ============================================
    // STATE
    // ============================================
    
    let scrollY = 0;
    let loaderComplete = false;
    let mobileMenuOpen = false;
    let mouseX = 0, mouseY = 0;
    let currentParallaxX = 0, currentParallaxY = 0;
    let targetParallaxX = 0, targetParallaxY = 0;
    let panelParallaxX = 0, panelParallaxY = 0;
    let targetPanelParallaxX = 0, targetPanelParallaxY = 0;
    let parallaxEnabled = false;
    let animationFrameId = null;

    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        cacheElements();
        handleLoader();
        setupEventListeners();
        setupScrollAnimations();
        setupSmoothScroll();
        setupParallax();
        setupNumberCounting();
    }

    function cacheElements() {
        elements.loader = document.getElementById('loader');
        elements.loaderText = document.getElementById('loader-text');
        elements.mainContent = document.getElementById('main-content');
        elements.body = document.body;
        elements.navbar = document.getElementById('navbar');
        elements.navbarToggle = document.getElementById('navbar-toggle');
        elements.navbarOverlay = document.getElementById('navbar-overlay');
        elements.revealElements = document.querySelectorAll('.reveal');
        elements.heroSection = document.getElementById('hero');
        elements.heroAmbients = document.querySelectorAll('.hero-ambient');
        elements.heroPanel = document.querySelector('.hero-panel');
        elements.statValues = document.querySelectorAll('.stat-value');
    }

    // ============================================
    // LOADER — Three-Beat Sequence
    // ============================================
    
    function handleLoader() {
        if (!elements.loader || !elements.loaderText) {
            showContent();
            return;
        }

        let phraseIndex = 0;

        function showPhrase() {
            if (phraseIndex >= CONFIG.loaderPhrases.length) {
                setTimeout(() => {
                    elements.loaderText.style.opacity = '0';
                    setTimeout(showContent, CONFIG.loaderFadeDuration);
                }, CONFIG.loaderBeatDuration);
                return;
            }

            elements.loaderText.textContent = CONFIG.loaderPhrases[phraseIndex];
            elements.loaderText.style.opacity = '1';

            setTimeout(() => {
                elements.loaderText.style.opacity = '0';
            }, CONFIG.loaderBeatDuration - CONFIG.loaderFadeDuration);

            phraseIndex++;
            setTimeout(showPhrase, CONFIG.loaderBeatDuration);
        }

        setTimeout(showPhrase, 1000);
    }

    function showContent() {
        if (elements.loader) {
            elements.loader.classList.add('hidden');
        }
        
        elements.body.classList.remove('hidden');
        elements.body.classList.add('loaded');
        loaderComplete = true;

        setTimeout(() => {
            const heroReveals = document.querySelectorAll('.hero-section .reveal');
            heroReveals.forEach(el => el.classList.add('visible'));
        }, 200);
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    function setupEventListeners() {
        window.addEventListener('scroll', onScroll, { passive: true });
        
        if (elements.navbarToggle && elements.navbarOverlay) {
            elements.navbarToggle.addEventListener('click', toggleMobileMenu);
            
            const overlayLinks = elements.navbarOverlay.querySelectorAll('.overlay-link');
            overlayLinks.forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenuOpen) {
                closeMobileMenu();
            }
        });

        updateNavbar();
    }

    function onScroll() {
        scrollY = window.pageYOffset;
        updateNavbar();
    }

    function updateNavbar() {
        if (!elements.navbar) return;
        
        if (scrollY > CONFIG.scrollThreshold) {
            elements.navbar.classList.add('scrolled');
        } else {
            elements.navbar.classList.remove('scrolled');
        }
    }

    // ============================================
    // MOBILE NAVIGATION
    // ============================================
    
    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
        
        if (mobileMenuOpen) {
            elements.navbarOverlay.classList.add('active');
            elements.body.classList.add('menu-open');
            
            const spans = elements.navbarToggle.querySelectorAll('span');
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            closeMobileMenu();
        }
    }

    function closeMobileMenu() {
        mobileMenuOpen = false;
        elements.navbarOverlay.classList.remove('active');
        elements.body.classList.remove('menu-open');
        
        const spans = elements.navbarToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    
    function setupScrollAnimations() {
        if (!('IntersectionObserver' in window)) {
            elements.revealElements.forEach(el => el.classList.add('visible'));
            return;
        }
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            elements.revealElements.forEach(el => {
                el.classList.add('visible');
                el.style.transition = 'none';
            });
            return;
        }
        
        const revealObserver = new IntersectionObserver(
            handleRevealIntersection,
            {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: CONFIG.intersectionThreshold,
            }
        );
        
        elements.revealElements.forEach((el, index) => {
            const parent = el.parentElement;
            const siblings = parent.querySelectorAll('.reveal');
            const siblingIndex = Array.from(siblings).indexOf(el);
            
            if (siblingIndex > 0) {
                el.style.transitionDelay = `${siblingIndex * 80}ms`;
            }
            
            revealObserver.observe(el);
        });

        // Also observe section labels and headlines
        const sectionElements = document.querySelectorAll('.section-label, .section-headline, .section-quote');
        sectionElements.forEach(el => {
            el.classList.add('reveal');
            revealObserver.observe(el);
        });
    }

    function handleRevealIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }

    // ============================================
    // NUMBER COUNTING ANIMATION
    // ============================================
    
    function setupNumberCounting() {
        if (!('IntersectionObserver' in window)) return;
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const numberObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        const text = target.textContent;
                        
                        // Extract the numeric value
                        const match = text.match(/^(\d+)/);
                        if (match) {
                            const targetValue = parseInt(match[1], 10);
                            const suffix = text.replace(match[1], '');
                            animateNumber(target, 0, targetValue, suffix, CONFIG.numberCountDuration);
                        }
                        
                        numberObserver.unobserve(target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        elements.statValues.forEach(stat => {
            numberObserver.observe(stat);
        });
    }

    function animateNumber(element, start, end, suffix, duration) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // ============================================
    // MOUSE PARALLAX (Hero only)
    // ============================================
    
    function setupParallax() {
        if (!elements.heroSection) return;
        
        // Check for touch device
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            return; // Disable parallax on touch devices
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        parallaxEnabled = true;

        elements.heroSection.addEventListener('mousemove', handleMouseMove);
        
        function parallaxLoop() {
            if (parallaxEnabled) {
                updateParallax();
            }
            animationFrameId = requestAnimationFrame(parallaxLoop);
        }
        
        parallaxLoop();
    }

    function handleMouseMove(e) {
        const rect = elements.heroSection.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate offset from center (-1 to 1)
        const offsetX = (e.clientX - centerX) / (rect.width / 2);
        const offsetY = (e.clientY - centerY) / (rect.height / 2);
        
        // Set target values
        targetParallaxX = offsetX * CONFIG.parallaxIntensity * rect.width;
        targetParallaxY = offsetY * CONFIG.parallaxIntensity * rect.height;
        
        targetPanelParallaxX = offsetX * CONFIG.panelParallaxIntensity * rect.width;
        targetPanelParallaxY = offsetY * CONFIG.panelParallaxIntensity * rect.height;
    }

    function updateParallax() {
        // Lerp current values toward target
        currentParallaxX += (targetParallaxX - currentParallaxX) * CONFIG.lerpFactor;
        currentParallaxY += (targetParallaxY - currentParallaxY) * CONFIG.lerpFactor;
        panelParallaxX += (targetPanelParallaxX - panelParallaxX) * CONFIG.lerpFactor;
        panelParallaxY += (targetPanelParallaxY - panelParallaxY) * CONFIG.lerpFactor;
        
        // Apply transforms to ambient backgrounds (move with mouse)
        elements.heroAmbients.forEach(ambient => {
            ambient.style.transform = `translate(${currentParallaxX}px, ${currentParallaxY}px)`;
        });
        
        // Apply transform to hero panel (move opposite to mouse)
        if (elements.heroPanel) {
            elements.heroPanel.style.transform = `translate(${panelParallaxX}px, ${panelParallaxY}px)`;
        }
    }

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (!target) return;
                
                e.preventDefault();
                
                const headerOffset = CONFIG.smoothScrollOffset;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }

    // ============================================
    // ACTIVE NAV LINK HIGHLIGHTING
    // ============================================
    
    function setupActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar-link');
        
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);
        
        sections.forEach(section => observer.observe(section));
    }

    // ============================================
    // INITIALIZE
    // ============================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Setup active nav links after init
    document.addEventListener('DOMContentLoaded', setupActiveNavLink);

    // ============================================
    // PUBLIC API (for debugging)
    // ============================================
    
    window.TirenifyPitch = {
        replayLoader: function() {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.classList.remove('hidden');
                handleLoader();
            }
        },
        
        reveal: function(selector) {
            const el = document.querySelector(selector);
            if (el) {
                el.classList.add('visible');
            }
        },
        
        getScrollProgress: function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        },
        
        enableParallax: function() {
            parallaxEnabled = true;
        },
        
        disableParallax: function() {
            parallaxEnabled = false;
        }
    };

})();