---
name: code-generator
description: 根据需求文档或自然语言需求，结合项目技术栈和代码规范，设计并生成可维护的代码，完成多模块整合、验证与文档更新。
---

# Code Generator 主 Skill

## 概述

Code Generator 根据 `requirements.json`、项目上下文或用户自然语言需求，完成从需求读取、技术栈检测、代码设计、代码生成到验证和文档更新的完整流程。它保留生成代码的业务逻辑，支持 Vue、React、JavaScript、TypeScript 等常见项目，并根据项目现有结构和规范输出可直接开发的代码。

## 核心能力

- 识别标准化输入、简单需求、复杂需求和复杂需求标准化四类场景
- 读取并校验 `requirements.json`、`project_context.json` 与自由文本需求
- 检测框架、语言、构建工具、依赖、目录结构和 `CODE_STYLE.md`
- 设计组件、函数、类型、API、路由、状态和模块关系
- 生成 Vue/React 组件、JavaScript/TypeScript 文件、API、类型、路由、状态和工具函数
- 整合多模块代码，统一共享资源并检查依赖关系
- 验证语法、类型、规范、导入依赖和需求测试用例
- 为组件、函数、类型和 API 补充准确注释与使用说明

## 四类场景执行流程

### 场景1：标准化需求输入

**触发条件**：存在有效的 `requirements.json`，或用户明确提供其路径。

```text
multi-scenario-adapter
  → requirement-reader
  → tech-stack-detection
  → code-design
  → code-generation
  → [module-integration（多模块时）]
  → code-validation
  → documentation-update
```

优先复用 `requirements.json` 中的 `project_context`、`api_spec`、`ui_components`、`modules`、`test_cases` 和 `quality`。如果是多模块需求，必须执行模块整合。

### 场景2：简单自由文本需求

**触发条件**：没有标准化需求文件，且需求集中于一个功能点或单个模块。

```text
multi-scenario-adapter
  → requirement-reader
  → requirement-analysis
  → tech-stack-detection
  → code-design
  → code-generation
  → code-validation
  → documentation-update
```

单模块需求不执行 `module-integration`，但仍需完成设计、生成和验证。

### 场景3：复杂或多模块自由文本需求

**触发条件**：没有标准化需求文件，且需求包含多个功能点、模块、页面或明显的模块间数据流。

```text
multi-scenario-adapter
  → requirement-reader
  → requirement-analysis
  → tech-stack-detection
  → code-design
  → code-generation
  → module-integration
  → code-validation
  → documentation-update
```

需要明确模块边界、共享类型、API、工具函数、路由和状态管理，并在生成后统一整合。

### 场景4：复杂需求先标准化

**触发条件**：复杂需求缺少结构化字段，且标准化能显著降低歧义。

```text
检测复杂需求
  → 询问是否先运行 requirement-generator
  → 是：requirement-generator → 场景1流程
  → 否：场景3流程
```

询问只用于需求存在关键歧义时；用户选择直接实现时，不阻塞代码生成。

## 完整原子 Skill 依赖

| 顺序 | 原子 Skill | 作用 | 上游输入 | 下游输出 |
|------|------------|------|----------|----------|
| 1 | `multi-scenario-adapter` | 判断输入来源、需求类型和执行路径 | 用户需求、文件路径 | `scenario_decision` |
| 2 | `requirement-reader` | 读取标准需求、项目上下文或自由文本 | `scenario_decision`、需求输入 | `requirements_data` |
| 3 | `requirement-analysis` | 分析自由文本的功能点、边界和模块关系 | `requirements_data` | `analyzed_requirements` |
| 4 | `tech-stack-detection` | 检测项目技术栈、结构和代码规范 | 需求数据、项目文件 | `tech_stack` |
| 5 | `code-design` | 设计文件、组件、数据、接口和模块关系 | 需求数据、`tech_stack` | `code_spec` |
| 6 | `code-generation` | 按设计生成代码文件 | `code_spec`、`tech_stack` | `generated_code` |
| 7 | `module-integration` | 整合多模块文件和共享资源 | `generated_code`、`code_spec` | `integrated_project` |
| 8 | `code-validation` | 验证语法、规范、依赖和功能完整性 | 生成或整合后的代码 | `validation_result` |
| 9 | `documentation-update` | 更新注释和代码文档 | 验证结果、代码清单 | `final_artifacts` |

