---
name: result-validator
description: 校验完成标准、量化结果偏差并执行有限反思循环
impl_status: design_spec
---

# Result Validator 原子 Skill

## 1. 核心定位

读取任务文件和各原子 Skill 的执行结果，逐项验证完成标准，计算目标与实际结果的偏差，并在必要时执行有限反思。

## 2. 校验流程

```python
def verify_completion(task_skill_md):
    verification = verify_completion_criteria(task_skill_md)
    deviation = calculate_deviation(task_skill_md.get("goal", {}), verification)
    reflection_result = reflection_loop(task_skill_md, max_attempts=3)
    return {
        "all_passed": verification["all_passed"],
        "deviation": deviation,
        "reflection_result": reflection_result,
        "success": verification["all_passed"] and deviation < 0.2,
    }
```

## 3. 输出要求

校验结果必须说明：

- 每项完成标准是否通过。
- 未通过项及原因。
- 偏差数值。
- 反思结果和重试建议。
- 最终成功或失败结论。

## 4. 完成标准

- 主 Skill 和原子 Skill 的完成标准均已检查。
- 偏差计算有明确依据。
- 反思循环最多执行 3 次。
- 结果可供 `task-archiver` 判断归档状态。
