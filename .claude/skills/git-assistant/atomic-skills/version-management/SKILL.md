---
name: version-management
description: 版本管理 — 管理 Git Tag，生成 CHANGELOG，支持 Semantic Versioning 规范
---

# Version Management 原子 Skill

## 版本历史
- v1.0 (2026-06-03): 新增，集成自 git-helper version-management

## 功能
管理 Git 版本标签（Tag），包括列出/创建/删除/推送 Tag，以及基于 Tag 范围生成符合规范的 CHANGELOG。遵循 Semantic Versioning (semver) 规范，支持预发布版本（alpha/beta/rc）命名。

## 核心能力

- **Tag 列表查询**: 列出所有 Tag，按版本号降序排列
- **Tag 创建**: 创建附注 Tag（annotated）或轻量 Tag（lightweight）
- **Tag 推送**: 推送 Tag 到远程（单个或所有）
- **Tag 删除**: 删除本地和远程 Tag（带确认提示）
- **版本号建议**: 基于提交内容建议下一个版本号（MAJOR.MINOR.PATCH）
- **CHANGELOG 生成**: 基于两个 Tag 之间的提交生成 CHANGELOG，按 Added/Fixed/Changed 分类
- **版本预测**: 根据当前提交预估下一个版本号和发布日期

## Semantic Versioning 规范

版本号格式：`MAJOR.MINOR.PATCH`
- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的新功能
- **PATCH**: 向后兼容的问题修复

预发布版本：`MAJOR.MINOR.PATCH-alpha.1`、`MAJOR.MINOR.PATCH-beta.2`、`MAJOR.MINOR.PATCH-rc.1`

## 核心逻辑

