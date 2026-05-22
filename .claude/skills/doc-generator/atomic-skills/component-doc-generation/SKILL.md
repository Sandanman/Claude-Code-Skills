---
name: component-doc-generation
description: 生成组件文档（props、events、slots、usage examples），在需要生成组件文档时触发
---

# Component Doc Generation

## 概述

Component Doc Generation 负责为 Vue 组件和 React 组件生成完整的文档，包括组件描述、Props 定义（类型、默认值、是否必需）、Events 事件定义、Slots 插槽说明、Exposed Methods 暴露方法、使用示例。生成的文档格式支持 Markdown（通用）、VuePress 格式、Storybook CSF 格式。

## 核心能力

- **Props 解析**: 从 TypeScript 类型定义或 PropTypes 中提取 props 完整信息
- **Events 提取**: 从 `$emit` 调用或 React onXxx props 中提取事件定义
- **Slots 提取**: 从 `<slot>` 定义中提取插槽名称和参数
- **Exposed Methods**: 从 `defineExpose` 或 `forwardRef` 中提取暴露的方法
- **使用示例生成**: 自动生成组件的典型使用代码示例
- **多格式输出**: 支持 Markdown、VuePress、Storybook CSF 格式

## 输入

- **ComponentPaths**: 需要生成文档的组件路径列表（支持目录批量处理）
- **Framework**: 组件框架（vue/react/通用，默认自动检测）
- **DocFormat**: 文档格式（markdown/vuepress/storybook）
- **IncludeExamples**: 是否包含使用示例（默认 true）
- **ScanConfig**: 扫描配置（是否扫描子目录、是否排除 test 文件）

## 输出

- **ComponentDocSet**: 组件文档集合，每个组件一份完整文档
- **ComponentIndex**: 组件索引（所有组件的快速导航）
- **ComponentExample**: 自动生成的使用示例代码

**输出示例格式**:
```yaml
components:
  - name: MeetingCard
    filePath: src/components/MeetingCard.vue
    description: 会议卡片组件，用于展示会议基本信息
    framework: vue
    props:
      - name: meeting
        type: Meeting
        required: true
        description: 会议数据对象
      - name: compact
        type: boolean
        default: false
        description: 是否以紧凑模式显示
    events:
      - name: click
        payload: MouseEvent
        description: 点击卡片时触发
      - name: delete
        payload: { meetingId: string }
        description: 删除会议时触发
    slots:
      - name: header
        description: 自定义卡片头部内容
      - name: footer
        description: 自定义卡片底部内容
    exposed:
      - name: refresh
        params: []
        returnType: void
        description: 刷新卡片数据
    example: |
      <MeetingCard :meeting="meetingData" @delete="handleDelete" />
```

## 执行逻辑

1. **组件扫描**: 扫描指定目录下的所有 Vue/React 组件文件
2. **文件解析**: 读取组件源码，解析 `<script setup>` 或 class component
3. **Props 提取**: 从 `defineProps` 或 TypeScript 类型中提取 props
4. **Events 提取**: 从 `$emit` 调用中提取事件定义
5. **Slots 提取**: 从 `<slot>` 标签中提取插槽定义
6. **Exposed 提取**: 从 `defineExpose` 中提取暴露的方法
7. **示例生成**: 基于 props 和 events 生成典型使用代码
8. **文档生成**: 生成 Markdown 格式的组件文档

## 依赖关系

- 依赖: 无
- 被依赖: doc-format-conversion

## 完成标准

1. 所有指定路径的组件都有对应文档
2. 每个组件文档包含：description、props、events、slots（字段完整）
3. Props 的 type、required、default 标注正确
4. 生成至少 1 个使用示例（每个组件）
5. 生成 `docs/components/` 目录包含所有组件文档
6. 生成 `docs/components/README.md` 作为组件索引