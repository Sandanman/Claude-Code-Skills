# Orchestrator Pro — 智能调度总控（v1.6 三指标版）

## 版本历史

- **v1.6** (2026-06-08): 修复步骤 3 未匹配主 skill 时的处理逻辑：新增三分支判断（无匹配/单匹配/多匹配）。无匹配时记录 missing_skills.md + 尝试自主执行 + 给用户提供清晰的提示和操作建议（对齐 orchestrator 行为）。
- **v1.5** (2026-06-06): 修复跨项目部署问题：步骤 3 匹配到主 skill 后，必须显式读取该 skill 的 SKILL.md 文件来加载原子 skill 列表和执行逻辑。轻量路径同步增强，明确 orchestrator 步骤 3 后必须读取匹配 skill 的 SKILL.md。
- **v1.4** (2026-06-05): 三指标体系重构：τ 为主标准，Token + 时间（duration）为辅助标准。τ 驱动所有决策，Token/时间用于观测、告警和成本/性能分析。新增 Token 辅助告警、时间异常检测（ms/token 比值）、三指标并行报告。
- **v1.3** (2026-06-05): 真正实现轻量路径委托：complexity < 4 时，显式读取并执行 `orchestrator/SKILL.md`，而非内联重复逻辑
- **v1.2** (2026-06-04): 协同更新 bug-solver v1.3 和 code-generator v1.3 的引用，两个主 skill 均已整合 τ 增强体系（Task Folding、Skill Stacking、Co-Design、Pattern Mining）
- **v1.1** (2026-06-03): 新增复杂度分流入口，简单任务（complexity < 4）自动降级到 orchestrator 轻量逻辑；复杂任务（complexity ≥ 4）使用完整 τ 优化路径
- **v1.0** (2026-06-02): 集成华为韬定律，τ 为核心性能指标，性能 ∝ 1/τ

---

## 0. 复杂度分流入口（v1.1 新增，v1.3 真正实现）

**Orchestrator Pro 是所有任务的唯一入口**，内部根据复杂度自动选择路径：

```
用户输入
    ↓
orchestrator-pro（本文件）
    ↓
复杂度判断（步骤 1 意图识别后）
    ├── complexity < 4 → 【轻量路径】显式读取 orchestrator/SKILL.md 并执行
    └── complexity ≥ 4 → 【τ 优化路径】完整执行 9步 + τ增强
```

### 路由逻辑

```python
def route_by_complexity(complexity_assessment: dict) -> str:
    """
    complexity < 4：轻量路径 → orchestrator/SKILL.md
    complexity ≥ 4：τ 优化路径 → orchestrator-pro 自身逻辑
    """
    score = complexity_assessment.get("complexity_score", 0)

    if score < 4:
        return "lightweight"   # 读取并执行 orchestrator/SKILL.md
    else:
        return "tau_optimized"  # 继续执行 orchestrator-pro 自身逻辑
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

### 轻量路径说明（v1.3 实现真正的委托）

complexity < 4 时，orchestrator-pro 执行以下操作：

1. **显式读取** `orchestrator/SKILL.md`（使用 Read 工具）
2. **按照 orchestrator 的 9 步流程执行**（意图识别 → 历史检索 → skill匹配 → **⭐读取匹配skill的SKILL.md** → 任务生成 → 执行控制 → 任务恢复 → 结果校验 → 结果输出 → 任务归档）
3. **不进行 τ 测量和折叠操作**（与 orchestrator 原有行为一致）

**⭐ 关键要求：orchestrator 步骤 3 匹配到主 skill 后，必须读取该 skill 的 SKILL.md**

> 在轻量路径中，orchestrator 的 9 步流程中**步骤 3 匹配主 skill 后**，必须显式读取匹配 skill 的 SKILL.md 文件（从 `skills_register.md` 的 `path` 字段获取路径），加载原子 skill 列表和执行逻辑。这是主 skill 能正确执行的前提条件。

```
orchestrator-pro 执行时（complexity < 4）
    ↓
Read orchestrator/SKILL.md
    ↓
按照 orchestrator 的 9 步流程执行
    ├─ 步骤 1：意图识别
    ├─ 步骤 2：历史检索
    ├─ 步骤 3：主 skill 匹配（从 skills_register.md 匹配）
    │   ↓
    │   ⭐ Read {matched_skill.path}  ← 必须读取匹配 skill 的 SKILL.md
    │       ↓                         （如 .claude/skills/code-generator/SKILL.md）
    ├─ 步骤 4：任务生成（基于 SKILL.md 中的 atomic_skills）
    ├─ 步骤 5：执行控制
    ├─ 步骤 6：任务恢复
    ├─ 步骤 7：结果校验
    ├─ 步骤 8：结果输出
    └─ 步骤 9：任务归档
    ↓
