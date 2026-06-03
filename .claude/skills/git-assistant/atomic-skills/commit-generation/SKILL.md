---
name: commit-generation
description: Commit 生成与规范验证 — 分析变更内容生成 commit message，支持内联验证和批量历史提交规范检查
---

# Commit Generation 原子 Skill

> TYPE_MAP 和 CONVENTIONAL_REGEX 权威定义见主 SKILL.md，禁止在此文件中重复定义。
> 本文件引用主 SKILL.md 的公共常量规范。

## 版本历史
- v1.0 (2026-06-02): 初始实现
- v1.1 (2026-06-03): 增强，集成规范验证和质量分析能力
- v1.2 (2026-06-03): 合并 commit-spec-check，新增批量规范检查功能

## 功能
分析 `git diff --staged` 的变更内容，生成高质量 commit message，并在生成后自动验证。同时支持批量检查历史提交的规范符合情况（源自 commit-spec-check）。

## 核心逻辑

```python
import re

# 引用主 SKILL.md 的公共常量
TYPE_MAP = {
    "feat": "新增功能", "fix": "修复问题", "docs": "文档更新",
    "style": "代码格式", "refactor": "重构代码", "test": "测试相关", "chore": "构建/工具",
}
CONVENTIONAL_REGEX = r'^(\w+)(\([\w/-]+\))?: [\S].{1,50}$'

# ── 生成相关 ────────────────────────────────────────────

def analyze_changes() -> dict:
    diff = execute_git("git diff --staged --stat")
    files = parse_changed_files(diff)
    types = infer_change_types(files)
    scope = infer_scope(files)
    diff_content = execute_git("git diff --staged --unified=3")

    if not scope:
        scopes = extract_scopes(files)
        scope = scopes[0] if scopes else "core"

    type_order = ["feat", "fix", "refactor", "docs", "style", "test", "chore"]
    primary_type = next((t for t in type_order if t in types), "chore")

    return {
        "files": files, "types": types, "scope": scope,
        "diffContent": diff_content, "fileCount": len(files),
    }

def infer_change_types(files: list) -> list:
    types = set()
    for f in files:
        if "feat" in f or "feature" in f: types.add("feat")
        elif "bugfix" in f or "fix" in f or "hotfix" in f: types.add("fix")
        elif f.endswith(".md") or "docs" in f: types.add("docs")
        elif f.endswith(".test.ts") or f.endswith(".spec.ts"): types.add("test")
        elif "refactor" in f: types.add("refactor")
        elif "style" in f or "format" in f: types.add("style")
        else: types.add("chore")
    return list(types)

def infer_scope(files: list) -> str:
    if not files:
        return "core"
    scopes = extract_scopes(files)
    return scopes[0] if scopes else "core"

def extract_scopes(files: list) -> list:
    scopes = set()
    for f in files:
        parts = f.split("/")
        if len(parts) >= 2:
            root = parts[0]
            if root in ["src", "app", "lib"]:
                if len(parts) >= 3:
                    scopes.add(parts[1])
            elif root not in ["tests", "__tests__", "docs", "scripts", "config"]:
                scopes.add(root)
    return list(scopes)

def generate_message(analysis: dict) -> dict:
    primary_type = analysis["types"][0] if analysis["types"] else "chore"
    scope = analysis["scope"]
    type_desc = TYPE_MAP.get(primary_type, "其他更新")
    short_desc = generate_short_description(analysis["files"])
    body = generate_body(analysis["files"])
    raw_message = f"{primary_type}({scope}): {short_desc}\n\n{body}"
    validation = validate_message(raw_message)
    return {
        "message": raw_message, "type": primary_type, "scope": scope,
        "validation": validation, "typeDesc": type_desc,
        "commands": [f"git add -A", f"git commit -m '...'"],
        "requires_confirmation": True,
    }

def generate_short_description(files: list) -> str:
    if not files:
        return "update project"
    actions = {"feat": "添加", "fix": "修复", "docs": "更新文档",
               "refactor": "重构", "test": "添加测试", "style": "优化格式", "chore": "更新"}
    if len(files) == 1:
        f = files[0].split("/")[-1]
        return f"{actions.get('feat', '更新')} {f}"
    elif len(files) <= 3:
        return f"更新 {', '.join(f.split('/')[-1] for f in files)}"
    return f"更新 {len(files)} 个文件"

def generate_body(files: list) -> str:
    if not files:
        return ""
    return "\n".join(f"- {f.split('/')[-1]}" for f in files)

# ── 验证相关（内联验证 + 批量检查）───────────────────────────────

def validate_message(message: str) -> dict:
    """内联验证：生成新 commit message 后自动调用"""
    issues = []
    if not message or not message.strip():
        return {"valid": False, "issues": [{"field": "empty", "message": "提交信息为空", "severity": "high"}], "score": 0}

    lines = message.split("\n")
    header = lines[0]
    match = re.match(CONVENTIONAL_REGEX, header)

    if not match:
        issues.append({"field": "format", "message": "不符合 type(scope): description 格式", "severity": "high"})
    else:
        type_part = match.group(1)
        if type_part not in TYPE_MAP:
            issues.append({"field": "type", "message": f"未知的 type: {type_part}", "severity": "medium"})
        desc_part = match.group(2) if match.group(2) else ""
        first_word = desc_part.split(" ")[1] if len(desc_part.split(" ")) > 1 else ""
        if first_word and first_word[0].islower():
            issues.append({"field": "case", "message": "描述应以大写字母开头", "severity": "low"})

    if len(header) > 72:
        issues.append({"field": "length", "message": f"标题超过 72 字符（当前 {len(header)}）", "severity": "low"})

    has_breaking = "BREAKING CHANGE:" in message or header.endswith("!")
    if has_breaking:
        issues.append({"field": "breaking", "message": "包含 Breaking Change", "severity": "info"})

    score = max(0, 100 - len([i for i in issues if i["severity"] == "high"]) * 40
                - len([i for i in issues if i["severity"] == "medium"]) * 20
                - len([i for i in issues if i["severity"] == "low"]) * 5)

    return {"valid": len([i for i in issues if i["severity"] == "high"]) == 0, "issues": issues, "score": score, "hasBreakingChange": has_breaking}

def check_commit_message(message: str) -> dict:
    """单条验证：深度检查单条 commit message，返回详细问题和建议"""
    result = {"compliant": False, "type": None, "scope": None, "description": None, "issue": None, "suggestedFix": None, "severity": "low"}
    msg = message.strip()
    if not msg:
        return {"compliant": False, "issue": "提交信息为空", "severity": "high"}
    match = re.match(CONVENTIONAL_REGEX, msg)
    if not match:
        return {"compliant": False, "issue": "不符合 type(scope): description 格式", "severity": "high", "suggestedFix": suggest_fix(msg)}
    result["compliant"] = True
    result["type"] = match.group(1)
    result["scope"] = match.group(2)[1:-1] if match.group(2) else None
    result["description"] = match.group(3)
    desc = result["description"]
    if desc and desc[0].islower():
        result["suggestedFix"] = f"{result['type']}({result['scope']}): {desc[0].upper()}{desc[1:]}"
    elif len(desc or "") < 10:
        result["issue"] = "描述过于简略，建议增加更多细节"
    if "BREAKING CHANGE:" in msg or msg.startswith("!"):
        result["breakingChange"] = True
    return result

def suggest_fix(message: str) -> str:
    """智能生成修正建议"""
    if not message:
        return "feat(scope): 简短的描述"
    type_map = {"新增": "feat", "添加": "feat", "功能": "feat", "修复": "fix", "bug": "fix", "问题": "fix",
                "文档": "docs", "readme": "docs", "重构": "refactor", "优化": "refactor"}
    for kw, t in type_map.items():
        if kw in message:
            return f"{t}(scope): {message}"
    return f"feat(scope): {message}"

def analyze_commits(commit_range: str = "-20") -> dict:
    """批量验证：检查指定范围内所有提交的规范符合情况"""
    log = execute_git(f"git log {commit_range} --pretty=format:'%H|%s'")
    lines = [l for l in log.strip().split("\n") if l.strip()]
    results = []
    type_dist = {}

    for line in lines:
        parts = line.split("|", 1)
        if len(parts) < 2:
            continue
        sha, msg = parts[0], parts[1]
        check = check_commit_message(msg)
        check["hash"] = sha[:7]
        results.append(check)
        t = check.get("type")
        if t:
            type_dist[t] = type_dist.get(t, 0) + 1

    compliant = sum(1 for r in results if r["compliant"])
    total = len(results)
    rate = compliant / total * 100 if total > 0 else 0

    return {
        "totalChecked": total, "compliant": compliant, "nonCompliant": total - compliant,
        "complianceRate": f"{rate:.1f}%", "overallScore": int(rate),
        "typeDistribution": type_dist,
        "nonCompliantCommits": [r for r in results if not r["compliant"]],
        "commands": [f"git log {commit_range} --pretty=format:'%h %s'"],
    }
```

