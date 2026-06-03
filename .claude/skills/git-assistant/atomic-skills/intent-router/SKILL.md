---
name: intent-router
description: Git 意图路由 — 分析用户意图，选择 τ 最优的原子技能组合
---

# Intent Router 原子 Skill

## 版本历史
- v1.0 (2026-06-02): 初始实现
- v1.1 (2026-06-03): 增强，新增 commit-spec-check 和 version-management 意图路由
- v1.2 (2026-06-03): 统一 τ 值与主 SKILL.md 一致，commit-spec-check 合并入 commit-generation

## 功能
分析用户 Git 操作意图，从 7 个候选原子技能中选择最小组合。集成分支健康检查、提交规范验证（含批量检查）、版本管理意图路由能力。

## 核心算法

```python
INTENT_PATTERNS = {
    # 提交操作
    "commit": [
        "提交", "commit", "提交代码", "生成 commit", "写 commit",
        "创建提交", "提交改动", "commit message", "提交信息",
    ],
    # 分支操作
    "branch": [
        "分支", "branch", "创建分支", "切换分支", "删除分支",
        "分支命名", "merge", "rebase", "checkout",
    ],
    # Git 历史
    "history": [
        "历史", "history", "commit历史", "blame", "查找",
        "谁改的", "git log", "分析变更", "变更记录",
    ],
    # 冲突解决
    "conflict": [
        "冲突", "conflict", "解决冲突", "merge冲突", "rebase冲突",
        "手动解决", "冲突文件",
    ],
    # Stash 操作
    "stash": [
        "stash", "暂存", "临时保存", "恢复stash", "stash list",
        "stash pop", "stash drop",
    ],
    # 版本标签（新增 v1.1）
    "version": [
        "tag", "标签", "版本", "release", "发布版本", "打标签",
        "changelog", "CHANGELOG", "semver", "版本号", "v1.0.0",
        "生成版本", "版本管理",
    ],
    # 提交规范检查（新增 v1.1）
    "spec-check": [
        "规范", "conventional commits", "提交规范", "检查提交",
        "提交信息规范", "commit 规范", "是否符合", "合规",
        "规范检查", "规范验证", "规范报告",
    ],
    # 分支健康分析（新增 v1.1）
    "branch-health": [
        "分支健康", "过期分支", "长期分支", "分支分析",
        "分支报告", "分支状态", "branch analysis", "stale",
        "命名规范", "分支策略",
    ],
}

# 意图 → 原子技能映射（7 个技能）
INTENT_TO_SKILL = {
    "commit":        "commit-generation",
    "branch":        "branch-management",
    "history":       "history-analysis",
    "conflict":      "conflict-resolution",
    "stash":         "stash-management",
    "version":       "version-management",
    "spec-check":    "commit-generation",   # 规范检查也由 commit-generation 提供（含批量验证）
    "branch-health": "branch-management",  # 共用分支管理（带分析能力）
}

# τ 估算表（v1.2 统一，与主 SKILL.md 一致）
TAU_MAP = {
    "intent-router":       300,
    "commit-generation":    1400,  # 含生成 + 规范验证 + 批量检查
    "branch-management":    600,   # CRUD；analyze 模式 900
    "history-analysis":     1200,
    "conflict-resolution":  1500,
    "stash-management":     500,
    "version-management":   700,
}

# 核心技能（不可跳过）
CORE_SKILLS = {
    "intent-router", "commit-generation",
    "conflict-resolution", "version-management",
}

def select_skills(user_input: str, tau_budget: float = 3000) -> dict:
    keywords = extract_keywords(user_input)
    matched_intents = []

    for intent_type, patterns in INTENT_PATTERNS.items():
        if any(p in user_input for p in patterns):
            matched_intents.append(intent_type)

    # 去重并排序（保持稳定性）
    matched_intents = list(dict.fromkeys(matched_intents))

    # 转换为原子技能
    skills_set = set()
    for intent in matched_intents:
        skill = INTENT_TO_SKILL.get(intent)
        if skill:
            skills_set.add(skill)

    # 入口技能必选
    selected = ["intent-router"] + sorted(skills_set - {"intent-router"})

    # τ 预算检查
    total_tau = sum(TAU_MAP.get(s, 500) for s in selected)

    if total_tau > tau_budget:
        selected = simplify_to_budget(selected, tau_budget)

    return {
        "selected": selected,
        "tau_total": total_tau,
        "tau_budget": tau_budget,
        "tau_usage": f"{total_tau/tau_budget*100:.0f}%",
        "matched_intents": matched_intents,
        "core_skills_preserved": [s for s in selected if s in CORE_SKILLS],
    }

def simplify_to_budget(skills: list, budget: float) -> list:
    """去掉非核心技能直到 τ 满足预算"""
    result = [s for s in skills if s in CORE_SKILLS]
    remaining = budget - sum(TAU_MAP.get(s, 500) for s in result)

    for s in skills:
        if s in CORE_SKILLS:
            continue
        cost = TAU_MAP.get(s, 500)
        if cost <= remaining:
            result.append(s)
            remaining -= cost

    return result
```

## 意图 → 技能映射表（v1.2）

| 意图类型 | 触发关键词 | 原子技能 | τ |
|---------|-----------|---------|---|
| commit | 提交、commit、commit message | commit-generation | 1400 |
| branch | 分支、branch、创建/切换/删除 | branch-management | 600 |
| history | 历史、blame、谁改的、git log | history-analysis | 1200 |
| conflict | 冲突、conflict、解决冲突 | conflict-resolution | 1500 |
| stash | stash、暂存、临时保存 | stash-management | 500 |
| version | tag、标签、版本、changelog、semver | version-management | 700 |
| spec-check | 规范、conventional commits、提交规范检查 | commit-generation（含批量验证） | 1400 |
| branch-health | 分支健康、过期分支、长期分支 | branch-management (analyze) | 900 |

## τ 档位与预算

| 档位 | τ 预算 | 典型场景 |
|------|--------|---------|
| simple | 1500 | 简单提交、stash 操作 |
| moderate | 3000 | 分支创建+提交、提交规范检查 |
| complex | 5000 | 冲突解决、分支健康分析、版本发布 |

## 示例

**用户**: "检查最近的提交是否符合 conventional commits 规范"

```
matched_intents: ["spec-check"]
selected_skills: ["intent-router", "commit-generation"]
τ = 300 + 1400 = 1700 ✅
```

**用户**: "生成分支健康报告，清理过期分支"

```
matched_intents: ["branch-health"]
selected_skills: ["intent-router", "branch-management"]
τ = 300 + 900 = 1200 ✅
```

## τ 估算
300（固定，入口技能）

## 完成标准
1. 所有意图关键词被正确识别（包括 spec-check/version/branch-health）
2. 选中的技能组合覆盖用户所有明确意图
3. 总 τ 在预算范围内
4. 核心技能不被跳过