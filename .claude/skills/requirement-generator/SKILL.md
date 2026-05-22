---
name: requirement-generator
description: 将用户自然语言需求转化为标准化、可执行的机器需求文档（requirements.json），支持多模态输入，依赖外部项目上下文，不扫描任何项目文件。当用户需要将需求转化为可开发的规格时自动触发。
---

# Requirement Generator 主Skill

## 概述
本主skill将用户自然语言需求（文本、图片、文档）转化为标准化、机器可读的需求规格文档 `requirements.json`，并生成人类可读的详细拆解文档 `requirements.md`。它**不扫描任何项目文件**，**不依赖任何框架**，完全依赖外部上下文（如 scan-object-info 的输出）或用户手动提供，确保100%跨项目通用，适用于90%以上前端项目。

## 核心理念
- **零项目扫描**：不读取 package.json、不扫描 src/、不探测技术栈
- **上下文可插拔**：项目上下文由 scan-object-info 或用户手动提供
- **语义驱动**：仅基于需求语义分析，不绑定具体组件库或框架
- **标准输出**：输出符合 code-generator 输入规范的 JSON + Markdown 双文档
- **用户决策优先**：缺失上下文时，由用户决定如何补充

## 核心能力
- 多模态需求输入（文本、图片、文档）
- 需求模块化分解
- 7种通用前端流程识别（CRUD、线性、状态机等）
- 通用UI组件识别（form、button、table等）
- REST API规格设计
- 测试用例生成
- 需求质量评估
- 项目上下文读取（仅读取，不探测）
- 生成标准化需求文档

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
1. ✅ 原始需求已解析（文本/图片/文档）
2. ✅ 需求已分解为功能模块
3. ✅ 需求类型已分析（新建/修改、API需求、权限）
4. ✅ 功能流程已识别（CRUD/线性/状态机等）
5. ✅ UI组件类型已识别（form、button、table等）
6. ✅ API接口已设计
7. ✅ 测试用例已生成
8. ✅ 需求质量已评估
9. ✅ 项目上下文已读取（来自 scan-object-info 或用户上传）
10. ✅ 输出 requirements.json 标准文档
11. ✅ 输出 requirements.md 详细拆解文档
12. ✅ 所有原子skill日志完整记录

## 重试规则
- 每个原子skill失败后可重试 **3次**
- requirement-evaluation 发现问题可返回 requirement-analysis 重新分析（最多循环 **2次**）
- project-context-reader 无法获取上下文时，等待用户选择

## 输入形式
| 输入类型 | 示例 |
|----------|------|
| 文本需求 | "实现用户登录功能，包含用户名、密码输入，登录按钮，成功后跳转首页" |
| 图片+说明 | [上传UI设计图] + "这是登录页面的设计，使用Element Plus组件" |
| 需求文档 | 上传 requirements.docx 内容："3.1 用户管理模块..." |

## 输出产物
1. ✅ **requirements.json**：标准机器可读格式，可直接被 code-generator 使用
2. ✅ **requirements.md**：人类可读的详细需求拆解文档

## requirements.json 格式
```json
{
  "version": "1.0",
  "generated_at": "2026-04-09T15:00:00Z",
  "source": "user_text | uploaded_document | ui_design_image",
  "project_context_used": true,
  "requirement": {
    "raw_text": "用户原始需求",
    "summary": "需求摘要",
    "code_action": "new",  // new 或 modify
    "requires_new_api": true,
    "has_auth": true
  },
  "project_context": {
    "source": "scan-object-info | manual",
    "data": {
      "frontend_framework": "vue3",
      "ui_library": {
        "name": "element-plus",
        "version": "2.2.31",
        "components": ["el-form", "el-input", "el-button", "el-table"]
      },
      "project_structure": {
        "components_dir": "src/components",
        "views_dir": "src/views",
        "apis_dir": "src/api"
      },
      "code_style": {
        "has_style_guide": true,
        "style_guide_path": "/CODE_STYLE.md",
        "indent": "2sp",
        "quotes": "single"
      }
    }
  },
  "modules": [
    {
      "name": "用户登录",
      "type": "auth",
      "description": "用户通过用户名和密码登录系统",
      "priority": "high",
      "ignore": false
    }
  ],
  "flow": {
    "type": "CRUD",
    "nodes": [
      {
        "name": "登录页",
        "page": "/login",
        "action": "create",
        "next": "首页"
      }
    ],
    "transitions": ["登录页 → 首页"],
    "permissions": ["所有用户"]
  },
  "ui_components": [
    {
      "type": "form",
      "purpose": "用户登录表单",
      "fields": [
        { "name": "username", "type": "text", "required": true },
        { "name": "password", "type": "password", "required": true }
      ],
      "buttons": [
        { "text": "登录", "type": "primary", "action": "submit" }
      ]
    }
  ],
  "api_spec": {
    "endpoints": [
      {
        "method": "POST",
        "path": "/api/login",
        "request": {
          "username": "string",
          "password": "string"
        },
        "response": {
          "success": { "code": 0, "data": { "token": "string" } },
          "error": { "code": 401, "message": "string" }
        },
        "auth_required": false
      }
    ]
  },
  "test_cases": [
    {
      "type": "normal",
      "description": "正常登录",
      "steps": ["输入用户名", "输入密码", "点击登录"],
      "expected": "跳转首页"
    }
  ],
  "quality": {
    "score": 95,
    "issues": [],
    "recommendations": ["建议添加'记住我'功能"]
  }
}
```

## requirements.md 格式
```markdown
# 需求规格说明书

## 1. 需求概述
[需求描述]

## 2. 需求分析
- **来源**：用户输入
- **代码操作**：新建
- **是否需API**：是
- **是否含权限控制**：否

## 3. 模块分解
| 模块名称 | 类型 | 描述 | 优先级 |
|----------|------|------|--------|
| 用户登录 | auth | 用户通过用户名和密码登录系统 | 高 |

## 4. 功能流程
- **流程类型**：CRUD
- **节点**：
  - 登录页（/login）：创建 → 跳转到首页
- **流转**：登录页 → 首页
- **权限**：所有用户

## 5. UI组件设计
- **组件类型**：form
- **用途**：用户登录表单
- **字段**：
  - username (text, 必填)
  - password (password, 必填)
- **按钮**：
  - 登录（primary, submit）

## 6. API接口设计
- **接口**：POST /api/login
- **请求**：
  ```json
  {"username": "string", "password": "string"}
  ```
- **响应**：
  ```json
  {"code": 0, "data": {"token": "string"}}
  ```
- **认证**：无

## 7. 测试用例
| 测试场景 | 输入 | 预期结果 |
|----------|------|----------|
| 正常登录 | 用户名：test，密码：123456 | 成功跳转首页 |
| 用户名为空 | 用户名：空，密码：123456 | 提示"用户名不能为空" |

## 8. 需求质量评估
- **综合评分**：95/100
- **问题**：无
- **建议**：建议添加"记住我"功能

## 9. 项目上下文
- **来源**：scan-object-info
- **框架**：Vue 3
- **UI库**：Element Plus 2.2.31
- **组件**：el-form, el-input, el-button, el-table
- **目录结构**：src/components, src/views, src/api
- **代码规范**：2空格缩进，单引号

## 10. 生成信息
- 生成时间：2026-04-09 15:00:00
- 生成工具：requirement-generator v1.0
```

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

## 版本和状态
版本：1.0
主skill名称：requirement-generator
状态：启用