function wrapLogoText() {
    document.querySelectorAll(".header .logo").forEach(function (logo) {
        if (logo.querySelector(".logo-text")) {
            return;
        }

        const text = logo.textContent.trim();

        if (!text) {
            return;
        }

        logo.textContent = "";
        logo.insertAdjacentHTML(
            "beforeend",
            '<span class="logo-text">' + text + "</span>"
        );
    });
}

function syncMobileMenuUser() {
    const footer = document.querySelector(".mobile-menu-user");
    if (!footer) {
        return;
    }

    const nomeEl = document.getElementById("nomeUsuario");
    const tipoEl = document.getElementById("tipoUsuario");
    const nomeFallback = document.querySelector(".header .user-info strong");
    const tipoFallback = document.querySelector(".header .user-info span");
    const avatarEl = document.querySelector(".header .user-avatar, .header .avatar");

    const nome = (nomeEl || nomeFallback)?.textContent?.trim() || "Usuário";
    const tipo = (tipoEl || tipoFallback)?.textContent?.trim() || "";
    const avatar = avatarEl?.textContent?.trim() || "👤";

    footer.innerHTML =
        '<div class="mobile-menu-user-avatar">' +
        avatar +
        "</div>" +
        '<div class="mobile-menu-user-info">' +
        "<strong>" +
        nome +
        "</strong>" +
        "<span>" +
        tipo +
        "</span>" +
        "</div>";
}

function initMobileNav() {
    const menu = document.querySelector(".menu");
    const header = document.querySelector(".header");

    if (!menu || !header) {
        return;
    }

    wrapLogoText();

    document.querySelectorAll(".menu-backdrop").forEach(function (backdrop) {
        backdrop.remove();
    });

    if (!menu.querySelector(".mobile-menu-header")) {
        const drawerHeader = document.createElement("div");
        drawerHeader.className = "mobile-menu-header";
        drawerHeader.innerHTML =
            '<span class="mobile-menu-title">🎓 GPAcademy</span>' +
            '<button type="button" class="menu-close" aria-label="Fechar menu">&times;</button>';

        drawerHeader
            .querySelector(".menu-close")
            .addEventListener("click", closeMenu);

        menu.insertBefore(drawerHeader, menu.firstChild);
    }

    if (!menu.querySelector(".mobile-menu-user")) {
        const userFooter = document.createElement("div");
        userFooter.className = "mobile-menu-user";
        menu.appendChild(userFooter);
    }

    menu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMenu);
    });

    document.querySelectorAll(".header .logout-btn").forEach(function (button) {
        if (!button.getAttribute("aria-label")) {
            button.setAttribute("aria-label", "Sair");
        }
    });

    syncMobileMenuUser();
}

function openMenu() {
    const menu = document.querySelector(".menu");
    const toggle = document.querySelector(".menu-toggle");

    if (!menu || !toggle) {
        return;
    }

    syncMobileMenuUser();
    menu.classList.add("open");
    toggle.classList.add("active");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
}

function closeMenu() {
    const menu = document.querySelector(".menu");
    const toggle = document.querySelector(".menu-toggle");

    menu?.classList.remove("open");
    toggle?.classList.remove("active");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
}

function toggleMenu() {
    const menu = document.querySelector(".menu");

    if (menu?.classList.contains("open")) {
        closeMenu();
    } else {
        openMenu();
    }
}

document.addEventListener("DOMContentLoaded", initMobileNav);

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeMenu();
    }
});

document.addEventListener("click", function (event) {
    const menu = document.querySelector(".menu");
    const toggle = document.querySelector(".menu-toggle");
    const header = document.querySelector(".header");

    if (
        !menu ||
        !toggle ||
        !menu.classList.contains("open") ||
        menu.contains(event.target) ||
        toggle.contains(event.target)
    ) {
        return;
    }

    if (header && header.contains(event.target)) {
        return;
    }

    closeMenu();
});

window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
        closeMenu();
    }
});
