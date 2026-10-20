---
name: history-analysis
description: 历史分析 — 分析 commit、作者、趋势、blame 和分支差异，支持目标与日期过滤
---

# History Analysis 原子 Skill

## 职责

使用 `git log`、`git shortlog`、`git blame` 和 `git diff` 生成只读历史分析。命令参数必须安全处理；结果只反映实际扫描到的历史。

## 核心逻辑

```python
LOG_FORMAT = "%H|%s|%ae|%ai"

def analyze_history(target: str = None, params: dict = None) -> dict:
    params = params or {}
    branch = params.get("branch") or "HEAD"
    commits = parse_log(execute_git(build_log_cmd(branch, target, params)))
    authors = parse_shortlog(execute_git(build_shortlog_cmd(branch, target, params)))
    trend = analyze_trend(branch, target, params)
    hot_lines = []
    if target and is_file(target):
        hot_lines = find_blame_lines(execute_git(build_blame_cmd(branch, target)))
    return {
        "target": target,
        "branch": branch,
        "commits": commits,
        "top_contributors": authors[:10],
        "churn_score": len(commits),
        "hot_lines": hot_lines,
        "trend": trend,
        "summary": generate_summary(target, commits, authors, len(commits), hot_lines),
    }

def parse_log(log_output: str) -> list:
    commits = []
    for line in log_output.splitlines():
        parts = line.split("|", 3)
        if len(parts) != 4:
            continue
        commits.append({
            "hash": parts[0], "message": parts[1],
            "author_email": parts[2], "date": parts[3],
            "type": infer_commit_type(parts[1]),
        })
    return commits

def compare_branches(base: str, head: str, target_path: str = None) -> dict:
    revision = f"{base}..{head}"
    path_arg = f" -- {target_path}" if target_path else ""
    log = execute_git(f"git log {revision} --pretty=format:'%H|%s|%ae|%ai'{path_arg}")
    commits = parse_log(log)
    diff_stat = execute_git(f"git diff --numstat {revision}{path_arg}")
    changed_files = parse_changed_files(execute_git(f"git diff --name-only {revision}{path_arg}"))
    added, removed = sum_numstat(diff_stat)
    return {
        "base": base, "head": head, "target": target_path,
        "commitCount": len(commits), "changedFiles": changed_files,
        "fileCount": len(changed_files), "changes": {"added": added, "removed": removed},
        "typeDistribution": count_types(commits),
    }
```

`churn_score` 定义为指定范围内有效提交数量；`hot_lines` 表示 blame 摘要，不将当前 blame 误称为历史变更频率。日期、author、branch 和 target 通过参数化调用或安全校验传递。

## 输入

```yaml
action: history | compare
branch: string | null
target: string | null
since: string | null
until: string | null
author: string | null
limit: integer
base: string | null
head: string | null
```

## 输出

```yaml
status: passed | partial | failed
result: {}
commands: []
requires_confirmation: false
issues: []
```

## 完成标准

1. 历史记录按 branch、target、日期、author 和 limit 过滤正确。
2. `parse_log` 与所有 log 命令使用同一字段格式。
3. 作者统计按 commit 数量降序排列。
4. trend 的统计范围与请求一致。
5. 分支对比准确返回 commits、changed files 和 numstat。
6. 空结果和解析失败均有明确状态。
