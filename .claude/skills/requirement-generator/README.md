# Requirement Generator Skill 使用指南（v1.2）

## 快速开始

当您需要将模糊的自然语言需求转化为标准化的、可执行的机器需求文档时，requirement-generator 会自动分析、拆解、评估需求，并输出 JSON 和 Markdown 双文档。

### 使用方式
```
用户输入需求 → orchestrator识别意图 → requirement-generator接管任务 →
执行分析流程 → 输出 requirements.json + requirements.md
```

### 1. requirement-input-processor（需求输入处理器）
- 支持多种输入：文本、图片（UI设计图）、文档（Word/PDF）、**代码片段、API 文档片段**
- 提取关键词、功能点、约束条件
- **6 种 input_type：user_text / uploaded_document / ui_design_image / code_snippet / api_spec / mixed**
- 输出原始需求摘要

- **整合原 requirement-decomposition**：模块分解 + 需求分析一体化
- 语义聚类分解功能模块
- 判断代码操作类型：新建 vs 修改
- 判断是否需要新增API、是否涉及权限控制
- 识别约束条件和状态管理需求
- 输出模块化清单 + 技术分析报告

- **整合原 function-flow-designer + ui-component-identifier**
- 识别7种通用前端流程 + sub-flow detection + cross-flow reference
- 识别通用UI组件类型（form、button、table等）
- **不绑定具体组件库**，输出语义类型
- 输出流程节点、状态转换、权限控制 + 组件清单

### 4. api-spec-designer（API规格设计）
- 设计 REST API 接口
- 定义请求参数、响应格式、状态码
- 识别认证需求
- 输出 API 规格文档

### 5. test-case-generator（测试用例生成）
- 为每个模块生成测试场景
- 覆盖正常路径、异常场景、边界条件
- 输出测试用例清单

### 6. requirement-evaluation（需求评估，**7维度 v1.2**）
- **多维度评估（7维度 v1.2）**：
  - completeness_score：模块覆盖、字段覆盖、异常处理
  - consistency_score：命名一致、术语一致、流程一致
  - testability_score：输入可控、输出可观察
  - security_score：XSS、CSRF、注入风险
  - **feasibility_score：技术可行性、依赖可满足性（新增 v1.2）**
  - **urgency_score：业务优先级、截止时间压力（新增 v1.2）**
  - overall_score：综合评分（7维度加权平均）
- 输出质量评分报告

### 7. project-context-reader（项目上下文读取）
- 读取 `./.claude/project-context.json`
- 如果文件不存在，询问用户：
  - 选择执行 scan-object-info skill
  - 选择手动上传 project-context.json
  - 选择跳过（使用默认配置）
- **不自动扫描任何项目文件**
- 输出项目上下文数据

### 8. requirement-documentation（需求文档生成，**v1.2**）
- 整合所有信息

## 7种通用流程识别示例

| 流程类型 | 关键词 | 示例需求 |
|----------|--------|----------|
| CRUD流程 | 新建、创建、列表、详情、编辑、删除 | "实现会议管理系统，可创建、查看、编辑、删除会议" |
| 线性流程 | 第一步、然后、接着、最后 | "支付流程：选择商品 → 填写信息 → 确认订单 → 支付" |
| 状态机流程 | 状态、审批、通过、拒绝、待处理 | "请假审批：提交 → 待审批 → 审批中 → 通过/拒绝" |
| 向导流程 | 向导、步骤、引导、分步 | "注册向导：基本信息 → 完善资料 → 验证邮箱 → 完成" |
| 单页工具 | 工具、转换、计算 | "日期格式化工具：输入ISO日期 → 转换 → 输出格式化结果" |
| 弹窗流程 | 弹窗、弹出、对话框 | "快速编辑弹窗：点击编辑按钮 → 弹出对话框 → 保存" |
| 循环流程 | 重新、再次、多次操作 | "投票系统：选择候选人 → 确认投票 → 可重新投票" |

## 多维度 Quality Score（v1.2 - 支持多模态需求输入、需求分析、质量评估和标准化文档输出

| 评分维度 | 分数范围 | 说明 |
|----------|----------|------|
| overall_score | 0-100 | 综合评分（7维度加权平均） |
| completeness_score | 0-100 | 需求完整性（模块/字段/异常处理） |
| consistency_score | 0-100 | 命名/术语/流程一致性 |
| testability_score | 0-100 | 输入可控/输出可观察 |
| security_score | 0-100 | XSS/CSRF/注入风险评估 |
| feasibility_score | 0-100 | 技术可行性、依赖可满足性 **（新增 v1.2）** |
| urgency_score | 0-100 | 业务优先级、截止时间压力 **（新增 v1.2）** |

### 评分标准

| 综合评分 | 说明 |
|----------|------|
| 90-100 | 需求完整、清晰、无缺陷，可直接开发 |
| 80-89 | 基本完整，有1-2个中等缺陷，建议修复 |
| 70-79 | 需求基本可用，但有多个缺陷，需重点修复 |
| <70 | 需求不完整，无法直接开发 |

## 常见问题

**Q: 如果我没有 project-context.json 怎么办？**

**Q: 是否必须先执行 scan-object-info？**
A: 不是必须，但推荐。如果项目上下文简单，也可以手动提供。

**Q: 输出的 requirements.json 可以修改吗？**
A: 可以，您可以在确认阶段修改任何内容。

**Q: 这个 skill 适用于哪些项目？**
A: 适用于90%以上前端项目（Vue/React/Angular/Svelte + 任意UI库）。

**Q: 什么是 7维度 Quality Score？（v1.2）**
A: 需求评估从 5 维度扩展为 7 维度，新增 feasibility_score（技术可行性）和 urgency_score（业务紧急度），更全面反映需求质量和优先级。

**Q: 如果需求不完整会怎样？**
A: 会标记问题并建议补充，用户确认后方可继续。

## 技术支持

如有问题或建议，请查看 `.claude/skills/requirement-generator/` 或联系项目维护者。

## 版本
