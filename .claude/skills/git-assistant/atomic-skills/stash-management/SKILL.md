---
name: stash-management
description: Stash 管理 — git stash save/pop/list/drop，临时保存工作进度
---

# Stash Management 原子 Skill

## 功能
管理 git stash，包括 save/pop/list/drop/apply 操作。

## 核心逻辑

```python
STASH_ACTIONS = {
    "save": "暂存当前修改到 stash",
    "list": "查看所有 stash",
    "pop": "恢复最近 stash 并删除",
    "apply": "恢复最近 stash（不删除）",
    "drop": "删除最近 stash",
}

def parse_stash_intent(user_input: str) -> str:
    if "查看" in user_input or "list" in user_input:
        return "list"
    if "恢复" in user_input:
        return "pop"
    if "删除" in user_input or "drop" in user_input:
        return "drop"
    return "save"

def execute_stash(action: str) -> dict:
    if action == "list":
        result = execute_git("git stash list")
        items = parse_stash_list(result)
        return {"action": "list", "items": items, "count": len(items)}
    elif action == "save":
        return {"action": "save", "cmd": "git stash push -m '临时保存'"}
    elif action == "pop":
        return {"action": "pop", "cmd": "git stash pop"}
    elif action == "drop":
        return {"action": "drop", "cmd": "git stash drop"}
    return {"action": "unknown"}
```

## 输出

```json
{
  "action": "list",
  "items": [
    {"index": 0, "message": "WIP on feat/auth: a1b2c3d", "date": "2分钟前"},
    {"index": 1, "message": "临时保存", "date": "1小时前"}
  ],
  "requires_confirmation": false
}
```
