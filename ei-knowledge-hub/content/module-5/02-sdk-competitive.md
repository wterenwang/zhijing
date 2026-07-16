# 机器人 SDK 竞品分析

竞品调研帮助你在「开发者工具链」赛道上找到差异化切口。本章节以 Boston Dynamics Spot SDK 和 ROS 2 生态为对标，系统评估文档、API 设计、示例库、仿真支持与商业化模式。

## PM视角要点

- 竞品分析不是抄功能表，而是拆解「开发者旅程」：发现产品 → 注册/获取 SDK → 安装配置 → 跑通 Hello World → 调试部署 → 发布应用。
- Boston Dynamics 代表「闭源硬件 + 高质量商业 SDK」路线；ROS 2 代表「开源中间件 + 碎片化工具链」路线。你的产品可能介于两者之间。
- 记录每个竞品在 Time to First Run 上的实际耗时（建议亲自走一遍接入流程），这是最有说服力的体验数据。
- 差异化机会常出现在：中文文档、仿真一键环境、低代码行为编排、与国内硬件的深度绑定。
- 输出物：竞品对比表 + 体验痛点清单 + 「借鉴 / 避免 / 差异化」三栏决策备忘录。

## 核心概念

| 概念 | 说明 |
|------|------|
| Spot SDK | Boston Dynamics 为 Spot 四足机器人提供的 Python/gRPC API 与 Web 控制台 |
| ROS 2 | Robot Operating System 第二代，提供节点、话题、服务、动作等分布式通信抽象 |
| Developer Journey | 开发者从认知到价值实现的完整路径，竞品分析的拆解单元 |
| API 一致性 | 命名、错误码、鉴权方式在模块间是否统一，直接影响学习成本 |
| 仿真优先（Sim-first） | 无真机条件下通过仿真完成开发与测试，降低准入门槛 |

### 竞品对比维度建议

1. **文档体系**：Quick Start、API Reference、Tutorial、FAQ、版本迁移指南
2. **示例与模板**：官方 Repo 数量、语言覆盖、是否一键运行
3. **调试工具**：日志、远程桌面、轨迹可视化、性能分析
4. **生态扩展**：第三方包、应用商店、认证合作伙伴
5. **许可与定价**：免费层、按 seat/按调用/按设备授权

## 今日推荐资料

- [Boston Dynamics Developer Portal](https://dev.bostondynamics.com/)：Spot SDK 官方入口，重点阅读 Quick Start 与 API 文档结构
- [Spot SDK Python 示例仓库](https://github.com/boston-dynamics/spot-sdk)：官方示例代码与最佳实践
- [ROS 2 Documentation](https://docs.ros.org/)：Humble/Jazzy 等发行版文档，理解开源生态工具链
- [ROS 2 Design](https://design.ros2.org/)：ROS 2 架构设计文档，帮助理解中间件产品哲学
- [NVIDIA Isaac ROS](https://developer.nvidia.com/isaac/ros)：仿真与感知工具链的另一种生态形态

## 关联学习天数

第 34 至 36 天（竞品分析：SDK 调研、体验评估、结论输出）
