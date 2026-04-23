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
