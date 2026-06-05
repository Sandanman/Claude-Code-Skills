---
name: code-optimizer
description: 系统化地优化代码，基于代码质量分析和性能分析识别改进点，提供可执行的优化方案，并应用修改以提升代码质量、性能和可维护性。整合 τ-Agent 监控（Task Folding、Skill Stacking、Co-Design、Pattern Mining），在用户请求代码优化或性能优化时自动触发。
version: 2.0
tau_version: τ-enhanced
---

# Code Optimizer 主Skill（τ 增强版）

> 本 Skill 依照华为韬定律设计，整合 τ-Agent 监控框架，实现从"摩尔路线"（更多 Skill）到"韬路线"（更短执行路径）的优化。

---

## 概述

Code Optimizer 用于系统化地优化代码，基于代码质量分析和性能分析识别改进点，提供可执行的优化方案，并应用修改以提升代码质量、性能和可维护性。

**整合来源**：
- `code-optimizer`（原）：代码质量分析 + 代码重构
- `performance-optimizer`（已合并）：性能数据收集 + Lighthouse/Bundle 分析 + 基准测试

**τ 增强核心**：通过 Task Folding 将 13 个原子 Skill 压缩为 7 个，τ_agent 效率提升约 30%。

---

## 韬理论映射

| 芯片领域 | AI Agent 领域 | 在本 Skill 中的体现 |
|---------|--------------|-------------------|
| τ（时间常数） | **τ_agent** | 每个步骤分配 τ 预算，超预算时触发 Task Folding |
| K1 逻辑折叠 | Task Folding | 13→7 原子 Skill 压缩，减少执行路径 |
| K2 三维堆叠 | Skill Stacking | 上游输出写入共享上下文，下游优先读取，避免重复解析 |
| K3 全栈协同 | Co-Design | Model × Rules × Skills 三层协同分配 |
| K4 成熟制程 | Pattern Mining | 历史优化模式复用，成熟模式 τ 折扣 70% |

---

## τ-Agent 预算体系

### τ_agent 分解公式

```
τ_agent = τ_intent + τ_match + τ_plan + τ_exec + τ_validate

其中：
τ_intent    = 意图识别耗时（约 500 τ）
τ_match     = 技能匹配耗时（约 300 τ）
τ_plan      = 任务规划耗时（约 400 τ）
τ_exec      = 原子技能执行耗时（Σ 各 skill）
τ_validate  = 结果校验耗时（约 600 τ）

总性能 = f(任务质量) / τ_agent
```

### τ 预算配置

```python
TAU_BUDGETS = {
    "simple":    {"total": 5000,   "intent": 500, "match": 300, "plan": 400, "exec": 3200, "validate": 600},
    "moderate":  {"total": 15000,  "intent": 1000, "match": 600, "plan": 800, "exec": 10600, "validate": 2000},
    "complex":   {"total": 50000,  "intent": 2000, "match": 1000, "plan": 1500, "exec": 38500, "validate": 7000},
}
```

### τ 预警与控制

| 阈值 | 行为 |
|------|------|
| τ > 80% | 触发警告，提示剩余 τ 不足 |
| τ > 95% | 触发强制 Task Folding（跳过可选步骤） |
| τ > 100% | 终止非核心步骤，保留核心步骤执行 |

---

## Task Folding 规则（K1 逻辑折叠）

### 折叠策略

**折叠前（13 个原子 Skill）**：
```
quality-analysis → pattern-recognition
               └→ performance-analysis → benchmark-generation
                                                        ↓
                                              strategy-design → application
                                                        ↓
                                                   verification → documentation
```

**折叠后（7 个原子 Skill）**：
```
quality-and-perf-analysis
        ↓
pattern-and-benchmark-recognition（并行）
        ↓
optimization-proposal（FOLD: strategy-design 合并入）
        ↓
code-optimization（FOLD: application 合并入）
        ↓
optimization-verification（合并两个 optimizer 的 verification）
        ↓
documentation-update
```

### 折叠规则

