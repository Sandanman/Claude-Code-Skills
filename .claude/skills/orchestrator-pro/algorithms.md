# Orchestrator Pro 核心算法实现（v1.0）

本文档在 v1.2 的 10 个算法基础上，新增 6 个 τ 增强相关算法。

---

## 算法索引（v1.0 新增）

| 编号 | 算法名称 | 复杂度 | 用途 |
|------|---------|--------|------|
| 11 | τ 测量算法 | O(1) | duration × 0.5 + tokens × 0.001 |
| 12 | Task Folding 折叠决策 | O(V²) | 识别可折叠组 |
| 13 | Skill Stacking 命中计算 | O(V) | 命中率统计 |
| 14 | Pattern Mining 匹配 | O(V×W) | LCS + 多维特征 |
| 15 | Co-Design 贡献度矩阵 | O(V) | 三层贡献分解 |
| 16 | τ 预算动态分配 | O(V) | 借位策略 |

---

## 算法11：τ 测量算法

### 11.1 τ 计算公式

```python
def measure_tau(duration_ms: float, tokens: int) -> float:
    """
    τ = duration_ms × 0.5 + tokens × 0.001
    权重：50% 执行延迟，50% token 消耗
    """
    return duration_ms * 0.5 + tokens * 0.001


def calculate_efficiency_score(task_quality: float,
                               pattern_discount: float,
                               stack_discount: float,
                               tau_consumed: float,
                               tau_budget: float) -> float:
    """
    τ_efficiency_score = (task_quality × (1-pattern_discount) × (1-stack_discount)) / (tau_consumed / tau_budget)

    示例：
    - 任务质量 0.9，pattern 折扣 25%，stack 折扣 10%
    - 消耗 7500 / 预算 15000 = 0.5
    - score = 0.9 × 0.75 × 0.9 / 0.5 = 1.215（优秀）

    评分标准：
    - > 0.8：优秀
    - 0.5-0.8：合格
    - < 0.5：不合格
    """
    quality_factor = task_quality * (1 - pattern_discount) * (1 - stack_discount)
    utilization = tau_consumed / tau_budget if tau_budget > 0 else 1.0
    return quality_factor / utilization
```

### 11.2 τ 档位判断

```python
def determine_tau_tier(complexity_score: int) -> str:
    """
    根据复杂度分判断 τ 档位
    simple: 1-3, moderate: 4-6, complex: 7-10
    """
    if complexity_score <= 3:
        return "simple"
    elif complexity_score <= 6:
        return "moderate"
    else:
        return "complex"


def allocate_tau_budget(tier: str, budgets: dict) -> dict:
    """
    根据档位分配 τ 预算
    """
    return budgets.get(tier, budgets["moderate"])
```

---

## 算法12：Task Folding 折叠决策

### 12.1 可折叠组识别

```python
def find_foldable_groups(parallel_layers: list,
                          skill_definitions: dict) -> list:
    """
    识别可折叠的连续同 domain skill 组

    Returns:
        list: [[skill_a, skill_b], [skill_c, skill_d, skill_e], ...]
    """
    groups = []
    visited = set()

    for layer_idx, layer in enumerate(parallel_layers):
        for skill in layer:
            if skill["name"] in visited:
                continue
            # 同 layer 中找同 domain skill
            same_domain = [
                s for s in layer
                if s.get("domain") == skill.get("domain")
                and s["name"] not in visited
            ]
            if len(same_domain) >= 2:
                # 进一步检查：是否共享上下文，无中间依赖
                if can_merge(same_domain, parallel_layers):
                    groups.append(same_domain)
                    visited.update(s["name"] for s in same_domain)

    return groups


def can_merge(skills: list, parallel_layers: list) -> bool:
    """
    判断一组 skill 是否可合并：
    1. 共享输入上下文（同类型的读取需求）
    2. 无中间依赖（下游 skill 不依赖中间结果）
    3. 合并后的 skill 存在
    """
    # 检查共享上下文
    required_keys_sets = [set(s.get("required_keys", [])) for s in skills]
    common_keys = set.intersection(*required_keys_sets) if required_keys_sets else set()

    # 检查无中间依赖（skills 连续排列，无下游依赖）
    skill_names = {s["name"] for s in skills}

    for layer in parallel_layers:
        for s in layer:
            deps = set(s.get("depend", "").split(", "))
            if deps & skill_names and deps - skill_names:
                # 部分依赖在这组内，部分不在，不可折叠
                return False

    return len(common_keys) >= 1  # 至少共享一个上下文键


def can_merge(skills: list, parallel_layers: list) -> bool:
    """
    判断一组 skill 是否可合并：
    1. 共享输入上下文
    2. 无跨组依赖
    3. 合并后的 skill 存在于 skills_register
    """
    # 1. 共享上下文：至少有一个共同的 required_keys
    required_sets = [set(s.get("required_keys", [])) for s in skills]
    common = set.intersection(*required_sets) if required_sets else set()
    if not common:
        return False

    # 2. 检查 skill 之间是否有循环依赖
    skill_names = {s["name"] for s in skills}
    for s in skills:
        deps = set(s.get("depend", "").split(", "))
        if deps & skill_names and deps - skill_names:
            return False

    return True
```

