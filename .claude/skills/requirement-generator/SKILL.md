---
name: requirement-generator
description: 将用户自然语言需求转化为标准化、可执行的机器需求文档（requirements.json），支持多模态输入，依赖外部项目上下文。
---

# Requirement Generator 主 Skill（v1.2）

## 概述
本主 skill 将用户自然语言需求（文本、图片、文档）转化为标准化、机器可读的需求规格文档 `requirements.json`，并生成人类可读的详细拆解文档 `requirements.md`。

## 核心理念
- **零项目扫描**：不读取 package.json、不扫描 src/、不探测技术栈
- **上下文可插拔**：项目上下文由 scan-object-info 或用户手动提供
- **语义驱动**：仅基于需求语义分析，不绑定具体组件库或框架
- **标准输出**：输出符合 code-generator 输入规范的 JSON + Markdown 双文档
- **用户决策优先**：缺失上下文时，由用户决定如何补充

## 核心能力
- 多模态需求输入（文本、图片、文档、代码片段、API 文档片段）
- 需求模块化分解 + 分析（合并入 analysis）
- 7种通用前端流程识别 + sub-flow detection + UI组件识别（合并入 design-designer）
- REST API规格设计
- 测试用例生成
- 多维度需求质量评估（completeness/consistency/testability/security + feasibility/urgency）
- 项目上下文读取（仅读取，不探测）

## 执行流程（v1.2）

```
requirement-input-processor → requirement-analysis →
function-flow-designer + ui-component-identifier → api-spec-designer →
test-case-generator → requirement-evaluation →
project-context-reader → requirement-documentation
```

## 原子 skill 依赖关系

| 原子 skill | 依赖 |
|-----------|------|
| requirement-input-processor | 无 |
| requirement-analysis | requirement-input-processor |
| function-flow-designer | requirement-analysis |
| ui-component-identifier | function-flow-designer + requirement-analysis |
| api-spec-designer | requirement-analysis |
| test-case-generator | ui-component-identifier + requirement-analysis |
| requirement-evaluation | function-flow-designer + ui-component-identifier + api-spec-designer + test-case-generator |
| project-context-reader | requirement-evaluation |
| requirement-documentation | 所有前置 skill |

## 主 Skill 完成标准（v1.2）

1. 原始需求已解析（文本/图片/文档/代码片段，含 `input_type` 细分）
2. 需求类型已分析（新建/修改、API 需求、权限）
3. 功能流程已识别（CRUD/线性/状态机等，含 sub-flow）
4. UI 组件类型已识别（form、button、table 等，含 validation 子流程）
5. API 接口已设计，或明确记录无需新增 API
6. 测试用例已生成
7. 需求质量已评估（7 维度：completeness/consistency/testability/security/feasibility/urgency/overall）
8. 项目上下文已读取，或已记录用户选择的上下文来源（scan-object-info、用户上传或跳过）
9. `requirements.json` 和 `requirements.md` 已按命名规则写入指定目录
10. 输出内容与原始需求、已确认上下文和各分析结果一致

## 完成后校验

在报告任务完成前必须逐项检查：

1. 输出目录存在，且包含对应的 `requirements.json` 和 `requirements.md`。
2. 两个文件均非空且可读取；JSON 文件可被解析。
3. JSON 包含 `version`、`generated_at`、`source`、`requirement`、`modules`、`flow`、`ui_components`、`api_spec`、`test_cases` 和 `quality` 字段。
4. `source` 与实际输入类型一致，`generated_at` 使用实际生成时间，不使用固定示例时间。
5. 所有质量评分均为实际分析结果；评分在 `0-100` 范围内，无法可靠计算时使用 `null` 并记录原因。
6. 模块、流程、UI 组件、API 和测试用例之间的引用关系一致。
7. 项目上下文来源可追溯；未自动扫描项目，且用户选择已被准确记录。
8. Markdown 结构完整，JSON 和 Markdown 的核心内容一致。
9. 任一校验失败时不得报告 `passed`，应返回失败原因。

## 状态与错误处理

