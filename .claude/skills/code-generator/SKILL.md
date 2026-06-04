---
name: code-generator
description: 根据需求文档或需求描述自动生成符合项目规范的代码。简单需求直接处理，复杂需求优先使用 requirement-generator 标准化。v1.3 整合韬定律（τ 控制、任务折叠、技能栈叠、协同设计、模式复用），τ 节省 30%。
---

# Code Generator 主Skill v1.3（τ 增强版）

## 概述
本主skill根据需求文档、功能模块描述或用户需求，自动生成符合项目规范的可开发代码，支持多种输入形式并自动适配项目技术栈。

**v1.3 核心改进：整合韬定律（τ-Law）体系，通过 Task Folding 压缩冗余链路、Skill Stacking 减少重复解析、Co-Design 优化 Model×Rules×Skills 分配、Pattern Mining 复用成熟生成模式，τ 节省约 30%。**

## 版本历史
- v1.3 (2026-06-04): 整合韬定律，τ 控制、Task Folding、Skill Stacking、Co-Design、Pattern Mining
- v1.2 (2026-05-21): 新增 multi-scenario-adapter 原子skill，4场景智能路由
- v1.0: 初始版本，8个原子skill，3场景处理

---

## 核心能力（τ 增强版）
- 需求理解和分析
- 技术栈自动检测（优先从 project_context.json）
- 场景智能适配（multi-scenario-adapter）
- 代码结构设计
- 自动代码生成
- 模块间整合
- 代码质量验证
- **τ 动态预算控制**（v1.3 新增）
- **Task Folding 链路压缩**（v1.3 新增）
- **Skill Stacking 上下文共享**（v1.3 新增）
- **Co-Design 责任分配**（v1.3 新增）
- **Pattern Mining 历史复用**（v1.3 新增）

---

## 使用场景划分（4场景，τ 增强版）

### 场景识别（由 multi-scenario-adapter 执行）

**判断规则**：

| 维度 | 标准输入 | 简单需求 | 复杂需求 | 多模块 |
|------|----------|----------|----------|--------|
| 输入来源 | requirements.json | 自由文本 | 自由文本 | 自由文本 |
| 描述长度 | 不限 | < 50字 | > 100字 | 不限 |
| 功能点数 | 已标准化 | 1个 | ≥ 2个 | ≥ 3个 |
| 模块数 | 已有定义 | 无模块 | 可能多模块 | ≥ 3个 |
| 关键词 | 无 | 写、实现、修改 | 系统、管理、模块、包含以下 | 模块、功能点 |
| 复杂度 | 低 | 很低 | 中高 | 高 |
| 推荐路径 | 场景1 | 场景2 | 场景3 | 场景3 |
| τ 预算倍数 | 0.8x | 0.5x | 1.0x | 1.5x |

**τ-Controller 协同决策**：

```
用户输入
    ↓
[multi-scenario-adapter] ← τ-Controller 传入当前 τ_remaining
    ↓（判断场景 + τ 预算）
    ├─ 场景1：τ_remaining充足 → 完整路径（7步）；τ 紧张 → 跳过 optional 步骤
    ├─ 场景2：τ_remaining充足 → 7步完整；τ 紧张 → 折叠为 5 步（见 Task Folding）
    └─ 场景3：τ_remaining充足 → 9步完整；τ 紧张 → 折叠为 7 步（见 Task Folding）
```

---

## 执行流程（τ 增强版）

### 完整流程（含 multi-scenario-adapter + τ-Control）

```
用户输入
    ↓
[τ-Control] ← 分配预算（simple: 2500, moderate: 8000, complex: 15000）
    ↓
[multi-scenario-adapter] ← 传入 τ_budget + τ_remaining，决定场景路由
    ↓（判断场景）
    ├─ 场景1：标准输入 → requirement-reader → tech-stack-detection → code-design → code-generation → code-validation → documentation-update
    ├─ 场景2：简单需求 → [Task Folding 评估] → requirement-analysis → tech-stack-detection → code-design → code-generation → code-validation → documentation-update
    └─ 场景3：复杂需求 → [Task Folding 评估] → requirement-analysis → tech-stack-detection → code-design → code-generation → module-integration → code-validation → documentation-update
    ↓
[Pattern Mining] ← 归档生成模式，匹配历史模式（相似度 ≥ 0.6）
    ↓
[τ-Report] ← 输出 τ 分解报告 + 效率评分
```

