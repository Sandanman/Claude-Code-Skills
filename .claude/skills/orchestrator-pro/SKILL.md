# Orchestrator Pro — 智能调度总控（τ 增强版）

## 版本历史

- **v1.2** (2026-06-04): 协同更新 bug-solver v1.3 和 code-generator v1.3 的引用，两个主 skill 均已整合 τ 增强体系（Task Folding、Skill Stacking、Co-Design、Pattern Mining）
- **v1.1** (2026-06-03): 新增复杂度分流入口，简单任务（complexity < 4）自动降级到 orchestrator 轻量逻辑；复杂任务（complexity ≥ 4）使用完整 τ 优化路径
- **v1.0** (2026-06-02): 集成华为韬定律，τ 为核心性能指标，性能 ∝ 1/τ

---

## 0. 复杂度分流入口（v1.1 新增）

**Orchestrator Pro 是所有任务的唯一入口**，内部根据复杂度自动选择路径：

```
用户输入
    ↓
orchestrator-pro（本文件）
    ↓
复杂度判断（步骤 1 意图识别后）
    ├── complexity < 4 → 【轻量路径】直接委托 orchestrator 9步流程
    └── complexity ≥ 4 → 【τ 优化路径】完整执行 9步 + τ增强
```

### 路由逻辑

```python
def route_by_complexity(complexity_assessment: dict) -> str:
    """
    complexity < 4：轻量路径（orchestrator 逻辑）
    complexity ≥ 4：τ 优化路径（orchestrator-pro 逻辑）
    """
    score = complexity_assessment.get("complexity_score", 0)

    if score < 4:
        return "lightweight"   # 委托 orchestrator/SKILL.md 的 9步轻量逻辑
    else:
        return "tau_optimized"  # 使用下方完整的 τ 增强 9步流程
```

### 两条路径的差异

| 维度 | 轻量路径（orchestrator）| τ 优化路径（orchestrator-pro）|
|------|----------------------|---------------------------|
| 触发条件 | complexity < 4 | complexity ≥ 4 |
| 执行逻辑 | 9步流程，Token追踪 | 9步流程 + τ测量 + Task Folding + Pattern Mining |
| Task Folding | 无 | τ_remaining < 30% 且 depth > 3 时触发 |
| Pattern Mining | 无 | 步骤2双轨并行，相似度≥0.6复用子步骤 |
| Skill Stacking | 基础共享上下文 | 命中率追踪，<50% 警告 |
| Co-Design | 无显式记录 | 每步记录 Model/Rules/Skills 贡献度 |
| τ 报告 | 无 | 步骤8输出 τ 分解报告 |
| 适用场景 | 简单修复、单函数生成、配置修改 | 多模块开发、Bug修复、性能优化 |

### 轻量路径说明

complexity < 4 时，orchestrator-pro 委托 `orchestrator/SKILL.md` 的标准 9 步流程执行，不进行 τ 测量和折叠操作。轻量路径本身也是 orchestrator 的完整实现，足以高质量完成简单任务，避免不必要的复杂度和延迟。

**与 orchestrator 的关系**：orchestrator 已降级为"轻量 fallback 逻辑参考"，不再作为独立入口。当 `/orchestrator` 被调用时，实际由 orchestrator-pro 接管并判断走轻量路径。

---

## 1. 核心定位

**Orchestrator Pro** 是 Orchestrator v1.2 的 τ（时间常数）增强版本，以 τ 为统一性能指标，通过时间缩微而非空间扩展（堆模型参数）提升 Agent 综合表现。

### 华为韬定律集成

| 关键技术 | Agent 映射 | 实现位置 |
|---------|-----------|---------|
| K1 逻辑折叠 | Task Folding | 步骤 4 任务生成 + 步骤 5 执行控制 |
| K2 三维堆叠 | Skill Stacking | 步骤 5 执行控制（共享上下文）|
| K3 全栈协同 | Model-Rules Co-Design | 各步骤显式化三层贡献度 |
| K4 成熟制程 | Pattern Mining | 步骤 2 历史检索 + 步骤 9 归档 |