```python
import re
SEMVER_REGEX = r'^v?(\d+)\.(\d+)\.(\d+)(-[a-z]+\.\d+)?$'

# 动作分发器（v1.2 新增）
def execute_action(action: str, params: dict = None) -> dict:
    """根据 action 参数分发到对应的处理函数"""
    params = params or {}
    dispatch = {
        "list":      lambda: list_tags(),
        "suggest":   lambda: suggest_version(params.get("from_tag")),
        "create":    lambda: create_tag(
            params.get("version"), params.get("annotated", True), params.get("message")
        ),
        "push":      lambda: push_tag(params.get("tag"), params.get("all", False)),
        "delete":    lambda: delete_tag(
            params.get("tag"), params.get("remote", False)
        ),
        "changelog": lambda: generate_changelog(params.get("from_tag"), params.get("to_tag", "HEAD")),
        "report":    lambda: generate_full_report(),
    }
    handler = dispatch.get(action, lambda: {"error": f"未知 action: {action}"})
    result = handler()
    result["action"] = action
    result["operationTime"] = get_timestamp()
    return result

def get_timestamp() -> str:
    from datetime import datetime
    return datetime.now().isoformat() + "Z"

# ── Tag 列表 ────────────────────────────────────────────
def list_tags() -> dict:
    output = execute_git("git tag -l --sort=-version:refname")
    tags = [t.strip() for t in output.strip().split("\n") if t.strip()]
    latest = get_latest_tag()
    # 获取每个 Tag 的日期和提交信息
    tag_details = []
    for tag in tags[:10]:  # 只取前 10 个
        info = execute_git(f"git log -1 --format='%h %ci' {tag} 2>/dev/null").strip()
        tag_details.append({"name": tag, "info": info})
    return {
        "tags": tags,
        "count": len(tags),
        "latest": latest,
        "tagDetails": tag_details,
        "commands": ["git tag -l --sort=-version:refname"],
    }

# ── 版本建议 ────────────────────────────────────────────
def suggest_version(tag_range: str = None) -> dict:
    prev_tag = tag_range or get_latest_tag()
    if not prev_tag:
        return {"suggestion": "1.0.0", "reason": "首个版本", "type": "major"}

    log = execute_git(f"git log {prev_tag}..HEAD --pretty=format:'%s'")
    msgs = [m.strip() for m in log.strip().split("\n") if m.strip()]

    feat_count = sum(1 for m in msgs if m.startswith("feat"))
    fix_count = sum(1 for m in msgs if m.startswith("fix"))
    breaking = sum(1 for m in msgs if "BREAKING CHANGE" in m)
    docs_count = sum(1 for m in msgs if m.startswith("docs"))
    other = len(msgs) - feat_count - fix_count - breaking - docs_count

    # 版本号规则
    if breaking > 0:
        version = bump_major(prev_tag)
        reason = f"包含 {breaking} 个 Breaking Change，需升主版本"
        vtype = "major"
    elif feat_count > 0:
        version = bump_minor(prev_tag)
        reason = f"包含 {feat_count} 个新功能（feat），升次版本"
        vtype = "minor"
    elif fix_count > 0:
        version = bump_patch(prev_tag)
        reason = f"包含 {fix_count} 个修复（fix），升补丁版本"
        vtype = "patch"
    else:
        version = bump_patch(prev_tag)
        reason = f"无 feat/fix，自 {prev_tag} 以来 {len(msgs)} 个提交"
        vtype = "patch"

    current_v = parse_semver(prev_tag)
    return {
        "currentTag": prev_tag,
        "versionSuggestion": version,
        "versionType": vtype,
        "reason": reason,
        "changesSinceTag": len(msgs),
        "allSuggestions": {
            "major": bump_major(prev_tag),
            "minor": bump_minor(prev_tag),
            "patch": bump_patch(prev_tag),
        },
        "typeBreakdown": {
            "feat": feat_count, "fix": fix_count,
            "breaking": breaking, "docs": docs_count, "other": other
        },
        "commands": [f"git log {prev_tag}..HEAD --pretty=format:'%s'"],
    }

# ── 创建 Tag ────────────────────────────────────────────
def create_tag(version: str, annotated: bool = True, message: str = None) -> dict:
    if not re.match(SEMVER_REGEX, version or ""):
        return {"success": False, "error": f"版本号 {version} 不符合 semver 规范"}
    tag_name = version if version.startswith("v") else f"v{version}"
    msg = message or f"Release {tag_name}"
    cmd = f"git tag -a {tag_name} -m '{msg}'" if annotated else f"git tag {tag_name}"
    execute_git(cmd)
    sha = execute_git(f"git rev-parse {tag_name}").strip()
    return {
        "success": True,
        "tag": tag_name,
        "type": "annotated" if annotated else "lightweight",
        "message": msg,
        "sha": sha,
        "commands": [cmd, f"git push origin {tag_name}"],
        "requires_confirmation": True,
    }

# ── 推送 Tag ────────────────────────────────────────────
def push_tag(tag: str = None, push_all: bool = False) -> dict:
    if push_all:
        cmd = "git push --tags"
        result = execute_git(cmd)
        return {
            "action": "push",
            "all": True,
            "commands": [cmd],
            "result": result,
        }
    if not tag:
        return {"success": False, "error": "未指定 Tag 名称"}
    tag_name = tag if tag.startswith("v") else f"v{tag}"
    cmd = f"git push origin {tag_name}"
    result = execute_git(cmd)
    return {
        "success": True,
        "tag": tag_name,
        "commands": [cmd],
        "result": result,
    }

# ── 删除 Tag ────────────────────────────────────────────
def delete_tag(tag: str, remove_remote: bool = False) -> dict:
    if not tag:
        return {"success": False, "error": "未指定 Tag 名称"}
    tag_name = tag if tag.startswith("v") else f"v{tag}"
    local_cmd = f"git tag -d {tag_name}"
    execute_git(local_cmd)
    commands = [local_cmd]
    result = {"local": f"已删除本地 Tag: {tag_name}"}
    if remove_remote:
        remote_cmd = f"git push origin --delete {tag_name}"
        execute_git(remote_cmd)
        commands.append(remote_cmd)
        result["remote"] = f"已删除远程 Tag: {tag_name}"
    return {
        "success": True,
        "tag": tag_name,
        "commands": commands,
        "result": result,
        "requires_confirmation": True,
        "warning": "删除 Tag 是不可逆操作，确认后执行",
    }

# ── CHANGELOG 生成 ───────────────────────────────────────
def generate_changelog(from_tag: str = None, to_tag: str = "HEAD") -> dict:
    base = from_tag or get_latest_tag() or "首个提交"
    log = execute_git(f"git log {base}..{to_tag} --pretty=format:'%s|%h|%ae'")

    sections = {"Added": [], "Fixed": [], "Changed": [], "Removed": [], "Other": []}
    author_stats = {}
    total = 0

    for line in log.strip().split("\n"):
        if not line.strip():
            continue
        parts = line.split("|")
        if len(parts) < 2:
            continue
        msg, sha = parts[0].strip(), parts[1].strip()
        author = parts[2].strip() if len(parts) > 2 else "unknown"
        author_stats[author] = author_stats.get(author, 0) + 1
        total += 1

        entry = f"- {msg[5:].strip() if msg.startswith('feat:') else msg[4:].strip() if msg.startswith('fix:') else msg} ({sha})"
        if msg.startswith("feat"):
            sections["Added"].append(entry)
        elif msg.startswith("fix"):
            sections["Fixed"].append(entry)
        elif msg.startswith("feat") or msg.startswith("fix"):
            sections["Changed"].append(entry)
        else:
            sections["Other"].append(entry)

    # 生成 Markdown
    lines = [f"# Changelog\n", f"## {to_tag}"]
    if from_tag:
        lines.append(f" ({base} → {to_tag})")
    lines.append(f"\n共 {total} 个提交变更\n")
    for section, items in sections.items():
        if items:
            lines.append(f"\n### {section}\n")
            lines.extend(items)

    changelog_md = "\n".join(lines)
    return {
        "from": from_tag,
        "to": to_tag,
        "changelog": changelog_md,
        "sectionCounts": {k: len(v) for k, v in sections.items()},
        "totalCommits": total,
        "topAuthor": max(author_stats, key=author_stats.get) if author_stats else None,
        "authorStats": author_stats,
        "commands": [f"git log {base}..{to_tag} --pretty=format:'%s|%h|%ae'"],
    }

# ── 完整报告 ────────────────────────────────────────────
def generate_full_report() -> dict:
    """生成版本管理完整报告"""
    tags_info = list_tags()
    latest_tag = tags_info.get("latest")
    suggestion = suggest_version(latest_tag) if latest_tag else {"suggestion": "1.0.0"}

    return {
        "currentTags": tags_info.get("tags", []),
        "latestTag": latest_tag,
        "tagCount": tags_info.get("count", 0),
        "versionSuggestion": suggestion,
        "report": f"## 版本管理报告\n\n当前共 {tags_info.get('count', 0)} 个 Tag\n最新: {latest_tag or '无'}\n建议: {suggestion.get('versionSuggestion')} ({suggestion.get('reason')})",
    }

# ── 辅助函数 ────────────────────────────────────────────
def parse_semver(tag: str) -> tuple:
    m = re.match(SEMVER_REGEX, tag)
    if m:
        return (int(m.group(1)), int(m.group(2)), int(m.group(3)))
    return (0, 0, 0)

def bump_major(tag: str) -> str:
    v = parse_semver(tag)
    return f"v{v[0]+1}.0.0"

def bump_minor(tag: str) -> str:
    v = parse_semver(tag)
    return f"v{v[0]}.{v[1]+1}.0"

def bump_patch(tag: str) -> str:
    v = parse_semver(tag)
    return f"v{v[0]}.{v[1]}.{v[2]+1}"

def get_latest_tag() -> str:
    output = execute_git("git describe --tags --abbrev=0 2>/dev/null")
    return output.strip() or None
```

