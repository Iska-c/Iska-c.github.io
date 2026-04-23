(function () {
  const KEY = 'reader-font-scale';
  const MIN = 0.85;
  const MAX = 1.35;
  const STEP = 0.05;

  function clamp(value) {
    return Math.min(MAX, Math.max(MIN, value));
  }

  function applyScale(scale) {
    document.documentElement.style.setProperty('--reader-font-scale', scale);
    localStorage.setItem(KEY, String(scale));
  }

  function createControls() {
    if (document.querySelector('.reader-font-controls')) return;

    const box = document.createElement('div');
    box.className = 'reader-font-controls';

    const smaller = document.createElement('button');
    smaller.textContent = 'A-';
    smaller.title = '缩小字体';

    const reset = document.createElement('button');
    reset.textContent = 'A';
    reset.title = '恢复默认';

    const larger = document.createElement('button');
    larger.textContent = 'A+';
    larger.title = '放大字体';

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