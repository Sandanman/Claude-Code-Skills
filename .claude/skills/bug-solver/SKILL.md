---
name: bug-solver
description: 系统化地解决应用程序中的bug，通过7个原子skill协同工作，从bug分类到修复验证，完整记录和追溯整个debug过程。当用户报告错误、异常行为或提供bug信息时自动触发。v1.3 整合韬定律（τ 控制、任务折叠、技能栈叠、协同设计、模式复用），τ 节省 30%。
---

# Bug Solver 主Skill v1.3（τ 增强版）

## 概述
本主skill用于系统化地解决应用程序中的bug，通过7个原子skill协同工作，从bug分类到修复验证，完整记录和追溯整个debug过程。

**v1.3 核心改进：整合韬定律（τ-Law）体系，通过 Task Folding 压缩冗余链路、Skill Stacking 减少重复解析、Co-Design 优化 Model×Rules×Skills 分配、Pattern Mining 复用成熟修复模式，τ 节省约 30%。**

## 版本历史
- v1.3 (2026-06-04): 整合韬定律，τ 控制、Task Folding、Skill Stacking、Co-Design、Pattern Mining
- v1.2 (2026-05-21): 改进版，7步管道，bug-triage 升级
- v1.0: 初始版本

---

## 核心能力（τ 增强版）
- 系统化的bug分类和优先级判定
- 问题诊断流程
- 代码级的根因定位
- 安全的修复方案生成
- 修复效果的验证
- 测试用例建议
- **τ 动态预算控制**（v1.3 新增）
- **Task Folding 链路压缩**（v1.3 新增）
- **Skill Stacking 上下文共享**（v1.3 新增）
- **Co-Design 责任分配**（v1.3 新增）
- **Pattern Mining 历史复用**（v1.3 新增）

---

## 执行流程（7步管道 + τ 控制）

