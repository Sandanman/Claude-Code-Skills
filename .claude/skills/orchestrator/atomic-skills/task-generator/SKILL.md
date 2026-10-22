# Task Generator 原子 Skill

## 1. 核心定位

读取意图、匹配结果和主 Skill 定义，按执行路径生成最小任务计划。Fast Path 只进行依赖和安全检查，不生成完整任务文件；Durable Path 生成可恢复状态和完整 DAG。

## 2. 路径规则

### Fast Path

必须同时满足：单主 Skill、无原子依赖、无并行要求、低风险、无确认和恢复需求。

输出最小计划：

```yaml
route_mode: fast
persisted: false
execution_mode: serial_by_default
selected_skill: skill-name
validation_level: L0
```

发现任意依赖、第二个 Skill、确认节点、跨步骤上下文或高风险副作用时，返回 `upgrade_required: true`，由上层转换为 Durable Path。

### Durable Path

执行依赖图检查、循环检测、稳定拓扑排序、计划层识别和任务状态创建。

## 3. 生成流程

```python
def generate_task(intent, matched_skill, atomic_skills_list, route_mode="durable"):
    if route_mode == "fast":
        if atomic_skills_list or matched_skill.get("requires_confirmation"):
            return {"upgrade_required": True, "reason": "任务存在依赖或确认节点"}
        return {
            "route_mode": "fast",
            "persisted": False,
            "execution_mode": "serial_by_default",
            "selected_skill": matched_skill["name"],
            "validation_level": "L0",
        }

    graph, in_degree, dag_error = build_dependency_graph(atomic_skills_list)
    if dag_error:
        return {"error": dag_error}

    sorted_skills = topological_sort(graph, in_degree)
    if not sorted_skills:
        return {"error": "循环依赖"}

    parallel_layers = identify_parallel_layers(sorted_skills, graph)
    task_id = generate_task_id()
    task_path = f"tasks/current/task_skill_{task_id}.md"
    task_skill_md = create_task_skill_file(
        task_id=task_id,
        task_path=task_path,
        route_mode="durable",
        intent=intent,
        matched_skill=matched_skill,
        parallel_layers=parallel_layers,
        execution_mode="serial_by_default",
        validation_level="L1",
    )

    return {
        "route_mode": "durable",
        "task_id": task_id,
        "task_path": task_path,
        "task_skill_md": task_skill_md,
        "parallel_layers": parallel_layers,
        "execution_mode": "serial_by_default",
        "validation_level": "L1",
    }
```

## 4. 完成标准

- Fast Path 不创建完整任务文件，且能识别需要升级的条件。
- Durable Path 正确检查缺失依赖和循环依赖。
- 拓扑顺序稳定，计划层仅表示可计划并行，不代表实际并发。
- 新 Durable 任务使用带任务 ID 的状态路径，不覆盖已有文件。
- 生成的任务文件包含路由模式、风险级别、校验级别、执行模式和恢复信息。
- 任务状态可被 `execution-controller` 读取和恢复。
