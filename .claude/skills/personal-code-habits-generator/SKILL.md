---
name: personal-code-habits-generator
description: 从人的角度主动询问并整理个人代码习惯，生成或更新 CODE_STYLE_PERSONAL.md。当用户提到“生成我的代码习惯”“生成个人代码规范”“我习惯怎么写代码”“记录我的开发习惯”“我的编码偏好”或希望通过对话整理个人编码偏好时触发。与 code-style-generator 的代码扫描方式不同，本 Skill 以用户确认的回答为唯一规则来源。
reasoner_instructions: |
  执行完整流程骨架：initialize → interview → generate-document → review。
  全程使用中文，保持自然、友好的技术对话。
  interview 阶段按批次提问，每批不超过 5 个问题；可以跳过不适用的问题，但不能跳过文档生成、用户确认和完成校验。
  不根据代码、配置或常识推断用户习惯；未回答的项目标记为未确认。
---

# Personal Code Habits Generator

## 概述

通过分批对话收集用户明确确认的个人代码习惯，生成标准化的 `CODE_STYLE_PERSONAL.md`。适用于新项目、没有可扫描代码的环境，或用户希望系统整理个人偏好的场景。

与 `code-style-generator` 的区别：

- `personal-code-habits-generator`：通过用户访谈收集个人偏好；
- `code-style-generator`：从项目配置和现有代码中检测规范。

本 Skill 不使用代码扫描结果替代用户回答。若用户同时提供了已有规范，只能将其作为待确认材料，不能默认视为个人偏好。

## 核心能力

- 以中文进行自然对话；
- 按批次收集格式化、命名、语言框架和工程实践偏好；
- 允许用户跳过不适用的问题；
- 生成结构化且可读的 `CODE_STYLE_PERSONAL.md`；
- 在写入后展示摘要并接受用户修改；
- 对生成文件执行存在性、非空和结构完整性校验。

## 执行流程

```text
initialize
  ↓
interview
  ├─ ask-formatting
  ├─ ask-naming
  ├─ ask-language-and-framework（按用户背景选择）
  └─ ask-engineering
  ↓
generate-document
  ↓
review
  ├─ 展示关键规则摘要
  ├─ 接收用户确认或修改
  └─ 更新并重新校验（如有修改）
```

流程阶段不能被整体跳过；问题级别可以根据用户背景和用户明确要求裁剪。至少完成一个有效访谈批次后才能生成文档。

## 输入契约

```yaml
user_input: string
options:
  scope: full | formatting | naming | language | engineering
  target_path: string | null
  existing_document_action: overwrite | merge | new_file | cancel | null
  answers: object | null
  confirm: boolean | null
```

约束：

- `scope` 默认为 `full`；
- `target_path` 默认为项目根目录下的 `CODE_STYLE_PERSONAL.md`；
- `answers` 只能包含用户明确提供或确认的内容；
- 若目标文件已存在且未提供处理选择，必须先询问用户；
- 用户取消时不得写入或覆盖文件。

## 访谈规则

### 第一批：基础格式化

每批最多 5 个问题：

1. 缩进使用几个空格或 Tab？
2. 字符串使用单引号还是双引号？
3. 是否使用分号？
4. 单行长度是否有上限？
5. 大括号采用哪种风格？

### 第二批：命名规范

1. 变量如何命名？
2. 常量如何命名？
3. 文件如何命名？
4. 组件如何命名？
5. 目录如何命名？

### 第三批：语言与框架

仅询问用户涉及的技术栈：

- TypeScript：`strict`、`interface` 与 `type`、`any`、可选字段、枚举；
- Vue 3：Composition API、`script setup`、`ref`/`reactive`、Props 类型定义；
- React：Hooks、Hook 命名、状态管理、组件文件扩展名、样式方案。

### 第四批：工程实践

根据用户是否愿意继续提问：

- async/await 的错误处理；
- 测试框架、覆盖率和测试范围；
- JSDoc、行内注释和 README；
- Git 分支和 commit 信息习惯；
- 用户希望补充的其他规则。

对用户跳过的问题写入 `unconfirmed` 或从结果中省略，并在问题列表中记录，不追问同一问题。

## 共享上下文

如项目任务使用 `.claude/skills/tasks/current/task_skill.md`，在每个访谈批次完成后更新以下信息：

```yaml
personal_habits:
  scope: full | formatting | naming | language | engineering
  completed_batches: []
  answers: {}
  skipped_questions: []
  unconfirmed_fields: []
  output_path: null
  status: interviewing | awaiting_confirmation | passed | partial | cancelled | failed
```

共享上下文只保存当前任务需要的用户回答和状态，不保存未确认的推断内容。

## 文档输出结构

