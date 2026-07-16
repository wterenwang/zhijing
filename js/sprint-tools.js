/**
 * 冲刺工具：面试题、能力雷达、作品集看板、投递管理
 */
const INTERVIEW_QUESTIONS = [
  { id: 'i1', cat: '行业认知', days: '1-7', q: '用一句话向面试官解释什么是具身智能？它和传统机器人有什么区别？', hint: '强调物理身体、环境交互、感知-决策-执行闭环' },
  { id: 'i2', cat: '行业认知', days: '1-7', q: '具身智能产业链的上游、中游、下游分别是什么？各举2家代表公司。', hint: '上游硬件、中游模型、下游场景' },
  { id: 'i3', cat: '行业认知', days: '4-6', q: '宇树、优必选、智元、特斯拉 Optimus 的市场定位有何不同？', hint: 'ToB/ToC、价格带、技术路线、商业化阶段' },
  { id: 'i4', cat: '行业认知', days: '3-7', q: '2025年具身智能大规模商业化的主要瓶颈是什么？', hint: '数据、成本、泛化、安全、场景' },
  { id: 'i5', cat: '技术理解', days: '8-14', q: '「大脑」和「小脑」在机器人系统中如何分工？产品经理为什么要理解这个？', hint: 'AI规划 vs 运动控制；影响功能边界与验收指标' },
  { id: 'i6', cat: '技术理解', days: '11-14', q: 'VLA 模型是什么？RT-2 和 OpenVLA 的核心差异？', hint: '视觉-语言-动作；闭源vs开源、参数量、泛化' },
  { id: 'i7', cat: '技术理解', days: '12-14', q: '强化学习和模仿学习分别适合什么机器人场景？', hint: 'RL需奖励设计；IL需演示数据；家庭场景多IL+VLA' },
  { id: 'i8', cat: '技术理解', days: '23-25', q: '「把桌子上的杯子拿给我」在 VLA 系统中经历哪些步骤？', hint: '感知、语言理解、规划、抓取、反馈' },
  { id: 'i9', cat: '技术理解', days: '24-25', q: '世界模型和 Diffusion Policy 解决了什么问题？', hint: '预测规划；多模态动作生成' },
  { id: 'i10', cat: '产品思维', days: '15-20', q: '具身产品如何在成本、性能、可靠性之间做取舍？举1个例子。', hint: '家用vs工业、自由度vs价格、云边端' },
  { id: 'i11', cat: '产品思维', days: '16-17', q: '如何设计家庭场景机器人的数据飞轮？', hint: '采集激励、隐私合规、模型迭代闭环' },
  { id: 'i12', cat: '产品思维', days: '18-20', q: '你做竞品分析时最关注哪3个维度？为什么？', hint: '定位、AI能力演进、商业化路径' },
  { id: 'i13', cat: '项目一', days: '31-55', q: '开发者生态项目：为什么要做？目标用户是谁？核心痛点？', hint: '高校实验室/极客；SDK摩擦、文档、示例' },
  { id: 'i14', cat: '项目一', days: '34-48', q: '对比 Boston Dynamics Spot SDK，你的方案差异化在哪？', hint: '价格、易用性、中文生态、技能商店' },
  { id: 'i15', cat: '项目一', days: '46-55', q: '项目一中你做过最艰难的 trade-off 是什么？', hint: '功能范围vs工期、开源vs商业' },
  { id: 'i16', cat: '项目二', days: '56-82', q: '家庭场景项目：为什么选这个场景？用户核心痛点？', hint: '扫地机不满、抓取归位、VLA落地' },
  { id: 'i17', cat: '项目二', days: '65-80', q: '如何定义「智能避障」和「物品归位」的成功指标？', hint: '成功率、耗时、误操作率、满意度' },
  { id: 'i18', cat: '项目二', days: '71-82', q: '项目二如果只有3个月上线，你会砍哪些功能？', hint: 'MVP边界、P0/P1、技术风险' },
  { id: 'i19', cat: '通用面试', days: '83-90', q: '为什么选择具身智能产品经理这个方向？', hint: '兴趣+能力+行业判断，要具体' },
  { id: 'i20', cat: '通用面试', days: '83-90', q: '你没有机器人背景，凭什么能做这个岗位？', hint: '产品能力、学习成果、作品集、跨界优势' },
  { id: 'i21', cat: '通用面试', days: '86-88', q: '描述一次你和工程师意见不合的经历，怎么解决的？', hint: 'STAR法则；数据/用户/风险' },
  { id: 'i22', cat: '通用面试', days: '86-88', q: '如果入职后让你负责一个你不熟悉的硬件模块，你怎么办？', hint: '快速学习、找专家、用户视角拆解' },
  { id: 'i23', cat: '行业认知', days: '1-7', q: '人形机器人是具身智能的唯一形态吗？', hint: '四足、轮式、机械臂都是载体' },
  { id: 'i24', cat: '技术理解', days: '9-10', q: '深度相机和激光雷达在家庭机器人中各有什么优劣？', hint: '成本、精度、室内光照、语义理解' },
  { id: 'i25', cat: '产品思维', days: '56-70', q: '语音交互设计要注意什么？举一条你家机器人的指令例子。', hint: '模糊指令、确认机制、失败反馈' },
];

