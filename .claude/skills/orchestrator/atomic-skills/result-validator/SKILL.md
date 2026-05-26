---
name: result-validator
description: 结果校验与反思 — 验证所有完成标准，量化偏差，偏差>=0.2时触发反思（最多3次），输出验证报告和反思日志
---

# Result Validator 原子Skill

## 概述

结果校验与反思是 Orchestrator 编排链路的第七环，在所有原子skill执行完毕后触发。此skill对 task_skill.md 中声明的每条完成标准进行逐项验证，计算加权偏差值，当偏差 >= 0.2 时进入反思流程（最多3次）。反思过程中对问题进行分类，生成调整方案（补充同类型skill / 调整执行顺序），最终输出包含 all_passed、deviation、reflection_log、success 字段的验证报告。反思日志控制在300字内。

## 核心能力

- 完成标准逐项验证：对 task_skill.md 中的每条标准进行 pass/fail 判断
- 偏差量化计算：基于目标达成度计算加权偏差（0.0 = 完全达标，1.0 = 完全失败）
- 反思触发：偏差 >= 0.2 时自动触发反思流程，最多3次
- 问题分类：将问题归类为缺失步骤、顺序错误、依赖未满足、质量不达标等
- 调整方案生成：为反思生成可落地的调整建议（补充skill / 重排序 / 参数调优）
- 反思日志压缩：关键问题+根因+优化方向，总计不超过300字

## 输入

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| task_skill_md | string | 是 | 执行后的 task_skill.md 文件路径（含所有skill结果） |
| skill_results | object | 是 | 各原子skill的执行结果（key: skill_name, value: result） |

## 输出

```json
{
  "task_id": "TASK_20260522_abc1",
  "validation_timestamp": "2026-05-22T14:30:00+08:00",
  "all_passed": false,
  "deviation": 0.25,
  "deviation_grade": "中等偏差",
  "total_standards": 4,
  "passed_standards": 3,
  "failed_standards": 1,
  "standard_results": [
    {"standard": "创建MeetingCard组件", "passed": true, "evidence": "文件已创建于src/components/Meeting"},
    {"standard": "支持响应式布局", "passed": true, "evidence": "使用Tailwind响应式类"},
    {"standard": "包含单元测试", "passed": false, "evidence": "测试文件未生成"}
  ],
  "reflection_triggered": true,
  "reflection_attempts": 2,
  "reflection_log": {
    "key_problem": "测试环节缺失，导致整体完成度不足",
    "root_cause": "task-generator未将测试类skill纳入执行计划",
    "adjustment": "补充test-generation原子skill，调整执行顺序在代码生成之后",
    "max_chars": 298
  },
  "final_plan": {
    "adjustments": ["补充 test-generation skill", "在代码生成后插入测试执行"],
    "re_execution_required": true
  },
  "success": false
}
```

## 执行逻辑

**校验流程**：
```python
def verify_completion(task_skill_md):
    task = parse_task_skill(task_skill_md)
    results = []
    for standard in task.completion_standards:
        passed, evidence = verify_standard(standard, task.skill_results)
        results.append({"standard": standard, "passed": passed, "evidence": evidence})

    all_passed = all(r["passed"] for r in results)
    deviation = calculate_deviation(task.goal, results)
    trigger_reflection = deviation >= 0.2
    return {
        "all_passed": all_passed,
        "deviation": deviation,
        "standard_results": results,
        "trigger": trigger_reflection
    }

def calculate_deviation(goal, results):
    # 加权偏差计算
    if not results:
        return 1.0
    weights = [1.0] * len(results)  # 可根据标准重要性调整权重
    total_weight = sum(weights)
    deviations = []
    for r, w in zip(results, weights):
        deviations.append(0.0 if r["passed"] else 1.0 * w)
    return sum(deviations) / total_weight
```