目标文件必须是有效 Markdown，推荐结构如下：

~~~markdown
# 个人代码习惯

> 来源：个人访谈
> 生成时间：<ISO 8601 时间>

## 结构化规则

```json
{
  "version": "1.3",
  "generated_at": "<ISO 8601 时间>",
  "source": "personal-interview",
  "habits": {},
  "additional_notes": "",
  "quality": {
    "overall_score": null,
    "completeness_score": null,
    "consistency_score": null,
    "feasibility_score": null,
    "issues": [],
    "recommendations": []
  }
}
```

## 可读摘要

<!-- 只展示用户已确认的规则；未确认项明确标记。 -->
~~~

`habits` 可包含以下类别：

~~~json
{
  "formatting": {},
  "naming": {},
  "typescript": {},
  "vue3": {},
  "react": {},
  "errorHandling": {},
  "testing": {},
  "documentation": {},
  "git": {}
}
~~~

只写入与用户回答相关的字段。没有回答的字段不得填入默认值或推断值。

## 质量检查

质量结果必须基于本次实际回答和生成内容：

- `completeness_score`：已确认项目占本次选择范围的比例；
- `consistency_score`：不同回答之间是否存在直接矛盾；
- `feasibility_score`：规则是否可以转化为实际开发约束；
- `overall_score`：以上维度的综合结果。

如果无法可靠计算某项，使用 `null` 并在 `issues` 中说明原因，不得使用固定示例分数。

## 已有文件处理

生成前检查目标文件是否存在。存在时必须询问用户选择：

1. **覆盖**：使用本次已确认内容替换原文；
2. **合并**：保留原文中未被本次回答覆盖的规则，并以本次确认内容为准；
3. **另存为新文件**：由用户提供或确认新路径；
4. **取消**：不写入任何文件。

未获得选择前不得修改原文件。合并时不得把原文中未经本次确认的内容伪装成新回答。

## 输出契约

```yaml
status: passed | partial | failed | cancelled
output_path: string | null
scope: full | formatting | naming | language | engineering
completed_batches: []
confirmed_fields: []
unconfirmed_fields: []
issues: []
quality: {}
requires_confirmation: boolean
```

状态含义：

- `passed`：文档已写入并通过完整校验，用户已确认或已完成修改；
- `partial`：文档已生成，但存在未确认项目或非阻塞问题；
- `failed`：读取、生成、写入或校验失败；
- `cancelled`：用户取消生成、覆盖或确认。

## 完成标准

1. 已记录本次目标范围和访谈批次；
2. 所有写入的规则都来自用户回答或用户明确确认；
3. 不适用或跳过的问题已记录为未确认；
4. `CODE_STYLE_PERSONAL.md` 已成功生成、合并或另存；
5. 文档包含结构化 JSON 和可读 Markdown 摘要；
6. 文档不存在无效 JSON、固定质量评分或未确认的默认规则；
7. 用户已确认内容，或明确收到待修改项；
8. 输出文件存在、非空、可读取且包含必要章节；
9. 返回状态与实际结果一致。

## 完成后校验

写入后必须检查：

- `output_path` 指向实际文件；
- 文件内容非空且包含标题、结构化规则和可读摘要；
- JSON 代码块可解析；
- `source` 为 `personal-interview`；
- `confirmed_fields` 与文档中的规则一致；
- 文档没有未确认的默认值或虚构回答；
- 用户修改后重新生成并再次执行上述校验。

校验失败时返回 `partial` 或 `failed`，不得仅凭文件写入成功报告 `passed`。

## 错误处理

- 用户中途停止：保留已收集回答，返回 `partial` 或 `cancelled`，不生成误导性完整文档；
- 目标路径无效：停止写入并返回 `failed`；
- 已有文件未选择处理方式：暂停并等待选择；
- 写入失败：保留内存中的结果，返回 `failed`；
- JSON 或 Markdown 校验失败：不得报告成功，先修复生成结果或返回失败原因。

## 与相关 Skill 的关系

| Skill | 关系 |
|---|---|
| `code-style-generator` | 可参考章节结构，但不覆盖用户确认的个人规则 |
| `code-structure-analyzer` | 不参与个人习惯访谈，仅提供代码结构分析 |

## 文件系统位置

- 主 Skill：`.claude/skills/personal-code-habits-generator/SKILL.md`
- 默认输出：项目根目录 `CODE_STYLE_PERSONAL.md`
- 共享上下文：`.claude/skills/tasks/current/task_skill.md`

## 版本

- 主 Skill 名称：`personal-code-habits-generator`
- 当前版本：1.3
- 状态：启用
- 核心流程：通过分批访谈收集、生成、确认并校验个人代码习惯