结果输出 → 【end】
```

**orchestrator 的角色**：不再作为独立入口，仅作为 orchestrator-pro 的轻量路径执行模块（Lightweight Execution Module）。其 atomic-skills/ 已清空，仅保留 SKILL.md 作为流程定义。

**与 orchestrator 的关系**：
- orchestrator-pro 是唯一入口（/orchestrator-pro 触发）
- complexity < 4 时，orchestrator-pro 显式读取并执行 orchestrator/SKILL.md
- complexity ≥ 4 时，orchestrator-pro 执行自身 τ 增强逻辑
- 当 `/orchestrator` 被触发时，由 orchestrator-pro 接管并根据复杂度路由

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

## 2. 三指标元数据（v1.4 新增）

每个任务在 task_skill.md 中维护三套并行元数据：

- **τ（主标准）**：驱动所有决策（路由、折叠、效率评分）
- **Token（辅助标准 A）**：独立追踪，与成本对齐，用于观测和告警
- **Duration/时间（辅助标准 B）**：独立追踪，检测异常延迟

```markdown
## 三指标元数据（v1.4 三指标版）

### τ 元数据（主标准，决策驱动）
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

### Token 元数据（辅助标准 A，观测/告警）
- token_budget_total: 80000
- token_tier: moderate
- token_allocations:
  - intent:   8000
  - match:   12000
  - plan:     4000
  - exec:    48000
  - validate: 4000
  - archive:  4000
- token_consumed: {step: float}
- token_efficiency_score: 0.78

### Duration 元数据（辅助标准 B，异常检测）
- duration_budget_total: 30000ms
- duration_tier: moderate
- duration_allocations:
  - intent:   3000ms
  - match:   4500ms
  - plan:     1500ms
  - exec:   18000ms
  - validate: 1500ms
  - archive:  1500ms
- duration_consumed: {step: float}
- duration_avg_ms_per_token: 0.38  # 辅助异常检测

### 通用元数据（跨指标）
- fold_count: 2
- fold_history: [{fold_skill, fold_reason, fold_depth}]
- stack_hit_rate: 0.68
- pattern_reuse_rate: 0.35
- pattern_discount: 0.25
- co_design_summary: {model: 0.45, rules: 0.30, skills: 0.25}

### 异常标记（v1.4 新增）
- anomaly_flags:
  - token_drift: false  # token_eff < tau_eff - 0.1
  - time_drift: false   # duration_eff < tau_eff - 0.1
  - latency_ratio_high: false  # ms/token > 10
```

### 三指标预算三档对照表（v1.4 新增）

| 复杂度 | τ 预算 | Token 预算 | Duration 预算 |
|--------|--------|-----------|-------------|
| simple | 5,000 | 40,000 | 15,000ms |
| moderate | 15,000 | 80,000 | 30,000ms |
| complex | 50,000 | 200,000 | 80,000ms |

**Token 权重分配**（与 τ 同步）：intent=10%, match=15%, plan=5%, exec=60%, validate=5%, archive=5%

---

## 3. 执行流程（9 步，τ 增强）

### 步骤 1：意图识别与目标推理（τ 增强）

**输入**：用户原始输入

**处理**：
1. 读取 project_context.json（如存在）
2. 读取 skills_register.md 主 skill 列表
3. LLM 意图分析（v1.2 完整逻辑保留）
4. 复杂度评分（complexity_assessment.complexity_score）
5. **复杂度分流（v1.1 新增，v1.3 真正实现委托）**

```python
# ===== 复杂度分流（v1.1 新增，v1.3 真正实现）=====
route = route_by_complexity(complexity_assessment)

if route == "lightweight":
    # complexity < 4：读取 orchestrator/SKILL.md 并执行
    # → 执行 orchestrator 的 9 步轻量流程
    # → 【end】
    pass

# complexity ≥ 4：继续执行 τ 优化路径（下方逻辑）
# ===== 三指标初始化（v1.4 新增）=====
from tau_controller import TauController
from token_tracker import TokenTracker
from duration_tracker import DurationTracker
from config import TAU_BUDGETS, TOKEN_BUDGETS, DURATION_BUDGETS

# τ 主标准初始化
tau_controller = TauController(
    complexity_score=complexity_assessment.complexity_score
)
tau_controller.allocate_budget()  # simple/moderate/complex 三档

# Token 辅助标准初始化（v1.4 新增）
token_tracker = TokenTracker(budget=TOKEN_BUDGETS[tau_controller.tau_tier])
token_tracker.start_task(task_id)

# Duration 辅助标准初始化（v1.4 新增）
duration_tracker = DurationTracker(budget=DURATION_BUDGETS[tau_controller.tau_tier])
duration_tracker.start_task(task_id)

co_design["intent"] = {"model": 0.7, "rules": 0.2, "skills": 0.1}
```

**复杂度 < 4（轻量路径，v1.3 真正实现）**：
1. 执行 `Read .claude/skills/orchestrator/SKILL.md`
2. 按照 orchestrator 的 9 步流程执行（意图识别 → 历史检索 → skill匹配 → 任务生成 → 执行控制 → 任务恢复 → 结果校验 → 结果输出 → 任务归档）
3. → **【end】**

**复杂度 ≥ 4（τ 优化路径）**：进入步骤 2（完整 τ 增强流程）

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

**处理**：

```python
# 匹配所有主 skill，计算匹配分数
all_matches = match_main_skill(intent, skills_register)
# 返回格式：[{"skill": skill_obj, "score": float}, ...]