const SKILL_DIMENSIONS = [
  { id: 'industry', label: '行业认知', desc: '产业链、头部公司、市场判断' },
  { id: 'hardware', label: '硬件基础', desc: '关节、传感器、成本结构' },
  { id: 'ai-tech', label: 'AI技术理解', desc: 'VLA、RL、模仿学习、数据闭环' },
  { id: 'product', label: '产品思维', desc: '取舍、交互、数据飞轮' },
  { id: 'competitive', label: '竞品分析', desc: '框架、差异化、报告输出' },
  { id: 'prd', label: 'PRD能力', desc: '需求、验收标准、优先级' },
  { id: 'portfolio', label: '作品集', desc: '项目完整度与表达' },
  { id: 'interview', label: '面试表达', desc: '结构化回答、trade-off' },
];

const PORTFOLIO_PROJECTS = [
  {
    id: 'p1',
    name: '项目一：开发者生态',
    days: '31-55',
    milestones: [
      { id: 'p1-1', label: '用户调研完成', desc: '画像 + 2位访谈' },
      { id: 'p1-2', label: 'SDK竞品分析', desc: 'Spot SDK / ROS 对比' },
      { id: 'p1-3', label: '功能优先级 P0/P1/P2', desc: '功能矩阵定稿' },
      { id: 'p1-4', label: '用户流程图', desc: '下载到运行全流程' },
      { id: 'p1-5', label: '低保真原型', desc: '核心页面草图' },
      { id: 'p1-6', label: 'PRD 初稿', desc: '背景/需求/功能' },
      { id: 'p1-7', label: '商业模式', desc: '变现与生态设计' },
      { id: 'p1-8', label: 'PPT + 模拟评审', desc: '10页内路演稿' },
    ],
  },
  {
    id: 'p2',
    name: '项目二：家庭场景',
    days: '56-82',
    milestones: [
      { id: 'p2-1', label: '场景选题确定', desc: '清洁/厨房二选一' },
      { id: 'p2-2', label: '用户痛点矩阵', desc: 'TOP3痛点' },
      { id: 'p2-3', label: '技术方案调研', desc: 'VLA家庭抓取' },
      { id: 'p2-4', label: '核心功能定义', desc: '避障 + 物品归位' },
      { id: 'p2-5', label: '交互设计', desc: '语音指令集' },
      { id: 'p2-6', label: 'PRD 定稿', desc: '完整需求文档' },
      { id: 'p2-7', label: '数据与指标方案', desc: '采集 + 评估指标' },
      { id: 'p2-8', label: 'PPT 定稿', desc: '可面试展示' },
    ],
  },
  {
    id: 'p3',
    name: '项目三：面试冲刺',
    days: '83-90',
    milestones: [
      { id: 'p3-1', label: '作品集整合', desc: '统一排版 PDF/PPT' },
      { id: 'p3-2', label: '模拟面试 3 轮', desc: '每项目过一遍' },
      { id: 'p3-3', label: '自我介绍定稿', desc: '1分钟 + 3分钟版' },
      { id: 'p3-4', label: '简历更新', desc: '突出作品集' },
      { id: 'p3-5', label: '开始投递', desc: '目标公司清单' },
    ],
  },
];

