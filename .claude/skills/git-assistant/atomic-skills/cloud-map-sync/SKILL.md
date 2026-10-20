---
name: cloud-map-sync
description: 云图变更同步 — 在 commit 最终确认前，按 staged 文件将变更摘要同步到项目云图
---

# Cloud Map Sync 原子 Skill

## 职责

这是 commit-generation 的条件链路，不参与用户意图路由。仅在 `commit-generation` 已生成 commit、用户确认继续、且 `docs/project-cloud-map.md` 存在时执行。云图更新会进入最终 staged 范围并随 commit 提交。

## 执行规则

```python
def run(commit_type: str, commit_scope: str, confirmed: bool = False) -> dict:
    if not check_file_exists("docs/project-cloud-map.md"):
        return {"status": "skipped", "reason": "云图文件不存在"}
    if not confirmed:
        return {"status": "skipped", "requires_confirmation": True, "reason": "等待 commit 确认"}

    changed_files = read_staged_files()
    if not changed_files:
        return {"status": "skipped", "reason": "没有 staged 文件"}

    content = read_file("docs/project-cloud-map.md")
    hints = extract_path_hints(content)
    matches = match_nodes(changed_files, hints)
    updated = append_idempotent_logs(content, matches, commit_type, commit_scope)

    if updated.changed:
        write_file("docs/project-cloud-map.md", updated.content)
        execute_git("git add -- docs/project-cloud-map.md")

    return {
        "status": "passed",
        "updated_nodes": updated.nodes,
        "unmatched_files": matches["unmatched_files"],
        "staged": updated.changed,
    }
```

写入或 `git add` 失败时返回 `failed`，上层必须阻塞 commit；不得吞掉异常或继续提交。相同日期、分支、类型、摘要和节点的日志不得重复追加。Mermaid 和 Markdown 特殊字符必须转义，摘要不超过 20 个字符。

匹配策略采用最长路径关键词优先；无法可靠解析的 Mermaid 结构返回 `partial` 和原因，不假定所有 Mermaid 语法均受支持。

## 输入

```yaml
commit_type: string
commit_scope: string
confirmed: boolean
```

## 输出

```yaml
status: passed | partial | failed | skipped
updated_nodes: []
unmatched_files: []
cloud_map_path: docs/project-cloud-map.md
staged: boolean
requires_confirmation: boolean
issues: []
```

## 完成标准

1. 云图不存在时静默跳过，不阻塞 commit。
2. staged 文件均已尝试匹配并报告未匹配项。
3. 命中节点追加不超过 20 字的变更摘要。
4. 已有日志追加而不删除旧记录；重复运行保持幂等。
5. 云图修改成功且已明确加入 staged 范围。
6. 任一读取、写入或暂存失败都阻塞后续 commit。
