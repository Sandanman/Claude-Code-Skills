# Orchestrator 核心算法实现（v1.2）

本文档提供 Orchestrator v1.2 的核心算法伪代码实现。

---

## 算法索引

| 编号 | 算法名称 | 复杂度 | 用途 |
|------|---------|--------|------|
| 1 | 意图识别算法 | O(n) | LLM驱动 + fallback |
| 2 | 历史相似度计算 | O(k×m) | Jaccard + 加权维度 |
| 3 | 主skill匹配算法 | O(n×m) | 关键词+领域+操作 评分 |
| 4 | DAG构建与循环检测 | O(V+E) | 依赖图构建 |
| 5 | Kahn拓扑排序 | O(V+E) | 执行顺序生成 |
| 6 | 并行层识别算法 | O(V²) | 可并行技能分组 |
| 7 | 完成标准验证 | O(n) | 各原子skill标准校验 |
| 8 | 目标偏差量化 | O(n) | 加权偏差计算 |
| 9 | 错误影响评估 | O(5) | 5维度评分模型 |
| 10 | 反思重规划算法 | O(n×m) | 问题分类 + 调整生成 |

---

## 算法1：意图识别算法

### 1.1 LLM意图识别（主方案）

```python
def llm_intent_recognition(user_input: str,
                             main_skills_list: list = None,
                             project_context: str = None) -> dict:
    """
    LLM驱动的意图识别函数

    Args:
        user_input: 用户原始输入
        main_skills_list: 已注册主skill列表（用于上下文）
        project_context: 项目上下文（如 project_context.json 内容）

    Returns:
        dict: 结构化意图对象
    """
    from config import LLM_INTENT_CONFIG

    # Step 1: 构造Prompt
    skills_text = "\n".join([
        f"- {s['name']}: {s['desc']}"
        for s in (main_skills_list or [])
    ]) or "（无可用技能列表）"

    user_prompt = INTENT_USER_TEMPLATE.format(
        user_input=user_input,
        main_skills_list=skills_text,
        project_context=project_context or "（无项目上下文）"
    )

    # Step 2: 调用LLM
    try:
        response = client.messages.create(
            model=LLM_INTENT_CONFIG["model"],
            max_tokens=LLM_INTENT_CONFIG["max_tokens"],
            system=INTENT_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
            temperature=LLM_INTENT_CONFIG["temperature"]
        )
        raw_response = response.content[0].text.strip()
    except Exception as e:
        print(f"[意图识别] LLM调用失败: {e}，使用规则算法 fallback")
        return rule_based_intent_recognition(user_input)

    # Step 3: 解析JSON
    import re, json
    json_match = re.search(r'\{[\s\S]*\}', raw_response, re.MULTILINE)
    if not json_match:
        return rule_based_intent_recognition(user_input)
    try:
        intent_data = json.loads(json_match.group())
    except json.JSONDecodeError:
        return rule_based_intent_recognition(user_input)

    # Step 4: 验证必需字段
    required_fields = [
        "intent_id", "domain", "action", "target",
        "constraints", "keywords", "success_criteria",
        "original_input", "complexity_assessment", "confidence"
    ]
    if any(f not in intent_data for f in required_fields):
        return rule_based_intent_recognition(user_input)

    # Step 5: 补充和标准化
    import time, random
    if not intent_data["intent_id"].startswith("INT_"):
        intent_data["intent_id"] = f"INT_{time.strftime('%Y%m%d%H%M%S')}_{random.randint(1000, 9999)}"

    if isinstance(intent_data["target"], str):
        intent_data["target"] = {"type": "unknown", "name": intent_data["target"], "path": ""}

    # Step 6: 添加元数据
    intent_data["recognition_method"] = "llm"
    intent_data["llm_model"] = LLM_INTENT_CONFIG["model"]
    intent_data["recognition_timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")

    return intent_data
```

### 1.2 规则意图识别（fallback）

