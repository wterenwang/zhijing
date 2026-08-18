#!/usr/bin/env python3
"""本地静态服务 + DeepSeek / 搜索 API 代理（解决浏览器 CORS，Key 仍仅存于本机浏览器）"""
import json
import html
import ipaddress
import os
import re
import socket
import sys
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 3000
ROOT = os.path.dirname(os.path.abspath(__file__))
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_ANTHROPIC_URL = "https://api.deepseek.com/anthropic/v1/messages"
# DeepSeek-V4-Flash-0731 正式版
DEEPSEEK_MODEL = "deepseek-v4-flash"
META_MAX_BYTES = 512 * 1024
META_TIMEOUT_SECONDS = 7
TRUSTED_PROXY_MAPPED_HOSTS = {"api.github.com", "github.com", "www.github.com"}


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def _assert_public_url(raw_url):
    parsed = urllib.parse.urlparse(str(raw_url or ""))
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise ValueError("只允许有效的 HTTP/HTTPS URL")
    if parsed.hostname.lower() == "localhost" or parsed.hostname.lower().endswith(".localhost"):
        raise PermissionError("拒绝访问本机地址")
    addresses = socket.getaddrinfo(parsed.hostname, parsed.port or 443, type=socket.SOCK_STREAM)
    if not addresses:
        raise PermissionError("无法解析目标地址")
    trusted_proxy_mapping = (
        parsed.scheme == "https" and parsed.hostname.lower() in TRUSTED_PROXY_MAPPED_HOSTS
    )
    for item in addresses:
        ip = ipaddress.ip_address(item[4][0])
        # Windows 上的透明代理可能把 GitHub 官方域名映射到 RFC 2544
        # 198.18.0.0/15；仅对固定 HTTPS 白名单接受这种代理地址。
        proxy_benchmark_ip = ip in ipaddress.ip_network("198.18.0.0/15")
        if not ip.is_global and not (trusted_proxy_mapping and proxy_benchmark_ip):
            raise PermissionError("拒绝访问非公网地址")
    return parsed.geturl()


def _fetch_public_text(raw_url, accept="text/html,application/json"):
    current = str(raw_url or "")
    opener = urllib.request.build_opener(_NoRedirect)
    for redirects in range(4):
        current = _assert_public_url(current)
        req = urllib.request.Request(
            current,
            headers={
                "Accept": accept,
                "User-Agent": "ZhiJing-Learning-Metadata/1.0",
            },
        )
        try:
            with opener.open(req, timeout=META_TIMEOUT_SECONDS) as response:
                length = int(response.headers.get("Content-Length") or 0)
                if length > META_MAX_BYTES:
                    raise ValueError("响应体过大")
                body = response.read(META_MAX_BYTES + 1)
                if len(body) > META_MAX_BYTES:
                    raise ValueError("响应体过大")
                return current, body.decode("utf-8", errors="replace")
        except urllib.error.HTTPError as err:
            if err.code in (301, 302, 303, 307, 308):
                if redirects == 3:
                    raise ValueError("重定向次数过多")
                location = err.headers.get("Location")
                if not location:
                    raise ValueError("无效重定向")
                current = urllib.parse.urljoin(current, location)
                continue
            raise
    raise ValueError("元数据抓取失败")


def _html_meta(document, name):
    escaped = re.escape(name)
    patterns = (
        rf'<meta[^>]+(?:property|name)=["\']{escaped}["\'][^>]+content=["\']([^"\']*)["\'][^>]*>',
        rf'<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']{escaped}["\'][^>]*>',
    )
    for pattern in patterns:
        match = re.search(pattern, document or "", re.IGNORECASE)
        if match:
            return re.sub(r"\s+", " ", html.unescape(match.group(1))).strip()
    return ""


def _github_parts(raw_url):
    parsed = urllib.parse.urlparse(str(raw_url or ""))
    if parsed.hostname not in ("github.com", "www.github.com"):
        return None
    parts = [part for part in parsed.path.split("/") if part]
    if len(parts) < 2:
        return None
    path = parts[4:] if len(parts) > 4 and parts[2] in ("blob", "tree") else []
    return {"owner": parts[0], "repo": re.sub(r"\.git$", "", parts[1]), "path": path}


def _markdown_title(markdown, repo_name, file_name=""):
    generic = {
        str(value or "").strip().lower()
        for value in (repo_name, file_name, "readme", "readme.md", "index", "index.md")
        if str(value or "").strip()
    }
    for line in str(markdown or "").splitlines()[:80]:
        match = re.match(r"^\s{0,3}#{1,3}\s+(.+?)\s*#*\s*$", line)
        if not match:
            continue
        title = match.group(1)
        title = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", title)
        title = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", title)
        title = re.sub(r"<[^>]+>", "", title)
        title = re.sub(r"[*_`~]", "", title)
        title = re.sub(r"\s+", " ", title).strip()
        if len(title) >= 4 and title.lower() not in generic:
            return title
    return ""


def _github_display_title(gh, repo_name, markdown="", description=""):
    name = str(repo_name or gh.get("repo") or "GitHub")
    file_name = gh["path"][-1] if gh.get("path") else ""
    semantic = _markdown_title(markdown, name, file_name) or re.sub(
        r"\s+", " ", str(description or "")
    ).strip()
    if semantic:
        return f"{semantic[:100]}（GitHub）"
    return f"{name} · {file_name}" if file_name else f"{name} · GitHub 项目"