## Conventional Commits 格式

```
<type>(<scope>): <short description>

[optional body]

[optional footer - BREAKING CHANGE: description]
```

### Type 类型映射

| type | 说明 | 触发关键词 |
|------|------|-----------|
| feat | 新增功能 | 新增、功能、添加 |
| fix | 修复问题 | 修复、bug、问题 |
| docs | 文档更新 | 文档、readme、注释 |
| style | 代码格式 | 格式化、格式 |
| refactor | 重构代码 | 重构、优化 |
| test | 测试相关 | 测试、用例 |
| chore | 构建/工具 | 依赖、工具、配置 |

## 输出

### 单条生成输出（generate_message）

```json
{
  "message": "feat(auth): 添加登录功能\n\n- LoginForm.vue\n- 记住密码功能",
  "type": "feat",
  "scope": "auth",
  "validation": {
    "valid": true,
    "score": 100,
    "issues": [],
    "hasBreakingChange": false
  },
  "commands": ["git add -A", "git commit -m '...'"],
  "requires_confirmation": true
}
```

### 批量检查输出（analyze_commits）

```json
{
  "totalChecked": 20,
  "compliant": 17,
  "nonCompliant": 3,
  "complianceRate": "85.0%",
  "overallScore": 85,
  "typeDistribution": {"feat": 8, "fix": 5, "docs": 3, "refactor": 2, "chore": 2},
  "nonCompliantCommits": [
    {
      "hash": "a1b2c3d",
      "message": "updated the login page",
      "issue": "使用小写字母开头，缺少 type 前缀",
      "suggestedFix": "feat(auth): update login page UI",
      "severity": "high"
    }
  ],
  "requires_confirmation": false,
  "reportFile": "git-commit-report.md"
}
```

## τ 估算
1400（生成 + 内联验证 + 批量规范检查）

## 与单独 commit-spec-check 的区别（v1.2 已合并）

| 维度 | commit-generation（含批量检查） | 原 commit-spec-check（已合并） |
|------|-------------------------------|-------------------------------|
| 单条生成 | ✅ 分析 git diff 生成新 commit | ❌ 不支持 |
| 内联验证 | ✅ 生成后自动验证（validate_message） | ❌ 不支持 |
| 批量检查 | ✅ 检查历史提交规范（analyze_commits） | ✅ 相同功能 |
| 修正建议 | ✅ 生成修正建议（suggest_fix） | ✅ 相同功能 |
| 使用场景 | 创建提交 + 代码审查 | 仅代码审查（现由 commit-generation 统一提供） |