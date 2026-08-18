/**
 * 知径桌面端：静态站点 + AI 代理（无需 Python）
 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const dns = require('dns').promises;
const net = require('net');
const { URL } = require('url');

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_ANTHROPIC_URL = 'https://api.deepseek.com/anthropic/v1/messages';
/** DeepSeek-V4-Flash-0731 正式版 API 模型名 */
const DEEPSEEK_MODEL = 'deepseek-v4-flash';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
  '.md': 'text/markdown; charset=utf-8',
};

function sendJson(res, code, obj) {
  const body = Buffer.from(JSON.stringify(obj), 'utf8');
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Content-Length': body.length,
  });
  res.end(body);
}

function corsPreflight(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end();
}

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8') || '{}';
  return JSON.parse(raw);
}

function requestAbortSignal(req, res) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  req.once('aborted', abort);
  res.once('close', () => {
    if (!res.writableEnded) abort();
  });
  return controller.signal;
}

function normalizeResults(items) {
  const out = [];
  const seen = new Set();
  for (const item of items || []) {
    if (!item || typeof item !== 'object') continue;
    const url = String(item.url || item.link || item.displayUrl || '').trim();
    const title = String(item.title || item.name || url).trim();
    const snippet = String(
      item.snippet || item.summary || item.content || item.description || '',
    ).trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({ title: title.slice(0, 200), url, snippet: snippet.slice(0, 500) });
  }
  return out;
}

async function proxyDeepseek(payload, signal) {
  const apiKey = String(payload.apiKey || '').trim();
  if (!apiKey) {
    const err = new Error('缺少 DeepSeek API Key');
    err.status = 400;
    throw err;
  }
  const upstream = {
    model: payload.model || DEEPSEEK_MODEL,
    messages: payload.messages || [],
    temperature: payload.temperature ?? 0.5,
    max_tokens: payload.max_tokens ?? 800,
    stream: false,
    // V4 默认开启思考模式；课包生成/点评需要稳定 JSON 与 temperature，故关闭
    thinking: payload.thinking || { type: 'disabled' },
  };
  if (payload.responseFormat?.type === 'json_object') {
    upstream.response_format = { type: 'json_object' };
  }
  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(upstream),
    signal,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: { message: text || res.statusText } };
  }
  if (!res.ok) {
    const err = new Error(data?.error?.message || text || res.statusText);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

function extractAnthropicWebResults(data) {
  const items = [];
  const content = Array.isArray(data?.content) ? data.content : [];
  for (const block of content) {
    if (!block || typeof block !== 'object') continue;
    if (block.type === 'web_search_tool_result') {
      const payload = block.content;
      if (Array.isArray(payload)) {
        for (const hit of payload) {
          if (!hit || typeof hit !== 'object') continue;
          if (hit.type && hit.type !== 'web_search_result') continue;
          items.push({
            url: hit.url || '',
            title: hit.title || hit.url || '',
            snippet: hit.page_age || hit.snippet || hit.summary || '',
          });
        }
      } else if (payload && typeof payload === 'object' && payload.url) {
        items.push(payload);
      }
    }
    for (const cite of block.citations || []) {
      if (!cite || typeof cite !== 'object') continue;
      if (cite.type === 'web_search_result_location' || cite.url) {
        items.push({
          url: cite.url || '',
          title: cite.title || cite.url || '',
          snippet: cite.cited_text || '',
        });
      }
    }
  }
  return normalizeResults(items);
}

async function searchDeepseek(apiKey, query, count, signal) {
  const res = await fetch(DEEPSEEK_ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      max_tokens: 1024,
      // Anthropic 兼容口：none = 关闭思考，加快联网搜索
      reasoning: { effort: 'none' },
      messages: [
        {
          role: 'user',
          content:
            'You must use the web_search tool now. ' +
            'Find high-quality educational web pages (tutorials, official docs, ' +
            'encyclopedias, lectures) about the following topic. ' +
            `Search query: ${query}\n` +
            'Prefer Chinese sources when the query is Chinese. ' +
            'Honor every site: restriction exactly. Return direct article, documentation, ' +
            'repository, encyclopedia-entry, or video pages only; never return search, channel, ' +
            'ranking, topic-list, or profile pages. Do not invent or rewrite URLs or titles. ' +
            'Do not answer from memory; search first.',
        },
      ],
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 3,
        },
      ],
    }),
    signal,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: { message: text || res.statusText } };
  }
  if (!res.ok) {
    const msg =
      data?.error?.message ||
      (typeof data?.error === 'string' ? data.error : null) ||
      text ||
      res.statusText;
    const err = new Error(`搜索上游错误：${msg}`);
    err.status = res.status;
    throw err;
  }
  return extractAnthropicWebResults(data).slice(0, count);
}

