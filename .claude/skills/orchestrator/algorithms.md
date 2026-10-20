# Orchestrator Pro 通用算法

本文档描述任务编排中的基础算法和数据处理流程。

## 1. Skill 匹配评分

```python
def calculate_match_score(intent: dict, skill: dict) -> float:
    weights = {
        "domain": 0.30,
        "action": 0.25,
        "keywords": 0.25,
        "target": 0.10,
        "description": 0.10,
    }
    score = 0.0
    score += weights["domain"] * exact_or_semantic(intent.get("domain"), skill.get("domain"))
    score += weights["action"] * exact_or_semantic(intent.get("action"), skill.get("action"))
    score += weights["keywords"] * jaccard(intent.get("keywords", []), skill.get("keywords", []))
    score += weights["target"] * exact_or_semantic(
        intent.get("target", {}).get("type"), skill.get("target_type")
    )
    score += weights["description"] * semantic_similarity(
        intent.get("original_input", ""), skill.get("description", "")
    )
    return round(score, 3)
```

候选结果按分数降序排列，低于匹配阈值的候选不作为自动选择结果。

## 2. 依赖图构建

```python
def build_dependency_graph(skills: list):
    graph = {skill["name"]: [] for skill in skills}
    in_degree = {skill["name"]: 0 for skill in skills}
    names = set(graph)

    for skill in skills:
        for dependency in skill.get("depends_on", []):
            if dependency not in names:
                return graph, in_degree, f"缺失依赖：{dependency}"
            graph[dependency].append(skill["name"])
            in_degree[skill["name"]] += 1

    return graph, in_degree, None
```

## 3. 循环检测与拓扑排序

使用 Kahn 算法，按名称稳定排序，保证相同输入得到相同执行顺序。

```python
from collections import deque


def topological_sort(graph: dict, in_degree: dict) -> list:
    degree = in_degree.copy()
    queue = deque(sorted(name for name, value in degree.items() if value == 0))
    result = []

    while queue:
        current = queue.popleft()
        result.append(current)
        for dependent in sorted(graph[current]):
            degree[dependent] -= 1
            if degree[dependent] == 0:
                queue.append(dependent)

    if len(result) != len(graph):
        return []
    return result
```

返回空列表表示检测到循环依赖。

## 4. 并行层识别

具有相同依赖层级且互不依赖的 Skill 可以放入同一并行层。

```python
def identify_parallel_layers(sorted_skills: list, graph: dict) -> list:
    levels = {}
    for skill in sorted_skills:
        dependencies = [
            source for source, targets in graph.items()
            if skill in targets
        ]
        levels[skill] = max((levels[item] for item in dependencies), default=-1) + 1

    layers = []
    for level in sorted(set(levels.values())):
        layers.append([
            skill for skill in sorted_skills
            if levels[skill] == level
        ])
    return layers
```

## 5. 历史相似度

历史检索可综合领域、动作、目标类型和关键词。历史结果用于补充上下文，不替代当前任务的执行和校验。

```python
def calculate_similarity(intent: dict, history: dict) -> float:
    domain = exact_or_semantic(intent.get("domain"), history.get("domain"))
    action = exact_or_semantic(intent.get("action"), history.get("action"))
    target = exact_or_semantic(
        intent.get("target", {}).get("type"), history.get("target_type")
    )
    keywords = jaccard(intent.get("keywords", []), history.get("keywords", []))
    return round(0.30 * domain + 0.30 * action + 0.15 * target + 0.25 * keywords, 3)
```

## 6. 错误影响评估

```python
def assess_error_impact(skill: dict, error: Exception) -> int:
    if skill.get("is_core") or skill.get("blocks_dependents"):
        return 5
    if skill.get("user_required"):
        return 4
    return 2
```

影响等级决定错误后的行为：低影响错误记录并继续，中等影响错误重试后继续，高影响错误暂停并等待恢复。

## 7. 共享上下文读写

```python
def append_shared_context(task_file: str, skill_name: str, result: str):
    block = (
        f"<!-- atomic-skill: {skill_name} -->\n"
        f"{result}\n"
        f"<!-- /atomic-skill: {skill_name} -->\n"
    )
    append_to_shared_context(task_file, block)


def read_shared_context(task_file: str, skill_name: str):
    start_marker = f"<!-- atomic-skill: {skill_name} -->"
    end_marker = f"<!-- /atomic-skill: {skill_name} -->"
    content = read_file(task_file)
    return extract_between(content, start_marker, end_marker)
```

写入采用追加或定点更新，保留已有结果和日志。

## 8. 结果偏差

```python
def calculate_deviation(goal: dict, verification: dict) -> float:
    criteria = goal.get("criteria", [])
    if not criteria:
        return 0.0 if verification.get("all_passed") else 1.0

    passed = sum(
        1 for criterion in criteria
        if verification.get("items", {}).get(criterion, {}).get("passed", False)
    )
    return round(1 - passed / len(criteria), 3)
```

偏差用于结果判断和反思触发，不用于调整任务预算或执行路径。

## 9. 归档校验

```python
def validate_archive(current_path: str, history_path: str, index_path: str) -> dict:
    return {
        "current_removed": not exists(current_path),
        "history_exists": exists(history_path),
        "index_updated": exists(index_path),
    }
```

只有任务文件移动成功、历史文件存在并完成月度索引更新，归档才算完成。
