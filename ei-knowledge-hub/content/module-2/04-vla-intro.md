# VLA 模型入门

## PM视角要点

- VLA（Vision-Language-Action）把「看、懂、做」统一到一个大模型里，是具身智能当前最热的路线之一。
- 产品经理应理解 VLA 解决的核心问题：从自然语言指令直接输出机器人动作，减少传统 pipeline 的手工编排。
- 关注落地三问：泛化到新物体/新场景的能力如何？推理延迟能否满足实时控制？训练数据从哪来、成本多少？
- VLA 不是万能：复杂长 horizon 任务仍可能需要分层规划 + 底层控制配合。

## 核心概念

### 什么是 VLA

VLA 模型同时接收视觉观测与自然语言指令，输出机器人动作（关节角、末端位姿、离散技能 token 等）。

### 代表路线

| 模型 | 特点 |
|------|------|
| RT-2 | 将机器人动作离散化为 token，与 VLM 联合训练 |
| OpenVLA | 开源 7B 级 VLA，基于 Prismatic VLM + 动作头 |
| π0 / 后续工作 | 流匹配、扩散等动作生成方式持续演进 |

### 产品化关键

- **动作表示**：离散 token vs 连续控制，影响精度与训练难度
- **数据规模**：互联网图文 + 机器人示教数据的混合比例
- **部署**：边缘端算力 vs 云端推理的延迟与隐私权衡
- **安全**：错误动作的后果分级，需要护栏与人工确认机制

## 今日推荐资料

- [RT-2: Vision-Language-Action Models（项目页）](https://robotics-transformer2.github.io/)
- [OpenVLA 开源项目](https://openvla.github.io/)
- [OpenVLA 论文（arXiv）](https://arxiv.org/abs/2406.09246)

## 关联学习天数

Day 11