```markdown
fold-001: 连续 3 个原子 skill 的 τ 总和 > 合并后单 skill 的 τ 时，触发折叠
fold-002: 合并后的 skill 必须在 skills_register 中已存在，不新建 skill
fold-003: 折叠深度最多 2 次（折叠后再折叠不可超过 2 层）
fold-004: 用户明确要求的 skill 不可折叠（user_required=True）
fold-005: τ_remaining < 30% 且 depth > 3 时，强制折叠
fold-006: 折叠前需评估：折叠是否降低任务质量
fold-007: 折叠操作记录到执行日记（含折叠原因和 τ 收益估算）
fold-008: 涉及不同 domain 的 skill 不能折叠（如 security 扫描 + UI 重构）
fold-009: 共享中间结果的 skill 不能折叠（除非下游已全部完成）
fold-010: 用户要求"详细分析"时禁止折叠
```

---

## Skill Stacking 规则（K2 三维堆叠）

### 层级架构

```python
# Skill Stacking 层定义
SKILL_LAYERS = {
    "layer_1_perception": [
        "quality-and-perf-analysis",  # 感知层：数据收集，不依赖其他 skill
    ],
    "layer_2_analysis": [
        "pattern-and-benchmark-recognition",  # 分析层：基于感知数据做模式识别
    ],
    "layer_3_generation": [
        "optimization-proposal",
        "code-optimization",
    ],  # 生成层：生成优化方案并应用
    "layer_4_output": [
        "optimization-verification",
        "documentation-update",
    ],  # 输出层：验证和文档
}
# 层内可并行，层间串行（类比 3D 堆叠中的层间通信）
```

### 上下文共享规则

```markdown
stack-share-001: 上游 skill 的输出必须写入 task_skill.md 共享上下文
stack-share-002: 下游 skill 优先从共享上下文读取，避免重复解析文件
stack-share-003: TSV 类共享（跨 Skill 直传）优先级：共享上下文 > 重新读取
stack-layer-001: 同层 skill 可并行执行（共享上下文保护锁）
stack-layer-002: 栈叠层级深度最多 4 层
stack-eff-001: 共享上下文命中率 < 50% 时，触发堆叠效率警告
stack-eff-002: 共享上下文命中率 >= 70% 时，τ 节省约 15-20%
```

### 共享上下文结构

```markdown
<!-- task_skill.md 共享上下文片段 -->
## Code Optimizer 共享数据

### 感知层输出（quality-and-perf-analysis）
- quality_report: {...}  # 代码质量分析报告
- perf_baseline: {...}   # 性能基线数据（Lighthouse/Web Vitals）
- bundle_analysis: {...} # Bundle 体积分析

### 分析层输出（pattern-and-benchmark-recognition）
- patterns: [...]        # 识别的代码模式列表
- benchmarks: {...}      # 基准测试配置
- metrics_baseline: {...} # 性能指标基线快照

### 生成层输出（optimization-proposal + code-optimization）
- proposals: [...]       # 优化方案（激进/保守/折中）
- applied_changes: [...] # 已应用的代码变更
- rollback_script: "..." # 回滚脚本

### 输出层输出（optimization-verification + documentation-update）
- verification_report: {...} # 验证报告（Before/After 对比）
- doc_updates: [...]         # 文档更新清单
```

---

## Co-Design 规则（K3 全栈协同）

### 能力分配矩阵

| 步骤 | Model 分配 | Rules 分配 | Skills 分配 |
|------|-----------|-----------|-----------|
| τ_intent（意图识别） | 高 | 中 | 低 |
| τ_match（技能匹配） | 高 | 高 | 低 |
| τ_plan（任务规划） | 中 | 高 | 高 |
| τ_exec：quality-analysis | 中 | 高 | 高 |
| τ_exec：pattern-and-benchmark-recognition | 高 | 中 | 高 |
| τ_exec：proposal | 高 | 中 | 中 |
| τ_exec：code-optimization | 高 | 中 | 中 |
| τ_validate（校验） | 中 | 高 | 高 |
| τ_validate（归档） | 低 | 高 | 高 |

### 规则约束

