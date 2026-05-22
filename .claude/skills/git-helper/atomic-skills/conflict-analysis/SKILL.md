---
name: conflict-analysis
description: 分析Git冲突，提供解决建议，在检测到Git冲突时触发
---

# Conflict Analysis

## 概述

Conflict Analysis 负责分析 Git 冲突文件，提供逐文件的冲突解决建议。当用户在 merge/rebase/pull 时遇到冲突，分析冲突的具体内容，区分ours/theirs的变更内容，给出保留哪边或如何合并的建议。适用于 merge conflict、rebase conflict、cherry-pick conflict 等各种冲突场景。

## 核心能力

- **冲突检测**: 自动检测是否存在未解决的 Git 冲突（`git diff --name-only --diff-filter=U`）
- **冲突内容分析**: 读取冲突文件，提取 HEAD/ours 和 incoming/theirs 的变更内容
- **冲突上下文理解**: 分析冲突代码的上下文，理解变更意图
- **解决建议生成**: 根据变更内容生成解决建议（保留 ours/ theirs/ 手动合并/ 使用新实现）
- **分步解决指南**: 生成逐步的冲突解决命令（`git add`、`git rebase --continue`）
- **冲突可视化**: 以清晰的格式展示冲突内容，便于用户决策

## 输入

- **ProjectRoot**: 项目根目录（Git 仓库）
- **ConflictFiles**: 冲突文件列表（可自动检测或手动指定）
- **ConflictContext**: 冲突类型（merge/rebase/cherry-pick）
- **BaseBranch**: 基准分支（被合并到的分支，如 main）
- **FeatureBranch**: 特性分支（合并过来的分支）

## 输出

- **ConflictAnalysisReport**: 冲突分析报告
- **ConflictFileList**: 冲突文件列表（含冲突位置）
- **PerFileAnalysis**: 每个冲突文件的详细分析和解决建议
- **ResolutionSteps**: 冲突解决步骤（命令序列）
- **ConflictVisualization**: 冲突内容可视化展示

**输出示例格式**:
```json
{
  "analysisTime": "2026-05-21T10:00:00Z",
  "conflictType": "merge",
  "baseBranch": "main",
  "featureBranch": "feature/meeting-api",
  "totalConflictFiles": 3,
  "conflictFiles": [
    {
      "file": "src/router/index.ts",
      "conflictMarkers": 2,
      "sections": [
        {
          "marker": "<<<<<<< HEAD",
          "ours": "  { path: '/meetings', component: () => import('./views/Meetings.vue') }",
          "theirs": "  { path: '/meetings', component: () => import('./views/MeetingList.vue') }",
          "suggestion": "保留 thetis - MeetingList.vue 是更新的实现",
          "suggestedResolution": "  { path: '/meetings', component: () => import('./views/MeetingList.vue') }"
        }
      ],
      "recommendedAction": "manual_review",
      "difficulty": "low"
    }
  ],
  "resolutionSteps": [
    "1. 编辑 src/router/index.ts，选择保留的版本",
    "2. 运行 git add src/router/index.ts",
    "3. 如有其他冲突文件，重复步骤 1-2",
    "4. 运行 git commit (merge) 或 git rebase --continue (rebase)",
    "5. 运行 git status 确认无剩余冲突"
  ]
}
```

## 执行逻辑

1. **冲突检测**: 执行 `git diff --name-only --diff-filter=U` 检测冲突文件
2. **冲突文件读取**: 读取每个冲突文件，提取 `<<<<<<<`、`=======`、`>>>>>>>` 之间的内容
3. **上下文分析**: 分析冲突代码的上下文（前后各3行）
4. **变更理解**: 理解 ours 和 theirs 各自的目的
5. **建议生成**: 基于变更内容生成解决建议
6. **难度评估**: 评估每个文件的冲突解决难度（low/medium/high）
7. **命令生成**: 生成解决冲突所需的 git 命令步骤
8. **报告生成**: 生成完整的冲突分析报告

## 依赖关系

- 依赖: branch-analysis
- 被依赖: 无

## 完成标准

1. 成功检测所有冲突文件（无遗漏）
2. 每个冲突文件有清晰的 ours/theirs 对比展示
3. 每个冲突文件有具体的解决建议
4. 解决步骤命令正确、可执行
5. 无冲突时输出"无冲突"确认报告
6. 生成 `git-conflict-guide.md` 并保存