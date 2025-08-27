(function () {
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ========= Persistence (safe) =========
  const store = {
    get(key, fallback = null) {
      try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem(key, val); } catch { /* ignore quota/private mode */ }
    }
  };

  // ========= Theme handling (dark | light | auto) =========
  const themeBtn = $('#themeToggle');
  const sysPrefersLight = window.matchMedia('(prefers-color-scheme: light)');

  const resolveTheme = (mode) => (mode === 'auto' ? (sysPrefersLight.matches ? 'light' : 'dark') : mode);

  const setThemeIcon = (resolved, mode) => {
    if (!themeBtn) return;
    const icon =
      mode === 'auto'
        ? '<i class="fa-sharp fa-solid fa-circle-half-stroke"></i>'
        : (resolved === 'dark'
            ? '<i class="fa-sharp fa-solid fa-moon"></i>'
            : '<i class="fa-sharp fa-solid fa-sun"></i>');
    themeBtn.innerHTML = icon;
    themeBtn.title = `Theme: ${mode.toUpperCase()} (click to cycle)`;
    themeBtn.setAttribute('aria-label', `Switch theme (current: ${mode})`);
  };

  const setTheme = (mode, { persist = true } = {}) => {
    const resolved = resolveTheme(mode);
    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-bs-theme', resolved);         // Bootstrap sync
    root.setAttribute('data-theme-mode', mode);           // remember chosen mode
    setThemeIcon(resolved, mode);
    if (persist) store.set('kd_theme_mode', mode);
  };

  // live update when OS preference changes (only if in auto)
  const sysChangeHandler = () => {
    if ((store.get('kd_theme_mode') ?? 'auto') === 'auto') setTheme('auto', { persist: false });
  };
  if (sysPrefersLight.addEventListener) {
    sysPrefersLight.addEventListener('change', sysChangeHandler);
  } else if (sysPrefersLight.addListener) {
    // Safari <14 fallback
    sysPrefersLight.addListener(sysChangeHandler);
  }

  // Init theme: user choice or auto
  setTheme(store.get('kd_theme_mode') ?? 'auto');

  // Cycle theme: dark -> light -> auto -> dark
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const cur = root.getAttribute('data-theme-mode') || 'auto';
      const next = cur === 'dark' ? 'light' : cur === 'light' ? 'auto' : 'dark';
      setTheme(next);
    });
  }

  // ========= Accent presets =========
  const applyAccent = (val) => {
    root.setAttribute('data-accent', val);
    store.set('kd_accent', val);
    // visual/aria state
    $$('[data-accent]').forEach((b) => {
      const on = b.getAttribute('data-accent') === val;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  };

  const savedAccent = store.get('kd_accent', 'sky');
  applyAccent(savedAccent);

  // Delegate clicks for accents
  $$('.btn-group [data-accent], [data-accent]').forEach((btn) => {
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', (e) => {
      const val = e.currentTarget.getAttribute('data-accent');
      if (val) applyAccent(val);
    });
  });

  // ========= Print =========
  const printBtn = $('#printBtn');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  // ========= Search (filters Kanban tickets + updates counts) =========
  const searchInput = $('#search');
  const kanban = $('.kanban');
  const columns = kanban ? $$('.column', kanban) : [];
  const tickets = kanban ? $$('.ticket', kanban) : [];

  const debounce = (fn, wait = 150) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  const updateColumnBadges = () => {
    columns.forEach((col) => {
      const badge = $('.col-title .badge', col);
      if (!badge) return;
      const visible = $$('.ticket', col).filter((el) => el.style.display !== 'none').length;
      badge.textContent = String(visible);
    });
  };

  const applySearch = (query) => {
    const q = (query || '').trim().toLowerCase();
    tickets.forEach((card) => {
      const ok = !q || card.textContent.toLowerCase().includes(q);
      card.style.display = ok ? '' : 'none';
    });
    updateColumnBadges();
  };

  if (searchInput && kanban) {
    searchInput.setAttribute('autocomplete', 'off');
    searchInput.setAttribute('spellcheck', 'false');
    searchInput.addEventListener('input', debounce((e) => applySearch(e.target.value), 160));
  }

  // ========= Scrollspy (sidebar nav) =========
  const navLinks = $$('.links .nav-link');
  const sections = navLinks
    .map((a) => a.getAttribute('href'))
    .filter((h) => h && h.startsWith('#'))
    .map((id) => $(id))
    .filter(Boolean);

  if (sections.length && navLinks.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        // choose the most visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio - a.intersectionRatio));
        if (!visible.length) return;
        const id = '#' + visible[0].target.id;
        navLinks.forEach((lnk) => lnk.classList.toggle('active', lnk.getAttribute('href') === id));
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0.01, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((sec) => spy.observe(sec));
  }

  // ========= Keyboard shortcuts =========
  document.addEventListener('keydown', (e) => {
    const tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
    const inField = tag === 'input' || tag === 'textarea';

    // Ctrl/Cmd+K or "/" -> focus search
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !inField)) {
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select?.();
      }
    }

    // "t" toggles theme (cycles)
    if (e.key.toLowerCase() === 't' && !inField && !e.ctrlKey && !e.metaKey && themeBtn) {
      e.preventDefault();
      themeBtn.click();
    }
  });

})();

// === Contact: copy email ===
(() => {
  const btn = document.getElementById('copyEmailBtn');
  if (!btn) return;

  // Bootstrap tooltip (optional)
  if (window.bootstrap) {
    new bootstrap.Tooltip(btn);
  }

  btn.addEventListener('click', async () => {
    const email = btn.getAttribute('data-email');
    const status = document.getElementById('copyEmailStatus');
    try {
      await navigator.clipboard.writeText(email);
      btn.setAttribute('data-bs-original-title', 'Copied!');
      if (window.bootstrap) bootstrap.Tooltip.getInstance(btn)?.show();
      if (status) status.textContent = 'Email copied to clipboard.';
      setTimeout(() => {
        btn.setAttribute('data-bs-original-title', 'Copy email to clipboard');
        if (window.bootstrap) bootstrap.Tooltip.getInstance(btn)?.hide();
        if (status) status.textContent = '';
      }, 1500);
    } catch {
      if (status) status.textContent = email; // fallback: expose email for screen readers
    }
  });
})();
