/**
 * 径径组件旁导游：先讲清产品，再逐功能详解并引导试用
 *
 * 1) 开场：知径是什么、有哪些功能
 * 2) 展示课表内逐屏：怎么用、有什么用、可动手试
 * 3) 收尾：催「新建路径」
 */
const OnboardingGuide = (() => {
  const SEEN_KEY = 'zhijing-onboarding-seen-v9';
  const AVATAR = 'assets/mascot/jingjing-point.png?v=20260717b';
  const AVATAR_CHEER = 'assets/mascot/jingjing-cheer.png?v=20260717b';
  const DEFAULT_HUB_DOC = '/doc/pm30/w1-pm-role';
  let step = 0;
  let api = null;
  let tourTimer = null;
  let repositionBound = null;

  function apiGuideBody() {
    return `打卡、阅读、术语<strong>都不依赖</strong>密钥。只有想要 AI 点评、一键生成专属课表、今日资讯时才需要开。<br>
      <ol class="onb-steps">
        <li>点「更多」里的「开启智能功能」</li>
        <li>填入 DeepSeek 密钥（点评 / 生成课表够用）</li>
        <li>想看资讯解读再另填搜索密钥</li>
      </ol>
      <button type="button" class="btn-primary onb-api-btn" data-onb-open-api>打开配置面板</button>`;
  }

  const STEPS = [
    {
      id: 'intro',
      title: '知径是做什么的？',
      say: '嗨，我是径径！先别急着点，让我用半分钟讲清：这个产品能帮你干什么。',
      body: `知径帮你<strong>按天学某个岗位方向</strong>——每天有任务与资料，练一练、打个卡，再用自己的话复述巩固。<br>
        <p class="onb-section-label">你能用到的功能</p>
        <ul class="onb-feat-list">
          <li><strong>今天</strong>：当日任务、资料、练习、打卡与复述</li>
          <li><strong>知识库</strong>：按模块阅读章节，把知识串起来</li>
          <li><strong>术语库</strong>：速查名词 + 闪卡复习，面试前特别好用</li>
          <li><strong>更多</strong>：资讯、练习复习、求职工具；智能功能可选增强</li>
        </ul>
        <p class="onb-tip">接下来我会用首页的<strong>展示样例</strong>带你进真实界面，一边讲一边让你试用。样例不是你的主线；最后再新建自己的岗位路径。</p>`,
      pose: 'cheer',
      tour: {
        home: true,
        spotlight: '.projects-hero, #projects-view',
      },
    },
    {
      id: 'showcase',
      title: '先认识「展示样例」',
      say: '首页这张默认课表只负责演示完整流程，方便你摸清按钮在哪。',
      body: `<strong>有什么用：</strong>不用先配密钥，就能体验「今天 → 知识库 → 术语」整条闭环。<br>
        <strong>怎么用：</strong>点卡片进入样例课表；学完引导后，请新建自己的路径当真学习。<br>
        <p class="onb-tip">点「下一步」，我带你进样例里的「今天」页。</p>`,
      pose: 'point',
      tour: {
        home: true,
        spotlight: '#projects-grid [data-open-project="pm-30-intro"], #projects-grid [data-open-project]',
      },
    },
    {
      id: 'today',
      title: '「今天」：每日主战场',
      say: '资料、练习、复述、打卡都在这一页。自建路径后，布局完全一样。',
      body: `<strong>有什么用：</strong>把一天的学习收成固定节奏——先看任务与资料，再动手练，最后打卡留痕。<br>
        <ol class="onb-steps">
          <li>上方看今日任务与推荐资料</li>
          <li>往下滚到练习区作答</li>
          <li>写一点费曼复述，点「完成打卡」</li>
        </ol>
        <p class="onb-tip">现在可以自己滚一滚页面，熟悉区块。准备好了点「下一步」看练习与打卡。</p>
        <button type="button" class="btn-secondary onb-try-btn" data-onb-try="practice">滚到练习区试一下</button>`,
      pose: 'point',
      tour: {
        enterDefault: true,
        focus: 'resources',
        spotlight: '#day-card, #resources-section',
      },
    },
    {
      id: 'practice',
      title: '练习 · 复述 · 打卡',
      say: '练习写一句也好，复述用自己的话更好。打卡是软门槛——没写完也会提醒你，但仍可打卡。',
      body: `<strong>有什么用：</strong>把「看过」变成「能讲出来」；连续打卡形成路径进度。<br>
        <ol class="onb-steps">
          <li>在练习框里按题意简单作答</li>
          <li>（可选）点「AI 参考」看点评——需先开智能功能</li>
          <li>在复述区用自己的话总结今天</li>
          <li>点「完成打卡」</li>
        </ol>
        <p class="onb-tip">高亮区可以动手试写；试用完点「下一步」。</p>
        <button type="button" class="btn-secondary onb-try-btn" data-onb-try="practice">再次定位到练习</button>`,
      pose: 'practice',
      tour: {
        enterDefault: true,
        focus: 'practice',
        spotlight: '#practice-section, #checkin-area',
      },
    },
    {
      id: 'hub',
      title: '知识库：系统阅读',
      say: '顶栏点「知识库」，按周/模块读章节。样例里已经塞好了入门文章。',
      body: `<strong>有什么用：</strong>不只碎片任务，还能顺着知识网络把岗位概念学完整。<br>
        <ol class="onb-steps">
          <li>顶栏切换到「知识库」</li>
          <li>左侧/目录选章节，右侧阅读</li>
          <li>读完可回到「今天」对照任务与练习</li>
        </ol>
        <p class="onb-tip">点下面按钮打开一篇示例章，随便翻翻再回来继续。</p>
        <button type="button" class="btn-secondary onb-try-btn" data-onb-try="hub">打开示例章节</button>`,
      pose: 'read',
      tour: {
        enterDefault: true,
        view: 'hub',
        hash: DEFAULT_HUB_DOC,
        spotlight: '#hub-view, #hub-frame, .nav-tab[data-view="hub"]',
      },
    },
    {
      id: 'glossary',
      title: '术语库：速查 + 闪卡',
      say: '面试前、写文档卡壳时，来这里查名词、刷闪卡最省事。',
      body: `<strong>有什么用：</strong>岗位黑话不用靠猜；反复翻卡把高频词记牢。<br>
        <ol class="onb-steps">
          <li>顶栏点「术语库」</li>
          <li>搜索或点词条看释义</li>
          <li>用闪卡模式快速过一遍</li>
        </ol>
        <p class="onb-tip">现在可以点开几个词条试试；样例词条已就绪。</p>
        <button type="button" class="btn-secondary onb-try-btn" data-onb-try="glossary">切到术语库</button>`,
      pose: 'think',
      tour: {
        enterDefault: true,
        view: 'glossary',
        spotlight: '.nav-tab[data-view="glossary"], #hub-view',
      },
    },
    {
      id: 'more',
      title: '「更多」里还有工具',
      say: '资讯、练习复习、求职准备都收在「更多」。日常打卡用不到也没关系。',
      body: `<strong>有什么用：</strong>主路径之外的增强——热点解读、错题/间隔复习、求职小工具。<br>
        <ul class="onb-feat-list">
          <li><strong>今日资讯</strong>：看行业热点（生成解读需智能功能）</li>
          <li><strong>练习与复习</strong>：把练过的题再捡起来</li>
          <li><strong>求职准备</strong>：面试相关辅助</li>
        </ul>
        <p class="onb-tip">可以点卡片逛一逛；逛完点「下一步」听智能功能说明。</p>`,
      pose: 'point',
      tour: {
        enterDefault: true,
        view: 'more',
        spotlight: '#more-view',
      },
    },
    {
      id: 'api',
      title: '智能功能：可选增强',
      say: '主线学习不强制开 AI。密钥只是让点评、生成课表、资讯更聪明。',
      body: apiGuideBody,
      pose: 'shy',
      tour: {
        enterDefault: true,
        view: 'more',
        spotlight: '#more-view, [data-open-onboarding-api], #btn-ai-settings',
      },
    },
    {
      id: 'create',
      title: '该建自己的路径了',
      say: '样例流程你已经走过一遍。真正要学的岗位，请新建一条专属路径。',
      body: `默认课表<strong>只展示用法</strong>；自己的路径才是主线。<br>
        <ol class="onb-steps">
          <li>回首页点「新建路径」</li>
          <li>填行业 / 岗位（与天数）</li>
          <li>需要时再勾选用智能功能生成专属课表</li>
        </ol>
        <button type="button" class="btn-primary onb-api-btn" data-onb-open-create>去新建路径</button>`,
      pose: 'cheer',
      tour: {
        home: true,
        spotlight: '#btn-create-project',
      },
    },
  ];

  const POSE_SRC = {
    point: AVATAR,
    practice: 'assets/mascot/jingjing-practice.png?v=20260717b',
    read: 'assets/mascot/jingjing-read.png?v=20260717b',
    think: 'assets/mascot/jingjing-think.png?v=20260717b',
    shy: 'assets/mascot/jingjing-shy.png?v=20260717b',
    cheer: AVATAR_CHEER,
  };

  function els() {
    return {
      root: document.getElementById('onboarding-modal'),
      coach: document.getElementById('onb-coach'),
      img: document.getElementById('onb-coach-img'),
      title: document.getElementById('onboarding-title'),
      body: document.getElementById('onboarding-body'),
      say: document.getElementById('onboarding-say'),
      stepLabel: document.getElementById('onboarding-step'),
      dots: document.getElementById('onboarding-dots'),
      prev: document.getElementById('onboarding-prev'),
      next: document.getElementById('onboarding-next'),
      skip: document.getElementById('onboarding-skip'),
      kicker: document.querySelector('#onboarding-modal .onb-kicker'),
    };
  }

  function clearSpotlight() {
    document.querySelectorAll('.onb-spotlight').forEach((el) => el.classList.remove('onb-spotlight'));
  }

  function firstMatch(selector) {
    if (!selector) return null;
    const parts = String(selector)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const sel of parts) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function applySpotlight(selector) {
    clearSpotlight();
    const el = firstMatch(selector);
    if (!el) return null;
    el.classList.add('onb-spotlight');
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } catch {
      /* ignore */
    }
    return el;
  }

  function placeCoach(anchor) {
    const { coach } = els();
    if (!coach) return;

    const gap = 10;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cw = coach.offsetWidth || 380;
    const ch = coach.offsetHeight || 280;

    let left;
    let top;
    let side = 'right';

    if (anchor) {
      const r = anchor.getBoundingClientRect();
      if (r.right + gap + cw <= vw - 8) {
        left = r.right + gap;
        top = Math.min(Math.max(8, r.top), vh - ch - 8);
        side = 'right';
      } else if (r.left - gap - cw >= 8) {
        left = r.left - gap - cw;
        top = Math.min(Math.max(8, r.top), vh - ch - 8);
        side = 'left';
      } else {
        left = Math.min(Math.max(8, r.left), vw - cw - 8);
        top = Math.min(r.bottom + gap, vh - ch - 8);
        if (top < 8) top = 8;
        side = 'right';
      }
    } else {
      left = Math.max(8, vw - cw - 16);
      top = Math.max(8, Math.min(vh - ch - 16, vh * 0.18));
      side = 'left';
    }

    coach.dataset.side = side;
    coach.style.left = `${Math.round(left)}px`;
    coach.style.top = `${Math.round(top)}px`;
    coach.style.right = 'auto';
    coach.style.bottom = 'auto';
  }

  function defaultProjectId() {
    if (typeof api?.getDefaultProjectId === 'function') return api.getDefaultProjectId();
    if (typeof ProjectPlatform !== 'undefined' && ProjectPlatform.DEFAULT_ID) {
      return ProjectPlatform.DEFAULT_ID;
    }
    return 'pm-30-intro';
  }

  function applyTour(tour) {
    clearTimeout(tourTimer);
    if (!tour) {
      clearSpotlight();
      placeCoach(null);
      return;
    }

    const run = () => {
      if (tour.home && typeof api?.showHome === 'function') api.showHome();
      if (tour.enterDefault && typeof api?.enterProject === 'function') {
        api.enterProject(defaultProjectId(), { focus: tour.focus || 'sprint' });
      }

      tourTimer = setTimeout(() => {
        if (tour.view && typeof api?.switchView === 'function') {
          api.switchView(tour.view, tour.hash || '');
        } else if (tour.focus && tour.enterDefault && typeof api?.focusSection === 'function') {
          api.focusSection(tour.focus);
        }
        const anchor = tour.spotlight ? applySpotlight(tour.spotlight) : null;
        requestAnimationFrame(() => {
          placeCoach(anchor);
          setTimeout(() => placeCoach(anchor || firstMatch(tour.spotlight)), 120);
          setTimeout(() => placeCoach(anchor || firstMatch(tour.spotlight)), 360);
        });
      }, tour.enterDefault ? 240 : 80);
    };
    requestAnimationFrame(run);
  }

  function tryAction(kind) {
    if (kind === 'practice') {
      if (typeof api?.enterProject === 'function') {
        api.enterProject(defaultProjectId(), { focus: 'practice' });
      }
      setTimeout(() => {
        if (typeof api?.focusSection === 'function') api.focusSection('practice');
        const anchor = applySpotlight('#practice-section, #checkin-area');
        placeCoach(anchor);
      }, 200);
      return;
    }
    if (kind === 'hub') {
      if (typeof api?.enterProject === 'function') {
        api.enterProject(defaultProjectId(), { focus: 'sprint' });
      }
      setTimeout(() => {
        if (typeof api?.switchView === 'function') {
          api.switchView('hub', DEFAULT_HUB_DOC);
        }
        const anchor = applySpotlight('#hub-view, #hub-frame, .nav-tab[data-view="hub"]');
        placeCoach(anchor);
      }, 200);
      return;
    }
    if (kind === 'glossary') {
      if (typeof api?.enterProject === 'function') {
        api.enterProject(defaultProjectId(), { focus: 'sprint' });
      }
      setTimeout(() => {
        if (typeof api?.switchView === 'function') api.switchView('glossary');
        const anchor = applySpotlight('.nav-tab[data-view="glossary"], #hub-view');
        placeCoach(anchor);
      }, 200);
    }
  }

  function openApiSettings() {
    if (typeof api?.openSettings === 'function') {
      api.openSettings();
      return;
    }
    document.getElementById('ai-key-modal')?.classList.add('open');
  }

  function openCreatePath() {
    close(true);
    if (typeof api?.showHome === 'function') api.showHome();
    setTimeout(() => {
      if (typeof api?.openCreate === 'function') api.openCreate();
      else document.getElementById('btn-create-project')?.click();
    }, 80);
  }

  function render() {
    const { root, title, body, say, stepLabel, dots, prev, next, img, kicker } = els();
    const s = STEPS[step];
    if (!s) return;
    if (kicker) {
      kicker.textContent = s.id === 'intro' ? '径径先介绍产品' : '径径陪你上手';
    }
    if (title) title.textContent = s.title;
    if (say) say.textContent = s.say || '';
    if (body) body.innerHTML = typeof s.body === 'function' ? s.body() : s.body || '';
    if (img) img.src = POSE_SRC[s.pose] || AVATAR;
    if (stepLabel) stepLabel.textContent = `${step + 1} / ${STEPS.length}`;
    if (dots) {
      dots.innerHTML = STEPS.map(
        (_, i) => `<span class="onb-dot${i === step ? ' active' : ''}"></span>`
      ).join('');
    }
    if (prev) prev.hidden = step === 0;
    if (next) {
      if (s.id === 'intro') next.textContent = '了解功能 →';
      else if (s.id === 'create') next.textContent = '去新建路径';
      else if (step === STEPS.length - 2) next.textContent = '最后一步';
      else next.textContent = '下一步';
    }
    if (root?.classList.contains('open')) applyTour(s.tour || null);
  }

  function bindReposition() {
    if (repositionBound) return;
    repositionBound = () => {
      if (!els().root?.classList.contains('open')) return;
      const s = STEPS[step];
      const anchor = s?.tour?.spotlight ? firstMatch(s.tour.spotlight) : null;
      placeCoach(anchor);
    };
    window.addEventListener('resize', repositionBound);
    window.addEventListener('scroll', repositionBound, true);
  }

  function open(fromStart = true) {
    if (fromStart) step = 0;
    const { root } = els();
    root?.classList.add('open');
    document.body.classList.add('onb-tour-active');
    if (typeof MascotCompanion !== 'undefined' && MascotCompanion.hide) {
      try {
        MascotCompanion.hide();
      } catch {
        /* ignore */
      }
    }
    bindReposition();
    render();
  }

  function openApiStep() {
    const idx = STEPS.findIndex((s) => s.id === 'api');
    step = idx >= 0 ? idx : 0;
    const { root } = els();
    root?.classList.add('open');
    document.body.classList.add('onb-tour-active');
    bindReposition();
    render();
  }

  function close(markSeen = true) {
    clearTimeout(tourTimer);
    clearSpotlight();
    const { root } = els();
    root?.classList.remove('open');
    document.body.classList.remove('onb-tour-active');
    if (markSeen) localStorage.setItem(SEEN_KEY, '1');
    if (typeof api?.onClose === 'function') api.onClose();
    if (document.body.classList.contains('mode-home') && typeof MascotCompanion !== 'undefined') {
      try {
        MascotCompanion.show?.();
      } catch {
        /* ignore */
      }
    }
  }

  function next() {
    const s = STEPS[step];
    if (step >= STEPS.length - 1 || s?.id === 'create') {
      if (s?.id === 'create') {
        openCreatePath();
        return;
      }
      close(true);
      return;
    }
    step += 1;
    render();
  }

  function prev() {
    if (step <= 0) return;
    step -= 1;
    render();
  }

  function hasSeen() {
    return localStorage.getItem(SEEN_KEY) === '1';
  }

  function bind() {
    els().next?.addEventListener('click', next);
    els().prev?.addEventListener('click', prev);
    els().skip?.addEventListener('click', () => close(true));
    els().root?.addEventListener('click', (e) => {
      if (e.target.closest('[data-onb-open-api]')) {
        e.preventDefault();
        openApiSettings();
      }
      if (e.target.closest('[data-onb-open-create]')) {
        e.preventDefault();
        openCreatePath();
      }
      const tryBtn = e.target.closest('[data-onb-try]');
      if (tryBtn) {
        e.preventDefault();
        tryAction(tryBtn.getAttribute('data-onb-try'));
      }
    });
    document.querySelectorAll('[data-open-onboarding]').forEach((btn) => {
      btn.addEventListener('click', () => open(true));
    });
    document.querySelectorAll('[data-open-onboarding-api]').forEach((btn) => {
      btn.addEventListener('click', () => openApiStep());
    });
  }

  function init(opts = {}) {
    api = opts;
    bind();
    if (!hasSeen() && opts.autoOpen !== false) {
      const tryShow = () => {
        if (document.body.classList.contains('splash-active')) {
          setTimeout(tryShow, 400);
          return;
        }
        open(true);
      };
      setTimeout(tryShow, 500);
    }
    return { open, openApiStep, close, hasSeen };
  }

  return { init, open, openApiStep, close, hasSeen };
})();
