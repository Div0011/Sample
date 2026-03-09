/* ════════════════════════════════════════════════════
   VIRASAT CHAI — PREMIUM ANIMATION ENGINE
   Lenis Smooth Scroll + SplitType Text Reveals
   + Velocity-Based UI Blur + Enhanced Parallax

   This file ADDS to the existing script.js — it does
   NOT replace or duplicate any existing animations.
   ════════════════════════════════════════════════════ */

(function () {
    "use strict";

    /* ══════════════════════════════
       CONFIGURATION — adjust these
       values to tweak all timings
       ══════════════════════════════ */
    var CONFIG = {
        smoothScroll: {
            duration: 1.2,
            easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
            wheelMultiplier: 1,
            touchMultiplier: 2
        },
        textReveal: {
            duration: 1,
            stagger: 0.06,
            ease: "power4.out",
            yPercent: 110
        },
        parallax: {
            defaultSpeed: 0.3
        },
        scrollBlur: {
            velocityThreshold: 0.8,   /* only blur when scrolling fast */
            clearDelay: 200            /* ms after scroll stops to clear */
        },
        imageZoom: {
            startScale: 1.08,
            endScale: 1,
            ease: "power2.out"
        }
    };

    /* ══════════════════════════════
       LENIS SMOOTH SCROLL
       Disabled on mobile/touch for
       performance (native scroll)
       ══════════════════════════════ */
    var isMobile = window.matchMedia("(max-width: 768px)").matches ||
                   window.matchMedia("(pointer: coarse)").matches;
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var lenis = null;

    if (!isMobile && !prefersReduced && typeof Lenis !== "undefined") {
        lenis = new Lenis({
            duration: CONFIG.smoothScroll.duration,
            easing: CONFIG.smoothScroll.easing,
            smooth: true,
            smoothTouch: false,
            wheelMultiplier: CONFIG.smoothScroll.wheelMultiplier,
            touchMultiplier: CONFIG.smoothScroll.touchMultiplier
        });

        /* Connect Lenis to GSAP ScrollTrigger for synced animations */
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(function (time) {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        /* Auto-stop/start Lenis when modals/drawers set overflow:hidden */
        var bodyObserver = new MutationObserver(function () {
            if (document.body.style.overflow === "hidden") {
                lenis.stop();
            } else {
                lenis.start();
            }
        });
        bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    }

    /* ══════════════════════════════
       SCROLL BLUR — VELOCITY-BASED
       Only blurs UI overlays (side-nav,
       hamburger). Content + cart stay crisp.
       ══════════════════════════════ */
    var blurTimeout = null;

    if (lenis) {
        /* Use Lenis velocity for precise blur control */
        lenis.on("scroll", function (e) {
            var velocity = Math.abs(e.velocity);
            if (velocity > CONFIG.scrollBlur.velocityThreshold) {
                document.body.classList.add("is-scrolling");
            }
            clearTimeout(blurTimeout);
            blurTimeout = setTimeout(function () {
                document.body.classList.remove("is-scrolling");
            }, CONFIG.scrollBlur.clearDelay);
        });
    } else {
        /* Fallback: basic scroll event debounce */
        window.addEventListener("scroll", function () {
            document.body.classList.add("is-scrolling");
            clearTimeout(blurTimeout);
            blurTimeout = setTimeout(function () {
                document.body.classList.remove("is-scrolling");
            }, CONFIG.scrollBlur.clearDelay);
        }, { passive: true });
    }

    /* ══════════════════════════════
       SPLITTYPE TEXT REVEALS
       Applied to .split-text headings.
       Words reveal upward line-by-line
       with a premium masked stagger.
       ══════════════════════════════ */
    if (typeof SplitType !== "undefined" && !prefersReduced) {
        /* Wait for fonts to be ready before splitting (prevents incorrect line breaks) */
        var initSplitText = function () {
            document.querySelectorAll(".split-text").forEach(function (el) {
                /* Skip if already split */
                if (el.dataset.splitDone) return;
                el.dataset.splitDone = "true";

                var split = new SplitType(el, { types: "lines,words" });

                /* Set overflow hidden on each line for masked reveal */
                if (split.lines) {
                    split.lines.forEach(function (line) {
                        line.style.overflow = "hidden";
                        line.style.paddingBottom = "0.08em";
                    });
                }

                /* Set initial state and animate on scroll */
                if (split.words && split.words.length > 0) {
                    gsap.set(split.words, { yPercent: CONFIG.textReveal.yPercent, opacity: 0 });

                    gsap.to(split.words, {
                        yPercent: 0,
                        opacity: 1,
                        duration: CONFIG.textReveal.duration,
                        stagger: CONFIG.textReveal.stagger,
                        ease: CONFIG.textReveal.ease,
                        scrollTrigger: {
                            trigger: el,
                            start: "top 85%",
                            once: true
                        }
                    });
                }
            });
        };

        /* Run after fonts load for correct line splitting */
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                initSplitText();
                ScrollTrigger.refresh();
            });
        } else {
            /* Fallback if Font Loading API unavailable */
            window.addEventListener("load", initSplitText);
        }
    }

    /* ══════════════════════════════
       ENHANCED PARALLAX
       Add data-parallax="0.3" to any
       element for depth effect.
       Uses transform3d for GPU accel.
       ══════════════════════════════ */
    document.querySelectorAll("[data-parallax]").forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || CONFIG.parallax.defaultSpeed;

        gsap.to(el, {
            yPercent: 30 * speed,
            ease: "none",
            force3D: true,
            scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    /* ══════════════════════════════
       IMAGE ZOOM REVEAL
       Products and ingredient images
       subtly zoom from 1.08x to 1.0x
       as they enter viewport.
       (Skips images already animated
       in script.js to avoid conflicts)
       ══════════════════════════════ */
    document.querySelectorAll(".product-img-wrap img").forEach(function (img) {
        gsap.fromTo(img,
            { scale: CONFIG.imageZoom.startScale },
            {
                scale: CONFIG.imageZoom.endScale,
                duration: 1.2,
                ease: CONFIG.imageZoom.ease,
                scrollTrigger: {
                    trigger: img.closest(".product-card") || img.parentElement,
                    start: "top 85%",
                    end: "center center",
                    scrub: 1
                }
            }
        );
    });

    /* ══════════════════════════════
       REFRESH ON LOAD + RESIZE
       Ensures ScrollTrigger positions
       are accurate after layout settles
       ══════════════════════════════ */
    window.addEventListener("load", function () {
        ScrollTrigger.refresh();
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            ScrollTrigger.refresh();
        }, 250);
    });

})();