### 核心改进点

- v1.1 复杂度分流：complexity < 4 自动降级轻量路径，complexity ≥ 4 完整 τ 优化
- τ 全链路度量：每步精确测量 duration × 0.5 + tokens × 0.001
- τ 预算三档：simple(5,000) / moderate(15,000) / complex(50,000)
- τ 驱动的 Task Folding：τ 不足时自动折叠任务路径
- τ 分解报告：步骤 8 输出端到端 τ 效率分析

---

## 2. τ 元数据（task_skill.md 新增区域）

每个任务在 task_skill.md 中维护 τ 元数据：

```markdown
## τ 元数据（v1.0 新增）
- tau_budget_total: 15000
- tau_tier: moderate
- tau_allocations:
  - intent:   1500 (10.0%)
  - match:    2250 (15.0%)
  - plan:      750  (5.0%)
  - exec:     9000 (60.0%)
  - validate:  750  (5.0%)
  - archive:   750  (5.0%)
- tau_consumed: {step: float}
- tau_efficiency_score: 0.82
- fold_count: 2
- fold_history: [...]
- stack_hit_rate: 0.68
- pattern_reuse_rate: 0.35
- pattern_discount: 0.25
- co_design_summary: {model: 0.45, rules: 0.30, skills: 0.25}
```

---

## 3. 执行流程（9 步，τ 增强）

### 步骤 1：意图识别与目标推理（τ 增强）

**输入**：用户原始输入

**处理**：
1. 读取 project_context.json（如存在）
2. 读取 skills_register.md 主 skill 列表
3. LLM 意图分析（v1.2 完整逻辑保留）
4. 复杂度评分（complexity_assessment.complexity_score）
5. **复杂度分流（v1.1 新增）**

```python
# ===== 复杂度分流（v1.1 新增）=====
route = route_by_complexity(complexity_assessment)

if route == "lightweight":
    # complexity < 4：委托 orchestrator 轻量路径
    return execute_lightweight_path(intent)
    # → end

# complexity ≥ 4：继续执行 τ 优化路径（下方逻辑）
# ===== 以下为 τ 增强路径 =====
from tau_controller import TauController
from config import TAU_BUDGETS

tau_controller = TauController(
    complexity_score=complexity_assessment.complexity_score
)
tau_controller.allocate_budget()  # simple/moderate/complex 三档

co_design["intent"] = {"model": 0.7, "rules": 0.2, "skills": 0.1}
```

**复杂度 < 4**：轻量路径，直接委托 orchestrator 9步流程 → **【end】**
**复杂度 ≥ 4**：进入步骤 2（完整 τ 优化路径）

---

### 步骤 2：历史意图检索（τ 增强：双轨并行）

**处理**：

**轨道A（已有）**：历史相似度（相似度 ≥ 0.85 则复用结果）
```python
similar_history = retrieve_similar_history(intent, monthly_index, threshold=0.85)
if similar_history.get("high_similarity"):
    return reuse_history_result(similar_history)  # → end
```

**轨道B（新增）**：Pattern Mining（与轨道 A 并行，相似度 ≥ 0.6 复用子步骤）
```python
# ===== τ 增强 =====
from pattern_miner import PatternMiner
pattern_miner = PatternMiner()
pattern_results = pattern_miner.search_patterns(
    intent=intent,
    skill_results=skill_results,  # 首次任务为空
    pattern_library_base=".claude/skills/patterns/",
    threshold=0.60
)
# pattern_results 包含：
# - matched_patterns: 匹配的模式列表（含 τ 折扣）
# - aggregate_discount: 总折扣（用于 τ 效率计算）
# - reuse_rate: 复用率

if pattern_results["matched_count"] > 0:
    tau_controller.pattern_discount = pattern_results["aggregate_discount"]
```

