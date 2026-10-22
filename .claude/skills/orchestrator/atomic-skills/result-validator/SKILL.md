---
name: result-validator
description: 按 L0/L1/L2 分级校验任务结果；仅在失败、高风险或用户要求时执行反思
impl_status: design_spec
---

# Result Validator 原子 Skill

## 1. 核心定位

读取当前结果和必要的任务上下文，按执行路径执行最低必要校验。Fast Path 使用 L0，Durable Path 使用 L1；L2 反思只在校验失败、高风险或用户明确要求时触发。

## 2. 校验级别

### L0：Fast Path 基础校验

检查：

- 预期输出存在且非空。
- 没有明显错误或未处理异常。
- 主 Skill 的最低完成标准已满足。

L0 不读取历史、不计算复杂偏差、不执行反思，也不创建任务归档。

### L1：Durable Path 目标校验

检查：

- 主 Skill 和已执行原子 Skill 的完成标准。
- 关键输出与用户目标的一致性。
- 必要时计算有明确依据的偏差。
- 错误、风险和恢复状态。

没有量化目标时，偏差返回“不适用”，不得虚构数值。

### L2：条件反思校验

仅在以下任一条件成立时触发：

- L1 未通过。
- 任务风险等级为 `high`。
- 用户明确要求反思或深度复盘。

默认反思次数为 0，触发后最多 3 次；未经用户授权不得突破上限。

## 3. 执行流程

```python
def verify_result(task, level="L1"):
    if level == "L0":
        return validate_minimum_output(task)

    verification = verify_completion_criteria(task)
    criteria = task.get("goal", {}).get("criteria", [])
    deviation = calculate_deviation(task, verification) if criteria else None
    passed = verification["all_passed"] and (deviation is None or deviation < 0.2)
    result = {
        "level": level,
        "passed": passed,
        "failed_criteria": verification.get("failed_items", []),
        "deviation": deviation,
        "risk_notes": verification.get("risk_notes", []),
        "needs_resume": not passed,
        "reflection_attempts": 0,
        "recommended_next_action": "archive" if passed else "reflect",
    }
    if should_reflect(result, task):
        result = reflection_loop(task, max_attempts=3, initial_result=result)
    return result
```

## 4. 完成标准

- Fast Path 完成 L0 校验，不执行无关历史和反思。
- Durable Path 完成 L1 校验，必要时记录偏差或“不适用”。
- L2 只在规定条件下触发，反思次数可恢复且不突破上限。
- 输出包含 `passed`、`failed_criteria`、`risk_notes`、`needs_resume`、`reflection_attempts` 和 `recommended_next_action`。
- 校验失败时不得报告成功，必须给出未通过项和下一步。