```markdown
codesign-001: 简单任务（复杂度 <= 3）规则覆盖率目标 >= 80%
codesign-002: 复杂任务（复杂度 > 7）模型主控，规则辅助，覆盖率目标 >= 50%
codesign-003: 所有任务必须通过 Co-Design 决策，禁止纯模型或纯规则路线
codesign-010: Model 能力边界必须标注，规则覆盖边界必须覆盖
codesign-011: 新增规则必须评估对 τ 的影响（正向/负向/中性）
codesign-012: τ 超出预算时，分析是哪一层的贡献问题
codesign-020: 每个任务结束后，计算 Model × Rules × Skills 三层贡献度
codesign-021: τ 报告包含与历史均值的对比（判断任务健康度）
```

---

## Pattern Mining 规则（K4 成熟制程）

### 模式复用策略

```python
PATTERN_MATURITY = {
    "mature":   {"frequency": ">= 5 次",  "tau_discount": 0.7,  "action": "直接复用"},
    "growing":  {"frequency": "2-4 次",  "tau_discount": 0.4,  "action": "复用 + 验证"},
    "trial":    {"frequency": "1 次",    "tau_discount": 0.1,  "action": "新建模式"},
    "new":      {"frequency": "无历史",  "tau_discount": 1.0,  "action": "完整执行"},
}
```

### 模式库结构

```markdown
.claude/skills/patterns/optimize-patterns/
├── vue-perf-optimize.md    # Vue 项目性能优化模式（成熟）
├── react-perf-optimize.md   # React 项目性能优化模式（成长）
├── vue-code-quality.md      # Vue 代码质量优化模式（成熟）
└── react-code-quality.md    # React 代码质量优化模式（试验）
```

### 模式约束

```markdown
pattern-001: 相似度 >= 0.6 时，优先复用历史模式，而非重新执行
pattern-002: 成熟模式（出现 >= 5 次）τ 折扣 70%
pattern-003: 成长模式（出现 2-4 次）τ 折扣 40%
pattern-010: 复用率 = 已匹配模式数 / 总步骤数
pattern-011: 复用率 < 30% 时，建议触发新模式挖掘
pattern-012: 新建模式必须经过 2 次验证才能晋升为成长模式
pattern-020: 模式描述必须包含：触发条件、执行步骤、τ 收益、验证状态
```

---

## 核心能力

- **质量分析**：圈复杂度、认知复杂度、重复代码率、代码异味、安全风险
- **性能分析**：渲染性能、执行效率、内存问题、Bundle 体积、Web Vitals
- **基准测试**：Lighthouse CI 自动化测试、Web Vitals 采集、Before/After 对比
- **优化方案**：多策略生成（激进/保守/折中），diff 格式代码变更
- **自动化重构**：应用优化方案，生成回滚脚本，确保功能正确性
- **量化验证**：质量指标对比 + 性能指标对比，PASS/FAIL 判定

---

## 执行流程（7 步管道，Task Folding 后）

```
τ_agent 预算分配：
  τ_intent → τ_match → τ_plan → τ_exec → τ_validate

管道结构：
┌─────────────────────────────────────────┐
│  1. quality-and-perf-analysis           │ ← 无依赖
│  1b. redundancy-check（并行，感知层）     │ ← 无依赖，合并冗余检测三个原子技能
└──────────┬──────────────────────────────┘
           ▼
┌─────────────────────────────────────────┐
│  2. pattern-and-benchmark-recognition   │ ← 依赖 step1，Pattern + Benchmark 并行
└──────────┬──────────────────────────────┘
           ▼
┌─────────────────────────────────────────┐
│  3. optimization-proposal               │ ← 依赖 step2，FOLD: strategy-design
└──────────┬──────────────────────────────┘
           ▼
┌─────────────────────────────────────────┐
│  4. code-optimization                   │ ← 依赖 step3，FOLD: application
└──────────┬──────────────────────────────┘
           ▼
┌─────────────────────────────────────────┐
│  5. optimization-verification            │ ← 依赖 step4，合并两个 optimizer 的 verification
└──────────┬──────────────────────────────┘
           ▼
┌─────────────────────────────────────────┐
│  6. documentation-update               │ ← 依赖 step5
└─────────────────────────────────────────┘
```