# τ 增强：pattern 复用时 τ 效率加权（对所有候选略微加分）
for match in all_matches:
    if pattern_results.get("matched_count", 0) > 0:
        match["score"] = match["score"] * (1 + pattern_discount * 0.1)

# 按分数降序排列
all_matches.sort(key=lambda x: x["score"], reverse=True)
```

**匹配判断（三分支处理）**：

```python
# ===== 分支 A：无匹配（所有候选 score < 0.4）=====
if not all_matches or all_matches[0]["score"] < 0.4:
    # 记录到 missing_skills.md
    record_to_missing_skills(
        intent=intent,
        reason="no_skill_matched",
        matched_scores=[m["score"] for m in all_matches]
    )

    # 提示用户
    print(f"⚠️  未匹配到已注册的主 skill（最高匹配分数：{all_matches[0]['score'] if all_matches else 0.0:.2f}）")
    print(f"📋 可用 skill：{', '.join([s['skill'].name for s in all_matches])}")

    # 尝试自主执行（基于意图的规则兜底）
    autonomy_result = attempt_autonomous_execution(intent)
    if autonomy_result["executed"]:
        print(f"✅ 已基于意图自主执行：{autonomy_result['summary']}")
        return autonomy_result  # → end
    else:
        print(f"❌ 无法自主执行，请尝试以下方式：")
        print(f"   1. 使用 /orchestrator-pro + 具体描述重新发起请求")
        print(f"   2. 直接使用 slash command（如 /code-generator、/bug-solver 等）")
        print(f"   3. 描述更具体的任务（如「帮我写一个 Vue 组件」而非「帮我做点事」）")
        return {"status": "no_match", "user_action_required": True}  # → end

# ===== 分支 B：单匹配（1个候选 score ≥ 0.4）=====
elif len(all_matches) == 1 or all_matches[0]["score"] >= 0.4:
    matched_skill = all_matches[0]["skill"]
    print(f"🎯 匹配到主 skill：{matched_skill.name}（匹配度：{all_matches[0]['score']:.2f}）")

# ===== 分支 C：多匹配（≥2个候选 score ≥ 0.4）=====
else:
    # 显示 Top3 供用户选择
    top3 = all_matches[:3]
    print(f"🤔 匹配到多个主 skill（显示 Top3，* 为推荐）：")
    for i, m in enumerate(top3):
        marker = " *" if i == 0 else "  "
        print(f"   {marker} [{i + 1}] {m['skill'].name}（匹配度：{m['score']:.2f}）")
    print(f"   请回复数字选择，或描述更具体的任务以自动匹配。")

    # 等待用户选择（异步等待用户输入）
    # 默认使用推荐（最高分）
    user_choice = await_user_selection(options=top3)
    matched_skill = user_choice["skill"]
```

**自主执行兜底逻辑（分支 A 辅助）**：

```python
def attempt_autonomous_execution(intent: dict) -> dict:
    """
    当无 skill 匹配时，尝试基于意图的规则自主执行。
    仅处理高置信度意图（confidence.overall >= 0.7）。
    """
    if intent.get("confidence", {}).get("overall", 0) < 0.7:
        return {"executed": False, "reason": "confidence_too_low"}

    # 基于 domain + action 的规则兜底
    autonomous_map = {
        ("frontend", "create"): "simple_code_generation",
        ("frontend", "fix"): "simple_bug_fix",
        ("refactoring", "optimize"): "simple_code_optimization",
        ("analysis", "analyze"): "simple_code_analysis",
    }

    key = (intent.get("domain"), intent.get("action"))
    if key in autonomous_map:
        return {
            "executed": True,
            "mode": "autonomous",
            "summary": f"以 {autonomous_map[key]} 模式自主执行",
            "note": "结果可能不完整，建议使用具体 skill 获取更优结果"
        }

    return {"executed": False, "reason": "no_autonomous_route"}