**两轨合并输出**：
```python
combined_results = {
    "history_result": similar_history,       # 轨道 A
    "pattern_results": pattern_results,       # 轨道 B
    "should_continue": not similar_history["high_similarity"]
}
```

**τ 记录**：
```python
tau_controller.record_step(step="match", duration_ms=elapsed_ms, tokens=llm_tokens)
co_design["match"] = {"model": 0.5, "rules": 0.3, "skills": 0.2}
```

---

### 步骤 3：主 skill 匹配（τ 增强：Co-Design 显式化）

**处理**：与 v1.2 相同，增加 Co-Design 贡献度记录。

```python
matched_skill = match_main_skill(intent, skills_register)
# τ 增强：τ 效率加权（pattern 复用时略微加权）
if pattern_results.get("matched_count", 0) > 0:
    matched_skill["score"] = matched_skill["score"] * (1 + pattern_discount * 0.1)

co_design["match"] = {"model": 0.5, "rules": 0.3, "skills": 0.2}
tau_controller.record_step(step="match", duration_ms=elapsed_ms, tokens=tokens)
```

---

### 步骤 4：任务生成（τ 增强：Task Folding）

**主 skill 协同**：
1. 读取原子 skill 列表
2. 与 Reasoner 协同确定执行计划

**τ 增强：Task Folding 折叠决策**

```python
# ===== Task Folding 增强 =====
from algorithms import find_foldable_groups, apply_folding, should_fold
from config import TAU_BUDGETS, FOLD_CONFIG

# DAG 构建后（v1.2 已有）
graph, in_degree = build_dependency_graph(atomic_skills)
sorted_skills = topological_sort(graph, in_degree)
parallel_layers = identify_parallel_layers(sorted_skills, graph)

# τ 折叠决策
tau_remaining_pct = tau_controller.get_remaining_pct()
fold_result = should_fold(
    tau_remaining_pct=tau_remaining_pct,
    current_depth=len(parallel_layers),
    fold_depth=tau_controller.fold_count,
    fold_triggers=FOLD_CONFIG["FOLD_TRIGGERS"]
)

if fold_result["should_fold"]:
    # 识别可折叠组
    foldable_groups = find_foldable_groups(
        parallel_layers,
        atomic_skills,
        FOLD_CONFIG
    )
    if foldable_groups:
        # 执行折叠
        new_layers, fold_record = apply_folding(
            foldable_groups,
            parallel_layers,
            FOLD_CONFIG,
            tau_controller.fold_count
        )
        parallel_layers = new_layers
        tau_controller.fold_count = fold_record["fold_depth"]
        tau_controller.fold_history.append(fold_record)

    # 折叠后重新分配 τ 预算
    tau_controller.rebalance_after_fold(fold_record)

co_design["plan"] = {"model": 0.3, "rules": 0.4, "skills": 0.3}
tau_controller.record_step(step="plan", duration_ms=elapsed_ms, tokens=0)
```

**task_skill.md 生成**：包含 τ 元数据区域（折叠历史、预算分配等）。

---

### 步骤 5：执行流程控制（τ 增强：实时监控 + 紧急折叠）

**初始化**：
```python
token_tracker = TokenTracker(task_budget=200000)
tau_controller.start_step("exec")
stack_tracker = StackHitTracker()
stream = StreamOutput(enabled=True, task_file="tasks/current/task_skill.md")
stream.task_start(task_id, main_skill, total_skills, ...)
```

**τ 增强的执行循环**：

