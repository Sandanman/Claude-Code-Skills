---
name: conflict-resolution
description: 冲突解决 — 检测冲突类型（内容/语义），分析解决策略，提供手动合并指导
---

# Conflict Resolution 原子 Skill

## 功能
检测 Git 冲突类型，提供三种解决策略（ours/theirs/手动），生成解决命令。

## 核心逻辑

```python
CONFLICT_TYPES = {
    "CONTENT": "同时修改同一行",
    "ADD_ADD": "两边都新增同一文件",
    "DELETE_MODIFY": "一方删除，一方修改",
}

def detect_conflicts() -> dict:
    files = execute_git("git diff --name-only --diff-filter=U").strip().split("\n")
    if not files or files == [""]:
        return {"has_conflicts": False, "files": []}
    
    conflict_files = []
    for f in files:
        if f.strip():
            content = execute_git(f"git diff {f}")
            conflict_files.append({
                "file": f.strip(),
                "type": infer_conflict_type(content),
                "ours_lines": count_ours_markers(content),
                "theirs_lines": count_theirs_markers(content),
            })
    return {"has_conflicts": True, "files": conflict_files}

def infer_conflict_type(content: str) -> str:
    if "<<<<<<" not in content:
        return "NONE"
    adds = content.count("<<<<<<")
    if adds > 3: return "CONTENT"
    return "SEMANTIC"

def generate_strategies(file: dict) -> list:
    return [
        {"name": "保留当前分支", "cmd": f"git checkout --ours {file['file']}", "desc": "使用当前分支的版本"},
        {"name": "保留目标分支", "cmd": f"git checkout --theirs {file['file']}", "desc": "使用合并来源分支的版本"},
        {"name": "手动解决", "cmd": f"code {file['file']}", "desc": "打开编辑器人工合并"},
    ]
```

## 输出

```json
{
  "has_conflicts": true,
  "files": [{"file": "src/auth/login.vue", "type": "CONTENT", "strategies": [...]}],
  "commands": ["git checkout --ours src/auth/login.vue", "git add src/auth/login.vue"],
  "requires_manual": true
}
```
