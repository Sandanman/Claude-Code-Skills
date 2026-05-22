---
name: commit规范检查
description: 检查提交信息是否符合 conventional commits 规范，在需要审查提交规范时触发
---

# Commit 规范检查

## 概述

Commit 规范检查（commit specification check）负责检查 Git 提交信息是否符合 Conventional Commits 规范（`type(scope): description` 格式）。分析最近 N 条提交记录，识别不符合规范的提交，统计各类提交的占比，并提供改进建议。对于不符合规范的提交，给出具体的修正示例。

## 核心能力

- **规范验证**: 检查提交信息是否符合 `type(scope): description` 格式
- **类型统计**: 统计 feat/fix/docs/style/refactor/test/chore 等类型分布
- **Scope 提取**: 提取提交中的 scope（影响范围）
- **描述质量分析**: 检查描述是否清晰、是否以动词开头、是否过长
- **Breaking Change 检测**: 识别 `BREAKING CHANGE:` 标记
- **修正建议**: 对不符合规范的提交给出修正示例

## 输入

- **ProjectRoot**: 项目根目录（Git 仓库）
- **CommitRange**: 检查的提交范围（最近 N 条 / 指定范围 / 未合并到 main 的）
- **StrictMode**: 严格模式（是否要求 scope 存在）
- **AllowedTypes**: 允许的提交类型列表（默认Conventional Commits标准类型）

## 输出

- **CommitCheckReport**: 提交规范检查报告
- **CompliantCommits**: 符合规范的提交列表
- **NonCompliantCommits**: 不符合规范的提交列表（含问题描述和修正建议）
- **TypeDistribution**: 提交类型分布统计
- **ComplianceRate**: 规范合规率（百分比）
- **OverallScore**: 提交规范评分（0-100）

**输出示例格式**:
```json
{
  "checkTime": "2026-05-21T10:00:00Z",
  "totalChecked": 20,
  "compliant": 17,
  "nonCompliant": 3,
  "complianceRate": "85%",
  "overallScore": 82,
  "typeDistribution": {
    "feat": 8,
    "fix": 5,
    "docs": 3,
    "refactor": 2,
    "chore": 2
  },
  "nonCompliantCommits": [
    {
      "hash": "a1b2c3d",
      "message": "updated the login page",
      "issue": "使用小写字母开头，缺少 type 前缀",
      "suggestedFix": "feat(auth): update login page UI",
      "severity": "high"
    },
    {
      "hash": "e4f5g6h",
      "message": "Fixed bug",
      "issue": "描述过于简略，未说明修复了什么 bug",
      "suggestedFix": "fix(auth): resolve token refresh race condition",
      "severity": "high"
    }
  ]
}
```

## 执行逻辑

1. **Git Log 获取**: 执行 `git log` 获取指定范围的提交记录
2. **正则验证**: 使用 Conventional Commits 正则验证每条提交信息
3. **类型提取**: 从提交信息中提取 type 和 scope
4. **质量分析**: 检查描述长度、是否以动词开头、是否有 body
5. **Breaking Change 检测**: 检查是否存在 BREAKING CHANGE 标记
6. **统计计算**: 计算合规率、类型分布、总体评分
7. **修正建议**: 对不合规提交生成修正示例
8. **报告生成**: 生成结构化的检查报告

## 依赖关系

- 依赖: 无
- 被依赖: version-management

## 完成标准

1. 检查指定范围内的所有提交（无遗漏）
2. 每个不合规提交有明确的问题描述和修正建议
3. 类型分布统计准确
4. 合规率计算正确（保留两位小数）
5. 生成 `git-commit-report.md` 并保存