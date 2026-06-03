---
name: history-analysis
description: 历史分析 — 分析 commit 历史、作者统计、文件变更热力图，支持日期范围过滤和分支对比
---

# History Analysis 原子 Skill

## 版本历史
- v1.0 (2026-06-02): 初始实现
- v1.2 (2026-06-03): 增强，新增 git shortlog、日期过滤、分支对比、文件热力图

## 功能
分析文件/目录的 commit 历史，通过 git log/blame/shortlog 生成多维度变更分析报告。支持日期范围过滤、作者贡献排名、文件变更热力图、分支间对比。

## 核心能力

- **commit 历史**: 按时间/作者/文件过滤的提交记录
- **author 统计**: git shortlog 贡献排名，支持按时间段筛选
- **文件热力图**: 分析文件的变更频率，识别高频修改区域（hot lines）
- **变更趋势**: 按月/周统计提交频率趋势
- **分支对比**: 对比两个分支/Tag 之间的变更差异
- **日期过滤**: 支持 "last week"、"last month"、自定义日期范围

## 核心逻辑

```python
def analyze_history(target: str, params: dict = None) -> dict:
    """
    分析 target（文件/目录/分支）的历史
    params 支持: since, until, author, limit, branch
    """
    params = params or {}
    since = params.get("since", "30 days ago")
    until = params.get("until", "now")
    author = params.get("author")
    limit = params.get("limit", 50)

    # 1. 提交历史
    log = execute_git(build_log_cmd(target, since, until, author, limit))
    commits = parse_log(log)

    # 2. author 统计（git shortlog）
    shortlog = execute_git(build_shortlog_cmd(since, until, author))
    authors = parse_shortlog(shortlog)

    # 3. 变更趋势（按月统计）
    trend = analyze_trend(target, since, until)

    # 4. 文件热力图（如果 target 是文件）
    hot_lines = []
    if is_file(target):
        blame = execute_git(f"git blame --date=short {target} 2>/dev/null")
        hot_lines = find_hot_lines(blame)

    # 5. 统计摘要
    churn = len([c for c in commits if c.get("message")])
    top_author = authors[0] if authors else {}

    return {
        "target": target,
        "params": params,
        "commits": commits,
        "top_contributors": authors[:10],
        "churn_score": churn,
        "hot_lines": hot_lines,
        "trend": trend,
        "summary": generate_summary(target, commits, authors, churn, hot_lines),
        "commands": [build_log_cmd(target, since, until, author, limit)],
    }

def build_log_cmd(target: str, since: str, until: str, author: str, limit: int) -> str:
    """构建 git log 命令"""
    parts = ["git log", f"--since='{since}'", f"--until='{until}'", "--pretty=format:'%h|%s|%ae|%ai'"]
    if author:
        parts.insert(1, f"--author='{author}'")
    if target:
        parts.append(f"-- {target}")
    parts.append(f"-n {limit}")
    return " ".join(parts)

def build_shortlog_cmd(since: str, until: str, author: str) -> str:
    """构建 git shortlog 命令"""
    parts = ["git shortlog", "-sne", f"--since='{since}'", f"--until='{until}'"]
    if author:
        parts.insert(2, f"--author='{author}'")
    return " ".join(parts)

def parse_log(log_output: str) -> list:
    """解析 git log 输出"""
    commits = []
    for line in log_output.strip().split("\n"):
        if not line.strip():
            continue
        parts = line.split("|")
        if len(parts) < 4:
            continue
        commits.append({
            "hash": parts[0].strip(),
            "message": parts[1].strip(),
            "author_email": parts[2].strip(),
            "date": parts[3].strip(),
            "type": infer_commit_type(parts[1]),
        })
    return commits

def parse_shortlog(shortlog_output: str) -> list:
    """解析 git shortlog 输出"""
    authors = []
    for line in shortlog_output.strip().split("\n"):
        if not line.strip():
            continue
        # 格式: "  123  Author Name <email@example.com>"
        m = re.match(r"\s*(\d+)\s+(.+?)\s+<(.+?)>", line)
        if m:
            count, name, email = int(m.group(1)), m.group(2).strip(), m.group(3).strip()
            authors.append({"name": name, "email": email, "commits": count})
    return sorted(authors, key=lambda a: a["commits"], reverse=True)

def infer_commit_type(message: str) -> str:
    """推断 commit 类型"""
    msg = message.lower()
    if msg.startswith("feat"): return "feat"
    if msg.startswith("fix"): return "fix"
    if msg.startswith("docs"): return "docs"
    if msg.startswith("style"): return "style"
    if msg.startswith("refactor"): return "refactor"
    if msg.startswith("test"): return "test"
    if msg.startswith("chore"): return "chore"
    if msg.startswith("perf"): return "perf"
    if msg.startswith("ci"): return "ci"
    return "other"

def analyze_trend(target: str, since: str, until: str) -> dict:
    """按月统计提交频率趋势"""
    log = execute_git(
        f"git log --since='{since}' --until='{until}' "
        f"--pretty=format:'%ai' -- {'target' if target else '.'}"
    )
    months = {}
    for line in log.strip().split("\n"):
        if not line.strip():
            continue
        month = line[:7]  # YYYY-MM
        months[month] = months.get(month, 0) + 1

    sorted_months = sorted(months.items())
    peak_month = max(months, key=months.get) if months else None
    return {
        "monthly": dict(sorted_months),
        "total": sum(months.values()),
        "peakMonth": peak_month,
        "peakCount": months.get(peak_month, 0) if peak_month else 0,
    }

def find_hot_lines(blame_output: str) -> list:
    """分析高频变更行（hot lines）"""
    if not blame_output.strip():
        return []
    lines = blame_output.strip().split("\n")
    hot = []
    for i, line in enumerate(lines, 1):
        if line.strip() and not line.startswith("^"):  # 排除初始提交行
            # 提取作者（blame 格式：hash (author date line)）
            m = re.match(r"[0-9a-f]+\s+\((.+?)\s+(\d{4}-\d{2}-\d{2})\s+(\d+)\)", line)
            if m:
                hot.append({
                    "line": i,
                    "author": m.group(1).strip(),
                    "date": m.group(2),
                    "preview": line.strip()[:60],
                })
    # 返回变更最多的 10 行
    from collections import Counter
    author_counts = Counter(item["author"] for item in hot)
    top_authors = author_counts.most_common(3)
    return hot[:10]

def is_file(target: str) -> bool:
    """判断 target 是否为文件（而非目录）"""
    if not target:
        return False
    result = execute_git(f"git ls-files {target} 2>/dev/null")
    return bool(result.strip())

def generate_summary(target: str, commits: list, authors: list, churn: int, hot_lines: list) -> str:
    """生成分析摘要"""
    if not commits:
        return f"未找到 {target or '当前分支'} 的历史记录"
    top = authors[0] if authors else None
    msg = f"{target or '当前分支'} 共 {len(commits)} 次提交，{churn} 次有效变更"
    if top:
        msg += f"，{top['name']} 贡献最多（{top['commits']} 次）"
    if hot_lines:
        msg += f"，变更最频繁的行位于第 {hot_lines[0]['line']} 行"
    return msg

# ── 分支对比（新增 v1.2）───────────────────────────────
def compare_branches(base: str, head: str, target_path: str = None) -> dict:
    """对比两个分支/Tag 之间的变更差异"""
    cmd = f"git log {base}..{head} --pretty=format:'%h|%s|%ae' --{' target_path' if target_path else '.'}"
    log = execute_git(cmd)
    commits = parse_log(log)

    diff_stat = execute_git(f"git diff --stat {base}..{head}")

    # 统计类型分布
    type_dist = {}
    for c in commits:
        t = c.get("type", "other")
        type_dist[t] = type_dist.get(t, 0) + 1

    # 文件变更统计
    file_cmd = f"git diff --name-only {base}..{head}"
    if target_path:
        file_cmd += f" -- {target_path}"
    changed_files = [f.strip() for f in execute_git(file_cmd).strip().split("\n") if f.strip()]

    added = diff_stat.count(" +")
    removed = diff_stat.count(" -")

    return {
        "base": base,
        "head": head,
        "target": target_path,
        "commitCount": len(commits),
        "changedFiles": changed_files,
        "fileCount": len(changed_files),
        "changes": {"added": added, "removed": removed},
        "typeDistribution": type_dist,
        "summary": f"{base} → {head}: {len(commits)} 次提交，{len(changed_files)} 个文件变更（+{added}/-{removed}）",
        "commands": [cmd, f"git diff --stat {base}..{head}"],
    }

# ── 日期范围解析（新增 v1.2）───────────────────────────
def parse_date_range(user_input: str) -> dict:
    """解析用户输入的日期范围"""
    from datetime import datetime, timedelta
    now = datetime.now()
    if any(k in user_input for k in ["最近一周", "last week", "这周"]):
        return {"since": (now - timedelta(days=7)).isoformat(), "until": now.isoformat()}
    if any(k in user_input for k in ["最近一月", "last month", "这月", "本月"]):
        return {"since": (now - timedelta(days=30)).isoformat(), "until": now.isoformat()}
    if any(k in user_input for k in ["最近三个月", "last 3 months"]):
        return {"since": (now - timedelta(days=90)).isoformat(), "until": now.isoformat()}
    return {"since": (now - timedelta(days=30)).isoformat(), "until": now.isoformat()}
```