```

**⭐ 关键：读取匹配主 skill 的 SKILL.md（必须在分支 B/C 末尾执行，不可跳过）**

> **强制要求**：分支 B（单匹配）或分支 C（多匹配）确定主 skill 后，必须显式读取该 skill 的 SKILL.md 文件，加载原子 skill 列表和执行逻辑。
> 依据：skills_register.md 只提供主 skill 元数据（名称、路径、关键词），原子 skill 列表和详细执行逻辑在各个 SKILL.md 文件中。

**⭐ 关键：读取匹配主 skill 的 SKILL.md（必须在步骤 3 执行，不可跳过）**

> **强制要求**：匹配到主 skill 后，必须显式读取该 skill 的 SKILL.md 文件，加载原子 skill 列表和执行逻辑。
> 依据：skills_register.md 只提供主 skill 元数据（名称、路径、关键词），原子 skill 列表和详细执行逻辑在各个 SKILL.md 文件中。

```
# ===== 读取匹配 skill 的 SKILL.md（MUST，步骤 3 末尾执行）=====
# 1. 从 matched_skill.path 提取路径（如 .claude/skills/code-generator/SKILL.md）
# 2. Read {matched_skill.path}  → 加载该主 skill 的完整 SKILL.md
# 3. 解析 SKILL.md 中的 atomic_skills 列表（如存在）或执行流程定义
# 4. 将原子 skill 列表传递给步骤 4（任务生成）
# 5. 如果该 skill 依赖其他 skill（如 bug-solver 依赖 scan-object-info），
#    递归读取依赖 skill 的 SKILL.md（Skill Stacking 上下文预加载）
```

**原子 skill 来源优先级**：
1. 读取 `.claude/skills/orchestrator/atomic_skills_register.md`（集中式注册表）
2. 读取匹配 skill 的 SKILL.md 中的 atomic_skills 列表（主 skill 自包含）
3. 如果两者都存在，以 SKILL.md 中的为准（主 skill 可覆盖全局注册）

```python
# 读取匹配 skill 的 SKILL.md（τ 增强）
matched_skill_path = matched_skill["path"]  # 如 .claude/skills/code-generator/SKILL.md
skill_md_content = read_file(matched_skill_path)

# 解析 SKILL.md，提取 atomic_skills 列表或执行流程定义
atomic_skills = parse_atomic_skills_from_skill_md(skill_md_content)

# Skill Stacking：预加载依赖 skill 的上下文
# 如果该 skill 的 atomic_skills 包含对其他 skill 输出文件的读取，
# 预加载已存在的上下文（如 tasks/current/task_skill.md 中的共享上下文）
if skill_has_skill_stacking_dependency(matched_skill, atomic_skills):
    shared_context = read_task_skill_shared_context(
        ".claude/skills/tasks/current/task_skill.md"
    )
    # 传入执行上下文，供下游 skill 使用
    execution_context = {"shared_context": shared_context}
else:
    execution_context = {}

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

### ⭐ task_skill.md 必须实例化（MUST）

> **强制要求**：以下操作必须在步骤 4 末尾执行，不可跳过。
> 依据：`.claude/rules/task-folding.mdc` fold-life-001 / fold-life-002 / fold-life-003。

```
1. Read .claude/skills/tasks/templates/task_skill_template.md
2. Read .claude/skills/orchestrator-pro/SKILL.md 中的 τ 元数据定义（第106-129行）
3. 生成任务ID：{YYYYMMDDHHMMSS}_{随机6位数字}
4. 替换模板占位符，生成完整的 task_skill.md
5. Write .claude/skills/tasks/current/task_skill.md
```

生成的 task_skill.md **必须包含以下区域**：
```markdown
# 任务基础信息
（ID、意图、目标、主skill、状态：待执行）

# 子任务（原子skill）列表
（状态列初始值：待执行）

# 主skill完成标准

# 执行日志（实时更新）

# 最终结果汇总

# 三指标元数据（v1.4 三指标版）

## τ 元数据（主标准，决策驱动）
- tau_budget_total: {根据复杂度分配}
- tau_tier: {simple/moderate/complex}
- tau_consumed: {}
- tau_efficiency_score: null

## Token 元数据（辅助标准 A，观测/告警）
- token_budget_total: {根据复杂度分配}
- token_tier: {simple/moderate/complex}
- token_consumed: {}
- token_efficiency_score: null

## Duration 元数据（辅助标准 B，异常检测）
- duration_budget_total: {根据复杂度分配}
- duration_tier: {simple/moderate/complex}
- duration_consumed: {}
- duration_avg_ms_per_token: null

## 通用元数据
- fold_count: 0
- fold_history: []
- stack_hit_rate: 0.0
- pattern_reuse_rate: 0.0

## 异常标记（v1.4 新增）
- anomaly_flags:
  - token_drift: false
  - time_drift: false
  - latency_ratio_high: false

# 共享上下文
（各主skill的上下文写入区域，如 ## scan-object-info 执行上下文）
```

**task_skill.md 生成**：包含 τ 元数据区域（折叠历史、预算分配等）。

---

### 步骤 5：执行流程控制（三指标增强：τ 主驱动 + Token/时间辅助告警）

