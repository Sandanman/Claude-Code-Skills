---
name: changelog-generation
description: 生成变更日志（基于git commit和PR），在需要生成或更新CHANGELOG时触发
---

# Changelog Generation

## 概述

Changelog Generation 负责从 Git 提交记录和 Pull Requests 中自动生成规范化的变更日志。遵循 [Keep a Changelog](https://keepachangelog.com/) 规范，按 Added/Changed/Deprecated/Removed/Fixed/Security 分组，生成人类可读和机器可解析的变更日志。适用于版本发布前的变更总结和历史变更记录。

## 核心能力

- **Git Log 解析**: 读取 git log，按时间范围或版本Tag提取提交记录
- **PR 信息关联**: 关联 GitHub/GitLab PR 信息（标题、作者、标签）
- **类型分类**: 根据 commit message 前缀或 PR 标签分类变更类型
- **版本检测**: 自动检测版本号（semver）和版本间的变更范围
- **贡献者统计**: 统计每个版本的贡献者列表
- **多格式输出**: 支持 Markdown、JSON、HTML 格式

## 输入

- **VersionRange**: 版本范围（从哪个Tag到哪个Tag，或指定时间范围）
- **PreviousChangelog**: 已有 CHANGELOG 内容（用于增量更新）
- **ProjectConfig**: 项目配置（仓库 URL、PR 平台、版本策略）
- **OutputFormat**: 输出格式（markdown/json/html，默认 markdown）

## 输出

- **ChangelogContent**: 变更日志完整内容
- **VersionSummary**: 每个版本的变更摘要
- **ContributorsList**: 贡献者列表
- **BreakingChanges**: Breaking Changes 清单（需要特别标注）

**输出示例格式**:
```markdown
# Changelog

## [2.1.0] - 2026-05-21

### Added
- 支持 WebSocket 实时会议通知 (#23)
- 新增会议预约重复功能 (#25)
- 集成 Google Calendar 同步 API (#18)

### Fixed
- 修复了大型会议列表滚动卡顿问题 (#27)
- 修复了时区显示错误 (#22)

### Changed
- 升级 Element Plus 至 2.5.0（性能提升）
- API 请求超时时间从 5s 调整至 10s

## [2.0.0] - 2026-04-01

### Added
- 全新 UI 设计系统
- 基于 Pinia 的状态管理重构

### Breaking Changes
- 移除 `Meeting.oldAPI()` 方法，请使用 `Meeting.newAPI()`
```

## 执行逻辑

1. **Git 环境检查**: 确认项目是 Git 仓库，有 git CLI 可用
2. **Tag 解析**: 获取所有版本 Tag，按时间排序
3. **Commit 提取**: 对每个版本提取该版本以来的所有 commit
4. **PR 关联**: 尝试通过 commit message 中的 PR 编号关联 PR 信息
5. **类型分类**: 根据 commit 前缀（feat:/fix:/docs:）或 PR 标签分类
6. **Breaking Change 检测**: 识别 `BREAKING CHANGE:` 标记
7. **版本汇总**: 生成每个版本的变更摘要
8. **文档生成**: 按 Keep a Changelog 格式生成文档

## 依赖关系

- 依赖: 无
- 被依赖: 无

## 完成标准

1. 每个版本都有明确的日期和版本号
2. 变更按 Added/Changed/Fixed/Removed 分类，无遗漏
3. Breaking Changes 有明确的标记和迁移说明
4. 贡献者列表包含所有提交者（去重）
5. 生成符合 Keep a Changelog 规范的 CHANGELOG.md
6. 如为已有 CHANGELOG 的增量更新，不覆盖历史内容