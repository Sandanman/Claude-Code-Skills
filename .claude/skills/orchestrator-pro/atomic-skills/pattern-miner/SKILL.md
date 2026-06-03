---
name: pattern-miner
description: Pattern Mining 模式挖掘 — 从任务历史中提取和复用成熟模式，与历史检索并行执行
impl_status: design_spec  # 设计规范文档，预留实现。未包含可执行代码，待后续工程化落地
---

# Pattern Miner 原子 Skill

## 版本历史
- v1.0 (2026-06-02): 初始实现，基于华为韬定律 K4（成熟制程深挖）

---

## 1. 核心定位

**Pattern Miner** 是 Orchestrator Pro 的模式复用核心，对应华为韬定律 K4：
> 深挖成熟模式（类比 14nm 制程），而非每次都设计新架构（类比追求 2nm）

**与历史检索的关系**（双轨并行）：
- **轨道A 历史相似度**（≥ 0.85）：判断是否复用**整个任务**结果 → 已有
- **轨道B Pattern Mining**（≥ 0.6）：判断哪些**子步骤**可复用 → 本 Skill

两者并行执行，互不干扰，结果合并输出。

---

## 2. 原子能力

| 能力名称 | 功能描述 | 调用时机 |
|---------|---------|---------|
| `pattern-extraction` | 从当前任务提取 pattern 特征（比 intent 更细粒度） | 步骤 2 中 |
| `pattern-matching` | 在模式库中搜索相似模式（相似度 ≥ 0.6） | 步骤 2 中 |
| `pattern-suggestion` | 输出可复用的子步骤和 τ 折扣 | 步骤 2 中 |
| `pattern-storage` | 将新任务模式存入模式库 | 步骤 9 中 |
| `maturity-assessment` | 评估模式成熟度（new→experimental→growing→mature） | 步骤 9 中 |

---

## 3. 模式特征提取

### 3.1 特征维度

比 intent 更细粒度，包含：

```python
PATTERN_FEATURES = {
    "domain_action": str,       # "frontend_create" 格式
    "target_pattern": str,     # "component_10" 格式（type_length）
    "complexity_band": str,     # "low"(1-3) / "mid"(4-6) / "high"(7-10)
    "skill_sequence": tuple,   # 执行的 skill 序列（最重要，权重 40%）
    "constraint_types": tuple, # 约束类型组合
    "keyword_set": frozenset,  # 关键词集合
}
```

### 3.2 特征提取算法

```python
def extract_pattern_features(intent: dict, skill_results: dict) -> dict:
    """
    从任务中提取模式特征
    """
    # skill_sequence（最重要）
    skill_sequence = tuple(
        r["skill_name"]
        for r in sorted(skill_results.values(), key=lambda x: x.get("order", 0))
        if r.get("status") == "completed"
    ) if skill_results else ()

    return {
        "domain_action": f"{intent.get('domain')}_{intent.get('action')}",
        "target_pattern": f"{intent.get('target', {}).get('type')}_{len(intent.get('target', {}).get('name', ''))}",
        "complexity_band": "low" if intent.get("complexity_score", 5) <= 3 else \
                          "mid" if intent.get("complexity_score", 5) <= 6 else "high",
        "skill_sequence": skill_sequence,
        "constraint_types": tuple(sorted(intent.get("constraints", []))),
        "keyword_set": frozenset(intent.get("keywords", [])),
        "original_intent_id": intent.get("intent_id"),
        "main_skill": intent.get("main_skill"),
    }
```

---

## 4. 模式匹配算法

### 4.1 多维相似度计算

