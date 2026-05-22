---
name: unused-code-detection
description: 检测死代码，包括未使用的export、函数、变量、import、类等，区分真未使用和条件使用，提供精确的清理建议。在冗余检测流程中与duplicate-code-detection并行执行
---

# Unused Code Detection 原子Skill

## 概述
检测目标代码中的死代码（未使用代码），包括：未使用的 export、函数、变量、常量、类、import，以及未使用的组件 props。区分"真未使用"和"条件使用/动态使用"，避免误报。

## 核心能力
- 未使用的 export 检测（exported but never imported）
- 未使用的函数/方法检测
- 未使用的变量/常量检测
- 未使用的 import 检测
- 未使用的类/接口/类型检测
- 未使用的组件 props 检测
- 未使用的样式规则检测（CSS）
- 条件使用识别（try/catch 动态 require 等）

## 检测维度

### 1. 未使用的 Export
- `export function` / `export const` / `export class` 从未被其他文件 import
- `export default` 从未被 import
- 判断方法：全局搜索所有 import 语句，匹配 export 名称

### 2. 未使用的 Import
- 已 import 但从未在代码中引用
- 已 import 但只用于类型声明（TypeScript `import type`）
- 检测到的是 `import` 语句本身冗余，不是被导入的内容

### 3. 未使用的函数/变量
- 函数定义后从未被调用
- 变量声明后从未被读取
- const/let 声明后被重新赋值但从未读取（死变量）
- 检测函数的内部调用链（call graph）

### 4. 未使用的类/接口
- class 定义后从未被实例化或继承
- interface 定义后从未被类型标注使用
- enum 成员是否全部使用

### 5. 未使用的 Props（Vue组件）
- props 定义但模板中从未使用
- props 定义但 JS/TS 代码中从未使用

### 6. 条件使用识别（避免误报）
- 通过 `try/catch` 动态 `require()`
- 通过 `window.xxx` 全局访问
- 通过 `eval()` 动态调用
- 通过字符串拼接动态 import
- 注释说明"仅为兼容性保留"等

## 算法策略
- **Call Graph（调用图）**：构建函数/变量引用关系图
- **Import/Export 匹配**：全局搜索所有 import 语句
- **类型推断**：判断变量/函数的使用状态
- **AST 分析**：抽象语法树分析精确识别作用域
- **动态引用检测**：标记潜在的动态引用避免误报

## 输入
目标文件或目录路径（支持 glob 模式）

## 输出
死代码清单，包含以下结构：

```markdown
# 死代码检测报告

## 检测概览
- 扫描文件数：12
- 检测到死代码：8
- 未使用的 export：2
- 未使用的函数：3
- 未使用的变量：1
- 未使用的 import：2

## 详细清单

### 1. [高] 未使用的 export - src/utils/helpers.ts
**类型**：export function
**名称**：`formatCurrency`
**位置**：第 15-22 行
**状态**：真未使用（全局搜索无任何引用）
**修复建议**：删除该函数，或确认是否需要保留

### 2. [高] 未使用的 import - src/views/MeetingList.vue
**类型**：import 语句冗余
**位置**：第 3 行
**代码**：`import { formatDate } from '@/utils/date'`
**状态**：已导入但未使用
**修复建议**：删除该 import 语句

### 3. [中] 未使用的函数 - src/components/Calendar.vue
**类型**：function
**名称**：`getWeekRange`
**位置**：第 88-95 行
**状态**：定义但未调用（可能为遗留代码）
**条件使用**：无
**修复建议**：确认业务需求后删除

...
```

## 完成标准
- 未使用的 export：100% 识别
- 未使用的 import：100% 识别
- 未使用的函数/变量：识别率 > 90%
- 区分"真未使用"和"条件使用"，误报率 < 15%
- 每个死代码点有精确行号和修复建议

## 支持的文件类型
- JavaScript/TypeScript (.js, .ts, .jsx, .tsx)
- Vue组件 (.vue)

## 注意事项
- 优先使用 AST 分析而非正则匹配，提高准确性
- 对动态引用（如 `window[xxx]`）标记为"可能使用"，不直接判定为死代码
- 对 `// @ts-ignore` 覆盖的 import 单独标记
- 不修改任何代码，仅报告冗余位置