```
┌─────────────────────────────────────────────────────────────────┐
│  τ-Control（预算分配 + 实时监控）                                  │
│  ├─ 步骤预算：7步各设上限，总预算按复杂度分配                       │
│  ├─ 折叠触发：τ_remaining < 30% 时触发 Task Folding               │
│  └─ 借位策略：低优先级步骤让出预算给高优先级步骤                     │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────┐
│  1. bug-triage      │ ← 无依赖 [核心步骤，不折叠]
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  2. bug-            │ ← 依赖 bug-triage [可折叠，见 Task Folding]
│      identification │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  3. code-analysis   │ ← 依赖 bug-identification [可折叠]
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  4. root-cause-    │ ← 依赖 code-analysis
│      analysis      │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  5. fix-generation │ ← 依赖 root-cause-analysis [核心步骤，不折叠]
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  6. fix-verification│ ← 依赖 fix-generation [核心步骤]
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  7. test-suggestion │ ← 依赖 fix-verification [可跳过，借 τ]
└─────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Pattern Mining（归档 + 成熟度评估）                               │
│  ├─ 当前修复模式 → 匹配模式库（相似度 ≥ 0.6 时复用）                │
│  └─ 成熟模式（≥ 5 次）τ 折扣 70%，成长模式（2-4 次）τ 折扣 40%     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 原子skill依赖关系

| 原子skill | 依赖 | τ 权重 | 可折叠 | 核心步骤 | 备注 |
|-----------|------|--------|--------|---------|------|
| bug-triage | 无 | 10% | 否 | 是 | 必须执行，决定后续策略 |
| bug-identification | bug-triage | 15% | 是 | 否 | 可折叠进 code-analysis（低复杂度时） |
| code-analysis | bug-identification | 20% | 是 | 否 | 可与 root-cause-analysis 合并 |
| root-cause-analysis | code-analysis | 20% | 是 | 否 | 关键步骤，不折叠质量 |
| fix-generation | root-cause-analysis | 20% | 否 | 是 | 核心步骤，必须完整执行 |
| fix-verification | fix-generation | 10% | 否 | 是 | 核心步骤，验证必须执行 |
| test-suggestion | fix-verification | 5% | 是（可跳过） | 否 | τ 不足时可跳过 |

---

## τ 分项预算（v1.3 新增）

### 预算配置

| 复杂度 | 总预算（token） | 说明 |
|--------|--------------|------|
| simple（low） | 3000 | 单文件错误，错误信息完整 |
| moderate（medium） | 8000 | 多文件问题，需分析依赖 |
| complex（high） | 15000 | 系统级问题，需多轮分析 |

### 7步 τ 分配（相对总预算百分比）

| 步骤 | 简单 | 中等 | 复杂 | 说明 |
|------|------|------|------|------|
| bug-triage | 15% | 12% | 10% | 必须保留 |
| bug-identification | 15% | 15% | 15% | 快速收集 |
| code-analysis | 20% | 18% | 20% | 核心分析 |
| root-cause-analysis | 20% | 20% | 20% | 关键步骤 |
| fix-generation | 20% | 18% | 20% | 核心修复 |
| fix-verification | 10% | 12% | 10% | 验证通过 |
| test-suggestion | 0% | 5% | 5% | τ 不足时跳过 |

### τ 借位优先级

当某个步骤超出预算时，从后续步骤"借"τ，优先级顺序：
```
test-suggestion → bug-identification → bug-triage → fix-verification
```

**禁止借位**：bug-triage（优先级分类不能压缩）、fix-generation（核心修复不能压缩）、fix-verification（验证不能跳过）

---

## Task Folding 规则（v1.3 新增）

### 可折叠组

| 折叠组 | 包含技能 | 折叠条件 | 折叠后行为 |
|--------|---------|---------|-----------|
| Group A | bug-triage + bug-identification | simple 复杂度且错误信息完整 | 合并为 triage-and-identify，τ 节省 20% |
| Group B | code-analysis + root-cause-analysis | moderate 复杂度且代码文件 < 3 | 合并为 analyze-and-locate，τ 节省 15% |
| Group C | bug-identification + code-analysis | moderate 复杂度，错误信息包含文件路径 | 合并为 identify-and-analyze，τ 节省 25% |

### 折叠触发条件

**自动折叠（满足任一即触发）**：
- τ_remaining < 30% 且当前步骤 ≤ 步骤 4
- 连续 2 个步骤的 τ 消耗 < 合并后单步骤的 τ 的 70%

**禁止折叠（满足任一即保护）**：
- bug-triage、fix-generation、fix-verification 为核心步骤（fold-protect-002）
- 用户明确要求每步独立执行（user_required=True）
- 用户使用"详细分析"、"深入排查"等关键词（fold-protect-004）
- 当前为 critical/high 优先级 bug（质量优先，不压缩）

### 折叠操作记录

每次折叠必须记录到执行日记：
```
## 折叠记录
- 折叠时间：[timestamp]
- 原步骤：[A] → [B] → [C]
- 折叠组：[Group N]
- 折叠原因：[触发规则编号]
- τ 节省估算：[X]%
- τ 实际节省：[Y]（任务完成后填入）
```

---

## Skill Stacking 上下文（v1.3 新增）

### 共享上下文文件

`task_skill.md` 的技能输出区域，作为 7 个原子 skill 的 TSV（垂直互联）数据通道。

### 上下文读写规范

每个原子 skill 必须声明：
- `required_keys`：从共享上下文读取的键（优先于重新解析）
- `output_keys`：写入共享上下文的键（供下游 skill 使用）

### 7个原子 skill 的上下文键

| 原子 skill | required_keys（读取） | output_keys（写入） | TSV 优先级 |
|-----------|----------------------|-------------------|-----------|
| bug-triage | `user_input`（原始错误描述） | `triage_result`（分类+优先级+策略） | 高（起点） |
| bug-identification | `triage_result` | `bug_report`（问题描述+复现步骤+期望/实际） | 高 |
| code-analysis | `bug_report` + `relevant_files` | `analysis_result`（可疑代码段列表） | 中 |
| root-cause-analysis | `analysis_result` | `root_cause`（根因+证据链+代码行） | 高 |
| fix-generation | `root_cause` | `fix_plan`（方案列表+推荐+diff） | 高（核心） |
| fix-verification | `fix_plan` | `verification_result`（通过/失败/部分） | 高（核心） |
| test-suggestion | `verification_result` | `test_cases`（测试建议+代码示例） | 低（可跳过） |

### Skill Stacking 读取策略

**stack-share-002 严格执行**：
1. 读取 `task_skill.md` 中的 `required_keys`
2. 若命中（key 存在且未过期），使用共享上下文结果
3. 若未命中，标记为 `reparse`，重新解析文件

### 上下文共享效率要求

- 命中率目标 ≥ 60%（即 6 个 required_keys 中至少 4 个从上下文读取）
- 命中率 < 50% 时输出警告："Skill Stacking 效率低，考虑优化上下文键"
- 命中率 < 30% 时建议用户："上下文复用率低，建议显式传入更多上下文"

---

## Co-Design 策略（v1.3 新增）

### Model × Rules × Skills 三层责任分配

| 步骤 | 模型（LLM） | 规则（Rules） | 技能（Atomic Skill） |
|------|----------|-------------|---------------------|
| bug-triage | 决策（分类/优先级） | 规则库匹配（bug-type-rules） | 无 |
| bug-identification | 生成结构化报告 | 模板填充 | 无 |
| code-analysis | 分析代码逻辑 | 文件过滤规则 | **文件解析 skill（主要）** |
| root-cause-analysis | 推理根因 | 根因模式库 | **Pattern 匹配（主要）** |
| fix-generation | 生成修复方案 | 安全约束检查 | **diff 生成（辅助）** |
| fix-verification | 评估修复效果 | 验证规则库 | **测试执行（可选）** |
| test-suggestion | 生成测试代码 | 测试模板库 | 无 |

### Co-Design 决策规则

**codesign-001**：简单任务（simple 复杂度），规则覆盖率目标 ≥ 80%
- bug-triage、fix-verification 由规则主导（规则库已有 bug 分类模式）
- 模型只做分类确认，不做深度推理

**codesign-002**：复杂任务（complex 复杂度），模型主控，覆盖率目标 ≥ 50%
- root-cause-analysis 必须由模型深度推理（代码逻辑复杂）
- fix-generation 必须由模型设计多方案

**codesign-003**：所有任务禁止纯模型路线（无规则辅助）
- 每个步骤必须有规则覆盖点
- 规则覆盖度 < 30% 时输出警告

**codesign-010**：规则覆盖边界必须完整
- bug-type-rules 必须覆盖：frontend/backend/config/logic 四类
- fix-safety-rules 必须覆盖：安全修复约束、向后兼容检查

---

## Pattern Mining 集成（v1.3 新增）

### 修复模式库

模式库路径：`.claude/skills/patterns/bug-fix-patterns/`

### 内置成熟模式（预置）

| 模式 ID | 模式名称 | 触发条件 | 成熟度 | τ 折扣 |
|---------|---------|---------|--------|--------|
| pattern-bf-001 | 前端 undefined 修复 | TypeError + undefined + Vue/React | 成熟（>10次） | 70% |
| pattern-bf-002 | 后端 API 500 修复 | 500 + API + stack trace | 成熟 | 70% |
| pattern-bf-003 | 配置缺失修复 | Error + not found + config | 成长（5次） | 40% |
| pattern-bf-004 | 逻辑错误修复 | 逻辑判断 + 预期不符 | 试验（2次） | 10% |

### Pattern Mining 执行时机

在 `bug-identification` 完成后，立即匹配模式库：

```
bug-identification 完成
    ↓