- `passed`：输入、分析、文档生成、文件写入和完成后校验全部成功。
- `partial`：非核心上下文缺失或部分分析不可用，但已生成可用文档并明确记录影响。
- `failed`：输入解析、核心分析、文件写入或完成后校验失败。
- `cancelled`：用户取消上下文选择或文档生成，不覆盖已有输出。

输入无效、核心分析失败或文件写入失败时停止后续生成，不使用猜测值补全业务数据。

## 重试规则
- 每个原子skill失败后可重试 **3次**
- requirement-evaluation 发现问题可返回 requirement-analysis 重新分析（最多循环 **2次**）
- project-context-reader 无法获取上下文时，等待用户选择

## 输入形式（扩展版）
| 输入类型 | input_type 值 | 示例 |
|----------|---------------|------|
| 文本需求 | `user_text` | "实现用户登录功能，包含用户名、密码输入，登录按钮" |
| 图片+说明 | `ui_design_image` | [上传UI设计图] + "这是登录页面的设计" |
| 需求文档 | `uploaded_document` | 上传 requirements.docx 内容 |
| 代码片段 | `code_snippet` | [粘贴现有代码片段] + "在现有代码上修改" |
| API 文档 | `api_spec` | [粘贴 API 接口描述] + "新增此 API 调用" |
| 混合输入 | `mixed` | 文本 + 图片 + 代码片段组合 |

## 输出产物

需求文档统一保存至 `.claude/skills/requirement-generator/requirement-document/` 目录下。文件名规则：
- 用户输入了需求名称 → `requirements_{用户输入名称}.json` / `requirements_{用户输入名称}.md`
- 用户未输入名称 → `requirements_{timestamp}.json` / `requirements_{timestamp}.md`

```json
{
  "version": "1.2",
  "generated_at": "<实际生成时间>",
  "source": "user_text | uploaded_document | ui_design_image | code_snippet | api_spec | mixed",
  "project_context_used": true,
  "requirement": {
    "raw_text": "用户原始需求",
    "summary": "需求摘要",
    "code_action": "new",
    "requires_new_api": true,
    "has_auth": true
  },
  "project_context": { "source": "scan-object-info | manual | default", "data": { } },
  "modules": [ ],
  "flow": { },
  "ui_components": [ ],
  "api_spec": { },
  "test_cases": [ ],
  "quality": {
    "overall_score": null,
    "completeness_score": null,
    "consistency_score": null,
    "testability_score": null,
    "security_score": null,
    "feasibility_score": null,
    "urgency_score": null,
    "issues": [],
    "recommendations": []
  }
}
```

## quality.score 7维度评估体系（v1.2 新增 feasibility/urgency）
- **overall_score**：综合评分（0-100）
- **completeness_score**：完整性评分（模块覆盖、字段覆盖、异常处理）
- **consistency_score**：一致性评分（命名一致、术语一致、流程一致）
- **testability_score**：可测试性评分（输入可控、输出可观察、状态可检测）
- **security_score**：安全性评分（XSS、CSRF、注入风险）
- **feasibility_score**：可行性评分（技术可行性、依赖可满足性）**[新增 v1.2]**
- **urgency_score**：紧急度评分（业务优先级、截止时间压力）**[新增 v1.2]**

## 项目上下文读取规则
- 读取文件路径：`./.claude/project-context.json`
- 如果文件存在：自动读取并使用
- 如果文件不存在：
  - 询问用户：
    1. 执行 scan-object-info skill 扫描项目
    2. 手动上传 project-context.json
    3. 跳过，使用默认配置
- **不自动执行 scan-object-info**，仅提示用户

## 注意事项
- 所有输出**不依赖项目文件**，适用于任何前端项目
- 不预设任何UI组件库，完全由外部上下文提供
- 所有分析基于语义，非路径或代码结构
- 输出的 requirements.json 可直接用于 code-generator

## 文件系统位置
- 主skill路径：./.claude/skills/requirement-generator/SKILL.md
- 原子skill路径：./.claude/skills/requirement-generator/atomic-skills/下各子目录

## 版本
主skill名称：requirement-generator
状态：启用
