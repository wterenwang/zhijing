# 强化学习入门

## PM视角要点

- 强化学习（RL）让机器人在与环境的试错中学习策略，擅长 locomotion（行走、平衡）等难以手工编程的控制任务。
- PM 不必推导 Bellman 方程，但要理解 RL 的产品代价：仿真环境搭建、奖励函数设计、Sim2Sim/Sim2Real 迁移、训练算力与时间。
- 奖励函数设计是「隐性产品需求」：研发优化的目标函数，最终就是用户体验（稳、快、省能、安全）。
- RL 上线前必须定义验收场景集：平地、斜坡、扰动、负载变化，否则 demo 成功不等于可交付。

## 核心概念

### 基本要素

- **状态（State）**：关节角、速度、IMU、接触力等
- **动作（Action）**：目标扭矩、位置增量、步态参数
- **奖励（Reward）**：标量反馈，引导策略优化方向
- **策略（Policy）**：状态到动作的映射，通常用神经网络表示

### 训练流程

```
仿真环境 → 策略采样 → 计算奖励 → 策略梯度更新 → 重复百万步 → Sim2Sim 验证 → 真机部署
```

### 常见算法

- **PPO**（Proximal Policy Optimization）：稳定、易调参， legged robot 领域广泛使用
- **SAC/TD3**：连续控制场景的 off-policy 方法

### Sim2Real 鸿沟

仿真中的摩擦、延迟、电机特性与真实世界存在差异。产品 roadmap 需预留 sim2real 调参与人机共处的安全验证周期。

## 今日推荐资料

- [Spinning Up in Deep RL（OpenAI 教程）](https://spinningup.openai.com/)
- [PPO 原始论文（arXiv）](https://arxiv.org/abs/1707.06347)
- [Isaac Gym 文档](https://developer.nvidia.com/isaac-gym)

## 关联学习天数

Day 12