const META_MAX_BYTES = 512 * 1024;
const META_TIMEOUT_MS = 7000;

function isPrivateIp(address) {
  const ip = String(address || '').toLowerCase();
  if (net.isIP(ip) === 4) {
    const parts = ip.split('.').map(Number);
    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      parts[0] === 0 ||
      (parts[0] === 169 && parts[1] === 254) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
      parts[0] >= 224
    );
  }
  if (net.isIP(ip) === 6) {
    return (
      ip === '::' ||
      ip === '::1' ||
      ip.startsWith('fc') ||
      ip.startsWith('fd') ||
      ip.startsWith('fe8') ||
      ip.startsWith('fe9') ||
      ip.startsWith('fea') ||
      ip.startsWith('feb') ||
      ip.startsWith('::ffff:127.') ||
      ip.startsWith('::ffff:10.') ||
      ip.startsWith('::ffff:192.168.')
    );
  }
  return true;
}

async function assertPublicUrl(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl || ''));
  } catch {
    throw Object.assign(new Error('无效 URL'), { status: 400 });
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw Object.assign(new Error('只允许 HTTP/HTTPS URL'), { status: 400 });
  }
  const hostname = url.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw Object.assign(new Error('拒绝访问本机地址'), { status: 403 });
  }
  const addresses = net.isIP(hostname)
    ? [{ address: hostname }]
    : await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((row) => isPrivateIp(row.address))) {
    throw Object.assign(new Error('拒绝访问非公网地址'), { status: 403 });
  }
  return url;
}

async function readLimitedBody(response, maxBytes = META_MAX_BYTES) {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > maxBytes) throw Object.assign(new Error('响应体过大'), { status: 413 });
  const chunks = [];
  let total = 0;
  for await (const chunk of response.body || []) {
    total += chunk.length;
    if (total > maxBytes) throw Object.assign(new Error('响应体过大'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function fetchPublicText(rawUrl, { signal, accept = 'text/html,application/json' } = {}) {
  let current = String(rawUrl || '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), META_TIMEOUT_MS);
  const abort = () => controller.abort();
  signal?.addEventListener?.('abort', abort, { once: true });
  try {
    for (let redirects = 0; redirects <= 3; redirects++) {
      const safeUrl = await assertPublicUrl(current);
      const response = await fetch(safeUrl, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          Accept: accept,
          'User-Agent': 'ZhiJing-Learning-Metadata/1.0',
        },
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        if (redirects === 3) throw Object.assign(new Error('重定向次数过多'), { status: 400 });
        const location = response.headers.get('location');
        if (!location) throw Object.assign(new Error('无效重定向'), { status: 502 });
        current = new URL(location, safeUrl).toString();
        continue;
      }
      if (!response.ok) {
        throw Object.assign(new Error(`元数据上游返回 ${response.status}`), {
          status: response.status,
        });
      }
      return {
        url: current,
        contentType: response.headers.get('content-type') || '',
        text: await readLimitedBody(response),
      };
    }
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', abort);
  }
  throw new Error('元数据抓取失败');
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

function htmlMeta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = String(html || '').match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }
  return '';
}

function githubParts(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (!/^(?:www\.)?github\.com$/i.test(url.hostname)) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/i, ''),
      path: parts.length > 4 && ['blob', 'tree'].includes(parts[2]) ? parts.slice(4) : [],
    };
  } catch {
    return null;
  }
}

