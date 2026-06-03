---
name: tau-controller
description: τ 控制核心 — 预算分配、τ 测量、折叠决策、效率评分。贯穿 Orchestrator Pro 全程的横切控制器
impl_status: design_spec  # 设计规范文档，预留实现。未包含可执行代码，待后续工程化落地
---

# Tau Controller 原子 Skill

## 版本历史
- v1.0 (2026-06-02): 初始实现，基于华为韬定律 τ 理论

---

## 1. 核心定位

**τ-Controller** 是 Orchestrator Pro 的性能控制核心，基于华为韬定律原理：
> 性能 ∝ 1/τ

作为横切关注点，τ-Controller **不破坏 9 步流程语义**，而是在每个步骤前后嵌入 τ 测量和决策逻辑。

**三大核心职责**：
1. **τ 预算管理**：初始化、分配、监控、预警
2. **τ 测量记录**：每个步骤后精确测量 τ 消耗
3. **τ 驱动的折叠决策**：在必要时触发 Task Folding

---

## 2. 原子能力

| 能力名称 | 功能描述 | 调用时机 |
|---------|---------|---------|
| `tau-allocation` | 根据复杂度档位分配 τ 预算 | 步骤 1 完成后 |
| `tau-measurement` | 记录每个步骤的 τ 消耗（duration + tokens） | 每个步骤后 |
| `tau-monitoring` | 实时监控，80%/95%/100% 预警和终止 | 步骤 5 中 |
| `fold-trigger` | 评估是否触发 Task Folding | 步骤 4 前，步骤 5 中 |
| `budget-rebalance` | 动态借位（低优先级 → 高优先级） | τ 超支时 |
| `efficiency-report` | 计算效率评分，生成 τ 分解报告 | 步骤 8 中 |

---

## 3. 数据结构

### 3.1 τ 元数据

```python
class TauMetadata:
    task_id: str
    tier: "simple" | "moderate" | "complex"
    budget_total: float
    allocations: dict[str, float]      # {"intent": 1500, "exec": 9000, ...}
    consumed: dict[str, float]         # 各步骤已消耗
    borrowed: dict[str, float]         # 借位记录
    fold_count: int                     # 折叠次数
    fold_history: list[FoldRecord]      # 折叠历史
    pattern_discount: float              # Pattern 复用折扣
    stack_discount: float               # Stack 命中折扣
    efficiency_score: float             # 最终效率评分
    step_timestamps: dict[str, str]    # 各步骤时间戳
```

### 3.2 τ 预算档位

| 档位 | 复杂度 | 总预算 | intent | match | plan | exec | validate | archive |
|------|--------|--------|--------|-------|------|------|----------|---------|
| simple | 1-3 | 5,000 | 500 | 750 | 250 | 3,000 | 250 | 250 |
| moderate | 4-6 | 15,000 | 1,500 | 2,250 | 750 | 9,000 | 750 | 750 |
| complex | 7-10 | 50,000 | 5,000 | 7,500 | 2,500 | 30,000 | 2,500 | 2,500 |

---

## 4. 核心 API

### 4.1 初始化与预算分配

```python
def allocate_budget(complexity_score: int, config: dict) -> TauMetadata:
    """
    根据复杂度分配 τ 预算
    complexity_score: 1-10
    """
    if complexity_score <= 3:
        tier = "simple"
    elif complexity_score <= 6:
        tier = "moderate"
    else:
        tier = "complex"

    budgets = config["TAU_BUDGETS"][tier]
    return TauMetadata(
        tier=tier,
        budget_total=budgets["total"],
        allocations=budgets.copy(),
        consumed={k: 0.0 for k in budgets},
        fold_count=0,
        fold_history=[],
    )
```

### 4.2 τ 测量

