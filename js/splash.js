/**
 * 开屏：单场景品牌入场 + 气泡闲聊 / 轻漂浮（不切整图、不加眼皮）。
 */
const SplashGate = (() => {
  const SESSION_KEY = 'zhijing-splash-entered';
  const LINES = [
    '嗨～准备好上路了吗？',
    '每天一点点，岗位能力就到手啦！',
    '点「开始学习」，径径陪你走～',
    '打卡、练习、复述，一步步来。',
    '智能功能可选，先免费学也完全 OK。',
  ];

  let api = null;
  let lineTimer = null;
  let speakTimer = null;
  let lineIndex = 0;

  function hasKey() {
    return typeof AiReview !== 'undefined' && AiReview.hasApiKey();
  }

  function els() {
    return {
      root: document.getElementById('splash-gate'),
      enter: document.getElementById('splash-enter'),
      config: document.getElementById('splash-config'),
      hint: document.getElementById('splash-hint'),
      status: document.getElementById('splash-api-status'),
      brand: document.getElementById('splash-brand'),
      mascot: document.getElementById('splash-mascot'),
      bubble: document.getElementById('splash-mascot-bubble'),
    };
  }

  function speakLine(text, ms = 2200) {
    const { bubble, mascot } = els();
    if (bubble) {
      bubble.textContent = text;
      bubble.classList.remove('is-swap');
      void bubble.offsetWidth;
      bubble.classList.add('is-swap');
    }
    if (!mascot) return;
    clearTimeout(speakTimer);
    mascot.classList.add('is-speaking');
    speakTimer = setTimeout(() => mascot.classList.remove('is-speaking'), ms);
  }

  function startChatter() {
    clearTimeout(lineTimer);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
      lineTimer = setTimeout(() => {
        const { root } = els();
        if (!root || root.hasAttribute('hidden') || root.classList.contains('is-exit')) return;
        lineIndex = (lineIndex + 1) % LINES.length;
        speakLine(LINES[lineIndex], 2000 + Math.min(800, LINES[lineIndex].length * 36));
        tick();
      }, reduce ? 12000 : 6500 + Math.floor(Math.random() * 3500));
    };
    setTimeout(() => speakLine(LINES[0], 2400), 900);
    tick();
  }

  function stopMascotFx() {
    clearTimeout(lineTimer);
    clearTimeout(speakTimer);
    lineTimer = null;
    speakTimer = null;
    const { mascot } = els();
    mascot?.classList.remove('is-speaking');
  }

  function refreshStatus() {
    const { status, enter, hint } = els();
    const ok = hasKey();
    if (status) {
      status.dataset.state = ok ? 'ready' : 'need';
      status.textContent = ok
        ? '智能功能已开启'
        : '可先免费学习 · 智能功能可选开启';
    }
    if (enter) {
      enter.setAttribute('aria-disabled', 'false');
      enter.classList.remove('is-locked');
    }
    if (hint && !hint.dataset.ok) {
      if (!hint.classList.contains('is-shake')) hint.hidden = true;
    }
  }

  function openApp() {
    const { root } = els();
    stopMascotFx();
    document.body.classList.remove('splash-active');
    document.body.classList.add('splash-exiting');
    root?.classList.add('is-exit');
    sessionStorage.setItem(SESSION_KEY, '1');

    const done = () => {
      document.body.classList.remove('splash-exiting');
      root?.setAttribute('hidden', '');
      root?.setAttribute('aria-hidden', 'true');
      if (typeof api?.onEntered === 'function') api.onEntered();
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !root) {
      done();
      return;
    }
    root.addEventListener('animationend', done, { once: true });
    setTimeout(done, 900);
  }

  function tryEnter() {
    const { hint } = els();
    if (hint) hint.hidden = true;
    openApp();
  }

  function openConfig() {
    if (typeof api?.openSettings === 'function') {
      api.openSettings();
    } else if (typeof AiReview !== 'undefined') {
      AiReview.openSettingsModal();
    } else {
      document.getElementById('ai-key-modal')?.classList.add('open');
    }
  }

  function shouldSkip() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  function bind() {
    const { enter, config, root } = els();
    enter?.addEventListener('click', tryEnter);
    config?.addEventListener('click', openConfig);

    root?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target === enter) tryEnter();
    });
  }

  function show() {
    const { root } = els();
    document.body.classList.add('splash-active');
    root?.removeAttribute('hidden');
    root?.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => root?.classList.add('is-ready'));
    refreshStatus();
    startChatter();
  }

  function hideImmediate() {
    stopMascotFx();
    const { root } = els();
    document.body.classList.remove('splash-active', 'splash-exiting');
    root?.setAttribute('hidden', '');
    root?.setAttribute('aria-hidden', 'true');
  }

  function init(opts = {}) {
    api = opts;
    bind();

    document.getElementById('ai-key-save')?.addEventListener('click', () => {
      setTimeout(() => {
        refreshStatus();
        if (hasKey()) {
          const { hint } = els();
          if (hint) {
            hint.hidden = false;
            hint.textContent = '智能功能已开启，现在可以开始学习。';
            hint.classList.remove('is-shake');
            hint.dataset.ok = '1';
          }
          speakLine('智能功能开好啦，一起出发吧！', 2200);
        }
      }, 0);
    });

    document.getElementById('ai-key-clear')?.addEventListener('click', () => {
      setTimeout(refreshStatus, 0);
    });

    if (shouldSkip()) {
      hideImmediate();
      if (typeof api?.onEntered === 'function') api.onEntered();
      return { refreshStatus, tryEnter };
    }

    show();
    return { refreshStatus, tryEnter };
  }

  return { init, refreshStatus };
})();
