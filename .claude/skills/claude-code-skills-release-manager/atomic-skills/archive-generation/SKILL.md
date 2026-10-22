---
name: archive-generation
description: 按已确认的 Claude-Code-Skills 项目版本复制指定资源，创建版本目录并生成 ZIP 归档到 .claude/history。
---

# Archive Generation

## 职责

仅归档当前 `Claude-Code-Skills` 项目，不修改版本号和版本文档：

- 从 `.claude/skills/README.md` 读取已确认版本。
- 校验 `v.大版本号.小版本.小修改` 格式。
- 创建版本目录并复制指定资源。
- 生成同名 ZIP 并移动到 `.claude/history`。
- 校验归档内容和源文件完整性。

目标资源：

```text
.claude/rules
.claude/skills
.claude/project_context.json
.claude/settings.json
.claude/settings.local.json
VERSION.md
```

归档目录以版本目录本身作为 `.claude` 根目录：`VERSION.md` 位于版本目录根部，`.claude/skills/README.md` 位于 `skills/README.md`。

`skills/README.md` 必须存在且只保留一个副本。

## 执行规则

1. README 不存在、版本字段缺失或版本非法时停止，不猜测版本。
2. 版本目录和 ZIP 使用完整版本号，例如 `v.1.4.1/`、`v.1.4.1.zip`。
3. 复制时以版本目录作为 `.claude` 根目录，直接写入 `rules`、`skills`、`project_context.json`、`settings.json` 和 `settings.local.json`，不额外创建 `.claude` 子目录；同时将根目录 `VERSION.md` 复制到版本目录根部，且不修改源文件。
4. 目标目录、ZIP 或 `.claude/history` 缺失/已存在时，在写入前报告影响并请求确认；默认不覆盖。
5. 先创建目录并复制资源，再生成 ZIP，移动到 `.claude/history/<version>.zip` 并校验 ZIP 成功后，删除压缩前的版本目录。
6. 不执行 Git commit、Tag、push、branch 或 stash 操作；仅在 ZIP 已成功移动并通过校验后删除本次创建的临时版本目录。
7. 创建 Skill 或设计流程时，归档流程为 `not_run`，不得执行复制或压缩。

## 输出

返回 `status: passed | partial | failed | skipped`，并列出版本号、归档目录、ZIP 路径、复制清单、覆盖风险、确认状态和校验结果。
