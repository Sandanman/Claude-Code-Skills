---
name: version-management
description: 管理版本Tag，生成 changelog，在需要版本管理时触发
---

# Version Management

## 概述

Version Management 负责管理 Git 版本标签，包括列出已有 Tag、创建新 Tag（附注/轻量）、删除 Tag、推送 Tag 到远程，以及基于 Tag 范围生成 CHANGELOG。遵循 Semantic Versioning (semver) 规范，支持预发布版本（alpha/beta/rc）命名规范。

## 核心能力

- **Tag 列表查询**: 列出所有 Tag，按时间或版本号排序
- **Tag 创建**: 创建附注 Tag（annotated）或轻量 Tag（lightweight）
- **Tag 推送**: 推送 Tag 到远程（单个/所有）
- **版本号建议**: 基于提交内容建议下一个版本号（MAJOR.MINOR.PATCH）
- **CHANGELOG 生成**: 基于两个 Tag 之间的提交生成 CHANGELOG
- **Tag 清理**: 删除本地和远程 Tag（带确认提示）
- **版本预测**: 根据当前提交预估下一个版本号和发布日期

## 输入

- **ProjectRoot**: 项目根目录（Git 仓库）
- **Action**: 操作类型（list/create/push/delete/changelog）
- **VersionNumber**: 新版本号（如 2.1.0，遵循 semver）
- **TagRange**: 用于 CHANGELOG 的 Tag 范围（from Tag → to Tag）
- **TagMessage**: Tag 附注信息（默认为版本号）
- **RemoteName**: 远程仓库名（默认为 origin）

## 输出

- **TagList**: 当前所有 Tag 的列表（含日期、提交SHA、说明）
- **VersionSuggestion**: 下一个版本号建议（附依据）
- **ChangelogContent**: 生成的 CHANGELOG 内容
- **TagCreationResult**: Tag 创建结果（创建的 Tag 信息）
- **OperationSummary**: 操作执行摘要

**输出示例格式**:
```json
{
  "operationTime": "2026-05-21T10:00:00Z",
  "action": "create_and_push",
  "project": "{{PROJECT_NAME}}",
  "latestTag": "2.0.0",
  "versionSuggestion": {
    "patch": "2.0.1",
    "reason": "自 2.0.0 以来有 3 个 fix 提交"
  },
  "tagCreated": {
    "name": "v1.2.1",
    "type": "annotated",
    "message": "Release 2.0.1 - 修复 3 个 bug\n\nDate: 2026-05-21",
    "sha": "a1b2c3d4e5f6"
  },
  "changelog": {
    "from": "v1.2.0",
    "to": "v1.2.1",
    "sections": {
      "Fixed": [
        "修复大型会议列表滚动性能问题 (#45)",
        "修复时区显示错误 (#43)"
      ],
      "Changed": [
        "升级 Vue to 3.4.0"
      ]
    }
  },
  "remotePushed": true
}
```

## 执行逻辑

1. **当前 Tag 列表**: 执行 `git tag -l --sort=-version:refname` 获取所有 Tag
2. **版本建议计算**: 分析自上一个 Tag 以来的提交，统计 feat/fix/docs 数量
3. **新版本确认**: 如创建 Tag，验证版本号格式（semver）
4. **Tag 创建**: 执行 `git tag -a v{version} -m "message"` 创建附注 Tag
5. **远程推送**: 执行 `git push origin v{version}` 推送到远程
6. **CHANGELOG 生成**: 基于 `git log v{prev}..v{current} --pretty=format` 生成变更日志
7. **报告输出**: 输出操作结果和建议

## 依赖关系

- 依赖: commit规范检查
- 被依赖: 无

## 完成标准

1. 成功列出所有 Tag，按版本号降序排列
2. 创建 Tag 时版本号符合 semver 规范
3. 生成的 CHANGELOG 按 Added/Fixed/Changed 分类
4. 版本建议有明确依据（基于提交类型统计）
5. 如操作涉及远程，同步执行推送操作
6. 生成 `git-version-report.md` 并保存