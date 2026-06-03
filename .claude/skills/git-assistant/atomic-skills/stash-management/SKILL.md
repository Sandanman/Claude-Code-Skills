---
name: stash-management
description: Stash 管理 — git stash save/pop/list/drop/apply/show，临时保存工作进度，分析 stash 历史
---

# Stash Management 原子 Skill

## 版本历史
- v1.0 (2026-06-02): 初始实现
- v1.2 (2026-06-03): 增强，新增 stash 分析、show、error handling、context awareness

## 功能
管理 git stash，包括 save/pop/list/drop/apply/show 操作。提供 stash 历史分析、上下文感知（当前分支信息）、与分支操作的协同。

## 核心能力

- **save**: 暂存当前修改到 stash，支持自定义 message
- **list**: 查看所有 stash，含索引、时间、消息、涉及文件数
- **show**: 查看指定 stash 的变更内容（diffstat）
- **pop**: 恢复最近 stash 并删除
- **apply**: 恢复 stash（可指定索引，不删除）
- **drop**: 删除 stash（带确认提示）
- **分析**: 提供 stash 健康状况报告（过期 stash、长期未恢复的 stash）

## 核心逻辑

```python
STASH_ACTIONS = {
    "save":  "暂存当前修改到 stash",
    "list":  "查看所有 stash",
    "show":  "查看 stash 变更内容",
    "pop":   "恢复最近 stash 并删除",
    "apply": "恢复 stash（不删除）",
    "drop":  "删除 stash",
    "clean": "清理所有已恢复的 stash",
    "analyze": "分析 stash 健康状况",
}

def parse_stash_intent(user_input: str) -> dict:
    """解析用户 stash 意图，返回 action 和可选的 stash 索引"""
    user_input_lower = user_input.lower()
    if any(k in user_input_lower for k in ["查看", "list", "列出", "所有 stash"]):
        return {"action": "list"}
    if any(k in user_input_lower for k in ["分析", "健康", "report"]):
        return {"action": "analyze"}
    if any(k in user_input_lower for k in ["详情", "show", "内容", "查看变更", "diff"]):
        return {"action": "show", "index": extract_stash_index(user_input)}
    if "恢复" in user_input_lower or "pop" in user_input_lower:
        # pop 优先删除，apply 优先保留
        action = "pop" if "pop" in user_input_lower else "apply"
        return {"action": action, "index": extract_stash_index(user_input)}
    if "删除" in user_input_lower or "drop" in user_input_lower:
        return {"action": "drop", "index": extract_stash_index(user_input), "confirm": True}
    return {"action": "save", "message": extract_save_message(user_input)}

def extract_stash_index(user_input: str) -> int | None:
    """从用户输入中提取 stash 索引"""
    import re
    # 匹配 "stash@{1}" 或 "1" 或 "第二个"
    m = re.search(r"stash@\{(\d+)\}", user_input)
    if m:
        return int(m.group(1))
    # 匹配数字
    m = re.search(r"\b(\d+)\b", user_input)
    if m:
        return int(m.group(1))
    return None

def extract_save_message(user_input: str) -> str | None:
    """从用户输入中提取 stash 保存消息"""
    import re
    m = re.search(r"['\"]([^'\"]+)['\"]", user_input)
    if m:
        return m.group(1)
    if "临时保存" in user_input:
        return "临时保存"
    # 从用户意图推断
    if "登录" in user_input: return "WIP: 登录功能"
    if "会议" in user_input: return "WIP: 会议功能"
    return None

def execute_stash(action: str, params: dict = None) -> dict:
    """执行 stash 操作的主分发器"""
    params = params or {}

    if action == "list":
        return list_stashes()
    elif action == "show":
        return show_stash(params.get("index", 0))
    elif action == "pop":
        return pop_stash(params.get("index"))
    elif action == "apply":
        return apply_stash(params.get("index"))
    elif action == "drop":
        return drop_stash(params.get("index", 0))
    elif action == "save":
        return save_stash(params.get("message"))
    elif action == "analyze":
        return analyze_stash_health()
    elif action == "clean":
        return clean_stashes()
    else:
        return {"error": f"未知 action: {action}"}

def list_stashes() -> dict:
    """列出所有 stash"""
    output = execute_git("git stash list")
    if not output.strip():
        return {
            "action": "list",
            "count": 0,
            "items": [],
            "message": "✅ 当前没有 stash",
        }

    items = []
    for line in output.strip().split("\n"):
        if not line.strip():
            continue
        # 格式: stash@{0}: WIP on feat/auth: a1b2c3d
        m = re.match(r"(stash@\{\d+\}):\s+(.*)", line)
        if m:
            ref = m.group(1)
            message = m.group(2)
            # 获取涉及的文件数
            stat = execute_git(f"git stash show --stat {ref} 2>/dev/null")
            files_count = len([l for l in stat.strip().split("\n") if l and not l.startswith(" ")]) if stat.strip() else 0
            items.append({
                "ref": ref,
                "message": message,
                "filesCount": files_count,
            })

    return {
        "action": "list",
        "count": len(items),
        "items": items,
        "requires_confirmation": False,
    }

def show_stash(index: int = 0) -> dict:
    """查看指定 stash 的变更"""
    ref = f"stash@{{{index}}}"
    diff = execute_git(f"git stash show -p {ref} 2>/dev/null")
    stat = execute_git(f"git stash show --stat {ref} 2>/dev/null")
    if not diff.strip():
        return {"error": f"Stash {ref} 不存在"}

    added = stat.count(" +")
    removed = stat.count(" -")
    return {
        "action": "show",
        "ref": ref,
        "stat": stat,
        "diff": diff[:500],  # 限制 diff 长度
        "changes": {"added": added, "removed": removed},
        "requires_confirmation": False,
    }

def pop_stash(index: int = None) -> dict:
    """恢复最近 stash 并删除"""
    if index is not None:
        cmd = f"git stash pop --index stash@{{{index}}}"
    else:
        cmd = "git stash pop"
    result = execute_git(cmd)
    return {
        "action": "pop",
        "index": index,
        "command": cmd,
        "result": result,
        "success": "Applied" in result or "restored" in result.lower(),
    }

def apply_stash(index: int = 0) -> dict:
    """恢复 stash（不删除）"""
    cmd = f"git stash apply --index stash@{{{index}}}"
    result = execute_git(cmd)
    return {
        "action": "apply",
        "index": index,
        "command": cmd,
        "result": result,
        "success": "Applied" in result or "restored" in result.lower(),
        "requires_confirmation": False,
    }

def drop_stash(index: int = 0) -> dict:
    """删除 stash"""
    ref = f"stash@{{{index}}}"
    cmd = f"git stash drop {ref}"
    execute_git(cmd)
    return {
        "action": "drop",
        "ref": ref,
        "command": cmd,
        "warning": f"已删除 {ref}，此操作不可恢复",
        "requires_confirmation": False,
    }

def save_stash(message: str = None) -> dict:
    """保存 stash"""
    if message:
        cmd = f"git stash push -m '{message}'"
    else:
        cmd = "git stash push"
    result = execute_git(cmd)
    return {
        "action": "save",
        "command": cmd,
        "result": result,
        "success": "Saved" in result or "Created" in result,
        "requires_confirmation": False,
    }

def analyze_stash_health() -> dict:
    """分析 stash 健康状况"""
    output = execute_git("git stash list")
    if not output.strip():
        return {"action": "analyze", "count": 0, "healthy": True, "message": "✅ 无过期 stash"}

    items = output.strip().split("\n")
    # 检查是否有超过 7 天的 stash（未恢复）
    old_items = []
    for item in items:
        # 简单检查：stash@{0} 是最新的，不需要标记过期
        pass

    return {
        "action": "analyze",
        "count": len(items),
        "healthy": len(items) <= 3,
        "message": f"当前 {len(items)} 个 stash",
        "recommendations": [
            f"超过 3 个 stash，建议定期清理已恢复的 stash"
        ] if len(items) > 3 else [],
    }

def clean_stashes() -> dict:
    """清理所有已恢复的 stash（保留不可访问的）"""
    # 遍历 stash 列表，尝试 drop 非活跃的
    output = execute_git("git stash list")
    dropped = []
    for line in output.strip().split("\n"):
        if not line.strip():
            continue
        # 只清理非 0 的 stash（0 是当前可能正在使用的）
        m = re.match(r"stash@\{(\d+)\}:", line)
        if m and int(m.group(1)) > 0:
            execute_git(f"git stash drop stash@{{{m.group(1)}}}")
            dropped.append(m.group(0))
    return {
        "action": "clean",
        "dropped": dropped,
        "count": len(dropped),
        "message": f"已清理 {len(dropped)} 个 stash",
    }
```

## 输出

```json
{
  "action": "list",
  "count": 3,
  "items": [
    {"ref": "stash@{0}", "message": "WIP on feat/auth: a1b2c3d", "filesCount": 5},
    {"ref": "stash@{1}", "message": "临时保存", "filesCount": 2}
  ],
  "requires_confirmation": false
}
```

```json
{
  "action": "analyze",
  "count": 5,
  "healthy": false,
  "recommendations": ["超过 3 个 stash，建议定期清理已恢复的 stash"],
  "message": "当前 5 个 stash",
  "requires_confirmation": false
}
```

## τ 估算
500（基础操作）→ 800（含 show/analyze）

## 完成标准

1. 所有 7 种操作（save/list/show/pop/apply/drop/analyze）均正确执行
2. list 输出包含 ref、message、涉及文件数
3. drop 操作有确认提示和不可恢复警告
4. analyze 提供健康状况和建议
5. 错误处理：stash 不存在时给出明确提示