Pattern Matcher（匹配历史模式，相似度 ≥ 0.6）
    ↓
├─ 匹配成功 → 复用模式中的根因分析和修复方案
│             → τ 节省 40%~70%
│             → 跳过 code-analysis + root-cause-analysis（若模式完整）
│             → 直接进入 fix-generation
│
├─ 部分匹配 → 使用模式中的根因提示
│             → τ 节省 20%
│             → 执行 code-analysis + root-cause-analysis（简化版）
│
└─ 未匹配 → 完整执行所有步骤（τ 全消耗）
```

### 模式匹配算法

```python
# 模式相似度计算
def match_pattern(bug_report: dict, pattern: dict) -> float:
    # 权重：
    # - bug_type 匹配：0.3
    # - 错误关键字匹配：0.3
    # - 项目类型匹配：0.2
    # - 错误消息相似度（Jaccard）：0.2
    score = (bug_type_match * 0.3) + (keyword_match * 0.3) +
            (project_type_match * 0.2) + (msg_similarity * 0.2)
    return score
```

### 模式记录与更新

每次 bug 修复完成后：
1. 提取修复模式特征（bug_type、keywords、project_type、fix_pattern）
2. 若相似度 < 0.6，记录为新模式（试验阶段）
3. 模式晋升规则：试验（1次）→ 成长（3次验证）→ 成熟（5次验证）

---

## Bug分类系统（Co-Design 增强）

### 按类型分类
- **frontend**：Vue/React组件错误、样式问题、交互异常
- **backend**：API错误、数据库错误、逻辑错误
- **config**：环境变量错误、配置文件错误
- **logic**：业务逻辑错误、数据处理错误

### 按优先级分类（τ 影响）

| 优先级 | 说明 | τ 预算倍数 | 可跳过步骤 |
|--------|------|----------|-----------|
| critical | 系统无法使用、数据丢失、安全问题 | 2.0x | 禁止跳过 |
| high | 核心功能无法使用 | 1.5x | 禁止跳过 bug-triage/fix-generation |
| medium | 功能部分受损，有替代方案 | 1.0x | test-suggestion 可跳过 |
| low | 体验问题 | 0.5x | bug-identification + test-suggestion 可折叠 |

---

## 主skill完成标准（v1.3，10项）

1. **τ 预算合规**：总 τ 消耗 ≤ 预算（simple: 3000, moderate: 8000, complex: 15000）
2. **bug已明确分类**：类型（frontend/backend/config/logic）+ 优先级（critical/high/medium/low）
3. **bug问题已明确归类**：创建结构化描述，复现步骤完整
4. **根因已定位**：明确陈述根本原因，提供证据链
5. **提供可执行的修复方案**：至少 2 个方案，推荐方案明确
6. **修复方案经过验证**：功能验证通过，结论明确
7. **提供测试用例建议**：至少 3 个单元测试场景
8. **Task Folding 记录**：所有折叠操作已记录（包含原因和 τ 收益）
9. **Skill Stacking 命中率 ≥ 60%**：共享上下文复用达标
10. **Pattern Mining 结果已归档**：匹配/未匹配状态已记录

---

## τ 效率评分（v1.3 新增）

任务完成后计算效率评分：

```
τ_efficiency_score = (完成质量分 × τ 折扣) / τ_actual_consumed

