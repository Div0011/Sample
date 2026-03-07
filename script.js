document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initial loader (remove body loading class)
    document.body.classList.remove('loading');

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileClose = document.querySelector('.mobile-close');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    let menuOpen = false;

    function openMenu() {
        menuOpen = true;
        mobileMenu.classList.add('open');
        menuToggle.children[0].style.transform = 'translateY(4px) rotate(45deg)';
        menuToggle.children[1].style.transform = 'translateY(-4px) rotate(-45deg)';
    }

    function closeMenu() {
        menuOpen = false;
        mobileMenu.classList.remove('open');
        menuToggle.children[0].style.transform = 'none';
        menuToggle.children[1].style.transform = 'none';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (menuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (mobileClose) {
        mobileClose.addEventListener('click', closeMenu);
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // GSAP Intro Animations
    const tlIntro = gsap.timeline();

    tlIntro.from(".nav-brand", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" })
        .from(".nav-links a", { y: -20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }, "-=0.6")
        .from(".nav-actions", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
        .from(".line", { y: 100, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power4.out" }, "-=0.5")
        .from(".hero-desc", { y: 20, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.8")
        .from(".btn-primary", { y: 20, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.8")
        .from(".btn-secondary", { y: 20, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.8")
        .from(".hero-image", { scale: 0.9, opacity: 0, duration: 1.5, ease: "power3.out" }, "-=1.2");

    // Image Parallax Effect
    gsap.utils.toArray('.hero-image img, .phil-image img, .craft-img-large img, .product-image-wrapper img').forEach(img => {
        gsap.to(img, {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // Reveal Text on scroll
    const revealElements = gsap.utils.toArray('.phil-heading, .sec-taste-profile h2, .col-title, .craft-content h2');
    revealElements.forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // Product cards stagger reveal
    gsap.from('.product-item', {
        scrollTrigger: {
            trigger: '.sec-collection',
            start: 'top 70%'
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out'
    });

    // Ingredients list stagger
    gsap.from('.ing-item', {
        scrollTrigger: {
            trigger: '.ingredients-list',
            start: 'top 80%'
        },
        x: -40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
    });

    // Custom Cursor Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (cursorDot && cursorRing && matchMedia('(pointer: fine)').matches) {
        // Track mouse movement
        window.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;

            // Adding slight delay/spring to the ring via GSAP
            gsap.to(cursorRing, {
                x: mouseX,
                y: mouseY,
                duration: 0.15,
                ease: 'power2.out'
            });
        });

        // Hover states
        const interactiveLinks = document.querySelectorAll('a, button');
        interactiveLinks.forEach(link => {
            link.addEventListener('mouseenter', () => document.body.classList.add('hovering-link'));
            link.addEventListener('mouseleave', () => document.body.classList.remove('hovering-link'));
        });

        const interactiveImages = document.querySelectorAll('.interactive-img, .product-image-wrapper');
        interactiveImages.forEach(img => {
            img.addEventListener('mouseenter', () => document.body.classList.add('hovering-img'));
            img.addEventListener('mouseleave', () => document.body.classList.remove('hovering-img'));
        });
    }

});
