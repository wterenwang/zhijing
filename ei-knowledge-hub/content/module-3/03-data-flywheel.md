# 数据飞轮设计

## PM视角要点

- 数据飞轮是具身智能产品的长期护城河：更多用户 → 更多场景数据 → 更好模型 → 更好体验 → 更多用户。
- PM 要设计「主动采集」而非「被动蹭数据」：用户为何愿意贡献示教、反馈、环境扫描？
- 飞轮每个环节需 KPI：采集量、标注质量、模型 uplift、用户感知改进、留存变化。
- 隐私与合规是飞轮前提：家庭场景数据敏感，需本地处理、匿名化、可删除机制。

## 核心概念

### 飞轮结构

```
用户任务 → 行为/失败日志 → 数据清洗 → 模型迭代 → 新能力发布 → 用户价值提升 → 更多使用
```

### 三类数据资产

| 类型 | 内容 | 产品用途 |
|------|------|----------|
| 示教数据 | 遥操作轨迹 | 提升 manipulation 成功率 |
| 交互数据 | 语音指令、澄清对话 | 优化 NLU 与任务规划 |
| 环境数据 | 地图、物体布局（脱敏） | 提升导航与场景理解 |

### 激励与贡献机制

- **显性激励**：技能市场积分、功能 early access
- **隐性激励**：机器人「越用越懂我家」
- **众包标注**：用户确认「这是杯子吗？」式轻量标注

### 冷启动策略

1. 仿真合成 + 公开数据集预训练
2. 种子用户深度共建（design partner）
3. 限定场景 MVP，先打穿一个 room 再扩展

### PM 交付物

- 数据飞轮 diagram（Mermaid 或 FigJam）
- 各环节 owner 与 SLA
- 隐私影响评估摘要

## 今日推荐资料

- [Andrew Chen: The Cold Start Problem](https://www.coldstart.com/)
- [OpenAI 数据策略讨论（行业分析）](https://openai.com/index/)
- [GDPR 与 AI 数据处理指南（ICO）](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/)

## 关联学习天数

Day 17