```python
for layer_idx, layer in enumerate(parallel_layers):
    for skill in layer:
        skill_tau_est = skill.get("tau_estimated", 500)

        # ===== τ 增强：紧急折叠 =====
        emergency = tau_controller.should_emergency_fold(skill_tau_est)
        if emergency["emergency_fold"]:
            if not skill.get("is_core") and not skill.get("user_required"):
                stream.skill_skip(skill["name"],
                    reason=f"τ 不足跳过（{emergency['reason']}）")
                update_status(task_skill_md, skill["name"], "skipped")
                tau_controller.record_fold(skill["name"], "emergency_tau")
                continue  # 跳过该 skill
            else:
                stream.warning(f"核心 skill 无法跳过，τ 继续消耗")

        start_time = time.time()
        stream.skill_start(skill["name"], ...)

        try:
            result = execute_atomic_skill(skill)
            elapsed_ms = (time.time() - start_time) * 1000
            tokens = result.llm_usage.total if hasattr(result, "llm_usage") else 0

            # ===== τ 记录 =====
            tau_record = tau_controller.record_step(
                step="exec",
                duration_ms=elapsed_ms,
                tokens=tokens,
                skill_name=skill["name"]
            )
            token_tracker.record_skill_usage(skill["name"], input_tokens, output_tokens)

            # ===== Skill Stacking 命中追踪 =====
            if result.shared_context_hit:
                stack_tracker.record_read(skill["name"], "context", hit=True)
            else:
                stack_tracker.record_read(skill["name"], "context", hit=False)

            # τ 预警
            for warning in tau_record.get("warnings", []):
                level = warning["level"]
                if level == "abort":
                    raise StopException(f"τ 预算耗尽，任务终止")
                elif level == "critical":
                    stream.warning(f"🚨 τ 剩余 {tau_record['remaining_pct']:.1%}，即将终止")
                elif level == "warning":
                    stream.warning(f"⚠️ τ 剩余 {tau_record['remaining_pct']:.1%}，谨慎执行")

            stream.skill_success(skill["name"], index, total, result.summary, elapsed_ms)
            update_status(task_skill_md, skill["name"], "completed", result)

        except Exception as e:
            will_retry = retry_count < 3
            impact = assess_error_impact(skill, task_skill)
            if impact >= 5:
                raise PauseException(...)
            else:
                record_error(task_skill_md, skill, e)
                continue_execution()
```

**Co-Design + Skill Stacking 记录**：
```python
co_design["exec"] = {"model": 0.6, "rules": 0.2, "skills": 0.2}
```

**更新 task_skill.md**（v1.2 已有 + τ 增强）：
```python
# Skill Stacking 命中率写入 task_skill.md
if layer_idx == len(parallel_layers) - 1:  # 最后一层后
    append_shared_context_stats(task_skill_md, {
        "stack_hit_rate": stack_tracker.get_hit_rate(),
        "total_reads": stack_tracker.total_read_attempts,
        "shared_hits": stack_tracker.shared_context_hits,
    })
```

---

### 步骤 6：任务恢复（τ 增强）

**处理**：与 v1.2 相同，增加 τ 状态恢复。

```python
# 从 tasks/current/task_skill.md 恢复
# + τ 元数据恢复
tau_meta = load_tau_metadata(task_skill_md)
if tau_meta:
    tau_controller.restore_from_metadata(tau_meta)
```

---

### 步骤 7：结果校验（τ 增强：τ 效率评分）

```python
# ===== τ 增强 =====
from algorithms import calculate_efficiency_score, aggregate_contributions

# v1.2 已有：偏差量化
verification = verify_completion(task_skill_md)
deviation = calculate_deviation(task_skill_md.get("goal", {}), verification)

# τ 效率评分（新增）
task_quality = 1.0 - deviation
tau_efficiency = tau_controller.calculate_efficiency_score(
    task_quality=task_quality,
    pattern_discount=pattern_results.get("aggregate_discount", 0.0),
    stack_discount=calculate_stack_discount(
        stack_tracker.get_hit_rate(),
        {"STACK_HIT_RATE_WARNING": 0.50}
    )
)

# Co-Design 贡献汇总（新增）
co_design_summary = aggregate_contributions(co_design)

# Pattern 贡献（新增）
pattern_contribution = {
    "reuse_rate": pattern_results.get("reuse_rate", 0.0),
    "matched_count": pattern_results.get("matched_count", 0),
    "tau_discount": pattern_results.get("aggregate_discount", 0.0),
}

co_design["validate"] = {"model": 0.4, "rules": 0.4, "skills": 0.2}
tau_controller.record_step(step="validate", duration_ms=elapsed_ms, tokens=tokens)

# 反思循环（v1.2 已有）
reflection_result = reflection_loop(task_skill_md, max_attempts=3)
```