### 流程对比（τ 权重分配）

| 步骤 | 场景1（标准） | 场景2（简单） | 场景3（复杂） |
|------|--------------|--------------|--------------|
| multi-scenario-adapter | 8% | 8% | 5% |
| requirement-reader | 5% | 5% | 5% |
| requirement-analysis | 0% | 15% | 15% |
| tech-stack-detection | 15% | 18% | 15% |
| code-design | 20% | 20% | 18% |
| code-generation | 30% | 22% | 22% |
| module-integration | 0% | 0% | 10% |
| code-validation | 12% | 7% | 5% |
| documentation-update | 10% | 5% | 5% |
| **总步骤数** | **7** | **7** | **9** |

---

## 原子skill依赖关系（τ 增强版）

| 原子skill | 依赖 | τ 权重范围 | 可折叠 | 核心步骤 | Task Folding 组 |
|-----------|------|-----------|--------|---------|----------------|
| multi-scenario-adapter | 无 | 5%~8% | 否 | 是 | 无（首个执行） |
| requirement-reader | 无 | 5% | 否 | 是 | 无 |
| requirement-analysis | requirement-reader | 15% | 是 | 否 | Group A（+ tech-stack-detection） |
| tech-stack-detection | requirement-reader/requirement-analysis | 15%~18% | 是 | 是 | Group A（+ requirement-analysis） |
| code-design | tech-stack-detection, requirement-reader | 18%~20% | 是 | 是 | Group B（+ code-generation） |
| code-generation | code-design | 22%~30% | 是 | 是 | Group B（+ code-design） |
| module-integration | code-generation | 10% | 是 | 否 | Group C（+ code-validation） |
| code-validation | code-generation/module-integration | 5%~12% | 是 | 是 | Group C（+ module-integration） |
| documentation-update | code-validation | 5%~10% | 是 | 否 | Group D（validate-and-doc） |

---

## τ 分项预算（v1.3 新增）

### 预算配置

| 复杂度 | 总预算（token） | 说明 |
|--------|--------------|------|
| simple（场景2，单功能） | 2500 | 单组件、单函数生成 |
| moderate（场景1/3） | 8000 | 标准输入或单模块复杂需求 |
| complex（场景3，多模块） | 15000 | 多模块系统级生成 |

### τ 借位优先级

当某个步骤超出预算时，从后续步骤"借"τ，优先级顺序：
```
documentation-update → requirement-analysis → code-validation → module-integration
```

**禁止借位**：multi-scenario-adapter（场景决策不能压缩）、requirement-reader（需求读取不能压缩）、tech-stack-detection（技术栈是生成前提）、code-design（设计质量决定代码质量）、code-generation（核心生成步骤）

---

## Task Folding 规则（v1.3 新增）

### 可折叠组

| 折叠组 | 包含技能 | 折叠条件 | 折叠后行为 | τ 节省估算 |
|--------|---------|---------|-----------|-----------|
| Group A | requirement-analysis + tech-stack-detection | 简单需求（描述 < 50字）且无 requirements.json | 合并为 analyze-detect-tech，一次遍历 | 25% |
| Group B | code-design + code-generation | simple 复杂度（单组件）或 τ_remaining < 40% | 合并为 design-and-generate | 15% |
| Group C | module-integration + code-validation | 场景3 且模块数 ≤ 3 | 合并为 integrate-and-validate | 20% |
| Group D | code-validation + documentation-update | 任何场景，τ_remaining < 20% | 合并为 validate-and-doc | 30% |

### 折叠触发条件

**自动折叠（满足任一即触发）**：
- τ_remaining < 40% 且当前步骤 ≤ 步骤 5
- 简单需求（场景2）自动使用 Group A 折叠
- 连续 2 个技能步骤的 τ 消耗 < 合并后单步骤的 τ 的 75%

