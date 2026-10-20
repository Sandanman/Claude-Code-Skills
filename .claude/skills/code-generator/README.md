# Code Generator 使用指南

## 概述

Code Generator 根据 `requirements.json`、项目上下文或自然语言需求生成符合项目规范的代码，覆盖需求分析、技术栈检测、代码设计、代码生成、多模块整合、验证和文档更新。它保留生成代码业务逻辑，执行过程只依赖实际需求、项目上下文和验证结果。

## 快速开始

### 触发方式

以下请求会触发本 Skill：

- 根据需求写代码
- 实现一个功能或模块
- 生成函数、组件、API 或页面
- 按照需求文档开发
- 帮我实现一个用户登录组件

### 基本示例

```text
用户：帮我实现一个用户登录组件，包含用户名、密码输入框和登录按钮。

Code Generator：
1. 识别输入类型和执行场景
2. 读取项目规范并检测技术栈
3. 设计组件、表单校验和登录接口
4. 生成代码并执行验证
5. 输出文件清单、验证结果和遗留问题
```

## 文件结构

```text
.claude/skills/code-generator/
├── SKILL.md                                      # 主 Skill 定义
├── README.md                                     # 使用指南
└── atomic-skills/
    ├── multi-scenario-adapter/SKILL.md           # 场景识别与路由
    ├── requirement-reader/SKILL.md               # 需求读取
    ├── requirement-analysis/SKILL.md             # 自由文本需求分析
    ├── tech-stack-detection/SKILL.md             # 技术栈检测
    ├── code-design/SKILL.md                      # 代码结构设计
    ├── code-generation/SKILL.md                  # 代码文件生成
    ├── module-integration/SKILL.md               # 多模块整合
    ├── code-validation/SKILL.md                  # 代码验证
    └── documentation-update/SKILL.md             # 注释与文档更新
```

## 四类执行场景

### 场景1：标准化需求

输入为有效 `requirements.json` 时，读取其中的需求、API、UI、项目上下文和测试信息：

```text
multi-scenario-adapter
→ requirement-reader
→ tech-stack-detection
→ code-design
→ code-generation
→ module-integration（仅多模块）
→ code-validation
→ documentation-update
```

### 场景2：简单需求

单个函数、组件或单一功能使用自由文本分析，不执行多模块整合：

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

### 场景3：复杂或多模块需求

多个功能点、页面或模块间存在数据流时，生成后必须整合：

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

### 场景4：复杂需求先标准化

需求信息不足时，可以先运行 `requirement-generator` 生成 `requirements.json`，再按场景1执行；用户选择直接实现时按场景3执行。

## 9 个原子 Skill

| 顺序 | 原子 Skill | 输入 | 输出 | 执行条件 |
|------|------------|------|------|----------|
| 1 | `multi-scenario-adapter` | 用户需求或文件路径 | `scenario_decision` | 所有场景 |
| 2 | `requirement-reader` | 场景决策和需求输入 | `requirements_data` | 所有场景 |
| 3 | `requirement-analysis` | 自由文本需求 | `analyzed_requirements` | 场景2、3 |
| 4 | `tech-stack-detection` | 需求数据和项目文件 | `tech_stack` | 所有场景 |
| 5 | `code-design` | 需求数据和技术栈 | `code_spec` | 所有场景 |
| 6 | `code-generation` | 代码设计和技术栈 | `generated_code` | 所有场景 |
| 7 | `module-integration` | 生成代码和设计 | `integrated_project` | 多模块时 |
| 8 | `code-validation` | 生成或整合后的代码 | `validation_result` | 所有场景 |
| 9 | `documentation-update` | 代码和验证结果 | `final_artifacts` | 所有场景 |

## 输入输出示例

### 输入

```text
实现一个会议管理系统，包含：
1. 会议创建：填写标题、开始时间、结束时间
2. 会议列表：按状态筛选
3. 会议详情：编辑、删除、加入会议
```

### 典型输出文件

```text
src/views/meeting/Create.vue       # 创建会议
src/views/meeting/List.vue         # 会议列表
src/views/meeting/Detail.vue       # 会议详情
src/api/meeting.ts                 # API 封装
src/types/meeting.ts               # 共享类型
src/router/meeting.ts              # 路由配置
src/stores/meeting.ts              # 状态管理
src/utils/date.ts                  # 共享工具函数
```

最终报告还应包含生成或修改的文件清单、实现摘要、验证报告、未解决问题和后续建议。

## 技术栈检测优先级

1. `requirements.json` 中的 `project_context`
2. 项目根目录的 `project_context.json`
3. 项目文件扫描，包括 `package.json`、构建配置、源码目录、ESLint/Prettier 和 `CODE_STYLE.md`

## 代码生成业务规则

- 优先使用项目已有的目录、组件、API 封装、工具函数和类型。
- 严格遵循 `requirements.json` 中的 `api_spec`、`ui_components` 和 `modules`。
- 遵循项目的 `CODE_STYLE.md`；不存在时，报告缺失并采用项目中可观察到的通用规范。
- 多模块需求统一共享类型、API、工具、路由和状态，避免重复定义和循环依赖。
- 生成组件、函数、类型和 API 的必要注释，并确保注释与实际行为一致。

## 完成标准

- 需求和执行场景明确。
- 所有功能点、边界条件和模块关系均有对应实现。
- 生成文件路径、命名和导入关系正确。
- 多模块代码已完成整合。
- 代码完成语法、类型、规范、依赖和适用测试用例验证。
- 输出完整的文件清单、验证结果和遗留问题。

## 错误处理与安全边界

- 输入或需求文件无效时，报告具体原因并在可行时回退到文本分析。
- 技术栈或需求存在歧义时，先记录缺失信息，不凭空假设。
- 已有文件修改前先读取并保留已有业务逻辑。
- 只在项目范围内操作，不输出敏感信息，不删除业务代码，不执行破坏性操作。
- 验证失败时返回设计或生成阶段修正，修正后重新验证并记录结果。
