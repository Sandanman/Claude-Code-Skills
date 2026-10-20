---
name: changelog-generation
description: 根据可读取的 Git 提交和可选 PR 信息生成或更新 CHANGELOG；当用户要求变更日志、发布说明或版本摘要时触发。
---

# Changelog Generation

## 职责

根据明确的 Git 版本范围或时间范围生成 Keep a Changelog 风格的变更记录。PR 信息仅在远程平台可访问且用户允许时读取；离线时使用本地 commit，并记录信息缺失。

## 输入

- `repository_path`：Git 仓库路径。
- `version_range`：Tag、commit 范围或时间范围；未提供时不得自行选择发布边界。
- `previous_changelog`：可选的已有 CHANGELOG，用于增量合并。
- `pr_source`：可选的 GitHub/GitLab 来源和访问方式，不接受或输出凭据值。
- `output_format`：`markdown`、`json` 或 `html`。
- `output_path`：默认 `CHANGELOG.md`；写入前确认追加、合并或覆盖。

## 执行逻辑

1. 检查 Git 仓库、范围和可用 tag。
2. 提取范围内 commit，按 Conventional Commits、显式标记或人工确认分类。
3. 检测 breaking change、重复 commit 和缺失日期/版本信息。
4. 在允许且可访问时关联 PR；失败时保留本地结果并记录影响。
5. 生成预览，检查已有文档后写入。

## 分类规则

优先使用 commit 类型和 breaking 标记；无法分类的提交放入 `Changed` 或 `Uncategorized` 并标记待确认。没有 tag 时可使用用户提供的版本名；没有版本名时生成未发布区段，不虚构版本号或日期。

## 完成标准

1. 版本边界和 commit 来源明确，范围内提交未被静默丢弃。
2. 条目分类、breaking change 和 PR 关联（如有）可追溯。
3. 输出符合所选格式，增量更新不覆盖既有历史。
4. 无 Git 数据时返回 `failed` 或 `partial`，不得生成虚构变更。

## 完成后校验

重新读取输出，检查标题、版本区段、重复条目、链接和未分类项。无法访问 PR、缺少 tag 或存在未确认提交时返回 `partial`；无仓库或写入失败返回 `failed`。
