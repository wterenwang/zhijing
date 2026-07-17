/**
 * DeepSeek AI 点评（可选）：API Key 仅存本机 localStorage，手动触发
 */
const DEEPSEEK_KEY_STORAGE = 'zhijing-deepseek-key';
const DEEPSEEK_KEY_STORAGE_LEGACY = 'embodied-pm-deepseek-key';

const AI_REVIEW_SYSTEM = `你是岗位学习路径的练习教练。用户完成当日练习后，需要「点评」和「参考答案」。

输出格式（Markdown，严格按此结构）：

## 点评
- **优点**：（1-2 条，针对用户作答；若用户未作答则写「尚未作答，以下为参考方向」）
- **待改进**：（1-2 条，具体可操作）
- **是否达到「能讲清」**：是 / 部分 / 否

## 参考答案
给出可直接学习的参考范例（250-450 字），要求：
- 覆盖题目与全部自检要点
- 贴合题目所属行业/岗位视角，有具体案例或事实，避免空泛套话
- 不要默认写成产品经理（PM）口吻，除非题目本身明确是产品经理场景
- 开头注明：以下为参考范例，非唯一标准答案，鼓励形成自己的表述

## 对照建议
- 用 1-2 条说明用户答案与参考答案的关键差异（用户未作答则给「答题思路提示」）

语气鼓励但严格，总篇幅控制在 600 字以内。`;

