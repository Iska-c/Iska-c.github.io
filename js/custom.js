document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.chapter-index').forEach(function (container) {
    if (container.dataset.collapsibleReady === 'true') return;
    container.dataset.collapsibleReady = 'true';

    var headings = Array.from(container.children);
    var sections = [];
    var currentSection = null;

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

      var wrapper = document.createElement('div');
      wrapper.className = 'chapter-index-section';
      section.heading.parentNode.insertBefore(wrapper, section.heading);
      wrapper.appendChild(section.heading);

      var children = document.createElement('div');
      children.className = 'chapter-index-children';
      wrapper.appendChild(children);
      section.children.forEach(function (child) {
        children.appendChild(child);
      });

      var toggle = document.createElement('button');
      toggle.className = 'chapter-index-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '展开章节');

      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var expanded = wrapper.classList.toggle('is-expanded');
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });

      section.heading.appendChild(toggle);
    });
  });
});


(function () {
  const KEY = 'reader-font-scale';
  const MIN = 0.85;
  const MAX = 1.35;
  const STEP = 0.05;

  function isReadingPage() {
  const path = window.location.pathname;

  // 排除目录页
  if (path === '/fly-or-fall/' || path === '/race-condition' || path === '/tokyo-trash-map/') {
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
    // 只有正文页才显示
    if (!isReadingPage()) return;
    if (document.querySelector('.reader-font-controls')) return;
    document.documentElement.classList.add('reader-font-enabled');

    const box = document.createElement('div');
    box.className = 'reader-font-controls';

    const smaller = document.createElement('button');
    smaller.textContent = 'A-';

    const reset = document.createElement('button');
    reset.textContent = 'A';

    const larger = document.createElement('button');
    larger.textContent = 'A+';

    box.appendChild(smaller);
    box.appendChild(reset);
    box.appendChild(larger);
    document.body.appendChild(box);

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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createControls);
  } else {
    createControls();
  }
})();