### 12.2 折叠决策

```python
def should_fold(tau_remaining_pct: float,
                 current_depth: int,
                 fold_depth: int,
                 config: dict) -> bool:
    """
    判断是否需要 Task Folding
    触发条件（需同时满足）：
    1. τ_remaining < 30%
    2. 任务深度 > 3
    3. 折叠次数 < max_fold_depth
    """
    tc = config
    return (
        tau_remaining_pct < tc["FOLD_TRIGGERS"]["tau_remaining_pct"]
        and current_depth > tc["FOLD_TRIGGERS"]["depth_threshold"]
        and fold_depth < tc["FOLD_TRIGGERS"]["max_fold_depth"]
    )


def apply_folding(groups: list,
                   parallel_layers: list,
                   config: dict,
                   fold_depth: int) -> tuple:
    """
    执行折叠，返回折叠后的并行层和记录

    Returns:
        (new_parallel_layers, fold_record)
    """
    fold_record = {
        "fold_depth": fold_depth + 1,
        "fold_count": len(groups),
        "tau_savings": [],
        "folded_skills": [],
    }

    new_layers = []
    for layer in parallel_layers:
        remaining = [s for s in layer]
        folded_layer = []

        for group in groups:
            if all(s in remaining for s in group):
                # 执行折叠
                merged_skill = create_merged_skill(group, config)
                if merged_skill:
                    folded_layer.append(merged_skill)
                    for s in group:
                        remaining.remove(s)
                    tau_orig = sum(s.get("tau_estimated", 500) for s in group)
                    tau_new = merged_skill.get("tau_estimated", 300)
                    savings = (tau_orig - tau_new) / tau_orig if tau_orig > 0 else 0
                    fold_record["tau_savings"].append(savings)
                    fold_record["folded_skills"].append([s["name"] for s in group])

        # 剩余 skill 保留
        folded_layer.extend(remaining)
        if folded_layer:
            new_layers.append(folded_layer)

    return new_layers, fold_record


def create_merged_skill(group: list, config: dict) -> dict | None:
    """
    创建合并后的 skill（逻辑折叠）
    合并策略：从 fold-merge-candidates 配置中查找匹配
    """
    names = [s["name"] for s in group]
    merge_candidates = config.get("FOLD_MERGE_CANDIDATES", {})

    for candidate_name, candidate_members in merge_candidates.items():
        if all(n in candidate_members for n in names):
            return {
                "name": candidate_name,
                "domain": group[0].get("domain"),
                "desc": f"合并：{' + '.join(names)}",
                "tau_estimated": 300,  # 合并后 τ 估算
                "depend": group[0].get("depend", "无"),
                "is_folded": True,
                "folded_from": names,
            }
    return None
```

---

## 算法13：Skill Stacking 命中计算

```python
class StackHitTracker:
    """追踪 Skill Stacking 上下文命中率"""

    def __init__(self):
        self.total_read_attempts = 0
        self.shared_context_hits = 0
        self.reparse_events = []

    def record_read(self, skill_name: str, key: str, hit: bool):
        """记录一次读取尝试（hit=从共享上下文读取）"""
        self.total_read_attempts += 1
        if hit:
            self.shared_context_hits += 1
        else:
            self.reparse_events.append({
                "skill": skill_name,
                "key": key,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            })

    def get_hit_rate(self) -> float:
        """命中率 = 命中次数 / 总读取次数"""
        return self.shared_context_hits / self.total_read_attempts \
            if self.total_read_attempts > 0 else 0.0

    def get_reparse_skills(self) -> dict:
        """获取需要预加载的 skill（reparse 事件按 skill 聚合）"""
        reparse_by_skill = {}
        for event in self.reparse_events:
            skill = event["skill"]
            if skill not in reparse_by_skill:
                reparse_by_skill[skill] = []
            reparse_by_skill[skill].append(event)
        return reparse_by_skill


def calculate_stack_discount(hit_rate: float, config: dict) -> float:
    """
    根据命中率计算 τ 折扣
    命中率越高，τ 节省越多
    """
    min_rate = config["STACK_HIT_RATE_WARNING"]  # 0.50
    if hit_rate >= 0.8:
        return 0.10  # 高命中，τ 节省 10%
    elif hit_rate >= min_rate:
        return 0.05  # 正常命中，τ 节省 5%
    else:
        return 0.00  # 命中率不足，无折扣
```

