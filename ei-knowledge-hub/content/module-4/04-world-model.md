# 世界模型

## PM视角要点

- 世界模型（World Model）让 AI 在「脑海」中预测环境变化，用于规划、仿真加速、少样本决策。
- 对产品的意义：减少真机试错成本、支持「先想后做」的安全策略、可能缩短 sim2real 周期。
- 当前多数世界模型仍在 research 阶段，PM 应区分「论文 demo」与「可部署模块」。
- 关注与 VLA、RL 的结合：世界模型作 planner，VLA/RL 作 executor 的分层架构趋势。

## 核心概念

### 什么是世界模型

学习环境的动态规律：给定当前状态 + 动作，预测下一状态（或观测）。

```
s_t, a_t → World Model → s_{t+1}（预测）
```

### 主要用途

1. **Model-Based RL**：在模型内 rollout，减少真机/仿真采样
2. **Planning**：想象多条未来轨迹，选最优
3. **Data Augmentation**：生成合成训练数据
4. **Anomaly Detection**：预测与实际偏差大 → 触发安全停止

### 代表方向

- **RSSM / Dreamer 系列**： latent 动态模型 + RL
- **Video Prediction**：从像素预测未来帧，用于 manipulation 预判
- **LLM as World Model**：用语言描述状态转移（尚早期）

### 产品化挑战

- **预测误差累积**：长 horizon 预测漂移
- **Sim 与 real 的 gap**：模型在训练分布外失效
- **算力**：实时 planning 需要高效 latent model
- **评估**：缺乏统一 benchmark 对应真实产品场景

### PM 决策点

- 是否投资 world model 路线 vs 扩大示教数据规模
- 若采用，先锁定 1 个可验证子场景（如「推物体是否会倒」）

## 今日推荐资料

- [DreamerV3 论文（arXiv）](https://arxiv.org/abs/2301.04104)
- [World Models 经典博客（David Ha）](https://worldmodels.github.io/)
- [GAIA-1 自动驾驶世界模型（Wayve）](https://wayve.ai/thinking/gaia-1/)

## 关联学习天数

Day 24
