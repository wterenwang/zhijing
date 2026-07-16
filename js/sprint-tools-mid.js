/**
 * 中等价值冲刺工具：笔记搜索、周复盘、术语闪卡、模拟面试计时
 */
const GLOSSARY_CARDS = [
  { term: '具身智能', def: '智能体通过物理身体与环境交互，完成感知、决策与执行的闭环。' },
  { term: 'VLA', def: 'Vision-Language-Action，将视觉与语言指令映射为机器人动作。' },
  { term: 'RT-2', def: 'Google 的 VLA 模型，把网页预训练知识迁移到机器人控制。' },
  { term: 'OpenVLA', def: '开源 7B VLA，基于 Open X-Embodiment 数据集训练。' },
  { term: '强化学习', def: '通过奖励信号与环境交互学习策略，常用于运动控制。' },
  { term: '模仿学习', def: '从专家演示中学习，无需显式奖励函数。' },
  { term: 'Diffusion Policy', def: '用扩散模型生成动作序列，擅长多模态动作分布。' },
  { term: '世界模型', def: '机器人对环境的内部预测，用于规划与仿真。' },
  { term: '数据飞轮', def: '用户数据反哺模型迭代，形成采集-训练-部署闭环。' },
  { term: '数据闭环', def: '采集、标注、训练、评测、部署反馈的完整链路。' },
  { term: 'IMU', def: '惯性测量单元，测加速度与角速度，用于姿态估计。' },
  { term: '伺服驱动器', def: '精确控制电机运动，是人形关节核心部件。' },
  { term: 'CoRL', def: 'Conference on Robot Learning，机器人学习顶会。' },
  { term: 'PRD', def: '产品需求文档，定义背景、需求、验收标准。' },
  { term: '宇树', def: 'Unitree，中国四足/人形机器人公司，高性价比。' },
  { term: 'Optimus', def: 'Tesla 人形机器人，目标工厂与家庭场景。' },
];

const WEEK_REVIEW_CONFIG = {
  7: {
    title: '第 1 周复盘',
    subtitle: '行业与市场全景',
    fields: [
      { key: 'harvest', label: '本周 3 个核心收获', placeholder: '1. ...\n2. ...\n3. ...' },
      { key: 'questions', label: '仍有疑问的 2 个问题', placeholder: '1. ...\n2. ...' },
      { key: 'focus', label: '下周 1 个学习重点', placeholder: '例如：深入理解 VLA...' },
    ],
  },
  14: {
    title: '第 2 周复盘',
    subtitle: '产品与技术基础（上）',
    fields: [
      { key: 'harvest', label: '本周 3 个核心收获', placeholder: '1. ...\n2. ...\n3. ...' },
      { key: 'questions', label: '技术概念中还不清楚的点', placeholder: '例如：RL和IL的边界...' },
      { key: 'focus', label: '下周 1 个学习重点', placeholder: '' },
    ],
  },
  27: {
    title: '第一阶段复盘（上）',
    subtitle: '知识体系整理',
    fields: [
      { key: 'harvest', label: '30 天最重要的 3 个认知转变', placeholder: '' },
      { key: 'questions', label: '知识体系中的薄弱环节', placeholder: '' },
      { key: 'focus', label: '补强计划（未来 3 天）', placeholder: '' },
    ],
  },
  28: {
    title: '第一阶段复盘（下）',
    subtitle: '3000 字总结准备',
    fields: [
      { key: 'harvest', label: '总结大纲（章节标题）', placeholder: '# 一、行业认知\n# 二、技术基础\n...' },
      { key: 'questions', label: '写总结时卡住的点', placeholder: '' },
      { key: 'focus', label: '明天要完成的总结段落', placeholder: '' },
    ],
  },
  30: {
    title: '阶段过渡复盘',
    subtitle: '进入作品集阶段',
    fields: [
      { key: 'harvest', label: '拟定的 2-3 个作品集方向', placeholder: '项目一：...\n项目二：...' },
      { key: 'questions', label: '对作品集最大的担心', placeholder: '' },
      { key: 'focus', label: 'Day 31 第一件事', placeholder: '' },
    ],
  },
};

