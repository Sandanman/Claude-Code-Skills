---
name: orchestrator
description: 统一任务编排入口，按复杂度执行意图识别、技能匹配、任务规划、执行、校验、输出和归档
impl_status: action_based
---

# Orchestrator

## 1. 核心定位

`orchestrator` 是任务编排的统一入口，负责将用户请求转换为可执行任务，并持续保存任务状态。它保留轻量路径和完整路径两种执行方式，但两条路径使用同一套通用调度能力，不引入额外的性能控制机制。

核心链路：

```text
用户输入
  ↓
意图识别与复杂度判断
  ↓
统一编排流程
  ↓
历史任务检索
  ↓
主 Skill 匹配
  ↓
读取匹配主 Skill 的 SKILL.md
  ↓
DAG 生成与并行层识别
  ↓
原子 Skill 执行
  ↓
任务恢复与状态同步
  ↓
结果校验
  ↓
结果输出
  ↓
任务归档
```

## 2. 统一执行流程

复杂度评分用于任务分类和执行策略选择，不再选择不同的编排实现：

- `complexity_score < 4`：采用轻量执行策略，仍执行统一编排流程。
- `complexity_score >= 4`：采用完整执行策略，仍执行统一编排流程。

两种策略共享相同的任务依赖、执行状态、结果校验和归档规则。

## 3. 步骤 1：意图识别与复杂度判断

输入用户原始请求，读取项目上下文（如存在）和主 Skill 注册表，生成结构化意图：

- `domain`
- `action`
- `target`
- `constraints`
- `keywords`
- `success_criteria`
- `complexity_assessment`
- `confidence`

复杂度评估至少考虑步骤数量、状态需求、文件数量、分支数量和是否需要多个 Skill。意图识别失败时使用规则化解析，并记录不确定项。

## 4. 步骤 2：历史任务检索

基于意图的领域、动作、目标类型和关键词检索月度任务索引及历史任务文件。历史结果只用于提供上下文和参考，不直接跳过当前任务的必要校验。

```python
def retrieve_history(intent: dict, monthly_index: list) -> list:
    candidates = []
    for item in monthly_index:
        score = calculate_similarity(intent, item)
        if score >= 0.85:
            candidates.append({"item": item, "score": score})
    return sorted(candidates, key=lambda item: item["score"], reverse=True)
```

## 5. 步骤 3：主 Skill 匹配

综合比较 `domain`、`action`、`keywords`、目标类型、触发关键词和能力描述，输出候选列表、匹配分数和选择理由。

处理分支：

- 无匹配：记录 `missing_skills.md`，尝试自主执行；无法执行时向用户说明原因和可行的重试方式。
- 单匹配：选择唯一候选。
- 多匹配：展示候选并选择推荐项，或等待用户选择。

确定主 Skill 后必须 Read 其 `SKILL.md`，加载原子 Skill 列表、依赖和执行逻辑。若主 Skill 声明依赖其他 Skill，递归读取依赖文件。匹配结果不得修改注册表中的基础路径和依赖关系。

## 6. 步骤 4：任务生成

读取任务模板，构建原子 Skill 依赖图：

1. 检查依赖是否存在。
2. 检测循环依赖。
3. 使用稳定的拓扑排序生成执行顺序。
4. 识别可并行执行的层。
5. 生成任务 ID。
6. 创建 `tasks/current/task_skill.md`。

任务文件至少包含：任务基础信息、目标、主 Skill、原子 Skill 列表、依赖、完成标准、执行日志、错误日志、共享上下文、最终结果和归档信息。

循环依赖或缺失依赖应在执行前返回明确错误，不创建不可执行的任务计划。

## 7. 步骤 5：执行控制

按照并行层和依赖顺序执行原子 Skill。每个 Skill 开始前更新状态为“执行中”，并输出开始事件。

成功时：

1. 更新状态为“已完成”。
2. 写入执行摘要和核心结果。
3. 将结果追加到共享上下文。
4. 输出成功事件。

失败时：

1. 记录错误和影响等级。
2. 更新状态为“失败”。
3. 可重试错误按有限次数重试。
4. 低影响错误允许独立分支继续。
5. 高影响错误暂停任务，保留状态供恢复。

共享上下文格式：

```markdown
<!-- atomic-skill: skill-name -->
核心输出
<!-- /atomic-skill: skill-name -->
```

下游 Skill 优先读取任务文件中的对应上下文；不存在时再读取原始项目文件。

## 8. 步骤 6：任务恢复

发现 `tasks/current/task_skill.md` 时，先读取任务状态、依赖、已完成结果、错误日志和共享上下文。已完成的 Skill 不重复执行，失败的 Skill 根据重试记录恢复，暂停任务从最近一个可执行节点继续。

任务文件必须足以支持进程中断后的恢复。恢复时不得覆盖已有结果或错误记录。

## 9. 步骤 7：结果校验

逐项验证主 Skill 和原子 Skill 的完成标准，计算目标与实际结果的偏差，并在必要时执行最多 3 次反思循环。

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

校验结果必须说明每项标准是否通过、未通过项、偏差数值和反思结果。

## 10. 步骤 8：结果输出

输出普通执行摘要，不生成额外指标报告。摘要至少包含：

- 任务 ID、主 Skill 和复杂度
- 原子 Skill 执行状态
- 关键产出
- 校验结论和偏差
- 失败、重试或暂停信息
- 可固化文档路径（如有）

无匹配或校验失败时，明确说明当前状态和用户可采取的下一步。

## 11. 步骤 9：任务归档

所有原子 Skill 完成且结果校验结束后，调用 `task-archiver`：

1. 确认任务状态为“已完成”或“失败”。
2. 将 `tasks/current/task_skill.md` 移动到 `tasks/history/YYYY-MM/task_skill_{任务ID}.md`。
3. 更新或创建当月任务索引。
4. 记录用户意图、最终目标、主 Skill、创建时间、完成时间、执行摘要、归档时间和可固化文档路径。
5. 验证当前目录不再有任务文件，或仅有锁文件。

归档失败时不得覆盖任务结果，应输出具体原因并保留手动处理路径。

## 12. 原子 Skill 注册

当前通用原子 Skill：

- `intent-recognition`
- `skill-matcher`
- `task-generator`
- `execution-controller`
- `result-validator`
- `task-archiver`

注册、依赖和执行顺序以 `skills_register.md` 为准。

## 13. 完成标准

- 统一流程覆盖简单和复杂任务，并根据复杂度选择执行策略。
- 匹配主 Skill 后已读取对应 `SKILL.md`。
- 依赖、并行层、状态、日志、错误和共享上下文持续可恢复。
- 结果校验包含明确结论、偏差和有限反思记录。
- 任务文件被完整归档，月度索引可恢复任务结果。