**初始化**：
```python
# τ 主标准（已在步骤1初始化）
tau_controller.start_step("exec")

# Token 辅助标准初始化（v1.4 新增）
token_tracker = TokenTracker(budget=TOKEN_BUDGETS[tau_controller.tau_tier])
token_tracker.start_task(task_id)

# Duration 辅助标准初始化（v1.4 新增）
duration_tracker = DurationTracker(budget=DURATION_BUDGETS[tau_controller.tau_tier])
duration_tracker.start_task(task_id)

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
                # ===== 写入 task_skill.md：状态变为"已跳过" =====
                # 1. Read tasks/current/task_skill.md
                # 2. Edit 将该原子 skill 的状态列更新为"已跳过"
                # 3. Edit 在执行日记追加：{timestamp}：原子skill[{skill_name}]已跳过，原因：τ 不足
                # 4. Edit 在 τ 元数据追加折叠记录
                # 5. Write tasks/current/task_skill.md
                tau_controller.record_fold(skill["name"], "emergency_tau")
                continue  # 跳过该 skill
            else:
                stream.warning(f"核心 skill 无法跳过，τ 继续消耗")

        # 写入 task_skill.md：状态变为"执行中"（开始执行该原子 skill 时）
        # 1. Read tasks/current/task_skill.md
        # 2. Edit 将该原子 skill 的状态列更新为"执行中"
        # 3. Edit 在执行日记追加：{timestamp}：原子skill[{skill_name}]开始执行
        # 4. Write tasks/current/task_skill.md

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

            # ===== Token 辅助追踪（v1.4 新增）=====
            # 独立于 τ 的 Token 追踪（观测/告警，不驱动决策）
            token_record = token_tracker.record_step(
                step="exec",
                duration_ms=elapsed_ms,
                tokens=tokens,
                skill_name=skill["name"]
            )
            token_pct = token_record["remaining_pct"]
            if token_pct < 0.20:
                stream.warning(f"⚠️ Token 剩余 {token_pct:.1%}，接近预算上限（辅助监控）")
            if token_pct < 0.05:
                stream.warning(f"🚨 Token 严重不足 {token_pct:.1%}，注意上下文窗口限制")

            # ===== Duration 辅助追踪（v1.4 新增）=====
            # 独立于 τ 的时间追踪（异常检测，不驱动决策）
            duration_record = duration_tracker.record_step(
                step="exec",
                elapsed_ms=elapsed_ms,
                tokens=tokens,
                skill_name=skill["name"]
            )
            time_per_token = elapsed_ms / max(tokens, 1)
            # ms/token 异常检测（正常 < 5ms/token）
            if time_per_token > 10.0:
                stream.warning(f"⚠️ 步骤延迟异常：{time_per_token:.1f}ms/token，远超正常值5ms")
            if time_per_token > 20.0:
                stream.warning(f"🚨 严重延迟警告：{time_per_token:.1f}ms/token，可能存在死循环或 API 阻塞")

            # ===== 综合异常检测（v1.4 新增）=====
            # τ 充足但 Token 或时间偏紧 → 潜在未追踪消耗
            if tau_record["remaining_pct"] > 0.50 and (token_pct < 0.30 or duration_record["remaining_pct"] < 0.30):
                stream.warning(f"⚠️ 综合异常：τ 充足但 Token/时间偏紧，可能存在未追踪消耗")

            # ===== τ 主标准预警（不变）=====
            for warning in tau_record.get("warnings", []):
                level = warning["level"]
                if level == "abort":
                    raise StopException(f"τ 预算耗尽，任务终止")
                elif level == "critical":
                    stream.warning(f"🚨 τ 剩余 {tau_record['remaining_pct']:.1%}，即将终止")
                elif level == "warning":
                    stream.warning(f"⚠️ τ 剩余 {tau_record['remaining_pct']:.1%}，谨慎执行")

            stream.skill_success(skill["name"], index, total, result.summary, elapsed_ms)

            # ===== 写入 task_skill.md：原子 skill 执行成功（MUST）=====
            # 依据：.claude/rules/task-folding.mdc fold-life-004 / .claude/rules/skill-stacking.mdc stack-action-001
            # 1. Read tasks/current/task_skill.md
            # 2. Edit 将该原子 skill 的状态列更新为"已完成"
            # 3. Edit 在"执行日志"区域追加：
            #    {timestamp}：原子skill[{skill_name}]执行成功，重试次数{retry_count}
            # 4. Edit 在"共享上下文"区域写入该 skill 的核心输出
            #    （格式：<!-- atomic-skill: {skill_name} -->...<!-- /atomic-skill: {skill_name} -->）
            # 5. Edit 更新三指标元数据：
            #    - τ：tau_consumed、fold_history（已有）
            #    - Token：token_consumed（v1.4 新增）
            #    - Duration：duration_consumed、duration_avg_ms_per_token（v1.4 新增）
            # 6. Write tasks/current/task_skill.md

        except Exception as e:
            will_retry = retry_count < 3
            impact = assess_error_impact(skill, task_skill)
            if impact >= 5:
                raise PauseException(...)
            else:
                # ===== 写入 task_skill.md：原子 skill 执行失败（MUST）=====
                # 依据：.claude/rules/task-folding.mdc fold-life-004
                # 1. Read tasks/current/task_skill.md
                # 2. Edit 将该原子 skill 的状态列更新为"失败"
                # 3. Edit 在"错误日志"区域追加：
                #    {timestamp}：原子skill[{skill_name}]执行失败，原因：{具体原因}，已记录，准备重试
                # 4. Edit 在 τ 元数据更新重试记录
                # 5. Write tasks/current/task_skill.md
                continue_execution()
```

**Co-Design + Skill Stacking 记录**：
```python
co_design["exec"] = {"model": 0.6, "rules": 0.2, "skills": 0.2}
```

**更新 task_skill.md：执行完毕汇总（MUST）**：
> 当所有并行层执行完毕后（或每个并行层之后），写入 Skill Stacking 命中率统计。
> 依据：`.claude/rules/skill-stacking.mdc` stack-action-003 / stack-action-004