```python
def calculate_pattern_similarity(features_a: dict, features_b: dict) -> float:
    """
    加权多维特征相似度（0.0 ~ 1.0）
    """
    scores = {}

    # 1. skill sequence（权重 0.40）
    scores["sequence"] = lcs_ratio(
        features_a.get("skill_sequence", ()),
        features_b.get("skill_sequence", ())
    )

    # 2. domain_action（权重 0.25）
    scores["domain_action"] = 1.0 if features_a.get("domain_action") == features_b.get("domain_action") else 0.0

    # 3. keyword Jaccard（权重 0.20）
    kw_a = features_a.get("keyword_set", frozenset())
    kw_b = features_b.get("keyword_set", frozenset())
    scores["keyword"] = len(kw_a & kw_b) / len(kw_a | kw_b) if kw_a and kw_b else 0.0

    # 4. complexity_band（权重 0.10）
    scores["complexity"] = 1.0 if features_a.get("complexity_band") == features_b.get("complexity_band") else 0.0

    # 5. constraint pattern（权重 0.05）
    c_a = set(features_a.get("constraint_types", ()))
    c_b = set(features_b.get("constraint_types", ()))
    scores["constraint"] = len(c_a & c_b) / max(len(c_a | c_b), 1)

    return (
        0.40 * scores["sequence"]
        + 0.25 * scores["domain_action"]
        + 0.20 * scores["keyword"]
        + 0.10 * scores["complexity"]
        + 0.05 * scores["constraint"]
    )


def lcs_ratio(a: tuple, b: tuple) -> float:
    """最长公共子序列比例"""
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

### 4.2 模式库搜索

```python
def search_patterns(intent: dict,
                    skill_results: dict,
                    pattern_library_base: str = ".claude/skills/patterns/",
                    threshold: float = 0.60) -> list:
    """
    在模式库中搜索相似模式

    Returns:
        list: [{
            "pattern": {...},
            "similarity": float,
            "tau_discount": float,
            "maturity": str,
            "matched_steps": list,
            "tau_savings": float,
        }, ...]
    """
    features = extract_pattern_features(intent, skill_results)
    matched = []

    # 遍历模式库
    import os
    for category_dir in os.listdir(pattern_library_base):
        cat_path = os.path.join(pattern_library_base, category_dir)
        if not os.path.isdir(cat_path):
            continue
        for pattern_file in os.listdir(cat_path):
            if not pattern_file.endswith(".md"):
                continue

            pattern = read_pattern_file(os.path.join(cat_path, pattern_file))
            if not pattern.get("enabled", True):
                continue

            pattern_features = pattern.get("features", {})
            similarity = calculate_pattern_similarity(features, pattern_features)

            if similarity >= threshold:
                maturity = pattern.get("maturity", "new")
                tau_discount = PATTERN_DISCOUNTS.get(maturity, 0.0)

                matched.append({
                    "pattern": pattern,
                    "similarity": round(similarity, 3),
                    "tau_discount": tau_discount,
                    "maturity": maturity,
                    "matched_steps": _find_matched_steps(features, pattern_features),
                    "tau_savings": tau_discount,
                    "category": category_dir,
                })

    matched.sort(key=lambda x: x["similarity"], reverse=True)
    return matched[:5]  # 最多返回 Top 5


PATTERN_DISCOUNTS = {
    "mature": 0.70,
    "growing": 0.40,
    "experimental": 0.10,
    "new": 0.00,
}
```

---

## 5. 输出格式

### 5.1 Pattern Mining 结果

```json
{
  "searched_categories": ["frontend-scan", "api-generation"],
  "threshold": 0.60,
  "matched_count": 3,
  "matched_patterns": [
    {
      "pattern_id": "vue3-component-gen",
      "pattern_name": "Vue3 组件生成模式",
      "category": "frontend-scan",
      "similarity": 0.73,
      "tau_discount": 0.70,
      "maturity": "mature",
      "matched_steps": ["scan-project-structure", "detect-framework", "code-generation"],
      "tau_savings": 0.70,
    },
    {
      "pattern_id": "api-handler",
      "pattern_name": "API 处理器模式",
      "category": "api-generation",
      "similarity": 0.65,
      "tau_discount": 0.40,
      "maturity": "growing",
      "matched_steps": ["code-generation", "test-generation"],
      "tau_savings": 0.40,
    }
  ],
  "aggregate_discount": 0.25,
  "reuse_rate": 0.45,
  "pattern_suggestions": [
    "可复用 Vue3 组件生成模式的 scan 和 detect 步骤",
    "建议将当前 skill 序列沉淀为新模式"
  ]
}
```

### 5.2 模式库存储格式

```markdown
# Pattern: vue3-component-gen
## Vue3 组件生成模式

**类别**: frontend-scan
**成熟度**: mature
**验证次数**: 7
**τ 折扣**: 70%
**最后使用**: 2026-06-01
**使用次数**: 12

## 触发条件
- domain: frontend
- action: create
- target_type: component
- complexity_band: mid

## 执行步骤
1. scan-project-structure
2. detect-framework
3. detect-ui-library
4. code-design
5. code-generation
6. test-generation
7. documentation-update

## τ 收益
- 模式复用节省: 70% exec 步骤
- 估算节省: ~6300 τ（中等任务）

## 验证记录
- 2026-06-01: 复用成功，τ 消耗 5200（vs 预算 15000）
- 2026-05-28: 复用成功，τ 消耗 6100
- ...
```

---

## 6. 嵌入 Orchestrator 流程

```
步骤2（历史检索）中并行执行：
  ├─ 轨道A：历史相似度（已有逻辑）→ similarity ≥ 0.85 则复用结果
  └─ 轨道B：Pattern Mining（本 Skill）→ similarity ≥ 0.60 则复用子步骤

步骤9（任务归档）中执行：
  ├─ pattern-storage：新任务模式存入模式库
  └─ maturity-assessment：评估模式成熟度，更新验证计数
```

---

## 7. 完成标准

1. 模式特征提取覆盖所有 6 个维度
2. 模式匹配相似度计算正确（已包含 LCS 算法）
3. 模式库按 category 组织（domain + action 维度）
4. 匹配结果包含 τ 折扣和复用建议
5. 新任务完成后自动存入模式库

---

## 8. 注意事项

- Pattern Mining 与历史相似度**并行执行**，不相互阻塞
- 模式库文件使用 `.md` 格式，便于人工审阅和编辑
- 新建模式需要 2 次验证才能晋升为 growing，5 次才能晋升为 mature
- 模式匹配阈值（0.60）可通过 config.md 中的 PATTERN_THRESHOLDS 调整

---

## 原子 Skill 位置

`.claude/skills/orchestrator-pro/atomic-skills/pattern-miner/SKILL.md`