## 输出

```json
{
  "target": "src/components/Button.vue",
  "churn_score": 8,
  "top_contributors": [
    {"name": "张三", "email": "zhangsan@example.com", "commits": 12},
    {"name": "李四", "email": "lisi@example.com", "commits": 5}
  ],
  "hot_lines": [
    {"line": 42, "author": "张三", "date": "2026-05-20", "preview": "const defaultProps = {"}
  ],
  "trend": {
    "monthly": {"2026-04": 3, "2026-05": 5, "2026-06": 2},
    "total": 10,
    "peakMonth": "2026-05",
    "peakCount": 5
  },
  "summary": "src/components/Button.vue 共 8 次提交，张三贡献最多（12 次）",
  "requires_confirmation": false
}
```

```json
{
  "action": "compare",
  "base": "develop",
  "head": "feature/new-ui",
  "commitCount": 23,
  "fileCount": 15,
  "changes": {"added": 420, "removed": 88},
  "typeDistribution": {"feat": 5, "fix": 3, "refactor": 2, "other": 13},
  "summary": "develop → feature/new-ui: 23 次提交，15 个文件变更（+420/-88）"
}
```

## τ 估算
1200（基础分析）→ 1500（含分支对比 + 热力图）

## 完成标准

1. commit 历史按时间/作者/日期过滤正确
2. top_contributors 排名准确（按 commit 数量降序）
3. hot_lines 识别变更最频繁的行
4. trend 显示月级别提交频率
5. 分支对比输出包含 commits、files、changes 统计
6. 空结果时给出明确提示