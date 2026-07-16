# 模仿学习入门

## PM视角要点

- 模仿学习（Imitation Learning, IL）从人类示教或遥操作中学习，是 manipulation（抓取、装配）最主流的数据驱动路径。
- 产品经理的核心工作：定义「什么是好示教」、设计遥操作 UX、估算数据采集成本与规模。
- 行为克隆（BC）简单但存在复合误差：一步错步步错。Chunk 预测、扩散策略等方法是为解决此问题而生。
- 评估 IL 产品不能只看训练 loss，要看 OOD（分布外）场景：新物体、新位置、新光照下的成功率。

## 核心概念

### 行为克隆（Behavior Cloning）

- 将示教数据当作监督学习：观测 → 动作
- 优点：实现简单、样本效率相对高
- 缺点：误差累积、难以处理多模态动作（同一观测多种合理动作）

### Diffusion Policy

- 用扩散模型生成动作序列，能建模多模态分布
- 在精细操作任务上表现优异，推理需多步去噪，延迟是产品关注点

### ACT（Action Chunking with Transformers）

- 一次预测一段动作 chunk（如 100 步），减少复合误差
- 结合 CVAE 处理多模态，ALOHA 双臂系统上 50 条示教即可达 80%+ 成功率
- 适合 PM 关注的「低数据、高成功率」家庭/轻量场景

### 数据采集产品化

- 遥操作界面、示教质检、自动过滤无效轨迹
- 数据多样性规划：物体、背景、起始位姿的覆盖矩阵

## 今日推荐资料

- [Diffusion Policy 项目页](https://diffusion-policy.cs.columbia.edu/)
- [ACT 论文：Learning Fine-Grained Bimanual Manipulation（arXiv）](https://arxiv.org/abs/2304.13705)
- [ALOHA 项目页](https://tonyzhaozh.github.io/aloha/)

## 关联学习天数

Day 13