```
# 三指标 + Skill Stacking 统计写入 task_skill.md（所有层执行完毕后）
# 1. Read tasks/current/task_skill.md
# 2. Edit 在 "## τ 元数据" 区域更新（主标准）：
#    - tau_consumed: 汇总各步骤 τ 消耗
#    - tau_efficiency_score: 计算效率评分
#    - fold_history: 折叠记录（如有）
# 3. Edit 在 "## Token 元数据" 区域更新（辅助标准 A，v1.4 新增）：
#    - token_consumed: 汇总各步骤 token 消耗
#    - token_efficiency_score: 1 - (token_consumed / token_budget_total)
# 4. Edit 在 "## Duration 元数据" 区域更新（辅助标准 B，v1.4 新增）：
#    - duration_consumed: 汇总各步骤时间消耗（ms）
#    - duration_avg_ms_per_token: 总时间ms / 总token（异常检测基准）
# 5. Edit 在 "## 通用元数据" 区域更新：
#    - stack_hit_rate: {stack_tracker.get_hit_rate()}
#    - stack_hit_details: 汇总各 skill 的命中/未命中
# 6. Edit 在 "## 异常标记" 区域更新（v1.4 新增）：
#    - token_drift: token_efficiency < tau_efficiency - 0.1
#    - time_drift: duration_efficiency < tau_efficiency - 0.1
#    - latency_ratio_high: duration_avg_ms_per_token > 10
# 7. Write tasks/current/task_skill.md
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

### 步骤 7：结果校验（三指标效率评分）

```python
# ===== 三指标效率评分（v1.4 新增）=====
from algorithms import calculate_efficiency_score, aggregate_contributions

# v1.2 已有：偏差量化
verification = verify_completion(task_skill_md)
deviation = calculate_deviation(task_skill_md.get("goal", {}), verification)
task_quality = 1.0 - deviation

# ===== τ 效率评分（主标准，不变）=====
tau_efficiency = tau_controller.calculate_efficiency_score(
    task_quality=task_quality,
    pattern_discount=pattern_results.get("aggregate_discount", 0.0),
    stack_discount=calculate_stack_discount(
        stack_tracker.get_hit_rate(),
        {"STACK_HIT_RATE_WARNING": 0.50}
    )
)

# ===== Token 效率评分（辅助标准 A，v1.4 新增）=====
# 用于：成本分析、上下文窗口压力评估
token_consumed_total = token_tracker.get_total_consumed()
token_efficiency = 1.0 - (token_consumed_total / token_tracker.budget)

# ===== Duration 效率评分（辅助标准 B，v1.4 新增）=====
# 用于：性能基准对比
duration_consumed_total = duration_tracker.get_total_consumed()
duration_efficiency = 1.0 - (duration_consumed_total / duration_tracker.budget)

# ===== 组合效率报告（v1.4 新增）=====
efficiency_composite = {
    "tau_efficiency": round(tau_efficiency, 3),              # 主标准
    "token_efficiency": round(token_efficiency, 3),          # 辅助：成本
    "duration_efficiency": round(duration_efficiency, 3),   # 辅助：性能
    "anomaly_flags": {
        "token_drift": token_efficiency < tau_efficiency - 0.1,
        "time_drift": duration_efficiency < tau_efficiency - 0.1,
        "latency_ratio_high": duration_tracker.get_avg_ms_per_token() > 10.0
    }
}

# Co-Design 贡献汇总
co_design_summary = aggregate_contributions(co_design)

# Pattern 贡献
pattern_contribution = {
    "reuse_rate": pattern_results.get("reuse_rate", 0.0),
    "matched_count": pattern_results.get("matched_count", 0),
    "tau_discount": pattern_results.get("aggregate_discount", 0.0),
}

co_design["validate"] = {"model": 0.4, "rules": 0.4, "skills": 0.2}
tau_controller.record_step(step="validate", duration_ms=elapsed_ms, tokens=tokens)
token_tracker.record_step(step="validate", duration_ms=elapsed_ms, tokens=tokens)
duration_tracker.record_step(step="validate", elapsed_ms=elapsed_ms, tokens=tokens)

# 反思循环（v1.2 已有）
reflection_result = reflection_loop(task_skill_md, max_attempts=3)
```

---

### 步骤 8：结果输出（三指标并行报告）

**输出内容**（v1.4 新增三指标并行格式）：

```
## 执行摘要
任务概览：ID、主skill、执行时长、复杂度、成功率
关键成果：各原子skill的核心产出

## 三指标分解报告（v1.4 新增）

### τ 分解（主标准 — 决策驱动）
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

### Token 分解（辅助标准 A — 成本/上下文窗口）
   总消耗: 45000 / 80000 (56.3%)
   ├─ intent:     4800 (10.7%) [预算 8000]
   ├─ match:     7200 (16.0%) [预算 12000]
   ├─ plan:       2400 (5.3%) [预算 4000]
   ├─ exec:    25200 (56.0%) [预算 48000]
   ├─ validate:   3000 (6.7%) [预算 4000]
   └─ archive:    2400 (5.3%) [预算 4000]
   效率评分: 0.78 (良好)  🟡
   预估成本: $0.45（辅助参考）

