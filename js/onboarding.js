/**
 * 径径使用指南：讲解 + 使用场景 + 右侧演示立绘
 * 首次进入自动弹出，之后可随时点「指南 / 使用指南」重看
 */
const OnboardingGuide = (() => {
  const SEEN_KEY = 'zhijing-onboarding-seen-v3';
  const ASSET = 'assets/guide';
  let step = 0;
  let api = null;

  function apiGuideBody() {
    const isDesktop =
      typeof document !== 'undefined' && document.documentElement?.dataset?.zhijingDesktop === '1';
    if (isDesktop) {
      return `智能功能用于：练习点评、今日资讯、生成专属课表与术语等。<strong>打卡本身不依赖它。</strong><br><br>
        桌面版已<strong>内置本地服务</strong>，不必再运行启动脚本。<br><br>
        <ol class="onb-steps">
          <li>点下方 <strong>「去配置密钥」</strong>，或之后在「更多 → 开启智能功能」。</li>
          <li>填写 <strong>DeepSeek 密钥</strong>（练习点评、生成课表够用）。<br>
            获取：<a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer">platform.deepseek.com/api_keys</a></li>
          <li>若要用「今日资讯」，再填 <strong>搜索密钥</strong>（推荐<a href="https://open.bochaai.com/" target="_blank" rel="noopener noreferrer">博查</a>）。</li>
          <li>点 <strong>「保存并开启」</strong>。密钥只保存在你自己的电脑上。</li>
        </ol>
        <button type="button" class="btn-primary onb-api-btn" data-onb-open-api>去配置密钥</button>`;
    }
    return `智能功能用于：练习点评、今日资讯、生成专属课表与术语等。<strong>打卡本身不依赖它。</strong><br><br>
        <ol class="onb-steps">
          <li>用桌面上的 <strong>「启动本地服务」</strong> 打开本产品（或直接使用桌面安装版）。</li>
          <li>点下方 <strong>「去配置密钥」</strong>，或之后在「更多 → 开启智能功能」。</li>
          <li>填写 <strong>DeepSeek 密钥</strong>（练习点评、生成课表够用）。<br>
            获取：<a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer">platform.deepseek.com/api_keys</a></li>
          <li>若要用「今日资讯」，再填 <strong>搜索密钥</strong>（推荐<a href="https://open.bochaai.com/" target="_blank" rel="noopener noreferrer">博查</a>）。</li>
          <li>点 <strong>「保存并开启」</strong>。密钥只保存在你自己的浏览器里。</li>
        </ol>
        <button type="button" class="btn-primary onb-api-btn" data-onb-open-api>去配置密钥</button>`;
  }

  const STEPS = [
    {
      title: '嗨～我是径径',
      say: '我来带你快速熟悉知径。不用慌，跟着场景走一遍就懂啦。',
      scene: '你刚打开知径，首页能看到路径卡片和「新建路径」。',
      body: `知径帮你<strong>按天学一个岗位</strong>：今天学什么、练什么、怎么打卡，都排好了。<br><br>
        默认示例课表可以先逛逛；真正开始前，建议<strong>新建一条属于你的路径</strong>。`,
      image: `${ASSET}/guide-scene-welcome.jpg?v=4`,
      caption: '径径：在首页介绍路径列表',
    },
    {
      title: '先创建自己的路径',
      say: '点「新建路径」，填行业和岗位——这条路才是你的。',
      scene: '你在创建弹窗里填写名称、行业、岗位，可选智能生成专属课表。',
      body: `<strong>路径 = 一条完整的学习计划</strong>（常见 30 / 60 / 90 天）。<br><br>
        · 每天有主题与任务<br>
        · 可打卡、记笔记、做练习<br>
        · 可配知识库、术语库<br><br>
        右下角的径径也会在你创建后，开始提醒今日练习与打卡。`,
      image: `${ASSET}/guide-scene-create.jpg?v=4`,
      caption: '径径：演示新建路径',
    },
    {
      title: '进入「今天」开始学',
      say: '打开路径后，优先看「今天」：资料 → 练习 → 复述 → 打卡。',
      scene: '你坐在书桌前，按当天清单完成练习并点完成打卡。',
      body: `1. 首页点路径的 <strong>「开始学习」</strong><br>
        2. 顶栏（手机在底部）切换：今天 / 知识库 / 术语库 / 更多<br><br>
        <strong>今天</strong>：看资料与练习 → 可用自己的话复述 → 点「完成打卡」。一点点就好。`,
      image: `${ASSET}/guide-scene-today.jpg?v=4`,
      caption: '径径：完成今日任务与打卡',
    },
    {
      title: '知识库 · 术语库',
      say: '学不懂的地方，就去知识库深挖；面试前翻术语库最管用。',
      scene: '你在知识库阅读章节，并在术语库速查专属名词。',
      body: `<strong>知识库</strong>：系统阅读章节，配合当天任务深入了解。<br><br>
        <strong>术语库</strong>：本路径的专属名词释义，预习复习、面试前速查。<br><br>
        专属路径可点「生成阅读与术语」（需已配置密钥）。`,
      image: `${ASSET}/guide-scene-hub.jpg?v=4`,
      caption: '径径：查阅知识库与术语',
    },
    {
      id: 'api',
      title: '智能功能（可选）',
      say: '打卡不强制开 AI。想要点评、生成课表、资讯时，再配置密钥就好。',
      scene: '你在设置里填写密钥并保存，开启练习点评等增强能力。',
      body: apiGuideBody,
      image: `${ASSET}/guide-scene-api.jpg?v=4`,
      caption: '径径：配置智能功能',
    },
    {
      title: '可以出发啦',
      say: '记住口诀：选路径 → 今天打卡；需要 AI 再开密钥。径径一直在首页陪你～',
      scene: '你完成上手，准备按自己的节奏开始第一天。',
      body: `<strong>选路径 → 「今天」打卡</strong>（随时可学）<br>
        需要 AI 时再 <strong>配置密钥</strong><br><br>
        「更多」里还有：今日资讯、闪卡复习、求职准备等。<br>
        指南可随时在顶栏「指南」或首页按钮重看。`,
      image: `${ASSET}/guide-scene-ready.jpg?v=4`,
      caption: '径径：准备好上路了',
    },
  ];

  function els() {
    return {
      overlay: document.getElementById('onboarding-modal'),
      title: document.getElementById('onboarding-title'),
      body: document.getElementById('onboarding-body'),
      say: document.getElementById('onboarding-say'),
      scene: document.getElementById('onboarding-scene'),
      img: document.getElementById('onboarding-scene-img'),
      caption: document.getElementById('onboarding-caption'),
      stepLabel: document.getElementById('onboarding-step'),
      dots: document.getElementById('onboarding-dots'),
      prev: document.getElementById('onboarding-prev'),
      next: document.getElementById('onboarding-next'),
      skip: document.getElementById('onboarding-skip'),
    };
  }

  function openApiSettings() {
    if (typeof api?.openSettings === 'function') {
      api.openSettings();
      return;
    }
    if (typeof AiReview !== 'undefined' && AiReview.openSettingsModal) {
      AiReview.openSettingsModal();
      return;
    }
    document.getElementById('ai-key-modal')?.classList.add('open');
  }

  function render() {
    const { title, body, say, scene, img, caption, stepLabel, dots, prev, next } = els();
    const s = STEPS[step];
    if (!s) return;
    if (title) title.textContent = s.title;
    if (say) say.textContent = s.say || '';
    if (scene) scene.textContent = s.scene || '';
    if (body) body.innerHTML = typeof s.body === 'function' ? s.body() : s.body;
    if (img) {
      img.src = s.image;
      img.alt = s.caption || s.title;
      img.classList.remove('is-swap');
      void img.offsetWidth;
      img.classList.add('is-swap');
    }
    if (caption) caption.textContent = s.caption || '';
    if (stepLabel) stepLabel.textContent = `${step + 1} / ${STEPS.length}`;
    if (dots) {
      dots.innerHTML = STEPS.map(
        (_, i) => `<span class="onb-dot${i === step ? ' active' : ''}"></span>`
      ).join('');
    }
    if (prev) prev.hidden = step === 0;
    if (next) {
      if (s.id === 'api') next.textContent = '已了解，下一步';
      else next.textContent = step === STEPS.length - 1 ? '开始使用' : '下一步';
    }
  }

  function open(fromStart = true) {
    if (fromStart) step = 0;
    const { overlay } = els();
    overlay?.classList.add('open');
    render();
  }

  function openApiStep() {
    const idx = STEPS.findIndex((s) => s.id === 'api');
    step = idx >= 0 ? idx : 0;
    const { overlay } = els();
    overlay?.classList.add('open');
    render();
  }

  function close(markSeen = true) {
    els().overlay?.classList.remove('open');
    if (markSeen) localStorage.setItem(SEEN_KEY, '1');
    if (typeof api?.onClose === 'function') api.onClose();
  }

  function next() {
    if (step >= STEPS.length - 1) {
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
    els().overlay?.addEventListener('click', (e) => {
      if (e.target === els().overlay) close(true);
    });
    els().body?.addEventListener('click', (e) => {
      if (e.target.closest('[data-onb-open-api]')) {
        e.preventDefault();
        openApiSettings();
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
