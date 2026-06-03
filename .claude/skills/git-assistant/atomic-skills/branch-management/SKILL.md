---
name: branch-management
description: 分支管理 — 分支创建/切换/删除，验证分支名合法性，提供分支策略建议
---

# Branch Management 原子 Skill

## 功能
处理分支创建、切换、删除，提供分支命名规范和合并策略建议。

## 核心逻辑

```python
BRANCH_PREFIXES = {
    "feat": "功能分支",
    "fix": "修复分支", 
    "hotfix": "热修复分支",
    "release": "发布分支",
    "chore": "维护分支",
}

def parse_intent(user_input: str) -> dict:
    if "创建" in user_input or "新建" in user_input:
        action = "create"
    elif "切换" in user_input or "checkout" in user_input:
        action = "switch"
    elif "删除" in user_input:
        action = "delete"
    else:
        action = "list"
    return {"action": action}

def validate_branch_name(name: str) -> dict:
    if not name: return {"valid": False, "reason": "分支名为空"}
    if name.startswith("-"): return {"valid": False, "reason": "不能以 - 开头"}
    if len(name) > 100: return {"valid": False, "reason": "分支名过长"}
    return {"valid": True, "prefix": detect_prefix(name)}

def generate_commands(intent: dict) -> list:
    action = intent["action"]
    branch = intent.get("branch_name", "")
    if action == "create":
        return [f"git checkout -b {branch}"]
    elif action == "switch":
        return [f"git checkout {branch}"]
    elif action == "delete":
        return [f"git branch -d {branch}"]  # 安全删除
    return ["git branch -a"]
```

## 输出

```json
{
  "action": "create",
  "branch_name": "feat/auth-login",
  "valid": true,
  "prefix_type": "feat",
  "commands": ["git checkout -b feat/auth-login"],
  "requires_confirmation": true,
  "warning": null
}
```