```python
def rule_based_intent_recognition(user_input: str) -> dict:
    """规则算法意图识别（LLM不可用时的fallback）"""
    import time, random

    def detect_domain(text):
        domain_keywords = {
            "frontend": ["vue", "react", "组件", "页面", "样式", "css", "html", "前端"],
            "backend": ["api", "接口", "后端", "数据库", "server", "node"],
            "database": ["sql", "mongodb", "数据库", "表结构"],
            "security": ["安全", "认证", "授权", "登录", "权限", "加密"],
            "testing": ["测试", "test", "单元测试", "e2e"],
            "refactoring": ["重构", "优化", "简化", "重写"],
            "debugging": ["bug", "错误", "修复", "问题", "调试"]
        }
        text_lower = text.lower()
        for domain, keywords in domain_keywords.items():
            if any(kw in text_lower for kw in keywords):
                return domain
        return "general"

    def extract_action(text):
        action_keywords = {
            "fix": ["修复", "解决", "bug", "错误", "问题"],
            "create": ["新建", "创建", "实现", "添加"],
            "optimize": ["优化", "改进", "提升", "性能"],
            "refactor": ["重构", "重写", "简化"],
            "analyze": ["分析", "扫描", "诊断", "检查"],
            "document": ["文档", "注释", "说明"],
            "test": ["测试", "验证"],
            "deploy": ["部署", "发布", "上线"]
        }
        text_lower = text.lower()
        for action, keywords in action_keywords.items():
            if any(kw in text_lower for kw in keywords):
                return action
        return "create"

    def extract_target(text):
        return {"type": "unknown", "name": text[:50], "path": ""}

    def extract_keywords(text):
        stop_words = {"的", "是", "在", "和", "了", "我", "你"}
        words = [w for w in text if len(w) > 1 and w not in stop_words]
        return list(set(words))[:10]

    def calculate_complexity(text):
        score = 3
        step_indicators = ["然后", "接着", "最后", "第一", "第二", "第三"]
        file_indicators = ["多个", "几个", "不同的", "多个文件"]
        if any(ind in text for ind in step_indicators): score += 2
        if any(ind in text for ind in file_indicators): score += 1
        if len(text) > 100: score += 1
        return min(max(score, 1), 10)

    return {
        "intent_id": f"INT_{time.strftime('%Y%m%d%H%M%S')}_{random.randint(1000, 9999)}",
        "domain": detect_domain(user_input),
        "action": extract_action(user_input),
        "target": extract_target(user_input),
        "constraints": [],
        "keywords": extract_keywords(user_input),
        "success_criteria": f"完成需求：{user_input[:50]}",
        "original_input": user_input[:200],
        "complexity_score": calculate_complexity(user_input),
        "complexity_assessment": {
            "is_simple": calculate_complexity(user_input) <= 3,
            "complexity_score": calculate_complexity(user_input),
            "reasoning": "规则算法生成",
            "requires_multiple_steps": calculate_complexity(user_input) > 3,
            "needs_state": False,
            "requires_multiple_skills": False,
            "involves_multiple_files": len(user_input) > 100,
            "has_branching": False
        },
        "confidence": {"overall": 0.5, "uncertain_aspects": ["LLM不可用，使用规则算法"]},
        "recognition_method": "rule_based_fallback",
        "recognition_timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
```

### 1.3 统一入口

```python
def recognize_intent(user_input: str,
                    use_llm: bool = True,
                    main_skills_list: list = None,
                    project_context: str = None) -> dict:
    """统一的意图识别入口函数"""
    from config import LLM_INTENT_CONFIG

    if not use_llm or not LLM_INTENT_CONFIG.get("enabled", True):
        return rule_based_intent_recognition(user_input)

    return llm_intent_recognition(
        user_input=user_input,
        main_skills_list=main_skills_list,
        project_context=project_context
    )
```

---

## 算法2：历史相似度计算

### 2.1 特征提取

```python
def extract_intent_features(intent: dict) -> dict:
    """提取意图特征向量"""
    return {
        "domain": intent.get("domain", ""),
        "action": intent.get("action", ""),
        "target_type": intent.get("target", {}).get("type", ""),
        "keywords": set(intent.get("keywords", [])),
        "complexity": intent.get("complexity_score", 3),
    }
```

### 2.2 相似度计算

