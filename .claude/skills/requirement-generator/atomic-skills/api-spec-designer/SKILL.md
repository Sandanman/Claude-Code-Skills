---
name: api-spec-designer
description: 根据需求设计REST API接口规范，定义请求/响应格式和认证方式，不绑定任何后端技术栈。在需求分析后自动执行。
---

# API Spec Designer 原子Skill

## 概述
根据需求分析结果，设计标准的REST API接口规范，定义请求参数、响应格式、状态码和认证方式，为 code-generator 提供后端接口蓝图。

## 核心能力
- 设计REST API端点
- 定义HTTP方法、路径、请求体
- 定义响应格式（成功/失败）
- 识别认证需求（JWT、Session等）
- 识别是否复用现有API
- 输出标准化API规格

## 输入
requirement-analysis输出的需求分析结果
requirement-decomposition输出的模块分解

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
          "message": "string"
        }
      },
      "auth_required": false,
      "reuse_existing": false
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

## 执行逻辑
1. 接收需求分析结果
2. 根据模块类型判断是否需要API
3. 为每个模块创建API端点
4. 定义HTTP方法、路径、请求体
5. 定义响应格式
6. 判断是否需要认证
7. 判断是否复用现有API
8. 输出API规格

## 依赖关系
- 依赖：requirement-analysis + requirement-decomposition

## 完成标准
1. ✅ 为每个需要API的模块创建端点
2. ✅ 正确使用HTTP方法
3. ✅ 定义请求参数和类型
4. ✅ 定义成功/失败响应格式
5. ✅ 正确判断 auth_required
6. ✅ 标记 reuse_existing（如适用）
7. ✅ 输出完整的JSON格式数据

## 错误处理
- **无API需求**：输出空数组
- **路径冲突**：使用资源名（如 /api/users）
- **字段缺失**：使用默认值（string）

## 示例

**输入**：需求为"实现用户登录功能，包含用户名、密码输入，登录按钮，成功后跳转首页"

**处理**：
1. requirement-analysis 判断为需要新增API
2. 模块：用户登录
3. 创建端点：POST /api/login
4. 请求体：{ username: string, password: string }
5. 响应：
   - 成功：{ code: 0, data: { token: string, userId: string } }
   - 失败：{ code: 401, message: "用户名或密码错误" }
6. 认证：false（登录接口无需认证）

**输出**：
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
      "reuse_existing": false
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

## 注意事项
- 不假设后端技术栈（Node.js、Java、Python等）
- 所有设计面向前端调用者
- 保持简单，不设计复杂逻辑
- 复用API需明确说明

## 原子skill位置
./.claude/skills/requirement-generator/atomic-skills/api-spec-designer/SKILL.md
