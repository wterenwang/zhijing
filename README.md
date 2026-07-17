<div align="center">

<img src="assets/mascot/jingjing-idle.png" alt="径径" width="160" />

# 知径

**岗位方向，按天学懂。**

打开就能打卡 · 自带课表与知识库 · 智能增强可选、不挡上手

[⬇️ 下载](https://github.com/wterenwang/zhijing/releases) · [✨ 功能](#features) · [🚀 上手](#quickstart) · [🛠️ 开发](#dev)

![Version](https://img.shields.io/badge/version-1.1.0-0891b2)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-111827)
![Stack](https://img.shields.io/badge/stack-Electron-47848F)
![AI](https://img.shields.io/badge/AI-optional-10b981)

</div>

---

## 💡 这是什么

**知径**是一款面向个人的岗位学习桌面应用：按「路径」安排每天学什么，用打卡把进度落下来，再用知识库和术语库把概念吃透。

它不是又一个资料堆。默认内置 **「产品经理 30 天入门」** 展示课表（可试用），真正长期要学的内容，推荐你 **新建自己的行业 / 岗位路径**。智能功能（生成课表、点评、资讯解读）随时可开，**主路径不依赖 API、不强制登录**。

适合：想系统学某一岗位、又不想先折腾配置的人。

---

## 👀 它长什么样

<p align="center">
  <img src="assets/guide/guide-scene-welcome.jpg" alt="开场介绍" width="28%" />
  &nbsp;
  <img src="assets/guide/guide-scene-today.jpg" alt="今日打卡" width="28%" />
  &nbsp;
  <img src="assets/guide/guide-scene-hub.jpg" alt="知识库" width="28%" />
</p>

<p align="center"><sub>径径带你认识产品 → 今天打卡 → 知识库精读</sub></p>

---

<a id="features"></a>

## ✨ 它能做什么

| | 能力 | 说明 |
|---|---|---|
| 📅 | **今天** · 按天打卡 | 看任务、练一练、用自己的话复述，点一下记下进度 |
| 📚 | **知识库** · 章节精读 | 默认路径自带约 12 篇可读章节，日任务可跳转到对应文 |
| 🔤 | **术语库** · 名词速查 | 入门术语浏览 + 闪卡复习，遇到词立刻能查 |
| 🧩 | **更多** · 练习 / 求职 / 资讯 | 次要工具收在「更多」，不打扰主路径 |
| 🗺️ | **新建路径** · 专属课表 | 填行业与岗位，生成你真正要学的那条路 |
| 🤖 | **智能（可选）** · 增强体验 | 配置密钥后可用生成、点评等；不开也能完整学习 |

**设计原则：** 主路径可离线使用；默认课表标明「展示样例」；打卡是软门槛——没写完练习也会提醒，但仍允许打卡。

---

<a id="quickstart"></a>

## 🚀 三分钟上手

### 普通用户（推荐）

1. 打开 [Releases](https://github.com/wterenwang/zhijing/releases)，下载对应系统的安装包  
   - **Windows**：`知径-Setup-x.x.x.exe`  
   - **macOS（Apple Silicon）**：`.dmg` / `.zip`
2. 安装后从桌面或开始菜单打开 **「知径」**
3. 跟着径径走完新人引导 → 试用展示课表，或直接 **新建路径** 开始正式学习

> 🍎 macOS 若提示「已损坏 / 无法验证开发者」，在终端执行：  
> `xattr -cr "/Applications/知径.app"`  
> 然后再打开应用。

### 网页本地预览（可选）

本机需有 Python。双击 `启动本地服务.bat`，浏览器打开：

```
http://localhost:3000/index.html
```

---

## 🧭 一天怎么用

```text
打开知径
  → 看「今天」任务与资料
  → 做练习 / 费曼复述（可选但推荐）
  → 完成打卡
  → 卡住时去「知识库」「术语库」补概念
  → （可选）在「更多」看资讯、练习复习或求职准备
```

首次进入会有三段式引导：**讲清产品 → 逐页试用 → 催你新建自己的路径**。没有自建路径时，径径会持续提醒——默认课表只是样例，不是终点。

---

## 🤖 智能功能（可选）

默认关闭，不挡进入。需要时在应用内按「如何配置 API」完成即可（常见如 DeepSeek）。

| ✅ 有密钥 | 📴 无密钥 |
|--------|--------|
| 可用课表生成、点评、资讯解读等增强 | 打卡、知识库、术语库完整可用 |

---

<a id="dev"></a>

## 🛠️ 本地开发

```bash
git clone https://github.com/wterenwang/zhijing.git
cd zhijing
npm install
npm start          # Electron 调试
npm run dist       # 打包 Windows 安装包 → release/
npm run dist:mac   # 打包 macOS（需在 macOS 或 CI 上）
```

| 脚本 | 作用 |
|------|------|
| `npm start` | 启动桌面调试 |
| `npm run dist` | Windows NSIS 安装包 |
| `npm run dist:portable` | Windows 绿色版 |
| `npm run dist:mac` | macOS DMG / ZIP（arm64） |

产物目录：`release/`（已加入 `.gitignore`，不会进仓库）。

---

## 🧱 技术一览

- **桌面壳**：Electron  
- **界面**：本地 HTML / CSS / JS（含内嵌知识库 hub）  
- **数据**：本地优先，无账号、无强制云同步  
- **AI**：可选代理增强，主学习闭环不依赖网络密钥  

---

## 🚫 现在不做

- 账号体系 / 云同步  
- 应用商店分发  
- 强制登录或付费门禁  

---

## 💬 反馈

有想法或踩坑，欢迎开 [Issue](https://github.com/wterenwang/zhijing/issues)。

---

<div align="center">

**把岗位能力，拆成每天走得动的一步。**

<sub>知径 · 径径陪你学</sub>

</div>