```python
def calculate_similarity(intent_a: dict, intent_b: dict) -> float:
    """
    计算两个意图的相似度（0.0 ~ 1.0）
    权重：domain=0.25, action=0.20, keywords=0.30, target_type=0.15, complexity=0.10
    """
    features_a = extract_intent_features(intent_a)
    features_b = extract_intent_features(intent_b)

    # 1. 领域匹配（精确）
    domain_sim = 1.0 if features_a["domain"] == features_b["domain"] else 0.0

    # 2. 操作匹配（精确）
    action_sim = 1.0 if features_a["action"] == features_b["action"] else 0.0

    # 3. 关键词Jaccard相似度（最重要）
    kw_a = features_a["keywords"]
    kw_b = features_b["keywords"]
    if kw_a and kw_b:
        keyword_sim = len(kw_a & kw_b) / len(kw_a | kw_b)
    else:
        keyword_sim = 0.0

    # 4. 目标类型匹配
    target_sim = 1.0 if features_a["target_type"] == features_b["target_type"] else 0.0

    # 5. 复杂度相似度
    complexity_diff = abs(features_a["complexity"] - features_b["complexity"])
    complexity_sim = max(0, 1 - complexity_diff / 10)

    # 加权求和
    similarity = (
        0.25 * domain_sim +
        0.20 * action_sim +
        0.30 * keyword_sim +
        0.15 * target_sim +
        0.10 * complexity_sim
    )

    return similarity
```

### 2.3 Top-K 召回

```python
def retrieve_similar_history(intent: dict,
                              monthly_index: list,
                              top_k: int = 5,
                              threshold: float = 0.85) -> list:
    """
    从月度索引中召回最相似的Top-K历史任务

    Args:
        intent: 当前意图
        monthly_index: 月度索引列表（每个元素含 intent_json 字段）
        top_k: 召回数量
        threshold: 相似度阈值（≥ threshold 为高度相似）

    Returns:
        list: [{task_id, similarity, task_path}, ...] 按相似度降序
    """
    scored = []
    for entry in monthly_index:
        # 月度索引中存储了 intent_json 字段
        historical_intent = entry.get("intent_json", {})
        similarity = calculate_similarity(intent, historical_intent)
        scored.append({
            "task_id": entry["task_id"],
            "similarity": similarity,
            "task_path": entry["archive_path"],
            "result_summary": entry.get("result_summary", ""),
            "main_skill": entry.get("main_skill", "")
        })

    # 按相似度降序
    scored.sort(key=lambda x: x["similarity"], reverse=True)

    # 分类
    high_similarity = [s for s in scored if s["similarity"] >= threshold]
    candidates = scored[:top_k]

    return {
        "high_similarity": high_similarity,  # ≥ 0.85：直接复用
        "candidates": candidates              # Top-K：展示参考
    }
```

---

## 算法3：主skill匹配算法

### 3.1 匹配分数计算

```python
def calculate_match_score(intent: dict, skill: dict) -> float:
    """
    计算意图与主skill的匹配分数
    权重：关键词=0.5, 领域=0.3, 操作=0.2（归一化）
    """
    score = 0.0
    keywords = set(intent.get("keywords", []))
    match_keywords = set(skill.get("match_keywords", []).split(", "))

    # 1. 关键词精确匹配（权重0.5，对应匹配词数）
    keyword_matches = keywords & match_keywords
    keyword_score = len(keyword_matches) * 0.5

    # 2. 领域匹配（权重0.3）
    domain_score = 0.3 if intent.get("domain", "") in skill.get("core_ability", "") else 0.0

    # 3. 操作类型匹配（权重0.2）
    action_score = 0.2 if intent.get("action", "") in skill.get("match_keywords", "") else 0.0

    total_score = keyword_score + domain_score + action_score

    # 归一化
    max_possible = len(keywords) * 0.5 + 0.3 + 0.2
    return total_score / max_possible if max_possible > 0 else 0.0


def match_main_skill(intent: dict, skills_register: list) -> tuple:
    """
    匹配主skill

    Returns:
        (matched_skills, match_type)
        - match_type: "no_match" | "unique" | "multiple" | "combo"
        - matched_skills: None | 单个skill | [skill1, skill2] 列表
    """
    candidates = []
    for skill in skills_register:
        if skill.get("status") != "启用":
            continue
        score = calculate_match_score(intent, skill)
        if score >= 0.4:  # 最低匹配分数
            candidates.append({"skill": skill, "score": score})

    candidates.sort(key=lambda x: x["score"], reverse=True)

    if not candidates:
        return None, "no_match"
    elif len(candidates) == 1:
        return candidates[0]["skill"], "unique"
    else:
        return [c["skill"] for c in candidates[:3]], "multiple"


def detect_skill_combo(intent: dict, matched_skills: list) -> bool:
    """
    检测是否需要多skill组合
    触发条件：复杂度 ≥ 7 或意图涉及多领域
    """
    complexity = intent.get("complexity_score", 3)
    return complexity >= 7 or len(matched_skills) > 1
```

