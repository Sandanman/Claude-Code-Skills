---
name: task-generator
description: 构建原子 Skill 依赖 DAG，生成拓扑顺序、并行层和任务状态文件
impl_status: design_spec
---

# Task Generator 原子 Skill

## 1. 核心定位

读取意图、匹配结果和主 Skill 的原子 Skill 定义，生成任务 DAG、拓扑顺序、并行层和任务状态文件。

## 2. 生成流程

```python
def generate_task(intent, matched_skill, atomic_skills_list):
    graph, in_degree, dag_error = build_dependency_graph(atomic_skills_list)
    if dag_error:
        return {"error": dag_error}

    sorted_skills = topological_sort(graph, in_degree)
    if not sorted_skills:
        return {"error": "循环依赖"}

    parallel_layers = identify_parallel_layers(sorted_skills, graph)
    task_id = generate_task_id()
    task_skill_md = create_task_skill_file(
        task_id=task_id,
        intent=intent,
        matched_skill=matched_skill,
        parallel_layers=parallel_layers
    )

    return {
        "task_id": task_id,
        "task_skill_md": task_skill_md,
        "parallel_layers": parallel_layers
    }
```

## 3. 基础能力

- 检查缺失依赖和循环依赖。
- 使用稳定拓扑排序生成执行顺序。
- 识别可并行执行的任务层。
- 生成任务 ID 和 `tasks/current/task_skill.md`。
- 写入任务基础信息、子任务列表、依赖、完成标准、执行日志、错误日志和共享上下文区域。

## 4. 完成标准

- DAG 构建正确。
- 循环依赖被阻断并返回错误。
- 拓扑顺序稳定。
- 并行层识别正确。
- 任务文件可被 `execution-controller` 读取。
