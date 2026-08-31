/* ==========================================================================
   MOHAMED EL MALLHY — PORTFOLIO SCRIPT

   Architecture:
     GSAP        -> animation and motion (entrance, scroll reveals, parallax)
     jQuery      -> DOM/UI behavior (project filtering, GitHub list render,
                    toast, delegated events)
     Vanilla JS  -> browser APIs (canvas, clipboard, matchMedia, fetch)
   ========================================================================== */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const GITHUB_USER = "mohamedelmallhy-prog";

  document.addEventListener("DOMContentLoaded", () => {
    initIntro();
    initLenis();
    initCursor();
    initNav();
    initMobileMenu();
    initHeroField();
    initHeroPhoto();
    initHeroReveal();
    initScrollReveals();
    initStatCounters();
    initJourney();
    initMagneticButtons();
    initProjectPreview();
    initWorkFilter();
    initGithubFeed();
    initContactCopy();
    initScrollProgress();
    initBackToTop();
  });

  /* ------------------------------------------------------------------
     CINEMATIC INTRO — name reveal, then hand off to the hero.
  ------------------------------------------------------------------ */
  function initIntro() {
    const intro = document.getElementById("intro");
    if (!intro) return;

    if (reduceMotion) {
      intro.classList.add("is-hidden");
      return;
    }

    const nameLines = intro.querySelectorAll(".intro__name-line");
    const subLines = intro.querySelectorAll(".intro__sub-line, .intro__sub-amp");
    const fill = document.getElementById("introFill");

    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        intro.classList.add("is-hidden");
        document.body.style.overflow = "";
      },
    });

    tl.to(nameLines, { y: "0%", duration: 0.9, ease: "expo.out", stagger: 0.12 })
      .to(subLines, { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.08 }, "-=0.3")
      .to(fill, { width: "100%", duration: 0.6, ease: "power2.inOut" }, "-=0.2")
      .to(intro, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "+=0.25");
  }

  /* ------------------------------------------------------------------
     LENIS — smooth scrolling, synced with GSAP's ticker + ScrollTrigger.
  ------------------------------------------------------------------ */
  function initLenis() {
    if (reduceMotion || typeof Lenis === "undefined") return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    lenis.on("scroll", () => {
      if (window.ScrollTrigger) ScrollTrigger.update();
    });

    if (window.gsap) {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          lenis.scrollTo(id, { offset: 0 });
        }
      });
    });

    window.__lenis = lenis;
  }

  /* ------------------------------------------------------------------
     CUSTOM CURSOR — dot follows exactly, ring lags via lerp.
  ------------------------------------------------------------------ */
  function initCursor() {
    if (isTouch) return;
    const cursor = document.getElementById("cursor");
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    const label = document.getElementById("cursorLabel");
    if (!cursor) return;

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function render() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      label.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(render);
    }
    render();

    document.querySelectorAll('[data-cursor="hover"]').forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });

    document.querySelectorAll('[data-cursor="button"]').forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-button"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-button"));
    });

    document.querySelectorAll('[data-cursor="project"]').forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-project"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-project"));
    });

    document.addEventListener("mouseleave", () => (cursor.style.opacity = "0"));
    document.addEventListener("mouseenter", () => (cursor.style.opacity = "1"));
  }

  /* ------------------------------------------------------------------
     NAV — background on scroll + active-section indicator.
  ------------------------------------------------------------------ */
  function initNav() {
    const nav = document.getElementById("nav");
    if (!nav) return;

    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = document.querySelectorAll("main section[id]");
    const links = document.querySelectorAll(".nav__link");

    if (window.gsap && window.ScrollTrigger) {
      sections.forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (self.isActive) {
              links.forEach((l) => l.classList.toggle("is-active", l.dataset.section === section.id));
            }
          },
        });
      });
    }
  }

  /* ------------------------------------------------------------------
     MOBILE MENU
  ------------------------------------------------------------------ */
  function initMobileMenu() {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    const close = () => {
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    toggle.addEventListener("click", () => {
      const willOpen = !menu.classList.contains("is-open");
      toggle.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
      menu.classList.toggle("is-open", willOpen);
      document.body.style.overflow = willOpen ? "hidden" : "";
    });

    menu.querySelectorAll(".mobile-menu__link").forEach((link) => link.addEventListener("click", close));
  }

  /* ------------------------------------------------------------------
     HERO FIELD — cursor-reactive dot grid, ambient hero backdrop.
  ------------------------------------------------------------------ */
  function initHeroField() {
    const canvas = document.getElementById("heroField");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width, height, cols, rows;
    const spacing = 42;
    let mouse = { x: -9999, y: -9999 };
    let t = 0;

    function resize() {
      const hero = canvas.closest(".hero");
      width = canvas.width = hero.offsetWidth * devicePixelRatio;
      height = canvas.height = hero.offsetHeight * devicePixelRatio;
      canvas.style.width = hero.offsetWidth + "px";
      canvas.style.height = hero.offsetHeight + "px";
      cols = Math.ceil(width / (spacing * devicePixelRatio)) + 1;
      rows = Math.ceil(height / (spacing * devicePixelRatio)) + 1;
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const gap = spacing * devicePixelRatio;
      const radiusMax = 2.4 * devicePixelRatio;
      const influence = 220 * devicePixelRatio;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gap;
          const y = j * gap;
          const dx = x - mouse.x * devicePixelRatio;
          const dy = y - mouse.y * devicePixelRatio;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const proximity = Math.max(0, 1 - dist / influence);
          const wave = reduceMotion ? 0 : Math.sin(t * 0.0012 + i * 0.4 + j * 0.4) * 0.5 + 0.5;

          const radius = radiusMax * (0.24 + proximity * 0.85 + wave * 0.1);
          const alpha = 0.04 + proximity * 0.45 + wave * 0.025;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201,164,100,${Math.min(alpha, 0.6)})`;
          ctx.fill();
        }
      }
    }

    function loop() {
      t += 16;
      draw();
      if (!reduceMotion) requestAnimationFrame(loop);
    }

    resize();
    draw();
    if (!reduceMotion) requestAnimationFrame(loop);

    window.addEventListener("resize", resize);
    if (!isTouch) {
      window.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      canvas.closest(".hero").addEventListener("mouseleave", () => {
        mouse.x = -9999;
        mouse.y = -9999;
      });
    }
  }

  /* ------------------------------------------------------------------
     HERO PHOTO — clip-path reveal + scale-down on load, subtle
     pointer parallax on desktop. Never distorts the face: only
     translate/scale on the container, the image itself stays intact.
  ------------------------------------------------------------------ */
  function initHeroPhoto() {
    const wrap = document.getElementById("heroPhoto");
    const mask = document.getElementById("heroPhotoMask");
    const img = document.getElementById("heroPhotoImg");
    if (!wrap || !mask || !img || !window.gsap) return;

    const introDelay = reduceMotion ? 0 : 1.5;

    if (reduceMotion) {
      gsap.set(mask, { clipPath: "inset(0% 0 0 0)" });
      gsap.set(img, { scale: 1 });
    } else {
      gsap.timeline({ delay: introDelay })
        .to(mask, { clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "power4.inOut" })
        .to(img, { scale: 1, duration: 1.3, ease: "power3.out" }, "-=0.9");
    }

    if (isTouch || reduceMotion) return;

    const moveX = gsap.quickTo(img, "x", { duration: 0.6, ease: "power3.out" });
    const moveY = gsap.quickTo(img, "y", { duration: 0.6, ease: "power3.out" });
    const rotX = gsap.quickTo(wrap, "rotationY", { duration: 0.6, ease: "power3.out" });
    const rotY = gsap.quickTo(wrap, "rotationX", { duration: 0.6, ease: "power3.out" });

    wrap.style.transformStyle = "preserve-3d";
    wrap.style.perspective = "800px";

    wrap.addEventListener("mousemove", (e) => {
      const rect = wrap.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      moveX(relX * 14);
      moveY(relY * 14);
      rotX(relX * 4);
      rotY(-relY * 4);
    });

    wrap.addEventListener("mouseleave", () => {
      moveX(0);
      moveY(0);
      rotX(0);
      rotY(0);
    });
  }

  /* ------------------------------------------------------------------
     HERO REVEAL — headline lines, eyebrow, CTAs, synced after intro.
  ------------------------------------------------------------------ */
  function initHeroReveal() {
    if (!window.gsap) return;
    const words = document.querySelectorAll(".hero__word");
    const fades = document.querySelectorAll(".hero [data-reveal]");
    const delay = reduceMotion ? 0 : 1.55;

    if (reduceMotion) {
      gsap.set(words, { y: 0 });
      gsap.set(fades, { opacity: 1, y: 0 });
      return;
    }

    gsap.timeline({ delay })
      .to(words, { y: "0%", duration: 1.1, ease: "expo.out", stagger: 0.1 })
      .fromTo(fades, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.1 }, "-=0.6");
  }

  /* ------------------------------------------------------------------
     SCROLL REVEALS — generic fade/slide-in, cascading rows for
     journey/skills/case studies.
  ------------------------------------------------------------------ */
  function initScrollReveals() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll("main [data-reveal]:not(.hero [data-reveal])").forEach((el) => {
      if (reduceMotion) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    document.querySelectorAll("[data-split-lines]").forEach((el) => {
      if (reduceMotion) return;
      gsap.fromTo(el, { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    gsap.utils.toArray(".case").forEach((row, i) => {
      if (reduceMotion) return;
      gsap.fromTo(row, { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: i * 0.04,
        scrollTrigger: { trigger: row, start: "top 92%" },
      });
    });

    gsap.utils.toArray("[data-skill]").forEach((row, i) => {
      if (reduceMotion) return;
      gsap.fromTo(row, { opacity: 0, y: 16 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: i * 0.03,
        scrollTrigger: { trigger: row, start: "top 94%" },
      });
    });
  }

  /* ------------------------------------------------------------------
     STAT COUNTERS
  ------------------------------------------------------------------ */
  function initStatCounters() {
    const values = document.querySelectorAll(".stat__value");
    if (!values.length) return;

    const animateValue = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 1.4, ease: "power2.out",
        onUpdate: () => (el.textContent = Math.floor(obj.val) + suffix),
      });
    };

    if (window.ScrollTrigger) {
      values.forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => animateValue(el) });
      });
    } else {
      values.forEach(animateValue);
    }
  }

  /* ------------------------------------------------------------------
     JOURNEY — vertical spine fills on scroll; the stage nearest
     center is marked active.
  ------------------------------------------------------------------ */
  function initJourney() {
    const fill = document.getElementById("journeyFill");
    const rail = document.getElementById("journeyRail");
    const stages = document.querySelectorAll("[data-journey-stage]");
    if (!rail || !stages.length) return;

    if (!window.ScrollTrigger) {
      stages.forEach((s) => s.classList.add("is-active"));
      if (fill) fill.style.height = "100%";
      return;
    }

    if (fill) {
      gsap.to(fill, {
        height: "100%", ease: "none",
        scrollTrigger: { trigger: rail, start: "top 65%", end: "bottom 60%", scrub: 0.6 },
      });
    }

    stages.forEach((stage) => {
      ScrollTrigger.create({
        trigger: stage,
        start: "top 60%",
        end: "bottom 40%",
        onToggle: (self) => stage.classList.toggle("is-active", self.isActive),
      });
    });
  }

  /* ------------------------------------------------------------------
     MAGNETIC BUTTONS
  ------------------------------------------------------------------ */
  function initMagneticButtons() {
    if (isTouch || reduceMotion || !window.gsap) return;

    document.querySelectorAll(".magnetic").forEach((btn) => {
      const moveX = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
      const moveY = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });

      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        moveX(relX * 0.35);
        moveY(relY * 0.5);
      });

      btn.addEventListener("mouseleave", () => {
        moveX(0);
        moveY(0);
      });
    });
  }

  /* ------------------------------------------------------------------
     PROJECT PREVIEW — floating panel follows the cursor over a row.
  ------------------------------------------------------------------ */
  function initProjectPreview() {
    if (isTouch) return;
    const preview = document.getElementById("projectPreview");
    const inner = document.getElementById("projectPreviewInner");
    const rows = document.querySelectorAll("[data-preview] .case__row");
    if (!preview || !rows.length) return;

    const labels = {
      1: "01 — TASAWOQI",
      2: "02 — NOOR QURAN",
      3: "03 — RENDEZVOUS",
      4: "04 — AI / EXPERIMENTS",
    };

    let raf = null;
    let px = 0, py = 0, tx = 0, ty = 0;

    function render() {
      px += (tx - px) * 0.16;
      py += (ty - py) * 0.16;
      preview.style.transform = `translate(${px}px, ${py}px) scale(1)`;
      raf = requestAnimationFrame(render);
    }

    rows.forEach((row) => {
      const key = row.closest("[data-preview]").dataset.preview;

      row.addEventListener("mouseenter", (e) => {
        inner.setAttribute("data-label", labels[key] || "");
        preview.style.opacity = "1";
        tx = e.clientX;
        ty = e.clientY;
        px = tx;
        py = ty;
        preview.style.transform = `translate(${px}px, ${py}px) scale(0.9)`;
        if (!raf) raf = requestAnimationFrame(render);
      });

      row.addEventListener("mousemove", (e) => {
        tx = e.clientX;
        ty = e.clientY;
      });

      row.addEventListener("mouseleave", () => {
        preview.style.opacity = "0";
        if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     WORK FILTER — jQuery handles the DOM/UI state (active tab,
     matching), GSAP handles the enter/exit animation.
  ------------------------------------------------------------------ */
  function initWorkFilter() {
    if (typeof $ === "undefined") return;

    // Event delegation: one listener on the container handles all tabs,
    // including any added later without rebinding.
    $("#workFilters").on("click", ".filter", function () {
      const $btn = $(this);
      const value = $btn.data("filter");

      $btn.addClass("is-active").attr("aria-selected", "true")
        .siblings().removeClass("is-active").attr("aria-selected", "false");

      $("#workList > [data-case]").each(function () {
        const $case = $(this);
        const categories = ($case.data("categories") || "").toString().split(" ");
        const matches = value === "all" || categories.indexOf(value) !== -1;

        if (window.gsap && !reduceMotion) {
          if (matches) {
            $case.removeClass("is-filtered-out");
            gsap.fromTo(this, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
          } else {
            gsap.to(this, {
              opacity: 0, y: -10, duration: 0.25, ease: "power2.in",
              onComplete: () => $case.addClass("is-filtered-out"),
            });
          }
        } else {
          $case.toggleClass("is-filtered-out", !matches);
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     GITHUB FEED — fetches public repos for context; degrades to a
     clear fallback message if the API is unreachable or rate-limited.
     The rest of the page never depends on this succeeding.
  ------------------------------------------------------------------ */
  function initGithubFeed() {
    const state = document.getElementById("ghState");
    const list = document.getElementById("ghList");
    if (!state || !list || typeof $ === "undefined") return;

    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6`)
      .then((res) => {
        if (!res.ok) throw new Error("GitHub API error " + res.status);
        return res.json();
      })
      .then((repos) => {
        if (!Array.isArray(repos) || repos.length === 0) {
          $(state).text("No public repositories to show right now.");
          return;
        }

        const $list = $(list);
        $list.empty();

        repos.forEach((repo) => {
          const $item = $("<li>");
          const $link = $("<a>", {
            href: repo.html_url,
            target: "_blank",
            rel: "noopener",
            text: repo.name,
          });
          const $desc = $("<p>", { class: "gh__repo-desc", text: repo.description || "No description provided." });
          const $meta = $("<div>", { class: "gh__repo-meta" });

          if (repo.language) $meta.append($("<span>").text(repo.language));
          $meta.append($("<span>").text("★ " + repo.stargazers_count));

          $item.append($link, $desc, $meta);
          $list.append($item);
        });

        state.hidden = true;
        list.hidden = false;
      })
      .catch(() => {
        $(state).text("Couldn't load live repositories right now — explore the full list on GitHub above.");
      });
  }

  /* ------------------------------------------------------------------
     CONTACT COPY — copies the email to clipboard with a toast.
  ------------------------------------------------------------------ */
  function initContactCopy() {
    const btn = document.getElementById("copyEmail");
    const toast = document.getElementById("emailToast");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      const email = btn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
      } catch (err) {
        /* Clipboard API unavailable — the address is still visible to copy manually. */
      }
      if (toast) {
        toast.classList.add("is-visible");
        setTimeout(() => toast.classList.remove("is-visible"), 1600);
      }
    });
  }

  /* ------------------------------------------------------------------
     SCROLL PROGRESS
  ------------------------------------------------------------------ */
  function initScrollProgress() {
    const fill = document.getElementById("progressFill");
    if (!fill) return;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      fill.style.width = pct + "%";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ------------------------------------------------------------------
     BACK TO TOP
  ------------------------------------------------------------------ */
  function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (window.__lenis) {
        window.__lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  }
})();