```python
def measure_step(step: str,
                 duration_ms: float,
                 tokens: int) -> float:
    """
    τ = duration_ms × 0.5 + tokens × 0.001
    """
    return duration_ms * 0.5 + tokens * 0.001


def record_step(meta: TauMetadata,
                step: str,
                duration_ms: float,
                tokens: int) -> dict:
    """
    记录步骤 τ 消耗，更新元数据
    """
    tau = measure_step(duration_ms, tokens)

    if step not in meta.consumed:
        meta.consumed[step] = 0.0

    meta.consumed[step] += tau

    # 计算剩余
    remaining_total = meta.budget_total - sum(meta.consumed.values())
    remaining_step = meta.allocations[step] - meta.consumed.get(step, 0.0)
    remaining_pct = remaining_total / meta.budget_total

    # 预警检查
    warnings = []
    if remaining_pct <= 0.0:
        warnings.append({"level": "abort", "message": f"τ 预算已耗尽，任务终止"})
    elif remaining_pct <= 0.05:
        warnings.append({"level": "critical", "message": f"τ 剩余 {remaining_pct:.1%}，即将终止"})
    elif remaining_pct <= 0.20:
        warnings.append({"level": "warning", "message": f"τ 剩余 {remaining_pct:.1%}，谨慎执行"})

    return {
        "tau": tau,
        "step": step,
        "step_consumed": meta.consumed.get(step, 0.0),
        "step_remaining": remaining_step,
        "total_consumed": sum(meta.consumed.values()),
        "total_remaining": remaining_total,
        "remaining_pct": remaining_pct,
        "warnings": warnings,
    }
```

### 4.3 折叠触发判断

```python
def should_fold(meta: TauMetadata,
               current_depth: int,
               fold_triggers: dict) -> dict:
    """
    判断是否需要 Task Folding
    触发条件（需同时满足）：
    1. τ_remaining < 30%（或自定义阈值）
    2. 任务深度 > depth_threshold
    3. 折叠次数 < max_fold_depth
    """
    total_remaining_pct = (meta.budget_total - sum(meta.consumed.values())) / meta.budget_total
    ft = fold_triggers

    can_fold = (
        total_remaining_pct < ft["tau_remaining_pct"]
        and current_depth > ft["depth_threshold"]
        and meta.fold_count < ft["max_fold_depth"]
    )

    reason = None
    if total_remaining_pct < ft["tau_remaining_pct"]:
        reason = f"τ_remaining={total_remaining_pct:.1%} < {ft['tau_remaining_pct']:.1%}"
    elif current_depth > ft["depth_threshold"]:
        reason = f"depth={current_depth} > {ft['depth_threshold']}"
    elif meta.fold_count >= ft["max_fold_depth"]:
        reason = f"fold_count={meta.fold_count} >= {ft['max_fold_depth']}（已达上限）"

    return {
        "should_fold": can_fold,
        "trigger": reason,
        "fold_count": meta.fold_count,
        "max_depth": ft["max_fold_depth"],
        "tau_remaining_pct": total_remaining_pct,
    }


def should_emergency_fold(meta: TauMetadata,
                          next_skill_tau: float) -> dict:
    """
    紧急折叠判断（步骤 5 中实时触发）
    当下一个 skill 的 τ 消耗 > 剩余 τ 的 50% 时，考虑跳过
    """
    total_remaining = meta.budget_total - sum(meta.consumed.values())
    if next_skill_tau > total_remaining * 0.5:
        return {
            "emergency_fold": True,
            "reason": f"next_skill_τ={next_skill_tau:.0f} > remaining_τ×50%={total_remaining*0.5:.0f}",
            "suggestion": "skip_optional",
        }
    return {"emergency_fold": False}
```

### 4.4 τ 效率评分

```python
def calculate_efficiency_score(meta: TauMetadata,
                                task_quality: float) -> float:
    """
    τ_efficiency_score = (task_quality × pattern_discount × stack_discount) / (consumed / budget)

    评分标准：
    > 0.8：优秀（绿色）
    0.5-0.8：合格（黄色）
    < 0.5：不合格（红色）
    """
    total_consumed = sum(meta.consumed.values())
    total_budget = meta.budget_total
    utilization = total_consumed / total_budget if total_budget > 0 else 1.0

    quality_factor = task_quality * (1 - meta.pattern_discount) * (1 - meta.stack_discount)
    score = quality_factor / utilization if utilization > 0 else 0.0

    meta.efficiency_score = score
    return score


def get_efficiency_grade(score: float) -> str:
    if score > 0.8:
        return "优秀"
    elif score >= 0.5:
        return "合格"
    else:
        return "不合格"
```

