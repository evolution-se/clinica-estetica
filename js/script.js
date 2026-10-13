/* ============================================================
   MAISON AUREA ESTÉTICA — script.js
   JavaScript vanilla, sem dependências além do bundle do Bootstrap.
   Executado após o DOM estar pronto.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- CONSTANTES ---------- */
  // SUBSTITUIR pelo número real no formato internacional (55 + DDD + número)
  var WHATSAPP_NUMBER = "5511900000000";

  /**
   * Monta o link do WhatsApp com a mensagem pré-preenchida.
   * @param {string} mensagem mensagem padrão do CTA
   * @returns {string} URL completa wa.me
   */
  function buildWhatsAppUrl(mensagem) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(mensagem);
  }

  /**
   * Aplica a mensagem de cada elemento [data-whatsapp-message] no href.
   * Os hrefs já vêm válidos no HTML (fallback sem JS).
   */
  function initWhatsAppLinks() {
    document.querySelectorAll("[data-whatsapp-message]").forEach(function (el) {
      var msg = el.getAttribute("data-whatsapp-message");
      if (msg) el.href = buildWhatsAppUrl(msg);
    });
  }

  /* ---------- HEADER: transparente → sólido ---------- */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var toggle = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }

  /* ---------- MENU MOBILE: fecha ao navegar ---------- */
  function initMobileMenu() {
    var collapseEl = document.getElementById("mainNav");
    if (!collapseEl || typeof bootstrap === "undefined") return;
    var collapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });

    collapseEl.querySelectorAll("a.nav-link, a.btn-header-cta").forEach(function (link) {
      link.addEventListener("click", function () {
        if (collapseEl.classList.contains("show")) collapse.hide();
      });
    });
  }

  /* ---------- SCROLL SPY: link ativo ---------- */
  function initScrollSpy() {
    var navLinks = Array.prototype.slice.call(
      document.querySelectorAll(".navbar .nav-link[href^='#']")
    );
    if (!navLinks.length || !("IntersectionObserver" in window)) return;

    var sections = navLinks
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);
    if (!sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            var active = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { observer.observe(section); });
  }
  /* ---------- FILTRO DE PROCEDIMENTOS ---------- */
  function initProcedureFilter() {
    var buttons = document.querySelectorAll(".filter-btn");
    var items = document.querySelectorAll(".procedure-item");
    if (!buttons.length || !items.length) return;

    function applyFilter(category) {
      items.forEach(function (item) {
        var match = category === "all" || item.dataset.category === category;
        if (match) {
          item.classList.remove("is-hidden");
          // Revela itens que ainda não passaram pelo observer
          var card = item.querySelector(".reveal");
          if (card) card.classList.add("is-visible");
        } else {
          item.classList.add("is-fading");
          window.setTimeout(function () {
            item.classList.add("is-hidden");
            item.classList.remove("is-fading");
          }, 250);
        }
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var already = btn.getAttribute("aria-pressed") === "true";
        if (already) return;
        buttons.forEach(function (b) {
          b.setAttribute("aria-pressed", "false");
          b.classList.remove("is-active");
        });
        btn.setAttribute("aria-pressed", "true");
        btn.classList.add("is-active");
        applyFilter(btn.dataset.filter);
      });
    });
  }

  /* ---------- MODAL DA GALERIA ---------- */
  function initGalleryModal() {
    var modalEl = document.getElementById("galleryModal");
    if (!modalEl || typeof bootstrap === "undefined") return;
    var img = document.getElementById("galleryModalImg");
    var caption = document.getElementById("galleryModalCaption");
    var title = document.getElementById("galleryModalLabel");

    document.querySelectorAll(".gallery-item[data-img]").forEach(function (item) {
      item.addEventListener("click", function () {
        img.src = item.dataset.img;
        // Alt da imagem ampliada: usa o alt da miniatura correspondente
        var thumb = item.querySelector("img");
        img.alt = thumb ? thumb.alt : "";
        caption.textContent = item.dataset.caption || "";
        title.textContent = item.querySelector(".gallery-item__label")
          ? item.querySelector(".gallery-item__label").textContent
          : "Ambiente";
      });
    });
  }
  /* ---------- ANIMAÇÕES DE ENTRADA (REVEAL) ---------- */
  function initReveal() {
    var elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    // Stagger leve nos grids (120ms, reinicia a cada 3 itens)
    document.querySelectorAll(".row, .gallery-grid, .timeline, .diferenciais-grid").forEach(function (group) {
      var children = group.querySelectorAll(":scope > .reveal, :scope > * > .reveal");
      Array.prototype.slice.call(children, 0, 6).forEach(function (child, i) {
        child.style.setProperty("--reveal-delay", i * 120 + "ms");
      });
    });

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- VOLTAR AO TOPO ---------- */
  function initBackToTop() {
    var btn = document.getElementById("backToTop");
    if (!btn) return;
    var toggle = function () {
      btn.classList.toggle("is-visible", window.scrollY > 600);
    };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
    btn.addEventListener("click", function () {
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      var skip = document.querySelector(".skip-link");
      if (skip) skip.focus({ preventScroll: true });
    });
  }

  /* ---------- ANO CORRENTE ---------- */
  function initYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll("[data-current-year]").forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ---------- MÁSCARA VISUAL DE TELEFONE ---------- */
  function formatPhone(value) {
    var digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return "(" + digits.slice(0, 2) + ") " + digits.slice(2);
    if (digits.length <= 10)
      return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 6) + "-" + digits.slice(6);
    return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7);
  }

  /* ---------- FORMULÁRIO → WHATSAPP ---------- */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var nameInput = document.getElementById("cfName");
    var phoneInput = document.getElementById("cfPhone");
    var privacyInput = document.getElementById("cfPrivacy");
    var interestInput = document.getElementById("cfInterest");
    var messageInput = document.getElementById("cfMessage");

    // Máscara visual (não impede colar texto fora do padrão)
    phoneInput.addEventListener("input", function () {
      phoneInput.value = formatPhone(phoneInput.value);
    });

    function setError(input, errorId, message) {
      var errorEl = document.getElementById(errorId);
      if (message) {
        input.classList.add("is-invalid");
        input.setAttribute("aria-invalid", "true");
        errorEl.textContent = message;
      } else {
        input.classList.remove("is-invalid");
        input.removeAttribute("aria-invalid");
        errorEl.textContent = "";
      }
    }

    function validate() {
      var valid = true;
      var firstInvalid = null;

      if (nameInput.value.trim().length < 2) {
        setError(nameInput, "cfNameError", "Informe o seu nome.");
        valid = false;
        firstInvalid = firstInvalid || nameInput;
      } else {
        setError(nameInput, "cfNameError", "");
      }

      var digits = phoneInput.value.replace(/\D/g, "");
      if (digits.length < 10) {
        setError(phoneInput, "cfPhoneError", "Informe um telefone com DDD.");
        valid = false;
        firstInvalid = firstInvalid || phoneInput;
      } else {
        setError(phoneInput, "cfPhoneError", "");
      }

      if (!privacyInput.checked) {
        setError(privacyInput, "cfPrivacyError", "É preciso concordar com a Política de Privacidade.");
        valid = false;
        firstInvalid = firstInvalid || privacyInput;
      } else {
        setError(privacyInput, "cfPrivacyError", "");
      }

      if (!valid && firstInvalid) firstInvalid.focus();
      return valid;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validate()) return;

      var lines = [
        "Olá! Gostaria de agendar uma avaliação na Maison Aurea.",
        "",
        "Nome: " + nameInput.value.trim(),
        "Telefone: " + phoneInput.value.trim(),
        "Interesse: " + interestInput.value
      ];
      var msg = messageInput.value.trim();
      if (msg) lines.push("Mensagem: " + msg);

      window.open(buildWhatsAppUrl(lines.join("\n")), "_blank", "noopener");
      form.reset();
    });
  }

  /* ---------- INICIALIZAÇÃO ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initWhatsAppLinks();
    initHeader();
    initMobileMenu();
    initScrollSpy();
    initProcedureFilter();
    initGalleryModal();
    initReveal();
    initBackToTop();
    initYear();
    initContactForm();
  });


})();