其中：
- 完成质量分 = 满足的完成标准数 / 10（0.0 ~ 1.0）
- τ 折扣 = 1.0 - Pattern Mining τ 节省率（0.0 ~ 0.7）
- τ_actual_consumed = 实际消耗 token 数 / 基准值（1000）

评分标准：
- 优秀（τ_efficiency_score ≥ 0.8）：τ 节省且质量高
- 合格（0.5 ≤ score < 0.8）：τ 正常消耗
- 不合格（score < 0.5）：τ 超支或质量低
```

---

## 重试规则

- 每个原子skill失败后可重试 **3次**
- 重试3次后仍失败，暂停任务等待用户确认
- fix-verification发现修复不完整时，可返回fix-generation阶段（最多循环 **2次**）
- Task Folding 后失败：回退到非折叠路径，重新执行原始步骤

---

## 文件系统位置
- 主skill路径：`.claude/skills/bug-solver/SKILL.md`
- 原子skill路径：`.claude/skills/bug-solver/atomic-skills/`下各子目录
- 模式库路径：`.claude/skills/patterns/bug-fix-patterns/`
- 共享上下文：`task_skill.md`

---

## 使用示例

用户输入："登录页面点击登录按钮没有反应，控制台显示TypeError: Cannot read property 'login' of undefined"

**v1.3 执行流程**：

1. **τ-Control** 分配预算：moderate → 总预算 8000
2. **bug-triage**：类型 frontend，优先级 high，τ 消耗 960（12%）
3. **Pattern Mining**：匹配 pattern-bf-001（前端 undefined 修复，成熟模式）
   - 相似度 0.75 → τ 折扣 70%，τ 节省 2240
4. **bug-identification**：τ 消耗 1200（15%）
5. **code-analysis** + **root-cause-analysis**：折叠为 analyze-and-locate，τ 消耗 3040（38%）
6. **fix-generation**：τ 消耗 1440（18%）[核心步骤，不折叠]
7. **fix-verification**：τ 消耗 960（12%）[核心步骤]
8. **test-suggestion**：跳过（τ 预算紧张）
9. **τ 效率评分**：质量分 0.9，τ 折扣 0.7，τ 消耗 7600/8000
   - 评分 = (0.9 × 0.7) / 7.6 = 0.0828 → **合格**
10. **Pattern Mining 归档**：本次修复记录为 pattern-bf-001 新增验证案例

最终输出完整的bug解决报告 + τ 分解报告。

---

## 注意事项

- 所有原子skill必须按序执行，不能跳过核心步骤
- bug-triage决定了后续处理策略，关键步骤
- 修复方案生成前必须通过根因分析
- 修复验证是必须的步骤，不能跳过
- τ 超出时优先折叠 test-suggestion，禁止折叠 fix-generation/fix-verification
- Pattern Mining 匹配成功后可跳过部分分析步骤，但必须保留根因确认
- Skill Stacking 命中率 < 50% 时应输出优化建议

---

## 原子skill详细定义（τ 增强版）

### 1. bug-triage [核心·不折叠]
**能力**：分类bug类型、优先级，制定处理策略  
**输入**：用户描述的错误信息  
**输出**：bug分类报告（类型、优先级、处理策略）  
**完成标准**：明确分类（类型+优先级），制定处理策略  
**τ 权重**：10%~15%  
**required_keys**：无（起点）  
**output_keys**：`triage_result`  
**Co-Design**：模型决策 + 规则库匹配  
**Pattern 触发**：优先匹配已知 bug 类型模式

### 2. bug-identification [可折叠]
**能力**：收集bug信息，创建结构化问题描述  
**输入**：bug-triage的分类结果 + 用户描述  
**输出**：结构化问题报告  
**完成标准**：问题类型已明确，复现步骤完整，期望/实际行为对比清晰  
**τ 权重**：15%  
**required_keys**：`triage_result`  
**output_keys**：`bug_report`  
**可折叠进**：code-analysis（simple 复杂度时）  
**Task Folding 组**：Group A（+ bug-triage）、Group C（+ code-analysis）

### 3. code-analysis [可折叠]
**能力**：分析相关代码文件，识别潜在问题  
**输入**：bug-identification的问题报告  
**输出**：代码分析报告  
**完成标准**：所有相关文件已分析，至少识别3个可疑代码段  
**τ 权重**：18%~20%  
**required_keys**：`bug_report`  
**output_keys**：`analysis_result`  
**可折叠进**：root-cause-analysis（moderate 复杂度时）  
**Co-Design**：文件解析 skill 主要 + 模型辅助推理

### 4. root-cause-analysis [可折叠]
**能力**：定位根本原因，明确导致问题的代码行  
**输入**：code-analysis的分析报告  
**输出**：根因定位报告  
**完成标准**：根本原因明确陈述，提供4个以上证据  
**τ 权重**：20%  
**required_keys**：`analysis_result`  
**output_keys**：`root_cause`  
**可折叠**：与 code-analysis 合并（见 Task Folding Group B）

### 5. fix-generation [核心·不折叠]
**能力**：设计并生成修复方案  
**输入**：root-cause-analysis的根因报告  
**输出**：修复方案文档（含diff）  
**完成标准**：至少2个方案，推荐方案明确  
**τ 权重**：18%~20%  
**required_keys**：`root_cause`  
**output_keys**：`fix_plan`  
**Co-Design**：模型设计多方案 + diff 生成辅助

### 6. fix-verification [核心·不折叠]
**能力**：验证修复是否解决问题  
**输入**：fix-generation的修复方案  
**输出**：修复验证报告  
**完成标准**：功能验证通过，结论明确（成功/失败/部分成功）  
**τ 权重**：10%~12%  
**required_keys**：`fix_plan`  
**output_keys**：`verification_result`

### 7. test-suggestion [可跳过]
**能力**：建议测试用例防止问题再次发生  
**输入**：fix-verification的验证报告  
**输出**：测试建议文档  
**完成标准**：至少3个单元测试场景，包含代码示例  
**τ 权重**：0%~5%（τ 不足时跳过）  
**required_keys**：`verification_result`  
**output_keys**：`test_cases`  
**折叠条件**：τ_remaining < 5% 时跳过

---

## 版本信息

- **版本**：1.3（τ 增强版）
- **主skill名称**：bug-solver
- **原子skill数量**：7个
- **整合韬定律**：K1 Task Folding、K2 Skill Stacking、K3 Co-Design、K4 Pattern Mining
- **τ 节省目标**：约 30%（通过 Pattern Mining + Task Folding）
- **状态**：启用
- **最后更新**：2026-06-04