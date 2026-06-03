---
name: intent-router
description: Git 意图路由 — 分析用户意图，选择 τ 最优的原子技能组合
---

# Intent Router 原子 Skill

## 版本历史
- v1.0 (2026-06-02): 初始实现

## 功能
分析用户 Git 操作意图，从 6 个候选原子技能中选择最小组合。

## 核心算法

```python
INTENT_PATTERNS = {
    "commit":   ["提交", "commit", "提交代码", "生成 commit", "写 commit"],
    "branch":   ["分支", "branch", "创建分支", "切换分支", "删除分支", "merge", "rebase"],
    "history":  ["历史", "history", "commit历史", "blame", "查找", "谁改的", "git log"],
    "conflict": ["冲突", "conflict", "解决冲突", "merge冲突", "rebase冲突"],
    "stash":     ["stash", "暂存", "临时保存", "恢复stash", "stash list"],
    "tag":       ["tag", "标签", "版本", "release", "发布版本", "打标签"],
}

def select_skills(user_input: str, tau_budget: float) -> list:
    keywords = extract_keywords(user_input)
    matched = []
    for intent_type, patterns in INTENT_PATTERNS.items():
        if any(p in user_input for p in patterns):
            matched.append(intent_type)
    
    # 转换为原子技能
    skill_map = {
        "commit":   "commit-generation",
        "branch":   "branch-management",
        "history":  "history-analysis",
        "conflict": "conflict-resolution",
        "stash":    "stash-management",
        "tag":      "tag-management",
    }
    
    skills = [skill_map[m] for m in matched if m in skill_map]
    skills.insert(0, "intent-router")  # 入口技能必选
    
    # τ 预算检查
    tau_map = {
        "intent-router": 300, "commit-generation": 800,
        "branch-management": 600, "history-analysis": 1200,
        "conflict-resolution": 1500, "stash-management": 500,
        "tag-management": 400,
    }
    total_tau = sum(tau_map.get(s, 500) for s in skills)
    
    if total_tau > tau_budget:
        skills = simplify_to_budget(skills, tau_budget, tau_map)
    
    return skills

def simplify_to_budget(skills: list, budget: float, tau_map: dict) -> list:
    """去掉非核心技能直到 τ 满足预算"""
    result = [s for s in skills if s == "intent-router"]  # 保留入口
    remaining_budget = budget - tau_map["intent-router"]
    for s in skills:
        if s == "intent-router":
            continue
        is_core = s in ["commit-generation", "branch-management", "conflict-resolution"]
        if tau_map.get(s, 500) <= remaining_budget or is_core:
            result.append(s)
            remaining_budget -= tau_map.get(s, 500)
    return result
```

## τ 估算
300（固定，入口技能）

## 完成标准
1. 所有意图关键词被正确识别
2. 选中的技能组合覆盖用户所有明确意图
3. 总 τ 在预算范围内
