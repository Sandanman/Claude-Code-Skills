# Code Generator v1.2 - 快速使用指南

## 概述

Code Generator 是一个智能代码生成主skill，根据需求文档或需求描述自动生成符合项目规范的代码。**v1.2 新增 multi-scenario-adapter 智能适配器**，自动识别需求类型并选择最优执行路径。

## 快速开始

### 触发方式

当用户需要根据需求开发代码、实现功能模块或编写函数时自动触发：

- "根据需求写代码"
- "实现这个功能"
- "生成代码"
- "写一个函数/组件/模块"
- "按照需求文档开发"
- "帮我实现"

### 基本使用

```bash
# 用户输入需求
帮我实现一个用户登录组件，包含用户名、密码输入框和登录按钮

# 系统自动执行
code-generator skill → 分析需求 → 检测技术栈 → 生成代码
```

---

## 文件结构

```
.claude/skills/code-generator/
├── SKILL.md                              # 主skill定义（v1.2）
├── README.md                             # 快速使用指南
└── atomic-skills/                        # 原子skill目录
    ├── requirement-reader/               # 需求读取
    │   └── SKILL.md
    ├── requirement-analysis/             # 需求分析
    │   └── SKILL.md
    ├── tech-stack-detection/             # 技术栈检测
    │   └── SKILL.md
    ├── code-design/                      # 代码设计
    │   └── SKILL.md
    ├── code-generation/                  # 代码生成
    │   └── SKILL.md
    ├── module-integration/              # 模块整合
    │   └── SKILL.md
    ├── code-validation/                 # 代码验证
    │   └── SKILL.md
    ├── documentation-update/            # 文档更新
    │   └── SKILL.md
    └── multi-scenario-adapter/          # 多场景适配器（NEW v1.2）
        └── SKILL.md
```

---

## 4种处理场景

### 场景1：标准输入模式（优先）

**触发条件**：存在 `requirements.json`（由 requirement-generator 生成）

**执行路径**：
```
requirement-reader → multi-scenario-adapter → tech-stack-detection → code-design →
code-generation → module-integration（仅多模块）→ code-validation → documentation-update
```

**特点**：
- 跳过 requirement-analysis（已在 requirement-generator 完成）
- 技术栈优先从 requirements.json 的 project_context 读取
- 直接复用 api_spec 和 ui_components

**示例**：
```json
// requirements.json 存在
{
  "project_context": { "frontend_framework": "vue3", ... },
  "modules": [...],
  "api_spec": {...},
  "ui_components": [...]
}
```

---

### 场景2：简单需求模式

**触发条件**：无 requirements.json，且需求简单（< 50字，单功能点）

**执行路径**：
```
requirement-reader → requirement-analysis → tech-stack-detection → code-design →
code-generation → code-validation → documentation-update
```

**特点**：
- 快速处理单功能需求
- 跳过 module-integration（单模块）
- 扫描项目文件获取技术栈

**示例**：
- "写一个函数，将 ISO 时间字符串格式化为 YYYY-MM-DD"
- "实现一个 flex 布局的盒子，水平居中"
- "写一个工具函数判断两个数组是否相等"

---

### 场景3：复杂/多模块需求模式

**触发条件**：无 requirements.json，且需求复杂（> 100字，多功能点或多模块）

**执行路径**：
```
requirement-reader → requirement-analysis → tech-stack-detection → code-design →
code-generation → module-integration → code-validation → documentation-update
```

**特点**：
- 必须执行 requirement-analysis 分析多个功能点
- 必须执行 module-integration 整合多模块
- 扫描项目文件获取技术栈

**示例**：
- "实现一个会议管理系统，包含创建、列表、详情三个模块"
- "实现用户管理系统，支持登录、注册、权限管理"

---

### 场景4：复杂需求询问标准化

**触发条件**：检测到复杂需求，询问用户是否需要标准化

**执行路径**：
```
检测复杂需求 → 询问用户
    ├─ 选择"是" → 执行 requirement-generator → code-generator（场景1）
    └─ 选择"否" → code-generator（场景3）
```

**提示示例**：
```
检测到这是一个复杂需求，是否需要先执行 requirement-generator 生成标准化文档？
1. 是 - 执行 requirement-generator 生成 requirements.json
2. 否 - 直接分析需求（推荐用于临时开发）
```

---

## 示例用法

### 示例1：简单需求

**用户输入**：
```
帮我实现一个 MeetingCard 组件，显示会议标题、时间、状态，提供加入按钮
```

**执行流程**：
1. multi-scenario-adapter 识别为"简单需求"
2. requirement-reader 检测无 requirements.json
3. requirement-analysis 快速分析单一功能点
4. tech-stack-detection 扫描项目获取技术栈
5. code-design 设计 MeetingCard 组件
6. code-generation 生成代码
7. code-validation 验证代码
8. documentation-update 添加注释

