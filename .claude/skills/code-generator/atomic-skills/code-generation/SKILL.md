---
name: code-generation
description: 根据设计文档和 CODE_STYLE.md 规范，生成具体代码文件，支持 Vue/React/JavaScript/TypeScript 等多种类型。在 code-design 之后执行。
---

# Code Generation 原子Skill v1.2

## 概述

根据代码设计文档和项目代码规范，生成具体的代码文件。支持多种文件类型（Vue/React/JavaScript/TypeScript），自动添加注释，遵循项目现有结构和规范。

## 核心能力

- 生成Vue组件（.vue）
- 生成React组件（.jsx/.tsx）
- 生成JavaScript/TypeScript文件
- 生成API封装文件
- 生成路由配置文件
- 生成类型定义文件
- 生成状态管理文件（Pinia/Redux）
- 生成工具函数文件
- 自动添加注释

## 输入

- **multi-scenario-adapter 输出**：包含场景类型
- **code-design 输出**：包含代码设计文档
- **tech-stack-detection 输出**：包含技术栈检测报告

## 输出

代码生成清单和具体代码文件：

```markdown
# 代码生成清单 v1.2

## 生成概览
- **生成时间**：2026-04-08 20:00:30
- **场景类型**：场景1-标准输入/场景2-简单需求/场景3-复杂需求
- **需求类型**：[单模块/多模块]
- **技术栈**：Vue 3 + JavaScript
- **文件数量**：[X个]
- **数据来源**：requirements_json | free_text_analysis

## 生成的文件列表

### 文件1：[文件路径]
- **类型**：[Vue组件/JS函数/类型定义等]
- **大小**：[行数]
- **生成状态**：✅ 成功
- **功能描述**：[简短描述]

### 文件2：[文件路径]
- **类型**：[Vue组件/JS函数/类型定义等]
- **大小**：[行数]
- **生成状态**：✅ 成功
- **功能描述**：[简短描述]

## 代码片段示例

### [文件名].vue
```vue
<!--
  MeetingCard 组件
  显示会议基本信息，提供加入会议功能

  Props:
  - meeting: Meeting对象，包含会议详情

  Emits:
  - join: 用户点击加入会议时触发

  使用示例：
  <MeetingCard :meeting="meeting" @join="handleJoin" />
-->
<template>
  <div class="meeting-card">
    <h3 class="meeting-title">{{ meeting.title }}</h3>
    <div class="meeting-time">
      {{ formatDate(meeting.startTime) }} - {{ formatDate(meeting.endTime) }}
    </div>
    <div class="meeting-status">
      <span :class="statusClass">{{ statusText }}</span>
    </div>
    <el-button
      type="primary"
      @click="handleJoin"
      :disabled="meeting.status === 'completed'"
    >
      加入会议
    </el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/date'

// Props定义
const props = defineProps({
  meeting: {
    type: Object,
    required: true
  }
})

// Emits定义
const emit = defineEmits(['join'])

// 计算属性：状态样式
const statusClass = computed(() => {
  const statusMap = {
    pending: 'status-pending',
    ongoing: 'status-ongoing',
    completed: 'status-completed'
  }
  return statusMap[props.meeting.status]
})

// 计算属性：状态文本
const statusText = computed(() => {
  const textMap = {
    pending: '未开始',
    ongoing: '进行中',
    completed: '已结束'
  }
  return textMap[props.meeting.status]
})

// 处理加入会议
const handleJoin = () => {
  emit('join', props.meeting.id)
}
</script>

