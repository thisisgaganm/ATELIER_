
/* =========================================
   ATELIER — PREMIUM NAVIGATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".site-header");
    const navbar = document.querySelector(".navbar");
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    const navItems = document.querySelectorAll(".nav-link");
    const navTargets = navLinks?.querySelectorAll('a[href^="#"]');

    if (!header || !navbar || !menuToggle || !navLinks) return;

    const mobileQuery = window.matchMedia("(max-width: 900px)");

    menuToggle.setAttribute("aria-controls", "nav-links");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navLinks.setAttribute("aria-hidden", String(mobileQuery.matches));
    navLinks.inert = mobileQuery.matches;

    // -------------------------------------
    // MOBILE MENU
    // -------------------------------------

    function openMenu() {
        navLinks.classList.add("active");
        menuToggle.classList.add("active");
        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close navigation menu");
        navLinks.setAttribute("aria-hidden", "false");
        navLinks.inert = false;
        document.body.classList.add("menu-open");
        window.atelierLenis?.stop();
    }

    function closeMenu(restoreFocus = false) {
        const wasOpen = navLinks.classList.contains("active");
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        document.body.classList.remove("menu-open");
        navLinks.setAttribute("aria-hidden", String(mobileQuery.matches));
        navLinks.inert = mobileQuery.matches;

        if (wasOpen && !document.body.classList.contains("gallery-modal-open")) {
            window.atelierLenis?.start();
        }

        if (restoreFocus && mobileQuery.matches) {
            menuToggle.focus();
        }
    }

    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.contains("active");
        isOpen ? closeMenu() : openMenu();
    });

    // Close menu after selecting a link
    navTargets.forEach(link => {
        link.addEventListener("click", () => {
            closeMenu(true);
        });
    });

    // Close menu when clicking outside
    document.addEventListener("click", event => {
        if (
            mobileQuery.matches &&
            navLinks.classList.contains("active") &&
            event.target instanceof Node &&
            !navbar.contains(event.target)
        ) {
            closeMenu();
        }
    });

    // Close menu with Escape key
    document.addEventListener("keydown", event => {
        if (
            mobileQuery.matches &&
            navLinks.classList.contains("active") &&
            event.key === "Escape"
        ) {
            closeMenu(true);
            return;
        }

        if (
            mobileQuery.matches &&
            navLinks.classList.contains("active") &&
            event.key === "Tab"
        ) {
            const focusableElements = [
                menuToggle,
                ...navLinks.querySelectorAll('a[href]:not([tabindex="-1"])')
            ];
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    });

    // Close menu when switching to desktop
    mobileQuery.addEventListener("change", event => {
        if (!event.matches) closeMenu();
    });

    // -------------------------------------
    // SCROLL-BASED NAVBAR
    // -------------------------------------

    let ticking = false;

    function updateHeader() {
        const scrollPosition = window.scrollY;

        header.classList.toggle("scrolled", scrollPosition > 50);

        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });

    updateHeader();

    // -------------------------------------
    // ACTIVE NAVIGATION LINK
    // -------------------------------------

    const sections = document.querySelectorAll(
        "main section[id], main [data-nav-section]"
    );

    if ("IntersectionObserver" in window && sections.length) {
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const currentId = entry.target.id;

                navItems.forEach(link => {
                    const targetId = link.getAttribute("href");

                    if (targetId === `#${currentId}`) {
                        link.classList.add("active");
                        link.setAttribute("aria-current", "location");
                    } else {
                        link.classList.remove("active");
                        link.removeAttribute("aria-current");
                    }
                });
            });
        }, {
            rootMargin: "-35% 0px -55% 0px",
            threshold: 0
        });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // -------------------------------------
    // SMOOTH ANCHOR SCROLLING
    // -------------------------------------

    navTargets.forEach(link => {
        link.addEventListener("click", event => {
            const href = link.getAttribute("href");

            if (!href || !href.startsWith("#")) return;
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) return;

            const target = document.getElementById(href.slice(1));

            if (!target) return;

            event.preventDefault();

            if (typeof window.atelierScrollTo === "function") {
                window.atelierScrollTo(target);
            } else {
                target.scrollIntoView({
                    behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches ? "auto" : "smooth",
                    block: "start"
                });
            }

            // Keep URL in sync
            history.replaceState(null, "", href);
        });
    });

    console.log("ATELIER navigation initialized.");
});