**输出**：
```vue
<!-- MeetingCard.vue -->
<template>
  <div class="meeting-card">
    <h3>{{ meeting.title }}</h3>
    <div class="meeting-time">{{ formatDate(meeting.startTime) }}</div>
    <div class="meeting-status">{{ statusText }}</div>
    <el-button type="primary" @click="handleJoin">加入会议</el-button>
  </div>
</template>
```

---

### 示例2：复杂需求（需要标准化）

**用户输入**：
```
实现一个会议管理系统，包含以下功能：
1. 会议创建：创建会议、设置标题、开始时间、结束时间
2. 会议列表：展示所有会议，支持按状态筛选
3. 会议详情：显示会议详情、编辑、删除、加入会议
```

**执行流程**：
1. multi-scenario-adapter 识别为"复杂需求/多模块"
2. 询问用户是否需要标准化
3. 用户选择"是" → 执行 requirement-generator
4. requirement-generator 生成 requirements.json
5. code-generator 读取 requirements.json（场景1）
6. 自动执行完整流程
7. module-integration 整合三个模块

**输出**：
```
src/views/meeting/Create.vue      # 会议创建
src/views/meeting/List.vue        # 会议列表
src/views/meeting/Detail.vue      # 会议详情
src/api/meeting.js               # API封装
src/types/meeting.js             # 类型定义
src/router/meeting.js            # 路由配置
src/stores/meeting.js            # 状态管理
```

---

### 示例3：复杂需求（不标准化）

**用户输入**：
```
实现会议列表功能，支持分页、筛选、排序
```

**执行流程**：
1. multi-scenario-adapter 识别为"复杂需求"
2. 用户选择"否"（直接处理）
3. requirement-analysis 分析多个功能点
4. code-design 重新设计组件
5. code-generation 生成代码
6. code-validation 验证代码

---

## 技术栈检测

### 优先读取顺序

1. **requirements.json 的 project_context**（最高优先级）
2. **project_context.json**（项目根目录）
3. **扫描项目文件**（兜底）

### project_context.json 示例

```json
{
  "frontend_framework": "vue3",
  "ui_library": {
    "name": "element-plus",
    "version": "2.2.31"
  },
  "project_structure": {
    "components_dir": "src/components",
    "views_dir": "src/views"
  },
  "code_style": {
    "has_style_guide": true,
    "style_guide_path": "./CODE_STYLE.md"
  }
}
```

---

## 9个原子skill

| 序号 | 名称 | 描述 | 场景 |
|------|------|------|------|
| 1 | multi-scenario-adapter | 智能识别需求类型，选择执行路径 | 全部 |
| 2 | requirement-reader | 读取 requirements.json 或分析文本 | 全部 |
| 3 | requirement-analysis | 解析需求，提取功能点和模块 | 场景2/3 |
| 4 | tech-stack-detection | 检测项目技术栈 | 全部 |
| 5 | code-design | 设计代码结构 | 全部 |
| 6 | code-generation | 生成代码文件 | 全部 |
| 7 | module-integration | 整合多模块代码 | 场景3（多模块） |
| 8 | code-validation | 验证代码正确性 | 全部 |
| 9 | documentation-update | 添加完整注释 | 全部 |

---

## 与其他skill的协作

### 依赖 requirement-generator

当检测到复杂需求时：
1. code-generator 提示用户是否执行 requirement-generator
2. 用户选择"是"后，requirement-generator 生成 requirements.json
3. code-generator 读取 requirements.json 执行场景1

### 依赖 scan-object-info

技术栈检测时：
1. 优先读取 requirements.json 的 project_context
2. 次优先读取 project_context.json（由 scan-object-info 生成）
3. 兜底扫描项目文件

---

## 注意事项

1. **优先使用 requirements.json**：存在时跳过 requirement-analysis，直接复用
2. **技术栈优先从 project_context 读取**：避免重复扫描
3. **智能场景适配**：multi-scenario-adapter 自动选择最优路径
4. **CODE_STYLE.md**：如果项目存在 CODE_STYLE.md，代码生成会严格遵循
5. **多模块整合**：多模块需求必须执行 module-integration 确保一致性

---

## 版本信息

- **版本**：1.2
- **发布日期**：2026-05-21
- **原子skill数量**：9个（新增 multi-scenario-adapter）
- **主要改进**：
  - 新增 multi-scenario-adapter 智能适配器
  - 4场景智能路由
  - 改进 tech-stack-detection 从 project_context.json 优先读取
  - 改进与 requirement-generator 的协作流程