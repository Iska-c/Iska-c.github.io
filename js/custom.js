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
    }, 1800);
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
      toggle.innerHTML = '<i class="iconfont icon-arrowright" aria-hidden="true"></i>';

      function setExpanded(expanded) {
        wrapper.classList.toggle('is-expanded', expanded);
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        section.heading.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      }

      function toggleExpanded() {
        setExpanded(!wrapper.classList.contains('is-expanded'));
      }

      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleExpanded();
      });

      section.heading.classList.add('chapter-index-heading');
      section.heading.setAttribute('role', 'button');
      section.heading.setAttribute('tabindex', '0');
      section.heading.setAttribute('aria-expanded', 'false');

      section.heading.addEventListener('click', function (event) {
        if (event.target.closest('a')) return;
        toggleExpanded();
      });

      section.heading.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggleExpanded();
      });

      setExpanded(false);
      section.heading.appendChild(toggle);
    });
  });
});


/* =========================
   Reader font controls
========================= */
(function () {
  const KEY = 'reader-font-scale';
  const MIN = 0.65;
  const MAX = 1.35;
  const STEP = 0.05;

  function clamp(value) {
    return Math.min(MAX, Math.max(MIN, value));
  }

  function applyScale(scale) {
    document.documentElement.style.setProperty('--reader-font-scale', scale);
    localStorage.setItem(KEY, String(scale));

    document.querySelectorAll('.tagcloud a').forEach(function (link) {
      if (!link.dataset.readerFontBaseSize) {
        link.dataset.readerFontBaseSize = link.style.fontSize || window.getComputedStyle(link).fontSize;
      }

      link.style.fontSize = 'calc(' + link.dataset.readerFontBaseSize + ' * ' + scale + ')';
    });
  }

  function createControls() {
    document.documentElement.classList.add('reader-font-enabled');

    let scale = clamp(parseFloat(localStorage.getItem(KEY) || '1') || 1);
    applyScale(scale);

    if (document.querySelector('.reader-font-controls')) return;

    const colorToggleItem = document.querySelector('#color-toggle-btn');
    const navList = colorToggleItem && colorToggleItem.parentNode;
    if (!navList) return;

    const item = document.createElement('li');
    item.className = 'nav-item reader-font-nav-item';

    const box = document.createElement('div');
    box.className = 'nav-link reader-font-controls';

    function createFontButton(text, label) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'reader-font-link';
      button.textContent = text;
      button.setAttribute('aria-label', label);
      return button;
    }

    const smallerControl = createFontButton('A-', '缩小字体');
    const resetControl = createFontButton('A', '恢复默认字体');
    const largerControl = createFontButton('A+', '放大字体');

    box.appendChild(smallerControl);
    box.appendChild(resetControl);
    box.appendChild(largerControl);
    item.appendChild(box);

    if (colorToggleItem.nextSibling) {
      navList.insertBefore(item, colorToggleItem.nextSibling);
    } else {
      navList.appendChild(item);
    }

    smallerControl.addEventListener('click', function () {
      scale = clamp(scale - STEP);
      applyScale(scale.toFixed(2));
    });

    resetControl.addEventListener('click', function () {
      scale = 1;
      applyScale(scale);
    });

    largerControl.addEventListener('click', function () {
      scale = clamp(scale + STEP);
      applyScale(scale.toFixed(2));
    });
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
        icon.classList.add('scroll-down-icon');
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