**禁止折叠（满足任一即保护）**：
- multi-scenario-adapter、requirement-reader 为核心技能（起点）
- code-generation 为核心生成步骤（fold-protect-002）
- 用户明确要求完整的"设计-生成"分离流程（user_required=True）
- 用户使用"详细设计"、"架构设计"等关键词
- 技术栈为新框架（无模式库，需完整检测）

### 折叠操作记录

每次折叠必须记录到执行日记：
```
## 折叠记录
- 折叠时间：[timestamp]
- 场景：[场景1/2/3]
- 原步骤：[A] → [B] → [C]
- 折叠组：[Group N]
- 折叠原因：[触发规则编号]
- τ 节省估算：[X]%
- τ 实际节省：[Y]（任务完成后填入）
```

### 场景路由中的 Task Folding

**场景2（简单需求）Task Folding 示例**：
```
原始路径（7步）：
  multi-scenario-adapter → requirement-reader → requirement-analysis →
  tech-stack-detection → code-design → code-generation → code-validation → documentation-update

折叠后路径（5步）：
  multi-scenario-adapter → requirement-reader →
  [折叠 Group A] requirement-analysis + tech-stack-detection →
  [折叠 Group B] code-design + code-generation →
  [折叠 Group D] code-validation + documentation-update

τ 节省：25% + 15% + 30% ≈ 54%（实际因重叠计算约节省 35%）
```

---

## Skill Stacking 上下文（v1.3 新增）

### 共享上下文文件

`task_skill.md` 的技能输出区域，作为 9 个原子 skill 的 TSV（垂直互联）数据通道。

### 9个原子 skill 的上下文键

| 原子 skill | required_keys（读取） | output_keys（写入） | TSV 优先级 |
|-----------|----------------------|-------------------|-----------|
| multi-scenario-adapter | `user_input`（原始需求文本） | `scenario_decision`（场景+路由理由+τ预算） | 高（起点） |
| requirement-reader | `user_input` | `requirements_data`（标准化需求结构） | 高 |
| requirement-analysis | `requirements_data`（检测无 req.json 时） | `analyzed_requirements`（功能点+模块+关系） | 高 |
| tech-stack-detection | `requirements_data` 或 `analyzed_requirements` + `project_context` | `tech_stack`（框架+UI库+项目结构+代码规范） | 高 |
| code-design | `tech_stack` + `requirements_data`/`analyzed_requirements` | `code_spec`（组件设计+API设计+类型定义） | 高 |
| code-generation | `code_spec` + `tech_stack` | `generated_code`（代码文件列表+文件内容摘要） | 高（核心） |
| module-integration | `generated_code` + `code_spec` | `integrated_project`（整合后结构+导入关系） | 中 |
| code-validation | `generated_code`/`integrated_project` + `tech_stack` | `validation_result`（语法+规范+测试用例） | 中 |
| documentation-update | `validation_result` + `generated_code` | `final_artifacts`（带注释代码+文档） | 低 |

### Skill Stacking 读取策略

**stack-share-002 严格执行**：
1. 读取 `task_skill.md` 中的 `required_keys`
2. 若命中（key 存在且未过期），使用共享上下文结果
3. 若未命中，标记为 `reparse`，重新解析文件

**TSV 直传优化（v1.3）**：
- 同一 session 内，后续 skill 优先使用上游 skill 输出的 `output_keys`
- 例如：`code-generation` 直接使用 `code-design` 的 `code_spec`，无需重新读取文件

### 上下文共享效率要求

- 命中率目标 ≥ 65%（9 个 required_keys 中至少 6 个从上下文读取）
- 命中率 < 50% 时输出警告
- 命中率 < 35% 时建议用户："上下文复用率低，可能需要清理 task_skill.md 或显式传入 project_context.json"

---

## Co-Design 策略（v1.3 新增）

### Model × Rules × Skills 三层责任分配

