<div align="center">

<img src="assets/mascot/jingjing-idle.png" alt="径径" width="160" />

# 知径

**岗位方向，按天学懂。**

专属学习路径 · 每日打卡 · 知识库与术语图鉴 · 智能伴学全程在侧

[⬇️ 立即下载](https://github.com/wterenwang/zhijing/releases/latest) · [✨ 功能](#features) · [🚀 怎么开始](#quickstart)

![Version](https://img.shields.io/badge/version-1.1.4-0891b2)
![Platform](https://img.shields.io/badge/Windows%20%7C%20macOS-111827)
![For](https://img.shields.io/badge/面向-想转岗%20%2F%20系统学岗位的人-0891b2)

</div>

---

## 💡 这是什么

**知径**帮你把「想学某个岗位」变成每天能走完的一小步。

打开应用，径径会带你认识功能；你可以先体验内置的 **产品经理 30 天入门** 展示课表，再 **按自己的行业和岗位新建专属路径**——智能会帮你生成课表、点评练习、解读资讯，让学习不只是看资料。

适合：想系统学某一岗位、希望有人按天带着走、而不是自己在网盘里迷路的人。

---

## 👀 它长什么样

<p align="center">
  <img src="assets/guide/guide-scene-welcome.jpg" alt="开场介绍" width="28%" />
  &nbsp;
  <img src="assets/guide/guide-scene-today.jpg" alt="今日打卡" width="28%" />
  &nbsp;
  <img src="assets/guide/guide-scene-hub.jpg" alt="知识库" width="28%" />
</p>

<p align="center"><sub>径径介绍产品 → 今天打卡 → 知识库精读</sub></p>

---

<a id="features"></a>

## ✨ 你能用它做什么

| | | |
|---|---|---|
| 🗺️ | **专属学习路径** | 告诉它你的行业和岗位，生成按天课表（默认 30 天，可按目标调整） |
| 📅 | **每天打卡** | 看今日任务、做练习、用自己的话复述，一步记下进度 |
| 🤖 | **智能伴学** | 填入 DeepSeek 密钥即可：生成课表、练习点评、联网资讯解读；生成中可随时停止 |
| 💾 | **生成可恢复** | 课表生成会写检查点：刷新、误关窗口或中途停止后，可接着补全，不卡在「生成中」 |
| 📚 | **知识库优先** | 先把章节讲透，再沉淀术语；概念对齐知识库，而不是只丢一堆链接 |
| 🔤 | **术语图鉴与复习** | 用你平时会说的话找到岗位名词；图解、易混对比、闪卡 + 间隔复习巩固 |
| 🧩 | **练习 · 求职 · 资讯** | 需要时在「更多」里打开，不打扰每天的主线 |
| 🐾 | **径径** | 多条路径时汇总今日待办；单路径时提醒练习、费曼与打卡 |

专属课表会按质量门槛自动加厚浅章节、减少模板化练习；生成过程可后台进行，骨架就绪后可先学前几天。展示课表仅供试用，真正要学的是你自己那条路径。智能功能可选，主学习流程不强制联网。

---

<a id="quickstart"></a>

## 🚀 怎么开始（大约 3 分钟）

1. 前往 [下载页](https://github.com/wterenwang/zhijing/releases/latest)，选择你的系统  
   - **Windows（x64）**：`Zhijing-Setup-1.1.4.exe`  
   - **Mac（Apple 芯片）**：`Zhijing-1.1.4-mac-arm64.dmg` 或 `.zip`（若本版尚未上传，请暂用上一版或等待补充）
2. 安装后打开 **「知径」**
3. 跟着径径走完引导 → 按提示配置 DeepSeek（可选）→ **新建路径**，开始正式学习

也可以先点开「产品经理 30 天入门」体验一天长什么样，再创建自己的课表。

> 🍎 若 Mac 提示「已损坏 / 无法打开」，在「终端」里粘贴执行：  
> `xattr -cr "/Applications/知径.app"`  
> 然后再打开知径。

---

## 🧭 一天通常怎么用

1. 打开知径，看 **今天** 要学什么  
2. 读知识库 / 资料、做练习，试试用自己的话复述  
3. 点打卡，把今天收尾  
4. 遇到不懂的词或概念 → 先回看 **知识库**，再打开 **术语图鉴**（从你的说法切入，对照图解与易混点）  
5. 想多练、看资讯或准备求职 → 打开 **更多**

径径会在旁边提醒你：展示课表只是样例，专属路径才是你的主线。

---

## 🔑 智能功能（可选）

在设置里填入 **DeepSeek API Key** 后即可使用：

- 按行业 / 岗位 **生成专属课表**（支持中途停止与刷新后恢复；自动检查章节厚度与练习多样性）
- 练习 **点评与参考答案**
- **联网搜索** 后的日课资讯解读（与聊天共用同一密钥）

密钥仅保存在本机，不会上传到知径服务器。

---

## 💬 有问题？

欢迎在 [Issues](https://github.com/wterenwang/zhijing/issues) 告诉我们卡在哪一步。

---

<details>
<summary>🛠️ 开发者：本地运行与打包</summary>

```bash
git clone https://github.com/wterenwang/zhijing.git
cd zhijing
npm install
npm start              # 桌面调试
npm run dist           # Windows → release/Zhijing-Setup-*.exe
npm run dist:mac       # macOS → release/Zhijing-*-mac-arm64.dmg（需 Mac 或 CI）
```

知识库前端（`ei-knowledge-hub`）修改后需先构建，再打包桌面端：

```bash
cd ei-knowledge-hub && npm install && npm run build && cd ..
npm run dist
```

本地网页预览：双击 `启动本地服务.bat`，浏览器打开 `http://localhost:3000/index.html`（需本机 Python；窗口标题为 ZhiJing-AI-Proxy）。

</details>

---

<div align="center">

**把岗位能力，拆成每天走得动的一步。**

<sub>知径 · 径径陪你学</sub>

</div>
