
// =================================
// MAIN JAVASCRIPT
// =================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Interior Design Website Initialized");

    document.addEventListener("click", event => {
        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) return;

        const link = event.target instanceof Element
            ? event.target.closest('a[href^="#"]:not(.nav-link)')
            : null;

        if (!link) return;

        const href = link.getAttribute("href");
        const target = href && href.length > 1
            ? document.getElementById(href.slice(1))
            : null;

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

        history.replaceState(null, "", href);
    });

});

/* =========================================
   STEP 07 — GALLERY FILTERS & PREVIEW
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const gallery = document.querySelector(".gallery-section");

    if (!gallery) return;

    const filterButtons = gallery.querySelectorAll(".gallery-filter");
    const galleryCards = gallery.querySelectorAll(".gallery-card");

    // -------------------------------------
    // CATEGORY FILTERS
    // -------------------------------------

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const selectedCategory = button.dataset.filter;

            // Update active filter
            filterButtons.forEach(filter => {
                const isActive = filter === button;

                filter.classList.toggle("active", isActive);
                filter.setAttribute("aria-pressed", String(isActive));
            });

            // Filter project cards
            galleryCards.forEach(card => {

                const cardCategory = card.dataset.category;

                const shouldShow =
                    selectedCategory === "all" ||
                    cardCategory === selectedCategory;

                card.classList.remove("is-filtering-out");

                if (shouldShow) {
                    card.hidden = false;

                    requestAnimationFrame(() => {
                        card.classList.remove("is-filtering-out");
                    });
                } else {
                    card.classList.add("is-filtering-out");
                    card.hidden = true;
                }

            });

            window.ScrollTrigger?.refresh();
        });

    });

    // -------------------------------------
    // PROJECT PREVIEW MODAL
    // -------------------------------------

    const modal = document.getElementById("gallery-modal");

    if (!modal) return;

    const modalImage = document.getElementById("gallery-modal-img");
    const modalCategory = document.getElementById("gallery-modal-category");
    const modalTitle = document.getElementById("gallery-modal-title");
    const modalLocation = document.getElementById("gallery-modal-location");
    const modalDescription = document.getElementById("gallery-modal-description");

    const closeButton = modal.querySelector(".gallery-modal-close");
    const backdrop = modal.querySelector(".gallery-modal-backdrop");
    const modalContent = modal.querySelector(".gallery-modal-content");
    const contactLink = modal.querySelector(".gallery-modal-cta");

    let previousFocus = null;

    function openProject(card) {

        const image = card.querySelector(".gallery-image-button img");

        if (!image) return;

        previousFocus = document.activeElement;

        modalImage.src = image.currentSrc || image.src;
        modalImage.alt = image.alt;

        modalCategory.textContent =
            card.querySelector(".gallery-card-category")?.textContent || "";

        modalTitle.textContent = card.dataset.title || "ATELIER Project";
        modalLocation.textContent = card.dataset.location || "";
        modalDescription.textContent = card.dataset.description || "";

        modal.inert = false;
        modal.setAttribute("aria-hidden", "false");
        modal.classList.add("is-open");

        document.body.classList.add("gallery-modal-open");
        window.atelierLenis?.stop();

        closeButton.focus();
    }

    function closeProject() {

        if (!modal.classList.contains("is-open")) return;

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        modal.inert = true;

        document.body.classList.remove("gallery-modal-open");
        window.atelierLenis?.start();

        if (previousFocus && previousFocus.isConnected) {
            previousFocus.focus();
        }
    }

    // Open preview from each project
    galleryCards.forEach(card => {

        const imageButton = card.querySelector(".gallery-image-button");

        imageButton?.addEventListener("click", () => {
            openProject(card);
        });

    });

    closeButton.addEventListener("click", closeProject);
    backdrop.addEventListener("click", closeProject);

    // Contact CTA closes preview
    contactLink.addEventListener("click", closeProject);

    // Close on Escape
    document.addEventListener("keydown", event => {

        if (!modal.classList.contains("is-open")) return;

        if (event.key === "Escape") {
            closeProject();
        }

        // Keep keyboard focus inside the open modal
        if (event.key === "Tab") {

            const focusableElements = modalContent.querySelectorAll(
                'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            );

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

    console.log("ATELIER gallery initialized.");

});

/* =========================================
   STEP 09 — CONTACT FORM
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contact-form");
    const statusMessage = document.getElementById("contact-form-status");

    if (!contactForm) return;

    contactForm.addEventListener("input", event => {
        const field = event.target;
        if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
            return;
        }

        if (field.name === "name") {
            field.setCustomValidity(
                field.value.trim() ? "" : "Please enter your name."
            );
        } else if (field.name === "message") {
            field.setCustomValidity(
                field.value.trim()
                    ? ""
                    : "Please tell us about your project."
            );
        }
    });

    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const nameField = contactForm.elements.namedItem("name");
        const messageField = contactForm.elements.namedItem("message");

        nameField.setCustomValidity(
            nameField.value.trim() ? "" : "Please enter your name."
        );
        messageField.setCustomValidity(
            messageField.value.trim()
                ? ""
                : "Please tell us about your project."
        );

        if (!contactForm.reportValidity()) return;

        const formData = new FormData(contactForm);

        const name = formData.get("name").trim();
        const email = formData.get("email").trim();
        const phone = formData.get("phone").trim();
        const service = formData.get("service");
        const budget = formData.get("budget") || "Not specified";
        const message = formData.get("message").trim();

        const recipient = "hello@atelierdesign.in";

        const subject = encodeURIComponent(
            `New Project Enquiry — ${name}`
        );

        const body = encodeURIComponent(
`Hello ATELIER Team,

I would like to enquire about a project.

CLIENT DETAILS
Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}

PROJECT DETAILS
Service: ${service}
Budget: ${budget}

PROJECT DESCRIPTION
${message}

Looking forward to hearing from you.

Regards,
${name}`
        );

        const mailtoLink =
            `mailto:${recipient}?subject=${subject}&body=${body}`;

        if (statusMessage) {
            statusMessage.textContent =
                "Opening your email application. Please send the prepared enquiry to complete submission.";
        }

        window.location.href = mailtoLink;
    });

    console.log("ATELIER contact form initialized.");
});