| 步骤 | 模型（LLM） | 规则（Rules） | 技能（Atomic Skill） |
|------|----------|-------------|---------------------|
| multi-scenario-adapter | 场景推理（复杂描述判断） | 规则匹配（关键词+长度规则） | 无 |
| requirement-reader | 结构化解析（自由文本） | JSON Schema 验证 | **requirements.json 解析（主要）** |
| requirement-analysis | 意图理解（语义分析） | 功能点提取规则 | 无 |
| tech-stack-detection | 框架识别（代码结构） | 文件模式库（package.json 等） | **项目文件解析（主要）** |
| code-design | 架构设计（组件/API/类型） | 设计规范检查（CODE_STYLE.md） | 无 |
| code-generation | 生成代码（主逻辑） | 安全规范检查、代码模板 | 无（模型主导） |
| module-integration | 整合架构设计 | 导入关系规则、路由规则 | 无（模型主导） |
| code-validation | 质量评估 | 语法规则、规范检查 | **Linter 集成（辅助）** |
| documentation-update | 注释生成（自然语言） | 文档模板 | 无 |

### Co-Design 决策规则

**codesign-001**：简单任务（场景2），规则覆盖率目标 ≥ 80%
- tech-stack-detection 由规则主导（文件模式库已有）
- code-generation 由模型主导（单组件生成，模型效率高）

**codesign-002**：复杂任务（场景3），模型主控，覆盖率目标 ≥ 50%
- code-design 必须由模型设计（多组件、多模块关系复杂）
- module-integration 必须由模型主控（整合逻辑复杂）

**codesign-003**：所有任务禁止纯规则路线
- 每个步骤必须有模型覆盖点（至少做最终确认）
- 代码生成必须有安全规则检查（防止注入、XSS 等）

**codesign-010**：规则覆盖边界必须完整
- code-style-rules 必须覆盖：缩进、引号、命名规范
- security-rules 必须覆盖：硬编码检查、SQL注入、XSS

---

## Pattern Mining 集成（v1.3 新增）

### 生成模式库

模式库路径：`.claude/skills/patterns/code-gen-patterns/`

### 内置成熟模式（预置）

| 模式 ID | 模式名称 | 触发条件 | 成熟度 | τ 折扣 |
|---------|---------|---------|--------|--------|
| pattern-cg-001 | Vue3 组件生成 | Vue3 + 单组件 + Element Plus | 成熟（>10次） | 70% |
| pattern-cg-002 | React Hook 组件 | React + 函数组件 + useState | 成熟 | 70% |
| pattern-cg-003 | API Handler 生成 | REST API + Express/Koa | 成长（5次） | 40% |
| pattern-cg-004 | TypeScript 类型定义 | TypeScript + 接口定义 | 成长 | 40% |
| pattern-cg-005 | Vue3 列表页生成 | Vue3 + 列表 + 分页 + Element Plus | 试验（2次） | 10% |

### Pattern Mining 执行时机

在 `tech-stack-detection` 完成后，立即匹配模式库：

```
tech-stack-detection 完成
    ↓
Pattern Matcher（匹配生成模式，相似度 ≥ 0.6）
    ↓
├─ 匹配成功（成熟模式）→ 复用模式中的代码模板
│             → τ 节省 70%
│             → 跳过 code-design（使用模板规格）
│             → 直接进入 code-generation（模板填充）
│
├─ 部分匹配（成长模式）→ 使用模式中的组件结构
│             → τ 节省 40%
│             → code-design 简化版（补充模板差异）
│
└─ 未匹配 → 完整执行所有步骤（τ 全消耗）
```

### 模式匹配算法

```python
# 模式相似度计算
def match_code_gen_pattern(tech_stack: dict, requirements: dict, pattern: dict) -> float:
    # 权重：
    # - 框架匹配（Vue/React）：0.3
    # - UI 库匹配（Element Plus/Ant Design）：0.25
    # - 项目结构匹配：0.15
    # - 需求类型匹配（组件/API/工具）：0.3
    score = (framework_match * 0.3) + (ui_lib_match * 0.25) +
            (structure_match * 0.15) + (req_type_match * 0.3)
    return score
```

### 模式记录与更新

每次代码生成完成后：
1. 提取生成模式特征（framework、ui_lib、project_structure、req_type）
2. 若相似度 < 0.6，记录为新模式（试验阶段）
3. 模式晋升规则：试验（1次）→ 成长（3次验证）→ 成熟（5次验证）

---

