# Orchestrator Pro 通用配置

本文档定义任务编排所需的通用配置。配置只描述路由、依赖、执行、恢复和归档行为，不对模型调用或任务执行设置额外性能指标。

## 1. 复杂度路由

```python
COMPLEXITY_ROUTE = {
    "lightweight_max": 3,
    "complete_min": 4,
}
```

`complexity_score <= 3` 使用轻量流程，`complexity_score >= 4` 使用完整流程。

## 2. Skill 匹配

```python
MATCH_CONFIG = {
    "minimum_score": 0.4,
    "candidate_limit": 3,
    "history_similarity_threshold": 0.85,
    "allow_autonomous_fallback": True,
}
```

无匹配时记录缺失能力并尝试自主执行；多匹配时保留候选及选择理由。

## 3. DAG 与任务生成

```python
TASK_GRAPH_CONFIG = {
    "detect_missing_dependencies": True,
    "detect_cycles": True,
    "stable_topological_sort": True,
    "identify_parallel_layers": True,
}
```

任务生成必须在执行前完成依赖检查。检测到循环依赖或缺失依赖时，返回错误并停止生成不可执行计划。

## 4. 执行控制

```python
EXECUTION_CONFIG = {
    "max_retries": 3,
    "parallel_execution": True,
    "stream_output": True,
    "persist_status": True,
    "persist_shared_context": True,
}
```

每个原子 Skill 使用以下状态：

```text
待执行 → 执行中 → 已完成
                 └→ 失败
```

高影响错误暂停任务，低影响错误允许独立分支继续。重试次数达到上限后保留失败状态和错误日志。

## 5. 错误影响等级

```python
ERROR_IMPACT = {
    "low": {"min": 1, "max": 2, "action": "record_and_continue"},
    "medium": {"min": 3, "max": 4, "action": "retry_then_continue"},
    "high": {"min": 5, "max": 10, "action": "pause_and_resume"},
}
```

影响评估应基于任务依赖、用户目标、数据完整性和后续步骤是否可执行。

## 6. 任务文件

```python
TASK_FILE_CONFIG = {
    "current_path": "tasks/current/task_skill.md",
    "history_path": "tasks/history/{YYYY-MM}/task_skill_{task_id}.md",
    "required_sections": [
        "任务基础信息",
        "子任务列表",
        "完成标准",
        "执行日志",
        "错误日志",
        "共享上下文",
        "最终结果汇总",
        "归档信息",
    ],
}
```

任务文件是执行过程中的唯一状态载体，写入时不得覆盖已有日志、结果或错误信息。

## 7. 共享上下文

```python
SHARED_CONTEXT_CONFIG = {
    "marker_template": "<!-- atomic-skill: {skill_name} -->",
    "end_marker_template": "<!-- /atomic-skill: {skill_name} -->",
    "read_before_source": True,
    "append_only": True,
}
```

上游 Skill 写入核心结果，下游 Skill 优先读取任务文件中的对应区域。

## 8. 结果校验

```python
VALIDATION_CONFIG = {
    "max_reflection_attempts": 3,
    "success_deviation_threshold": 0.2,
    "require_all_criteria": True,
}
```

结果必须同时满足所有必要完成标准，且偏差低于阈值；否则输出失败或部分完成状态，并保留未通过项。

## 9. 归档

```python
ARCHIVE_CONFIG = {
    "archive_statuses": ["已完成", "失败"],
    "monthly_index_required": True,
    "record_persistable_documents": True,
    "verify_current_directory_empty": True,
}
```

归档前确认任务状态和任务 ID 有效，归档后确认历史文件存在、月度索引已更新且当前任务目录已清理。

## 10. 原子 Skill 执行顺序

```python
ATOMIC_SKILL_ORDER = [
    "intent-recognition",
    "skill-matcher",
    "task-generator",
    "execution-controller",
    "result-validator",
    "task-archiver",
]
```

其中 `skill-matcher` 输出供 `task-generator` 使用，`task-generator` 输出供 `execution-controller` 使用，`result-validator` 完成后才能进行归档。