---

### 步骤 8：结果输出（τ 增强：τ 分解报告）

**输出内容**（v1.2 已有 + τ 增强）：

```
## 执行摘要
任务概览：ID、主skill、执行时长、复杂度、成功率
关键成果：各原子skill的核心产出

## τ 分解报告（v1.0 新增）
   总消耗: 7500 / 15000 (50.0%)
   ├─ intent:     800 (10.7%) [预算 1500]
   ├─ match:     1200 (16.0%) [预算 2250]
   ├─ plan:       400  (5.3%) [预算 750]
   ├─ exec:      4200 (56.0%) [预算 9000]
   ├─ validate:   500  (6.7%) [预算 750]
   └─ archive:    400  (5.3%) [预算 750]

   效率评分: 0.82 (优秀)  🟢
   折叠次数: 2 次（节省 35% exec τ）
   模式复用: 25% τ折扣（3个匹配模式）
   上下文命中率: 68%
   Co-Design: Model=45% / Rules=30% / Skills=25%

## 反思日志（如有）
[反思内容]

## Token 消耗
[Token 追踪报告]
```

```python
co_design["archive"] = {"model": 0.1, "rules": 0.6, "skills": 0.3}
tau_controller.record_step(step="archive", duration_ms=elapsed_ms, tokens=0)

# 生成 τ 分解报告
tau_report = tau_controller.generate_tau_report()
print(tau_report)
```

---

### 步骤 9：任务归档（τ 增强：Pattern 存储）

**处理**（v1.2 已有 + Pattern 存储）：

```python
# 归档任务（v1.2）
archive_task(task_skill_md, validation_report)

# ===== Pattern 存储（τ 增强）=====
from pattern_miner import PatternMiner
pattern_miner = PatternMiner()

if validation_report.get("all_passed") and validation_report.get("deviation", 1.0) < 0.2:
    pattern_result = pattern_miner.store_pattern(
        features=extract_pattern_features(intent, skill_results),
        intent=intent,
        tau_metadata=tau_controller.metadata
    )
    # pattern_result 包含：
    # - stored: True/False
    # - pattern_id: 新模式的 ID
    # - maturity_updated: 成熟度是否更新
```

---

## 4. 关键增强点汇总

| 步骤 | v1.2 功能 | τ 增强点 | v1.1 新增 |
|------|---------|---------|---------|
| 0 | — | — | 复杂度分流（< 4 降级轻量路径）|
| 1 | 意图识别 | τ 预算初始化 + Co-Design | +复杂度分流路由 |
| 2 | 历史检索 | **双轨并行**：+Pattern Mining ≥ 0.6 |
| 3 | 技能匹配 | τ 效率加权 + Co-Design 显式化 |
| 4 | 任务生成 | **+Task Folding 折叠** |
| 5 | 执行控制 | **+τ 实时监控 + 紧急折叠 + Stack 追踪** |
| 6 | 任务恢复 | +τ 元数据恢复 |
| 7 | 结果校验 | **+τ 效率评分 + Co-Design 汇总** |
| 8 | 结果输出 | **+τ 分解报告** |
| 9 | 任务归档 | **+Pattern 模式存储** |

---

## 5. 决策点汇总

| 决策点 | 触发位置 | 触发条件 | 选项数 | 默认行为 |
|--------|---------|---------|--------|---------|
| D1 τ 档位 | 步骤 1 | complexity_score | 3 | 根据复杂度分配 |
| D2 Task Folding | 步骤 4 | τ_remaining<30% + depth>3 | 2 | 折叠 |
| D3 Pattern 复用 | 步骤 2 | similarity ≥ 0.6 | 2 | 复用 |
| D4 紧急折叠 | 步骤 5 | τ_remaining < skill_τ×50% | 3 | 跳过/降级/继续 |
| D5 τ 借位 | 任意步骤 | step τ 超预算 | 2 | 从低优先级借 |
| D6 D6 反思失败 | 步骤 7 | 3次反思后偏差≥0.2 | 3 | 输出当前结果 |
| D7 可固化文档 | 步骤 9 | 检测到可固化文档 | 3 | 仅索引 |

