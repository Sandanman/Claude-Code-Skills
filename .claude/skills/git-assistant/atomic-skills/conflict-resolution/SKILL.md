---
name: conflict-resolution
description: 冲突解决 — 检测冲突类型，分析 ours/theirs 变更内容，生成逐文件的解决建议和分步指南
---

# Conflict Resolution 原子 Skill

## 版本历史
- v1.0 (2026-06-02): 初始实现
- v1.1 (2026-06-03): 增强，集成 git-helper conflict-analysis 详细 ours/theirs 分析能力

## 功能
检测 Git 冲突，提取冲突文件中 HEAD（ours）和 incoming（theirs）的变更内容，提供逐文件的冲突分析、解决建议、难度评估，以及分步解决命令指南。

## 核心逻辑

```python
CONFLICT_TYPES = {
    "CONTENT": "同时修改同一行",
    "ADD_ADD": "两边都新增同一文件",
    "DELETE_MODIFY": "一方删除，一方修改",
    "SEMANTIC": "语义冲突（不同行但相关逻辑）",
}

def detect_conflicts() -> dict:
    """检测冲突文件"""
    output = execute_git("git diff --name-only --diff-filter=U").strip()
    files = [f.strip() for f in output.split("\n") if f.strip()]

    if not files:
        return {"has_conflicts": False, "files": [], "message": "✅ 当前无冲突"}

    conflict_files = []
    for f in files:
        content = read_file(f)
        analysis = analyze_conflict_file(f, content)
        conflict_files.append(analysis)

    total_conflicts = sum(len(cf["sections"]) for cf in conflict_files)

    return {
        "has_conflicts": True,
        "files": conflict_files,
        "totalConflictFiles": len(conflict_files),
        "totalConflictSections": total_conflicts,
        "overallDifficulty": evaluate_overall_difficulty(conflict_files),
        "resolutionSteps": generate_resolution_steps(len(conflict_files)),
    }

def analyze_conflict_file(filepath: str, content: str) -> dict:
    """详细分析单个冲突文件"""
    sections = extract_conflict_sections(content)

    file_analysis = {
        "file": filepath,
        "conflictMarkers": content.count("<<<<<<"),
        "sections": sections,
        "totalSections": len(sections),
        "difficulty": evaluate_file_difficulty(sections),
        "recommendedAction": determine_recommended_action(sections),
        "resolutionCommands": generate_file_commands(filepath),
    }

    # 分析每个冲突段的 ours/theirs 变更
    for section in sections:
        section["oursContext"] = get_conflict_context(content, section["startLine"], "ours")
        section["theirsContext"] = get_conflict_context(content, section["startLine"], "theirs")
        section["suggestion"] = suggest_resolution(section)

    return file_analysis

def extract_conflict_sections(content: str) -> list:
    """提取所有冲突段"""
    sections = []
    lines = content.split("\n")
    i = 0
    section_idx = 0

    while i < len(lines):
        if lines[i].startswith("<<<<<<"):
            section_idx += 1
            start_line = i + 1
            ours_lines = []
            theirs_lines = []
            i += 1

            # 提取 HEAD（ours）内容
            while i < len(lines) and not lines[i].startswith("======="):
                ours_lines.append(lines[i])
                i += 1

            i += 1  # 跳过 =======

            # 提取 incoming（theirs）内容
            while i < len(lines) and not lines[i].startswith(">>>>>>"):
                theirs_lines.append(lines[i])
                i += 1

            i += 1  # 跳过 >>>>>>

            sections.append({
                "index": section_idx,
                "startLine": start_line,
                "ours": "\n".join(ours_lines),
                "theirs": "\n".join(theirs_lines),
                "oursLines": len(ours_lines),
                "theirsLines": len(theirs_lines),
            })
        else:
            i += 1

    return sections

def suggest_resolution(section: dict) -> dict:
    """智能建议冲突解决方式"""
    ours = section["ours"]
    theirs = section["theirs"]

    # 判断建议
    if len(ours) == 0 and len(theirs) > 0:
        return {"action": "accept_theirs", "reason": "ours 为空，保留 theirs"}
    if len(theirs) == 0 and len(ours) > 0:
        return {"action": "accept_ours", "reason": "theirs 为空，保留 ours"}
    if ours == theirs:
        return {"action": "accept_either", "reason": "ours 和 theirs 内容相同"}
    if len(ours) <= 3 and len(theirs) <= 3 and ours.strip() == theirs.strip():
        return {"action": "accept_either", "reason": "内容实质相同"}

    # 尝试合并
    return {
        "action": "manual_merge",
        "reason": "需要人工判断，两边均有实质性修改",
        "hint": f"ours 变更 {section['oursLines']} 行，theirs 变更 {section['theirsLines']} 行"
    }

def evaluate_file_difficulty(sections: list) -> str:
    """评估文件冲突解决难度"""
    if not sections:
        return "none"
    total_lines = sum(len(s["ours"].split("\n")) + len(s["theirs"].split("\n")) for s in sections)
    if total_lines <= 10 and len(sections) <= 2:
        return "low"
    elif total_lines <= 50 and len(sections) <= 10:
        return "medium"
    else:
        return "high"

def evaluate_overall_difficulty(files: list) -> str:
    difficulties = {"low": 0, "medium": 0, "high": 0}
    for f in files:
        d = f.get("difficulty", "low")
        difficulties[d] = difficulties.get(d, 0) + 1

    if difficulties["high"] > 0:
        return "high"
    elif difficulties["medium"] > 0:
        return "medium"
    return "low"

def determine_recommended_action(sections: list) -> str:
    """确定推荐操作"""
    simple_accepts = sum(1 for s in sections if s.get("suggestion", {}).get("action") in ["accept_ours", "accept_theirs", "accept_either"])
    if simple_accepts == len(sections):
        return "auto_resolve"
    elif simple_accepts > len(sections) / 2:
        return "mostly_auto"
    return "manual_review"

def generate_resolution_steps(file_count: int) -> list:
    """生成分步解决指南"""
    steps = []
    steps.append({
        "step": 1,
        "action": "分析",
        "command": "git status",
        "description": "确认所有冲突文件",
    })
    steps.append({
        "step": 2,
        "action": "逐个解决",
        "command": "code <冲突文件>",
        "description": "打开冲突文件，选择保留的版本",
    })
    steps.append({
        "step": 3,
        "action": "标记已解决",
        "command": "git add <冲突文件>",
        "description": "解决一个文件后标记",
    })
    steps.append({
        "step": 4,
        "action": "完成",
        "command": "git commit  # merge 场景",
        "description": "所有文件解决后提交（merge）或继续 rebase",
    })
    steps.append({
        "step": 5,
        "action": "验证",
        "command": "git status",
        "description": "确认无剩余冲突",
    })
    return steps

def generate_file_commands(filepath: str) -> list:
    return [
        f"# 保留当前分支（ours）版本",
        f"git checkout --ours {filepath}",
        f"# 或保留目标分支（theirs）版本",
        f"git checkout --theirs {filepath}",
        f"# 标记已解决",
        f"git add {filepath}",
    ]
```