---

## 算法4：DAG构建与循环检测

```python
def build_dependency_graph(atomic_skills: list) -> tuple:
    """
    构建依赖图并检测循环依赖

    Returns:
        (graph, in_degree, error_msg)
        - graph: {skill_name: [dependent_skills]}
        - in_degree: {skill_name: number_of_dependencies}
        - error_msg: None表示成功，"循环依赖"表示失败
    """
    graph = {s["name"]: [] for s in atomic_skills}
    in_degree = {s["name"]: 0 for s in atomic_skills}

    for skill in atomic_skills:
        dep_str = skill.get("depend", "无")
        if dep_str and dep_str != "无":
            for dep in dep_str.split(", "):
                dep = dep.strip()
                if dep in graph:
                    graph[dep].append(skill["name"])
                    in_degree[skill["name"]] += 1
                else:
                    print(f"[DAG] 警告：技能 {skill['name']} 依赖的 {dep} 不存在")

    # 检测循环依赖（DFS）
    visited = set()
    rec_stack = set()

    def has_cycle(node):
        visited.add(node)
        rec_stack.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                if has_cycle(neighbor):
                    return True
            elif neighbor in rec_stack:
                return True
        rec_stack.remove(node)
        return False

    for node in graph:
        if node not in visited:
            if has_cycle(node):
                return None, None, "检测到循环依赖"

    return graph, in_degree, None


def get_dependencies(skill_name: str, graph: dict) -> list:
    """获取某skill的所有依赖（反向查询）"""
    deps = []
    for dep, dependents in graph.items():
        if skill_name in dependents:
            deps.append(dep)
    return deps
```

---

## 算法5：Kahn拓扑排序

```python
def topological_sort(graph: dict, in_degree: dict) -> list:
    """
    Kahn算法拓扑排序，返回顺序执行的skill列表

    Returns:
        list: 按执行顺序排列的skill名称
        None: 存在循环依赖
    """
    from collections import deque

    queue = deque([n for n in in_degree if in_degree[n] == 0])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(result) != len(in_degree):
        return None  # 循环依赖

    return result
```

---

## 算法6：并行层识别算法

```python
def identify_parallel_layers(sorted_skills: list,
                             graph: dict,
                             max_parallel: int = 2) -> list:
    """
    识别可并行执行的层

    同一层内的skill满足：所有依赖都已在之前的层中完成
    跨层之间有依赖关系，必须串行

    Args:
        sorted_skills: 拓扑排序后的skill列表（执行顺序）
        graph: 依赖图 {dep: [dependent_skills]}
        max_parallel: 每层最大并行数（防止资源耗尽）

    Returns:
        list: [[skill_a, skill_b], [skill_c], [skill_d, skill_e]]
        即 list of list，每层内部可并行，层间必须串行
    """
    def get_deps(skill):
        """获取skill的直接依赖"""
        return [dep for dep, dependents in graph.items() if skill in dependents]

    layers = []
    assigned = set()
    remaining = list(sorted_skills)

    while remaining:
        parallel = []
        for skill in remaining:
            deps = get_deps(skill)
            # 所有依赖都已在之前的层中完成
            if all(dep in assigned for dep in deps):
                parallel.append(skill)

        if not parallel:
            # 剩下的是循环依赖部分，按原顺序处理
            parallel = remaining[:1]
            print(f"[并行识别] 警告：剩余技能 {remaining} 存在循环依赖，强制串行")

        # 限制每层并行数
        parallel = parallel[:max_parallel]
        layers.append(parallel)
        assigned.update(parallel)
        remaining = [s for s in remaining if s not in assigned]

    return layers


def flatten_layers(layers: list) -> list:
    """将并行层展平为执行顺序列表"""
    return [skill for layer in layers for skill in layer]
```

---

## 算法7：完成标准验证

