---
name: conflict-resolution
description: 冲突解决 — 检测冲突类型，分析 ours/theirs 内容并生成按操作场景区分的解决指南
---

# Conflict Resolution 原子 Skill

## 职责

只读检测当前未合并文件，解析标准冲突标记，比较 ours/theirs 并生成解决建议。默认不修改文件；`checkout --ours/--theirs`、`git add` 和继续或中止操作必须由用户明确确认。

## 核心逻辑

```python
CONFLICT_MARKERS = {
    "start": "<<<<<<<",
    "separator": "=======",
    "end": ">>>>>>>",
}

def analyze_conflict_file(filepath: str, content: str) -> dict:
    sections, issues = extract_conflict_sections(content)
    for section in sections:
        section["suggestion"] = suggest_resolution(section)
    return {
        "file": filepath,
        "conflictMarkers": content.count("<<<<<<<"),
        "sections": sections,
        "totalSections": len(sections),
        "difficulty": evaluate_file_difficulty(sections),
        "recommendedAction": determine_recommended_action(sections),
        "issues": issues,
        "resolutionCommands": generate_file_commands(filepath),
    }

def extract_conflict_sections(content: str) -> tuple:
    sections, issues = [], []
    lines = content.splitlines()
    index = 0
    while index < len(lines):
        if not lines[index].startswith("<<<<<<<"):
            index += 1
            continue
        start_line = index + 1
        ours = []
        index += 1
        while index < len(lines) and not lines[index].startswith("======="):
            if lines[index].startswith("<<<<<<<"):
                issues.append("发现嵌套冲突标记")
            ours.append(lines[index])
            index += 1
        if index >= len(lines):
            issues.append(f"第 {start_line} 行缺少 ======= 分隔符")
            break
        index += 1
        theirs = []
        while index < len(lines) and not lines[index].startswith(">>>>>>>"):
            theirs.append(lines[index])
            index += 1
        if index >= len(lines):
            issues.append(f"第 {start_line} 行缺少 >>>>>>> 结束标记")
            break
        index += 1
        sections.append({
            "index": len(sections) + 1,
            "startLine": start_line,
            "ours": "\n".join(ours),
            "theirs": "\n".join(theirs),
            "oursLines": len(ours),
            "theirsLines": len(theirs),
        })
    return sections, issues
```

先为每个 section 生成 `suggestion`，再计算文件和总体推荐动作，避免在建议生成前读取空字段。冲突上下文必须说明当前 Git 操作是 merge、rebase、cherry-pick 或 revert；若无法识别，标记为未知，不将 `git commit` 作为唯一完成命令。

## 输入

```yaml
target_files: string[] | null
operation: merge | rebase | cherry-pick | revert | unknown
confirmed: boolean
```

## 输出

```yaml
status: passed | partial | failed | skipped
has_conflicts: boolean
files: []
resolution_steps: []
requires_confirmation: boolean
issues: []
```

## 完成标准

1. 所有 `git diff --name-only --diff-filter=U` 文件均已扫描。
2. 每个标准冲突段均包含 ours、theirs、行号和建议。
3. 缺失或损坏的标记被记录为问题，不静默跳过。
4. 解决步骤按当前操作场景输出：merge 使用 commit，rebase 使用 `git rebase --continue`，cherry-pick 使用 `git cherry-pick --continue`。
5. checkout、add、continue 和 abort 等改变仓库状态的操作在执行前确认。
6. 不承诺生成未实际写入的报告文件；结果直接返回结构化指南。
