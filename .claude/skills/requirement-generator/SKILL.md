---
name: requirement-generator
description: 将用户自然语言需求转化为标准化、可执行的机器需求文档（requirements.json），支持多模态输入，依赖外部项目上下文，v1.2 整合韬理论（τ 控制、任务折叠、技能栈叠、模式复用、协同设计）。
---

# Requirement Generator 主 Skill（v1.2 - 韬理论增强版）

## 概述
本主 skill 将用户自然语言需求（文本、图片、文档）转化为标准化、机器可读的需求规格文档 `requirements.json`，并生成人类可读的详细拆解文档 `requirements.md`。
**v1.2 整合华为韬定律四大核心（K1任务折叠、K2技能栈叠、K3协同设计、K4模式复用），实现 τ 压缩与 Skill 效能最大化。**

## 核心设计理念

### 韬理论四大映射

| 华为韬定律 | AI Agent 映射 | requirement-generator 落地 |
|-----------|--------------|---------------------------|
| **K1 逻辑折叠** | 任务折叠（Task Folding） | 10原子skill压缩为8，合并相似任务链 |
| **K2 三维堆叠** | 技能栈叠（Skill Stacking） | 强制上下文共享，下游skill优先读共享层 |
| **K3 软硬协同** | 模型×规则协同（Co-Design） | 简单input_type分类由规则接管，省τ |
| **K4 成熟制程** | 模式复用（Pattern Mining） | 识别需求模式，τ收益可达70%折扣 |

### τ（时间常数）公式

```
τ_agent = τ_input + τ_analysis + τ_design + τ_api + τ_test + τ_eval + τ_doc

性能 = f(任务质量) / τ_agent
目标：τ 最小化，质量不降
```

## 核心理念
- **零项目扫描**：不读取 package.json、不扫描 src/、不探测技术栈
- **上下文可插拔**：项目上下文由 scan-object-info 或用户手动提供
- **语义驱动**：仅基于需求语义分析，不绑定具体组件库或框架
- **标准输出**：输出符合 code-generator 输入规范的 JSON + Markdown 双文档
- **用户决策优先**：缺失上下文时，由用户决定如何补充
- **τ 优先**：每步执行前评估 τ 预算，超预算触发折叠

## v1.2 改进（基于韬理论）

1. **K1 任务折叠**：10个原子skill → 压缩为8个
   - `requirement-decomposition` + `requirement-analysis` → 合并为 `requirement-analysis`
   - `function-flow-designer` + `ui-component-identifier` → 合并为 `design-designer`
2. **K2 技能栈叠**：所有skill输出强制写入共享上下文 `task_skill.md`，下游skill优先读取
3. **K3 协同设计**：简单input_type（user_text/mixed）由规则直接分类，不消耗模型τ
4. **K4 模式复用**：识别需求模式库，复用成熟模式 τ 折扣70%
5. **τ 预算管理**：分级预算（simple/moderate/complex），超预算触发折叠或降级
6. **质量评估扩展**：新增 feasibility_score（可行性评分）和 urgency_score（紧急度评分）

## 改进点（v1.1 -> v1.2，基于韬理论）

1. **K1 任务折叠**：10个原子skill压缩为8个（τ减少~20%）
2. **K2 技能栈叠**：共享上下文强制写入，下游skill τ 减少~15%
3. **K3 协同设计**：简单input_type规则接管，模型τ节省~10%
4. **K4 模式复用**：成熟模式τ折扣70%，整体τ节省~10%
5. **τ 预算管理**：分级预算（simple/moderate/complex），超预算触发折叠
6. **质量扩展**：新增 feasibility_score 和 urgency_score（v1.2）

## 核心能力
- 多模态需求输入（文本、图片、文档、代码片段、API 文档片段）
- **K1 任务折叠**：8个原子skill协同（原10个，合并2个，τ减少~20%）
- **K2 技能栈叠**：共享上下文直传，下游skill无需重复解析（τ减少~15%）
- **K3 协同设计**：简单input_type规则接管，省模型τ~10%
- **K4 模式复用**：成熟模式τ折扣70%，整体τ节省~10%
- **τ 预算管理**：分级预算（simple/moderate/complex），超预算触发折叠
- 需求模块化分解 + 分析（合并入 analysis）
- 7种通用前端流程识别 + sub-flow detection + UI组件识别（合并入 design-designer）
- REST API规格设计
- 测试用例生成
- 多维度需求质量评估（completeness/consistency/testability/security + feasibility/urgency）
- 项目上下文读取（仅读取，不探测）
- 生成标准化需求文档（含 τ 分解报告 + quality score）

## 执行流程（v1.2 - 8原子skill）

```
requirement-input-processor → requirement-analysis（折叠合并 decomposition） →
design-designer（折叠合并 flow+ui） → api-spec-designer →
test-case-generator → requirement-evaluation →
project-context-reader → requirement-documentation
```

