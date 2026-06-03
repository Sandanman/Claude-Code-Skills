---
name: branch-management
description: 分支管理 — 分支创建/切换/删除/分析，验证分支名合法性，提供分支健康分析和策略建议
---

# Branch Management 原子 Skill

## 版本历史
- v1.0 (2026-06-02): 初始实现
- v1.1 (2026-06-03): 增强，集成 git-helper branch-analysis 分支健康分析能力

## 功能
处理分支创建、切换、删除、分析，提供分支命名规范检查、分支健康分析（过期分支、长期分支、命名规范）、合并策略建议。

## 核心逻辑

```python
BRANCH_PREFIXES = {
    "feat": "功能分支",
    "fix": "修复分支",
    "hotfix": "热修复分支",
    "release": "发布分支",
    "chore": "维护分支",
}

# 默认分支命名规范（可配置）
BRANCH_NAMING_RULES = r'^(feat|fix|hotfix|release|chore|docs|refactor|test)\/[a-z0-9-_]+$'
STALE_THRESHOLD_DAYS = 30

def parse_intent(user_input: str) -> dict:
    """解析用户意图"""
    if any(k in user_input for k in ["分析", "健康", "检查", "report", "状态"]):
        return {"action": "analyze"}
    if any(k in user_input for k in ["创建", "新建", "new", "create"]):
        return {"action": "create", "branch": extract_branch_name(user_input)}
    if any(k in user_input for k in ["切换", "checkout", "switch", "转到"]):
        return {"action": "switch", "branch": extract_branch_name(user_input)}
    if any(k in user_input for k in ["删除", "remove", "delete"]):
        return {"action": "delete", "branch": extract_branch_name(user_input)}
    return {"action": "list"}

def analyze_branch_health() -> dict:
    """分支健康分析 — 集成自 git-helper branch-analysis"""
    # 1. 获取当前分支状态
    current = execute_git("git branch --show-current").strip()
    status = get_branch_status(current)

    # 2. 获取所有本地分支
    local_branches = execute_git("git branch --format='%(refname:short)|%(committerdate:short)|%(authorname)'")
    local_list = parse_branch_list(local_branches)

    # 3. 获取远程分支
    remote_branches = execute_git("git branch -r --format='%(refname:short)'")
    remote_list = [r.strip() for r in remote_branches.strip().split("\n") if r.strip()]

    # 4. 检测过期分支（远程已删除但本地仍存在）
    stale = detect_stale_branches(local_list, remote_list)

    # 5. 检测长期分支（超过 N 天未合并）
    long_lived = detect_long_lived_branches(local_list, threshold=STALE_THRESHOLD_DAYS)

    # 6. 检测命名规范违规
    naming_violations = detect_naming_violations(local_list)

    # 7. 生成合并建议
    recommendations = generate_merge_recommendations(stale, long_lived)

    return {
        "currentBranch": current,
        "currentStatus": status,
        "totalBranches": len(local_list),
        "staleBranches": stale,
        "longLivedBranches": long_lived,
        "namingViolations": naming_violations,
        "recommendations": recommendations,
        "report": format_health_report(current, status, stale, long_lived, naming_violations, recommendations),
        "requires_confirmation": len(recommendations) > 0,
    }

def get_branch_status(branch: str) -> dict:
    """获取分支的 ahead/behind 状态"""
    tracking = execute_git(f"git rev-parse --abbrev-ref {branch}@{{track}} 2>/dev/null").strip()
    if not tracking:
        return {"ahead": 0, "behind": 0, "tracking": None}

    ahead = execute_git(f"git rev-list --count --left-right {branch}...{tracking} 2>/dev/null").strip()
    if not ahead:
        return {"ahead": 0, "behind": 0, "tracking": tracking}

    parts = ahead.split()
    return {
        "ahead": int(parts[0]) if len(parts) > 0 else 0,
        "behind": int(parts[1]) if len(parts) > 1 else 0,
        "tracking": tracking,
    }

def detect_stale_branches(local_list: list, remote_list: list) -> list:
    """检测过期分支（远程已删除但本地仍存在）"""
    stale = []
    for branch in local_list:
        name = branch["name"]
        remote_name = f"origin/{name}"
        if name not in remote_list and not name.startswith("origin/"):
            # 检查远程是否有对应分支
            check = execute_git(f"git ls-remote --heads origin {name} 2>/dev/null").strip()
            if not check and name not in ["master", "main", "develop"]:
                stale.append({
                    "name": name,
                    "lastCommit": branch["date"],
                    "reason": "远程已删除或不存在"
                })
    return stale

def detect_long_lived_branches(local_list: list, threshold: int = 30) -> list:
    """检测超过 N 天未更新的长期分支"""
    from datetime import datetime, timedelta
    long_lived = []
    for branch in local_list:
        # 获取分支最后提交时间
        last_commit = execute_git(f"git log {branch['name']} -1 --format='%ci' 2>/dev/null").strip()
        if not last_commit:
            continue
        try:
            commit_date = datetime.fromisoformat(last_commit[:10])
            days = (datetime.now() - commit_date).days
            if days > threshold and branch["name"] not in ["master", "main", "develop", "master"]:
                long_lived.append({
                    "name": branch["name"],
                    "daysSinceCreation": days,
                    "author": branch.get("author", ""),
                    "reason": f"超过 {threshold} 天未更新"
                })
        except:
            pass
    return long_lived

def detect_naming_violations(branches: list) -> list:
    """检测分支命名不符合规范的分支"""
    import re
    violations = []
    for branch in branches:
        name = branch["name"]
        if name in ["master", "main", "develop", "HEAD"]:
            continue
        if not re.match(BRANCH_NAMING_RULES, name):
            violations.append({
                "name": name,
                "reason": f"不符合 {BRANCH_NAMING_RULES} 规范",
                "suggestedFormat": f"feat/{name}" if name and not "/" in name else name
            })
    return violations

def generate_merge_recommendations(stale: list, long_lived: list) -> list:
    """生成合并建议"""
    recommendations = []
    for b in stale:
        recommendations.append({
            "action": "delete",
            "branch": b["name"],
            "reason": b["reason"],
            "command": f"git branch -d {b['name']}",
        })
    for b in long_lived:
        recommendations.append({
            "action": "merge_or_close",
            "branch": b["name"],
            "reason": b["reason"],
            "command": f"git checkout {b['name']} && git merge develop",
        })
    return recommendations

def parse_branch_list(output: str) -> list:
    branches = []
    for line in output.strip().split("\n"):
        if not line.strip():
            continue
        parts = line.split("|")
        if len(parts) >= 3:
            branches.append({
                "name": parts[0].strip(),
                "date": parts[1].strip(),
                "author": parts[2].strip(),
            })
        elif len(parts) == 1:
            branches.append({"name": parts[0].strip(), "date": "", "author": ""})
    return branches

def format_health_report(current, status, stale, long_lived, violations, recommendations) -> str:
    lines = [f"## 分支健康分析报告\n"]
    lines.append(f"**当前分支**: {current}")
    lines.append(f"**状态**: ahead={status['ahead']}, behind={status['behind']}")

    if stale:
        lines.append(f"\n### 🔴 过期分支（{len(stale)} 个）")
        for b in stale:
            lines.append(f"- `{b['name']}` - {b['reason']}")

    if long_lived:
        lines.append(f"\n### 🟡 长期分支（{len(long_lived)} 个）")
        for b in long_lived:
            lines.append(f"- `{b['name']}` - {b['daysSinceCreation']} 天未更新")

    if violations:
        lines.append(f"\n### 🟠 命名规范违规（{len(violations)} 个）")
        for v in violations:
            lines.append(f"- `{v['name']}` - {v['reason']}，建议: `{v['suggestedFormat']}`")

    if recommendations:
        lines.append(f"\n### 建议操作")
        for r in recommendations:
            lines.append(f"- `{r['command']}` - {r['reason']}")

    return "\n".join(lines)
```

