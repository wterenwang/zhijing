# 论文阅读方法

## PM视角要点

- 具身智能 PM 不需要每篇论文精读，但需要高效筛选 + 结构化笔记，建立可检索的知识库。
- 目标：30 分钟内判断一篇论文「值不值得深读」，2 小时内输出一张产品导向 note card。
- 笔记应回答：解决什么问题、比 prior work 好在哪、实验是否可信、对产品 roadmap 的 implication。
- 将论文阅读纳入周 routine：周一扫 arXiv，周三深读 1 篇，周五团队分享 5 分钟。

## 核心概念

### 三遍阅读法

**第一遍（5 分钟）**

- Title, Abstract, Introduction 末段, Figure 1
- 判断：与我的场景相关吗？

**第二遍（30 分钟）**

- 所有 figure + table + method 小节标题
- 记录：输入输出、数据集、baseline、主指标

**第三遍（1-2 小时，仅精选论文）**

- Method 细节、ablation、limitation
- 写产品 note card

### PM Note Card 模板

```markdown
## 论文：[标题]
- **一句话**：...
- **问题**：...
- **方法**：...
- **关键结果**：指标 @ 数据集
- **局限**：...
- **产品 So What**：...
- **跟进**：demo / 竞品 / 对话对象
```

### 可信度检查清单

- [ ] 有 real robot 实验还是仅 simulation？
- [ ] baseline 是否公平、是否缺 industry SOTA？
- [ ] 开源代码/数据？
- [ ] 任务是否与目标产品场景同分布？

### 推荐阅读顺序（入门）

1. RT-2 / OpenVLA（VLA 产品化）
2. Diffusion Policy（manipulation）
3. ACT（低数据 imitation）
4. PPO（locomotion 基础）

## 今日推荐资料

- [How to Read a Paper（Keshav 经典指南）](https://web.stanford.edu/class/ee384m/Handouts/HowtoReadPaper.pdf)
- [Semantic Scholar TL;DR 功能](https://www.semanticscholar.org/)
- [Papers With Code Robotics](https://paperswithcode.com/area/robotics)

## 关联学习天数

Day 26
