# 知径知识库前端

`ei-knowledge-hub` 是知径桌面应用中的知识库子项目，负责把课包中的章节、术语和项目里程碑呈现为可搜索、可浏览、可关联的学习空间。

## 提供的页面

- 知识库首页与学习入口
- 章节精读与 Markdown 渲染
- 全文搜索
- 术语图鉴与易混概念对比
- 知识关系图
- 项目 / 作品集里程碑

运行时内容由主应用注入。开发环境没有课包数据时，会使用 `src/data/` 下的演示数据。

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- D3 Force
- React Markdown + GFM

## 本地开发

```bash
npm ci
npm run dev
```

默认由 Vite 输出本地开发地址。

## 构建

```bash
npm run build
```

构建包含 TypeScript 检查，产物输出到 `dist/`。桌面应用使用仓库根目录的 `hub/` 作为打包内容；修改本子项目后，请确认最新构建产物已同步到 `hub/`，再执行根目录的 Electron 打包命令。

## 关键目录

```text
src/
├─ components/     通用布局、搜索、Markdown 和图谱组件
├─ context/        运行时课包内容上下文
├─ data/           演示数据与术语定义
├─ lib/            搜索、内容适配和运行时课包转换
└─ pages/          首页、章节、搜索、术语、图谱和项目页面
```

本子项目属于知径仓库的一部分，授权条款与仓库根目录 README 一致。