### 并行执行策略

- `quality-and-perf-analysis` 和 `redundancy-check` 在感知层并行执行（共享目标文件列表，τ 效率提升约 25%）
- `pattern-and-benchmark-recognition` 依赖两个感知技能完成后才执行
- Skill Stacking 强制要求：下游技能从共享上下文读取，避免重复文件解析

### Task Folding 决策

| 条件 | 决策 | τ 收益 |
|------|------|--------|
| step2 两项并行 | 合并为 `pattern-and-benchmark-recognition` | τ_reduced ≈ 400 |
| step3+step4 连续 | 合并为 `optimization-proposal` + `code-optimization` | τ_reduced ≈ 600 |
| optimization-verification 重复 | 合并为统一的 `optimization-verification` | τ_reduced ≈ 500 |
| **总 τ 收益** | | **≈ 1500 τ（~20% 压缩）** |

---

## 原子 Skill 依赖关系

| 原子 Skill | 依赖 | 并行关系 |
|-----------|------|---------|
| `quality-and-perf-analysis` | 无 | 与 redundancy-check 并行（感知层） |
| `redundancy-check` | 无 | 与 quality-and-perf-analysis 并行（感知层） |
| `pattern-and-benchmark-recognition` | quality-and-perf-analysis, redundancy-check | Pattern + Benchmark 并行 |
| `optimization-proposal` | pattern-and-benchmark-recognition | — |
| `code-optimization` | optimization-proposal | — |
| `optimization-verification` | code-optimization | — |
| `documentation-update` | optimization-verification | — |

---

## 主 Skill 完成标准（6 项）

1. 质量分析完成：圈复杂度 < 15、重复率 < 5%、无高危安全风险
2. 性能分析完成：识别至少 3 个瓶颈（渲染/执行/内存），Lighthouse 基线数据已采集
3. 优化方案明确：至少提供 3 个策略（激进/保守/折中），每个含 diff 格式修改
4. 修改后代码正确：通过语法检查 + 构建验证，功能测试 100% 通过
5. 优化效果验证：质量指标改善 + 性能指标改善，生成 Before/After 报告
6. 文档更新完整：组件注释、README、API 文档均已更新

---

## 重试规则

- 每个原子 Skill 失败后可重试 **3 次**
- `code-optimization` 失败会影响后续执行，暂停任务等待用户确认
- `optimization-verification` 发现修复不完整时，可返回 `code-optimization` 阶段重新优化（最多循环 **2 次**）

---

## 触发关键词

- "优化代码"、"重构"、"性能优化"、"首屏加载"、"渲染性能"
- "代码质量"、"消除重复"、"减少卡顿"、"Lighthouse"、"Bundle 优化"
- "懒加载"、"代码分割"、"Web Vitals"

---

## 质量指标体系

### 代码质量指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 圈复杂度 | < 15 | 控制流程复杂度 |
| 认知复杂度 | < 10 | 人类理解难度 |
| 重复代码率 | < 5% | 代码克隆检测 |
| 函数行数 | < 50 行 | 单函数代码行数 |
| 文件行数 | < 300 行 | 文件总行数 |

### 性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| LCP | < 2.5s | 最大内容绘制 |
| FCP | < 1.8s | 首次内容绘制 |
| CLS | < 0.1 | 累积布局偏移 |
| TBT | < 200ms | 总阻塞时间 |
| Bundle Size | 减少 >= 10% | 打包体积优化 |

---

## ⭐ Skill Stacking 强制读取规则（MUST）

> **背景**：skill-design.md 和 `.claude/rules/skill-stacking.mdc` 明确要求下游 skill 优先从共享上下文读取。
> 以下规则将设计意图转化为强制执行步骤。

### 执行前：优先从共享上下文读取

**optimizer-context-001**（MUST）：
在开始执行 code-optimizer 之前，**必须按以下优先级读取信息**：