### Duration 分解（辅助标准 B — 延迟/性能基准）
   总消耗: 18000ms / 30000ms (60.0%)
   ├─ intent:     1920ms
   ├─ match:     2880ms
   ├─ plan:       960ms
   ├─ exec:    10080ms
   ├─ validate:  1200ms
   └─ archive:    960ms
   效率评分: 0.65 (中等)  🟡
   平均延迟: 0.40ms/token（正常 < 5ms/token）

### 综合指标
   上下文命中率: 68%
   Co-Design: Model=45% / Rules=30% / Skills=25%

### 异常标记（v1.4 新增）
   ⚠️ token_drift：Token 效率(0.78) < τ 效率(0.82)，Token 消耗偏高
   ✓ latency_ratio：0.40ms/token，正常
   ✓ time_drift：无异常

## 反思日志（如有）
[反思内容]
```

```python
co_design["archive"] = {"model": 0.1, "rules": 0.6, "skills": 0.3}

# ===== 三指标记录（v1.4 新增）=====
tau_controller.record_step(step="archive", duration_ms=elapsed_ms, tokens=0)
token_tracker.record_step(step="archive", duration_ms=elapsed_ms, tokens=0)
duration_tracker.record_step(step="archive", elapsed_ms=elapsed_ms, tokens=0)

