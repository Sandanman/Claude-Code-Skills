---
name: stash-management
description: Stash 管理 — 查看、分析、保存、恢复和删除 Git stash，并对改变工作区或不可逆操作执行前置确认
---

# Stash Management 原子 Skill

## 职责

管理 `git stash` 的查询、分析和变更操作。`list`、`show`、`analyze` 为只读操作；`save`、`apply`、`pop`、`drop` 和批量清理必须先返回计划并获得确认，确认前不得执行写命令。

## 支持操作

```python
STASH_ACTIONS = {
    "list": "查看 stash",
    "show": "查看指定 stash 变更",
    "analyze": "分析 stash 数量和年龄",
    "save": "保存当前修改",
    "apply": "恢复但保留 stash",
    "pop": "恢复并删除 stash",
    "drop": "删除指定 stash",
}
```

不提供“自动清理已恢复 stash”语义，因为 `pop` 成功后 stash 已被删除，无法可靠判断其他 stash 是否已恢复。批量删除应由用户明确列出目标并确认。

## 操作规则

```python
def execute_stash(action: str, params: dict = None) -> dict:
    params = params or {}
    if action == "list":
        return list_stashes()
    if action == "show":
        return show_stash(params.get("index", 0))
    if action == "analyze":
        return analyze_stash_health()
    if action == "save":
        return plan_save_stash(params.get("message"))
    if action == "apply":
        return plan_apply_stash(params.get("index", 0))
    if action == "pop":
        return plan_pop_stash(params.get("index"))
    if action == "drop":
        return plan_drop_stash(params.get("index", 0))
    return {"status": "failed", "issues": [f"未知 action: {action}"]}
```

计划结果必须包含 `requires_confirmation: true`、影响对象和待执行命令。只有上层传入明确确认后，才调用对应的 `git stash` 写操作。stash 索引只能接受非负整数；message 和路径必须通过参数化 Git 调用或安全转义传递。

## 输入

```yaml
action: list | show | analyze | save | apply | pop | drop
index: integer | null
message: string | null
confirmed: boolean
```

## 输出

```yaml
status: passed | partial | failed | skipped
result: {}
requires_confirmation: boolean
commands: []
issues: []
```

## 完成标准

1. list 输出 stash ref、消息和可用的变更统计。
2. show 能明确区分不存在、为空和读取失败。
3. analyze 使用 stash commit 时间计算年龄，不伪造“已恢复”状态。
4. save、apply、pop、drop 在确认前不执行写命令。
5. pop/drop 的不可逆影响和冲突风险已明确展示。
6. 失败操作不得报告为成功。