```
# 优先级 1：task_skill.md 共享上下文（优先使用，避免重复解析）
Read tasks/current/task_skill.md
→ 查找 ## scan-object-info 执行上下文
→ 读取以下字段（如存在则直接使用）：
   - 框架类型（framework）
   - UI 库（ui_library）
   - 状态管理（state_mgmt）
   - 样式方案（style_solution）
   - TypeScript 使用情况（ts_usage）
   - 渲染模式（render_mode）

# 优先级 2：重新解析项目文件（仅当共享上下文缺失时）
if 共享上下文中缺少必要字段：
    Read package.json
    Read 关键配置文件
    → 将结果追加写入 task_skill.md 共享上下文（补充缺失字段）
```

**optimizer-context-002**（MUST）：
禁止在共享上下文存在对应字段的情况下，重新读取项目文件。
违反此规则将触发 Skill Stacking 命中率警告。

### 执行中：每个原子 skill 完成后写入上下文

**optimizer-context-003**（MUST）：
每个原子 skill 完成后，必须将核心输出写入 task_skill.md：

```
1. Read tasks/current/task_skill.md
2. Edit 在 ## Code Optimizer 共享数据 区域追加该 skill 的输出
3. Write tasks/current/task_skill.md
```

**具体写入映射**：

| 原子 skill | 写入位置 | 写入内容 |
|-----------|---------|---------|
| quality-and-perf-analysis | `### 感知层输出` | 质量报告、性能基线 |
| redundancy-check | `### 感知层输出` | 重复代码清单、死代码清单、severity 分级 |
| pattern-and-benchmark-recognition | `### 分析层输出` | 代码模式列表、基准测试配置 |
| optimization-proposal | `### 生成层输出` | 优化方案（激进/保守/折中）|
| code-optimization | `### 生成层输出` | 已应用的代码变更、回滚脚本 |
| optimization-verification | `### 输出层输出` | Before/After 验证报告 |

### 命中率记录

**optimizer-context-004**：
在 `## τ 执行记录` 区域记录上下文读取命中情况：
```markdown
### 共享上下文命中率追踪
- 框架信息 → context_hit: ✓（task_skill.md 中直接读取）
- 路由方案 → context_hit: ✗（未命中，重新读取路由文件）
```

**optimizer-context-005**：
当命中率 < 50% 时，在任务输出中输出警告：
```
⚠️ Skill Stacking 命中率警告：{hit_rate:.0%}（< 50%）
建议：scan-object-info 等上游 skill 输出应完整写入 task_skill.md 共享上下文
```

### 禁止行为

**optimizer-context-006**（FORBIDDEN）：
- 禁止直接读取 package.json 而不先检查共享上下文
- 禁止跳过 task_skill.md 共享上下文直接解析配置文件
- 违反此规则将导致 Skill Stacking 命中率降至 0%，触发系统警告

---

```markdown
tau-020: 任务完成后输出 τ 分解报告（各步骤耗时占比）
tau-021: τ 报告包含与历史均值的对比（判断任务健康度）
tau-022: 连续 3 次任务 τ 超预算，触发系统级优化建议
```

**τ 分解报告示例**：
```markdown
# τ 分解报告

## τ 预算
- 任务类型：moderate
- 总预算：15000 τ
- 实际消耗：14200 τ
- 预算使用率：94.7%（正常）

## τ 分解
| 步骤 | 预算 | 实际 | 状态 |
|------|------|------|------|
| τ_intent | 1000 | 920 | 正常 |
| τ_match | 600 | 580 | 正常 |
| τ_plan | 800 | 760 | 正常 |
| τ_exec | 10600 | 10400 | 正常 |
| τ_validate | 2000 | 1540 | 节省 23% |

## τ 收益
- Task Folding 节省：约 1500 τ（10%）
- Skill Stacking 节省：约 800 τ（5.3%）
- Pattern Mining 节省：约 400 τ（2.7%）
- 总节省：约 2700 τ（18%）

## 历史对比
- 本次 τ 效率高于历史均值 12%（任务健康）
- 质量评分高于历史均值 5 分
```

---

## 文件系统位置

