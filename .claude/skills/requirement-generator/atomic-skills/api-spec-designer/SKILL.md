---
name: api-spec-designer
description: 根据需求设计REST API接口规范，定义请求/响应格式和认证方式，不绑定任何后端技术栈。在需求分析后自动执行。
---

# API Spec Designer 原子 Skill

## 概述
根据需求分析结果，设计标准的REST API接口规范，定义请求参数、响应格式、状态码和认证方式，为 code-generator 提供后端接口蓝图。

## 核心能力
- 设计REST API端点
- 定义HTTP方法、路径、请求体
- 定义响应格式（成功/失败）
- 识别认证需求（JWT、Session等）
- 识别是否复用现有API（**增强 v1.1**）
- 输出标准化API规格

## 输入
requirement-analysis 输出的需求分析结果
requirement-decomposition 输出的模块分解
api_spec_analysis（来自 requirement-input-processor，**新增 v1.1**）

## 输出
API规格设计结果，包含以下内容：

```json
{
  "endpoints": [
    {
      "method": "POST",
      "path": "/api/login",
      "description": "用户登录接口",
      "request": {
        "username": "string",
        "password": "string"
      },
      "response": {
        "success": {
          "code": 0,
          "data": {
            "token": "string",
            "userId": "string"
          }
        },
        "error": {
          "code": 401,
          "message": "用户名或密码错误"
        }
      },
      "auth_required": false,
      "reuse_existing": false,
      "reuse_from": null,
      "source": "requirement"
    }
  ],
  "api_summary": {
    "total_endpoints": 1,
    "new_endpoints": 1,
    "reuse_endpoints": 0,
    "auth_protocols": ["none"],
    "data_types": ["string"]
  }
}
```

## 设计原则
- **RESTful设计**：使用名词、标准HTTP方法
- **无状态**：不依赖Session
- **JSON格式**：统一使用JSON
- **明确响应**：区分成功/失败结构
- **版本控制**：不包含版本号（由项目决定）

## HTTP方法映射
| 操作 | HTTP方法 | 路径示例 |
|------|----------|----------|
| 新建 | POST | /api/users |
| 查询列表 | GET | /api/users |
| 查询详情 | GET | /api/users/:id |
| 更新 | PUT | /api/users/:id |
| 部分更新 | PATCH | /api/users/:id |
| 删除 | DELETE | /api/users/:id |

## 请求体设计规范
- 使用JSON对象
- 字段使用小驼峰命名
- 类型：string、number、boolean、object、array
- 必填字段标注

## 响应设计规范

### 成功响应
```json
{
  "code": 0,
  "data": { ... }
}
```
- `code`: 0 表示成功，非0表示错误
- `data`: 返回数据对象

### 错误响应
```json
{
  "code": 401,
  "message": "未授权"
}
```
- `code`: HTTP状态码或自定义错误码
- `message`: 错误信息

## 认证方式
- `auth_required`: true/false
- `auth_protocols`: ["none", "jwt", "session", "oauth"]

## reuse_existing 判定（**增强 v1.1**）
当 input_type 为 `code_snippet` 时：
- 从 code_snippet_analysis 中检测已存在的 API 函数
- 如果新功能调用已存在的 API，标记 `reuse_existing: true`，并设置 `reuse_from`
- 避免生成重复的 API 设计

## 执行逻辑
1. 接收需求分析结果和 api_spec_analysis（**增强 v1.1**）
2. 根据模块类型判断是否需要API
3. **如果 api_spec_analysis 存在，优先使用其定义的端点（新增 v1.1）**
4. 为每个模块创建API端点
5. 定义HTTP方法、路径、请求体
6. 定义响应格式
7. 判断是否需要认证
8. **判断是否复用现有 API（新增 v1.1）**
9. 输出API规格

## 依赖关系
- 依赖：requirement-analysis + requirement-decomposition

## 完成标准
1. 为每个需要API的模块创建端点
2. 正确使用HTTP方法
3. 定义请求参数和类型
4. 定义成功/失败响应格式
5. 正确判断 auth_required
6. **标记 reuse_existing（如适用）（新增 v1.1）**
7. 输出完整的JSON格式数据

## 示例

**输入1**：需求为"实现用户登录功能"
```json
{
  "api_spec_analysis": null
}
```

**输出1**：
```json
{
  "endpoints": [
    {
      "method": "POST",
      "path": "/api/login",
      "description": "用户登录接口",
      "request": { "username": "string", "password": "string" },
      "response": {
        "success": { "code": 0, "data": { "token": "string", "userId": "string" } },
        "error": { "code": 401, "message": "用户名或密码错误" }
      },
      "auth_required": false,
      "reuse_existing": false,
      "source": "requirement"
    }
  ]
}
```

**输入2**：需求为"在现有代码基础上新增登录页面"，api_spec_analysis 检测到已存在 login API
```json
{
  "api_spec_analysis": {
    "detected_api_calls": [{ "function": "login", "file": "api/auth.ts" }],
    "new_endpoints": []
  }
}
```

**输出2**：
```json
{
  "endpoints": [],
  "api_summary": {
    "total_endpoints": 0,
    "new_endpoints": 0,
    "reuse_endpoints": 0,
    "reuse_details": ["login API 已存在于 api/auth.ts"]
  }
}
```

## 注意事项
- 不假设后端技术栈（Node.js、Java、Python等）
- 所有设计面向前端调用者
- 保持简单，不设计复杂逻辑
- 当 api_spec_analysis 存在时，优先尊重已定义的端点（**增强 v1.1**）

## 版本
v1.1 - 改进版：增强与 api_spec_analysis 的整合，新增 reuse_existing 判定