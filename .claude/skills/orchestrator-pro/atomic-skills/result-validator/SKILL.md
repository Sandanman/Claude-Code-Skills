---
name: result-validator
description: 结果校验（τ 增强版）— 增加 τ 效率评分、Co-Design 贡献度报告
impl_status: design_spec  # 设计规范文档，预留实现。未包含可执行代码，待后续工程化落地
---

# Result Validator 原子 Skill（τ 增强版）

## 版本历史
- v1.0 (2026-06-02): 基于 v1.2 增强，增加 τ 效率评分、Pattern/Stack 贡献度报告

---

## 1. 核心定位

继承 v1.2 result-validator 的完整逻辑（完成标准验证、偏差量化、反思循环），增加：
- **τ 效率评分**：计算 τ_efficiency_score = (quality × pattern_discount × stack_discount) / utilization
- **Co-Design 贡献度汇总**：汇总各步骤三层贡献度
- **Pattern 贡献度报告**：记录模式复用带来的 τ 节省

---

## 2. τ 增强的校验流程

```python
def verify_completion_with_tau(task_skill_md: str,
                                 tau_controller: TauController,
                                 pattern_results: dict,
                                 co_design_results: dict) -> dict:
    """
    τ 增强版结果校验
    """
    # Step 1: 完成标准验证（继承 v1.2）
    verification = verify_completion(task_skill_md)
    deviation = calculate_deviation(task_skill_md.get("goal", {}), verification)

    # Step 2: τ 效率评分（新增）
    task_quality = 1.0 - deviation  # quality = 1 - deviation
    efficiency_score = tau_controller.calculate_efficiency_score(
        task_quality=task_quality,
        pattern_discount=pattern_results.get("aggregate_discount", 0.0),
        stack_discount=pattern_results.get("stack_discount", 0.0)
    )

    # Step 3: Co-Design 贡献度汇总（新增）
    co_design_summary = aggregate_contributions(co_design_results)

    # Step 4: 反思循环（继承 v1.2，最多 3 次）
    reflection_result = reflection_loop(task_skill_md, max_attempts=3)

    return {
        "all_passed": verification["all_passed"],
        "deviation": deviation,
        "tau_efficiency_score": efficiency_score,
        "tau_efficiency_grade": get_efficiency_grade(efficiency_score),
        "co_design_summary": co_design_summary,
        "pattern_contribution": {
            "reuse_rate": pattern_results.get("reuse_rate", 0.0),
            "matched_count": pattern_results.get("matched_count", 0),
            "tau_discount": pattern_results.get("aggregate_discount", 0.0),
        },
        "reflection_result": reflection_result,
        "success": verification["all_passed"] and deviation < 0.2,
    }
```

---

## 3. τ 效率分级

```python
def get_efficiency_grade(score: float) -> str:
    if score > 0.8:
        return "优秀"  # 🟢
    elif score >= 0.5:
        return "合格"  # 🟡
    else:
        return "不合格"  # 🔴
```

---

## 4. 继承自 v1.2 的完整逻辑

v1.2 的所有功能（逐项验证、偏差量化、反思触发、300 字日志）完全保留。

---

## 5. 原子 Skill 位置

`.claude/skills/orchestrator-pro/atomic-skills/result-validator/SKILL.md`