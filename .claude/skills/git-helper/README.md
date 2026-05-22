# Git Helper

## 概述

Git Helper 是辅助 Git 操作的技能，通过分支分析、提交规范检查、冲突分析和版本管理，帮助团队维护一致的 Git 工作流，支持 Conventional Commits 规范，生成规范化的 CHANGELOG。

## 核心能力

- **分支健康检查**: 分析分支命名、生命周期、合并状态，识别策略问题
- **提交规范验证**: 检查提交信息是否符合 Conventional Commits
- **冲突分析**: 提供 Git 冲突的分步解决指南
- **版本管理**: 自动生成基于 Tag 的 CHANGELOG

## 适用场景

- 代码审查前检查提交规范
- 分支合并前检查分支健康状态
- 发布前生成 CHANGELOG
- 解决 Git 冲突时的辅助分析

## 原子技能列表

| 原子技能 | 职责 |
|---------|------|
| branch-analysis | 分析当前分支状态，识别分支策略问题 |
| commit规范检查 | 检查提交信息是否符合 conventional commits 规范 |
| conflict-analysis | 分析Git冲突，提供解决建议 |
| version-management | 管理版本Tag，生成 changelog |

## 执行流程图

```
branch-analysis
        ↓
commit规范检查 → version-management
        ↓
conflict-analysis
```

## 输出产物

- `git-branch-report.md` - 分支分析报告
- `git-commit-report.md` - 提交规范检查报告
- `git-conflict-guide.md` - 冲突解决指南
- `CHANGELOG.md` - 变更日志

## 快速开始

```bash
# 通过 orchestrator 触发
# 用户: "检查我的提交是否符合 conventional commits"
# 用户: "分析当前分支状态"
# 用户: "帮我解决这个冲突"
# 用户: "生成这个项目的 CHANGELOG"
```