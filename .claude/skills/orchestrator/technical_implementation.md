# Orchestrator Pro 技术实现

本文档给出通用任务编排的实现示例，覆盖任务状态、共享上下文、执行控制、恢复、校验和归档。

## 1. 任务状态模型

```python
from dataclasses import dataclass, field
from typing import Any


@dataclass
class TaskState:
    task_id: str
    status: str = "待执行"
    main_skill: str = ""
    complexity_score: int = 0
    subtasks: dict[str, dict[str, Any]] = field(default_factory=dict)
    execution_log: list[dict[str, Any]] = field(default_factory=list)
    error_log: list[dict[str, Any]] = field(default_factory=list)
    shared_context: dict[str, str] = field(default_factory=dict)
    final_result: dict[str, Any] = field(default_factory=dict)
```

状态和结果应同步写入 `tasks/current/task_skill.md`，文件内容是任务恢复的持久化来源。

## 2. 共享上下文管理

```python
class SharedContextManager:
    def __init__(self, task_file: str):
        self.task_file = task_file

    def write(self, skill_name: str, result: str):
        block = (
            f"<!-- atomic-skill: {skill_name} -->\n"
            f"{result}\n"
            f"<!-- /atomic-skill: {skill_name} -->\n"
        )
        append_to_shared_context(self.task_file, block)

    def read(self, skill_name: str) -> str | None:
        content = read_file(self.task_file)
        start = f"<!-- atomic-skill: {skill_name} -->"
        end = f"<!-- /atomic-skill: {skill_name} -->"
        return extract_between(content, start, end)
```

写入应保留已有上下文。读取不到上游结果时，调用方再读取原始项目文件。

## 3. 流式输出

```python
class StreamOutput:
    def __init__(self, enabled: bool = True):
        self.enabled = enabled

    def task_start(self, task_id: str, main_skill: str):
        self.emit("task_start", {"task_id": task_id, "main_skill": main_skill})

    def skill_start(self, skill_name: str):
        self.emit("skill_start", {"skill": skill_name})

    def skill_success(self, skill_name: str, summary: str):
        self.emit("skill_success", {"skill": skill_name, "summary": summary})

    def skill_failure(self, skill_name: str, error: str):
        self.emit("skill_failure", {"skill": skill_name, "error": error})

    def main_skill_selected(self, skill_name: str, matched_keywords: list[str]):
        keywords = "、".join(matched_keywords)
        print(f"{skill_name}：用户的{keywords}匹配上{skill_name}")

    def emit(self, event: str, payload: dict):
        if self.enabled:
            print({"event": event, **payload})
```

## 4. 执行控制器

```python
class ExecutionController:
    def __init__(self, state: TaskState, context: SharedContextManager):
        self.state = state
        self.context = context
        self.stream = StreamOutput()

    def execute(self, parallel_layers: list[list[dict]]):
        for layer in parallel_layers:
            for skill in layer:
                self._execute_skill(skill)

    def _execute_skill(self, skill: dict):
        name = skill["name"]
        self.update_status(name, "执行中")
        self.stream.skill_start(name)

        try:
            result = execute_atomic_skill(skill)
            self.update_status(name, "已完成", result)
            self.context.write(name, result.summary)
            self.stream.skill_success(name, result.summary)
        except Exception as error:
            impact = assess_error_impact(skill, error)
            self.record_error(name, error, impact)
            self.update_status(name, "失败")
            self.stream.skill_failure(name, str(error))
            if impact >= 5:
                raise PauseException(str(error)) from error
            if should_retry(name, self.state.error_log):
                self._execute_skill(skill)

    def update_status(self, skill_name: str, status: str, result=None):
        self.state.subtasks[skill_name]["status"] = status
        if result is not None:
            self.state.subtasks[skill_name]["result"] = result.summary
        persist_task_state(self.state)

    def record_error(self, skill_name: str, error: Exception, impact: int):
        self.state.error_log.append({
            "skill": skill_name,
            "error": str(error),
            "impact": impact,
        })
        persist_task_state(self.state)
```

实际并行执行由运行环境决定；同一层中的任务不得违反依赖关系，状态更新必须在任务文件中可见。

## 5. 任务恢复

```python
def restore_task(task_file: str) -> TaskState:
    state = load_task_state(task_file)
    for name, subtask in state.subtasks.items():
        if subtask.get("status") == "执行中":
            subtask["status"] = "待执行"
    return state


def pending_subtasks(state: TaskState) -> list[str]:
    return [
        name for name, subtask in state.subtasks.items()
        if subtask.get("status") in {"待执行", "失败"}
    ]
```

恢复时不重复执行已完成任务，保留已有执行日志、错误日志和共享上下文。

## 6. 结果校验

```python
def validate_result(state: TaskState) -> dict:
    verification = verify_completion_criteria(state)
    deviation = calculate_deviation(state.final_result, verification)
    reflection = reflection_loop(state, max_attempts=3)
    success = verification["all_passed"] and deviation < 0.2
    return {
        "all_passed": verification["all_passed"],
        "deviation": deviation,
        "reflection_result": reflection,
        "success": success,
    }
```

结果输出应包含验证明细、未通过标准和反思结论。

## 7. 归档入口

```python
def archive_task(state: TaskState, current_path: str, history_path: str):
    if state.status not in {"已完成", "失败"}:
        raise ValueError("任务仍在执行中，不能归档")

    record_persistable_documents(state)
    move_file(current_path, history_path)
    update_monthly_index(state, history_path)
    validate_archive(current_path, history_path, monthly_index_path(history_path))
```

归档失败时保留当前任务文件和最终结果，不覆盖状态，并报告需要人工处理的步骤。

## 8. 主执行入口

```python
def run_orchestrator_pro(user_input: str, skills_register: list) -> dict:
    intent = recognize_intent(user_input, skills_register)
    route = route_by_complexity(intent["complexity_assessment"])

    if route == "lightweight":
        return execute_lightweight_orchestrator(intent)

    history = retrieve_history(intent, load_monthly_index())
    match = match_main_skill(intent, skills_register)
    if match["matched_skill"] is None:
        return handle_missing_skill(intent, match)

    StreamOutput().main_skill_selected(
        match["matched_skill"]["name"],
        match.get("matched_keywords", []),
    )

    skill_definition = read_skill_file(match["matched_skill"]["path"])
    atomic_skills = parse_atomic_skills(skill_definition)
    task = generate_task(intent, match, atomic_skills)
    state = load_or_create_task(task)
    controller = ExecutionController(state, SharedContextManager(task.current_path))

    controller.execute(task["parallel_layers"])
    validation = validate_result(state)
    output = format_execution_summary(state, validation, history)
    archive_task(state, task.current_path, task.history_path)
    return output
```
