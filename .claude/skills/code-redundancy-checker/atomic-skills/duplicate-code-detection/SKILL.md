---
name: duplicate-code-detection
description: 检测文件内和跨文件的重复代码（含 Vue SFC 三段式分析和 TypeScript 类型别名检测），识别完全相同的代码块和相似代码（相似度>70%），为冗余清理提供精准位置和 severity 级别。在冗余检测流程的第一步执行。
---

# Duplicate Code Detection 原子 Skill（改进版 v1.1）

## 概述
检测目标文件或目录中的重复代码，包括文件内重复、跨文件重复、Vue SFC 专项重复和 TypeScript 类型重复。识别完全相同的代码块以及高度相似的代码片段（相似度 > 70%），为后续清理提供精确的行号、代码位置和 severity 级别。

## 核心能力
- 文件内重复代码检测（同文件中的重复代码块）
- 跨文件重复代码检测（不同文件间的重复代码）
- Vue SFC 三段式检测（`<template>` 模板重复 / `<script>` 逻辑重复 / `<style>` 样式重复）
- TypeScript 类型重复检测（重复的 type alias / interface / enum 定义）
- 相似代码检测（相似度 > 70% 的代码片段）
- 重复次数统计（每个重复代码块出现的次数）
- 相似度评分（精确匹配 / 高度相似 / 中度相似）
- 支持结构化去重（函数体、方法体、代码片段）
- **Severity 分级**（high/medium/low）
- **fix-suggestion 生成**

## 检测维度

### 1. 文件内重复
- 检测同一文件中连续 N 行（默认 N=5）以上的重复代码
- 识别重复的 if/else 分支逻辑
- 识别重复的循环体
- 识别重复的 try/catch 块
- 识别 Vue SFC 中重复的 template 片段和 script 方法

### 2. 跨文件重复
- 检测不同文件间的完全相同代码块（>= 5行）
- 检测不同文件间的高度相似代码（相似度 > 90%）
- 识别可提取为公共工具函数的重复代码
- 检测重复的组件逻辑
- 检测 TypeScript 项目中重复的类型定义

### 3. Vue SFC 专项检测
- **template 重复**：检测 .vue 文件中重复的模板片段（如相同的表格列定义）
- **script 重复**：检测 methods/computed 中的重复逻辑
- **style 重复**：检测 scoped 样式中的重复规则
- 分别统计三段式的重复率

### 4. TypeScript 类型重复检测
- 检测重复的 `type` 别名定义
- 检测重复的 `interface` 定义
- 检测重复的 `enum` 定义
- 检测可提取到公共 `types/` 目录的重复类型

### 5. 相似代码检测
- **精确匹配**（相似度 100%）：代码完全相同
- **高度相似**（相似度 70%~99%）：仅有变量名、注释差异
- **中度相似**（相似度 50%~69%）：结构相同，逻辑相似

## Severity 判定规则
- **HIGH**：跨文件精确匹配（100%），重复次数 >= 3，代码行数 >= 10
- **MEDIUM**：文件内精确匹配，或跨文件高度相似（>90%）
- **LOW**：中度相似（50-69%），代码行数 < 5

## fix-suggestion 示例
```
跨文件重复代码 fix-suggestion:
1. 将重复代码提取到新文件 `src/utils/date.ts`
2. 在 `src/utils/formatter.ts` 中添加: import { formatDate } from './date'
3. 删除 `src/utils/formatter.ts` 中的重复代码（第 8-19 行）
```

## 输入
目标文件或目录路径（支持 glob 模式，如 `src/**/*.ts`）

## 输出
重复代码清单（含 severity 级别和 fix-suggestion）：

```markdown
# 重复代码检测报告 v1.1

## 检测概览
- 扫描文件数：12
- 检测到重复代码块：5
- 文件内重复：2
- 跨文件重复：3
- 总体重复率：8.5%

## Severity 分布
- HIGH: 2
- MEDIUM: 2
- LOW: 1

## 详细清单

### 1. [HIGH] 跨文件重复 - utils/formatter.ts ↔ utils/text.ts
**相似度**：100%（精确匹配）
**重复行数**：12行（第 3-14 行）
**重复次数**：2
**Severity**：HIGH
**代码片段**：
```typescript
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```
**fix-suggestion**：
1. 在 `src/utils/date.ts` 中保留该函数
2. 从 `src/utils/formatter.ts` 中删除重复代码（第 8-19 行）
3. 在 `src/utils/formatter.ts` 中添加：`import { formatDate } from './date'`
4. 预估收益：减少 12 行重复代码

### 2. [MEDIUM] Vue SFC - src/components/A.vue (template)
**位置**：`src/components/A.vue` 第 23-29 行 与 第 45-51 行
**相似度**：100%
**重复代码**：错误信息格式化逻辑
**Severity**：MEDIUM
**fix-suggestion**：
1. 将重复模板提取为子组件 `ErrorMessage.vue`
2. 在 `A.vue` 中引用该组件

### 3. [LOW] TypeScript 类型重复 - src/types/user.ts ↔ src/types/meeting.ts
**位置**：
- `src/types/user.ts` 第 3-10 行
- `src/types/meeting.ts` 第 5-12 行
**相似度**：75%（高度相似，仅字段名不同）
**Severity**：LOW
**fix-suggestion**：
1. 将通用字段提取为 `src/types/base.ts` 中的基础 interface
2. 两个文件各自 extend 或 omit 基础 interface

...
```

## 完成标准
- 文件内重复代码：100% 识别，误报率 < 10%
- 跨文件重复代码：100% 识别，误报率 < 10%
- Vue SFC 重复：template/script/style 三段式分别检测
- TypeScript 类型重复：100% 识别 type/interface/enum 重复
- 位置精确到起始行号
- 每个重复点有 severity 级别标注
- 每个重复点有 fix-suggestion

## 支持的文件类型
- JavaScript/TypeScript (.js, .ts, .jsx, .tsx)
- Vue 组件 (.vue，含 template/script/style 三段式分析)
- 配置文件 (.json, .config.js)

## 性能目标
- 单文件扫描：< 1秒
- 1000行代码：< 5秒
- 100个文件：< 60秒

## 注意事项
- 忽略注释和空行的差异
- 忽略变量名差异进行语义比较
- 区分"故意重复"（如模板代码）和"意外重复"（需清理）
- 不修改任何代码，仅报告冗余位置
- 每个冗余点必须标注 severity 级别
- 每个冗余点必须提供 fix-suggestion

## 版本
v1.1 - 改进版：新增 Vue SFC 专项检测、TypeScript 类型检测、severity 级别、fix-suggestion