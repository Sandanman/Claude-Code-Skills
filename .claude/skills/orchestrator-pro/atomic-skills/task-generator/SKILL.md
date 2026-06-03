---
name: task-generator
description: 任务生成（τ 增强版）— 增加 Task Folding 折叠决策模块
---

# Task Generator 原子 Skill（τ 增强版）

## 版本历史
- v1.0 (2026-06-02): 基于 v1.2 增强，增加 Task Folding（逻辑折叠）能力

---

## 1. 核心定位

继承 v1.2 task-generator 的完整逻辑（DAG 构建 + 拓扑排序 + 并行层识别），增加：
- **Task Folding 折叠决策**：在 DAG 构建后评估是否触发折叠
- **折叠后重计算**：折叠后重新构建并行层和 τ 预算

---

## 2. Task Folding 增强流程

### 2.1 在 DAG 构建后执行折叠评估

```python
def generate_task_with_folding(intent: dict,
                                 matched_skill: dict,
                                 atomic_skills_list: list,
                                 tau_controller: TauController) -> dict:
    """
    增强版任务生成：
    1. 构建 DAG（已有）
    2. Task Folding 决策（新增）
    3. 折叠后重新构建并行层（新增）
    4. 生成 task_skill.md（已有）
    """
    # Step 1: DAG 构建（继承 v1.2）
    graph, in_degree, dag_error = build_dependency_graph(atomic_skills_list)
    if dag_error:
        return {"error": dag_error}

    # Step 2: Kahn 拓扑排序（继承 v1.2）
    sorted_skills = topological_sort(graph, in_degree)
    if not sorted_skills:
        return {"error": "循环依赖"}

    # Step 3: 并行层识别（继承 v1.2）
    parallel_layers = identify_parallel_layers(sorted_skills, graph)

    # ========== τ 增强：Task Folding ==========
    # 在 DAG 构建后、生成 task_skill.md 前，评估折叠
    tau_remaining_pct = tau_controller.get_remaining_pct()
    current_depth = len(parallel_layers)
    fold_config = load_fold_config()  # 从 config.md 读取

    fold_result = tau_controller.should_fold(
        tau_remaining_pct=tau_remaining_pct,
        current_depth=current_depth,
        fold_triggers=fold_config["FOLD_TRIGGERS"]
    )

    if fold_result["should_fold"]:
        # 执行折叠
        fold_decision = should_fold(
            tau_remaining_pct,
            current_depth,
            tau_controller.fold_count,
            fold_config["FOLD_TRIGGERS"]
        )
        if fold_decision["should_fold"]:
            foldable_groups = find_foldable_groups(
                parallel_layers,
                atomic_skills_list,
                fold_config
            )
            if foldable_groups:
                new_layers, fold_record = apply_folding(
                    foldable_groups,
                    parallel_layers,
                    fold_config,
                    tau_controller.fold_count
                )
                parallel_layers = new_layers
                tau_controller.fold_count = fold_record["fold_depth"]
                tau_controller.fold_history.append(fold_record)

    # Step 4: 生成 task_skill.md（继承 v1.2 逻辑）
    task_id = generate_task_id()
    task_skill_md = create_task_skill_file(
        task_id=task_id,
        intent=intent,
        matched_skill=matched_skill,
        parallel_layers=parallel_layers,
        tau_metadata=tau_controller.metadata
    )

    return {
        "task_id": task_id,
        "task_skill_md": task_skill_md,
        "fold_result": fold_result,
        "parallel_layers": parallel_layers,
        "tau_metadata": tau_controller.metadata,
    }
```

### 2.2 折叠保护检查

```python
def is_protected(skill: dict, protected_config: dict) -> bool:
    """
    检查 skill 是否受折叠保护
    """
    if protected_config["user_required"] and skill.get("user_required"):
        return True
    if protected_config["is_core"] and skill.get("is_core"):
        return True
    if protected_config["cross_domain"] and skill.get("cross_domain"):
        return True
    if protected_config["detailed_mode"] and skill.get("detailed_mode"):
        return True
    return False


def find_foldable_groups(parallel_layers: list,
                          skill_definitions: list,
                          config: dict) -> list:
    """
    识别可折叠组
    折叠条件：
    1. 连续同 domain skill ≥ 2 个
    2. 共享输入上下文
    3. 无跨组依赖
    4. 合并后的 skill 存在
    """
    groups = []
    skill_map = {s["name"]: s for s in skill_definitions}

    for layer_idx, layer in enumerate(parallel_layers):
        # 按 domain 分组
        by_domain = {}
        for skill in layer:
            domain = skill.get("domain", "unknown")
            if domain not in by_domain:
                by_domain[domain] = []
            by_domain[domain].append(skill)

        for domain, skills in by_domain.items():
            if len(skills) >= config["FOLD_TRIGGERS"]["min_group_size"]:  # ≥ 2
                # 检查可合并性
                if can_merge_skills(skills, parallel_layers, skill_map):
                    groups.append(skills)

    return groups
```

---

## 3. 继承自 v1.2 的完整逻辑

v1.2 的所有功能（task_id 生成、DAG 构建、循环依赖检测、Kahn 拓扑排序、并行层识别、task_skill.md 生成）完全保留。

---

## 4. 完成标准

1. DAG 构建正确（已有）
2. 循环依赖检测正确（已有）
3. Task Folding 在满足条件时被正确触发
4. 折叠后并行层结构正确重建
5. 折叠历史被记录到 task_skill.md

---

## 5. 原子 Skill 位置

`.claude/skills/orchestrator-pro/atomic-skills/task-generator/SKILL.md`