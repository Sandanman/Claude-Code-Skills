---
name: version-management
description: 版本管理 — 管理 Git Tag、Semantic Versioning、版本建议和 CHANGELOG
---

# Version Management 原子 Skill

## 职责

提供 Tag 查询、semver 解析、版本建议和 CHANGELOG 生成。创建、删除、远程 push 等写操作采用预览和确认两阶段；只读动作可直接执行。

## 核心规则

```python
SEMVER_REGEX = r"^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$"

VERSION_ACTIONS = {"list", "suggest", "create", "push", "delete", "changelog", "report"}
```

CHANGELOG 分类按 Conventional Commit 的 type 解析：

- `feat` → `Added`
- `fix` → `Fixed`
- `refactor`、`perf`、`style`、`chore` → `Changed`
- `revert` → `Removed`
- 其他 → `Other`

Breaking Change 同时检查 header 的 `!` 和 commit body/footer 中的 `BREAKING CHANGE:`。无起始 Tag 时执行不带 range 的 `git log HEAD`，不能把中文说明当作 revision。

## 操作边界

```python
def execute_action(action: str, params: dict = None) -> dict:
    if action not in VERSION_ACTIONS:
        return {"status": "failed", "issues": [f"未知 action: {action}"]}
    if action in {"create", "push", "delete"}:
        return build_confirmation_plan(action, params or {})
    if action == "list":
        return list_tags()
    if action == "suggest":
        return suggest_version((params or {}).get("from_tag"))
    if action == "changelog":
        return generate_changelog((params or {}).get("from_tag"), (params or {}).get("to_tag", "HEAD"))
    return generate_full_report()
```

确认计划必须展示 tag、remote、命令和影响范围。只有确认后才执行 `git tag`、`git push` 或 `git tag -d`。所有 tag、remote 和 revision 参数先验证存在性和格式，不能未经处理拼接 Shell 命令。

## 输入

```yaml
action: list | suggest | create | push | delete | changelog | report
version: string | null
from_tag: string | null
to_tag: string | null
tag: string | null
remote: string | null
annotated: boolean
message: string | null
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

## 完成标准

1. Tag 列表、semver 验证和版本建议来自实际仓库数据。
2. CHANGELOG 的分类和范围正确，空 Tag 历史也能处理。
3. create、push、delete 在确认前不执行写操作。
4. 远程名使用输入或仓库默认值，不硬编码 `origin`。
5. 时间使用带时区的 UTC 表示。
6. 报告以结构化结果返回；不声称生成未实际写入的文件。
