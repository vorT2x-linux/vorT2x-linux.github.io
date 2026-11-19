// VorT2x website behaviour. No dependencies.
(() => {
  "use strict";
  document.documentElement.classList.remove("no-js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Navigation: shadow when scrolled, menu on small screens.
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const toggle = nav.querySelector(".nav-toggle");
    toggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => nav.classList.remove("open")));
  }

  // Reveal on scroll.
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // Pointer spotlight on cards.
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Copy buttons on code blocks.
  const copyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
  const tickIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  document.querySelectorAll(".code").forEach((block) => {
    const pre = block.querySelector("pre");
    if (!pre) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy";
    btn.innerHTML = `${copyIcon}<span>Copy</span>`;
    btn.setAttribute("aria-label", "Copy to clipboard");
    btn.addEventListener("click", async () => {
      // Copy the commands only: no prompts, no comment lines.
      const text = [...pre.querySelectorAll(".cmd")].map((l) => l.textContent).join("\n") || pre.textContent;
      try {
        await navigator.clipboard.writeText(text.trim());
        btn.classList.add("done");
        btn.innerHTML = `${tickIcon}<span>Copied</span>`;
        setTimeout(() => { btn.classList.remove("done"); btn.innerHTML = `${copyIcon}<span>Copy</span>`; }, 1800);
      } catch { /* clipboard blocked: the text is still selectable */ }
    });
    block.appendChild(btn);
  });

  // Typing terminal in the hero.
  const term = document.querySelector("[data-typing]");
  if (term) {
    const script = [
      { t: "cmd", s: "curl -fsSL https://github.com/vorT2x-linux/vort2x/releases/latest/download/install-vort2x-fedora.sh | bash" },
      { t: "out", s: "Fedora 45 edition:  1) Workstation  2) KDE  3) COSMIC", c: "dim" },
      { t: "out", s: "→ Downloading and verifying Fedora…", c: "dim" },
      { t: "out", s: "✓ Checksum OK", c: "ok" },
      { t: "out", s: "→ Adding T2 keyboard, trackpad and Wi-Fi drivers", c: "dim" },
      { t: "out", s: "✓ USB stick ready. Boot your Mac from it.", c: "ok" },
    ];
    const render = (lines, caret) => {
      term.innerHTML = lines.map((l) => l).join("") + (caret ? '<span class="caret"></span>' : "");
    };
    const esc = (s) => s.replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[ch]);
    if (reduce) {
      render(script.map((l) => l.t === "cmd"
        ? `<div class="line"><span class="p">$ </span>${esc(l.s)}</div>`
        : `<div class="line ${l.c}">${esc(l.s)}</div>`), false);
    } else {
      const done = [];
      let i = 0;
      const next = () => {
        if (i >= script.length) {
          render(done, true);
          setTimeout(() => { done.length = 0; i = 0; next(); }, 6000);
          return;
        }
        const l = script[i++];
        if (l.t === "cmd") {
          let n = 0;
          const type = () => {
            n += Math.max(1, Math.round(Math.random() * 3));
            render([...done, `<div class="line"><span class="p">$ </span>${esc(l.s.slice(0, n))}</div>`], true);
            if (n < l.s.length) setTimeout(type, 18 + Math.random() * 30);
            else { done.push(`<div class="line"><span class="p">$ </span>${esc(l.s)}</div>`); setTimeout(next, 500); }
          };
          type();
        } else {
          done.push(`<div class="line ${l.c}">${esc(l.s)}</div>`);
          render(done, true);
          setTimeout(next, 650 + Math.random() * 400);
        }
      };
      setTimeout(next, 700);
    }
  }

  // Particle vortex behind the hero.
  const canvas = document.getElementById("vortex");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1, cx = 0, cy = 0, parts = [];
    const pointer = { x: 0, y: 0, active: false };
    const colours = ["56,189,248", "125,211,252", "129,140,248", "34,211,238"];
    const spawn = (p, fresh) => {
      const maxR = Math.hypot(w, h) * 0.62;
      p.r = fresh ? Math.random() * maxR : maxR * (0.75 + Math.random() * 0.25);
      p.a = Math.random() * Math.PI * 2;
      p.s = 0.6 + Math.random() * 1.6;
      p.c = colours[(Math.random() * colours.length) | 0];
      p.o = 0.25 + Math.random() * 0.6;
      return p;
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nd = Math.min(window.devicePixelRatio || 1, 2);
      // Skip if nothing changed (e.g. mobile URL bar showing/hiding).
      if (rect.width === w && rect.height === h && nd === dpr && parts.length) return;
      dpr = nd;
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w > 960 ? w * 0.72 : w * 0.5;
      cy = w > 960 ? h * 0.48 : h * 0.32;
      // Keep existing particles so the swirl doesn't reset; just top up or trim.
      const count = Math.round(Math.min(520, (w * h) / 2600));
      while (parts.length < count) parts.push(spawn({}, true));
      parts.length = count;
      if (reduce) draw(true);
    };
    const draw = (still) => {
      ctx.fillStyle = still ? "rgba(6,10,19,1)" : "rgba(6,10,19,0.22)";
      ctx.fillRect(0, 0, w, h);
      // soft core glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.42);
      g.addColorStop(0, "rgba(56,189,248,0.10)");
      g.addColorStop(1, "rgba(56,189,248,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const px = pointer.active ? (pointer.x - cx) * 0.06 : 0;
      const py = pointer.active ? (pointer.y - cy) * 0.06 : 0;
      for (const p of parts) {
        if (!still) {
          const speed = 0.0009 + 18 / (p.r + 60) * 0.012;
          p.a += speed;
          p.r -= 0.12 + 22 / (p.r + 40);
          if (p.r < 6) spawn(p, false);
        }
        const squash = 0.62;
        const x = cx + Math.cos(p.a) * p.r + px * (p.r / 300);
        const y = cy + Math.sin(p.a) * p.r * squash + py * (p.r / 300);
        const fade = Math.min(1, p.r / 60);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${p.o * fade})`;
        ctx.arc(x, y, p.s, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    let raf = 0, visible = true;
    const loop = () => { draw(false); raf = requestAnimationFrame(loop); };
    resize();
    if (reduce) draw(true); else loop();
    // Watch the canvas itself: the hero's height settles after load (fonts,
    // content), which never fires a window resize event.
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true;
    }, { passive: true });
    // Stop drawing when the hero is off screen.
    if ("IntersectionObserver" in window && !reduce) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !visible) { visible = true; loop(); }
        else if (!e.isIntersecting && visible) { visible = false; cancelAnimationFrame(raf); }
      }).observe(canvas);
    }
  }

  // Blog: filter posts by tag, from ?tag= so the links can be shared.
  const tagLinks = [...document.querySelectorAll(".tag-filter a")];
  if (tagLinks.length) {
    const cards = [...document.querySelectorAll(".post-card[data-tags]")];
    const empty = document.querySelector(".tag-empty");
    const show = (tag) => {
      if (!tagLinks.some((a) => a.dataset.tag === tag)) tag = "";
      tagLinks.forEach((a) => a.setAttribute("aria-current", String(a.dataset.tag === tag)));
      let shown = 0;
      cards.forEach((c) => {
        const on = !tag || c.dataset.tags.split(" ").includes(tag);
        c.hidden = !on;
        if (on) { shown++; c.classList.add("in"); }
      });
      if (empty) empty.hidden = shown > 0;
    };
    tagLinks.forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      history.replaceState(null, "", a.href);
      show(a.dataset.tag);
    }));
    show(new URLSearchParams(location.search).get("tag") || "");
  }

  // Docs: highlight the section in view.
  const tocLinks = [...document.querySelectorAll(".toc a[href^='#']")];
  if (tocLinks.length && "IntersectionObserver" in window) {
    const byId = new Map(tocLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.remove("active"));
        byId.get(e.target.id)?.classList.add("active");
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  // Blog: reading progress.
  const bar = document.querySelector(".progress");
  const article = document.querySelector(".article");
  if (bar && article) {
    const update = () => {
      const r = article.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const pct = total > 0 ? Math.min(100, Math.max(0, (-r.top / total) * 100)) : 0;
      bar.style.width = `${pct}%`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
