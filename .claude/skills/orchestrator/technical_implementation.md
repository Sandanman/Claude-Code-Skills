# Orchestrator Pro 技术实现

本文档描述 Fast Path 与 Durable Path 的实现契约。两条路径共享意图、结果和安全协议，但只在需要时创建持久化状态。

## 1. 路由状态模型

```python
from dataclasses import dataclass, field
from typing import Any


@dataclass
class MainSkillSelection:
    main_skill: str
    matched_keywords: list[str] = field(default_factory=list)
    match_score: float | str = "unknown"
    selection_reason: str = ""
    dependencies: list[str] = field(default_factory=list)


@dataclass
class ExecutionSummary:
    main_skill: str
    matched_keywords: list[str]
    match_score: float | str
    selection_reason: str
    dependencies: list[str]
    route_mode: str
    persisted: bool
    validation_level: str
    task_id: str | None
    status: str


def format_selection(selection: dict, route: RouteDecision) -> str:
    return "\n".join([
        f"主 Skill：{selection['main_skill']}",
        f"匹配关键词：{selection.get('matched_keywords', [])}",
        f"匹配分数：{selection.get('match_score', 'unknown')}",
        f"选择理由：{selection.get('selection_reason', '')}",
        f"声明依赖：{selection.get('dependencies', [])}",
        f"执行路径：{route.mode}",
    ])


def format_execution_summary(
    selection: dict,
    route_mode: str,
    persisted: bool,
    validation_level: str,
    result: dict,
    validation: dict,
    task_id: str | None = None,
) -> dict:
    return {
        "main_skill": selection["main_skill"],
        "matched_keywords": selection.get("matched_keywords", []),
        "match_score": selection.get("match_score", "unknown"),
        "selection_reason": selection.get("selection_reason", ""),
        "dependencies": selection.get("dependencies", []),
        "route_mode": route_mode,
        "persisted": persisted,
        "validation_level": validation_level,
        "task_id": task_id,
        "status": "已完成" if validation.get("passed") else "失败",
        "result": result,
        "validation": validation,
    }


@dataclass
class RouteDecision:
    mode: str = "durable"
    confidence: float = 0.0
    risk_level: str = "unknown"
    statefulness: str = "stateless"
    ambiguity: bool = True
    requires_confirmation: bool = False
    upgrade_reason: str | None = None


@dataclass
class TaskState:
    task_id: str
    status: str = "待执行"
    route_mode: str = "durable"
    risk_level: str = "unknown"
    validation_level: str = "L1"
    execution_mode: str = "serial_by_default"
    main_skill: str = ""
    complexity_score: int = 0
    subtasks: dict[str, dict[str, Any]] = field(default_factory=dict)
    execution_log: list[dict[str, Any]] = field(default_factory=list)
    error_log: list[dict[str, Any]] = field(default_factory=list)
    shared_context: dict[str, str] = field(default_factory=dict)
    final_result: dict[str, Any] = field(default_factory=dict)
```

Durable 状态使用 `tasks/current/task_skill_{task_id}.md`。读取时兼容旧的 `tasks/current/task_skill.md`；创建新任务不得覆盖已有状态。

## 2. 路由决策

```python
def choose_route(intent: dict, match: dict) -> RouteDecision:
    unsafe = (
        intent.get("risk_level") in {"high", "unknown"}
        or intent.get("requires_confirmation", False)
        or intent.get("ambiguity", True)
    )
    simple = (
        intent.get("complexity_assessment", {}).get("score", 99) <= 3
        and len(match.get("matched_skills", [])) == 1
        and not match.get("dependencies")
        and intent.get("confidence", 0) >= 0.85
        and intent.get("statefulness", "stateless") == "stateless"
    )

    if not unsafe and simple:
        return RouteDecision(
            mode="fast",
            confidence=intent.get("confidence", 0),
            risk_level=intent.get("risk_level", "low"),
            statefulness="stateless",
            ambiguity=False,
        )

    return RouteDecision(
        mode="durable",
        confidence=intent.get("confidence", 0),
        risk_level=intent.get("risk_level", "unknown"),
        statefulness=intent.get("statefulness", "stateful"),
        ambiguity=intent.get("ambiguity", True),
        requires_confirmation=intent.get("requires_confirmation", False),
    )
```

安全判断优先于复杂度。旧版 Skill 缺少风险元数据时使用 Durable Path。

## 3. Fast Path

```python
def execute_fast_path(intent: dict, match: dict) -> dict:
    skill_definition = read_once(match["matched_skill"]["path"])
    result = execute_main_skill(skill_definition, intent)
    validation = validate_result(result, level="L0")

    if requires_durable_upgrade(result, validation):
        state = create_durable_state(intent, match, initial_result=result)
        return execute_durable_path(state)

    return format_execution_summary(
        selection=match["matched_skill_selection"],
        route_mode="fast",
        persisted=False,
        validation_level="L0",
        result=result,
        validation=validation,
    )
```

Fast Path：

