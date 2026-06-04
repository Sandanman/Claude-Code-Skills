# Requirement Generator Skill 使用指南（v1.2 韬理论增强版）

## 快速开始

当您需要将模糊的自然语言需求转化为标准化的、可执行的机器需求文档时，requirement-generator 会自动分析、拆解、评估需求，并输出 JSON 和 Markdown 双文档。

### 使用方式
```
用户输入需求 → orchestrator识别意图 → requirement-generator接管任务 →
执行分析流程 → 输出 requirements.json + requirements.md
```

## 改进点（v1.1 -> v1.2，基于华为韬定律）

1. **K1 任务折叠**：10个原子skill压缩为8个（τ减少~20%）
   - `requirement-decomposition` + `requirement-analysis` → 合并为 `requirement-analysis`
   - `function-flow-designer` + `ui-component-identifier` → 合并为 `design-designer`
2. **K2 技能栈叠**：所有skill输出强制写入共享上下文，下游skill τ 减少~15%
3. **K3 协同设计**：简单input_type（user_text/mixed）由规则直接分类，省模型τ~10%
4. **K4 模式复用**：成熟模式τ折扣70%，整体τ节省~10%
5. **τ 预算管理**：分级预算（simple/moderate/complex），超预算触发折叠或降级
6. **质量扩展**：新增 feasibility_score（可行性）和 urgency_score（紧急度），7维度评估

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

## 执行流程详解（v1.2 - 8个原子skill，K1任务折叠）

### 1. requirement-input-processor（需求输入处理器）
- 支持多种输入：文本、图片（UI设计图）、文档（Word/PDF）、**代码片段、API 文档片段**
- 提取关键词、功能点、约束条件
- **6 种 input_type：user_text / uploaded_document / ui_design_image / code_snippet / api_spec / mixed**
- **K3协同**：简单 input_type（user_text/mixed）由规则直接分类
- **K2栈叠**：输出写入共享上下文 `task_skill.md`
- 输出原始需求摘要

### 2. requirement-analysis（需求分析 + 分解，**K1折叠合并**）
- **整合原 requirement-decomposition**：模块分解 + 需求分析一体化
- 语义聚类分解功能模块
- 判断代码操作类型：新建 vs 修改
- 判断是否需要新增API、是否涉及权限控制
- 识别约束条件和状态管理需求
- **K2栈叠**：优先从共享上下文读取 requirement-input-processor 输出
- 输出模块化清单 + 技术分析报告

### 3. design-designer（流程设计 + UI识别，**K1折叠合并**）
- **整合原 function-flow-designer + ui-component-identifier**
- 识别7种通用前端流程 + sub-flow detection + cross-flow reference
- 识别通用UI组件类型（form、button、table等）
- **不绑定具体组件库**，输出语义类型
- **K2栈叠**：从共享上下文读取 analysis 输出
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
- **K2栈叠**：优先从共享上下文读取上游skill输出
- 输出质量评分报告

### 7. project-context-reader（项目上下文读取）
- **K2栈叠**：优先从共享上下文 `task_skill.md` 读取 scan-object-info 结果
- 读取 `./.claude/project-context.json`
- 如果文件不存在，询问用户：
  - 选择执行 scan-object-info skill
  - 选择手动上传 project-context.json
  - 选择跳过（使用默认配置）
- **不自动扫描任何项目文件**
- 输出项目上下文数据

### 8. requirement-documentation（需求文档生成，**v1.2**）
- **K2栈叠**：优先从共享上下文读取所有上游skill输出
- 整合所有信息
- 输出 `requirements.json`（机器可读，含 7维度 quality.score + τ 分解 + pattern 匹配）
- 输出 `requirements.md`（人类可读，含 τ 分解可视化 + 7维度 quality score 可视化）

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

## τ 预算分级（v1.2 新增）

| 复杂度 | 总预算 | input | analysis | design | api | test | eval | context | doc |
|--------|--------|-------|----------|--------|-----|------|------|---------|-----|
| simple | 3500 | 300 | 500 | 800 | 500 | 400 | 300 | 200 | 500 |
| moderate | 6600 | 500 | 1000 | 1500 | 1000 | 800 | 600 | 400 | 800 |
| complex | 11000 | 800 | 1500 | 3000 | 2000 | 1500 | 1000 | 600 | 1500 |

**τ 折叠触发**：连续3个skill的τ总和 > 合并后单skill的τ时触发折叠

## 多维度 Quality Score（v1.2 - 7维度）

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
A: requirement-generator 会提示您选择：执行 scan-object-info 或手动上传。**K2栈叠**：优先从共享上下文读取 scan-object-info 结果。

**Q: 是否必须先执行 scan-object-info？**
A: 不是必须，但推荐。如果项目上下文简单，也可以手动提供。

**Q: 输出的 requirements.json 可以修改吗？**
A: 可以，您可以在确认阶段修改任何内容。

**Q: 这个 skill 适用于哪些项目？**
A: 适用于90%以上前端项目（Vue/React/Angular/Svelte + 任意UI库）。

**Q: 什么是 τ 预算管理？（v1.2 新增）**
A: τ 是时间常数，代表任务执行的认知成本。v1.2 为每个复杂度级别（simple/moderate/complex）分配固定 τ 预算，超出时触发折叠或降级，保证执行效率。

**Q: 什么是 Task Folding（任务折叠）？（v1.2）**
A: K1任务折叠：将多个相似的原子skill合并执行，减少 τ 消耗。v1.2 将10个原子skill压缩为8个：`requirement-analysis` 合并了 decomposition + analysis，`design-designer` 合并了 flow + UI。

**Q: 什么是 Skill Stacking（技能栈叠）？（v1.2）**
A: K2技能栈叠：强制所有skill输出写入共享上下文 `task_skill.md`，下游skill优先从共享上下文读取，避免重复解析，τ 减少~15%。

**Q: 什么是模式复用（Pattern Mining）？（v1.2）**
A: K4模式复用：识别需求模式库，相似度 >= 0.6 时复用成熟模式。成熟模式（出现 >= 5次）τ 折扣70%，整体τ节省~10%。

**Q: 什么是 7维度 Quality Score？（v1.2）**
A: 需求评估从 5 维度扩展为 7 维度，新增 feasibility_score（技术可行性）和 urgency_score（业务紧急度），更全面反映需求质量和优先级。

**Q: 如果需求不完整会怎样？**
A: 会标记问题并建议补充，用户确认后方可继续。

## 技术支持

如有问题或建议，请查看 `.claude/skills/requirement-generator/` 或联系项目维护者。

## 版本
v1.2 - 韬理论增强版：K1任务折叠(8原子skill) + K2技能栈叠 + K3协同设计 + K4模式复用 + τ预算管理 + 7维度quality.score