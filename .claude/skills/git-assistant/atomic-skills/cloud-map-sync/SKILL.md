---
name: cloud-map-sync
description: 云图变更同步 — 在 commit 最终确认前，按 staged 文件将变更摘要同步到项目云图
---

# Cloud Map Sync 原子 Skill

## 职责

这是 commit-generation 的条件链路，不参与用户意图路由。仅在 `commit-generation` 已生成 commit、用户确认继续、且对应目录下存在 `project-cloud-map.md` 时执行。对应目录指 staged 文件所在目录向上（至项目根目录）最近的、含 `project-cloud-map.md` 的目录；云图随被分析目录存放，不再固定在 `docs/`。云图更新会进入最终 staged 范围并随 commit 提交。

## 执行规则

```python
def run(commit_type: str, commit_scope: str, confirmed: bool = False) -> dict:
    changed_files = read_staged_files()
    cloud_maps = locate_cloud_maps(changed_files)  # 逐文件向上查找最近的 project-cloud-map.md，按云图文件分组
    if not cloud_maps:
        return {"status": "skipped", "reason": "云图文件不存在"}
    if not confirmed:
        return {"status": "skipped", "requires_confirmation": True, "reason": "等待 commit 确认"}
    if not changed_files:
        return {"status": "skipped", "reason": "没有 staged 文件"}

    updated_paths = []
    for map_path, files in cloud_maps.items():
        content = read_file(map_path)
        hints = extract_path_hints(content)
        matches = match_nodes(files, hints)
        updated = append_idempotent_logs(content, matches, commit_type, commit_scope)
        if updated.changed:
            write_file(map_path, updated.content)
            execute_git(f"git add -- {map_path}")
            updated_paths.append(map_path)

    return {
        "status": "passed",
        "updated_nodes": updated.nodes,
        "unmatched_files": matches["unmatched_files"],
        "staged": bool(updated_paths),
        "cloud_map_paths": updated_paths,
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
cloud_map_paths: []  # 被更新的 <对应目录>/project-cloud-map.md
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