## 输出

```json
{
  "has_conflicts": true,
  "totalConflictFiles": 2,
  "totalConflictSections": 4,
  "overallDifficulty": "medium",
  "files": [
    {
      "file": "src/router/index.ts",
      "conflictMarkers": 2,
      "sections": [
        {
          "index": 1,
          "startLine": 15,
          "ours": "  { path: '/meetings', component: () => import('./views/Meetings.vue') }",
          "theirs": "  { path: '/meetings', component: () => import('./views/MeetingList.vue') }",
          "oursLines": 1,
          "theirsLines": 1,
          "suggestion": {
            "action": "manual_merge",
            "reason": "两边均有修改，需人工判断",
            "hint": "建议保留 MeetingList.vue（更新的实现）"
          },
          "difficulty": "low"
        }
      ],
      "difficulty": "low",
      "recommendedAction": "manual_review",
      "resolutionCommands": ["git checkout --ours src/router/index.ts", "git add src/router/index.ts"]
    }
  ],
  "resolutionSteps": [
    {"step": 1, "action": "分析", "command": "git status", "description": "确认所有冲突文件"},
    {"step": 2, "action": "逐个解决", "command": "code <冲突文件>", "description": "打开冲突文件，选择保留的版本"},
    {"step": 3, "action": "标记已解决", "command": "git add <冲突文件>", "description": "解决一个文件后标记"},
    {"step": 4, "action": "完成", "command": "git commit", "description": "所有文件解决后提交"},
    {"step": 5, "action": "验证", "command": "git status", "description": "确认无剩余冲突"}
  ],
  "requires_manual": true,
  "report": "## 冲突解决指南\n..."
}
```

## τ 估算
1500（冲突检测 + 详细分析 + 分步指南）

## 完成标准

1. 成功检测所有冲突文件（无遗漏）
2. 每个冲突文件有清晰的 ours/theirs 对比展示
3. 每个冲突文件有具体的解决建议
4. 解决步骤命令正确、可执行
5. 无冲突时输出"无冲突"确认报告
6. 生成 `git-conflict-guide.md` 并保存