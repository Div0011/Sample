/* ═══════════════════════════════════════════════════
   VIRASAT CHAI — INTERACTIVE ENGINE v2.0
   GSAP + ScrollTrigger + Custom Animations
   ═══════════════════════════════════════════════════ */

(function () {
    "use strict";

    /* ── REGISTER PLUGINS ── */
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    /* ── DOM CACHE ── */
    const $ = (s, p = document) => p.querySelector(s);
    const $$ = (s, p = document) => [...p.querySelectorAll(s)];

    const preloader      = $("#preloader");
    const preloaderFill   = $(".preloader-fill");
    const scrollProgress  = $(".scroll-progress");
    const navbar          = $("#navbar");
    const navMenuToggle   = $("#navMenuToggle");
    const navSidebar      = $("#navSidebar");
    const navSidebarOverlay = $("#navSidebarOverlay");
    const cartBtn         = $("#cartBtn");
    const cartCount       = $("#cartCount");
    const cartDrawer      = $("#cartDrawer");
    const cartOverlay     = $("#cartOverlay");
    const cartClose       = $("#cartClose");
    const cartItems       = $("#cartItems");
    const cartFooter      = $("#cartFooter");
    const cartTotalEl     = $("#cartTotal");
    const quickViewModal  = $("#quickViewModal");
    const quickViewOverlay= $("#quickViewOverlay");
    const modalClose      = $("#modalClose");
    const cursorDot       = $(".cursor-dot");
    const cursorRing      = $(".cursor-ring");
    const cursorText      = $(".cursor-text");
    const particleCanvas  = $("#particles");
    const particleCtx     = particleCanvas.getContext("2d");

    /* ══════════════════════════════
       PRELOADER
       ══════════════════════════════ */
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += Math.random() * 15 + 5;
        if (loadProgress >= 100) {
            loadProgress = 100;
            clearInterval(loadInterval);
            setTimeout(() => {
                preloader.classList.add("done");
                initAnimations();
            }, 400);
        }
        preloaderFill.style.width = loadProgress + "%";
    }, 120);

    /* ══════════════════════════════
       SCROLL PROGRESS BAR
       ══════════════════════════════ */
    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = progress + "%";
    }, { passive: true });

    /* ══════════════════════════════
       NAVBAR — HIDE ON HERO, SHOW AFTER
       ══════════════════════════════ */
    const heroSection = $(".sec-hero");
    if (heroSection) {
        ScrollTrigger.create({
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            onEnter: () => { navbar.classList.add("navbar-hidden"); navbar.classList.remove("navbar-visible"); document.body.classList.add("on-hero"); },
            onLeave: () => { navbar.classList.remove("navbar-hidden"); navbar.classList.add("navbar-visible"); document.body.classList.remove("on-hero"); },
            onEnterBack: () => { navbar.classList.add("navbar-hidden"); navbar.classList.remove("navbar-visible"); document.body.classList.add("on-hero"); },
            onLeaveBack: () => { navbar.classList.remove("navbar-hidden"); navbar.classList.add("navbar-visible"); document.body.classList.remove("on-hero"); },
        });
    }

    /* ══════════════════════════════
       KINETIC VIRASAT TEXT ROWS
       Slanting text moves in alternating
       directions on scroll
       ══════════════════════════════ */
    /* ══════════════════════════════
       SIDEBAR MENU
       ══════════════════════════════ */
    function toggleSidebar() {
        const isOpen = navSidebar.classList.contains("open");
        navSidebar.classList.toggle("open");
        navMenuToggle.classList.toggle("active");
        if (navSidebarOverlay) navSidebarOverlay.classList.toggle("open");
        document.body.style.overflow = isOpen ? "" : "hidden";
    }
    navMenuToggle.addEventListener("click", toggleSidebar);
    if (navSidebarOverlay) navSidebarOverlay.addEventListener("click", toggleSidebar);
    $$(".nav-sidebar-links .nav-link").forEach(link => {
        link.addEventListener("click", () => {
            if (navSidebar.classList.contains("open")) toggleSidebar();
        });
    });

    /* Scroll blur effect moved to animations.js (Lenis velocity-based) */

    /* ══════════════════════════════
       SIDE NAV DOTS
       ══════════════════════════════ */
    const sideDots = $$(".side-dot");
    const sections = ["hero","cinematic","about","process","gallery","shop","ingredients","testimonials","faq","contact"];

    sideDots.forEach(dot => {
        dot.addEventListener("click", () => {
            const target = dot.dataset.target;
            const el = document.getElementById(target);
            if (el) gsap.to(window, { scrollTo: { y: el, offsetY: 80 }, duration: 1.2, ease: "power3.inOut" });
        });
    });

    /* Highlight active dot on scroll */
    sections.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
            trigger: el,
            start: "top center",
            end: "bottom center",
            onEnter: () => setActiveDot(i),
            onEnterBack: () => setActiveDot(i),
        });
    });

    function setActiveDot(index) {
        sideDots.forEach((d, i) => d.classList.toggle("active", i === index));
    }

    /* ══════════════════════════════
       NAV LINK SMOOTH SCROLL
       ══════════════════════════════ */
    $$('a[href^="#"]').forEach(link => {
        link.addEventListener("click", e => {
            const target = document.getElementById(link.getAttribute("href").slice(1));
            if (target) {
                e.preventDefault();
                gsap.to(window, { scrollTo: { y: target, offsetY: 80 }, duration: 1.2, ease: "power3.inOut" });
            }
        });
    });

    /* ══════════════════════════════
       CART SYSTEM
       ══════════════════════════════ */
    let cart = [];

    function openCart() {
        cartDrawer.classList.add("open");
        cartOverlay.classList.add("open");
        document.body.style.overflow = "hidden";
    }
    function closeCart() {
        cartDrawer.classList.remove("open");
        cartOverlay.classList.remove("open");
        document.body.style.overflow = "";
    }
    cartBtn.addEventListener("click", openCart);
    cartClose.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);

    function addToCart(name, price, img) {
        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ name, price: Number(price), img, qty: 1 });
        }
        renderCart();
        openCart();
        /* Bounce the count badge */
        cartCount.classList.add("show");
        gsap.fromTo(cartCount, { scale: 1.5 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" });
    }

    function renderCart() {
        const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
        const totalQty = cart.reduce((s, i) => s + i.qty, 0);
        cartCount.textContent = totalQty;
        cartCount.classList.toggle("show", totalQty > 0);
        cartTotalEl.textContent = "\u20B9" + total.toLocaleString("en-IN");
        cartFooter.style.display = cart.length ? "block" : "none";

        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="cart-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>Your cart is empty</p><span>Add some heritage chai to get started</span></div>';
            return;
        }

        cartItems.innerHTML = cart.map((item, idx) => {
            const sanitizedName = item.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return '<div class="cart-item">' +
                '<div class="cart-item-img"><img src="' + encodeURI(item.img) + '" alt=""></div>' +
                '<div class="cart-item-details"><h4>' + sanitizedName + '</h4>' +
                '<span class="cart-item-price">\u20B9' + item.price + '</span>' +
                '<div class="cart-item-qty">' +
                '<button onclick="window._cartMinus(' + idx + ')">-</button>' +
                '<span>' + item.qty + '</span>' +
                '<button onclick="window._cartPlus(' + idx + ')">+</button>' +
                '</div></div>' +
                '<button class="cart-item-remove" onclick="window._cartRemove(' + idx + ')">&times;</button></div>';
        }).join("");
    }

    window._cartMinus = idx => { if (cart[idx].qty > 1) cart[idx].qty--; else cart.splice(idx, 1); renderCart(); };
    window._cartPlus  = idx => { cart[idx].qty++; renderCart(); };
    window._cartRemove = idx => { cart.splice(idx, 1); renderCart(); };

    /* Add to Cart buttons on product cards */
    $$(".btn-add-cart").forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const card = btn.closest(".product-card");
            addToCart(card.dataset.name, card.dataset.price, card.dataset.img);
        });
    });

    /* ══════════════════════════════
       QUICK VIEW MODAL
       ══════════════════════════════ */
    let modalQty = 1;
    let modalData = {};

    function openQuickView(card) {
        modalData = { ...card.dataset };
        modalQty = 1;
        $("#modalImg").src = modalData.img;
        $("#modalTitle").textContent = modalData.name;
        $("#modalDesc").textContent = modalData.desc;
        $("#modalOrigin").textContent = modalData.origin;
        $("#modalStrength").style.width = modalData.strength + "%";
        $("#modalBrew").textContent = modalData.brew;
        $("#modalTemp").textContent = modalData.temp;
        $("#modalPrice").textContent = "\u20B9" + modalData.price;
        $(".qty-value", quickViewModal).textContent = "1";

        const cat = modalData.category;
        $("#modalTag").textContent = cat === "limited" ? "Limited Edition" : cat === "spiced" ? "Spiced Collection" : "Classic Collection";

        quickViewModal.classList.add("open");
        quickViewOverlay.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeQuickView() {
        quickViewModal.classList.remove("open");
        quickViewOverlay.classList.remove("open");
        document.body.style.overflow = "";
    }

    $$(".btn-quick-view").forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            openQuickView(btn.closest(".product-card"));
        });
    });

    modalClose.addEventListener("click", closeQuickView);
    quickViewOverlay.addEventListener("click", closeQuickView);

    $(".qty-minus", quickViewModal).addEventListener("click", () => {
        if (modalQty > 1) modalQty--;
        $(".qty-value", quickViewModal).textContent = modalQty;
    });
    $(".qty-plus", quickViewModal).addEventListener("click", () => {
        modalQty++;
        $(".qty-value", quickViewModal).textContent = modalQty;
    });
    $("#modalAddCart").addEventListener("click", () => {
        for (let i = 0; i < modalQty; i++) addToCart(modalData.name, modalData.price, modalData.img);
        closeQuickView();
    });

    /* ══════════════════════════════
       PRODUCT FILTERS
       ══════════════════════════════ */
    $$(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            $$(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const filter = btn.dataset.filter;
            $$(".product-card").forEach(card => {
                const show = filter === "all" || card.dataset.category === filter;
                card.classList.toggle("hidden", !show);
                if (show) gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
            });
        });
    });

    /* ══════════════════════════════
       INGREDIENTS TABS (3D FLIP)
       ══════════════════════════════ */
    $$(".ing-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            const currentActive = $(".ing-panel.active");
            const target = tab.dataset.ing;
            const nextPanel = $('[data-panel="' + target + '"]');

            /* Skip if already active */
            if (currentActive && currentActive.dataset.panel === target) return;

            $$(".ing-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            if (currentActive) {
                /* Flip out current, flip in next */
                currentActive.classList.remove("active");
                currentActive.classList.add("flip-out");
                setTimeout(() => {
                    currentActive.classList.remove("flip-out");
                    if (nextPanel) nextPanel.classList.add("active");
                }, 300);
            } else {
                if (nextPanel) nextPanel.classList.add("active");
            }
        });
    });

    /* ══════════════════════════════
       FAQ ACCORDION
       ══════════════════════════════ */
    $$(".faq-question").forEach(btn => {
        btn.addEventListener("click", () => {
            const item = btn.closest(".faq-item");
            const isOpen = item.classList.contains("open");
            /* Close all */
            $$(".faq-item").forEach(i => i.classList.remove("open"));
            /* Toggle current */
            if (!isOpen) item.classList.add("open");
        });
    });

    /* ══════════════════════════════
       TESTIMONIALS SLIDER
       ══════════════════════════════ */
    const testTrack = $("#testimonialTrack");
    const testCards = $$(".testimonial-card");
    const testDotsContainer = $("#testDots");
    let testIndex = 0;
    let testPerView = 3;

    function getTestPerView() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    function initTestDots() {
        testPerView = getTestPerView();
        const totalPages = Math.ceil(testCards.length / testPerView);
        testDotsContainer.innerHTML = "";
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement("button");
            dot.className = "test-dot" + (i === 0 ? " active" : "");
            dot.addEventListener("click", () => goToTest(i));
            testDotsContainer.appendChild(dot);
        }
    }

    function goToTest(index) {
        testPerView = getTestPerView();
        const maxIndex = Math.max(0, testCards.length - testPerView);
        testIndex = Math.min(index * testPerView, maxIndex);
        const cardWidth = testCards[0].offsetWidth + 24; /* gap */
        gsap.to(testTrack, {
            x: -testIndex * cardWidth,
            duration: 0.6,
            ease: "power3.out",
        });
        $$(".test-dot").forEach((d, i) => d.classList.toggle("active", i === Math.floor(testIndex / testPerView)));
    }

    $(".test-prev").addEventListener("click", () => {
        const page = Math.floor(testIndex / testPerView);
        goToTest(Math.max(0, page - 1));
    });
    $(".test-next").addEventListener("click", () => {
        const page = Math.floor(testIndex / testPerView);
        const totalPages = Math.ceil(testCards.length / testPerView);
        goToTest(Math.min(totalPages - 1, page + 1));
    });

    initTestDots();
    window.addEventListener("resize", initTestDots);

    /* Touch swipe for testimonials */
    (function () {
        let startX = 0, startY = 0, isDragging = false;
        const slider = $(".testimonials-slider");
        if (!slider) return;
        slider.addEventListener("touchstart", function (e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        }, { passive: true });
        slider.addEventListener("touchend", function (e) {
            if (!isDragging) return;
            isDragging = false;
            var endX = e.changedTouches[0].clientX;
            var endY = e.changedTouches[0].clientY;
            var diffX = startX - endX;
            var diffY = Math.abs(startY - endY);
            if (Math.abs(diffX) > 40 && Math.abs(diffX) > diffY) {
                var page = Math.floor(testIndex / testPerView);
                var totalPages = Math.ceil(testCards.length / testPerView);
                if (diffX > 0) goToTest(Math.min(totalPages - 1, page + 1));
                else goToTest(Math.max(0, page - 1));
            }
        }, { passive: true });
    })();

    /* ══════════════════════════════
       NEWSLETTER FORM
       ══════════════════════════════ */
    $("#newsletterForm").addEventListener("submit", e => {
        e.preventDefault();
        const success = $("#formSuccess");
        success.classList.add("show");
        e.target.reset();
        setTimeout(() => success.classList.remove("show"), 3000);
    });

    /* ══════════════════════════════
       GSAP SCROLL ANIMATIONS
       ══════════════════════════════ */
    function initAnimations() {
        /* ── SCROLL-DRIVEN FRAME SEQUENCE ── */
        var heroCanvas = document.getElementById("heroCanvas");
        var heroScrollHint = document.getElementById("heroScrollHint");
        var heroContent = document.getElementById("heroContent");

        if (heroCanvas) {
            var ctx = heroCanvas.getContext("2d");
            var TOTAL_FRAMES = 104;
            var frames = [];
            var loadedCount = 0;
            var currentFrame = 0;

            /* Size canvas to fill the hero (DPR-aware for sharp mobile) */
            function sizeCanvas() {
                var wrap = heroCanvas.parentElement;
                var dpr = Math.min(window.devicePixelRatio || 1, 2);
                heroCanvas.width = wrap.offsetWidth * dpr;
                heroCanvas.height = wrap.offsetHeight * dpr;
                heroCanvas.style.width = wrap.offsetWidth + "px";
                heroCanvas.style.height = wrap.offsetHeight + "px";
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                drawFrame(currentFrame);
            }
            sizeCanvas();
            window.addEventListener("resize", sizeCanvas);

            /* On mobile, load every 2nd frame to save memory (52 instead of 104) */
            var isMobile = window.innerWidth <= 768;
            var frameStep = isMobile ? 2 : 1;
            for (var i = 1; i <= TOTAL_FRAMES; i += frameStep) {
                var img = new Image();
                img.src = "assets/frames/ezgif-frame-" + String(i).padStart(3, "0") + ".jpg";
                img.onload = function() {
                    loadedCount++;
                    /* Draw first frame as soon as it loads */
                    if (loadedCount === 1) drawFrame(0);
                };
                frames.push(img);
            }

            /* Draw a specific frame onto the canvas (cover-fit) */
            function drawFrame(index) {
                if (index < 0 || index >= frames.length) return;
                var img = frames[index];
                if (!img || !img.complete || !img.naturalWidth) return;
                var cw = heroCanvas.width, ch = heroCanvas.height;
                var dpr = Math.min(window.devicePixelRatio || 1, 2);
                cw = cw / dpr; ch = ch / dpr;
                var iw = img.naturalWidth, ih = img.naturalHeight;
                var scale = Math.max(cw / iw, ch / ih);
                var dw = iw * scale, dh = ih * scale;
                var dx = (cw - dw) / 2, dy = (ch - dh) / 2;
                ctx.drawImage(img, dx, dy, dw, dh);
                currentFrame = index;
            }

            /* Pin hero and map scroll to frame index */
            var actualFrameCount = frames.length;
            ScrollTrigger.create({
                trigger: ".sec-hero",
                start: "top top",
                end: isMobile ? "+=200%" : "+=300%",
                pin: true,
                pinSpacing: true,
                onUpdate: function(self) {
                    var progress = self.progress;

                    /* Map scroll progress to frame index */
                    var frameIndex = Math.min(actualFrameCount - 1, Math.floor(progress * actualFrameCount));
                    if (frameIndex !== currentFrame) {
                        drawFrame(frameIndex);
                    }

                    /* Fade out scroll hint quickly */
                    if (heroScrollHint) {
                        heroScrollHint.style.opacity = Math.max(0, 1 - progress * 5);
                    }

                    /* Show hero buttons only when frames are near the end (last 15%) */
                    if (heroContent) {
                        if (progress > 0.85) {
                            heroContent.classList.add("visible");
                        } else {
                            heroContent.classList.remove("visible");
                        }
                    }
                }
            });
        }

        /* About stat counters */
        $$(".stat-num").forEach(num => {
            const target = Number(num.dataset.count);
            gsap.to(num, {
                textContent: target,
                duration: 2,
                ease: "power2.out",
                snap: { textContent: 1 },
                scrollTrigger: { trigger: num, start: "top 80%" },
            });
        });

        /* ── CINEMATIC SCROLL REEL WITH CHAPTERS ── */
        const cinematicFrames = $$(".cinematic-frame img");
        const cinematicProgress = $("#cinematicProgress");
        const cinematicChapters = $$(".cinematic-chapter");
        const cinematicCurrent = $(".cinematic-current");
        if (cinematicFrames.length > 0) {
            /* Set first chapter active */
            if (cinematicChapters.length > 0) cinematicChapters[0].classList.add("active");

            ScrollTrigger.create({
                trigger: ".sec-cinematic",
                start: "top top",
                end: "+=300%",
                pin: true,
                scrub: 0.5,
                onUpdate: function(self) {
                    var progress = self.progress;
                    /* Update progress bar */
                    if (cinematicProgress) cinematicProgress.style.width = (progress * 100) + "%";
                    /* Cross-fade between frames */
                    var totalFrames = cinematicFrames.length;
                    var frameIndex = Math.min(Math.floor(progress * totalFrames), totalFrames - 1);
                    cinematicFrames.forEach(function(img, i) {
                        if (i === frameIndex) {
                            img.classList.add("active");
                            var frameProg = (progress * totalFrames) - frameIndex;
                            var scale = 1 + frameProg * 0.15;
                            img.style.transform = "scale(" + scale + ")";
                        } else {
                            img.classList.remove("active");
                            img.style.transform = "scale(1)";
                        }
                    });
                    /* Show matching chapter — centered in viewport */
                    cinematicChapters.forEach(function(ch, i) {
                        if (i === frameIndex) {
                            ch.classList.add("active");
                            ch.style.transform = "translate(-50%, -50%)";
                        } else {
                            ch.classList.remove("active");
                            ch.style.transform = "translate(-50%, -50%)";
                        }
                    });
                    /* Update counter */
                    if (cinematicCurrent) cinematicCurrent.textContent = "0" + (frameIndex + 1);
                }
            });
        }

        /* Section reveals */
        $$(".section-title:not(.split-text), .eyebrow, .about-body, .faq-subtitle").forEach(el => {
            gsap.from(el, {
                opacity: 0, y: 40,
                duration: 0.8, ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 85%" },
            });
        });

        /* About images */
        gsap.from(".about-img-1", {
            x: -60, opacity: 0, duration: 1,
            scrollTrigger: { trigger: ".about-grid", start: "top 70%" },
        });
        gsap.from(".about-img-2", {
            x: 60, opacity: 0, duration: 1, delay: 0.2,
            scrollTrigger: { trigger: ".about-grid", start: "top 70%" },
        });
        gsap.from(".about-stats-card", {
            y: 40, opacity: 0, duration: 0.8, delay: 0.4,
            scrollTrigger: { trigger: ".about-grid", start: "top 70%" },
        });

        /* Process horizontal scroll — starts when section hits middle */
        const processTrack = $(".process-track");
        if (processTrack) {
            const processWidth = processTrack.scrollWidth - processTrack.parentElement.offsetWidth;
            gsap.to(processTrack, {
                x: -processWidth,
                ease: "none",
                scrollTrigger: {
                    trigger: ".sec-process",
                    start: "center center",
                    end: "+=" + (processWidth + 200),
                    scrub: 1,
                    pin: true,
                }
            });
        }

        /* Gallery — fullscreen pinned slide transition */
        const gallerySlides = $$(".gallery-slide");
        if (gallerySlides.length > 1) {
            /* Pin the gallery section and cross-fade/slide images */
            const gallerySection = $(".sec-gallery");
            const slidesContainer = $(".gallery-slides");

            ScrollTrigger.create({
                trigger: gallerySection,
                start: "top top",
                end: "+=" + (gallerySlides.length * 100) + "%",
                pin: true,
                scrub: 0.5,
                onUpdate: function(self) {
                    var progress = self.progress;
                    var total = gallerySlides.length;
                    var current = Math.min(Math.floor(progress * total), total - 1);
                    var slideProg = (progress * total) - current;

                    gallerySlides.forEach(function(slide, i) {
                        if (i < current) {
                            /* Already passed */
                            slide.style.opacity = "0";
                            slide.style.transform = "translateY(-100%)";
                            slide.style.position = "absolute";
                            slide.style.inset = "0";
                        } else if (i === current) {
                            /* Current slide */
                            slide.style.opacity = "1";
                            slide.style.transform = "translateY(0)";
                            slide.style.position = "absolute";
                            slide.style.inset = "0";
                            slide.style.zIndex = "2";
                            /* Subtle zoom as scroll progresses */
                            var scale = 1 + slideProg * 0.08;
                            slide.querySelector("img").style.transform = "scale(" + scale + ")";
                        } else if (i === current + 1) {
                            /* Next slide coming up from bottom */
                            slide.style.opacity = "" + slideProg;
                            slide.style.transform = "translateY(" + ((1 - slideProg) * 100) + "%)";
                            slide.style.position = "absolute";
                            slide.style.inset = "0";
                            slide.style.zIndex = "3";
                        } else {
                            /* Far future */
                            slide.style.opacity = "0";
                            slide.style.transform = "translateY(100%)";
                            slide.style.position = "absolute";
                            slide.style.inset = "0";
                        }
                    });

                    /* Fade gallery header overlay on first slide */
                    var headerOverlay = slidesContainer.querySelector('.gallery-header-overlay');
                    if (headerOverlay) {
                        headerOverlay.style.opacity = current === 0 ? String(Math.max(0, 1 - slideProg * 2.5)) : '0';
                    }
                }
            });

            /* Initialize first slide */
            gallerySlides.forEach(function(slide, i) {
                slide.style.position = "absolute";
                slide.style.inset = "0";
                slide.style.width = "100%";
                slide.style.height = "100%";
                if (i === 0) {
                    slide.style.opacity = "1";
                    slide.style.transform = "translateY(0)";
                } else {
                    slide.style.opacity = "0";
                    slide.style.transform = "translateY(100%)";
                }
            });
            /* Make container relative for absolute children */
            slidesContainer.style.position = "relative";
            slidesContainer.style.height = "100vh";
            slidesContainer.style.overflow = "hidden";
        }

        /* Process step reveal — creative stagger from center */
        $$(".process-step").forEach((step, i) => {
            gsap.from(step, {
                scale: 0.7, opacity: 0, rotateY: -15, y: 40,
                duration: 0.8, delay: i * 0.15,
                ease: "back.out(1.4)",
                scrollTrigger: { trigger: step, start: "top 85%" }
            });
        });

        /* Image hover parallax for all section images */
        $$(".about-img img, .ing-panel-img img").forEach(img => {
            gsap.from(img, {
                scale: 1.15,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: { trigger: img, start: "top 85%", end: "top 40%", scrub: true }
            });
        });

        /* Product cards stagger */
        gsap.from(".product-card", {
            y: 60, opacity: 0, duration: 0.7,
            stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: ".products-grid", start: "top 90%", once: true },
        });

        /* Ingredient explorer reveal */
        gsap.from(".ing-explorer", {
            y: 40, opacity: 0, duration: 0.8,
            scrollTrigger: { trigger: ".ing-explorer", start: "top 80%" }
        });

        /* Testimonial cards */
        gsap.from(".testimonial-card", {
            y: 40, opacity: 0, duration: 0.6,
            stagger: 0.1,
            scrollTrigger: { trigger: ".testimonials-slider", start: "top 80%" }
        });

        /* FAQ items */
        gsap.from(".faq-item", {
            y: 30, opacity: 0, duration: 0.5,
            stagger: 0.08,
            scrollTrigger: { trigger: ".faq-right", start: "top 80%" }
        });

        /* Contact */
        gsap.from(".contact-brand", {
            scale: 0.8, opacity: 0, duration: 1,
            scrollTrigger: { trigger: ".sec-contact", start: "top 80%" }
        });
        gsap.from(".contact-col", {
            y: 30, opacity: 0, duration: 0.6, stagger: 0.1,
            scrollTrigger: { trigger: ".contact-grid", start: "top 85%" }
        });

        /* Marquee speed variation on scroll */
        gsap.to(".marquee-track", {
            x: "-=100",
            ease: "none",
            scrollTrigger: {
                trigger: ".marquee-strip",
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
            }
        });

        /* ── KINETIC VIRASAT ROWS (must run AFTER pinned sections) ── */
        ScrollTrigger.refresh();
        $$(".kinetic-row").forEach(function(row) {
            var dir = parseFloat(row.getAttribute("data-direction")) || 1;
            gsap.to(row, {
                x: dir * -800,
                ease: "none",
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.5,
                    invalidateOnRefresh: true
                }
            });
        });

        /* Hide kinetic bg during full-screen image & process sections */
        var kineticBg = $(".kinetic-bg");
        if (kineticBg) {
            /* On hero: bring kinetic in front; elsewhere: behind content */
            ScrollTrigger.create({
                trigger: ".sec-hero",
                start: "top top",
                end: "bottom top",
                onEnter: function() { kineticBg.classList.add("kinetic-front"); },
                onLeave: function() { kineticBg.classList.remove("kinetic-front"); },
                onEnterBack: function() { kineticBg.classList.add("kinetic-front"); },
                onLeaveBack: function() { kineticBg.classList.remove("kinetic-front"); },
            });
            /* Start with front class since page loads at hero */
            kineticBg.classList.add("kinetic-front");

            [".sec-cinematic", ".sec-process", ".sec-gallery"].forEach(function(sel) {
                var el = $(sel);
                if (!el) return;
                ScrollTrigger.create({
                    trigger: el,
                    start: "top 80%",
                    end: "bottom 20%",
                    onEnter: function() { gsap.to(kineticBg, { opacity: 0, duration: 0.35, overwrite: true }); },
                    onLeave: function() { gsap.to(kineticBg, { opacity: 1, duration: 0.35, overwrite: true }); },
                    onEnterBack: function() { gsap.to(kineticBg, { opacity: 0, duration: 0.35, overwrite: true }); },
                    onLeaveBack: function() { gsap.to(kineticBg, { opacity: 1, duration: 0.35, overwrite: true }); },
                });
            });
        }
    }

    /* ══════════════════════════════
       COFFEE RIPPLE CURSOR
       ══════════════════════════════ */
    if (window.matchMedia("(pointer: fine)").matches) {
        let mx = 0, my = 0, cx = 0, cy = 0, rx = 0, ry = 0;

        /* Ripple canvas for water trail effect */
        var rippleCanvas = document.getElementById("rippleCanvas");
        var rCtx = rippleCanvas ? rippleCanvas.getContext("2d") : null;
        var ripples = [];
        var lastRippleTime = 0;

        function sizeRippleCanvas() {
            if (!rippleCanvas) return;
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            rippleCanvas.width = window.innerWidth * dpr;
            rippleCanvas.height = window.innerHeight * dpr;
            rippleCanvas.style.width = window.innerWidth + "px";
            rippleCanvas.style.height = window.innerHeight + "px";
            if (rCtx) rCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        sizeRippleCanvas();
        window.addEventListener("resize", sizeRippleCanvas);

        document.addEventListener("mousemove", function(e) {
            mx = e.clientX; my = e.clientY;
            /* Drop a ripple every ~60ms as mouse moves */
            var now = Date.now();
            if (now - lastRippleTime > 60) {
                ripples.push({ x: mx, y: my, radius: 2, maxRadius: 35, opacity: 0.5, speed: 0.8 });
                lastRippleTime = now;
            }
        });

        /* Click creates a bigger burst of ripples */
        document.addEventListener("mousedown", function() {
            for (var i = 0; i < 3; i++) {
                ripples.push({
                    x: mx + (Math.random() - 0.5) * 10,
                    y: my + (Math.random() - 0.5) * 10,
                    radius: 2,
                    maxRadius: 60 + i * 15,
                    opacity: 0.6 - i * 0.1,
                    speed: 1.2 - i * 0.2
                });
            }
        });

        /* Animate ripples on canvas */
        function drawRipples() {
            if (!rCtx) { requestAnimationFrame(drawRipples); return; }
            rCtx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);

            for (var i = ripples.length - 1; i >= 0; i--) {
                var r = ripples[i];
                r.radius += r.speed;
                r.opacity -= 0.01;

                if (r.opacity <= 0 || r.radius >= r.maxRadius) {
                    ripples.splice(i, 1);
                    continue;
                }

                rCtx.beginPath();
                rCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                rCtx.strokeStyle = "rgba(92, 55, 28, " + r.opacity + ")";
                rCtx.lineWidth = 2;
                rCtx.stroke();

                /* Inner glow ring */
                rCtx.beginPath();
                rCtx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
                rCtx.strokeStyle = "rgba(160, 100, 40, " + (r.opacity * 0.7) + ")";
                rCtx.lineWidth = 1.5;
                rCtx.stroke();
            }

            /* Glow at cursor position */
            var glowGrad = rCtx.createRadialGradient(cx, cy, 0, cx, cy, 35);
            glowGrad.addColorStop(0, "rgba(92, 55, 28, 0.18)");
            glowGrad.addColorStop(0.5, "rgba(243, 193, 140, 0.08)");
            glowGrad.addColorStop(1, "rgba(243, 193, 140, 0)");
            rCtx.fillStyle = glowGrad;
            rCtx.beginPath();
            rCtx.arc(cx, cy, 35, 0, Math.PI * 2);
            rCtx.fill();

            requestAnimationFrame(drawRipples);
        }
        requestAnimationFrame(drawRipples);

        /* Cursor dot + ring position */
        function updateCursor() {
            cx += (mx - cx) * 0.25;
            cy += (my - cy) * 0.25;
            rx += (mx - rx) * 0.1;
            ry += (my - ry) * 0.1;

            cursorDot.style.left = cx + "px";
            cursorDot.style.top = cy + "px";
            cursorRing.style.left = rx + "px";
            cursorRing.style.top = ry + "px";
            cursorText.style.left = rx + "px";
            cursorText.style.top = ry + "px";
            requestAnimationFrame(updateCursor);
        }
        requestAnimationFrame(updateCursor);

        /* Hover states */
        $$(".magnetic-btn, .nav-link, .filter-btn, .ing-tab, .faq-question, .product-card, .side-dot, .btn-text-arrow, .btn-add-cart").forEach(function(el) {
            el.addEventListener("mouseenter", function() { document.body.classList.add("cursor-hover"); });
            el.addEventListener("mouseleave", function() { document.body.classList.remove("cursor-hover"); });
        });

        /* View state for galleries & product images */
        $$(".gallery-slide, .product-img-wrap").forEach(function(el) {
            el.addEventListener("mouseenter", function() { document.body.classList.add("cursor-view"); cursorText.textContent = "View"; });
            el.addEventListener("mouseleave", function() { document.body.classList.remove("cursor-view"); });
        });
    }

    /* ══════════════════════════════
       MAGNETIC BUTTONS + WAVE CLICK
       ══════════════════════════════ */
    if (window.matchMedia("(pointer: fine)").matches) {
        $$(".magnetic-btn").forEach(function(btn) {
            btn.addEventListener("mousemove", function(e) {
                var rect = btn.getBoundingClientRect();
                var dx = e.clientX - (rect.left + rect.width / 2);
                var dy = e.clientY - (rect.top + rect.height / 2);
                gsap.to(btn, { x: dx * 0.35, y: dy * 0.35, duration: 0.4, ease: "power2.out" });
            });
            btn.addEventListener("mouseleave", function() {
                gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
            });
        });

        /* Multi-wave ripple on button click */
        $$(".btn-primary, .btn-ghost, .btn-checkout, .btn-add-modal, .btn-add-cart, .filter-btn").forEach(function(btn) {
            btn.style.position = "relative";
            btn.style.overflow = "hidden";
            btn.addEventListener("click", function(e) {
                var rect = btn.getBoundingClientRect();
                var x = (e.clientX - rect.left) + "px";
                var y = (e.clientY - rect.top) + "px";
                /* Spawn 3 concentric wave rings */
                for (var i = 0; i < 3; i++) {
                    var wave = document.createElement("span");
                    wave.className = "wave-ripple";
                    wave.style.left = x;
                    wave.style.top = y;
                    wave.style.animationDelay = (i * 0.1) + "s";
                    btn.appendChild(wave);
                    wave.addEventListener("animationend", function() { this.remove(); });
                }
            });
        });
    }

    /* ══════════════════════════════
       PARALLAX IMAGES
       ══════════════════════════════ */
    $$(".parallax-img").forEach(img => {
        gsap.to(img, {
            yPercent: -15,
            ease: "none",
            scrollTrigger: {
                trigger: img,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
            }
        });
    });

    /* ══════════════════════════════
       PARTICLE SYSTEM
       ══════════════════════════════ */
    const particles = [];
    const PARTICLE_COUNT = 40;

    function resizeCanvas() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.4 + 0.1,
            hue: Math.random() > 0.5 ? 30 : 160, /* warm brown or sage green */
        });
    }

    function drawParticles() {
        particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0) p.x = particleCanvas.width;
            if (p.x > particleCanvas.width) p.x = 0;
            if (p.y < 0) p.y = particleCanvas.height;
            if (p.y > particleCanvas.height) p.y = 0;

            particleCtx.beginPath();
            particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            particleCtx.fillStyle = "hsla(" + p.hue + ", 50%, 65%, " + p.opacity + ")";
            particleCtx.fill();
        });
        requestAnimationFrame(drawParticles);
    }
    if (window.innerWidth > 768) drawParticles();

    /* ══════════════════════════════
       PRODUCT CARD 3D TILT
       ══════════════════════════════ */
    if (window.matchMedia("(pointer: fine)").matches) {
        $$(".product-card").forEach(card => {
            card.addEventListener("mousemove", e => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                gsap.to(card, {
                    rotateY: x * 8,
                    rotateX: -y * 8,
                    transformPerspective: 800,
                    duration: 0.4,
                    ease: "power2.out",
                });
            });
            card.addEventListener("mouseleave", () => {
                gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power2.out" });
            });
        });
    }

    /* ══════════════════════════════
       KEYBOARD ESC CLOSE
       ══════════════════════════════ */
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closeCart();
            closeQuickView();
            if (navSidebar.classList.contains("open")) toggleSidebar();
        }
    });

})();