`requirement-analysis` 仅在自由文本输入时执行；`module-integration` 仅在多模块需求时执行。其余原子 Skill 按场景顺序执行，不得因为流程简化而跳过验证。

## 输入契约

```json
{
  "user_input": "需求文本或文件路径",
  "project_root": "项目根目录",
  "requirements_path": "可选，requirements.json 路径",
  "project_context_path": "可选，project_context.json 路径",
  "existing_context": "可选的已有项目上下文"
}
```

至少需要 `user_input` 或有效的 `requirements_path`。项目扫描应限定在 `project_root` 内；不得把未经确认的猜测当作需求事实。

## 输出契约

```json
{
  "scenario_decision": {},
  "requirements_data": {},
  "tech_stack": {},
  "code_spec": {},
  "generated_code": {"files": []},
  "integrated_project": {"files": [], "relationships": []},
  "validation_result": {"status": "passed | warning | failed", "issues": []},
  "final_artifacts": {"files": [], "reports": []}
}
```

最终输出必须列出新增或修改的文件、关键实现说明、验证结果、未解决的问题以及后续建议。没有实际修改时，应明确说明原因。

## 共享上下文

各原子 Skill 通过结构化结果传递上下文，不重复猜测已经确认的信息。共享内容包括：场景决策、需求来源和原文、项目根目录、技术栈、目录结构、代码规范、模块清单、API/UI 规格、生成文件清单、验证问题和修复状态。`requirements.json` 中的 `project_context` 优先于单独的 `project_context.json`，后者优先于项目扫描结果；冲突时记录来源并以更具体、更新的用户输入为准。

## 完成标准

1. 需求来源、场景和执行路径已明确。
2. 需求中的功能点、输入、输出、边界条件和模块关系已覆盖。
3. 技术栈、目录结构和代码规范已检测或明确记录缺失。
4. 代码设计覆盖所有需要实现的功能、API、UI 和共享资源。
5. 生成或修改的文件路径正确，业务逻辑完整，未引入无依据的功能。
6. 多模块代码已完成共享资源、路由、状态和依赖整合。
7. 代码已完成语法、类型、规范、导入依赖和适用测试用例验证。
8. 组件、函数、类型和 API 的必要注释已更新。
9. 输出完整文件清单、验证报告和遗留问题。

## 重试与错误处理

- 输入为空或路径无效：提示补充需求；路径无效时仅在存在文本输入时回退到文本解析。
- `requirements.json` 格式错误或字段缺失：列出具体问题；可用的自由文本仍可进入分析流程。
- 技术栈无法识别：报告缺失信息并请求用户指定，不使用未经证实的框架假设。
- 需求冲突、范围过宽或边界不清：列出冲突和澄清问题，确认后再生成受影响部分。
- 生成文件已存在：先读取并比较，默认保留已有业务逻辑；覆盖或修改前说明影响。
- 验证失败：记录错误位置和原因，优先返回设计或生成阶段修正；修正后重新验证，避免无止境循环。
- 单个原子 Skill 失败：保留已完成上下文，针对失败步骤重试；连续重试仍失败时停止并输出可复现的错误信息。

## 安全边界

- 只在用户指定或当前项目根目录范围内读取、创建和修改文件。
- 不读取、输出或提交 token、密码、私钥、`.env` 等敏感信息。
- 不执行破坏性命令，不删除用户已有业务代码，不擅自修改依赖、配置或数据库。
- 不绕过项目验证、安全规则或权限控制；涉及认证、授权和输入校验时保留并强化安全逻辑。
- 生成代码必须遵循项目现有规范，不能以示例代码替代真实项目约束。

## 文件系统位置

- 主 Skill：`.claude/skills/code-generator/SKILL.md`
- 原子 Skill：`.claude/skills/code-generator/atomic-skills/*/SKILL.md`
- 共享任务上下文：由上层任务编排器管理的任务上下文

## 版本信息

- 主 Skill：`code-generator`
- 原子 Skill：9 个
- 状态：启用
