# Diffusion Policy

## PM视角要点

- Diffusion Policy 用扩散模型生成机器人动作序列，是 2023 年以来 manipulation 领域的重要突破。
- 相比 BC，能更好处理「同一观测多种合理动作」的多模态问题，精细操作成功率高。
- 产品关注点：**推理延迟**（多步 denoising）、**算力**（GPU 需求）、与 **VLA/ACT** 的路线选择。
- 适合 PM 推动 POC 的场景：接触丰富任务（插拔、装配、开盖），传统 BC 成功率 plateau 时。

## 核心概念

### 核心思想

将动作序列生成建模为 denoising diffusion process：从噪声逐步还原出平滑、可行的 action trajectory。

```
观测 o → Diffusion Policy → 动作序列 [a_t, a_{t+1}, ..., a_{t+H}]
```

### 与 BC / ACT 对比

| 方法 | 多模态 | 样本效率 | 推理速度 | 典型成功率 |
|------|--------|----------|----------|------------|
| BC | 弱 | 中 | 快 | 较低 |
| ACT | 强（CVAE） | 高 | 快 | 高 |
| Diffusion Policy | 强 | 高 | 较慢 | 高（精细任务） |

### 架构要点

- **视觉编码**：ResNet / ViT 提取观测特征
- **条件扩散**：以观测为 condition 生成 action chunk
- **Horizon H**：预测未来 H 步，与 ACT 的 chunk 概念类似

### 部署考量

- 推理步数 vs 质量的 tradeoff，可用 DDIM 等加速采样
- 边缘端是否跑得动：Orin 级算力需实测 latency budget
- 与 whole-body control 的接口：输出末端 pose 还是 joint target

### 何时选 Diffusion Policy

- 任务接触 rich、需要平滑轨迹
- 有足够 GPU 做训练和在线推理
- 对 100ms 级延迟不敏感（或可做 action chunk 缓存）

## 今日推荐资料

- [Diffusion Policy 项目页](https://diffusion-policy.cs.columbia.edu/)
- [Diffusion Policy 论文（RSS 2023）](https://diffusion-policy.cs.columbia.edu/#paper)
- [LeRobot Diffusion Policy 实现](https://github.com/huggingface/lerobot)

## 关联学习天数

Day 25
