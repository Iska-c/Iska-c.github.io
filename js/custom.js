/* =========================
   Shared right toolbar
========================= */
(function () {
  function getToolbar() {
    let toolbar = document.querySelector('.reader-tools');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'reader-tools';
      document.body.appendChild(toolbar);
    }
    return toolbar;
  }

  let hideTimer = null;

  function showToolbar() {
    const toolbar = getToolbar();
    toolbar.classList.add('is-visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      toolbar.classList.remove('is-visible');
    }, 2500);
  }

  window.ReaderToolbar = {
    getToolbar: getToolbar,
    show: showToolbar
  };
})();

/* =========================
   Chapter index collapsible
========================= */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.chapter-index').forEach(function (container) {
    if (container.dataset.collapsibleReady === 'true') return;
    container.dataset.collapsibleReady = 'true';

    const headings = Array.from(container.children);
    const sections = [];
    let currentSection = null;

    headings.forEach(function (node) {
      if (node.tagName === 'H3') {
        currentSection = {
          heading: node,
          children: []
        };
        sections.push(currentSection);
        return;
      }

      if (currentSection && node.tagName === 'H4') {
        currentSection.children.push(node);
      }
    });

    sections.forEach(function (section) {
      if (!section.children.length) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'chapter-index-section';

      section.heading.parentNode.insertBefore(wrapper, section.heading);
      wrapper.appendChild(section.heading);

      const children = document.createElement('div');
      children.className = 'chapter-index-children';
      wrapper.appendChild(children);

      section.children.forEach(function (child) {
        children.appendChild(child);
      });

      const toggle = document.createElement('button');
      toggle.className = 'chapter-index-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '展开章节');

      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        const expanded = wrapper.classList.toggle('is-expanded');
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });

      section.heading.appendChild(toggle);
    });
  });
});


/* =========================
   Reader font controls
========================= */
(function () {
  const KEY = 'reader-font-scale';
  const MIN = 0.85;
  const MAX = 1.35;
  const STEP = 0.05;

  function isReadingPage() {
    const path = window.location.pathname;

    // 排除目录页
    if (
      path === '/fly-or-fall/' ||
      path === '/fly-or-fall' ||
      path === '/race-condition/' ||
      path === '/race-condition' ||
      path === '/tokyo-trash-map/' ||
      path === '/tokyo-trash-map'
    ) {
      return false;
    }

    return !!document.querySelector('.markdown-body');
  }

  function clamp(value) {
    return Math.min(MAX, Math.max(MIN, value));
  }

  function applyScale(scale) {
    document.documentElement.style.setProperty('--reader-font-scale', scale);
    localStorage.setItem(KEY, String(scale));
  }

  function createControls() {
    if (!isReadingPage()) return;
    if (document.querySelector('.reader-font-controls')) return;

    document.documentElement.classList.add('reader-font-enabled');
    const toolbar = window.ReaderToolbar.getToolbar();

    const box = document.createElement('div');
    box.className = 'reader-font-controls';

    const smaller = document.createElement('button');
    smaller.textContent = 'A-';
    smaller.setAttribute('aria-label', '缩小字体');

    const reset = document.createElement('button');
    reset.textContent = 'A';
    reset.setAttribute('aria-label', '恢复默认字体');

    const larger = document.createElement('button');
    larger.textContent = 'A+';
    larger.setAttribute('aria-label', '放大字体');

    box.appendChild(smaller);
    box.appendChild(reset);
    box.appendChild(larger);
    toolbar.appendChild(box);

    let scale = parseFloat(localStorage.getItem(KEY) || '1');
    applyScale(scale);

    smaller.addEventListener('click', function () {
      scale = clamp(scale - STEP);
      applyScale(scale.toFixed(2));
    });

    reset.addEventListener('click', function () {
      scale = 1;
      applyScale(scale);
    });

    larger.addEventListener('click', function () {
      scale = clamp(scale + STEP);
      applyScale(scale.toFixed(2));
    });

    window.ReaderToolbar.show();
    window.addEventListener('scroll', window.ReaderToolbar.show, { passive: true });

    box.addEventListener('click', window.ReaderToolbar.show);
    box.addEventListener('touchstart', window.ReaderToolbar.show, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createControls);
  } else {
    createControls();
  }
})();


/* =========================
   Scroll up / down buttons
========================= */
(function () {
  function initScrollButtons() {
    const upBtn = document.querySelector('#scroll-top-button');
    if (!upBtn) return;
    const toolbar = window.ReaderToolbar.getToolbar();

    let downBtn = document.querySelector('#scroll-down-button');

    if (!downBtn) {
      downBtn = upBtn.cloneNode(true);
      downBtn.id = 'scroll-down-button';
      downBtn.setAttribute('aria-label', 'BOTTOM');
      downBtn.setAttribute('href', '#');
      downBtn.setAttribute('role', 'button');

      const icon = downBtn.querySelector('i');
      if (icon) {
        icon.className = 'iconfont icon-arrowup';
        icon.style.transform = 'rotate(180deg)';
      }
    }
    toolbar.insertBefore(downBtn, toolbar.firstChild);
    toolbar.insertBefore(upBtn, toolbar.firstChild);

    downBtn.addEventListener('click', function (event) {
      event.preventDefault();

      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    });
    window.ReaderToolbar.show();
    window.addEventListener('scroll', window.ReaderToolbar.show, { passive: true });

    upBtn.addEventListener('click', window.ReaderToolbar.show);
    downBtn.addEventListener('click', window.ReaderToolbar.show);
    upBtn.addEventListener('touchstart', window.ReaderToolbar.show, { passive: true });
    downBtn.addEventListener('touchstart', window.ReaderToolbar.show, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollButtons);
  } else {
    initScrollButtons();
  }
})();
