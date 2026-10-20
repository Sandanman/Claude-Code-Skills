---
name: branch-management
description: 分支管理 — 创建、切换、删除和分析分支，提供命名检查、跟踪状态和健康报告
---

# Branch Management 原子 Skill

## 职责

处理分支查询、创建、切换、删除和健康分析。创建、切换、删除、merge、rebase 等会改变仓库或工作区的操作采用“计划 → 用户确认 → 执行 → 校验”流程；健康分析为只读流程。

## 分支规则

```python
BRANCH_NAMING_RULES = r"^(feat|fix|hotfix|release|chore|docs|refactor|test)/[a-z0-9][a-z0-9_-]*$"
PROTECTED_BRANCHES = {"main", "master", "develop", "HEAD"}
STALE_THRESHOLD_DAYS = 30
```

分支健康报告区分：

- `staleBranches`：本地分支在远程不存在对应 tracking ref；
- `longLivedBranches`：距最近提交超过阈值，字段为 `daysSinceLastCommit`，不声称这是创建时间；
- `namingViolations`：不符合命名规则的非保护分支；
- `recommendations`：只生成建议，不自动删除或合并。

默认基线通过 `origin/HEAD` 或当前仓库配置探测，不硬编码 `develop`。分支名、remote 和 revision 必须作为安全参数传递，不能直接拼接 Shell 命令。

## 输入

```yaml
action: list | create | switch | delete | analyze
branch: string | null
base: string | null
remote: string | null
confirmed: boolean
```

## 输出

```yaml
status: passed | partial | failed | skipped
action: string
result: {}
commands: []
requires_confirmation: boolean
issues: []
```

## 执行规则

1. `list`、`analyze` 只读并返回完整扫描结果。
2. `create` 先验证分支名和基线，再返回创建计划。
3. `switch` 先检查工作区是否有未保存修改，再返回切换计划。
4. `delete` 默认使用安全删除，明确列出是否已合并；强制删除必须单独确认。
5. 任何失败的 Git 命令都返回 `failed`，不得吞掉异常或继续生成成功结果。

## 完成标准

- 分支健康指标的含义与实际查询一致。
- 远程不存在、未跟踪和未合并分支不混为同一类。
- 破坏性操作在执行前确认，保护分支不得自动删除。
- 输出命令使用明确目标，不包含未经处理的用户输入。
- 写操作完成后重新读取当前分支和 `git status`。