### 4.5 τ 分解报告

```python
def generate_tau_report(meta: TauMetadata) -> str:
    """
    生成 τ 分解报告
    """
    total_consumed = sum(meta.consumed.values())
    total_budget = meta.budget_total
    utilization = total_consumed / total_budget if total_budget > 0 else 0.0

    grade = get_efficiency_grade(meta.efficiency_score)

    lines = [
        "## τ 分解报告",
        f"   总消耗: {total_consumed:.0f} / {total_budget:.0f} ({utilization:.1%})",
    ]

    step_names = {
        "intent": "意图识别",
        "match": "技能匹配",
        "plan": "任务规划",
        "exec": "执行控制",
        "validate": "结果校验",
        "archive": "任务归档",
    }

    for step, name in step_names.items():
        c = meta.consumed.get(step, 0.0)
        a = meta.allocations.get(step, 0.0)
        pct = c / total_consumed if total_consumed > 0 else 0.0
        alloc_pct = a / total_budget if total_budget > 0 else 0.0
        flag = "⚠️" if c > a * 1.1 else ""
        lines.append(f"   ├─ {name:<6}: {c:>6.0f} ({pct:.1%}) [预算{a:.0f}] {flag}")

    lines.append(f"   效率评分: {meta.efficiency_score:.2f} ({grade})")
    lines.append(f"   折叠次数: {meta.fold_count}")
    if meta.fold_history:
        for f in meta.fold_history:
            lines.append(f"   └─ 折叠: {f.get('folded_skills', [])} → τ 节省 {f.get('tau_savings', 0):.1%}")
    else:
        lines.append(f"   └─ 折叠: 无")

    lines.append(f"   模式折扣: {meta.pattern_discount:.0%} τ 节省")
    lines.append(f"   堆叠折扣: {meta.stack_discount:.0%} τ 节省")

    return "\n".join(lines)
```

---

## 5. 嵌入 Orchestrator 流程

```
Orchestrator Pro 9步流程中的 τ 嵌入点：

步骤1完成后  →  tau-controller.allocate_budget()
步骤2中      →  tau-controller.record_step("intent", ...)
步骤3中      →  tau-controller.record_step("match", ...)
步骤4前      →  tau-controller.should_fold() → 触发 Task Folding
步骤5前      →  tau-controller.record_step("plan", ...)
步骤5中      →  tau-controller.record_step("exec", ...) [每次 skill 后]
步骤5中      →  tau-controller.should_emergency_fold() [每个 skill 前]
步骤7前      →  tau-controller.record_step("validate", ...)
步骤8前      →  tau-controller.record_step("archive", ...)
步骤8中      →  tau-controller.calculate_efficiency_score()
步骤8中      →  tau-controller.generate_tau_report()
```

---

## 6. 完成标准

1. τ 预算在步骤 1 后正确分配到 6 个步骤
2. 每个步骤后 τ 消耗被精确记录
3. 80%/95%/100% 预警在达到阈值时触发
4. Task Folding 在满足条件时被正确触发
5. 最终效率评分和分解报告正确生成
6. 所有折叠历史被记录到 fold_history

---

## 7. 注意事项

- τ-Controller 是**横切关注点**，不生成独立输出，而是更新 task_skill.md 中的 τ 元数据区域
- τ 测量公式：`τ = duration_ms × 0.5 + tokens × 0.001`（可配置权重）
- 紧急折叠（emergency_fold）只跳过可选 skill，核心 skill（is_core=True / user_required=True）不可跳过
- τ 效率评分的 task_quality 参数由 result-validator 传入（1.0 - deviation）

---

## 原子 Skill 位置

`.claude/skills/orchestrator-pro/atomic-skills/tau-controller/SKILL.md`