// =================================
// ATELIER MOTION SYSTEM
// =================================

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const desktopMotion = window.matchMedia(
        "(min-width: 769px) and (hover: hover) and (pointer: fine)"
    ).matches;
    const gsap = window.gsap;
    const scrollTrigger = window.ScrollTrigger;

    // Keep the loader independent of optional CDN libraries.
    const loader = document.getElementById("page-loader");
    let loaderDismissed = false;
    const loaderFadeDuration = reducedMotion ? 0 : 550;

    function dismissLoader() {
        if (!loader || loaderDismissed) return;
        loaderDismissed = true;
        loader.classList.add("is-dismissing");
        window.setTimeout(() => loader.remove(), loaderFadeDuration);
    }

    window.setTimeout(dismissLoader, reducedMotion ? 0 : 600);
    window.setTimeout(dismissLoader, reducedMotion ? 0 : 2500);
    window.addEventListener("load", () => {
        window.setTimeout(dismissLoader, reducedMotion ? 0 : 150);
    }, { once: true });

    // Use one GSAP ticker to drive Lenis and ScrollTrigger together.
    if (!reducedMotion && desktopMotion && window.Lenis && gsap && scrollTrigger) {
        gsap.registerPlugin(scrollTrigger);

        if (!window.atelierLenis) {
            const lenis = new window.Lenis({
                duration: 1.05,
                smoothWheel: true,
                syncTouch: false,
                autoRaf: false
            });

            lenis.on("scroll", scrollTrigger.update);
            gsap.ticker.add(time => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
            window.atelierLenis = lenis;
        }
    } else if (gsap && scrollTrigger) {
        gsap.registerPlugin(scrollTrigger);
    }

    window.atelierScrollTo = target => {
        if (!target) return;

        if (window.atelierLenis && !reducedMotion) {
            window.atelierLenis.scrollTo(target, { offset: -100 });
            return;
        }

        target.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "start"
        });
    };

    const revealElements = Array.from(
        document.querySelectorAll(".reveal-about")
    );

    if (reducedMotion) {
        revealElements.forEach(element => element.classList.add("is-visible"));
    } else if (gsap && scrollTrigger) {
        document.documentElement.classList.add("motion-gsap");

        const staggerGroups = [
            ".services-grid .service-card",
            ".gallery-grid .gallery-card",
            ".offers-grid .offer-card"
        ];
        const staggeredElements = new Set(
            staggerGroups.flatMap(selector =>
                Array.from(document.querySelectorAll(selector))
            )
        );

        revealElements
            .filter(element => !staggeredElements.has(element))
            .forEach(element => {
                gsap.fromTo(element,
                    { autoAlpha: 0, y: 22 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: desktopMotion ? 0.85 : 0.55,
                        ease: "power2.out",
                        clearProps: "opacity,visibility,transform",
                        onComplete: () => element.classList.add("is-visible"),
                        scrollTrigger: {
                            trigger: element,
                            start: "top 88%",
                            once: true
                        }
                    }
                );
            });

        staggerGroups.forEach(selector => {
            const cards = Array.from(document.querySelectorAll(selector));
            if (!cards.length) return;

            gsap.fromTo(cards,
                { autoAlpha: 0, y: 24 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: desktopMotion ? 0.8 : 0.5,
                    stagger: desktopMotion ? 0.12 : 0.06,
                    ease: "power2.out",
                    clearProps: "opacity,visibility,transform",
                    onComplete: () => {
                        cards.forEach(card => card.classList.add("is-visible"));
                    },
                    scrollTrigger: {
                        trigger: cards[0].parentElement,
                        start: "top 86%",
                        once: true
                    }
                }
            );
        });

        if (desktopMotion) {
            const revealImages = document.querySelectorAll(
                ".about-image-main, .service-image, .gallery-image-button, " +
                ".offer-image, .referral-image, .location-map"
            );

            revealImages.forEach(image => {
                gsap.fromTo(image,
                    { autoAlpha: 0, y: 12 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.9,
                        ease: "power2.out",
                        clearProps: "opacity,visibility,transform",
                        scrollTrigger: {
                            trigger: image,
                            start: "top 88%",
                            once: true
                        }
                    }
                );
            });

            const hero = document.querySelector(".hero-section");
            const heroBackground = document.querySelector(".hero-background");

            if (hero && heroBackground) {
                gsap.to(heroBackground, {
                    yPercent: 4,
                    ease: "none",
                    scrollTrigger: {
                        trigger: hero,
                        start: "top top",
                        end: "bottom top",
                        scrub: 0.6
                    }
                });
            }
        }
    } else if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15 });

        revealElements.forEach(element => revealObserver.observe(element));
    } else {
        revealElements.forEach(element => element.classList.add("is-visible"));
    }

    // Do not suppress the native pointer until all cursor elements are ready.
    const cursor = document.getElementById("custom-cursor");
    const follower = document.getElementById("cursor-follower");

    if (cursor && follower && desktopMotion && !reducedMotion) {
        document.body.classList.add("has-custom-cursor");

        let pointerX = window.innerWidth / 2;
        let pointerY = window.innerHeight / 2;
        let followerX = pointerX;
        let followerY = pointerY;
        let activeMagnet = null;
        let animationFrame = 0;

        function renderCursor() {
            followerX += (pointerX - followerX) * 0.16;
            followerY += (pointerY - followerY) * 0.16;

            cursor.style.transform =
                `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
            follower.style.transform =
                `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;

            if (
                Math.abs(pointerX - followerX) > 0.4 ||
                Math.abs(pointerY - followerY) > 0.4
            ) {
                animationFrame = window.requestAnimationFrame(renderCursor);
            } else {
                animationFrame = 0;
            }
        }

        window.addEventListener("pointermove", event => {
            pointerX = event.clientX;
            pointerY = event.clientY;
            const textEntry = event.target instanceof Element
                ? event.target.closest(
                    "input, textarea, select, [contenteditable='true']"
                )
                : null;
            document.body.classList.toggle("cursor-active", !textEntry);

            const magnet = event.target instanceof Element
                ? event.target.closest(
                    ".hero-button-primary, .nav-cta, .services-cta, " +
                    ".referral-button, .contact-submit, .location-directions"
                )
                : null;

            if (activeMagnet && activeMagnet !== magnet) {
                activeMagnet.style.translate = "";
            }

            activeMagnet = magnet;

            if (activeMagnet) {
                const bounds = activeMagnet.getBoundingClientRect();
                const x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
                const y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
                activeMagnet.style.translate =
                    `${(x * 7).toFixed(1)}px ${(y * 5).toFixed(1)}px`;
            }

            if (!animationFrame) {
                animationFrame = window.requestAnimationFrame(renderCursor);
            }
        }, { passive: true });

        document.addEventListener("pointerover", event => {
            const textEntry = event.target instanceof Element
                ? event.target.closest(
                    "input, textarea, select, [contenteditable='true']"
                )
                : null;
            if (textEntry) {
                document.body.classList.remove("cursor-active");
                follower.classList.remove("is-expanded", "has-label");
                return;
            }

            const target = event.target instanceof Element
                ? event.target.closest(
                    "a, button, .service-card, .offer-card, .gallery-image-button"
                )
                : null;

            follower.classList.toggle("is-expanded", Boolean(target));
            follower.classList.toggle(
                "has-label",
                Boolean(target?.closest(".gallery-image-button"))
            );
        });

        window.addEventListener("pointerleave", () => {
            document.body.classList.remove("cursor-active");
            follower.classList.remove("is-expanded", "has-label");
            if (activeMagnet) activeMagnet.style.translate = "";
            activeMagnet = null;
            pointerX = -100;
            pointerY = -100;

            if (!animationFrame) {
                animationFrame = window.requestAnimationFrame(renderCursor);
            }
        });

        cursor.style.transform =
            `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
        follower.style.transform =
            `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;

        window.addEventListener("pagehide", () => {
            window.cancelAnimationFrame(animationFrame);
        }, { once: true });
    }

    if (gsap && scrollTrigger) {
        const footer = document.getElementById("site-footer");

        if (footer && !reducedMotion) {
            const signatureElements = footer.querySelectorAll(
                ".footer-eyebrow, .footer-signature, .footer-tagline"
            );
            const footerColumns = footer.querySelectorAll(".footer-column");
            const footerRule = footer.querySelector(".footer-rule");
            const footerBottom = footer.querySelector(".footer-bottom");

            const footerTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: footer,
                    start: "top 82%",
                    once: true
                }
            });

            footerTimeline
                .fromTo(signatureElements,
                    { autoAlpha: 0, y: 24 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.85,
                        stagger: 0.1,
                        ease: "power2.out",
                        clearProps: "opacity,visibility,transform"
                    },
                    0
                )
                .fromTo(footerRule,
                    { scaleX: 0 },
                    {
                        scaleX: 1,
                        duration: 1,
                        ease: "power2.inOut",
                        transformOrigin: "left center"
                    },
                    0.35
                )
                .fromTo(footerColumns,
                    { autoAlpha: 0, y: 20 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.65,
                        stagger: 0.1,
                        ease: "power2.out",
                        clearProps: "opacity,visibility,transform"
                    },
                    0.55
                )
                .fromTo(footerBottom,
                    { autoAlpha: 0, y: 12 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power2.out",
                        clearProps: "opacity,visibility,transform"
                    },
                    0.95
                );
        }

        window.addEventListener("load", () => scrollTrigger.refresh(), {
            once: true
        });
    }
});