<style scoped>
.meeting-card {
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
```

## 生成统计

| 类型 | 数量 | 总行数 |
|------|------|--------|
| Vue组件 | 2 | 150 |
| JavaScript文件 | 3 | 80 |
| 配置文件 | 1 | 30 |
| **总计** | **6** | **260** |

## 遵循的代码规范

- ✅ 使用 2空格缩进
- ✅ 使用单引号
- ✅ 不使用分号
- ✅ 组件命名 PascalCase
- ✅ 变量命名 camelCase
- ✅ 使用箭头函数

## 下一步建议

- 场景1/3：执行 module-integration 整合多模块代码
- 验证生成代码的语法正确性
- 检查是否符合项目规范
- 测试组件功能是否完整
```

## 执行逻辑

### 步骤1：准备生成环境

1. 接收 code-design 输出的设计文档
2. 读取 tech-stack-detection 输出的技术栈报告
3. 读取 CODE_STYLE.md（如果存在）
4. 确定生成文件列表

### 步骤2：生成代码文件

**场景1（标准输入）**：
1. 严格按照 api_spec 生成API封装
2. 严格按照 ui_components 生成UI组件
3. 使用 project_context 中的目录结构
4. 生成所有设计文档中定义的文件

**场景2（简单需求）**：
1. 根据设计文档生成单一组件/函数
2. 遵循项目现有目录结构
3. 生成必要的辅助文件

**场景3（复杂需求）**：
1. 按模块生成各自的组件
2. 生成共享类型定义
3. 生成共享API封装
4. 生成共享工具函数
5. 生成路由配置
6. 生成状态管理

### 步骤3：自动添加注释

1. Vue组件：添加顶部注释块（Props、Emits、使用示例）
2. 函数：添加JSDoc注释（参数、返回值、示例）
3. 类型定义：添加接口注释和字段注释
4. API封装：添加每个接口的功能说明

### 步骤4：输出生成清单

1. 列出所有生成的文件
2. 提供关键代码片段示例
3. 统计生成的文件数量和行数
4. 标记数据来源

## 依赖关系

- **依赖**：multi-scenario-adapter、code-design、tech-stack-detection
- **被依赖**：module-integration（场景3多模块）、code-validation

## 完成标准

1. ✅ 生成所有设计文档中定义的文件
2. ✅ 每个文件都有完整注释
3. ✅ 代码符合 CODE_STYLE.md 规范
4. ✅ 代码符合项目技术栈
5. ✅ 输出生成清单和代码片段示例
6. ✅ 文件路径和命名符合项目结构
7. ✅ 语法正确，无明显错误

## 错误处理

- **文件已存在**：提示用户确认是否覆盖
- **目录不存在**：自动创建目录
- **语法错误**：记录错误，等待 code-validation 修复
- **规范冲突**：遵循 CODE_STYLE.md，记录差异

## 注释规范

### Vue组件注释
```vue
<!--
  组件名称
  组件功能描述

  Props:
  - propName: 类型 - 描述

  Emits:
  - eventName: 描述

  使用示例：
  <ComponentName :prop="value" />
-->
```

### 函数注释
```js
/**
 * 函数名称
 * 功能描述
 *
 * @param {类型} paramName - 参数描述
 * @returns {类型} 返回值描述
 *
 * @example
 * const result = functionName(param)
 */
```

### 类型定义注释
```ts
/**
 * 类型名称
 * 类型描述
 */
export interface TypeName {
  /** 字段描述 */
  fieldName: string
}
```

## 示例

**输入**：code-design 设计文档（会议管理系统，多模块，场景3）

**输出**：
- src/views/meeting/Create.vue（会议创建组件）
- src/views/meeting/List.vue（会议列表组件）
- src/views/meeting/Detail.vue（会议详情组件）
- src/api/meeting.js（会议API封装）
- src/types/meeting.js（会议类型定义）
- src/router/meeting.js（会议路由配置）
- src/utils/date.js（工具函数）
- 完整的生成清单报告

## 注意事项

- 代码必须可运行，无语法错误
- 注释必须清晰完整
- 严格遵循项目规范
- 文件命名和路径符合项目结构
- 优先使用项目已有工具函数
- 场景3必须生成共享资源供 module-integration 整合

## 原子skill位置

`.claude/skills/code-generator/atomic-skills/code-generation/SKILL.md`