# 生成三指标分解报告（v1.4）
tau_report = tau_controller.generate_tau_report()      # 主标准报告
token_report = token_tracker.generate_token_report()   # 辅助标准 A 报告（v1.4 新增）
duration_report = duration_tracker.generate_duration_report()  # 辅助标准 B 报告（v1.4 新增）
print(tau_report)
print(token_report)
print(duration_report)
print(efficiency_composite)  # 包含异常标记
```

---

### 步骤 9：任务归档（τ 增强：Pattern 存储）

**处理**（v1.2 已有 + Pattern 存储）：

### ⭐ 归档操作（MUST，不可跳过）
> 依据：`.claude/rules/task-folding.mdc` fold-life-009 / fold-life-010 / fold-life-011

```
# ===== 归档任务（skill-design.md 步骤 9）=====
# 0. 【固化文件路径记录】在 mv 之前完成（固化文件路径必须在归档后永久保存）
#    依据：.claude/rules/task-folding.mdc fold-life-010b / fold-life-010c
#    Read tasks/current/task_skill.md
#    Edit 在 "## 最终结果汇总" 区域追加或更新：
#    ### 可固化文档
#    - [文件名, 绝对路径, 文档类型, 生成时间]
#    例：
#      - CODE_STYLE.md | {项目根目录}/CODE_STYLE.md | 代码规范文档 | {当前时间}
#      - .env.example | {项目根目录}/.env.example | 环境变量示例 | {当前时间}
#    Write tasks/current/task_skill.md
#
# 1. Read tasks/current/task_skill.md → 获取任务状态和归档路径
# 2. Bash mkdir -p tasks/history/YYYY-MM/（如果目录不存在）
# 3. Bash mv tasks/current/task_skill.md tasks/history/YYYY-MM/task_skill_{任务ID}.md
#    → 固化文件路径已保存在文件内，可被后续任务读取
# 4. Read tasks/history/YYYY-MM/月度任务索引.md（如存在）
# 5. Edit 在月度任务索引末尾追加新任务条目（含固化文件路径）：
#    - 任务ID、归属主skill、创建时间、完成时间、执行摘要、归档时间
#    - 固化文档路径（如有）
# 6. 如果月度任务索引不存在：
#    Read .claude/skills/tasks/templates/月度任务索引模版.md
#    Write tasks/history/YYYY-MM/月度任务索引.md
# 7. 固化文档提示（可选，用户确认迁移）：
#    "📁 可固化文档已检测到，请手动移至项目目录：{文件列表}"
#    → 注意：固化文件路径已记录在 tasks/history/YYYY-MM/task_skill_{任务ID}.md
#      后续任务可读取该文件获取固化文档路径
```

> **固化文件路径永久保存机制**：
> - 固化文件路径在步骤 0 写入 task_skill.md 的"最终结果汇总 → 可固化文档"区域
> - 步骤 3 将文件移动到 history/ 后，固化路径随文件一起归档
> - 后续任务需要固化文档时：
>   1. Read `tasks/history/YYYY-MM/task_skill_{任务ID}.md`
>   2. 在"最终结果汇总 → 可固化文档"区域找到固化文件路径列表
>   3. 使用绝对路径引用固化文档（如复制到当前项目）

### ⭐ Pattern 存储（v1.4 三指标扩展）

```
# ===== Pattern 存储（v1.4 三指标扩展）=====
# 如果 validation_report.all_passed 且 deviation < 0.2，则存入模式库
# 提取任务特征：
#   - domain_action: {intent.domain}_{intent.action}
#   - skill_sequence: [atomic_skill_1, atomic_skill_2, ...]
#   - complexity_band: {low/mid/high}
#   - tau_budget: {actual_consumed}           # 主标准（保留）
#   - token_budget: {actual_token_consumed}    # 辅助标准 A（v1.4 新增）
#   - duration_ms: {actual_duration_ms}       # 辅助标准 B（v1.4 新增）
#   - efficiency_composite: {tau/tkn/dur三效率}  # 异常标记参考（v1.4 新增）
# 存入 .claude/skills/patterns/{category}/{pattern_id}.md
# 标注成熟度：首次=experimental，≥5次=mature
```

> **归档后清理**：归档完毕，current/ 目录应为空，task_skill.md 已移至 history/。当前任务结束，不再回写 current/。

---

## 4. 关键增强点汇总

| 步骤 | v1.2 功能 | τ 增强点 | v1.1 新增 | v1.4 新增 |
|------|---------|---------|---------|---------|
| 0 | — | — | 复杂度分流（< 4 降级轻量路径）| — |
| 1 | 意图识别 | τ 预算初始化 + Co-Design | +复杂度分流路由 | +Token/Time 预算初始化 |
| 2 | 历史检索 | **双轨并行**：+Pattern Mining ≥ 0.6 | — | — |
| 3 | 技能匹配 | τ 效率加权 + Co-Design 显式化 | — | — |
| 4 | 任务生成 | **+Task Folding 折叠** | — | — |
| 5 | 执行控制 | **+τ 实时监控 + 紧急折叠 + Stack 追踪** | — | **+Token 辅助告警 + 时间异常检测（ms/token）+综合异常检测** |
| 6 | 任务恢复 | +τ 元数据恢复 | — | — |
| 7 | 结果校验 | **+τ 效率评分 + Co-Design 汇总** | — | **+Token/Duration 效率评分 + 异常标记** |
| 8 | 结果输出 | **+τ 分解报告** | — | **+三指标并行报告 + Token/Duration 分解 + 异常标记** |
| 9 | 任务归档 | **+Pattern 模式存储** | — | **+三指标元数据存入模式库** |

---

## 5. 决策点汇总

| 决策点 | 触发位置 | 触发条件 | 选项数 | 默认行为 |
|--------|---------|---------|--------|---------|
| D1 τ 档位 | 步骤 1 | complexity_score | 3 | 根据复杂度分配 |
| D2 Task Folding | 步骤 4 | τ_remaining<30% + depth>3 | 2 | 折叠 |
| D3 Pattern 复用 | 步骤 2 | similarity ≥ 0.6 | 2 | 复用 |
| D4 紧急折叠 | 步骤 5 | τ_remaining < skill_τ×50% | 3 | 跳过/降级/继续 |
| D5 τ 借位 | 任意步骤 | step τ 超预算 | 2 | 从低优先级借 |
| D6 反思失败 | 步骤 7 | 3次反思后偏差≥0.2 | 3 | 输出当前结果 |
| D7 可固化文档 | 步骤 9 | 检测到可固化文档 | 3 | 仅索引 |
| D8 Token 紧张（辅助）| 步骤 5 | token_remaining < 20% | 1 | 告警（不阻断，仅观测） |
| D9 延迟异常（辅助）| 步骤 5 | ms/token > 10ms | 1 | 告警（不阻断，仅观测） |
| D10 综合异常（辅助）| 步骤 5 | τ>50% 但 token/dur<30% | 1 | 告警（不阻断，仅提示） |

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

## 8. 与 orchestrator 的关系（v1.3 真正实现统一入口）

**入口统一**：orchestrator-pro 是所有任务的唯一入口（`/orchestrator-pro` 和 `/orchestrator` 均路由至此）。

**复杂度分流（v1.1 新增，v1.3 真正实现）**：
- complexity < 4：**orchestrator-pro 读取 `orchestrator/SKILL.md` 并执行**（显式 Read + 执行，非内联）
- complexity ≥ 4：使用完整 τ 增强 9 步流程（Task Folding + Pattern Mining + Skill Stacking + Co-Design）

**完全继承**：orchestrator v1.2 的 9 步流程、Token 追踪、文件锁、流式输出等所有功能
**叠加增强**：τ 测量、Task Folding、Pattern Mining、Skill Stacking、Co-Design 均以**叠加**方式实现，不破坏轻量路径

**orchestrator 的角色（v1.3）**：`orchestrator/` 不再作为独立入口，降级为 **orchestrator-pro 的轻量执行模块（Lightweight Execution Module）**：
- atomic-skills/ 已清空，仅保留 SKILL.md 作为 9 步流程定义
- complexity < 4 时由 orchestrator-pro 显式读取并执行
- 不再有独立的 slash command 入口（`/orchestrator` 由 orchestrator-pro 接管）

---

**版本**: 1.6
**最后更新**: 2026-06-05
**理论基础**: 华为韬定律（何庭波，2026）+ 三指标体系（τ 为主 + Token/时间辅助）
**父版本**: Orchestrator v1.2