const SprintToolsMid = {
  GLOSSARY_CARDS,
  WEEK_REVIEW_CONFIG,

  init(getAppData, saveAppData, getCurrentDay, goToDay) {
    const escapeHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    function getFlashCards() {
      return typeof ContentPack !== 'undefined' ? ContentPack.getGlossaryCards() : GLOSSARY_CARDS;
    }

    let flashIndex = 0;
    let flashFlipped = false;
    let flashOrder = [];

    function resetFlashOrder() {
      const n = getFlashCards().length;
      flashOrder = [...Array(n).keys()];
      flashIndex = 0;
      flashFlipped = false;
    }
    resetFlashOrder();

    let timerInterval = null;
    let timerSecondsLeft = 15 * 60;
    let timerRunning = false;

    document.getElementById('notes-search-btn')?.addEventListener('click', runNotesSearch);
    document.getElementById('notes-search-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') runNotesSearch();
    });

    document.getElementById('flash-prev')?.addEventListener('click', () => moveFlash(-1));
    document.getElementById('flash-next')?.addEventListener('click', () => moveFlash(1));
    document.getElementById('flash-shuffle')?.addEventListener('click', shuffleFlash);
    document.getElementById('flashcard')?.addEventListener('click', () => {
      flashFlipped = !flashFlipped;
      renderFlashcard();
    });

    document.getElementById('mock-start')?.addEventListener('click', startTimer);
    document.getElementById('mock-pause')?.addEventListener('click', pauseTimer);
    document.getElementById('mock-reset')?.addEventListener('click', resetTimer);
    document.getElementById('mock-new-q')?.addEventListener('click', pickMockQuestion);
    document.querySelectorAll('.mock-duration').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mock-duration').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mins = Number(btn.dataset.mins);
        timerSecondsLeft = mins * 60;
        updateTimerDisplay();
        pauseTimer();
      });
    });

    function runNotesSearch() {
      const q = (document.getElementById('notes-search-input')?.value || '').trim().toLowerCase();
      const resultsEl = document.getElementById('notes-search-results');
      if (!resultsEl) return;

      if (!q) {
        resultsEl.innerHTML = '<p class="search-empty">输入关键词搜索 90 天笔记与费曼复述</p>';
        return;
      }

      const data = getAppData();
      const hits = [];

      for (let d = 1; d <= 90; d++) {
        const key = String(d);
        const note = (data.notes[key] || '').toLowerCase();
        const feyn = (data.feynman[key] || '').toLowerCase();
        const plan =
          typeof ContentPack !== 'undefined' && ContentPack.getDay
            ? ContentPack.getDay(d)
            : typeof LEARNING_PLAN !== 'undefined'
              ? LEARNING_PLAN[d - 1]
              : null;
        const topic = plan ? plan.topic : `第${d}天`;

        if (note.includes(q)) {
          hits.push({ day: d, type: '笔记', topic, snippet: extractSnippet(data.notes[key], q) });
        }
        if (feyn.includes(q)) {
          hits.push({ day: d, type: '费曼', topic, snippet: extractSnippet(data.feynman[key], q) });
        }
      }

      if (hits.length === 0) {
        resultsEl.innerHTML = `<p class="search-empty">未找到包含「${escapeHtml(q)}」的内容</p>`;
        return;
      }

      resultsEl.innerHTML = hits.map(h => `
        <div class="search-hit">
          <div class="search-hit-head">
            <button type="button" class="search-goto" data-day="${h.day}">第 ${h.day} 天</button>
            <span class="search-type">${escapeHtml(h.type)}</span>
            <span class="search-topic">${escapeHtml(h.topic)}</span>
          </div>
          <p class="search-snippet">${escapeHtml(h.snippet)}</p>
        </div>
      `).join('');

      resultsEl.querySelectorAll('.search-goto').forEach(btn => {
        btn.addEventListener('click', () => {
          goToDay(Number(btn.dataset.day));
          if (typeof window.switchView === 'function') window.switchView('sprint');
        });
      });
    }

    function extractSnippet(text, q) {
      if (!text) return '';
      const lower = text.toLowerCase();
      const idx = lower.indexOf(q);
      if (idx === -1) return text.slice(0, 120);
      const start = Math.max(0, idx - 40);
      const end = Math.min(text.length, idx + q.length + 80);
      return (start > 0 ? '...' : '') + text.slice(start, end).replace(/\n/g, ' ') + (end < text.length ? '...' : '');
    }

    function renderWeeklyReview(day) {
      const section = document.getElementById('weekly-review-section');
      if (!section) return;

      const cfg = WEEK_REVIEW_CONFIG[day];
      if (!cfg) {
        section.hidden = true;
        return;
      }

      section.hidden = false;
      const data = getAppData();
      if (!data.weeklyReviews) data.weeklyReviews = {};
      const saved = data.weeklyReviews[String(day)] || {};

      section.innerHTML = `
        <h3 class="section-title">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          ${escapeHtml(cfg.title)}
          <span class="weekly-sub">${escapeHtml(cfg.subtitle)}</span>
        </h3>
        <p class="weekly-hint">结构化周复盘，与费曼复述互补：这里做归纳，费曼做讲懂</p>
        ${cfg.fields.map(f => `
          <label class="weekly-field">
            <span class="weekly-label">${escapeHtml(f.label)}</span>
            <textarea class="weekly-input" data-week-key="${f.key}" data-week-day="${day}" placeholder="${escapeHtml(f.placeholder)}">${escapeHtml(saved[f.key] || '')}</textarea>
          </label>
        `).join('')}
        <div class="save-hint visible" style="opacity:0.6" id="weekly-save-hint">内容自动保存</div>
      `;

      section.querySelectorAll('.weekly-input').forEach(ta => {
        ta.addEventListener('input', () => {
          const d = getAppData();
          if (!d.weeklyReviews) d.weeklyReviews = {};
          const k = String(day);
          if (!d.weeklyReviews[k]) d.weeklyReviews[k] = {};
          d.weeklyReviews[k][ta.dataset.weekKey] = ta.value;
          saveAppData();
        });
      });
    }

    function shuffleFlash() {
      flashOrder = flashOrder.sort(() => Math.random() - 0.5);
      flashIndex = 0;
      flashFlipped = false;
      renderFlashcard();
    }

    function moveFlash(delta) {
      flashIndex = (flashIndex + delta + flashOrder.length) % flashOrder.length;
      flashFlipped = false;
      renderFlashcard();
    }

    function renderFlashcard() {
      const cards = getFlashCards();
      if (!flashOrder.length && cards.length) resetFlashOrder();
      const card = cards[flashOrder[flashIndex]];
      const el = document.getElementById('flashcard');
      const prog = document.getElementById('flash-progress');
      if (!el || !card) {
        if (el) {
          el.querySelector('.flash-front').textContent = '暂无术语卡';
          el.querySelector('.flash-back').textContent = '进入带内容包的项目，或同步 AI 术语后重试';
        }
        if (prog) prog.textContent = '0 / 0';
        return;
      }

      el.classList.toggle('flipped', flashFlipped);
      el.querySelector('.flash-front').textContent = card.term;
      el.querySelector('.flash-back').textContent = card.def;
      if (prog) prog.textContent = `${flashIndex + 1} / ${cards.length}`;
    }

    function pickMockQuestion() {
      const pool = typeof ContentPack !== 'undefined'
        ? ContentPack.getInterview()
        : (typeof INTERVIEW_QUESTIONS !== 'undefined' ? INTERVIEW_QUESTIONS : []);
      if (!pool.length) return;
      const q = pool[Math.floor(Math.random() * pool.length)];
      const el = document.getElementById('mock-question');
      if (el) {
        el.innerHTML = `<span class="mock-cat">${escapeHtml(q.cat)}</span><p>${escapeHtml(q.q)}</p>`;
      }
    }

    function updateTimerDisplay() {
      const el = document.getElementById('mock-timer');
      if (!el) return;
      const m = Math.floor(timerSecondsLeft / 60);
      const s = timerSecondsLeft % 60;
      el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      el.classList.toggle('timer-warning', timerSecondsLeft <= 60 && timerSecondsLeft > 0);
      el.classList.toggle('timer-done', timerSecondsLeft === 0);
    }

    function startTimer() {
      if (timerRunning) return;
      timerRunning = true;
      timerInterval = setInterval(() => {
        if (timerSecondsLeft <= 0) {
          pauseTimer();
          return;
        }
        timerSecondsLeft--;
        updateTimerDisplay();
        if (timerSecondsLeft === 0) {
          try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE=').play(); } catch {}
        }
      }, 1000);
    }

    function pauseTimer() {
      timerRunning = false;
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null;
    }

    function resetTimer() {
      pauseTimer();
      const active = document.querySelector('.mock-duration.active');
      const mins = active ? Number(active.dataset.mins) : 15;
      timerSecondsLeft = mins * 60;
      updateTimerDisplay();
    }

    function renderMockInterview() {
      if (!document.getElementById('mock-question')?.querySelector('p')) {
        pickMockQuestion();
      }
      updateTimerDisplay();
    }

    function renderAll() {
      const active = document.querySelector('.tools-subtab.active')?.dataset.toolsPanel;
      if (active === 'search' || !active) runNotesSearch();
      resetFlashOrder();
      renderFlashcard();
      renderMockInterview();
    }

    function onPanelShow(panel) {
      if (panel === 'search') runNotesSearch();
      if (panel === 'flashcard') renderFlashcard();
      if (panel === 'mock') renderMockInterview();
    }

    SprintToolsMid._onPanelShow = onPanelShow;
    SprintToolsMid._renderAll = renderAll;

    return { renderAll, renderWeeklyReview };
  },
};