- 主 Skill 路径：`.claude/skills/code-optimizer/SKILL.md`
- 原子 Skill 路径：`.claude/skills/code-optimizer/atomic-skills/` 下各子目录
- 共享上下文：`.claude/skills/tasks/current/task_skill.md`
- 模式库：`.claude/skills/patterns/optimize-patterns/`

---

## 版本历史

| 版本 | 变更 | 日期 |
|------|------|------|
| 2.0 | τ 增强版：合并 performance-optimizer，整合 τ-Agent 监控（Task Folding / Skill Stacking / Co-Design / Pattern Mining）| 2026-06-04 |
| 1.2 | 改进版：增加 Vue/React 组件专项分析 | 2026-05-21 |
| 1.0 | 初始版本 | 2026-04-15 |

---

## 原子 Skill 详细定义

### 1. quality-and-perf-analysis
**能力**：并行执行代码质量静态分析和性能数据收集  
**输入**：目标代码文件路径或目录  
**输出**：质量报告（复杂度/重复/异味/安全）+ 性能基线（Web Vitals / Lighthouse / Bundle 分析）  
**完成标准**：质量报告包含至少 5 个质量点，性能基线包含 LCP/FCP/CLS 指标  
**Task Folding 来源**：合并 `code-quality-analysis` + `performance-data-collection`（并行执行）

### 1b. redundancy-check
**能力**：深度检测代码冗余（重复代码 + 死代码 + 冗余导入），输出 severity 分级和 fix-suggestion  
**输入**：目标代码文件路径或目录（与 quality-and-perf-analysis 共用输入）  
**输出**：冗余报告（含重复代码清单、死代码清单、severity 分级、fix-suggestion、修复行动计划）  
**完成标准**：重复率检测 + 死代码检测 + severity 分级 + fix-suggestion，覆盖 Vue SFC / TypeScript  
**合并来源**：`duplicate-code-detection` + `unused-code-detection` + `redundancy-report`（Task Folding 合并为感知层单技能）  
**并行关系**：与 `quality-and-perf-analysis` 并行执行，共同作为 `pattern-and-benchmark-recognition` 的输入

### 2. pattern-and-benchmark-recognition
**能力**：识别可优化代码模式 + 生成性能基准测试  
**输入**：质量报告 + 性能基线  
**输出**：模式列表（低效算法/冗余逻辑/渲染问题）+ 基准测试配置（Before 基线快照）  
**完成标准**：识别至少 3 种模式，每个模式含具体位置；生成至少 5 个基准测试用例  
**并行关系**：Pattern Recognition + Benchmark Generation 可并行执行（都依赖 step1）

### 3. optimization-proposal
**能力**：基于模式识别和基准测试，生成优化方案  
**输入**：模式识别报告 + 基准测试配置  
**输出**：优化方案文档（激进/保守/折中，每个含 diff 格式修改和预期收益）  
**完成标准**：至少 3 个方案，每个方案含具体修改步骤和 τ 收益估算  
**Task Folding 来源**：`optimization-strategy-design` 的策略设计部分

### 4. code-optimization
**能力**：应用优化方案，生成优化后代码  
**输入**：选定的优化方案（用户选择）  
**输出**：修改后的代码（diff 格式）+ 回滚脚本 + 备份文件  
**完成标准**：代码可编译/运行，无语法错误，生成回滚脚本  
**Task Folding 来源**：`code-refactoring` + `optimization-application` 合并

### 5. optimization-verification
**能力**：验证优化效果（质量 + 性能双维度）  
**输入**：优化后的代码 + Before 基线  
**输出**：验证报告（Before/After 对比，PASS/FAIL 判定）  
**完成标准**：至少 2 项质量指标改善 + 至少 2 项性能指标改善，功能测试 100% 通过  
**合并来源**：`code-optimizer.verification` + `performance-optimizer.verification` 合并为统一验证

### 6. documentation-update
**能力**：更新相关文档以反映代码变更  
**输入**：优化后的代码和变更说明  
**输出**：文档更新清单（组件注释 + README + API 文档）  
**完成标准**：所有公共 API、组件、重要函数都更新了文档

---

*文档版本：v2.0 | 基于华为韬定律 τ-Agent 框架 | Code Optimizer τ-Enhanced*