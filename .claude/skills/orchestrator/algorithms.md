# Orchestrator 通用算法

## 1. 路由决策

```python
def choose_route(intent: dict, match: dict) -> str:
    risk = intent.get("risk_level", "unknown")
    score = intent.get("complexity_assessment", {}).get("score", 99)
    confidence = intent.get("confidence", 0)
    matched = match.get("matched_skills", [])
    has_dependencies = bool(match.get("dependencies"))

    unsafe = (
        risk in {"high", "unknown"}
        or intent.get("requires_confirmation", False)
        or intent.get("ambiguity", True)
    )
    fast_eligible = (
        not unsafe
        and confidence >= 0.85
        and score <= 3
        and len(matched) == 1
        and not has_dependencies
        and intent.get("statefulness", "stateless") == "stateless"
    )
    return "fast" if fast_eligible else "durable"
```

安全和明确度优先于复杂度。旧版 Skill 未声明风险元数据时按 Durable Path 处理。

## 2. Skill 匹配评分与选择说明

```python
def build_selection_record(intent: dict, candidates: list[dict]) -> dict:
    ranked = sorted(candidates, key=lambda item: item["match_score"], reverse=True)
    selected = ranked[0]
    return {
        "main_skill": selected["name"],
        "matched_keywords": selected.get("matched_keywords", []),
        "match_score": round(selected["match_score"], 3),
        "selection_reason": explain_selection(intent, ranked),
        "dependencies": selected.get("depends_on", []),
    }
```

`selection_reason` 必须基于实际匹配结果生成，至少说明用户意图与主 Skill 能力的对应关系；多个候选时还要说明选择最高分、唯一满足条件或用户确认的依据。无法可靠计算分数时输出 `unknown`，不得使用默认分数冒充真实结果。选择记录在 Fast → Durable 升级时保持不变，仅追加升级原因。


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

明确单意图且唯一高置信度匹配时直接选择；仅在多个候选分数接近、用户意图包含多个动作或置信度不足时展示候选和请求澄清。匹配完成后缓存注册元数据，避免重复读取。

## 3. 依赖图构建

Durable Path 才构建完整 DAG。Fast Path 仅检查主 Skill 是否声明依赖；一旦发现依赖立即升级。

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

## 4. 并行层与执行模式

`identify_parallel_layers` 只生成计划层，默认执行模式为 `serial_by_default`。没有状态隔离、副作用协调和失败合并能力时，不启用真实并行。

## 5. 按需历史相似度

历史检索只有在以下条件满足时触发：用户明确要求参考历史、需要恢复任务、需要复用历史模式，或 Durable Path 需要确认存在同构任务。Fast Path 默认跳过。

```python
def should_retrieve_history(intent: dict, route: str) -> bool:
    if route == "fast":
        return False
    return any([
        intent.get("user_requested_history", False),
        intent.get("requires_recovery", False),
        intent.get("reuse_historical_pattern", False),
        intent.get("requires_estimation", False),
    ])
```

历史结果只能补充上下文，不能替代当前任务的执行和校验。

## 6. 共享上下文

共享上下文只在 Durable Path 持久化，采用带 Skill 名称的 marker，保留已有结果和日志，不允许覆盖。

## 7. 分级结果校验

```python
def validate_result(task, level: str) -> dict:
    if level == "L0":
        return validate_minimum_output(task)

    verification = verify_completion_criteria(task)
    criteria = task.get("goal", {}).get("criteria", [])
    deviation = calculate_deviation(task.get("goal", {}), verification) if criteria else None
    passed = verification["all_passed"] and (deviation is None or deviation < 0.2)
    return {
        "level": level,
        "passed": passed,
        "failed_criteria": verification.get("failed_items", []),
        "deviation": deviation,
        "risk_notes": verification.get("risk_notes", []),
        "needs_resume": not passed,
        "reflection_attempts": 0,
        "recommended_next_action": "archive" if passed else "reflect",
    }
```

L0 只检查输出存在、非空、无明显错误和最低完成标准。L1 检查 Durable Path 的目标标准。L2 仅在 L1 失败、高风险或用户要求时触发，默认反思次数为 0，触发后最多 3 次。

## 8. 结果偏差

```python
def calculate_deviation(goal: dict, verification: dict) -> float | None:
    criteria = goal.get("criteria", [])
    if not criteria:
        return None

    passed = sum(
        1 for criterion in criteria
        if verification.get("items", {}).get(criterion, {}).get("passed", False)
    )
    return round(1 - passed / len(criteria), 3)
```

没有量化目标时返回 `None`，不强行制造偏差数值。

## 9. 归档校验

只有 Durable Path 进入归档。归档失败时保留当前任务文件和最终结果，不覆盖错误日志；只验证本次任务的来源、目标和索引，不要求当前目录全局为空。
