---
name: git-helper
description: 辅助Git操作，包括分支管理、提交规范、冲突解决、版本Tag管理，支持conventional commits规范
---

# Git Helper

## 概述

Git Helper 是辅助 Git 操作的技能，通过4个原子技能协同工作，覆盖分支状态分析、提交规范检查、冲突分析和版本管理。帮助团队维护一致的 Git 工作流，支持 Conventional Commits 规范，生成规范化的 CHANGELOG。

## 核心能力

- 分析当前分支状态，识别分支策略问题（过长分支、命名不规范）
- 检查提交信息是否符合 Conventional Commits 规范
- 分析 Git 冲突，提供分步解决建议
- 管理版本 Tag，生成基于 Tag 的 CHANGELOG
- 提供 Git 工作流建议（Git Flow/GitHub Flow/Trunk-based）

## 执行流程

1. **branch-analysis** - 分析当前分支状态，识别分支策略问题
2. **commit规范检查** - 检查提交信息是否符合 conventional commits 规范
3. **conflict-analysis** - 分析Git冲突，提供解决建议
4. **version-management** - 管理版本Tag，生成 changelog

## 原子skill依赖关系

- **branch-analysis**: 无依赖
- **commit规范检查**: 无依赖
- **conflict-analysis**: 依赖 branch-analysis
- **version-management**: 依赖 commit规范检查

## 主skill完成标准

1. 成功分析当前分支状态，输出分支策略报告
2. 检查最近 N 条提交记录，标注不符合规范的信息
3. 如存在冲突，提供逐文件的冲突解决建议
4. 如有版本更新，生成符合规范的 CHANGELOG
5. 所有建议实用、可执行、无破坏性

## 重试规则

- 每个原子skill失败后可重试 **3次**
- conflict-analysis 在无冲突时生成"无冲突"确认报告
- version-management 在无新 Tag 时生成当前版本状态报告

## 触发关键词

- Git操作
- 分支管理
- 提交规范
- 解决冲突
- 版本Tag
- conventional commits
- Git Flow
- CHANGELOG
- Rebase
- Merge

## 注意事项

- 所有操作都是只读分析或生成建议，不自动执行破坏性操作
- 冲突解决需要用户确认后手动执行
- 非 Git 仓库中给出"不是 Git 仓库"的明确提示
- 版本号遵循 semver 规范（MAJOR.MINOR.PATCH）

## 文件系统位置

- 主skill路径: ./.claude/skills/git-helper/SKILL.md
- 原子skill路径: ./.claude/skills/git-helper/atomic-skills/下各子目录