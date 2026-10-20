---
name: doc-generator
description: 根据用户指定范围生成或转换项目文档，包括 API 文档、组件文档、CHANGELOG 和格式转换；当用户要求生成文档、更新 README、组件文档、API 文档、变更日志或转换文档格式时使用，并按意图选择最小必要原子 Skill。
---

# Doc Generator

## 概述

Doc Generator 将已确认的源码、Git 历史或文档输入转换为可审阅的项目文档。它不默认扫描或生成所有文档，也不保证静态分析能发现动态注册、运行时路由或缺失类型；无法确认的内容必须标记为待人工确认。

## 核心能力

- 提取可静态识别的 API 路由、请求/响应类型和认证线索
- 生成 Vue/React 组件的属性、事件、插槽或暴露方法文档
- 根据 Git 提交和可获取的 PR 信息生成 CHANGELOG
- 在已生成或用户提供的文档之间进行格式转换、合并和目录生成

## 按需编排

根据用户目标选择最小 Skill 集合：

| 用户目标 | 执行 Skill | 依赖 |
| --- | --- | --- |
| API 文档 | `api-doc-extraction` | 无 |
| 组件文档 | `component-doc-generation` | 无 |
| CHANGELOG | `changelog-generation` | 无；需 Git 仓库 |
| 转换已有文档 | `doc-format-conversion` | 无 |
| 生成 API/组件文档并转换 | 对应生成 Skill → `doc-format-conversion` | 转换依赖生成结果 |
| 全面文档 | API、组件、CHANGELOG 可并行；转换在选定输入完成后执行 | 按实际输入决定 |

未被用户目标选中的原子 Skill 不执行。README、注释补充、Swagger UI 等仅在输入或选定原子 Skill 明确支持时处理，不将能力声明当作已完成产物。

## 输入契约

- `target_path`：源码、Git 仓库或文档路径，必须由任务上下文确认。
- `document_scope`：`api`、`component`、`changelog`、`conversion` 或组合值。
- `source_paths`：可选的具体文件或目录；未提供时只使用已确认的项目范围。
- `output_path`：输出文件或目录；未提供时使用对应原子 Skill 的默认路径。
- `format_options`：可选的输出格式、版本范围、主题或目录配置。
- `write_files`：是否写入文件；写入前必须展示目标路径和覆盖行为。

不得读取或输出未授权的敏感值；生成前发现输出文件已存在时，必须选择预览后覆盖、追加、合并或跳过。

## 输出契约

- 文档文件：Markdown、HTML、PDF、JSON 或原子 Skill 声明的其他格式。
- 结构化结果：发现范围、成功项、跳过项、无法静态确认项和输出路径。
- 每个结论注明证据来源；不把“未发现”表述为“必然不存在”。
- 返回状态：`passed`、`partial`、`failed` 或 `cancelled`。

## 完成标准

仅对本次实际选择的原子 Skill 评估：

1. 输入范围与用户目标一致，未选中的能力未被宣称执行。
2. 生成文件存在、非空、路径与预览一致，且未未经确认覆盖已有文件。
3. 文档结构符合所选格式；无法静态解析或缺少工具的部分已记录。
4. API、组件、版本范围和变更分类等核心结论均可追溯到输入证据。
5. 转换任务保留可识别的标题、正文、代码块和链接结构；格式限制已说明。

## 完成后校验

1. 重新读取输出文件，确认非空且格式可解析。
2. 检查报告中的输出路径、执行范围、跳过项与实际结果一致。
3. 检查 Markdown 标题、链接和代码围栏；OpenAPI 输出按可用工具进行结构校验。
4. CHANGELOG 检查版本边界、重复条目和未分类提交；无 Git 数据时不得伪造变更。
5. 若存在低置信度、工具缺失、部分失败或人工确认项，返回 `partial`，不得返回 `passed`。

## 错误与状态

- `passed`：所选流程、写入和校验均成功。
- `partial`：部分内容无法静态确认、工具缺失、输入不完整或仅完成部分目标，但产物可用。
- `failed`：目标不可读、核心生成失败、输出写入失败或校验失败。
- `cancelled`：用户取消生成、转换或覆盖操作，不覆盖已有文件。

每个原子 Skill 最多重试 3 次；重试不得通过减少核心范围掩盖失败。Git 仓库不存在时，CHANGELOG 流程应暂停或返回 `partial`，不得生成虚构历史。

## 触发关键词

生成文档、API 文档、README、组件文档、变更日志、CHANGELOG、文档转换、JSDoc、TSDoc、OpenAPI。

## 文件系统位置

- 主 Skill：`./.claude/skills/doc-generator/SKILL.md`
- 原子 Skill：`./.claude/skills/doc-generator/atomic-skills/`
- 默认 API 输出：`docs/api.md` 或 `docs/openapi.json`
- 默认组件输出：`docs/components/`
- 默认变更日志：`CHANGELOG.md`
