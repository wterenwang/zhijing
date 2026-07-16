/**
 * 知径桌面端：静态站点 + AI 代理（无需 Python）
 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const BOCHA_URL = 'https://api.bochaai.com/v1/web-search';
const TAVILY_URL = 'https://api.tavily.com/search';

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

async function proxyDeepseek(payload) {
  const apiKey = String(payload.apiKey || '').trim();
  if (!apiKey) {
    const err = new Error('缺少 DeepSeek API Key');
    err.status = 400;
    throw err;
  }
  const upstream = {
    model: payload.model || 'deepseek-chat',
    messages: payload.messages || [],
    temperature: payload.temperature ?? 0.5,
    max_tokens: payload.max_tokens ?? 800,
    stream: false,
  };
  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(upstream),
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

async function searchBocha(apiKey, query, count) {
  const res = await fetch(BOCHA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      summary: true,
      freshness: 'oneWeek',
      count,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || JSON.stringify(data);
    const err = new Error(`搜索上游错误：${msg}`);
    err.status = res.status;
    throw err;
  }
  const pages = data?.data?.webPages || data?.webPages || {};
  return normalizeResults(pages.value || []);
}

async function searchTavily(apiKey, query, count) {
  const res = await fetch(TAVILY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'basic',
      max_results: count,
      include_answer: false,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error || data?.message || JSON.stringify(data);
    const err = new Error(`搜索上游错误：${msg}`);
    err.status = res.status;
    throw err;
  }
  return normalizeResults(data.results || []);
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
          desktop: true,
        });
        return;
      }

      if (req.method === 'POST' && pathname === '/api/deepseek/chat') {
        try {
          const payload = await readJson(req);
          const data = await proxyDeepseek(payload);
          sendJson(res, 200, data);
        } catch (e) {
          sendJson(res, e.status || 500, e.body || { error: { message: e.message || String(e) } });
        }
        return;
      }

      if (req.method === 'POST' && pathname === '/api/search') {
        try {
          const payload = await readJson(req);
          const apiKey = String(payload.apiKey || '').trim();
          const provider = String(payload.provider || 'bocha').trim().toLowerCase();
          const query = String(payload.query || '').trim();
          let count = Number(payload.count) || 18;
          count = Math.max(1, Math.min(50, count));
          if (!apiKey) {
            sendJson(res, 400, { error: { message: '缺少搜索 API Key' } });
            return;
          }
          if (!query) {
            sendJson(res, 400, { error: { message: '缺少搜索 query' } });
            return;
          }
          const results =
            provider === 'tavily'
              ? await searchTavily(apiKey, query, count)
              : await searchBocha(apiKey, query, count);
          sendJson(res, 200, {
            provider: provider === 'tavily' ? 'tavily' : 'bocha',
            query,
            results,
          });
        } catch (e) {
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

module.exports = { startServer };
