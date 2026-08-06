#!/usr/bin/env python3
"""本地静态服务 + DeepSeek / 搜索 API 代理（解决浏览器 CORS，Key 仍仅存于本机浏览器）"""
import json
import os
import sys
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 3000
ROOT = os.path.dirname(os.path.abspath(__file__))
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_ANTHROPIC_URL = "https://api.deepseek.com/anthropic/v1/messages"
# DeepSeek-V4-Flash-0731 正式版
DEEPSEEK_MODEL = "deepseek-v4-flash"


class ProxyHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # 本地开发：禁用浏览器缓存，避免知识库 JS/HTML 一直用旧版
        path = self.path.split("?", 1)[0]
        if path.endswith((".html", ".js", ".css")) or "/hub/" in path or path.startswith("/hub"):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
        super().end_headers()

    def _path(self):
        return self.path.split("?", 1)[0].rstrip("/") or "/"

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self._path() == "/api/deepseek/health":
            self._json(
                200,
                {
                    "ok": True,
                    "proxy": True,
                    "service": "deepseek",
                    "search": True,
                },
            )
            return
        return super().do_GET()

    def do_POST(self):
        path = self._path()
        if path == "/api/deepseek/chat":
            self._proxy_deepseek()
            return
        if path == "/api/search":
            self._proxy_search()
            return
        self.send_error(404, "Not Found")

    def _read_json(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length) if length else b"{}"
            return json.loads(raw.decode("utf-8")), None
        except (json.JSONDecodeError, ValueError):
            return None, "请求体不是合法 JSON"

    def _proxy_deepseek(self):
        payload, err = self._read_json()
        if err:
            self._json(400, {"error": {"message": err}})
            return

        api_key = (payload.pop("apiKey", "") or "").strip()
        if not api_key:
            self._json(400, {"error": {"message": "缺少 DeepSeek API Key"}})
            return

        upstream = {
            "model": payload.get("model", DEEPSEEK_MODEL),
            "messages": payload.get("messages", []),
            "temperature": payload.get("temperature", 0.5),
            "max_tokens": payload.get("max_tokens", 800),
            "stream": False,
            # V4 默认开启思考；生成/点评需要稳定 JSON，关闭思考模式
            "thinking": payload.get("thinking") or {"type": "disabled"},
        }

        req = urllib.request.Request(
            DEEPSEEK_URL,
            data=json.dumps(upstream).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            method="POST",
        )
        self._forward(req)

    def _proxy_search(self):
        payload, err = self._read_json()
        if err:
            self._json(400, {"error": {"message": err}})
            return

        api_key = (payload.get("apiKey") or "").strip()
        if not api_key:
            self._json(400, {"error": {"message": "缺少 DeepSeek API Key"}})
            return

        query = (payload.get("query") or "").strip()
        if not query:
            self._json(400, {"error": {"message": "缺少搜索 query"}})
            return

        try:
            count = int(payload.get("count") or 18)
        except (TypeError, ValueError):
            count = 18
        count = max(1, min(count, 50))

        try:
            results = self._search_deepseek(api_key, query, count)
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            try:
                err_obj = json.loads(body)
            except json.JSONDecodeError:
                err_obj = {"error": {"message": body or str(e)}}
            msg = (
                err_obj.get("error", {}).get("message")
                if isinstance(err_obj.get("error"), dict)
                else err_obj.get("message") or body or str(e)
            )
            self._json(e.code, {"error": {"message": f"搜索上游错误：{msg}"}})
            return
        except urllib.error.URLError as e:
            self._json(502, {"error": {"message": f"无法连接搜索 API：{e.reason}"}})
            return
        except Exception as e:
            self._json(500, {"error": {"message": str(e)}})
            return

        self._json(
            200,
            {
                "provider": "deepseek",
                "query": query,
                "results": results,
            },
        )

    def _search_deepseek(self, api_key, query, count):
        """DeepSeek Anthropic 兼容口的服务端 web_search（同一 DeepSeek Key）。"""
        body = {
            "model": DEEPSEEK_MODEL,
            "max_tokens": 1024,
            "reasoning": {"effort": "none"},
            "messages": [
                {
                    "role": "user",
                    "content": (
                        "You must use the web_search tool now. "
                        "Find high-quality educational web pages (tutorials, official docs, "
                        "encyclopedias, lectures) about the following topic. "
                        f"Search query: {query}\n"
                        "Prefer Chinese sources when the query is Chinese. "
                        "Do not answer from memory; search first."
                    ),
                }
            ],
            "tools": [
                {
                    "type": "web_search_20250305",
                    "name": "web_search",
                    "max_uses": 3,
                }
            ],
        }
        req = urllib.request.Request(
            DEEPSEEK_ANTHROPIC_URL,
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        results = self._extract_anthropic_web_results(data)
        return results[:count]

    def _extract_anthropic_web_results(self, data):
        items = []
        content = data.get("content") if isinstance(data, dict) else None
        if not isinstance(content, list):
            return []

        for block in content:
            if not isinstance(block, dict):
                continue
            if block.get("type") == "web_search_tool_result":
                payload = block.get("content")
                if isinstance(payload, list):
                    for hit in payload:
                        if isinstance(hit, dict) and hit.get("type") in (
                            "web_search_result",
                            None,
                        ):
                            items.append(
                                {
                                    "url": hit.get("url") or "",
                                    "title": hit.get("title") or hit.get("url") or "",
                                    "snippet": (
                                        hit.get("page_age")
                                        or hit.get("snippet")
                                        or hit.get("summary")
                                        or ""
                                    ),
                                }
                            )
                elif isinstance(payload, dict) and payload.get("url"):
                    items.append(payload)
            for cite in block.get("citations") or []:
                if not isinstance(cite, dict):
                    continue
                if cite.get("type") == "web_search_result_location" or cite.get("url"):
                    items.append(
                        {
                            "url": cite.get("url") or "",
                            "title": cite.get("title") or cite.get("url") or "",
                            "snippet": cite.get("cited_text") or "",
                        }
                    )

        return self._normalize_results(items)

    def _normalize_results(self, items):
        out = []
        seen = set()
        for item in items or []:
            if not isinstance(item, dict):
                continue
            url = (
                item.get("url")
                or item.get("link")
                or item.get("displayUrl")
                or ""
            ).strip()
            title = (item.get("title") or item.get("name") or url).strip()
            snippet = (
                item.get("snippet")
                or item.get("summary")
                or item.get("content")
                or item.get("description")
                or ""
            ).strip()
            if not url or url in seen:
                continue
            seen.add(url)
            out.append(
                {
                    "title": title[:200],
                    "url": url,
                    "snippet": snippet[:500],
                }
            )
        return out

    def _forward(self, req):
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                data = resp.read()
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(data)
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            try:
                err = json.loads(body)
            except json.JSONDecodeError:
                err = {"error": {"message": body or str(e)}}
            self._json(e.code, err)
        except urllib.error.URLError as e:
            self._json(502, {"error": {"message": f"无法连接 DeepSeek API：{e.reason}"}})
        except Exception as e:
            self._json(500, {"error": {"message": str(e)}})

    def _json(self, code, obj):
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(obj, ensure_ascii=False).encode("utf-8"))

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")

    def log_message(self, fmt, *args):
        if not args:
            return super().log_message(fmt, *args)
        first = str(args[0])
        if first.startswith("POST /api/") or first.startswith("GET /api/"):
            return
        super().log_message(fmt, *args)


def main():
    os.chdir(ROOT)
    print()
    print("=" * 48)
    print("  知径 · 本地 AI 代理服务")
    print("=" * 48)
    print(f"  地址: http://localhost:{PORT}/index.html")
    print(f"  健康检查: http://localhost:{PORT}/api/deepseek/health")
    print("  接口: /api/deepseek/chat  /api/search（DeepSeek Web Search）")
    print("  按 Ctrl+C 停止")
    print("=" * 48)
    print()

    try:
        httpd = ThreadingHTTPServer(("", PORT), ProxyHandler)
    except OSError:
        print(f"[错误] 端口 {PORT} 已被占用！")
        print("请先关闭之前运行的本地服务窗口，常见情况：")
        print("  - python -m http.server 3000")
        print("  - npx serve -l 3000")
        print("关闭后重新双击 启动本地服务.bat")
        print()
        input("按回车键退出...")
        sys.exit(1)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务已停止。")


if __name__ == "__main__":
    main()
