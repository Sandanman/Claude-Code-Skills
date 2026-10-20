---
name: bug-solver
description: 作为 Bug 原子 Skill 编排器，根据问题目标和已有上下文选择标准修复模式或场景组合模式，完成分类、分析、修复、修改完成校验和测试建议。当用户报告错误、异常行为或提供 bug 信息时触发。
---

# Bug Solver 原子 Skill 编排器

## 概述

`bug-solver` 负责根据 Bug 目标和已有处理产物编排 7 个原子 Skill。它不要求每次都执行全部原子 Skill，而是在满足依赖关系和输入契约的前提下，选择标准修复模式或场景组合模式。

## 编排模式

### 模式一：标准修复模式

适用于需要完成从问题识别到修复验证的完整 Bug 修复任务：

```text
bug-triage
  ↓
bug-identification
  ↓
code-analysis
  ↓
root-cause-analysis
  ↓
fix-generation
  ↓
fix-verification（包含修改完成校验）
  ↓
test-suggestion（按需）
```

前 6 个阶段按顺序执行。`test-suggestion` 在需要回归测试、修复影响范围较大或用户明确要求测试建议时执行。

### 模式二：场景组合模式

适用于只需完成部分目标，或上下文中已经存在可信阶段产物的任务。编排器根据用户目标、Bug 优先级和已有输出选择合法的依赖前缀，不得跳过缺失的前置产物。

| 用户目标 | 最小组合 | 完成条件 |
|---------|---------|---------|
| 分类和定级 | `bug-triage` | 输出类型、优先级和处理策略 |
| 整理问题 | `bug-triage → bug-identification` | 输出复现步骤、期望行为和实际行为 |
| 分析代码 | `bug-triage → bug-identification → code-analysis` | 输出相关文件和可疑代码分析 |
| 定位根因 | 延伸至 `root-cause-analysis` | 输出根因和证据链 |
| 生成修复方案 | 延伸至 `fix-generation` | 输出推荐方案、备选方案和 diff |
| 验证已完成修改 | `fix-verification` | 已提供完整修复方案和已应用修改证据 |
| 生成回归测试 | `test-suggestion` | 已提供验证报告 |

如果上游产物已由可信来源提供，可将其作为输入契约使用；否则必须执行对应前置 Skill。`fix-verification` 不得仅凭修复方案判定成功，必须校验修改是否实际完成。

## 原子 Skill 依赖关系

| 原子 Skill | 依赖 | 状态 | 说明 |
| ----------- | ------ | ------ | ------ |
| `bug-triage` | 无 | 必须执行或提供等价分类结果 | 判断类型、优先级和处理策略 |
| `bug-identification` | `bug-triage` | 按目标执行 | 收集信息并形成结构化问题报告 |
| `code-analysis` | `bug-identification` | 按目标执行 | 分析相关代码和可疑位置 |
| `root-cause-analysis` | `code-analysis` | 按目标执行 | 定位根因并建立证据链 |
| `fix-generation` | `root-cause-analysis` | 按目标执行 | 设计并生成修复方案 |
| `fix-verification` | `fix-generation` 和已应用修改 | 修复任务必需 | 验证修改完成、修复结果和回归风险 |
| `test-suggestion` | `fix-verification` | 按需执行 | 提供回归测试建议 |

## 编排规则

1. 先识别用户目标：分类、整理、分析、定位、修复、验证或测试建议。
2. 检查已有上下文中的阶段产物和可信度。
3. 计算所需原子 Skill 的依赖闭包，按依赖顺序执行，不得无依据跳步。
4. 低优先级 Bug 如果用户只要求记录或分类，可在 `bug-triage` 或 `bug-identification` 完成后结束；不得自行生成修复。
5. 只分析不修复的任务，在 `code-analysis` 或 `root-cause-analysis` 完成后结束。
6. 生成修复方案不等于完成修改；需要修改代码时，必须由用户或代码修改 Skill 应用方案，再进入 `fix-verification`。
7. 已有阶段产物必须标明来源、时间和适用范围；无法确认来源时重新执行对应阶段。
8. 任一必需输入缺失或校验失败时暂停后续步骤，并输出缺失项。

## 修改完成校验

`fix-verification` 必须同时检查以下内容，并将结果写入 `modification_validation`：

| 校验项 | 必须确认的内容 |
|--------|----------------|
| 修改范围 | 方案中的目标文件已实际修改，未遗漏必要文件 |
| 修改内容 | 实际 diff 与修复方案一致，没有未解释的额外改动 |
| 原问题 | 原始复现步骤不再触发问题，或给出无法复现的明确原因 |
| 回归风险 | 相关功能、边界条件和错误路径已检查 |
| 验证证据 | 测试、构建、运行结果或人工复核证据可追溯 |
| 结论状态 | `passed`、`failed` 或 `partial`，并说明阻塞项 |

只有当修改范围、修改内容、原问题验证和证据检查均通过时，才可将 `modification_validation.status` 标记为 `passed`。方案生成但修改未应用时必须标记为 `not_applied`，不能标记修复成功。

## 完成标准

按所选模式判断完成，不要求每次执行全部 7 个原子 Skill：

- 场景组合模式：所选目标的最小组合全部完成，输出契约完整。
- 标准修复模式：前 6 个阶段完成，修改完成校验通过；根据问题范围决定是否执行 `test-suggestion`。
- 执行 `test-suggestion` 时，输出至少三个相关测试场景；跳过时必须记录跳过原因。
- 所有失败、缺失输入和未应用修改均明确记录，不得伪报成功。

## 重试规则

- 每个原子 Skill 失败后最多重试 3 次。
- 重试 3 次后仍失败，暂停任务并等待用户确认。
- `fix-verification` 发现修改不完整时，可返回 `fix-generation`，最多循环 2 次。

## 共享上下文

任务状态和阶段产物写入 `.claude/skills/tasks/current/task_skill.md`：

| 阶段 | 输出键 |
|------|--------|
| `bug-triage` | `triage_result` |
| `bug-identification` | `bug_report` |
| `code-analysis` | `analysis_result` |
| `root-cause-analysis` | `root_cause` |
| `fix-generation` | `fix_plan` |
| `fix-verification` | `verification_result`、`modification_validation` |
| `test-suggestion` | `test_cases` |
| 编排器 | `orchestration_mode`、`selected_skills`、`orchestration_status` |

## 使用示例

### 标准修复模式

用户输入：

> 登录页面点击登录按钮没有反应，控制台显示 `TypeError: Cannot read property 'login' of undefined`，请修复并验证。

执行 `bug-triage` 到 `fix-verification`，应用修复后校验目标文件、实际 diff、原问题复现结果和测试证据；根据影响范围决定是否执行 `test-suggestion`。

### 场景组合模式

用户输入：

> 只帮我判断这个问题的类型和优先级。

仅执行 `bug-triage`，输出分类报告后结束，不进入代码分析和修复流程。

## 文件系统位置

- 主 Skill：`.claude/skills/bug-solver/SKILL.md`
- 原子 Skill：`.claude/skills/bug-solver/atomic-skills/`
- 共享上下文：`.claude/skills/tasks/current/task_skill.md`

## 版本信息

- 主 Skill 名称：`bug-solver`
- 原子 Skill 数量：7
- 状态：启用
- 最后更新：2026-10-20
