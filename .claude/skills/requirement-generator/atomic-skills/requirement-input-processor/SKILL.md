---
name: requirement-input-processor
description: 解析用户提供的需求输入，支持文本、图片、文档、代码片段、API文档等多种形式，提取功能关键词和约束条件。在需求收集阶段自动执行。改进版新增代码片段和API文档片段支持。
---

# Requirement Input Processor 原子 Skill（改进版 v1.1）

## 概述
解析用户提供的需求输入，支持文本、图片（UI设计图）、文档（Word/PDF）、**代码片段、API文档片段**等多种形式，提取功能关键词、边界条件和约束条件。**改进版细化为 6 种 input_type，新增代码片段分析。**

## 核心能力
- 解析自然语言文本需求
- 识别图片中的UI元素（如有图片）
- 解析文档内容（Word/PDF）
- **解析代码片段**：提取函数签名、API调用模式、数据结构（新增 v1.1）
- **解析API文档片段**：提取端点、请求/响应结构（新增 v1.1）
- 提取功能关键词
- 识别约束条件（技术栈、性能、安全等）
- 判断需求复杂度（简单/中等/复杂）

## 输入
用户原始需求（文本、图片文件、文档文件、**代码片段、API 文档片段**）

## input_type 分类（**新增 v1.1**）
- `user_text`：纯文本需求描述
- `uploaded_document`：上传的文档（Word/PDF）
- `ui_design_image`：UI 设计图
- `code_snippet`：代码片段（需分析现有代码）
- `api_spec`：API 文档片段（需解析端点和结构）
- `mixed`：混合输入（文本+图片+代码等多类型组合）

## 输出
原始需求处理结果，包含以下内容：

```json
{
  "raw_input": "实现用户登录功能...",
  "input_type": "user_text",
  "has_ui_design": false,
  "ui_design_url": null,
  "extracted_features": [
    "登录",
    "用户名",
    "密码",
    "按钮",
    "跳转首页"
  ],
  "constraints": [
    "技术栈：Vue 3 + Element Plus",
    "需要表单验证",
    "需要页面跳转"
  ],
  "complexity": "simple",
  "estimated_modules": 1,
  "keywords": {
    "actions": ["登录"],
    "elements": ["用户名", "密码", "按钮"],
    "behaviors": ["跳转"],
    "tech_stack": ["Vue 3", "Element Plus"]
  },
  "code_snippet_analysis": null,
  "api_spec_analysis": null
}
```

### 代码片段分析（**新增 v1.1**）

```json
{
  "code_snippet_analysis": {
    "detected_api_calls": [
      { "function": "login", "params": ["username", "password"], "file": "api/auth.ts" }
    ],
    "detected_data_structures": [
      { "name": "UserInfo", "fields": ["id", "name", "token"] }
    ],
    "new_features_from_snippet": [
      "复用现有 login API",
      "新增 UserInfo 类型"
    ]
  }
}
```

### API 文档片段分析（**新增 v1.1**）

```json
{
  "api_spec_analysis": {
    "detected_endpoints": [
      { "method": "POST", "path": "/api/auth/login", "request_fields": ["username", "password"], "response_fields": ["token", "userId"] }
    ],
    "new_endpoints": ["/api/auth/login"],
    "auth_requirements": ["JWT token"]
  }
}
```

## 支持的文件类型

| 类型 | 扩展名 | 处理方式 |
|------|--------|----------|
| 纯文本 | .txt, .md | 直接读取内容 |
| Word文档 | .docx | 解析文本内容（忽略格式） |
| PDF文档 | .pdf | 提取文本（OCR不支持） |
| 图片 | .png, .jpg, .jpeg, .gif | 如果有说明文字，提取说明 |
| 代码文件 | .js, .ts, .vue, .tsx | 提取函数签名、import、API调用（**增强 v1.1**） |
| **API文档** | **.json, .yaml, .yml** | **解析端点、请求/响应结构（新增 v1.1）** |

## 复杂度判断规则
| 复杂度 | 功能点数量 | 预估模块数 | 判断依据 |
|--------|------------|------------|----------|
| simple | 1-3个 | 1个 | 单一功能，如登录 |
| medium | 4-8个 | 2-3个 | 如用户管理（登录+注册+权限） |
| complex | 9个以上 | 4个+ | 多模块系统，如电商平台 |

## 示例

**输入1：文本需求**
```
用户文本："实现用户登录功能，包含用户名、密码输入，登录按钮，成功后跳转首页。使用Vue 3和Element Plus。"
```
**输出1**：
```json
{
  "raw_input": "实现用户登录功能...",
  "input_type": "user_text",
  "extracted_features": ["登录", "用户名", "密码", "按钮", "跳转首页", "Vue 3", "Element Plus"],
  "constraints": ["技术栈：Vue 3 + Element Plus", "需要表单验证", "需要页面跳转"],
  "complexity": "simple",
  "estimated_modules": 1
}
```

**输入2：代码片段（新增 v1.1）**
```
[粘贴现有 api/auth.ts 内容]
"在现有代码基础上新增用户登录页面，调用此 API"
```
**输出2**：
```json
{
  "raw_input": "在现有代码基础上新增用户登录页面...",
  "input_type": "code_snippet",
  "code_snippet_analysis": {
    "detected_api_calls": [
      { "function": "login", "params": ["username", "password"], "file": "api/auth.ts" }
    ],
    "new_features_from_snippet": ["复用现有 login API", "新增登录页面组件"]
  },
  "complexity": "simple",
  "estimated_modules": 1
}
```

**输入3：API 文档片段（新增 v1.1）**
```
"新增登录 API 调用：
POST /api/auth/login
Request: { username: string, password: string }
Response: { token: string, userId: string }"
```
**输出3**：
```json
{
  "raw_input": "新增登录 API 调用...",
  "input_type": "api_spec",
  "api_spec_analysis": {
    "detected_endpoints": [
      { "method": "POST", "path": "/api/auth/login", "request_fields": ["username", "password"], "response_fields": ["token", "userId"] }
    ],
    "new_endpoints": ["/api/auth/login"],
    "auth_requirements": ["JWT token"]
  },
  "extracted_features": ["登录", "POST请求", "JWT认证"],
  "complexity": "simple"
}
```

## 注意事项
- 不验证需求合理性，仅提取信息
- 不扫描任何项目文件
- 所有提取基于关键词匹配和语义分析
- 代码片段分析仅识别 API 调用模式和已存在的数据结构（**增强 v1.1**）
- API 文档片段分析提取端点定义和认证需求（**新增 v1.1**）

## 版本
v1.1 - 改进版：新增代码片段分析、API文档片段分析、细化为6种input_type