---

## 算法14：Pattern Mining 匹配

### 14.1 模式特征提取

```python
def extract_pattern_features(intent: dict, skill_results: dict) -> dict:
    """
    从任务中提取模式特征（比 intent 更细粒度）

    特征维度：
    - domain_action: domain + action 组合
    - target_pattern: target type + name pattern
    - complexity_band: complexity 分段（1-3 / 4-6 / 7-10）
    - skill_sequence: 执行的 skill 序列（最重要）
    - constraint_pattern: 约束类型组合
    """
    skill_sequence = [
        r["skill_name"]
        for r in sorted(skill_results.values(), key=lambda x: x.get("order", 0))
        if r.get("status") == "completed"
    ]

    return {
        "domain_action": f"{intent.get('domain')}_{intent.get('action')}",
        "target_pattern": f"{intent.get('target', {}).get('type')}_{len(intent.get('target', {}).get('name', ''))}",
        "complexity_band": "low" if intent.get("complexity_score", 5) <= 3 else \
                          "mid" if intent.get("complexity_score", 5) <= 6 else "high",
        "skill_sequence": tuple(skill_sequence),
        "constraint_types": tuple(sorted(intent.get("constraints", []))),
        "keyword_set": frozenset(intent.get("keywords", [])),
    }


def calculate_pattern_similarity(features_a: dict, features_b: dict) -> float:
    """
    计算两个模式的相似度（0.0 ~ 1.0）
    使用加权多维特征匹配
    """
    scores = {}

    # 1. skill sequence（最重要，权重 0.40）
    seq_a = features_a.get("skill_sequence", ())
    seq_b = features_b.get("skill_sequence", ())
    scores["sequence"] = lcs_ratio(seq_a, seq_b)

    # 2. domain_action（权重 0.25）
    scores["domain_action"] = 1.0 if features_a.get("domain_action") == features_b.get("domain_action") else 0.0

    # 3. keyword Jaccard（权重 0.20）
    kw_a = features_a.get("keyword_set", frozenset())
    kw_b = features_b.get("keyword_set", frozenset())
    scores["keyword"] = len(kw_a & kw_b) / len(kw_a | kw_b) if kw_a and kw_b else 0.0

    # 4. complexity_band（权重 0.10）
    scores["complexity"] = 1.0 if features_a.get("complexity_band") == features_b.get("complexity_band") else 0.0

    # 5. constraint pattern（权重 0.05）
    scores["constraint"] = len(set(features_a.get("constraint_types", ())) & set(features_b.get("constraint_types", ()))) / \
                          max(len(set(features_a.get("constraint_types", ())) | set(features_b.get("constraint_types", ()))), 1)

    weighted = (
        0.40 * scores["sequence"]
        + 0.25 * scores["domain_action"]
        + 0.20 * scores["keyword"]
        + 0.10 * scores["complexity"]
        + 0.05 * scores["constraint"]
    )
    return weighted


def lcs_ratio(a: tuple, b: tuple) -> float:
    """计算两个序列的最长公共子序列比例"""
    if not a or not b:
        return 0.0
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(2)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i % 2][j] = dp[(i - 1) % 2][j - 1] + 1
            else:
                dp[i % 2][j] = max(dp[(i - 1) % 2][j], dp[i % 2][j - 1])
    lcs_len = dp[m % 2][n]
    return 2 * lcs_len / (m + n) if (m + n) > 0 else 0.0
```

### 14.2 模式匹配搜索

