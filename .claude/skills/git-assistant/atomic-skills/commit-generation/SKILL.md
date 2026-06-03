---
name: commit-generation
description: Commit 生成 — 分析变更内容，生成符合 Conventional Commits 规范的 commit message
---

# Commit Generation 原子 Skill

## 版本历史
- v1.0 (2026-06-02): 初始实现

## 功能
分析 `git diff --staged` 的变更内容，生成高质量 commit message。

## 核心逻辑

```python
TYPE_MAP = {
    "feat": "新增功能",
    "fix": "修复问题",
    "docs": "文档更新",
    "style": "代码格式",
    "refactor": "重构代码",
    "test": "测试相关",
    "chore": "构建/工具",
}

def analyze_changes() -> dict:
    diff = execute_git("git diff --staged --stat")
    files = parse_changed_files(diff)
    types = infer_change_types(files)
    scope = infer_scope(files)
    return {"files": files, "types": types, "scope": scope}

def generate_message(analysis: dict) -> str:
    primary_type = analysis["types"][0] if analysis["types"] else "chore"
    scope = analysis["scope"]
    type_desc = TYPE_MAP.get(primary_type, "其他更新")
    short_desc = generate_short_description(analysis["files"])
    body = generate_body(analysis["files"])
    return f"{primary_type}({scope}): {short_desc}\n\n{body}"

def infer_change_types(files: list) -> list:
    types = set()
    for f in files:
        if f.startswith("src/features/"): types.add("feat")
        elif f.startswith("src/bugfix/"): types.add("fix")
        elif f.endswith(".md"): types.add("docs")
        elif f.endswith(".test.ts") or f.endswith(".spec.ts"): types.add("test")
        elif "refactor" in f: types.add("refactor")
        else: types.add("chore")
    return list(types)
```

## Conventional Commits 格式

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

## 输出

```json
{
  "message": "feat(auth): 添加登录功能\n\n- 新增 LoginForm.vue 组件\n- 支持记住密码\n- 添加单元测试",
  "type": "feat",
  "scope": "auth",
  "commands": ["git add -A", "git commit -m 'feat(auth): 添加登录功能'"],
  "requires_confirmation": true
}
```

## τ 估算
800（分析变更 + 生成 message）