## 输入

- **Action**: 操作类型（list/suggest/create/push/delete/changelog）
- **VersionNumber**: 新版本号（如 `2.1.0`，遵循 semver）
- **TagRange**: 用于 CHANGELOG 的 Tag 范围（from Tag → to Tag，默认上一个 Tag → HEAD）
- **TagMessage**: Tag 附注信息（默认为 `Release v{version}`）
- **RemoteName**: 远程仓库名（默认为 origin）

## 输出

```json
{
  "operationTime": "2026-06-03T10:00:00Z",
  "action": "changelog",
  "project": "{{PROJECT_NAME}}",
  "latestTag": "2.0.0",
  "versionSuggestion": {
    "patch": "2.0.1",
    "minor": "2.1.0",
    "major": "3.0.0",
    "reason": "自 2.0.0 以来有 3 个 fix 提交，1 个新功能"
  },
  "changelog": {
    "from": "v1.2.0",
    "to": "HEAD",
    "sections": {
      "Added": ["- feat(auth): 添加登录功能 (#45)"],
      "Fixed": ["- fix(ui): 修复大型会议列表滚动性能问题 (#43)"],
      "Changed": ["- chore(deps): 升级 Vue to 3.4.0"]
    }
  },
  "tagCreated": {
    "name": "v2.0.0",
    "type": "annotated",
    "message": "Release v2.0.0",
    "sha": "a1b2c3d4e5f6"
  },
  "requires_confirmation": true,
  "reportFile": "git-version-report.md"
}
```

## τ 估算
700（Tag 操作 + CHANGELOG 生成）

## 完成标准

1. 成功列出所有 Tag，按版本号降序排列
2. 创建 Tag 时版本号符合 semver 规范
3. 生成的 CHANGELOG 按 Added/Fixed/Changed 分类
4. 版本建议有明确依据（基于提交类型统计）
5. 如操作涉及远程，同步执行推送操作
6. 生成 `git-version-report.md` 并保存