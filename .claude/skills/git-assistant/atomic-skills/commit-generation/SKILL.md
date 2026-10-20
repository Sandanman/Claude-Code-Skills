---
name: commit-generation
description: Commit 生成与规范验证 — 分析 staged 变更生成 Conventional Commit，并支持批量提交规范检查
---

# Commit Generation 原子 Skill

## 职责

读取已暂存变更，生成并验证 Conventional Commit；也可对指定历史范围批量检查提交规范。该 Skill 只生成计划和结果，`git commit` 必须在用户确认后由上层执行。

## 公共规则

```python
TYPE_MAP = {
    "feat": "新增功能", "fix": "修复问题", "docs": "文档更新",
    "style": "代码格式", "refactor": "重构代码", "test": "测试相关", "chore": "构建/工具",
}
CONVENTIONAL_REGEX = r"^(\w+)(?:\(([\w/-]+)\))?!?:\s+(.+)$"
```

捕获组依次为 `type`、`scope`、`description`；禁止把用户输入直接拼接为 Shell 命令。

## 核心流程

```python
def analyze_changes() -> dict:
    diff_stat = execute_git("git diff --staged --stat")
    files = parse_changed_files(diff_stat)
    diff_content = execute_git("git diff --staged --unified=3")
    types = infer_change_types(files, diff_content)
    primary_type = choose_primary_type(types)
    scope = infer_scope(files) or "core"
    return {
        "files": files,
        "types": types,
        "primaryType": primary_type,
        "scope": scope,
        "diffContent": diff_content,
        "fileCount": len(files),
    }

def generate_message(analysis: dict) -> dict:
    primary_type = analysis.get("primaryType", "chore")
    scope = analysis.get("scope", "core")
    short_desc = generate_short_description(analysis["files"], primary_type)
    body = generate_body(analysis["files"])
    message = f"{primary_type}({scope}): {short_desc}\n\n{body}".rstrip()
    return {
        "message": message,
        "type": primary_type,
        "scope": scope,
        "validation": validate_message(message),
        "files": analysis["files"],
        "commands": ["git commit -m '<已确认的 commit message>'"],
        "requires_confirmation": True,
    }

def validate_message(message: str) -> dict:
    lines = message.splitlines()
    header = lines[0] if lines else ""
    match = re.match(CONVENTIONAL_REGEX, header)
    issues = []
    if not match:
        issues.append({"field": "format", "message": "不符合 Conventional Commits 格式", "severity": "high"})
    else:
        commit_type, _, description = match.groups()
        if commit_type not in TYPE_MAP:
            issues.append({"field": "type", "message": f"未知 type: {commit_type}", "severity": "medium"})
        if description and description[0].islower():
            issues.append({"field": "case", "message": "描述建议以大写字母开头", "severity": "low"})
    if len(header) > 72:
        issues.append({"field": "length", "message": "标题超过 72 字符", "severity": "low"})
    return {
        "valid": not any(i["severity"] == "high" for i in issues),
        "issues": issues,
        "score": max(0, 100 - sum(40 if i["severity"] == "high" else 20 if i["severity"] == "medium" else 5 for i in issues)),
        "hasBreakingChange": "BREAKING CHANGE:" in message or bool(re.match(r"^\w+(?:\([^)]*\))?!:", header)),
    }

def check_commit_message(message: str) -> dict:
    match = re.match(CONVENTIONAL_REGEX, message.strip())
    if not match:
        return {"compliant": False, "issue": "不符合 type(scope): description 格式", "severity": "high"}
    commit_type, scope, description = match.groups()
    result = {
        "compliant": commit_type in TYPE_MAP,
        "type": commit_type,
        "scope": scope,
        "description": description,
        "severity": "low",
    }
    if commit_type not in TYPE_MAP:
        result["issue"] = f"未知 type: {commit_type}"
    return result
```

`analyze_commits(commit_range)` 使用受控的 Git revision 参数读取 `%H|%s`，返回总数、合规率、类型分布和不合规提交；`commit_range` 必须先经过 Git revision 安全校验。

## 输入

```yaml
mode: generate | check
commit_range: string | null
```

## 输出

```yaml
status: passed | partial | failed
message: string | null
validation: {}
files: []
statistics: {}
requires_confirmation: boolean
issues: []
```

## 完成标准

1. staged 变更已读取，或明确记录为空/失败。
2. 生成的标题符合 Conventional Commits 格式并完成验证。
3. 批量检查输出准确统计，不执行写操作。
4. 不自动扩大暂存范围，不自动执行 commit。
5. 用户确认前明确展示 message、文件范围和命令。