## 原子skill依赖关系（v1.2 - 8个）

| 原子skill | K层级 | τ预算(simple) | τ预算(moderate) | τ预算(complex) | 依赖 |
|-----------|------|--------------|----------------|----------------|------|
| requirement-input-processor | K3规则 | 300 | 500 | 800 | 无 |
| requirement-analysis | K1折叠+分析 | 500 | 1000 | 1500 | input-processor |
| design-designer | K1折叠+设计 | 800 | 1500 | 3000 | analysis |
| api-spec-designer | K3协同 | 500 | 1000 | 2000 | analysis |
| test-case-generator | K4模式 | 400 | 800 | 1500 | design-designer |
| requirement-evaluation | K4评估 | 300 | 600 | 1000 | design + api + test |
| project-context-reader | K2栈叠 | 200 | 400 | 600 | evaluation |
| requirement-documentation | K2栈叠 | 500 | 800 | 1500 | 所有前置 |

**总τ预算**：simple=3500 / moderate=6600 / complex=11000

## 主skill完成标准（v1.2）
1. 原始需求已解析（文本/图片/文档/代码片段，含 input_type 细分）
2. 需求已分解为功能模块（含 τ 预算评估）
3. 需求类型已分析（新建/修改、API需求、权限）
4. 功能流程已识别（CRUD/线性/状态机等，含 sub-flow）
5. UI组件类型已识别（form、button、table等，含 validation 子流程）
6. API接口已设计
7. 测试用例已生成
8. 需求质量已评估（7维度：completeness/consistency/testability/security/feasibility/urgency/overall）
9. 项目上下文已读取（来自 scan-object-info 或用户上传）
10. **τ 消耗报告已生成**（各步骤 τ 分解，与预算对比）
11. **模式匹配结果已记录**（matched_patterns / reuse_rate）
12. 输出 requirements.json 标准文档（含 quality.score 7维度 + τ + pattern）
13. 输出 requirements.md 详细拆解文档（含 quality 可视化 + τ 分解）
14. 所有原子skill日志完整记录（含 τ 消耗）

## 重试规则
- 每个原子skill失败后可重试 **3次**
- requirement-evaluation 发现问题可返回 requirement-analysis 重新分析（最多循环 **2次**）
- project-context-reader 无法获取上下文时，等待用户选择

## 输入形式（扩展版）
| 输入类型 | input_type 值 | 示例 |
|----------|---------------|------|
| 文本需求 | `user_text` | "实现用户登录功能，包含用户名、密码输入，登录按钮" |
| 图片+说明 | `ui_design_image` | [上传UI设计图] + "这是登录页面的设计" |
| 需求文档 | `uploaded_document` | 上传 requirements.docx 内容 |
| 代码片段 | `code_snippet` | [粘贴现有代码片段] + "在现有代码上修改" |
| API 文档 | `api_spec` | [粘贴 API 接口描述] + "新增此 API 调用" |
| 混合输入 | `mixed` | 文本 + 图片 + 代码片段组合 |

## 输出产物
1. **requirements.json**：标准机器可读格式，含多维度 quality.score
2. **requirements.md**：人类可读的详细需求拆解文档（含 quality 可视化）

## requirements.json 格式（v1.2 韬理论增强版）

```json
{
  "version": "1.2",
  "generated_at": "2026-06-03T10:00:00Z",
  "source": "user_text | uploaded_document | ui_design_image | code_snippet | api_spec | mixed",
  "tau": {
    "complexity": "moderate",
    "total_budget": 6600,
    "total_consumed": 5840,
    "remaining": 760,
    "budget_utilization": 0.885,
    "folding_applied": false,
    "breakdown": {
      "input": 480,
      "analysis": 920,
      "design": 1380,
      "api": 890,
      "test": 740,
      "evaluation": 560,
      "context": 380,
      "doc": 490
    },
    "folding_notes": []
  },
  "pattern": {
    "matched_patterns": [
      { "name": "auth-login-standard", "maturity": "mature", "frequency": 12, "tau_discount": 0.7, "similarity": 0.92 }
    ],
    "reuse_rate": 0.75,
    "tau_saved": 1200
  },
  "project_context_used": true,
  "requirement": {
    "raw_text": "用户原始需求",
    "summary": "需求摘要",
    "code_action": "new",
    "requires_new_api": true,
    "has_auth": true
  },
  "project_context": {
    "source": "scan-object-info | manual | default",
    "data": { ... }
  },
  "modules": [ ... ],
  "flow": { ... },
  "ui_components": [ ... ],
  "api_spec": { ... },
  "test_cases": [ ... ],
  "quality": {
    "overall_score": 95,
    "completeness_score": 98,
    "consistency_score": 95,
    "testability_score": 92,
    "security_score": 100,
    "feasibility_score": 88,
    "urgency_score": 72,
    "issues": [],
    "recommendations": ["建议添加'记住我'功能"]
  }
}
```