const APP_STATUS_OPTIONS = [
  { value: 'todo', label: '待投递', color: '#94a3b8' },
  { value: 'sent', label: '已投递', color: '#0891b2' },
  { value: 'written', label: '笔试', color: '#7c3aed' },
  { value: 'interview', label: '面试中', color: '#ea580c' },
  { value: 'offer', label: 'Offer', color: '#16a34a' },
  { value: 'reject', label: '已拒绝', color: '#dc2626' },
];

/** 根据当前学习天数推荐面试题 */
function getActiveInterview() {
  return typeof ContentPack !== 'undefined' ? ContentPack.getInterview() : INTERVIEW_QUESTIONS;
}
function getActiveSkills() {
  return typeof ContentPack !== 'undefined' ? ContentPack.getSkills() : SKILL_DIMENSIONS;
}
function getActivePortfolio() {
  return typeof ContentPack !== 'undefined' ? ContentPack.getPortfolio() : PORTFOLIO_PROJECTS;
}

function getQuestionsForDay(day) {
  return getActiveInterview().filter(q => {
    const [s, e] = q.days.includes('-') ? q.days.split('-').map(Number) : [Number(q.days), Number(q.days)];
    return day >= s && day <= e;
  });
}

/** 今日推荐2题（优先未掌握） */
function getDailyInterviewQuestions(day, progress) {
  const all = getActiveInterview();
  const pool = getQuestionsForDay(day);
  if (pool.length === 0) return all.slice(0, 2);
  const unknown = pool.filter(q => progress[q.id] !== 'known');
  const src = unknown.length >= 2 ? unknown : pool;
  return src.slice(0, 2);
}