const AiReview = {
  getApiKey() {
    const cur = (localStorage.getItem(DEEPSEEK_KEY_STORAGE) || '').trim();
    if (cur) return cur;
    const legacy = (localStorage.getItem(DEEPSEEK_KEY_STORAGE_LEGACY) || '').trim();
    if (legacy) {
      try {
        localStorage.setItem(DEEPSEEK_KEY_STORAGE, legacy);
        localStorage.removeItem(DEEPSEEK_KEY_STORAGE_LEGACY);
      } catch {
        /* ignore */
      }
      return legacy;
    }
    return '';
  },

  setApiKey(key) {
    const k = (key || '').trim();
    if (k) {
      localStorage.setItem(DEEPSEEK_KEY_STORAGE, k);
      try {
        localStorage.removeItem(DEEPSEEK_KEY_STORAGE_LEGACY);
      } catch {
        /* ignore */
      }
    } else {
      localStorage.removeItem(DEEPSEEK_KEY_STORAGE);
      try {
        localStorage.removeItem(DEEPSEEK_KEY_STORAGE_LEGACY);
      } catch {
        /* ignore */
      }
    }
  },

  hasApiKey() {
    return !!this.getApiKey();
  },

  maskKey(key) {
    if (!key || key.length < 8) return key ? '••••••••' : '';
    return key.slice(0, 4) + '••••' + key.slice(-4);
  },

  async checkProxy() {
    try {
      const res = await fetch('/api/deepseek/health', { method: 'GET' });
      if (!res.ok) return { ok: false, reason: 'no_proxy' };
      const data = await res.json();
      return { ok: !!data.proxy, reason: data.proxy ? 'ok' : 'no_proxy' };
    } catch {
      return { ok: false, reason: 'network' };
    }
  },

  proxyErrorMessage(status) {
    const desktop = document.documentElement?.dataset?.zhijingDesktop === '1';
    if (status === 501) {
      return desktop
        ? '智能服务还没连上。请完全退出后重新打开「知径」。'
        : '智能服务还没连上。请关闭旧的命令行窗口，重新运行「启动本地服务」，确认窗口出现「AI 代理服务」。';
    }
    if (status === 404) {
      return desktop
        ? '找不到智能服务。请重启「知径」后再试。'
        : '找不到智能服务。请用「启动本地服务」打开本产品后再试。';
    }
    return null;
  },

  /**
   * 底层对话：供点评、内容包生成等复用
   * @param {{ messages: Array, temperature?: number, max_tokens?: number, model?: string, signal?: AbortSignal }} opts
   */
  async chat({ messages, temperature = 0.5, max_tokens = 1500, model = 'deepseek-chat', signal } = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      const err = new Error('请先开启智能功能');
      err.code = 'NO_KEY';
      throw err;
    }

    if (signal?.aborted) {
      const err = new Error('已停止生成');
      err.code = 'ABORTED';
      err.name = 'AbortError';
      throw err;
    }

    const proxy = await AiReview.checkProxy();
    if (!proxy.ok) {
      const desktop = document.documentElement?.dataset?.zhijingDesktop === '1';
      const err = new Error(
        desktop
          ? '智能服务未就绪。请完全退出后重新打开「知径」。'
          : '智能服务未就绪。请关闭占用端口的旧窗口，重新运行「启动本地服务」，并确认出现「AI 代理服务」。'
      );
      err.code = 'NO_PROXY';
      throw err;
    }

    let res;
    try {
      res = await fetch('/api/deepseek/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          model,
          messages,
          temperature,
          max_tokens,
        }),
        signal,
      });
    } catch (e) {
      if (e?.name === 'AbortError' || signal?.aborted) {
        const err = new Error('已停止生成');
        err.code = 'ABORTED';
        err.name = 'AbortError';
        throw err;
      }
      throw e;
    }

    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      const hint = AiReview.proxyErrorMessage(res.status);
      const desktop = document.documentElement?.dataset?.zhijingDesktop === '1';
      throw new Error(
        hint ||
          `服务暂时不可用 (HTTP ${res.status})，${desktop ? '请重启「知径」后再试' : '请用「启动本地服务」打开后再试'}`
      );
    }

    if (!res.ok) {
      const hint = AiReview.proxyErrorMessage(res.status);
      const msg = hint || data?.error?.message || data?.error || `请求失败 (${res.status})`;
      const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      err.status = res.status;
      throw err;
    }

    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('AI 未返回有效内容');
    return text;
  },

  async requestReview({ question, rubric, answer, day, ref }) {
    const rubricText = (rubric || []).map((r, i) => `${i + 1}. ${r}`).join('\n');
    const answerBlock = (answer && answer.trim())
      ? `用户作答：\n${answer}`
      : '用户作答：（尚未填写，请直接给出参考答案与答题思路）';
    const userContent = [
      `学习第 ${day} 天练习题`,
      `题目：${question}`,
      rubricText ? `自检要点：\n${rubricText}` : '',
      ref ? `知识库提示：${ref}` : '',
      answerBlock,
    ].filter(Boolean).join('\n\n');

    return AiReview.chat({
      messages: [
        { role: 'system', content: AI_REVIEW_SYSTEM },
        { role: 'user', content: userContent },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });
  },

  openSettingsModal() {
    const modal = document.getElementById('ai-key-modal');
    const input = document.getElementById('ai-key-input');
    if (input) input.value = AiReview.getApiKey();
    modal?.classList.add('open');
  },

  init({ onNeedKey, renderMarkdown }) {
    const modal = document.getElementById('ai-key-modal');
    const input = document.getElementById('ai-key-input');
    const statusEl = document.getElementById('ai-key-status');

    const refreshStatus = async () => {
      if (!statusEl) return;
      const k = AiReview.getApiKey();
      const proxy = await AiReview.checkProxy();
      let proxyHint = '';
      if (!proxy.ok) {
        proxyHint = ' · ⚠ AI 代理未就绪（请重新运行 bat 并关闭旧服务）';
      } else {
        proxyHint = ' · AI 代理已连接';
      }
      const llmPart = k
        ? `DeepSeek：${AiReview.maskKey(k)}（含 Web Search）`
        : 'DeepSeek：未配置';
      statusEl.textContent = `${llmPart}${proxyHint}`;
    };

    const openModal = () => {
      AiReview.openSettingsModal();
      refreshStatus();
    };

    document.getElementById('btn-ai-settings')?.addEventListener('click', openModal);
    document.getElementById('btn-ai-settings-hot')?.addEventListener('click', openModal);

    document.getElementById('ai-key-cancel')?.addEventListener('click', () => {
      modal?.classList.remove('open');
    });

    document.getElementById('ai-key-save')?.addEventListener('click', () => {
      AiReview.setApiKey(input?.value || '');
      refreshStatus();
      modal?.classList.remove('open');
    });

    document.getElementById('ai-key-clear')?.addEventListener('click', () => {
      AiReview.setApiKey('');
      if (input) input.value = '';
      refreshStatus();
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    refreshStatus();

    return {
      refreshStatus,
      openSettingsModal: openModal,
      async runForPractice(ctx) {
        if (!AiReview.hasApiKey()) {
          onNeedKey?.();
          return null;
        }
        return AiReview.requestReview(ctx);
      },
      formatFeedback(md) {
        return renderMarkdown ? renderMarkdown(md) : md;
      },
    };
  },
};
