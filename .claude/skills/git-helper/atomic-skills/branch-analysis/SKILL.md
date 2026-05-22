---
name: branch-analysis
description: 分析当前分支状态，识别分支策略问题，在需要分析Git分支时触发
---

# Branch Analysis

## 概述

Branch Analysis 负责分析 Git 仓库的分支状态，包括当前分支与远程的差异、本地/远程分支列表、过期分支（已被删除但本地仍存在）、长期存在分支（stale branches）、分支命名规范检查、分支依赖关系（合并基础）等。帮助用户了解分支健康状况，识别需要清理的分支和潜在的合并问题。

## 核心能力

- **分支列表分析**: 列出所有本地分支和远程分支，按时间/最后提交排序
- **分支差异分析**: 分析当前分支与 main/master 的差异（ahead/behind）
- **过期分支检测**: 检测远程已删除但本地仍存在的分支
- **命名规范检查**: 检查分支命名是否符合团队规范（如 feature/TICKET-123）
- **长期分支检测**: 识别超过 N 天（如 30 天）未合并的长期分支
- **分支策略建议**: 根据分支模式（Git Flow/GitHub Flow）评估分支是否合理

## 输入

- **ProjectRoot**: 项目根目录（Git 仓库）
- **AnalysisScope**: 分析范围（local/remote/all）
- **BranchNamingRules**: 分支命名规范正则（如 `^(feature|fix|hotfix)\/[A-Z]+-[0-9]+$`）
- **StaleThreshold**: 过期分支阈值（默认 30 天未更新的分支视为过期）

## 输出

- **BranchAnalysisReport**: 分支分析报告
- **CurrentBranchStatus**: 当前分支状态（ahead/behind、最后提交时间）
- **StaleBranches**: 需要清理的过期分支列表
- **LongLivedBranches**: 长期存在的分支列表
- **NamingViolations**: 命名不符合规范的分支列表
- **MergeRecommendations**: 合并建议（哪些分支可以安全合并/删除）

**输出示例格式**:
```json
{
  "analysisTime": "2026-05-21T10:00:00Z",
  "repository": "vue-meeting-app",
  "currentBranch": "feature/meeting-api",
  "currentBranchStatus": {
    "ahead": 3,
    "behind": 12,
    "lastCommit": "2026-05-20T15:30:00",
    "staleDays": 2
  },
  "totalBranches": 18,
  "staleBranches": ["feature/old-feature", "fix/deprecated-bug"],
  "longLivedBranches": [
    {
      "name": "feature/meeting-api",
      "daysSinceCreation": 45,
      "unmergedCommits": 23
    }
  ],
  "namingViolations": ["my-feature", "bug-fix-123"],
  "recommendations": [
    {
      "action": "delete",
      "branch": "feature/old-feature",
      "reason": "远程已删除，本地过期超过 60 天"
    },
    {
      "action": "merge_or_close",
      "branch": "feature/meeting-api",
      "reason": "超过 30 天未合并，考虑合并或关闭"
    }
  ]
}
```

## 执行逻辑

1. **环境检查**: 确认项目是 Git 仓库，有 git CLI 可用
2. **分支列表获取**: 执行 `git branch -a` 获取所有分支
3. **当前分支分析**: 分析当前分支与远程的同步状态
4. **过期分支检测**: 检查远程分支状态，找出本地过期分支
5. **长期分支检测**: 检查未合并时间超过阈值的分支
6. **命名规范检查**: 用正则检查每个分支名是否符合规范
7. **报告生成**: 生成结构化的分支分析报告

## 依赖关系

- 依赖: 无
- 被依赖: conflict-analysis

## 完成标准

1. 所有本地和远程分支均已分析
2. 当前分支的 ahead/behind 状态准确
3. 过期分支检测无误（远程已删除但本地仍存在的）
4. 命名违规分支的违规原因清晰
5. 每个需要操作的分支有明确的 action 和 reason
6. 生成 `git-branch-report.md` 并保存