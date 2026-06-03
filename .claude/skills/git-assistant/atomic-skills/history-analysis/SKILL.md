---
name: history-analysis
description: 历史分析 — 分析 commit 历史，查找变更来源，生成变更报告
---

# History Analysis 原子 Skill

## 功能
分析文件/目录的 commit 历史，通过 git log/blame 生成变更分析报告。

## 核心逻辑

```python
def analyze_history(target: str) -> dict:
    log = execute_git(f"git log --oneline -20 -- {target}")
    blame = execute_git(f"git blame --date=short {target}")
    
    authors = extract_authors(log)
    churn = calculate_churn(log)
    hot_lines = find_hot_lines(blame)
    
    return {
        "target": target,
        "commits": parse_log(log),
        "top_contributors": authors[:5],
        "churn_score": churn,
        "hot_lines": hot_lines,
        "summary": generate_summary(authors, churn),
    }

def parse_log(log_output: str) -> list:
    commits = []
    for line in log_output.strip().split("\n"):
        if line.strip():
            parts = line.split(" ", 1)
            commits.append({
                "hash": parts[0],
                "message": parts[1] if len(parts) > 1 else "",
            })
    return commits

def calculate_churn(log: str) -> int:
    return len([l for l in log.strip().split("\n") if l.strip()])
```

## 输出

```json
{
  "target": "src/components/Button.vue",
  "commits": [{"hash": "a1b2c3d", "message": "feat: 添加 Button 组件"}],
  "top_contributors": [{"name": "张三", "commits": 12}],
  "churn_score": 8,
  "hot_lines": [{"line": 42, "author": "张三", "date": "2026-05-20"}],
  "summary": "Button.vue 共 8 次提交，张三贡献最多（12 次）",
  "commands": []
}
```
