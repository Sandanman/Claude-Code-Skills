---
name: requirement-generator
description: 将用户自然语言需求转化为标准化、可执行的机器需求文档（requirements.json），支持多模态输入，依赖外部项目上下文，改进版增强输入处理、quality.score、flow type 识别和输入输出示例。
---

# Requirement Generator 主 Skill（改进版 v1.1）

## 概述
本主 skill 将用户自然语言需求（文本、图片、文档）转化为标准化、机器可读的需求规格文档 `requirements.json`，并生成人类可读的详细拆解文档 `requirements.md`。**改进版增强输入处理、quality.score 体系、flow type 识别精度和输入输出示例。**

## 核心理念
- **零项目扫描**：不读取 package.json、不扫描 src/、不探测技术栈
- **上下文可插拔**：项目上下文由 scan-object-info 或用户手动提供
- **语义驱动**：仅基于需求语义分析，不绑定具体组件库或框架
- **标准输出**：输出符合 code-generator 输入规范的 JSON + Markdown 双文档
- **用户决策优先**：缺失上下文时，由用户决定如何补充

## 改进点（v1.0 -> v1.1）

1. **增强 requirement-input-processor**：支持更多输入类型（截图标注、代码片段、API 文档片段）
2. **新增 input_type 详细分类**：细化为 user_text / uploaded_document / ui_design_image / code_snippet / api_spec / mixed
3. **改进 requirements.json quality.score 体系**：新增 completeness_score、consistency_score、testability_score、security_score
4. **改进 requirements.md 格式**：新增输入输出示例、quality score 可视化
5. **增强 function-flow-designer flow type 识别**：新增 sub-flow detection、cross-flow reference
6. **新增每个原子 skill 的输入输出示例**

## 核心能力
- 多模态需求输入（文本、图片、文档、代码片段、API 文档片段）
- 需求模块化分解
- 7种通用前端流程识别（CRUD、线性、状态机等）+ sub-flow detection
- 通用UI组件识别（form、button、table等）
- REST API规格设计
- 测试用例生成
- 多维度需求质量评估（completeness/consistency/testability/security）
- 项目上下文读取（仅读取，不探测）
- 生成标准化需求文档（含 quality score）

## 执行流程

```
requirement-input-processor → requirement-decomposition → requirement-analysis →
function-flow-designer → ui-component-identifier → api-spec-designer →
test-case-generator → requirement-evaluation →
project-context-reader → requirement-documentation
```

## 原子skill依赖关系
- requirement-input-processor：无依赖
- requirement-decomposition：依赖 requirement-input-processor
- requirement-analysis：依赖 requirement-decomposition
- function-flow-designer：依赖 requirement-analysis
- ui-component-identifier：依赖 function-flow-designer
- api-spec-designer：依赖 requirement-analysis
- test-case-generator：依赖 requirement-analysis + ui-component-identifier
- requirement-evaluation：依赖 requirement-decomposition + api-spec-designer + test-case-generator
- project-context-reader：依赖 requirement-evaluation
- requirement-documentation：依赖所有前置skill

## 主skill完成标准
1. 原始需求已解析（文本/图片/文档/代码片段，含 input_type 细分）
2. 需求已分解为功能模块
3. 需求类型已分析（新建/修改、API需求、权限）
4. 功能流程已识别（CRUD/线性/状态机等，含 sub-flow）
5. UI组件类型已识别（form、button、table等）
6. API接口已设计
7. 测试用例已生成
8. 需求质量已评估（completeness/consistency/testability/security 多维度）
9. 项目上下文已读取（来自 scan-object-info 或用户上传）
10. 输出 requirements.json 标准文档（含 quality.score 多维度）
11. 输出 requirements.md 详细拆解文档（含 quality 可视化）
12. 所有原子skill日志完整记录

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
1. **requirements.json**：标准机器可读格式，含多维度 quality.score
2. **requirements.md**：人类可读的详细需求拆解文档（含 quality 可视化）

## requirements.json 格式（改进版）

```json
{
  "version": "1.1",
  "generated_at": "2026-05-21T10:00:00Z",
  "source": "user_text | uploaded_document | ui_design_image | code_snippet | api_spec | mixed",
  "project_context_used": true,
  "requirement": {
    "raw_text": "用户原始需求",
    "summary": "需求摘要",
    "code_action": "new",
    "requires_new_api": true,
    "has_auth": true
  },
  "project_context": {
    "source": "scan-object-info | manual | default",
    "data": { ... }
  },
  "modules": [ ... ],
  "flow": { ... },
  "ui_components": [ ... ],
  "api_spec": { ... },
  "test_cases": [ ... ],
  "quality": {
    "overall_score": 95,
    "completeness_score": 98,
    "consistency_score": 95,
    "testability_score": 92,
    "security_score": 100,
    "issues": [],
    "recommendations": ["建议添加'记住我'功能"]
  }
}
```

## quality.score 多维度评估体系（**新增 v1.1**）
- **overall_score**：综合评分（0-100）
- **completeness_score**：完整性评分（模块覆盖、字段覆盖、异常处理）
- **consistency_score**：一致性评分（命名一致、术语一致、流程一致）
- **testability_score**：可测试性评分（输入可控、输出可观察、状态可检测）
- **security_score**：安全性评分（XSS、CSRF、注入风险）

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
版本：1.1（改进版）
主skill名称：requirement-generator
状态：启用