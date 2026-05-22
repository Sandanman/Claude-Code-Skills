# Requirement Generator Skill 使用指南（改进版 v1.1）

## 快速开始

当您需要将模糊的自然语言需求转化为标准化的、可执行的机器需求文档时，requirement-generator 会自动分析、拆解、评估需求，并输出 JSON 和 Markdown 双文档。

### 使用方式
```
用户输入需求 → orchestrator识别意图 → requirement-generator接管任务 →
执行分析流程 → 输出 requirements.json + requirements.md
```

## 改进点（v1.0 -> v1.1）

1. **增强输入处理**：支持代码片段、API 文档片段、截图标注等更多输入类型
2. **细化的 input_type**：user_text / uploaded_document / ui_design_image / code_snippet / api_spec / mixed
3. **多维度 quality.score**：新增 completeness_score、consistency_score、testability_score、security_score
4. **改进 requirements.md**：新增 quality score 可视化、输入输出示例
5. **增强 flow type 识别**：新增 sub-flow detection、cross-flow reference
6. **每个原子 skill 新增输入输出示例**

### 示例输入

**示例1：简单功能需求**
```
实现一个日期格式化工具，输入ISO格式的日期字符串，输出 'YYYY-MM-DD HH:mm' 格式
```

**示例2：带代码片段的需求（新增 v1.1）**
```
在以下现有代码基础上添加用户登录功能：
[粘贴现有 API 文件片段]
新增登录页面调用此 API
```

**示例3：带 API 文档的需求（新增 v1.1）**
```
新增以下 API 调用：
POST /api/auth/login
Request: { username, password }
Response: { token, userId }
```

**示例4：中等复杂度需求**
```
实现会议管理系统，包含会议创建、会议列表展示、查看详情、编辑会议、删除会议功能
```

**示例5：复杂系统需求**
```
实现一个用户管理系统，包含：
1. 用户注册（用户名、邮箱、密码）
2. 用户登录（用户名、密码、记住我）
3. 权限管理（管理员、普通用户）
4. 个人中心（修改密码、修改头像）
```

## 执行流程详解

### 1. requirement-input-processor（需求输入处理器）
- 支持多种输入：文本、图片（UI设计图）、文档（Word/PDF）、**代码片段、API 文档片段（新增 v1.1）**
- 提取关键词、功能点、约束条件
- **细化为 6 种 input_type：user_text / uploaded_document / ui_design_image / code_snippet / api_spec / mixed（新增 v1.1）**
- 输出原始需求摘要

### 2. requirement-decomposition（需求分解）
- 将需求分解为独立功能模块
- 识别模块边界
- 标记可忽略模块（用户指定"暂不实现"）
- 输出模块化清单

### 3. requirement-analysis（需求分析）
- 判断代码操作类型：新建 vs 修改
- 判断是否需要新增API
- 判断是否涉及权限控制
- **新增：判断是否为混合输入（代码片段 + 文本）**
- 输出技术分析报告

### 4. function-flow-designer（功能流程设计）
- 自动识别7种通用前端流程：
  - CRUD流程（数据管理）
  - 线性流程（多步操作）
  - 状态机流程（审批/工作流）
  - 向导流程（多步骤注册）
  - 单页工具（转换/计算）
  - 弹窗流程（快速操作）
  - 循环流程（重复操作）
- **新增：sub-flow detection（子流程检测）、cross-flow reference（跨流程引用）**
- 输出流程节点、状态转换、权限控制

### 5. ui-component-identifier（UI组件识别）
- 识别通用UI组件类型（form、button、table等）
- **不绑定具体组件库**，输出语义类型
- 由 project_context 决定具体实现（Antd/Element/自定义）
- 输出组件清单、字段、按钮

### 6. api-spec-designer（API规格设计）
- 设计 REST API 接口
- 定义请求参数、响应格式、状态码
- 识别认证需求
- 输出 API 规格文档

### 7. test-case-generator（测试用例生成）
- 为每个模块生成测试场景
- 覆盖正常路径、异常场景、边界条件
- 输出测试用例清单

### 8. requirement-evaluation（需求评估）
- **多维度评估（新增 v1.1）**：
  - completeness_score：模块覆盖、字段覆盖、异常处理
  - consistency_score：命名一致、术语一致、流程一致
  - testability_score：输入可控、输出可观察
  - security_score：XSS、CSRF、注入风险
  - overall_score：综合评分
- 检测需求缺陷（遗漏、矛盾）
- 提供改进建议
- 输出质量评分报告

### 9. project-context-reader（项目上下文读取）
- 读取 `./.claude/project-context.json`
- 如果文件不存在，询问用户：
  - 选择执行 scan-object-info skill
  - 选择手动上传 project-context.json
  - 选择跳过（使用默认配置）
- **不自动扫描任何项目文件**
- 输出项目上下文数据

### 10. requirement-documentation（需求文档生成）
- 整合所有信息
- 输出 `requirements.json`（机器可读，含多维度 quality.score）
- 输出 `requirements.md`（人类可读，含 quality 可视化）

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

## 多维度 Quality Score（新增 v1.1）

| 评分维度 | 分数范围 | 说明 |
|----------|----------|------|
| overall_score | 0-100 | 综合评分 |
| completeness_score | 0-100 | 需求完整性（模块/字段/异常处理） |
| consistency_score | 0-100 | 命名/术语/流程一致性 |
| testability_score | 0-100 | 输入可控/输出可观察 |
| security_score | 0-100 | XSS/CSRF/注入风险评估 |

### 评分标准

| 综合评分 | 说明 |
|----------|------|
| 90-100 | 需求完整、清晰、无缺陷，可直接开发 |
| 80-89 | 基本完整，有1-2个中等缺陷，建议修复 |
| 70-79 | 需求基本可用，但有多个缺陷，需重点修复 |
| <70 | 需求不完整，无法直接开发 |

## 常见问题

**Q: 如果我没有 project-context.json 怎么办？**
A: requirement-generator 会提示您选择：执行 scan-object-info 或手动上传。

**Q: 是否必须先执行 scan-object-info？**
A: 不是必须，但推荐。如果项目上下文简单，也可以手动提供。

**Q: 输出的 requirements.json 可以修改吗？**
A: 可以，您可以在确认阶段修改任何内容。

**Q: 这个 skill 适用于哪些项目？**
A: 适用于90%以上前端项目（Vue/React/Angular/Svelte + 任意UI库）。

**Q: 如何处理代码片段作为输入？（新增 v1.1）**
A: requirement-input-processor 会分析代码片段结构，提取函数签名、API 调用模式，并将其映射到新功能需求中。

**Q: 什么是 quality.score 多维度评估？（新增 v1.1）**
A: 需求评估从单一评分扩展为 5 个维度（overall / completeness / consistency / testability / security），更全面地反映需求质量。

**Q: 如果需求不完整会怎样？**
A: 会标记问题并建议补充，用户确认后方可继续。

## 技术支持

如有问题或建议，请查看 `.claude/skills/requirement-generator/` 或联系项目维护者。

## 版本
v1.1 - 改进版：增强输入处理、多维度 quality.score、flow type 识别、输入输出示例