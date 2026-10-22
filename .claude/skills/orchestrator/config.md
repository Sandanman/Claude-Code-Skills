# Orchestrator 通用配置

本文档定义任务编排的路由、上下文、执行、恢复、校验和归档策略。Fast Path 与 Durable Path 共享状态语义和安全边界，但执行步骤按任务风险和状态需求裁剪。

## 1. 路由策略

```python
ROUTE_CONFIG = {
    "fast_confidence_min": 0.85,
    "fast_complexity_max": 3,
    "fast_max_main_skills": 1,
    "fast_max_dependencies": 0,
    "default_route_for_legacy_skill": "durable",
    "upgrade_only": True,
}
```

Fast Path 仅在以下条件全部满足时使用：意图明确、置信度不低于阈值、只匹配一个主 Skill、复杂度不超过 3、无依赖、低风险、无用户确认、无恢复需求、无跨步骤共享上下文。

以下任一条件成立即使用 Durable Path：低置信度、匹配歧义、多 Skill、多步骤依赖、需要确认、需要重试/暂停/恢复、删除/覆盖/部署/权限/凭证/Git 写操作、数据迁移、外部系统写入或其他不可逆副作用。

Fast Path 执行中只能升级到 Durable Path，升级时保留已完成步骤、意图、匹配结果和共享上下文。

## 2. 匹配配置

```python
MATCH_CONFIG = {
    "minimum_score": 0.4,
    "candidate_limit": 3,
    "history_similarity_threshold": 0.85,
    "allow_autonomous_fallback": True,
    "skip_history_for_fast": True,
    "load_only_selected_skill": True,
}
```

明确单意图请求直接执行规则化路由；仅在多意图、低置信度或关键词冲突时展示候选或请求澄清。

## 3. 上下文读取策略

```python
CONTEXT_POLICY = {
    "fast": ["user_input", "skill_metadata", "selected_skill"],
    "durable": ["user_input", "skill_metadata", "selected_skill", "dependencies", "task_template"],
    "history": "on_demand",
    "duplicate_reads": False,
}
```

Fast Path 不读取无关 Skill、历史正文、完整原子注册表或任务模板。Durable Path 仅在需要恢复、复用历史模式或用户明确要求时读取历史。

## 4. DAG 与任务生成

```python
TASK_GRAPH_CONFIG = {
    "detect_missing_dependencies": True,
    "detect_cycles": True,
    "stable_topological_sort": True,
    "identify_parallel_layers": True,
    "execution_mode": "serial_by_default",
    "create_task_for_fast": False,
}
```

Fast Path 不生成完整 DAG；Durable Path 在执行前完成依赖检查、循环检测、稳定拓扑排序和并行层识别。`parallel_layers` 仅表示计划层，不代表运行时已并行。

## 5. 执行控制

```python
EXECUTION_CONFIG = {
    "max_retries": 3,
    "execution_mode": "serial_by_default",
    "stream_output": True,
    "persist_status_for_fast": False,
    "persist_status_for_durable": True,
    "persist_shared_context_for_durable": True,
}
```

Fast Path 不创建完整任务状态；若需要重试、暂停、恢复、跨步骤共享上下文或发生高影响错误，立即升级并创建 Durable 状态。

## 6. 任务状态

```python
TASK_FILE_CONFIG = {
    "legacy_current_path": "tasks/current/task_skill.md",
    "current_path_template": "tasks/current/task_skill_{task_id}.md",
    "history_path": "tasks/history/{YYYY-MM}/task_skill_{task_id}.md",
    "legacy_read_supported": True,
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

新任务优先使用带任务 ID 的状态文件。旧的固定路径只用于兼容读取；发现多个活动任务时不得覆盖或自动选择。

## 7. 错误影响等级

```python
ERROR_IMPACT = {
    "low": {"min": 1, "max": 2, "action": "record_and_continue"},
    "medium": {"min": 3, "max": 4, "action": "retry_then_continue"},
    "high": {"min": 5, "max": 10, "action": "pause_and_resume"},
}
```

高影响错误暂停 Durable 任务；低影响错误可独立继续。Fast Path 不自动重试，首次需要重试即升级。

## 8. 共享上下文

```python
SHARED_CONTEXT_CONFIG = {
    "marker_template": "<!-- atomic-skill: {skill_name} -->",
    "end_marker_template": "<!-- /atomic-skill: {skill_name} -->",
    "read_before_source": True,
    "append_only": True,
}
```

仅 Durable Path 持久化共享上下文。写入不得覆盖已有日志或结果。

## 9. 分级校验

```python
VALIDATION_CONFIG = {
    "fast_level": "L0",
    "durable_level": "L1",
    "reflection_level": "L2",
    "default_reflection_attempts": 0,
    "max_reflection_attempts": 3,
    "reflection_trigger": ["L1_FAILED", "HIGH_RISK", "USER_REQUESTED"],
    "success_deviation_threshold": 0.2,
    "require_all_criteria": True,
}
```

- `L0`：输出存在、非空、无明显错误并满足最低完成标准。
- `L1`：逐项检查 Durable 任务完成标准，必要时计算偏差。
- `L2`：仅在 L1 失败、高风险或用户要求时触发反思；默认不主动反思。

没有量化目标时偏差标记为“不适用”，不强行计算。

## 10. 归档

```python
ARCHIVE_CONFIG = {
    "fast_archive": False,
    "durable_archive": True,
    "archive_statuses": ["已完成", "失败"],
    "monthly_index_required": True,
    "record_persistable_documents": True,
    "preserve_source_on_failure": True,
}
```

只有 Durable Path 归档。归档失败时保留原任务文件和最终结果；不要求当前目录全局为空，只验证本次任务状态已正确关闭。