## quality.score 7维度评估体系（v1.2 新增 feasibility/urgency）
- **overall_score**：综合评分（0-100）
- **completeness_score**：完整性评分（模块覆盖、字段覆盖、异常处理）
- **consistency_score**：一致性评分（命名一致、术语一致、流程一致）
- **testability_score**：可测试性评分（输入可控、输出可观察、状态可检测）
- **security_score**：安全性评分（XSS、CSRF、注入风险）
- **feasibility_score**：可行性评分（技术可行性、依赖可满足性）**[新增 v1.2]**
- **urgency_score**：紧急度评分（业务优先级、截止时间压力）**[新增 v1.2]**

## τ 控制规则（v1.2 新增）

### τ 预算分配

| 复杂度 | 总预算 | input | analysis | design | api | test | eval | context | doc |
|--------|--------|-------|----------|--------|-----|------|------|---------|-----|
| simple | 3500 | 300 | 500 | 800 | 500 | 400 | 300 | 200 | 500 |
| moderate | 6600 | 500 | 1000 | 1500 | 1000 | 800 | 600 | 400 | 800 |
| complex | 11000 | 800 | 1500 | 3000 | 2000 | 1500 | 1000 | 600 | 1500 |

### τ 折叠触发规则
- **fold-001**：连续3个原子skill的τ总和 > 合并后的τ时，触发折叠
- **fold-002**：τ_remaining < 30% 且 深度 > 3 时，强制折叠
- **fold-003**：用户明确要求的skill不可折叠
- **fold-004**：超过3层折叠深度后禁止继续折叠
- **fold-005**：τ超出预算时，优先折叠可选步骤（test-case-generator降级）

### τ 预警规则
- **τ-010**：τ消耗 > 80% 总预算时，触发 warning 预警
- **τ-011**：τ消耗 > 95% 总预算时，触发严重警告，跳过所有可选步骤
- **τ-012**：τ消耗 > 100% 时，强制终止非核心步骤

### K2 技能栈叠规则
- **stack-001**：每个原子skill执行完成后，必须将输出写入共享上下文 `task_skill.md`
- **stack-002**：下游skill必须优先从共享上下文读取，禁止重新解析上游已解析的数据
- **stack-003**：共享上下文命中率 < 50% 时，触发堆叠效率警告
- **stack-004**：层间通信优先级：共享上下文 > 重新解析文件

### K3 协同设计规则
- **codesign-001**：input_type 为 `user_text` 且不含特殊标记时，规则直接分类（省模型τ）
- **codesign-002**：input_type 为 `mixed` 且简单混合（文本+图片）时，规则预分类
- **codesign-003**：input_type 为 `code_snippet` / `api_spec` 时，模型深度分析

### K4 模式复用规则
- **pattern-001**：需求输入时，查询模式库相似度 >= 0.6 时复用已有模式
- **pattern-002**：成熟模式（出现 >= 5次）τ 折扣 70%
- **pattern-003**：成长模式（出现 2-4次）τ 折扣 40%
- **pattern-004**：复用率 = 已匹配模式数 / 总步骤数，< 30% 时触发新模式挖掘

## 项目上下文读取规则
- 读取文件路径：`./.claude/project-context.json`
- **K2栈叠**：从共享上下文 `task_skill.md` 优先读取 scan-object-info 结果
- 如果文件存在：自动读取并使用
- 如果文件不存在：
  - 询问用户：
    1. 执行 scan-object-info skill 扫描项目
    2. 手动上传 project-context.json
    3. 跳过，使用默认配置
- **不自动执行 scan-object-info**，仅提示用户

## 注意事项
- 所有输出**不依赖项目文件**，适用于任何前端项目
- 不预设任何UI组件库，完全由外部上下文提供
- 所有分析基于语义，非路径或代码结构
- 输出的 requirements.json 可直接用于 code-generator
- τ 控制优先：质量可略有牺牲（≥80%），τ 超支不可接受
- **K2 强制**：所有skill输出必须写入共享上下文

## 文件系统位置
- 主skill路径：./.claude/skills/requirement-generator/SKILL.md
- 原子skill路径：./.claude/skills/requirement-generator/atomic-skills/下各子目录
- 共享上下文：./.claude/skills/tasks/current/task_skill.md
- 模式库：./.claude/skills/patterns/requirement-patterns/（v1.2 新增）

## 版本
版本：1.2（韬理论增强版）
主skill名称：requirement-generator
状态：启用
核心改进：K1任务折叠(8原子skill) + K2技能栈叠 + K3协同设计 + K4模式复用 + τ预算管理