```python
def verify_completion(task_skill: dict, skill_results: dict) -> dict:
    """
    验证所有完成标准

    Args:
        task_skill: 任务文件内容
        skill_results: {skill_name: {"status": "completed/failed", "output": {...}}}

    Returns:
        dict: {
            "all_passed": bool,
            "passed_count": int,
            "total_count": int,
            "details": [{"criterion": str, "passed": bool, "details": str}, ...]
        }
    """
    standards = task_skill.get("completion_standards", [])
    results = []

    for std in standards:
        criterion = std.get("criterion", "")
        std_type = std.get("type", "file_exists")  # file_exists | code_function | user_confirm
        std_path = std.get("path", "")
        std_value = std.get("expected_value", None)

        if std_type == "file_exists":
            import os
            passed = os.path.exists(std_path)
            details = f"路径: {std_path}，{'存在' if passed else '不存在'}"

        elif std_type == "code_function":
            # 运行测试或验证函数
            actual = skill_results.get(std.get("skill_name", ""), {}).get("output", {}).get(std_value)
            passed = actual is not None
            details = f"实际值: {actual}"

        elif std_type == "user_confirm":
            passed = std.get("confirmed", False)
            details = "用户确认" if passed else "未确认"

        else:
            passed = False
            details = f"未知标准类型: {std_type}"

        results.append({
            "criterion": criterion,
            "passed": passed,
            "details": details
        })

    passed_count = sum(1 for r in results if r["passed"])
    return {
        "all_passed": passed_count == len(results),
        "passed_count": passed_count,
        "total_count": len(results),
        "details": results
    }
```

---

## 算法8：目标偏差量化

```python
def calculate_deviation(goal: dict, verification_result: dict) -> float:
    """
    计算目标偏差值（0.0 ~ 1.0+）
    < 0.1：优秀；0.1~0.2：合格；≥ 0.2：触发反思
    """
    details = verification_result.get("details", [])

    if not details:
        return 1.0  # 无验证结果，视为最大偏差

    failed_count = sum(1 for d in details if not d["passed"])
    total_count = len(details)

    # 基础偏差 = 失败率
    base_deviation = failed_count / total_count if total_count > 0 else 1.0

    # 根据goal中的权重调整（如有）
    weights = goal.get("standard_weights", {})
    if weights:
        weighted = 0.0
        total_weight = 0.0
        for detail in details:
            w = weights.get(detail["criterion"], 1.0)
            weighted += (0 if detail["passed"] else 1) * w
            total_weight += w
        deviation = weighted / total_weight if total_weight > 0 else base_deviation
    else:
        deviation = base_deviation

    return deviation


def assess_deviation_level(deviation: float) -> str:
    """评估偏差等级"""
    if deviation < 0.1:
        return "优秀"
    elif deviation < 0.2:
        return "合格"
    else:
        return "不合格（触发反思）"
```

---

## 算法9：错误影响评估

```python
def assess_error_impact(failed_skill: dict,
                         task_context: dict,
                         graph: dict) -> dict:
    """
    评估原子skill失败的影响（5维度评分）

    维度：
    1. 依赖关系影响（权重3）
    2. 核心功能影响（权重2）
    3. 数据一致性影响（权重2）
    4. 可恢复性（权重-1）
    5. 用户指定重要性（权重2）

    Returns:
        dict: {
            "score": int,
            "level": "轻微/中等/严重",
            "action": "continue/pause/stop",
            "dependent_skills": [list]
        }
    """
    score = 0

    # 1. 依赖关系影响
    dependent_skills = [
        name for name, deps in graph.items()
        if failed_skill["name"] in deps
    ]
    if dependent_skills:
        score += 3

    # 2. 核心功能影响
    if failed_skill.get("is_core", False):
        score += 2

    # 3. 数据一致性影响
    if failed_skill.get("modifies_shared_data", False):
        score += 2

    # 4. 可恢复性
    if failed_skill.get("output_reproducible", True):
        score -= 1

    # 5. 用户指定重要性
    if failed_skill.get("user_required", False):
        score += 2

    # 判断等级
    if score >= 5:
        level, action = "严重", "pause"
    elif score >= 3:
        level, action = "中等", "prompt_user"
    else:
        level, action = "轻微", "continue"

    return {
        "score": score,
        "level": level,
        "action": action,
        "dependent_skills": dependent_skills
    }
```

---

## 算法10：反思重规划算法

