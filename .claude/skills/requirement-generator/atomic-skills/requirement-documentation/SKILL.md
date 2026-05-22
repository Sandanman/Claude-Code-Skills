---
name: requirement-documentation
description: 整合所有原子skill的输出，生成标准化的机器可读requirements.json和人类可读requirements.md文档。作为最后一个原子skill执行。
---

# Requirement Documentation 原子Skill

## 概述
整合所有前置原子skill的输出，生成标准化的需求文档。输出两种格式：
1. **requirements.json**：机器可读的JSON格式，可直接被 code-generator 使用
2. **requirements.md**：人类可读的Markdown格式文档，包含完整需求拆解

## 核心能力
- 整合所有原子skill的输出数据
- 生成符合规范的requirements.json
- 生成结构化的requirements.md文档
- 自动填充项目上下文
- 生成时间戳和版本信息

## 输入
所有前置原子skill的输出结果：
- requirement-input-processor
- requirement-decomposition
- requirement-analysis
- function-flow-designer
- ui-component-identifier
- api-spec-designer
- test-case-generator
- requirement-evaluation
- project-context-reader

## 输出
两个文件：

### 1. requirements.json（机器可读）

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
    "source": "scan-object-info | manual | default",
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

### 2. requirements.md（人类可读）

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

## 执行逻辑

### 1. 数据收集
- 收集所有前置原子skill的输出结果
- 验证所有必需数据都已存在

### 2. requirements.json 生成
- 构建JSON结构
- 填充来自各原子skill的数据
- 生成时间戳和版本信息
- 验证JSON格式

### 3. requirements.md 生成
- 按照固定模板构建Markdown文档
- 填充各章节内容
- 格式化代码块和表格
- 验证文档完整性

### 4. 输出
- 写入当前目录的 requirements.json 文件
- 写入当前目录的 requirements.md 文件
- 记录生成日志

## 依赖关系
- 依赖所有前置原子skill：
  - requirement-input-processor
  - requirement-decomposition
  - requirement-analysis
  - function-flow-designer
  - ui-component-identifier
  - api-spec-designer
  - test-case-generator
  - requirement-evaluation
  - project-context-reader

## 完成标准
1. ✅ 所有前置原子skill已完成
2. ✅ requirements.json 已生成且格式正确
3. ✅ requirements.md 已生成且格式正确
4. ✅ 两个文件内容与所有前置输出一致
5. ✅ 时间戳和版本信息已正确填充
6. ✅ 文件已保存到当前目录

## 错误处理
- **前置数据缺失**：报告缺失项，停止生成
- **JSON格式错误**：重新构建并验证
- **Markdown格式错误**：检查模板和填充内容
- **文件写入失败**：报告错误，尝试写入临时文件

## 注意事项
- 严格遵循输出格式规范
- 不修改或添加任何原子skill的输出内容
- 仅整合，不分析
- 不生成新的需求信息
- 不依赖项目文件

## 文件位置
- requirements.json：./requirements.json
- requirements.md：./requirements.md

## 原子skill位置
./.claude/skills/requirement-generator/atomic-skills/requirement-documentation/SKILL.md
