---
name: code-style-generator
description: 自动检测项目代码规范，生成个人代码习惯文档 CODE_STYLE.md，支持 TypeScript、Vue3 和 React 检测。
reasoner_instructions: |
  根据用户目标选择代码规范检测、规则确认和文档生成阶段。
  完整流程：detect-and-scan → generate-and-confirm → generate-style-document。
  下游阶段必须使用已确认的上游产物；缺少必需产物时暂停并记录阻塞项。
---

# Code Style Generator 主 Skill

## 概述

`code-style-generator` 读取项目配置和源代码，推断可复用的代码规范，经用户确认后生成项目根目录下的 `CODE_STYLE.md`。默认只读取项目文件和写入最终文档，不修改源代码。

## 核心能力

- 检测 `.editorconfig`、Prettier、ESLint、TypeScript 等配置
- 扫描 JavaScript、TypeScript、Vue 和 React 代码并推断规范
- 生成包含边界场景的探测代码
- 通过用户确认和补充问题确定无法自动推断的规则
- 按规则来源合并并生成标准化 `CODE_STYLE.md`

## 原子 Skill

| 原子 Skill | 目录 | 依赖 | 输出 |
| --- | --- | --- | --- |
| `detect-and-scan` | `atomic-skills/detect-config-rules/` | 无 | `detection_result` |
| `generate-and-confirm` | `atomic-skills/generate-probe-code/` | `detection_result` | `confirmation_result` |
| `generate-style-document` | `atomic-skills/generate-style-document/` | `confirmation_result` | `document_result` |

以下目录仅作为兼容存根，不得作为独立执行阶段：

- `atomic-skills/scan-code-patterns/`
- `atomic-skills/confirm-and-supplement/`

## 执行模式

### 完整生成流程

```text
detect-and-scan
  → generate-and-confirm
  → generate-style-document
```

### 部分分析流程

用户只要求检查配置或代码规范时，可执行：

```text
detect-and-scan
```

已有可信的 `detection_result` 时，可以从 `generate-and-confirm` 开始；已有可信的 `confirmation_result` 时，可以从 `generate-style-document` 开始。复用产物必须确认来源、时间、目标范围和完整性。

## 共享上下文

各阶段应将结构化结果写入 `.claude/skills/tasks/current/task_skill.md`，使用以下字段：

```yaml
detection_result:
  configRules: {}
  inferredRules: {}
  frameworkDetected: ""
  scannedFiles: []
  confidence: {}

confirmation_result:
  confirmedRules: {}
  ruleSources: {}
  userModifications: []
  userAnswers: []
  probeCode: {}

document_result:
  filePath: ""
  ruleStats: {}
  quality: {}
```

共享上下文缺失或字段不完整时，不得猜测上游结果；应重新执行缺失阶段或报告阻塞项。

## 输入契约

```yaml
required:
  project_root: 项目根目录
optional:
  target_paths: 扫描范围，默认使用项目约定的源码目录
  existing_context: 可复用的可信阶段产物
  output_path: CODE_STYLE.md 输出路径，默认位于项目根目录
```

## 输出契约

```yaml
status: passed | partial | failed
files:
  - path: CODE_STYLE.md
    action: created | updated | skipped
results:
  detection_result: {}
  confirmation_result: {}
  document_result: {}
issues: []
```

## 重试与错误处理

- 每个原子 Skill 失败后最多重试 3 次，并记录失败命令、阶段和原因。
- 配置文件不存在时继续扫描代码，并将缺失配置项标记为 `null`。
- 无法确定框架或规范来源时，标记为 `unknown` 或 `default`，不得伪造检测结果。
- 用户未确认规则时暂停文档生成，除非用户明确允许使用默认值。
- `CODE_STYLE.md` 已存在时，先询问覆盖、合并或另存；未经确认不得覆盖。

## 完成标准与完成后校验

任务只有同时满足以下条件才可标记为 `passed`：

1. 配置文件和代码扫描已完成，或明确记录降级原因。
2. 检测范围、框架判断和规则来源已记录。
3. 探测代码已生成，用户确认或默认规则使用原因已记录。
4. 规则优先级已按 `user > config > inferred > default` 应用。
5. `CODE_STYLE.md` 已成功写入目标路径。
6. 输出文档是有效 Markdown，代码示例与最终规则一致。
7. 规则统计、质量问题和未解决项均有真实依据。

完成后必须检查：

- `document_result.filePath` 指向实际存在的文件；
- 文档包含必要章节和规则来源；
- 没有把示例日期、评分或统计数值当作真实结果；
- 失败、跳过和未实测项已明确标记；
- 实际写入范围未超出用户指定范围。

校验失败时状态为 `partial` 或 `failed`，不得仅凭生成调用成功判定完成。

## 输出文件

默认生成：

```text
<project_root>/CODE_STYLE.md
```

## 文件系统位置

- 主 Skill：`.claude/skills/code-style-generator/SKILL.md`
- 有效原子 Skill：`.claude/skills/code-style-generator/atomic-skills/`
- 兼容存根：`scan-code-patterns`、`confirm-and-supplement`
- 共享上下文：`.claude/skills/tasks/current/task_skill.md`

## 触发关键词

生成我的代码习惯文档、创建代码风格规范、生成 `CODE_STYLE.md`、检测项目代码规范。

## 版本

- 主 Skill 名称：`code-style-generator`
- 状态：启用