**偏差分级**：
| 偏差范围 | 分级 | 处理方式 |
|---------|------|---------|
| 0.0 - 0.1 | 优秀 | 直接通过 |
| 0.1 - 0.2 | 合格 | 记录但不触发反思 |
| 0.2 - 0.5 | 中等偏差 | 触发反思，最多3次 |
| 0.5 - 1.0 | 严重偏差 | 触发反思，3次后失败则放弃 |

**反思循环**：
```python
def reflection_loop(task_skill_md, max_attempts=3):
    for attempt in range(1, max_attempts + 1):
        stream.reflection_progress(attempt, max_attempts, issue=detect_issue(task_skill_md))

        # 问题分类
        issue_type = classify_issue(task_skill_md)
        # 生成调整方案
        adjustment = generate_adjustment(issue_type, task_skill_md)
        # 执行调整（补充skill / 重排序 / 调整参数）
        apply_adjustment(task_skill_md, adjustment)

        # 重新校验
        verify_again = verify_completion(task_skill_md)
        if verify_again.all_passed or verify_again.deviation < 0.2:
            return {
                "success": True,
                "reflection_attempts": attempt,
                "final_deviation": verify_again.deviation
            }

    return {
        "success": False,
        "reflection_attempts": max_attempts,
        "final_deviation": verify_again.deviation
    }

def classify_issue(task_skill_md):
    # 分析失败原因，分类为：
    # missing_step / wrong_order / quality_issue / dependency_unmet / parameter_issue
    pass
```

**反思日志格式**（严格控制300字）：
```markdown
反思日志：
- 关键问题：[一句话描述核心问题，不超过50字]
- 根因分析：[不超过50字]
- 优化方向：[不超过100字，可落地的建议]
```

## 依赖关系

- **被依赖**：task-archiver（依赖验证后的结果）
- **依赖**：execution-controller（输入来自执行后的 task_skill.md）

## 完成标准

1. 所有 completion_standards 均已逐项验证，passed/fail 结果明确
2. deviation 值已计算，范围 0.0-1.0
3. deviation >= 0.2 时反射流程已触发（至少1次）
4. reflection_log 格式正确，关键问题+根因+优化方向，总字数 <= 300
5. standard_results 包含每条标准的通过状态和证据
6. 返回值包含 all_passed、deviation、reflection_log、success 四个必需字段

## 错误处理

- **校验过程中 skill 结果缺失**：该标准默认标记为 fail，deviation += 1.0
- **反思3次后仍不达标**：记录最终状态，success=false，输出当前结果进入归档
- **task_skill.md 格式损坏**：读取原始执行日记作为 fallback 验证依据
- **调整方案执行失败**：记录错误，仍进入归档流程，不无限重试

## 示例

**场景**：会议卡片组件创建任务，测试环节缺失

**输出**：
```json
{
  "task_id": "TASK_20260522_abc1",
  "all_passed": false,
  "deviation": 0.25,
  "standard_results": [
    {"standard": "创建MeetingCard组件", "passed": true, "evidence": "3个文件已生成"},
    {"standard": "响应式布局支持", "passed": true, "evidence": "包含sm/md/lg断点"},
    {"standard": "单元测试覆盖", "passed": false, "evidence": "测试文件不存在"},
    {"standard": "API对接完成", "passed": true, "evidence": "meetingApi调用正常"}
  ],
  "reflection_triggered": true,
  "reflection_attempts": 1,
  "reflection_log": {
    "key_problem": "测试环节缺失，单元测试覆盖率为0",
    "root_cause": "生成阶段未将test-generation skill纳入计划",
    "adjustment": "在代码审查后插入test-generation skill，覆盖MeetingCard组件核心方法",
    "max_chars": 186
  },
  "success": true
}
```

## 注意事项

- 偏差计算权重可根据标准重要性动态调整，关键标准权重更高
- 反思不是无限重做，3次后仍不达标直接放弃，保证流程不陷入死循环
- reflection_log 的字数限制是硬性约束，超出需截断
- 验证结果应写入 task_skill.md 的结果汇总区域，供 task-archiver 使用

## 原子skill位置

./.claude/skills/atomic-skills/result-validator/SKILL.md