<div align="center">

<img src="assets/mascot/jingjing-idle.png" alt="知径学习伴侣径径" width="144" />

# 知径

### 🧭 把“我想学一个岗位”，变成每天真正走得完的一步

知径会根据你的行业、岗位和目标，智能生成专属学习路径，<br />
并陪你完成每天的任务、阅读、练习、复盘与打卡。

[📥 下载最新版](https://github.com/wterenwang/zhijing/releases/latest) · [✨ 查看本次更新](https://github.com/wterenwang/zhijing/releases/tag/v1.2.1) · [💬 反馈问题](https://github.com/wterenwang/zhijing/issues)

![Version](https://img.shields.io/badge/版本-1.2.1-0891b2)
![Platform](https://img.shields.io/badge/支持-Windows_x64%20%7C%20macOS_Universal-111827)

</div>

<p align="center">
  <img src="assets/screenshots/today-v1.2.0.png" alt="知径今日学习页面" width="92%" />
</p>

## 🌱 知径能帮你做什么

### 🗺️ 为你的目标生成专属学习路径

输入想学习的行业、岗位、目标和周期，知径会生成一条 30、60 或 90 天的专属路径。你不需要先整理课程，也不用面对一堆不知道从哪里开始的资料。

### 📅 每天只关注今天该做的事

“今天”页会按清晰顺序带你完成：

> **今日任务 → 推荐资料 → 每日练习 → 复述与笔记 → 完成打卡**

不用反复切换页面，也不用自己安排学习节奏。

### 🔎 自动寻找并整理可信资料

知径会围绕每天的学习主题搜索资料、整理标题，并把资料和任务对应起来。GitHub 项目也会尽量显示通俗的内容标题，而不是难懂的文件名。

### ✍️ 不只是阅读，还会检查你是否真的学会

每天都包含不同类型的练习。你可以先独立作答，再查看智能点评和参考思路；还可以用自己的话完成复述，把“看过”变成“会讲、会用”。

### 🧠 把学过的内容沉淀下来

学习内容会逐步进入知识库、术语图鉴和复习计划。你可以搜索章节、对比易混概念、查看知识关系，并通过间隔复习减少遗忘。

### 💼 从学习自然走向作品与求职

知径还提供面试题、作品集里程碑、能力掌握度、投递记录和行业资讯，让学习过程能够沉淀为可展示、可复盘的成果。

## 🤖 智能生成是知径的核心能力

知径的专属路径、课包内容、资料搜索、练习点评和资讯解读都由智能能力驱动。**正式使用知径前，需要配置自己的 DeepSeek API Key。**

- 不配置密钥时，可以先浏览内置的“产品经理 30 天入门”展示路径。
- 配置密钥后，才能生成自己的专属路径并使用完整的智能功能。
- DeepSeek 可能按实际使用量产生费用，请留意自己的账户余额和计费规则。

知径只负责在你的电脑上调用你配置的服务，不提供公共共享密钥。

## 🚀 3 分钟开始使用

### 1. 下载知径

前往 [📥 最新版本下载页](https://github.com/wterenwang/zhijing/releases/latest)：

- **Windows x64**：下载 `Zhijing-Setup-1.2.1.exe`
- **macOS（Apple 芯片与 Intel）**：仅在发布页已提供 `Zhijing-1.2.1-mac-universal.dmg` 时下载。该文件必须经过 Developer ID 签名和 Apple 公证；如果发布页尚未提供，表示正式 macOS 产物仍在等待发布凭据。

### 2. 安装并打开

Windows 运行安装程序，按提示完成安装。当前 Windows 安装包尚未配置 Authenticode 代码签名，系统可能显示“未知发布者”提示；请只从本仓库 Release 下载，并核对发布说明中的 SHA-256。

macOS 打开正式 DMG 后，将知径拖入“应用程序”，再从“应用程序”中双击打开。正式包使用 Developer ID 签名并完成 Apple 公证，不需要终端命令或绕过系统安全检查。支持 Apple Silicon 与 Intel，最低为 macOS 12。

### 3. 配置 DeepSeek

进入“配置 API / 开启智能功能”，填入自己的 DeepSeek API Key。密钥可在 [DeepSeek 开放平台](https://platform.deepseek.com/) 创建。

### 4. 新建你的学习路径

填写行业、岗位、学习目标和周期，开始生成专属路径。生成期间可以先浏览其他页面；如果刷新、关闭或中途停止，下次还可以继续补全。

### 5. 从“今天”开始学习

跟随任务、资料、练习、复盘和打卡完成当天内容。遇到不熟悉的概念，可以前往“日课”和“术语库”继续查看。

## ✨ v1.2.1 有哪些变化

- **质量状态更可信**：不再用“98%”等无依据百分比，直接说明通过项、失败原因、学习影响和下一步。
- **修复不再无限循环**：无实际变化时停止重复修复，可以继续学习、重新生成问题部分或重新生成整个课包。
- **中断后安全继续**：认证、余额、网络、超时和退出中断分别提示，已生成内容会保留并可继续补全。
- **旧课包不会被新失败覆盖**：重新生成先使用候选包，只有通过结构验收后才替换当前可用课包。
- **今日清单可持久保存**：支持勾选和取消，刷新、切换日期或重启后状态仍正确，且不同路径互不串联。
- **长内容完整展示**：自检要点、参考内容和相邻长字段不再被解析或界面固定高度截断。
- **任务学习引导**：任务内直接提供“怎么做、做成什么样、我做得怎么样”三段式帮助。
- **诊断更安全清晰**：记录排队、生成、修复、重试和恢复结果，同时对 API Key 与敏感内容脱敏。

查看完整记录：[📋 CHANGELOG.md](CHANGELOG.md)

## 🔐 数据与隐私

- DeepSeek API Key 和学习进度保存在你的电脑上。
- 知径没有用于收集密钥和学习记录的自建云端账户服务。
- 使用智能功能时，完成任务所需的内容会发送给你配置的 DeepSeek 服务。
- 联网搜索会访问 GitHub 等公开网站获取资料信息。
- 请不要在学习内容、问题反馈或日志中粘贴密码、令牌等敏感信息。
- 建议定期使用应用内的“备份进度”功能保存学习数据。

## 🙋 常见问题

<details>
<summary><strong>不配置 DeepSeek 可以使用吗？</strong></summary>

可以浏览展示路径，了解每天如何学习。生成专属路径、搜索资料、智能点评等核心能力需要配置 DeepSeek API Key。

</details>

<details>
<summary><strong>生成过程中关闭了应用，要重新开始吗？</strong></summary>

不需要。知径会保存生成进度，再次打开后可以继续补全。

</details>

<details>
<summary><strong>为什么 macOS 仍提示无法验证开发者？</strong></summary>

请先确认发布页确实提供了文件名包含 `mac-universal` 的正式 DMG；没有该文件时，表示签名公证产物尚未发布。正式发布流程会在上传前验证签名、公证票据和 Gatekeeper。如果正式包仍被拦截，请不要执行绕过命令，改为在 Issues 中提供版本号和系统版本。

</details>

<details>
<summary><strong>学习数据可以同步到其他电脑吗？</strong></summary>

当前没有云端同步。你可以通过“备份进度”和“恢复备份”手动迁移。

</details>

## 💬 获取帮助

如果遇到问题，请前往 [GitHub Issues](https://github.com/wterenwang/zhijing/issues)，说明：

- 使用的系统和知径版本
- 问题出现前做了什么
- 页面提示或错误截图

提交前请检查截图和日志，确保没有包含 API Key 或个人隐私。

---

<details>
<summary><strong>🛠️ 开发者信息：本地运行、测试与打包</strong></summary>

### 环境要求

- Node.js 22+
- npm
- Python 3（网页版本地服务）

### 本地运行

```bash
git clone https://github.com/wterenwang/zhijing.git
cd zhijing
npm ci
npm run test:workflow
npm start
```

### 测试与打包

```bash
npm run test:workflow   # 课包工作流回归测试
npm run pack            # 生成 unpacked 桌面应用
npm run dist            # 构建 Windows 安装包
npm run dist:portable   # 构建 Windows 便携版
npm run dist:mac        # 在 macOS 上构建并签名、公证 Universal DMG + ZIP
```

知识库前端位于 `ei-knowledge-hub/`：

```bash
cd ei-knowledge-hub
npm ci
npm run build
```

Windows 网页预览可运行 `启动本地服务.bat`，然后访问 `http://127.0.0.1:3000/index.html`。

### 课包生成流程

![知径课包生成流程](docs/architecture/course-pack-generation.svg)

### 项目结构

```text
.
├─ index.html
├─ js/
├─ electron/
├─ ai-proxy.py
├─ ei-knowledge-hub/
├─ hub/
├─ test/
├─ docs/
└─ .github/workflows/
```

</details>

## 📄 授权说明

Copyright © 知径。保留所有权利。

本仓库公开仅用于查看与问题反馈，未授予复制、修改、再分发、商用或创建衍生作品的许可。