---

## 6. 文件系统结构

```
.claude/skills/orchestrator-pro/
├── SKILL.md                         ← 本文件，τ 增强 9 步主流程
├── README.md                        ← 使用说明
├── algorithms.md                    ← 16 个算法（含新增 11-16）
├── config.md                        ← τ 预算配置 + Co-Design 矩阵
├── technical_implementation.md      ← τ 增强实现代码
├── skills_register.md               ← orchestrator-pro 技能注册
└── atomic-skills/
    ├── tau-controller/SKILL.md      ← τ 控制核心（新增）
    ├── pattern-miner/SKILL.md       ← 模式挖掘（新增）
    ├── intent-recognition/SKILL.md  ← 继承，τ 嵌入
    ├── skill-matcher/SKILL.md        ← 继承，Co-Design
    ├── task-generator/SKILL.md      ← +Task Folding
    ├── execution-controller/SKILL.md ← +τ 监控
    ├── result-validator/SKILL.md    ← +τ 效率
    └── task-archiver/SKILL.md       ← +Pattern 存储

.claude/rules/
├── tau-control.mdc         ← τ 控制核心规则
├── task-folding.mdc        ← Task Folding 规则
├── skill-stacking.mdc      ← Skill Stacking 规则
└── pattern-mining.mdc      ← Pattern Mining 规则

.claude/skills/patterns/    ← 模式库
```

---

## 7. 关键规则（v1.0）

### τ 预算规则

- 步骤 1 后初始化 τ 预算（simple/moderate/complex 三档）
- 80% 预警 / 95% 严重警告 / 100% 终止
- τ 超出时优先折叠，其次跳过可选步骤，核心步骤不可跳过

### Task Folding 规则

- τ_remaining < 30% 且 depth > 3 时触发强制折叠
- 每个任务最多折叠 2 次
- user_required / is_core / 跨 domain skill 不可折叠

### Skill Stacking 规则

- 上游 skill 输出必须写入 task_skill.md 共享上下文
- 下游 skill 优先从共享上下文读取
- 命中率 < 50% 触发警告

### Pattern Mining 规则

- 相似度 ≥ 0.6 触发子步骤复用
- 成熟模式（≥ 5 次）τ 折扣 70%
- 新任务完成后自动存入模式库

---

## 8. 与 orchestrator 的关系（v1.1 新增说明）

**入口统一**：orchestrator-pro 是所有任务的唯一入口（`/orchestrator-pro` 和 `/orchestrator` 均路由至此）。

**复杂度分流（v1.1）**：
- complexity < 4：委托 `orchestrator/SKILL.md` 的 9 步轻量逻辑（无 τ 测量）
- complexity ≥ 4：使用完整 τ 增强 9 步流程（Task Folding + Pattern Mining + Skill Stacking + Co-Design）

**完全继承**：orchestrator v1.2 的 9 步流程、Token 追踪、文件锁、流式输出等所有功能
**叠加增强**：τ 测量、Task Folding、Pattern Mining、Skill Stacking、Co-Design 均以**叠加**方式实现，不破坏轻量路径

**orchestrator 降级说明**：`orchestrator/` 不再作为独立入口，仅保留作为轻量 fallback 逻辑参考（complexity < 4 时由 orchestrator-pro 委托使用）。其 `atomic-skills/` 目录已清空，不再维护。

---

**版本**: 1.1
**最后更新**: 2026-06-03
**理论基础**: 华为韬定律（何庭波，2026）
**父版本**: Orchestrator v1.2