function markdownTitle(markdown, repoName, fileName) {
  const generic = new Set(
    [repoName, fileName, 'readme', 'readme.md', 'index', 'index.md']
      .map((value) => String(value || '').trim().toLowerCase())
      .filter(Boolean)
  );
  const headings = String(markdown || '')
    .split(/\r?\n/)
    .slice(0, 80)
    .map((line) => line.match(/^\s{0,3}#{1,3}\s+(.+?)\s*#*\s*$/)?.[1] || '')
    .map((title) =>
      title
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/[*_`~]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean);
  return headings.find((title) => !generic.has(title.toLowerCase()) && title.length >= 4) || '';
}

function githubDisplayTitle(parts, repoName, markdown = '', description = '') {
  const name = String(repoName || parts?.repo || 'GitHub');
  const fileName = parts?.path?.[parts.path.length - 1] || '';
  const semanticTitle =
    markdownTitle(markdown, name, fileName) ||
    String(description || '').replace(/\s+/g, ' ').trim();
  if (semanticTitle) return `${semanticTitle.slice(0, 100)}（GitHub）`;
  return parts?.path?.length
    ? `${name} · ${fileName}`
    : `${name} · GitHub 项目`;
}

async function resolveMetadataUrl(rawUrl, signal) {
  const originalUrl = String(rawUrl || '').trim();
  const gh = githubParts(originalUrl);
  try {
    if (gh) {
      const api = await fetchPublicText(
        `https://api.github.com/repos/${encodeURIComponent(gh.owner)}/${encodeURIComponent(gh.repo)}`,
        { signal, accept: 'application/vnd.github+json' }
      );
      const repo = JSON.parse(api.text);
      let sourceText = '';
      try {
        const contentPath = gh.path.length
          ? `/contents/${gh.path.map(encodeURIComponent).join('/')}`
          : '/readme';
        const content = await fetchPublicText(
          `https://api.github.com/repos/${encodeURIComponent(gh.owner)}/${encodeURIComponent(gh.repo)}${contentPath}`,
          { signal, accept: 'application/vnd.github.raw+json' }
        );
        sourceText = content.text;
      } catch {
        sourceText = '';
      }
      const excerpt = sourceText.replace(/\s+/g, ' ').trim().slice(0, 1200);
      const displayTitle = githubDisplayTitle(gh, repo.name, sourceText, repo.description);
      return {
        url: originalUrl,
        canonicalUrl: repo.html_url || originalUrl,
        displayTitle,
        description: String(repo.description || '').slice(0, 500),
        contentExcerpt: excerpt,
        publisher: repo.owner?.login || gh.owner,
        provider: 'github-rest',
        degraded: false,
      };
    }
    const page = await fetchPublicText(originalUrl, { signal });
    const title =
      htmlMeta(page.text, 'og:title') ||
      decodeHtml(page.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
    return {
      url: originalUrl,
      canonicalUrl: htmlMeta(page.text, 'og:url') || page.url || originalUrl,
      displayTitle: title.slice(0, 120),
      description: (
        htmlMeta(page.text, 'og:description') || htmlMeta(page.text, 'description')
      ).slice(0, 500),
      contentExcerpt: '',
      publisher: new URL(originalUrl).hostname.replace(/^www\./i, ''),
      provider: 'html',
      degraded: false,
    };
  } catch (error) {
    return {
      url: originalUrl,
      displayTitle: gh ? githubDisplayTitle(gh, gh.repo) : '',
      description: '',
      contentExcerpt: '',
      publisher: '',
      provider: gh ? 'github-rest' : 'html',
      degraded: true,
      error: error.name === 'AbortError' ? 'timeout' : String(error.message || error),
    };
  }
}

async function githubRepositorySearch(query, limit, signal) {
  if (!query) return [];
  try {
    const page = await fetchPublicText(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=${Math.min(5, limit)}`,
      { signal, accept: 'application/vnd.github+json' }
    );
    const data = JSON.parse(page.text);
    return (data.items || []).slice(0, limit).map((repo) => ({
      title: repo.name,
      originalTitle: repo.full_name,
      displayTitle: `${repo.name} · GitHub 项目`,
      url: repo.html_url,
      snippet: repo.description || '',
      description: repo.description || '',
      publisher: repo.owner?.login || '',
      platform: 'github',
      sourceRole: 'example',
      sourceTier: 'medium',
      provider: 'github-rest',
    }));
  } catch {
    return [];
  }
}

async function resolveMetadataBatch(payload, signal) {
  const urls = [...new Set((Array.isArray(payload?.urls) ? payload.urls : []).map(String))]
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, 10);
  if ((payload?.urls || []).length > 10) {
    throw Object.assign(new Error('单次最多解析 10 个 URL'), { status: 400 });
  }
  const results = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(3, urls.length) }, async () => {
    while (cursor < urls.length) {
      const index = cursor++;
      results[index] = await resolveMetadataUrl(urls[index], signal);
    }
  });
  await Promise.all(workers);
  const githubResults = await githubRepositorySearch(
    String(payload?.githubQuery || '').trim().slice(0, 180),
    Math.min(5, Math.max(1, Number(payload?.githubLimit) || 4)),
    signal
  );
  return { results, githubResults };
}

function safeJoin(root, urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  if (p === '/' || p === '') p = '/index.html';
  const clean = path.normalize(p).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  const full = path.resolve(root, clean);
  const rel = path.relative(root, full);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return full;
}

function createServer(rootDir, port) {
  const root = path.resolve(rootDir);
  const server = http.createServer(async (req, res) => {
    try {
      const u = new URL(req.url || '/', `http://127.0.0.1:${port}`);
      const pathname = u.pathname.replace(/\/+$/, '') || '/';

      if (req.method === 'OPTIONS') {
        corsPreflight(res);
        return;
      }

      if (req.method === 'GET' && pathname === '/api/deepseek/health') {
        sendJson(res, 200, {
          ok: true,
          proxy: true,
          service: 'deepseek',
          search: true,
          metadata: true,
          desktop: true,
        });
        return;
      }

      if (req.method === 'POST' && pathname === '/api/deepseek/chat') {
        const signal = requestAbortSignal(req, res);
        try {
          const payload = await readJson(req);
          const data = await proxyDeepseek(payload, signal);
          sendJson(res, 200, data);
        } catch (e) {
          if (signal.aborted || res.destroyed) return;
          sendJson(res, e.status || 500, e.body || { error: { message: e.message || String(e) } });
        }
        return;
      }

      if (req.method === 'POST' && pathname === '/api/search') {
        const signal = requestAbortSignal(req, res);
        try {
          const payload = await readJson(req);
          const apiKey = String(payload.apiKey || '').trim();
          const query = String(payload.query || '').trim();
          let count = Number(payload.count) || 18;
          count = Math.max(1, Math.min(50, count));
          if (!apiKey) {
            sendJson(res, 400, { error: { message: '缺少 DeepSeek API Key' } });
            return;
          }
          if (!query) {
            sendJson(res, 400, { error: { message: '缺少搜索 query' } });
            return;
          }
          const results = await searchDeepseek(apiKey, query, count, signal);
          sendJson(res, 200, {
            provider: 'deepseek',
            query,
            results,
          });
        } catch (e) {
          if (signal.aborted || res.destroyed) return;
          sendJson(res, e.status || 500, { error: { message: e.message || String(e) } });
        }
        return;
      }

      if (req.method === 'POST' && pathname === '/api/meta/resolve') {
        const signal = requestAbortSignal(req, res);
        try {
          const payload = await readJson(req);
          const data = await resolveMetadataBatch(payload, signal);
          sendJson(res, 200, { provider: 'local-metadata', ...data });
        } catch (e) {
          if (signal.aborted || res.destroyed) return;
          sendJson(res, e.status || 500, { error: { message: e.message || String(e) } });
        }
        return;
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405);
        res.end();
        return;
      }

      let filePath = safeJoin(root, pathname);
      if (!filePath) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const data = fs.readFileSync(filePath);
      const headers = {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Length': data.length,
      };
      // 开发期静态资源一律不缓存，避免旧 PNG/CSS 粘住（看板娘坏图、旧开屏背景）
      if (
        ext === '.html' ||
        ext === '.js' ||
        ext === '.css' ||
        ext === '.png' ||
        ext === '.jpg' ||
        ext === '.jpeg' ||
        ext === '.webp' ||
        ext === '.svg' ||
        ext === '.gif' ||
        pathname.includes('/hub/')
      ) {
        headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      }
      res.writeHead(200, headers);
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (e) {
      sendJson(res, 500, { error: { message: e.message || String(e) } });
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolve({
        server,
        port,
        url: `http://127.0.0.1:${port}/index.html`,
        close: () =>
          new Promise((r) => {
            server.close(() => r());
          }),
      });
    });
  });
}

async function startServer(rootDir, preferredPort = 3000) {
  let lastErr;
  for (let p = preferredPort; p < preferredPort + 20; p++) {
    try {
      return await createServer(rootDir, p);
    } catch (e) {
      lastErr = e;
      if (e.code !== 'EADDRINUSE') throw e;
    }
  }
  throw lastErr || new Error('无法绑定本地端口');
}

module.exports = {
  startServer,
  _test: {
    isPrivateIp,
    assertPublicUrl,
    githubParts,
    githubDisplayTitle,
    markdownTitle,
    resolveMetadataUrl,
    resolveMetadataBatch,
    htmlMeta,
  },
};
