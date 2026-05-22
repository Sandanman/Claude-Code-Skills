---
name: documentation-update
description: 根据代码优化结果，更新相关文档（注释、README、API文档），确保文档与代码保持同步。在优化验证后执行
---

# Documentation Update 原子Skill

## 概述
根据代码优化结果，更新相关文档（注释、README、API文档），确保文档与代码保持同步。

## 核心能力
- 更新函数/组件注释
- 更新README中的使用示例
- 更新API文档
- 更新配置文件说明
- 保持文档与代码一致性

## 输入
optimization-verification输出的优化验证报告

## 输出
文档更新清单：

```markdown
# 文档更新清单

## 更新目标
同步更新src/components/MeetingCard.vue优化后的文档

## 更新内容

### 1. 组件注释更新

**文件**：src/components/MeetingCard.vue

**更新后**：
```vue
<!--
  MeetingCard 组件 - 优化版本 (2026-05-21)

  功能：
  - 显示会议基本信息
  - 提供加入会议功能
  - 安全地渲染会议描述（已修复XSS风险）

  优化亮点：
  - 使用computed计算属性优化日期格式化
  - 拆分大函数为多个小函数
  - 修复XSS安全风险
-->
```

### 2. 组件API文档更新

**文件**：src/components/MeetingCard.vue

**更新后**：
```js
/**
 * MeetingCard 组件属性
 * @typedef {Object} MeetingCardProps
 * @property {Object} meeting - 会议信息对象
 */
const props = defineProps({
  meeting: {
    type: Object,
    required: true,
    validator: (value) => {
      return value &&
        value.id &&
        value.title &&
        typeof value.hasPassword === 'boolean'
    }
  }
})
```

### 3. README文档更新

**文件**：README.md

**更新后**：
```markdown
## MeetingCard 组件

用于显示会议信息和加入会议功能。已优化为更安全、更高效、更可维护的版本。

### 使用示例
```vue
<template>
  <MeetingCard :meeting="meeting" />
</template>
```

### 更新说明
- **2026-05-21 优化版本**：
  - 修复XSS安全风险
  - 日期格式化使用computed计算属性
  - handleJoinMeeting拆分为多个小函数
```

## 更新清单
| 文件 | 更新内容 | 状态 |
|------|----------|------|
| src/components/MeetingCard.vue | 组件注释更新 | 完成 |
| src/components/MeetingCard.vue | 组件API文档更新 | 完成 |
| README.md | 使用示例和更新说明 | 完成 |

## 文档变更摘要
- 安全更新：修复XSS风险
- 性能说明：优化效果文档化
- API变更：明确属性类型和验证规则

## 验证
- 所有文档更新与代码变更一致
- 无文档遗漏
- 文档格式符合项目规范
```

## 执行逻辑
1. 接收optimization-verification的验证报告
2. 阅读优化后的代码文件
3. 识别需要更新的文档（组件注释、README、API文档）
4. 为每个文档生成更新内容
5. 应用文档修改
6. 输出完整的文档更新清单

## 依赖关系
- 依赖：optimization-verification（必须有完整的验证报告）
- 被依赖：无（最后一个原子skill）

## 完成标准
1. 组件注释已更新（包含优化亮点说明）
2. README使用示例已更新
3. API文档（如有）已更新
4. 所有更新与代码变更保持一致
5. 输出完整的文档更新清单

## 错误处理
- **文档文件不存在**：跳过该文档并记录
- **文档格式不符合规范**：记录但不阻塞整个流程

## 注意事项
- 文档更新必须反映代码变更
- 组件注释应包含优化亮点说明
- README应更新使用示例和注意事项

## 原子skill位置
./.claude/skills/code-optimizer/atomic-skills/documentation-update/SKILL.md