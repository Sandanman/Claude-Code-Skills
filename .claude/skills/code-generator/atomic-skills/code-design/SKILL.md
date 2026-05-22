---
name: code-design
description: 根据需求分析和技术栈检测结果设计代码结构。优先使用 requirements.json 中的 api_spec 和 ui_components，仅在缺失时重新设计。在 tech-stack-detection 之后执行。
---

# Code Design 原子Skill v1.2

## 概述

根据需求分析报告和技术栈检测报告，设计完整的代码结构、数据模型和接口。**优先使用 requirements.json 中的 api_spec 和 ui_components**，仅在缺失时重新设计。设计会根据需求类型（单模块/多模块）和项目技术栈进行调整。

## 核心能力

- 优先读取 requirements.json 的 api_spec 和 ui_components
- 设计组件/函数/类结构
- 设计数据模型和类型
- 设计API接口（遵循 api_spec）
- 设计UI组件（遵循 ui_components）
- 设计模块间关系
- 设计路由和状态管理
- 生成设计文档

## 输入

- **multi-scenario-adapter 输出**：包含场景类型
- **requirement-reader 输出**：包含 api_spec、ui_components、modules、flow（如有）
- **requirement-analysis 输出**：包含需求分析报告（场景2/3）
- **tech-stack-detection 输出**：包含技术栈检测报告

## 标准化输入使用策略

### api_spec 使用

- 如果 requirements.json 包含 `api_spec.endpoints`：直接使用
- 设计API封装时严格遵循 api_spec 中的 method、path、request、response
- 每个endpoint生成对应的API函数

### ui_components 使用

- 如果 requirements.json 包含 `ui_components`：直接使用
- 设计组件时严格遵循 ui_components 中的 type、purpose、fields、buttons
- 不绑定具体UI库，由 tech-stack-detection 的 ui_library 决定具体实现

### modules 使用

- 如果 requirements.json 包含 `modules`：直接使用模块划分
- 每个module对应一个独立的文件或组件

## 输出

代码设计文档：

```markdown
# 代码设计文档 v1.2

## 设计概览
- **设计时间**：2026-04-08 20:00:20
- **场景类型**：场景1-标准输入/场景2-简单需求/场景3-复杂需求
- **需求类型**：[单模块/多模块]
- **技术栈**：Vue 3 + JavaScript + Vite
- **设计目标**：实现[需求核心功能]
- **数据来源**：requirements_json | free_text_analysis

## 单模块需求设计（仅单模块执行）

### 组件/函数设计

#### 组件/函数名称：[名称]
- **类型**：[组件/函数/类]
- **位置**：[文件路径]
- **职责**：[单一职责描述]
- **输入**：[参数定义]
- **输出**：[返回值/行为]
- **状态管理**：[是否使用响应式状态]
- **依赖**：[依赖的其他组件/函数]

### 数据模型设计
- **文件**：src/types/[模块].ts
- **内容**：
  ```ts
  interface ModelName {
    field1: type;
    field2: type;
  }
  ```

### API接口设计
- **文件**：src/api/[模块].ts
- **内容**：
  ```ts
  export const api = {
    endpoint: (params) => request.method('/path', params)
  }
  ```

## 多模块需求设计（仅多模块执行）

### 模块划分

| 模块 | 功能 | 文件路径 | 依赖模块 |
|------|------|----------|----------|
| [模块1] | [功能描述] | src/views/[模块]/index.vue | [依赖模块] |
| [模块2] | [功能描述] | src/views/[模块]/index.vue | [依赖模块] |
| [模块3] | [功能描述] | src/views/[模块]/index.vue | [依赖模块] |

### 模块间关系

- **数据流**：[描述数据如何在模块间流动]
- **状态共享**：[是否共享状态，使用Pinia/全局变量]
- **路由关系**：[页面跳转关系]

### 共享资源设计

#### 共享类型定义
- **文件**：src/types/[模块].ts

#### 共享API封装
- **文件**：src/api/[模块].ts

#### 共享工具函数
- **文件**：src/utils/[工具].ts

### 路由设计
- **文件**：src/router/[模块].ts

### 状态管理设计
- **文件**：src/stores/[模块].ts

## 设计验证
- ✅ 所有功能点都已覆盖
- ✅ 输入输出明确
- ✅ 异常情况有处理
- ✅ 模块关系清晰
- ✅ 文件结构合理

## 输出示例

**输入**：多模块需求（会议管理系统）

**输出**：如上所示，完整的代码设计文档
```

