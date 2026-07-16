# PRD 撰写要点：SDK 平台产品

当用户调研、功能定义与原型就绪后，PRD 是把 scattered 决策固化为可评审、可开发、可验收的单一真相来源。SDK 类 PRD 与普通 App PRD 的差异在于：必须写清 API 契约、版本策略、兼容性与开发者迁移成本。

## PM视角要点

- SDK PRD 的读者包括：后端/嵌入式工程师、技术文档工程师、开发者关系（DevRel）、以及未来的你自己（面试讲述素材）。
- 每个 P0 功能需包含：用户故事、前置条件、主流程、异常流程、验收标准（含可量化指标，如「10 分钟内完成首次连接」）。
- 明确「不在范围内」（Out of Scope），防止范围蔓延。例如 v1 不做可视化行为编辑器，只做 CLI + Python API。
- 版本与兼容性章节不可省略：semver 规则、废弃（deprecation）周期、Breaking Change 公告渠道。
- PRD 不是写完就锁死。标注假设与待验证项（Open Questions），方便评审时聚焦风险。

## 核心概念

| 概念 | 说明 |
|------|------|
| SDK PRD 结构 | 背景、目标用户、问题陈述、方案概述、功能需求、非功能需求、里程碑、风险与依赖 |
| 用户故事（User Story） | As a [角色], I want [能力], so that [价值] |
| 验收标准（AC） | 可测试的完成定义，如「给定有效 API Key，开发者可在 3 步内启动仿真示例」 |
| 非功能需求（NFR） | 性能、安全、可用性、国际化、可观测性等对 SDK 同样关键 |
| API 契约 | 端点、参数、错误码、限流策略的正式约定，通常与 OpenAPI/gRPC proto 对齐 |

### 推荐 PRD 章节大纲（SDK 产品）

1. **项目背景与市场机会**：为何现在做、竞品缺口
2. **目标与成功指标**：North Star、OKR、首期 MVP 边界
3. **用户与场景**：引用用户画像与核心 Use Case
4. **功能需求详述**：按模块拆分（鉴权、设备管理、运动控制、感知数据流等）
5. **开发者体验需求**：文档、CLI、示例、错误信息友好度
6. **技术约束与依赖**：硬件型号、OS、ROS 2 版本、网络要求
7. **发布计划与里程碑**：Alpha / Beta / GA 标准
8. **风险登记册**：技术债、合规、第三方依赖

## 今日推荐资料

- [Google PRD 模板与指南](https://www.atlassian.com/agile/product-management/requirements)：敏捷需求文档通用结构参考
- [OpenAPI Specification](https://swagger.io/specification/)：REST API 契约的标准描述格式
- [Semantic Versioning](https://semver.org/)：SDK 版本号规范
- [Write the Docs](https://www.writethedocs.org/)：技术文档写作社区，与 SDK PRD 中的文档需求强相关
- [Amazon API Gateway 开发者体验实践](https://docs.aws.amazon.com/apigateway/)：大型平台 API 产品化案例

## 关联学习天数

第 46 至 48 天（PRD 撰写：项目背景、用户需求、功能需求）