- 不读取历史正文；
- 不生成完整 DAG；
- 不创建任务文件；
- 不重试；
- 不执行反思或归档；
- 只读取选中的 Skill 和其明确声明的依赖；
- 首次出现确认、重试、依赖、跨步骤上下文、高影响失败或范围扩大时升级。

## 4. Durable Path

```python
def execute_durable_path(state: TaskState) -> dict:
    persist_task_state(state)
    task = generate_task_graph(state)
    controller = ExecutionController(
        state,
        SharedContextManager(task.current_path),
        execution_mode="serial_by_default",
    )

    controller.execute(task["parallel_layers"])
    validation = validate_result(state, level="L1")
    if should_reflect(validation, state):
        validation = run_reflection(state, max_attempts=3)
    output = format_execution_summary(
        selection=state.main_skill_selection,
        route_mode="durable",
        persisted=True,
        validation_level=validation.get("level", "L1"),
        result=state.final_result,
        validation=validation,
        task_id=state.task_id,
    )
    archive_task_if_terminal(state, output)
    return output
```

历史检索只在用户要求、任务恢复、需要复用历史模式或确有相似任务时执行，且不能替代本次校验。

## 5. 执行控制

```python
class ExecutionController:
    def __init__(self, state, context, execution_mode="serial_by_default"):
        self.state = state
        self.context = context
        self.execution_mode = execution_mode
        self.stream = StreamOutput()

    def execute(self, parallel_layers):
        for layer in parallel_layers:
            for skill in layer:
                self._execute_skill(skill)
```

`parallel_layers` 是计划层；只有运行环境提供状态隔离、副作用协调和失败处理时才可启用真实并行。本实现默认串行，不宣称已并行执行。

## 6. 任务恢复

```python
def restore_task(task_file: str) -> TaskState:
    state = load_task_state(task_file)
    for name, subtask in state.subtasks.items():
        if subtask.get("status") == "执行中":
            subtask["status"] = "待恢复"
    return state
```

`已完成` 的 Skill 不重复执行。`待恢复` 的 Skill 先检查已有输出和外部副作用，再决定是否重新执行。恢复时保留执行日志、错误日志和共享上下文。

## 7. 分级结果校验

```python
def validate_result(state_or_result, level="L1") -> dict:
    if level == "L0":
        return validate_minimum_output(state_or_result)

    verification = verify_completion_criteria(state_or_result)
    has_goal_metrics = bool(get_goal_criteria(state_or_result))
    deviation = calculate_deviation(state_or_result, verification) if has_goal_metrics else None
    passed = verification["all_passed"] and (deviation is None or deviation < 0.2)
    return {
        "level": level,
        "passed": passed,
        "failed_criteria": verification.get("failed_items", []),
        "deviation": deviation,
        "risk_notes": verification.get("risk_notes", []),
        "needs_resume": not passed and state_requires_resume(state_or_result),
        "reflection_attempts": 0,
        "recommended_next_action": "reflect" if not passed else "archive",
    }


def should_reflect(validation: dict, state: TaskState) -> bool:
    return (
        not validation["passed"]
        or state.risk_level == "high"
        or state.final_result.get("user_requested_reflection", False)
    )
```

Fast Path 只执行 L0。Durable Path 默认执行 L1；L2 仅在 L1 失败、高风险或用户要求时触发，反思默认次数为 0，触发后最多 3 次。

## 8. 归档

```python
def archive_task_if_terminal(state: TaskState, output: dict):
    if state.route_mode == "fast":
        return {"status": "skipped", "reason": "Fast Path 不归档"}
    if state.status not in {"已完成", "失败"}:
        raise ValueError("任务仍在执行中，不能归档")

    record_persistable_documents(state)
    move_file(state.current_path, state.history_path)
    update_monthly_index(state, state.history_path)
    validate_archive(state.current_path, state.history_path, monthly_index_path(state.history_path))
```

归档失败时保留当前任务文件和最终结果，不覆盖错误日志，并输出人工处理路径。

## 9. 主执行入口

```python
def run_orchestrator(user_input: str, skills_register: list) -> dict:
    intent = recognize_intent(user_input, skills_register)
    match = match_main_skill(intent, skills_register)
    route = choose_route(intent, match)

    if match.get("matched_skill") is None:
        return handle_missing_skill(intent, match)

    selection = {
        "main_skill": match["matched_skill"]["name"],
        "matched_keywords": match.get("matched_keywords", []),
        "match_score": match.get("match_score", "unknown"),
        "selection_reason": match.get("selection_reason", ""),
        "dependencies": match.get("dependencies", []),
    }
    StreamOutput().main_skill_selected(selection, route)

    match["matched_skill_selection"] = selection

    if route.mode == "fast":
        return execute_fast_path(intent, match)

    history = retrieve_history_if_needed(intent)
    state = load_or_create_durable_task(intent, match, history)
    return execute_durable_path(state)
```

主入口只做一次意图识别、一次匹配和一次路径决策；已加载文件、路由结果和共享上下文在后续步骤复用，避免重复读取。
