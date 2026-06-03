---
name: execution-controller
description: 执行控制（τ 增强版）— 增加 τ 实时监控、动态折叠触发、Skill Stacking 命中追踪
---

# Execution Controller 原子 Skill（τ 增强版）

## 版本历史
- v1.0 (2026-06-02): 基于 v1.2 增强，增加 τ 实时监控、紧急折叠、Skill Stacking

---

## 1. 核心定位

继承 v1.2 execution-controller 的完整逻辑（并行层执行、流式输出、Token 追踪、5 维错误评估），增加：
- **τ 实时监控**：每个 skill 前后记录 τ 消耗，动态预警
- **紧急折叠**：τ 不足时跳过可选 skill
- **Skill Stacking 追踪**：记录上下文命中/未命中
- **Co-Design 贡献追踪**：记录各 skill 的三层贡献

---

## 2. τ 增强的执行循环

```python
def execute_with_tau(tau_controller: TauController,
                      stack_tracker: StackHitTracker,
                      parallel_layers: list,
                      task_skill_md: str) -> dict:
    """
    τ 增强版执行控制
    """
    for layer_idx, layer in enumerate(parallel_layers):
        for skill in layer:
            # ===== τ 增强：每个 skill 执行前 =====
            skill_tau_estimate = skill.get("tau_estimated", 500)

            # 1. 紧急折叠判断
            emergency = tau_controller.should_emergency_fold(skill_tau_estimate)
            if emergency["emergency_fold"] and not skill.get("is_core"):
                stream.skill_skip(
                    skill["name"],
                    reason=f"τ 不足，跳过可选 skill（{emergency['reason']}）"
                )
                update_task_skill_status(task_skill_md, skill["name"], "skipped")
                tau_controller.record_fold(skill["name"], reason="emergency_tau")
                continue

            # 2. Co-Design 贡献度记录
            co_design = calculate_contributions("exec", {"skill_called": True})

            # 3. 执行 skill
            start_time = time.time()
            stream.skill_start(skill["name"], ...)

            try:
                result = execute_atomic_skill(skill)
                elapsed_ms = (time.time() - start_time) * 1000
                tokens = result.llm_usage.total if hasattr(result, "llm_usage") else 0

                # ===== τ 增强：每个 skill 完成后 =====
                tau_record = tau_controller.record_step(
                    step="exec",
                    duration_ms=elapsed_ms,
                    tokens=tokens
                )
                # Skill Stacking 命中追踪（示例）
                if result.shared_context_hit:
                    stack_tracker.record_read(skill["name"], "project_context", hit=True)
                else:
                    stack_tracker.record_read(skill["name"], "project_context", hit=False)

                # τ 预警
                for warning in tau_record.get("warnings", []):
                    stream.warning(f"τ {warning['level']}: {warning['message']}")

                stream.skill_success(skill["name"], ..., result.summary)
                update_task_skill_status(task_skill_md, skill["name"], "completed", result)

            except Exception as e:
                # 处理错误（继承 v1.2 的 5 维评估）
                impact = assess_error_impact(skill, task_skill)
                if impact >= 5:
                    raise PauseException(...)
                else:
                    record_error(task_skill_md, skill, e)
                    continue_execution()
```

---

## 3. Skill Stacking 增强

```python
def update_task_skill_with_stack_context(task_skill_md: str,
                                          skill_results: dict,
                                          stack_tracker: StackHitTracker):
    """
    Skill Stacking 增强：更新 task_skill.md 的共享上下文区域
    每个 skill 执行后，将输出写入共享上下文
    下游 skill 可直接从共享上下文读取，避免重复解析
    """
    stack_area = {
        "hit_rate": stack_tracker.get_hit_rate(),
        "total_reads": stack_tracker.total_read_attempts,
        "shared_hits": stack_tracker.shared_context_hits,
        "reparse_skills": list(stack_tracker.get_reparse_skills().keys()),
    }
    append_to_task_skill(task_skill_md, "## Skill Stacking 元数据\n", stack_area)
```

---

## 4. 完成标准

1. 每个 skill 执行后 τ 被正确记录
2. τ 预警在 80%/95%/100% 时正确触发
3. 紧急折叠正确跳过非核心可选 skill
4. Skill Stacking 命中率被追踪和记录

---

## 5. 原子 Skill 位置

`.claude/skills/orchestrator-pro/atomic-skills/execution-controller/SKILL.md`