## 分支命名规范

```
feat/<功能名>      # 功能分支
fix/<问题描述>     # 修复分支
hotfix/<问题描述>  # 热修复分支
release/<版本>     # 发布分支
docs/<文档名>      # 文档分支
refactor/<描述>    # 重构分支
test/<测试目标>    # 测试分支
```

## 输出

```json
{
  "action": "analyze",
  "currentBranch": "feature/meeting-api",
  "currentStatus": {"ahead": 3, "behind": 0, "tracking": "origin/feature/meeting-api"},
  "totalBranches": 18,
  "staleBranches": [
    {"name": "feature/old-feature", "reason": "远程已删除"}
  ],
  "longLivedBranches": [
    {"name": "feature/meeting-api", "daysSinceCreation": 45, "reason": "超过 30 天未更新"}
  ],
  "namingViolations": [
    {"name": "my-feature", "reason": "不符合规范", "suggestedFormat": "feat/my-feature"}
  ],
  "recommendations": [
    {"action": "delete", "branch": "feature/old-feature", "reason": "远程已删除", "command": "git branch -d feature/old-feature"}
  ],
  "report": "## 分支健康分析报告\n...",
  "requires_confirmation": true
}
```

## τ 估算
600 → 900（创建/切换/删除 600，分析分支健康 900）

## 与 branch-analysis 的区别

| 维度 | branch-management | branch-analysis |
|------|-------------------|----------------|
| 核心能力 | 分支 CRUD + 健康分析 | 纯健康分析（只读） |
| 操作 | 创建/切换/删除/分析 | 仅分析和报告 |
| 适用场景 | 日常 Git 操作 | 代码审查/定期检查 |