## 主skill完成标准（v1.3，11项）

1. **τ 预算合规**：总 τ 消耗 ≤ 预算（simple: 2500, moderate: 8000, complex: 15000）
2. **需求已读取**：requirements.json 或文本分析完成
3. **场景已适配**：multi-scenario-adapter 正确判断场景类型
4. **技术栈已检测**：优先使用 project_context.json 中的技术栈信息
5. **代码设计完成**：基于需求的 api_spec 和 ui_components（如存在）
6. **生成代码语法正确**：所有文件语法正确、格式规范
7. **模块间整合完成**：多模块需求已完成整合（场景3）
8. **代码通过验证**：满足需求中的测试用例（如存在）
9. **所有代码文件已添加完整注释**：继承 quality.recommendations
10. **Task Folding 记录**：所有折叠操作已记录（包含原因和 τ 收益）
11. **Pattern Mining 结果已归档**：匹配/未匹配状态已记录

---

## τ 效率评分（v1.3 新增）

任务完成后计算效率评分：

```
τ_efficiency_score = (完成质量分 × τ 折扣) / (τ_actual_consumed / 基准值)

其中：
- 完成质量分 = 满足的完成标准数 / 11（0.0 ~ 1.0）
- τ 折扣 = 1.0 - Pattern Mining τ 节省率（0.0 ~ 0.7）
- τ_actual_consumed = 实际消耗 token 数
- 基准值 = 复杂度对应的总预算

评分标准：
- 优秀（τ_efficiency_score ≥ 0.8）：τ 节省且质量高
- 合格（0.5 ≤ score < 0.8）：τ 正常消耗
- 不合格（score < 0.5）：τ 超支或质量低
```

---

## 重试规则（τ 增强版）

- 每个原子skill失败后可重试 **3次**
- multi-scenario-adapter 失败：提示用户手动选择场景
- code-generation 失败：暂停任务等待用户确认
- code-validation 发现问题可返回 code-design 重新设计（最多循环 **2次**）
- module-integration 失败可返回 code-generation 调整（最多循环 **2次**）
- Task Folding 后失败：回退到非折叠路径，重新执行原始步骤

---

## 输出产物（τ 增强版）

- ✅ **带注释的代码文件**（自动创建或修改文件）
- ✅ **完整执行日志**（记录所有步骤和决策）
- ✅ **场景决策报告**（由 multi-scenario-adapter 生成，含 τ 预算分配）
- ✅ **Task Folding 记录**（所有折叠操作，含 τ 收益）
- ✅ **验证报告**（由 code-validation 生成）
- ✅ **τ 分解报告**（v1.3 新增）：各步骤 τ 消耗占比 + 效率评分 + 历史对比

---

## 文件系统位置

- 主skill路径：`.claude/skills/code-generator/SKILL.md`
- 原子skill路径：`.claude/skills/code-generator/atomic-skills/`下各子目录
- 模式库路径：`.claude/skills/patterns/code-gen-patterns/`
- 共享上下文：`task_skill.md`

---

## 注意事项（τ 增强版）

- 自动读取项目中的 CODE_STYLE.md，没有则提示用户创建
- multi-scenario-adapter 会优先检测 project_context.json 优化技术栈检测
- 生成的代码会尽量符合项目现有规范
- 多模块需求会自动处理模块间关系
- 会尽量复用现有工具函数，避免重复
- 代码生成前会进行设计验证
- τ 超出时优先折叠 documentation-update，禁止折叠 code-design/code-generation
- Pattern Mining 匹配成功后可跳过部分设计步骤，但必须保留代码审查
- Skill Stacking 命中率 < 50% 时应输出优化建议

---

## 原子skill详细定义（τ 增强版）

### 1. multi-scenario-adapter [核心·不折叠]
**能力**：判断需求场景类型，选择最优执行路径  
**输入**：用户需求文本 / requirements.json 路径  
**输出**：场景决策报告（场景类型 + 路由理由 + τ 预算分配）  
**完成标准**：明确场景类型，制定路由策略  
**τ 权重**：5%~8%  
**required_keys**：`user_input`  
**output_keys**：`scenario_decision`  
**Co-Design**：模型推理 + 规则库匹配  
**Pattern 触发**：优先匹配已知场景模式