```python
def classify_reflection_issue(task_context: dict,
                              skill_results: dict) -> list:
    """
    分类反思问题

    Returns:
        list: [{"type": str, "description": str, "solution": str}, ...]
    """
    issues = []

    # 1. 执行顺序问题
    failed_order = detect_suboptimal_order(task_context, skill_results)
    if failed_order:
        issues.append({
            "type": "execution_order",
            "description": "执行顺序非最优",
            "solution": "调整原子skill执行顺序"
        })

    # 2. 技能匹配问题
    missing_skills = detect_skill_gaps(task_context, skill_results)
    if missing_skills:
        issues.append({
            "type": "skill_selection",
            "description": f"存在更合适的原子skill未被使用：{missing_skills}",
            "solution": "补充同类型原子skill"
        })

    # 3. 标准设定问题
    unrealistic = detect_unrealistic_standards(task_context, skill_results)
    if unrealistic:
        issues.append({
            "type": "standard_setting",
            "description": "完成标准过于严格",
            "solution": "优化完成标准（不降低最终目标）"
        })

    return issues


def plan_adjustment(task_skill: dict,
                     issues: list,
                     max_additional: int = 3) -> dict:
    """
    生成调整方案

    Returns:
        dict: {
            "adjustments": [{"type": "add" | "remove" | "reorder", "skill": str}, ...],
            "new_order": [skill_names],
            "added_skills": [skill_names],
            "removed_skills": [skill_names]
        }
    """
    adjustments = []
    added = []
    removed = []

    for issue in issues:
        if issue["type"] == "skill_selection":
            # 补充同类型原子skill（最多3个）
            suggested = get_similar_skills(issue["solution"], max_additional)
            for s in suggested:
                if s not in task_skill["atomic_skills"]:
                    adjustments.append({"type": "add", "skill": s})
                    added.append(s)
        elif issue["type"] == "execution_order":
            # 调整顺序（不违反依赖）
            new_order = reorder_skills(task_skill["atomic_skills"])
            adjustments.append({"type": "reorder", "order": new_order})

    return {
        "adjustments": adjustments,
        "new_order": adjustments[0].get("order") if adjustments and "order" in adjustments[0] else None,
        "added_skills": added,
        "removed_skills": removed
    }


def reflection_loop(task_skill: dict,
                     skill_results: dict,
                     max_attempts: int = 3) -> dict:
    """
    反思重规划循环

    Returns:
        dict: {
            "success": bool,
            "attempts": int,
            "final_deviation": float,
            "adjustments_history": [adjustments, ...],
            "reflection_log": str  # 最多300字
        }
    """
    from config import REFLECTION_CONFIG

    adjustments_history = []
    reflection_log_parts = []

    for attempt in range(1, max_attempts + 1):
        # 校验
        verification = verify_completion(task_skill, skill_results)
        deviation = calculate_deviation(task_skill.get("goal", {}), verification)

        if verification["all_passed"] and deviation < REFLECTION_CONFIG["目标偏差阈值"]:
            # 反思成功
            reflection_log = generate_reflection_log(
                adjustments_history, success=True, deviation=deviation
            )
            return {
                "success": True,
                "attempts": attempt,
                "final_deviation": deviation,
                "adjustments_history": adjustments_history,
                "reflection_log": reflection_log
            }

        # 触发反思
        issues = classify_reflection_issue(task_skill, skill_results)
        adjustments = plan_adjustment(task_skill, issues)

        adjustments_history.append({
            "attempt": attempt,
            "issues": issues,
            "adjustments": adjustments
        })

        # 应用调整
        apply_adjustments(task_skill, adjustments)
        reflection_log_parts.append(
            f"第{attempt}次：{', '.join(i['description'] for i in issues)}"
        )

    # 3次反思后仍不达标
    reflection_log = generate_reflection_log(
        adjustments_history, success=False,
        deviation=deviation,
        max_length=REFLECTION_CONFIG["反思日志最大长度"]
    )
    return {
        "success": False,
        "attempts": max_attempts,
        "final_deviation": deviation,
        "adjustments_history": adjustments_history,
        "reflection_log": reflection_log
    }
```

---

## 版本信息

- **版本**: 1.2
- **最后更新**: 2026-05-21
- **算法数量**: 10个核心算法
- **代码行数**: ~600行伪代码