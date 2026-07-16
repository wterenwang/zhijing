# 宇树 RL 算法

## PM视角要点

- 宇树开源了完整的 RL 训练到部署 toolchain，是理解「四足/人形 locomotion 如何产品化」的最佳实践样本。
- 标准工程路径：**Train → Play → Sim2Sim → Sim2Real**，每个阶段都有明确的 go/no-go 标准。
- PM 关注 sim2real 周期：从仿真能走到真机稳定走，通常需要数周到数月，影响上市 timeline。
- 不同仿真后端（Isaac Lab、Isaac Gym、MuJoCo）对应不同团队能力栈，选型影响招聘与外包策略。

## 核心概念

### 宇树 RL 开源生态

| 仓库 | 仿真后端 | 支持机型 |
|------|----------|----------|
| unitree_rl_lab | Isaac Lab | Go2, H1, G1-29dof |
| unitree_rl_gym | Isaac Gym (legged_gym) | Go2, H1, H1_2, G1 |
| unitree_rl_mjlab | MuJoCo (mjlab) | Go2, G1, H1_2, H2 等 |

### Train → Play → Sim2Sim → Sim2Real

1. **Train**：仿真中采样数百万步，优化 PPO 等策略
2. **Play**：可视化验证策略是否满足步态、速度、抗扰动要求
3. **Sim2Sim**：迁移到 MuJoCo 等其他仿真器，检测过拟合
4. **Sim2Real**：通过 SDK 部署到真机，域随机化 + 实机微调

### 奖励函数的产品含义

- 「走得快」vs「走得稳」vs「省电」是不同 reward 权重
- PM 与算法对齐：用户可见的行为优先级（如上下楼梯稳定性 > 平地速度）

### 部署依赖

- **unitree_sdk2_python**：真机通信接口
- **rsl_rl**：PPO 等算法实现
- 算力：训练通常需 NVIDIA GPU 工作站或云端

## 今日推荐资料

- [Unitree RL Lab（GitHub）](https://github.com/unitreerobotics/unitree_rl_lab)
- [Unitree RL Gym（GitHub）](https://github.com/unitreerobotics/unitree_rl_gym)
- [Unitree RL Mjlab（GitHub）](https://github.com/unitreerobotics/unitree_rl_mjlab)

## 关联学习天数

Day 21