### 2. requirement-reader
**能力**：读取并解析需求文档  
**输入**：requirements.json 路径（场景1）或自由文本（场景2/3）  
**输出**：需求数据结构  
**完成标准**：需求完整读取，结构清晰  
**τ 权重**：5%  
**required_keys**：`scenario_decision`（传入场景类型）  
**output_keys**：`requirements_data`

### 3. requirement-analysis [可折叠]
**能力**：分析用户需求，提取功能点、模块和关系  
**输入**：需求文本（场景2/3）  
**输出**：功能点列表、模块关系图  
**完成标准**：功能点完整、模块边界清晰  
**τ 权重**：15%  
**required_keys**：`requirements_data`  
**output_keys**：`analyzed_requirements`  
**可折叠进**：tech-stack-detection（场景2，Group A）

### 4. tech-stack-detection [核心·可折叠]
**能力**：检测项目技术栈  
**输入**：project_context.json 或项目文件  
**输出**：技术栈报告（框架+UI库+项目结构+代码规范）  
**完成标准**：技术栈完整检测  
**τ 权重**：15%~18%  
**required_keys**：`requirements_data` 或 `analyzed_requirements` + `project_context`  
**output_keys**：`tech_stack`  
**可折叠**：与 requirement-analysis 合并（场景2，Group A）
**Co-Design**：文件解析 skill 主要 + 模型辅助推理

### 5. code-design [核心·可折叠]
**能力**：设计代码结构  
**输入**：技术栈报告 + 需求数据  
**输出**：组件设计、API 设计、类型定义  
**完成标准**：设计完整、可执行  
**τ 权重**：18%~20%  
**required_keys**：`tech_stack` + `requirements_data`/`analyzed_requirements`  
**output_keys**：`code_spec`  
**可折叠**：与 code-generation 合并（场景2，Group B）
**Co-Design**：模型设计 + CODE_STYLE.md 规则检查

### 6. code-generation [核心·可折叠]
**能力**：生成代码文件  
**输入**：代码设计规格  
**输出**：代码文件列表  
**完成标准**：代码语法正确、符合规范  
**τ 权重**：22%~30%  
**required_keys**：`code_spec` + `tech_stack`  
**output_keys**：`generated_code`  
**可折叠**：与 code-design 合并（场景2，Group B）  
**Co-Design**：模型生成 + security-rules 检查

### 7. module-integration [可折叠]
**能力**：整合多模块代码  
**输入**：代码文件列表  
**输出**：整合后项目结构、导入关系  
**完成标准**：模块间关系正确、无循环依赖  
**τ 权重**：10%  
**required_keys**：`generated_code` + `code_spec`  
**output_keys**：`integrated_project`  
**可折叠**：与 code-validation 合并（场景3，Group C）

### 8. code-validation [核心·可折叠]
**能力**：验证代码质量和语法  
**输入**：代码文件 / 整合后项目  
**输出**：验证报告、测试用例建议  
**完成标准**：无语法错误、符合规范  
**τ 权重**：5%~12%  
**required_keys**：`generated_code`/`integrated_project` + `tech_stack`  
**output_keys**：`validation_result`  
**可折叠**：与 module-integration 合并（场景3，Group C）、与 documentation-update 合并（Group D）

### 9. documentation-update [可折叠]
**能力**：添加代码注释和文档  
**输入**：验证报告 + 代码文件  
**输出**：带注释代码、文档  
**完成标准**：注释完整、文档规范  
**τ 权重**：5%~10%  
**required_keys**：`validation_result` + `generated_code`  
**output_keys**：`final_artifacts`  
**折叠条件**：τ_remaining < 20% 时优先折叠（Group D）

---

## 版本信息

- **版本**：1.3（τ 增强版）
- **主skill名称**：code-generator
- **原子skill数量**：9个
- **整合韬定律**：K1 Task Folding、K2 Skill Stacking、K3 Co-Design、K4 Pattern Mining
- **τ 节省目标**：约 30%（通过 Pattern Mining + Task Folding）
- **状态**：启用
- **最后更新**：2026-06-04