## 执行逻辑

### 场景1：标准输入（requirements.json 有 api_spec 和 ui_components）

1. 从 requirement-reader 读取 ui_components、api_spec、modules、flow
2. 对照 api_spec 检查是否完整
3. 对照 ui_components 检查是否完整
4. 根据 modules 数量判断单模块/多模块
5. 根据 flow 设计模块间关系和路由（如果有）
6. 基于 ui_library 设计具体组件实现
7. 输出设计文档
8. 标记 `data_source` 为 `requirements_json`

### 场景2：简单需求（自由文本，单模块）

1. 调用 requirement-analysis 功能点分析结果
2. 基于功能点设计单一组件/函数
3. 设计数据模型和API（简化）
4. 输出设计文档
5. 标记 `data_source` 为 `free_text_analysis`

### 场景3：复杂需求（自由文本，多模块）

1. 调用 requirement-analysis 功能点分析结果
2. 设计多模块的整体结构
3. 设计共享类型、API、工具函数
4. 设计路由和状态管理
5. 输出设计文档
6. 标记 `data_source` 为 `free_text_analysis`

## 与 requirement-generator 的协同

### API设计继承

requirements.json 中的 `api_spec` 直接作为代码设计的API接口设计依据：

```json
{
  "api_spec": {
    "endpoints": [
      {
        "method": "POST",
        "path": "/api/login",
        "request": { "username": "string", "password": "string" },
        "response": {
          "success": { "code": 0, "data": { "token": "string" } },
          "error": { "code": 401, "message": "string" }
        },
        "auth_required": false
      }
    ]
  }
}
```

会被直接转换为：

```ts
export const loginAPI = {
  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns 包含token的响应对象
   */
  login: (username: string, password: string) =>
    api.post('/api/login', { username, password })
}
```

### UI组件设计继承

requirements.json 中的 `ui_components` 直接作为UI设计依据：

```json
{
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
  ]
}
```

会被转换为：

```vue
<template>
  <el-form :model="form" :rules="rules">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="form.password" type="password" />
    </el-form-item>
    <el-button type="primary" @click="handleLogin">登录</el-button>
  </el-form>
</template>
```

## 注意事项

- API设计必须严格遵循 api_spec，不得随意更改端点、参数或响应格式
- UI组件设计必须严格遵循 ui_components，字段和按钮需完整实现
- 使用 requirements.json 时，跳过需求分析，直接复用已有设计
- 仅当 api_spec 或 ui_components 缺失时，才重新设计
- 记录复用了哪些标准化信息

## 依赖关系

- **依赖**：multi-scenario-adapter、tech-stack-detection、requirement-reader（场景1）/ requirement-analysis（场景2/3）
- **被依赖**：code-generation

## 完成标准

1. ✅ 设计了所有功能点的实现方案
2. ✅ 定义了所有数据模型和类型
3. ✅ 设计了所有API接口
4. ✅ 多模块需求中定义了共享资源
5. ✅ 多模块需求中定义了路由和状态管理
6. ✅ 输出完整设计文档（markdown）
7. ✅ 符合项目技术栈和代码规范
8. ✅ 标记数据来源（requirements_json/free_text_analysis）

## 错误处理

- **需求冲突**：指出矛盾点，等待用户确认
- **技术栈不支持**：提示替代方案
- **设计过于复杂**：建议拆分功能
- **缺少信息**：提示补充需求

## 原子skill位置

`.claude/skills/code-generator/atomic-skills/code-design/SKILL.md`