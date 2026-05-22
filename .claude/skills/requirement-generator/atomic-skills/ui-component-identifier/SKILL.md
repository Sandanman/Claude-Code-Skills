---
name: ui-component-identifier
description: 识别通用UI组件类型（form、input、button、table等），不绑定具体组件库，为code-generator提供组件清单。在功能流程设计后自动执行。
---

# UI Component Identifier 原子 Skill

## 概述
基于需求描述和功能流程，识别所需的通用UI组件类型（非具体库），输出语义化的组件清单（form、input、button、table等），供 code-generator 映射到具体组件库。

## 核心能力
- 识别通用组件类型（form、button、table、card等）
- 关联组件用途（登录表单、用户列表表格）
- 提取组件的字段和属性
- 不绑定任何具体UI库

## 输入
function-flow-designer 输出的流程设计（含 sub_flow）
requirement-decomposition 输出的模块分解

## 输出
UI组件识别结果，包含以下内容：

```json
{
  "ui_components": [
    {
      "type": "form",
      "module": "用户登录",
      "purpose": "用户登录表单",
      "fields": [
        { "name": "username", "type": "text", "required": true, "label": "用户名" },
        { "name": "password", "type": "password", "required": true, "label": "密码" }
      ],
      "buttons": [
        { "text": "登录", "type": "primary", "action": "submit" }
      ]
    },
    {
      "type": "table",
      "module": "用户管理",
      "purpose": "用户列表展示",
      "columns": [
        { "field": "id", "label": "ID", "width": 80 },
        { "field": "username", "label": "用户名" },
        { "field": "email", "label": "邮箱" },
        { "field": "actions", "label": "操作", "actions": ["edit", "delete"] }
      ],
      "pagination": true,
      "selection": false
    }
  ],
  "component_types_summary": { "form": 1, "table": 1, "button": 2 },
  "interactions": ["表单提交", "表格行点击"]
}
```

## 支持的通用组件类型

| 类型 | 描述 | 对应库（示例） |
|------|------|----------------|
| `form` | 表单容器 | el-form, <Form> |
| `input` | 文本框 | el-input, <Input> |
| `password` | 密码框 | el-input type="password" |
| `button` | 按钮 | el-button, <Button> |
| `table` | 表格 | el-table, <Table> |
| `card` | 卡片 | el-card, <Card> |
| `modal` | 模态框 | el-dialog, <Modal> |
| `select` | 下拉选择 | el-select, <Select> |
| `date-picker` | 日期选择器 | el-date-picker, <DatePicker> |
| `upload` | 文件上传 | el-upload, <Upload> |
| `tree` | 树形控件 | el-tree, <Tree> |
| `tabs` | 标签页 | el-tabs, <Tabs> |
| `message` | 消息提示 | ElMessage, message |
| `pagination` | 分页器 | el-pagination, <Pagination> |

## 组件识别逻辑

### 1. Form 表单
**识别关键词**：输入、填写、提交、保存、表单
**字段识别**：
- `input` / `text` → "用户名"、"邮箱"、"标题"
- `password` → "密码"
- `select` → "选择"、"下拉"
- `date-picker` → "日期"、"时间"

### 2. Button 按钮
**识别关键词**：按钮、点击、提交、重置
**按钮类型**：
- 主要操作："登录"、"提交"、"保存" → `primary`
- 默认操作："确定"、"下一步" → `default`
- 危险操作："删除"、"取消" → `danger`
- 次要操作："重置"、"取消" → `secondary`

### 3. Table 表格
**识别关键词**：列表、表格、展示、数据
**列识别**：
- 字段名：ID、名称、时间、状态
- 操作列：编辑、删除、查看

### 4. Card 卡片
**识别关键词**：卡片、展示、详情

### 5. Modal/Dialog 弹窗
**识别关键词**：弹窗、弹出、对话框、提示

### 6. Validation Sub-flow 识别（**新增 v1.1**）
从 sub_flow 中识别验证相关的 UI 组件需求：
- validation 子流程 → 表单验证（必填提示、格式错误提示）
- confirmation 子流程 → 确认弹窗
- pagination 子流程 → 分页器

## 执行逻辑
1. 接收模块分解和流程设计结果（含 sub_flow）
2. 遍历每个模块的功能点
3. 根据关键词匹配识别组件类型
4. **从 sub_flow 中识别验证/确认相关的 UI 组件（新增 v1.1）**
5. 提取组件的字段、按钮、属性
6. 关联组件与模块
7. 汇总组件统计
8. 输出组件清单

## 依赖关系
- 依赖：function-flow-designer + requirement-decomposition

## 完成标准
1. 识别至少1种组件类型
2. 为每个组件定义用途和所属模块
3. 提取组件的字段或列定义
4. 提取按钮的文本和类型
5. **识别 sub_flow 关联的验证/确认组件（新增 v1.1）**
6. 输出完整的JSON格式数据

## 示例

**输入**：用户需求"实现登录功能，包含用户名、密码输入，登录按钮，系统进行表单验证"

**输出**：
```json
{
  "ui_components": [
    {
      "type": "form",
      "module": "用户登录",
      "purpose": "用户登录表单（含表单验证）",
      "fields": [
        { "name": "username", "type": "text", "required": true, "label": "用户名" },
        { "name": "password", "type": "password", "required": true, "label": "密码" }
      ],
      "buttons": [
        { "text": "登录", "type": "primary", "action": "submit" }
      ],
      "validation": {
        "inline_validation": true,
        "error_display": "inline",
        "required_message": "请输入用户名/密码"
      }
    }
  ],
  "component_types_summary": { "form": 1, "button": 1 },
  "interactions": ["表单提交", "表单验证"]
}
```

## 注意事项
- 输出的是**通用类型**，不绑定具体组件库
- 具体库的映射由 code-generator 根据 project-context 决定
- 所有字段、按钮都应包含 label 或 text 属性
- 按模块组织组件，便于后续生成
- **validation 子流程对应的验证 UI 应作为 form 的 validation 属性输出（新增 v1.1）**

## 版本
v1.1 - 改进版：增强与 sub_flow 的整合，识别验证/确认相关 UI 组件