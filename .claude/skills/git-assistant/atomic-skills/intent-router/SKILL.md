---
name: intent-router
description: Git 意图路由 — 分析用户意图并选择对应的最小原子 Skill 组合
---

# Intent Router 原子 Skill

## 职责

将用户自然语言映射为 Git 意图和原子 Skill，不执行 Git 写操作。实际候选为 7 个路由目标；其中 `spec-check` 复用 `commit-generation`，`branch-health` 复用 `branch-management`。`cloud-map-sync` 不参与用户意图路由，仅作为 commit 确认后的条件链路。

## 路由规则

```python
INTENT_PATTERNS = {
    "commit": ["提交", "commit", "提交代码", "生成 commit", "写 commit", "commit message"],
    "branch": ["分支", "branch", "创建分支", "切换分支", "删除分支", "merge", "rebase", "checkout"],
    "history": ["历史", "history", "commit历史", "blame", "谁改的", "git log", "分析变更"],
    "conflict": ["冲突", "conflict", "解决冲突", "merge冲突", "rebase冲突", "冲突文件"],
    "stash": ["stash", "暂存", "临时保存", "恢复stash", "stash list", "stash pop", "stash drop"],
    "version": ["tag", "标签", "版本", "release", "changelog", "CHANGELOG", "semver", "版本号"],
    "spec-check": ["规范检查", "conventional commits", "提交规范", "提交信息规范", "commit 规范", "合规"],
    "branch-health": ["分支健康", "过期分支", "长期分支", "分支分析", "分支报告", "stale"],
}

INTENT_TO_SKILL = {
    "commit": "commit-generation",
    "branch": "branch-management",
    "history": "history-analysis",
    "conflict": "conflict-resolution",
    "stash": "stash-management",
    "version": "version-management",
    "spec-check": "commit-generation",
    "branch-health": "branch-management",
}

def select_skills(user_input: str) -> dict:
    text = user_input.casefold()
    matches = []
    for position, pattern in enumerate_all_patterns_in_input(text):
        intent = pattern.intent
        if intent not in [item["intent"] for item in matches]:
            matches.append({"intent": intent, "position": position})

    matches.sort(key=lambda item: item["position"])
    selected = ["intent-router"]
    for item in matches:
        skill = INTENT_TO_SKILL[item["intent"]]
        if skill not in selected:
            selected.append(skill)

    return {
        "matched_intents": [item["intent"] for item in matches],
        "selected": selected,
        "requires_clarification": not bool(matches),
        "issues": [] if matches else ["未识别 Git 操作意图"],
    }
```

`enumerate_all_patterns_in_input` 表示按关键词在输入中的首次位置收集匹配；实现时应保持大小写不敏感、去重和输入顺序，不按字母排序破坏用户意图顺序。

## 输入

```yaml
user_input: string
```

## 输出

```yaml
status: passed | partial | failed
matched_intents: []
selected: [intent-router]
requires_clarification: boolean
issues: []
```

## 完成标准

1. 所有匹配意图按用户输入顺序返回。
2. 同一原子 Skill 只出现一次。
3. 无匹配时不猜测操作，返回澄清状态。
4. 只返回存在且已注册的路由目标。
5. `cloud-map-sync` 不被直接路由。