```python
def search_patterns(intent: dict,
                    skill_results: dict,
                    pattern_library: list,
                    threshold: float = 0.60) -> list:
    """
    在模式库中搜索相似模式

    Returns:
        list: [{"pattern": {...}, "similarity": float, "tau_discount": float}, ...]
    """
    features = extract_pattern_features(intent, skill_results)
    matched = []

    for pattern in pattern_library:
        if not pattern.get("enabled", True):
            continue
        pattern_features = pattern.get("features", {})
        similarity = calculate_pattern_similarity(features, pattern_features)

        if similarity >= threshold:
            maturity = pattern.get("maturity", "new")
            tau_discount = {
                "mature": 0.70,
                "growing": 0.40,
                "experimental": 0.10,
                "new": 0.00,
            }.get(maturity, 0.0)

            matched.append({
                "pattern": pattern,
                "similarity": similarity,
                "tau_discount": tau_discount,
                "matched_steps": find_matched_steps(features, pattern_features),
            })

    # 按相似度降序
    matched.sort(key=lambda x: x["similarity"], reverse=True)
    return matched


def find_matched_steps(current_features: dict, pattern_features: dict) -> list:
    """找出当前任务与模式匹配的具体步骤"""
    current_seq = current_features.get("skill_sequence", ())
    pattern_seq = pattern_features.get("skill_sequence", ())
    lcs = compute_lcs(current_seq, pattern_seq)
    return list(lcs)
```

---

## 算法15：Co-Design 贡献度矩阵

```python
def calculate_contributions(step: str,
                            step_result: dict,
                            config: dict) -> dict:
    """
    计算某步骤的 Co-Design 三层贡献度

    Returns:
        {"model": float, "rules": float, "skills": float}
    """
    matrix = config["CO_DESIGN_MATRIX"]
    base = matrix.get(step, {"model": 0.5, "rules": 0.3, "skills": 0.2})

    # 根据步骤执行结果微调
    model_adj = 0.0
    if step_result.get("used_llm", False):
        model_adj += 0.1
    if step_result.get("llm_fallback", False):
        model_adj -= 0.05

    rules_adj = 0.0
    if step_result.get("rule_matched", False):
        rules_adj += 0.05
    if step_result.get("rule_override", False):
        rules_adj -= 0.05

    skills_adj = 0.0
    if step_result.get("skill_called", False):
        skills_adj += 0.05

    return {
        "model": max(0.0, min(1.0, base["model"] + model_adj)),
        "rules": max(0.0, min(1.0, base["rules"] + rules_adj)),
        "skills": max(0.0, min(1.0, base["skills"] + skills_adj)),
    }


def aggregate_contributions(step_contributions: dict) -> dict:
    """
    汇总所有步骤的贡献度，计算总体分布
    """
    total = {"model": 0.0, "rules": 0.0, "skills": 0.0}
    count = 0
    for step, contrib in step_contributions.items():
        total["model"] += contrib["model"]
        total["rules"] += contrib["rules"]
        total["skills"] += contrib["skills"]
        count += 1

    if count > 0:
        return {k: v / count for k, v in total.items()}
    return total
```

---

## 算法16：τ 预算动态分配

```python
def rebalance_tau_budget(allocations: dict,
                          consumed: dict,
                          config: dict) -> dict:
    """
    τ 预算动态借位调整

    规则：
    1. 执行层（exec）不可被借
    2. 按 TAU_BORROW_PRIORITY 从低优先级借给高优先级
    3. 各步骤 τ 超出预算时，从后续步骤借
    4. 总 τ 不能超预算

    Returns:
        dict: 调整后的 allocations
    """
    borrow_priority = config["TAU_BORROW_PRIORITY"]
    new_alloc = allocations.copy()
    borrowed = {k: 0.0 for k in allocations}

    # 计算各步骤剩余
    remaining = {
        k: new_alloc[k] - consumed.get(k, 0.0)
        for k in new_alloc
    }

    # 按优先级借位（低 → 高）
    # 低优先级步骤剩余 → 高优先级步骤不足
    priority_order = borrow_priority[::-1]  # 从高优先级到低优先级
    for step in priority_order:
        if remaining.get(step, 0) < 0:  # 该步骤超支
            # 从低优先级（优先级列表前面的）借
            for donor in borrow_priority:
                if donor == step:
                    continue
                if remaining.get(donor, 0) > 100:  # 捐出方至少有 100 τ 剩余
                    needed = abs(remaining[step])
                    available = remaining[donor]
                    amount = min(needed, available * 0.5)  # 最多借出剩余的 50%
                    if amount > 0:
                        new_alloc[step] += amount
                        new_alloc[donor] -= amount
                        borrowed[step] += amount
                        borrowed[donor] -= amount
                        remaining[step] += amount
                        remaining[donor] -= amount
                        break

    return new_alloc, borrowed


def validate_tau_budget(allocations: dict, total_budget: float) -> bool:
    """验证分配后总预算不超"""
    return sum(allocations.values()) <= total_budget * 1.01  # 1% 容差
```

---

**版本**: 1.0
**最后更新**: 2026-06-02
**新增算法**: 6 个（11-16）
**基于**: v1.2 的 10 个核心算法 + 华为韬定律