const SprintTools = {
  INTERVIEW_QUESTIONS,
  SKILL_DIMENSIONS,
  PORTFOLIO_PROJECTS,
  APP_STATUS_OPTIONS,
  getQuestionsForDay,
  getDailyInterviewQuestions,
  getActiveInterview,
  getActiveSkills,
  getActivePortfolio,

  /** 初始化冲刺工具 UI */
  init(getAppData, saveAppData, getCurrentDay) {
    const escapeHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    // 子 Tab 切换
    document.querySelectorAll('.tools-subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.dataset.toolsPanel;
        document.querySelectorAll('.tools-subtab').forEach(b => b.classList.toggle('active', b.dataset.toolsPanel === panel));
        document.querySelectorAll('.tools-panel').forEach(p => p.classList.toggle('active', p.id === `tools-${panel}`));
        if (panel === 'skills') renderRadar();
        if (typeof SprintToolsMid !== 'undefined') SprintToolsMid._onPanelShow?.(panel);
        if (typeof SpacedRepetition !== 'undefined' && SpacedRepetition._ui) {
          if (panel === 'srs') {
            // 由 SrsReviewUI 注册
          }
        }
        if (typeof window.__srsOnPanelShow === 'function') window.__srsOnPanelShow(panel);
      });
    });

    document.getElementById('btn-add-application')?.addEventListener('click', () => {
      const data = getAppData();
      if (!data.applications) data.applications = [];
      data.applications.unshift({
        id: Date.now().toString(),
        company: '',
        role: '',
        date: new Date().toISOString().slice(0, 10),
        status: 'todo',
        portfolio: '',
        note: '',
      });
      saveAppData();
      renderApplications();
    });

    const renderAll = () => {
      renderInterview();
      renderRadar();
      renderPortfolio();
      renderApplications();
      if (typeof SprintToolsMid !== 'undefined') SprintToolsMid._renderAll?.();
      if (typeof window.__srsRenderAll === 'function') window.__srsRenderAll();
    };

    function renderInterview() {
      const data = getAppData();
      const progress = data.interviewProgress || {};
      const day = getCurrentDay();
      const daily = getDailyInterviewQuestions(day, progress);

      const dailyEl = document.getElementById('interview-daily');
      if (dailyEl) {
        dailyEl.innerHTML = daily.map(q => interviewCard(q, progress, true)).join('');
      }

      const filter = document.getElementById('interview-filter')?.value || 'all';
      const allQ = getActiveInterview();
      const list = filter === 'all' ? allQ
        : filter === 'unknown' ? allQ.filter(q => progress[q.id] !== 'known')
        : allQ.filter(q => q.cat === filter);

      const listEl = document.getElementById('interview-list');
      if (listEl) listEl.innerHTML = list.map(q => interviewCard(q, progress, false)).join('');

      const known = allQ.filter(q => progress[q.id] === 'known').length;
      const statEl = document.getElementById('interview-stat');
      if (statEl) statEl.textContent = `已掌握 ${known} / ${allQ.length} 题`;

      bindInterviewButtons();
    }

    function interviewCard(q, progress, compact) {
      const st = progress[q.id] || 'unknown';
      return `
        <div class="interview-card ${compact ? 'compact' : ''}" data-qid="${q.id}">
          <div class="interview-card-head">
            <span class="interview-cat">${escapeHtml(q.cat)}</span>
            <span class="interview-days">Day ${q.days}</span>
          </div>
          <p class="interview-q">${escapeHtml(q.q)}</p>
          ${!compact ? `<p class="interview-hint">提示：${escapeHtml(q.hint)}</p>` : ''}
          <div class="interview-actions">
            <button type="button" class="int-btn ${st === 'known' ? 'active-known' : ''}" data-action="known" data-qid="${q.id}">会了</button>
            <button type="button" class="int-btn ${st === 'review' ? 'active-review' : ''}" data-action="review" data-qid="${q.id}">待复习</button>
            <button type="button" class="int-btn ${st === 'unknown' || !st ? 'active-unknown' : ''}" data-action="unknown" data-qid="${q.id}">不会</button>
          </div>
        </div>`;
    }

    function bindInterviewButtons() {
      document.querySelectorAll('.int-btn').forEach(btn => {
        btn.onclick = () => {
          const data = getAppData();
          if (!data.interviewProgress) data.interviewProgress = {};
          const action = btn.dataset.action;
          const qid = btn.dataset.qid;
          data.interviewProgress[qid] = action;

          const q = getActiveInterview().find(x => x.id === qid);
          if (q && (action === 'review' || action === 'unknown')) {
            SpacedRepetition.enqueueInterview(data, q, { forceDueToday: true });
          }

          saveAppData();
          renderInterview();
          if (typeof SpacedRepetition !== 'undefined' && SpacedRepetition._ui) {
            SpacedRepetition._ui.renderHub();
            SpacedRepetition._ui.updateSprintHint();
          }
        };
      });
    }

    document.getElementById('interview-filter')?.addEventListener('change', renderInterview);

    function renderRadar() {
      const data = getAppData();
      const ratings = data.skillRatings || {};
      const slidersEl = document.getElementById('skill-sliders');
      const svgEl = document.getElementById('radar-svg');

      if (slidersEl) {
        slidersEl.innerHTML = getActiveSkills().map(d => {
          const v = ratings[d.id] || 3;
          return `
            <div class="skill-row">
              <div class="skill-row-label">
                <strong>${escapeHtml(d.label)}</strong>
                <span>${escapeHtml(d.desc)}</span>
              </div>
              <div class="skill-slider-wrap">
                <input type="range" min="1" max="5" value="${v}" data-skill="${d.id}" class="skill-slider">
                <span class="skill-val" data-skill-val="${d.id}">${v}</span>
              </div>
            </div>`;
        }).join('');

        slidersEl.querySelectorAll('.skill-slider').forEach(sl => {
          sl.addEventListener('input', () => {
            const data = getAppData();
            if (!data.skillRatings) data.skillRatings = {};
            data.skillRatings[sl.dataset.skill] = Number(sl.value);
            document.querySelector(`[data-skill-val="${sl.dataset.skill}"]`).textContent = sl.value;
            saveAppData();
            drawRadar(data.skillRatings);
          });
        });
      }

      drawRadar(ratings);

      function drawRadar(ratings) {
        if (!svgEl) return;
        const dims = getActiveSkills();
        const cx = 150, cy = 150, maxR = 110;
        const n = dims.length || 1;
        const levels = 5;
        let svg = '';

        for (let l = 1; l <= levels; l++) {
          const r = (maxR / levels) * l;
          const pts = dims.map((_, i) => {
            const a = (Math.PI * 2 * i / n) - Math.PI / 2;
            return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
          }).join(' ');
          svg += `<polygon points="${pts}" fill="none" stroke="rgba(8,145,178,0.15)" stroke-width="1"/>`;
        }

        dims.forEach((d, i) => {
          const a = (Math.PI * 2 * i / n) - Math.PI / 2;
          const x2 = cx + maxR * Math.cos(a);
          const y2 = cy + maxR * Math.sin(a);
          svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="rgba(8,145,178,0.12)" stroke-width="1"/>`;
          const lx = cx + (maxR + 18) * Math.cos(a);
          const ly = cy + (maxR + 18) * Math.sin(a);
          const anchor = Math.abs(Math.cos(a)) < 0.1 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
          svg += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="middle" font-size="10" fill="#5a6b82">${escapeHtml(d.label)}</text>`;
        });

        const dataPts = dims.map((d, i) => {
          const v = ratings[d.id] || 3;
          const r = (maxR / 5) * v;
          const a = (Math.PI * 2 * i / n) - Math.PI / 2;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(' ');
        svg += `<polygon points="${dataPts}" fill="rgba(8,145,178,0.25)" stroke="#0891b2" stroke-width="2"/>`;

        dims.forEach((d, i) => {
          const v = ratings[d.id] || 3;
          const r = (maxR / 5) * v;
          const a = (Math.PI * 2 * i / n) - Math.PI / 2;
          svg += `<circle cx="${cx + r * Math.cos(a)}" cy="${cy + r * Math.sin(a)}" r="4" fill="#0891b2"/>`;
        });

        svgEl.innerHTML = svg;
      }

      const dims = getActiveSkills();
      const avg = dims.reduce((s, d) => s + (ratings[d.id] || 3), 0) / (dims.length || 1);
      const weak = [...dims].sort((a, b) => (ratings[a.id]||3) - (ratings[b.id]||3)).slice(0, 2);
      const insight = document.getElementById('skill-insight');
      if (insight) {
        insight.innerHTML = `综合自评 <strong>${avg.toFixed(1)}</strong> / 5 · 建议加强：<strong>${weak.map(w => w.label).join('、') || '—'}</strong>`;
      }
    }

    function renderPortfolio() {
      const data = getAppData();
      const done = data.portfolioMilestones || {};
      const el = document.getElementById('portfolio-board');
      if (!el) return;

      el.innerHTML = getActivePortfolio().map(proj => {
        const items = (proj.milestones || []).map(m => {
          const checked = !!done[m.id];
          return `
            <label class="milestone-item ${checked ? 'done' : ''}">
              <input type="checkbox" data-ms="${m.id}" ${checked ? 'checked' : ''}>
              <div>
                <span class="ms-label">${escapeHtml(m.label)}</span>
                <span class="ms-desc">${escapeHtml(m.desc)}</span>
              </div>
            </label>`;
        }).join('');
        const total = (proj.milestones || []).length;
        const count = (proj.milestones || []).filter(m => done[m.id]).length;
        const pct = total ? Math.round((count / total) * 100) : 0;
        return `
          <div class="portfolio-col glass">
            <div class="portfolio-col-head">
              <h3>${escapeHtml(proj.name)}</h3>
              <span class="portfolio-days">Day ${proj.days}</span>
            </div>
            <div class="portfolio-progress">
              <div class="portfolio-progress-fill" style="width:${pct}%"></div>
            </div>
            <p class="portfolio-pct">${count}/${total} 完成 (${pct}%)</p>
            <div class="milestone-list">${items}</div>
          </div>`;
      }).join('');

      el.querySelectorAll('input[data-ms]').forEach(cb => {
        cb.addEventListener('change', () => {
          const data = getAppData();
          if (!data.portfolioMilestones) data.portfolioMilestones = {};
          data.portfolioMilestones[cb.dataset.ms] = cb.checked;
          saveAppData();
          renderPortfolio();
        });
      });
    }

    function renderApplications() {
      const data = getAppData();
      const apps = data.applications || [];
      const tbody = document.getElementById('apply-tbody');
      if (!tbody) return;

      if (apps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="apply-empty">暂无记录，点击下方添加目标公司</td></tr>`;
        return;
      }

      tbody.innerHTML = apps.map(app => {
        const opts = APP_STATUS_OPTIONS.map(s =>
          `<option value="${s.value}" ${app.status === s.value ? 'selected' : ''}>${s.label}</option>`
        ).join('');
        return `
          <tr data-app-id="${app.id}">
            <td><input class="apply-input" data-field="company" value="${escapeHtml(app.company || '')}" placeholder="公司名"></td>
            <td><input class="apply-input" data-field="role" value="${escapeHtml(app.role || '')}" placeholder="岗位"></td>
            <td><input class="apply-input apply-date" type="date" data-field="date" value="${app.date || ''}"></td>
            <td><select class="apply-select" data-field="status">${opts}</select></td>
            <td><input class="apply-input" data-field="portfolio" value="${escapeHtml(app.portfolio || '')}" placeholder="用的作品集"></td>
            <td>
              <input class="apply-input" data-field="note" value="${escapeHtml(app.note || '')}" placeholder="备注">
              <button type="button" class="apply-del" data-del="${app.id}" title="删除">×</button>
            </td>
          </tr>`;
      }).join('');

      tbody.querySelectorAll('.apply-input, .apply-select').forEach(el => {
        const ev = el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(ev, () => {
          const row = el.closest('tr');
          const id = row.dataset.appId;
          const data = getAppData();
          const app = data.applications.find(a => a.id === id);
          if (!app) return;
          app[el.dataset.field] = el.value;
          saveAppData();
        });
      });

      tbody.querySelectorAll('.apply-del').forEach(btn => {
        btn.addEventListener('click', () => {
          const data = getAppData();
          data.applications = data.applications.filter(a => a.id !== btn.dataset.del);
          saveAppData();
          renderApplications();
        });
      });

      const counts = {};
      APP_STATUS_OPTIONS.forEach(s => { counts[s.value] = 0; });
      apps.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
      const summary = document.getElementById('apply-summary');
      if (summary) {
        summary.innerHTML = APP_STATUS_OPTIONS
          .filter(s => counts[s.value] > 0)
          .map(s => `<span class="apply-badge" style="background:${s.color}20;color:${s.color}">${s.label} ${counts[s.value]}</span>`)
          .join('') || '<span class="apply-badge">开始添加目标公司吧</span>';
      }
    }

    return { renderAll, renderInterview };
  },
};