def _resolve_metadata_url(raw_url):
    original_url = str(raw_url or "").strip()
    gh = _github_parts(original_url)
    try:
        if gh:
            api_url = "https://api.github.com/repos/{}/{}".format(
                urllib.parse.quote(gh["owner"]), urllib.parse.quote(gh["repo"])
            )
            _, body = _fetch_public_text(api_url, "application/vnd.github+json")
            repo = json.loads(body)
            source_text = ""
            try:
                content_path = (
                    "/contents/"
                    + "/".join(urllib.parse.quote(part) for part in gh["path"])
                    if gh["path"]
                    else "/readme"
                )
                _, source_text = _fetch_public_text(
                    api_url + content_path, "application/vnd.github.raw+json"
                )
            except Exception:
                source_text = ""
            excerpt = re.sub(r"\s+", " ", source_text).strip()[:1200]
            display = _github_display_title(
                gh,
                repo.get("name") or gh["repo"],
                source_text,
                repo.get("description") or "",
            )
            return {
                "url": original_url,
                "canonicalUrl": repo.get("html_url") or original_url,
                "displayTitle": display,
                "description": (repo.get("description") or "")[:500],
                "contentExcerpt": excerpt,
                "publisher": (repo.get("owner") or {}).get("login") or gh["owner"],
                "provider": "github-rest",
                "degraded": False,
            }
        final_url, document = _fetch_public_text(original_url)
        title_match = re.search(
            r"<title[^>]*>([\s\S]*?)</title>", document, re.IGNORECASE
        )
        title = _html_meta(document, "og:title") or (
            re.sub(r"\s+", " ", html.unescape(title_match.group(1))).strip()
            if title_match
            else ""
        )
        return {
            "url": original_url,
            "canonicalUrl": _html_meta(document, "og:url") or final_url,
            "displayTitle": title[:120],
            "description": (
                _html_meta(document, "og:description")
                or _html_meta(document, "description")
            )[:500],
            "contentExcerpt": "",
            "publisher": urllib.parse.urlparse(original_url).hostname or "",
            "provider": "html",
            "degraded": False,
        }
    except Exception as error:
        return {
            "url": original_url,
            "displayTitle": _github_display_title(gh, gh["repo"]) if gh else "",
            "description": "",
            "contentExcerpt": "",
            "publisher": "",
            "provider": "github-rest" if gh else "html",
            "degraded": True,
            "error": "timeout"
            if isinstance(error, (TimeoutError, socket.timeout))
            else str(error),
        }


def _github_repository_search(query, limit):
    if not query:
        return []
    try:
        url = "https://api.github.com/search/repositories?q={}&per_page={}".format(
            urllib.parse.quote(query), min(5, limit)
        )
        _, body = _fetch_public_text(url, "application/vnd.github+json")
        data = json.loads(body)
        return [
            {
                "title": repo.get("name") or "",
                "originalTitle": repo.get("full_name") or "",
                "displayTitle": f'{repo.get("name") or ""} · GitHub 项目',
                "url": repo.get("html_url") or "",
                "snippet": repo.get("description") or "",
                "description": repo.get("description") or "",
                "publisher": (repo.get("owner") or {}).get("login") or "",
                "platform": "github",
                "sourceRole": "example",
                "sourceTier": "medium",
                "provider": "github-rest",
            }
            for repo in (data.get("items") or [])[:limit]
        ]
    except Exception:
        return []


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
                    "metadata": True,
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
        if path == "/api/meta/resolve":
            self._resolve_metadata()
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
        response_format = payload.get("responseFormat")
        if isinstance(response_format, dict) and response_format.get("type") == "json_object":
            upstream["response_format"] = {"type": "json_object"}

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

    def _resolve_metadata(self):
        payload, err = self._read_json()
        if err:
            self._json(400, {"error": {"message": err}})
            return
        urls = payload.get("urls") if isinstance(payload.get("urls"), list) else []
        if len(urls) > 10:
            self._json(400, {"error": {"message": "单次最多解析 10 个 URL"}})
            return
        urls = list(dict.fromkeys(str(url).strip() for url in urls if str(url).strip()))
        with ThreadPoolExecutor(max_workers=min(3, max(1, len(urls)))) as executor:
            results = list(executor.map(_resolve_metadata_url, urls))
        try:
            github_limit = max(1, min(5, int(payload.get("githubLimit") or 4)))
        except (TypeError, ValueError):
            github_limit = 4
        github_results = _github_repository_search(
            str(payload.get("githubQuery") or "").strip()[:180], github_limit
        )
        self._json(
            200,
            {
                "provider": "local-metadata",
                "results": results,
                "githubResults": github_results,
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
                        "Honor every site: restriction exactly. Return direct article, "
                        "documentation, repository, encyclopedia-entry, or video pages only; "
                        "never return search, channel, ranking, topic-list, or profile pages. "
                        "Do not invent or rewrite URLs or titles. "
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
        httpd = ThreadingHTTPServer(("127.0.0.1", PORT), ProxyHandler)
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
