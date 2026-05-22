---
name: api-doc-extraction
description: 从代码中提取API定义（endpoints、params、return values），在需要生成API文档时触发
---

# API Doc Extraction

## 概述

API Doc Extraction 负责从项目代码中提取 API 接口定义信息，包括 REST API 路由、GraphQL Schema、前端请求封装等。提取的信息包括：HTTP 方法、URL 路径、请求参数（path/query/body）、响应格式、认证方式、错误码等。输出格式支持 Markdown、OpenAPI/Swagger、Postman Collection。

## 核心能力

- **REST API 路由解析**: 从 vue-router、react-router、Express 路由配置中提取 API 端点
- **请求参数提取**: 解析 TypeScript 类型定义，提取请求参数和响应类型
- **HTTP 方法识别**: 识别 GET/POST/PUT/DELETE/PATCH 方法
- **认证信息提取**: 从 middleware、decorator 中提取认证和授权信息
- **错误码收集**: 从业务代码中收集 HTTP 状态码和业务错误码
- **API 文档生成**: 生成 Markdown、OpenAPI JSON/YAML、Postman Collection 格式

## 输入

- **SourceCodeContext**: 项目源码目录
- **ApiFramework**: API 框架类型（vue-router/express/nest/axios，已自动检测可覆盖）
- **ExtractionFormat**: 输出格式（markdown/openapi/json/yaml/postman）
- **ApiScope**: 扫描范围（全部/指定模块）

## 输出

- **ApiDocContent**: 提取的 API 文档内容
- **ApiEndpointsList**: API 端点列表（结构化数据）
- **OpenApiSpec**: OpenAPI 3.0 规范文档（可选格式）
- **ApiSchema**: API 数据模型 schema（用于 type generation）

**输出示例格式**:
```yaml
apiEndpoints:
  - path: /api/meetings
    method: POST
    description: 创建会议
    auth: Bearer Token
    request:
      body:
        type: CreateMeetingDTO
        fields:
          - name: title
            type: string
            required: true
          - name: startTime
            type: ISO8601
            required: true
    response:
      200:
        type: Meeting
        description: 创建成功
      400:
        type: ErrorResponse
        description: 参数错误
      401:
        description: 未授权
```

## 执行逻辑

1. **框架检测**: 检测项目使用的 API 框架（Express/Nest/Vue Router 等）
2. **路由文件扫描**: 找到所有路由定义文件（router/index.ts、routes/*.ts 等）
3. **路由解析**: 解析路由定义，提取 path、method、handler
4. **类型提取**: 读取 TypeScript 类型定义，提取请求/响应类型
5. **认证提取**: 解析 middleware 配置，提取认证要求
6. **文档生成**: 按选定格式生成 API 文档
7. **输出保存**: 保存到 docs/api.md 或 docs/openapi.json

## 依赖关系

- 依赖: 无
- 被依赖: doc-format-conversion

## 完成标准

1. 所有 API 端点都有对应的文档条目
2. 每个端点包含：path、method、description、parameters、response
3. 请求参数类型和必需性标注正确
4. 输出格式符合 OpenAPI 3.0 规范（当选择 openapi 格式时）
5. 生成 `docs/api.md` 或 `docs/openapi.json` 并保存