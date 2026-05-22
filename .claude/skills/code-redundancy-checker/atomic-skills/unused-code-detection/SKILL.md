---
name: unused-code-detection
description: 检测死代码，包括未使用的export、函数、变量、import、类、TypeScript类型等，区分真未使用和条件使用，提供精确的清理建议和 severity 级别。在冗余检测流程中与duplicate-code-detection并行执行。
---

# Unused Code Detection 原子 Skill（改进版 v1.1）

## 概述
检测目标代码中的死代码（未使用代码），包括：未使用的 export、函数、变量、常量、类、import、TypeScript 类型（type/interface/enum），以及未使用的组件 props。区分"真未使用"和"条件使用/动态使用"，避免误报。标注 severity 级别并提供 fix-suggestion。

## 核心能力
- 未使用的 export 检测（exported but never imported，含 `export type`）
- 未使用的函数/方法检测
- 未使用的变量/常量检测
- 未使用的 import 检测（含 `import type` 冗余）
- 未使用的类/接口/类型检测（TypeScript 专项）
- 未使用的组件 props 检测（含 TypeScript Props 类型）
- 未使用的样式规则检测（CSS）
- 条件使用识别（try/catch 动态 require 等）
- **Severity 分级**（high/medium/low）
- **fix-suggestion 生成**

## 检测维度

### 1. 未使用的 Export
- `export function` / `export const` / `export class` 从未被其他文件 import
- `export default` 从未被 import
- `export type` / `export interface` / `export enum` 类型未被使用
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

### 4. 未使用的类/接口/类型（TypeScript 专项）
- class 定义后从未被实例化或继承
- interface 定义后从未被类型标注使用
- type alias 定义后从未被引用
- enum 成员是否全部使用

### 5. 未使用的 Props（Vue组件）
- props 定义但模板中从未使用
- props 定义但 JS/TS 代码中从未使用
- TypeScript 中 defineProps 定义的类型 props 未使用

### 6. 条件使用识别（避免误报）
- 通过 `try/catch` 动态 `require()`
- 通过 `window.xxx` 全局访问
- 通过 `eval()` 动态调用
- 通过字符串拼接动态 import
- 注释说明"仅为兼容性保留"等

## Severity 判定规则
- **HIGH**：未使用的 export（浪费打包体积）、未使用的 class/enum（体积大）
- **MEDIUM**：未使用的函数、未使用的 interface/type（可通过 Tree-shaking 优化）
- **LOW**：冗余 import、未使用的 props

## fix-suggestion 示例
```
未使用的 export fix-suggestion:
1. 在所有文件中搜索 `formatCurrency` 引用
2. 确认无任何引用后，删除该函数（第 15-22 行）
3. 预估收益：减少 8 行代码，打包体积减少 ~200B

未使用的 import fix-suggestion:
1. 删除 `src/views/MeetingList.vue` 第 3 行: import { formatDate } from '@/utils/date'
2. 如 formatDate 仍被使用，先替换为实际值再删除 import
```

## 输入
目标文件或目录路径（支持 glob 模式）

## 输出
死代码清单（含 severity 级别和 fix-suggestion）：

```markdown
# 死代码检测报告 v1.1

## 检测概览
- 扫描文件数：12
- 检测到死代码：8
- 未使用的 export：2
- 未使用的函数：3
- 未使用的变量：1
- 未使用的 import：2

## Severity 分布
- HIGH: 2
- MEDIUM: 4
- LOW: 2

## 详细清单

### 1. [HIGH] 未使用的 export - src/utils/helpers.ts
**类型**：export function
**名称**：`formatCurrency`
**位置**：第 15-22 行（8行）
**Severity**：HIGH
**状态**：真未使用（全局搜索无任何引用）
**fix-suggestion**：
1. 在所有文件中搜索 `formatCurrency` 引用
2. 确认无任何引用后，删除该函数定义
3. 预估收益：减少 8 行代码，打包体积减少 ~200B
**风险等级**：低

### 2. [MEDIUM] 未使用的 TypeScript 接口 - src/types/user.ts
**类型**：interface
**名称**：`UserProfileExtra`
**位置**：第 20-28 行（9行）
**Severity**：MEDIUM
**状态**：接口定义后从未被类型标注使用
**fix-suggestion**：
1. 搜索所有 `UserProfileExtra` 引用
2. 如无引用，删除该 interface 定义
3. 如仅在内部使用，考虑降级为 `type`
**风险等级**：低

### 3. [LOW] 未使用的 import - src/views/MeetingList.vue
**类型**：import 语句冗余
**位置**：第 3 行
**代码**：`import { formatDate } from '@/utils/date'`
**Severity**：LOW
**状态**：已导入但未使用
**fix-suggestion**：删除该 import 语句
**风险等级**：低

### 4. [HIGH] 未使用的 enum - src/types/meeting.ts
**类型**：enum
**名称**：`MeetingStatus`
**位置**：第 1-8 行
**Severity**：HIGH
**状态**：enum 定义后未被任何文件引用
**fix-suggestion**：
1. 搜索 `MeetingStatus` 所有引用
2. 确认无引用后删除该 enum
3. 如需保留状态语义，考虑降级为 `const object`
**风险等级**：中（需确认无运行时依赖）

...
```

## 完成标准
- 未使用的 export（含 export type）：100% 识别
- 未使用的 import（含 import type）：100% 识别
- 未使用的函数/变量：识别率 > 90%
- 未使用的 TypeScript 类型（type/interface/enum）：识别率 > 90%
- 区分"真未使用"和"条件使用"，误报率 < 15%
- 每个死代码点有精确行号、severity 级别和 fix-suggestion

## 支持的文件类型
- JavaScript/TypeScript (.js, .ts, .jsx, .tsx)
- Vue 组件 (.vue，含 TypeScript Props 分析）

## 注意事项
- 优先使用 AST 分析而非正则匹配，提高准确性
- 对动态引用（如 `window[xxx]`）标记为"可能使用"，不直接判定为死代码
- 对 `// @ts-ignore` 覆盖的 import 单独标记
- 不修改任何代码，仅报告冗余位置
- TypeScript 类型（type/interface/enum）的"使用"判定：不仅检查 import，还检查作为类型标注的引用

## 版本
v1.1 - 改进版：新增 TypeScript 类型检测、severity 级别、fix-suggestion