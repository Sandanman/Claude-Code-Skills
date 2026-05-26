---
name: execution-controller
description: 原子Skill执行控制 — 按并行层顺序执行原子skill，流式输出执行状态，处理错误评估和重试逻辑，更新task_skill.md状态
---

# Execution Controller 原子Skill

## 概述

执行控制是 Orchestrator 编排链路的核心执行环节，按并行层顺序驱动每个原子skill的实际执行。此skill负责初始化 TokenTracker 和 StreamOutput，按层（layer）依次执行原子skill，对每个skill执行流式输出（开始/成功/失败），更新 task_skill.md 中的执行状态，记录 token 消耗，并在遇到错误时通过 5 维影响评估模型决定是暂停、提示还是继续。单个skill最多重试3次。

## 核心能力

- 执行状态流式输出：每个原子skill的开始、完成、失败实时输出到用户
- 并行层执行：按 Kahn 拓扑排序的并行层顺序执行，同层内串行（避免文件锁冲突）
- Token 追踪：每次 LLM 调用后记录 input/output token，支持 80% 预警 / 95% 警告 / 100% 终止
- 错误影响评估：5维度评分模型（依赖数、核心性、共享数据、可复现性、用户要求）判断影响级别
- 重试策略：每个原子skill最多重试3次，每次重试间隔指数退避
- 状态持久化：每个skill执行后更新 task_skill.md 的 status 和执行日记

## 输入

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| task_skill_md | string | 是 | task_skill.md 文件路径（由 task-generator 生成） |
| parallel_layers | array | 是 | 并行层结构（由 task-generator 计算或直接传入） |
| stream_config | object | 否 | 流式输出配置 {enabled: bool, task_file: string} |
| token_budget | number | 否 | token预算上限，默认 200000 |

## 输出

更新后的 `task_skill.md` 文件（追加执行日记和结果汇总），以及实时流式输出：

```
[TASK_START] task_id=xxx complexity=5.0 confidence=0.85
[SKILL_START] #1/4 需求解析 - 解析需求文档
[SKILL_SUCCESS] #1/4 需求解析 - 耗时 1200ms
[SKILL_START] #2/4 代码生成 - 根据需求生成代码文件
[SKILL_FAIL] #2/4 代码生成 - SyntaxError (将重试 1/3)
[SKILL_START] #2/4 代码生成 - 重试 2/3
[SKILL_SUCCESS] #2/4 代码生成 - 耗时 3500ms
...
[TASK_COMPLETE] task_id=xxx duration=12.3s success_rate=4/4

💰 Token消耗：总消耗 45,230 | 输入 30,100 | 输出 15,130 | 预算使用 22.6%
```

## 执行逻辑

**初始化**：
```python
token_tracker = TokenTracker(task_budget=200000)
token_tracker.start_task(task_id)
stream = StreamOutput(enabled=True, task_file="tasks/current/task_skill.md")
stream.task_start(task_id, main_skill, total_skills, intent_summary, complexity_score, confidence)
```

**执行循环**（按并行层）：
```python
for layer_idx, layer_skills in enumerate(parallel_layers):
    for skill in layer_skills:
        start_time = time.time()
        stream.skill_start(skill.name, skill.index, total, desc=skill.desc)
        try:
            result = execute_atomic_skill(skill)
            elapsed = time.time() - start_time
            stream.skill_success(skill.name, skill.index, total, result.get("summary"), elapsed)

            if hasattr(result, 'llm_usage'):
                token_tracker.record_skill_usage(
                    skill.name, result.llm_usage.input_tokens,
                    result.llm_usage.output_tokens
                )
            update_task_skill_status(task_skill_md, skill.name, "completed", result)
        except Exception as e:
            will_retry = retry_count < 3
            stream.skill_fail(skill.name, str(e), will_retry, retry_count, max_retries=3)

            impact = assess_error_impact(skill, task_skill)
            if impact >= 5:
                raise PauseException(f"高影响错误: skill={skill.name}, impact={impact}")
            else:
                record_error(task_skill_md, skill, e)
                continue_execution()
```

**5维错误影响评估**：
```python
def assess_error_impact(failed_skill, task_context):
    score = 0
    # 维度1：下游依赖数（被多少skill依赖，分值高说明越关键）
    score += 3 if find_dependent_skills(failed_skill) else 0
    # 维度2：是否为核心skill
    score += 2 if failed_skill.is_core else 0
    # 维度3：是否修改共享数据
    score += 2 if failed_skill.modifies_shared_data else 0
    # 维度4：输出是否可复现（如果可复现则降低影响）
    score -= 1 if failed_skill.output_reproducible else 0
    # 维度5：是否用户明确要求的
    score += 2 if failed_skill.user_required else 0
    return score
    # >= 5：严重影响（暂停，等待用户决策）
    # 3-4：中等影响（记录并提示用户）
    # <= 2：轻微影响（记录错误，继续执行）
```

**Token 追踪与预警**：
```python
response = client.messages.create(...)
token_tracker.record_skill_usage(skill_name, response.usage.input_tokens, response.usage.output_tokens)
usage_pct = token_tracker.get_usage_percentage()
if usage_pct >= 100:
    raise StopException("Token预算耗尽，任务终止")
elif usage_pct >= 95:
    stream.warning("🚨 Token使用率 95%，即将耗尽")
elif usage_pct >= 80:
    stream.warning("⚠️ Token使用率 80%，请注意消耗")
```

**重试策略**：
```python
def retry_skill(skill, max_retries=3):
    for attempt in range(1, max_retries + 1):
        try:
            return execute_atomic_skill(skill)
        except Exception as e:
            if attempt == max_retries:
                raise
            wait_time = 2 ** attempt  # 指数退避：1s, 2s, 4s
            stream.retrying(skill.name, attempt, max_retries, wait_time)
            time.sleep(wait_time)
```

## 依赖关系

- **被依赖**：result-validator（依赖执行后的 task_skill.md）
- **依赖**：task-generator（输入来自任务生成的结果）

## 完成标准

1. 所有原子skill均已执行（完成或确认失败）
2. task_skill.md 中的每个 skill status 已更新（completed / failed / skipped）
3. 执行日记中包含所有 skill 的 timestamp、status、duration、summary
4. Token 统计已记录到 task_skill.md 的结果汇总区域
5. 错误影响评估已对每个失败的 skill 执行并记录
6. 流式输出中包含 TASK_START 和 TASK_COMPLETE 事件

## 错误处理

- **PauseException**：高影响错误时暂停，输出用户决策选项（重试 / 跳过 / 取消 / 人工修复）
- **StopException**：Token耗尽时终止任务，输出当前结果
- **Skill执行超时**：超过配置的超时时间（默认 120s）视为失败，计入错误
- **文件锁冲突**：捕获并发写入异常，等待后重试（最多3次）
- **Task文件不存在**：抛出错误，整个编排链路中止

## 示例

**执行流程输出**：
```
[TASK_START] task_id=TASK_20260522_abc1 main_skill=code-generator total=5 complexity=5.0
[SKILL_START] #1/5 需求解析 - 解析需求文档为结构化输出
[SKILL_SUCCESS] #1/5 需求解析 - 耗时 980ms - 提取到5个功能点
[SKILL_START] #2/5 代码生成 - 根据需求生成MeetingCard组件
[SKILL_FAIL] #2/5 代码生成 - 模板语法错误 (将重试 1/3)
[RETRY] #2/5 代码生成 - 重试 2/3，等待 2s
[SKILL_SUCCESS] #2/5 代码生成 - 耗时 4200ms - 生成3个文件
[SKILL_START] #3/5 代码审查 - 检查代码规范和潜在问题
[SKILL_SUCCESS] #3/5 代码审查 - 耗时 2100ms - 发现1个警告
...
[TASK_COMPLETE] task_id=TASK_20260522_abc1 duration=18.5s success_rate=5/5

💰 Token 消耗摘要（任务 TASK_20260522_abc1）
   总消耗: 52,340 token
   输入: 34,200 | 输出: 18,140
   预估成本: $0.1047
   调用次数: 8 次，平均 6,543 token/次
   预算使用: 26.2%
   耗时: 18.5秒
```

## 注意事项

- 同层内 skill 串行执行是故意的，避免多个 skill 同时写入 task_skill.md 导致文件锁冲突
- 流式输出的 TASK_COMPLETE 事件包含 success_rate，是 result-validator 的重要输入
- Token 追踪应在每次 LLM 调用后立即执行，不要延迟到 skill 完成后
- 错误影响评分应记录到 task_skill.md 的执行日记中，供后续分析

## 原子skill位置

./.claude/skills/atomic-skills/execution-controller/SKILL.md