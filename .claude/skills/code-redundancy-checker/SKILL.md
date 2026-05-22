---
name: code-redundancy-checker
description: 独立检测代码冗余，识别重复代码、死代码、冗余导入等，为代码优化提供精准的冗余清单。当用户请求检查代码冗余、重复代码检测、死代码清理时自动触发。支持 Vue SFC 和 TypeScript，提供 severity 级别和 fix-suggestion。
---

# Code Redundancy Checker 主 Skill（改进版 v1.1）

## 概述
本主 skill 独立专注于代码冗余检测，系统化地识别文件内重复代码、跨文件重复代码、死代码（未使用函数/变量）、冗余导入/依赖等，为代码清理和优化提供精准的冗余清单。

## 核心理念
- 精准定位，不误报不漏报
- 分层检测（文件内 -> 跨文件 -> 项目级）
- 提供具体位置和修复建议
- 支持多种编程语言和框架（含 Vue SFC / TypeScript）
- 保留原始代码完整性
- 所有冗余点标注 severity 级别（high/medium/low）

## 核心能力
- 文件内重复代码检测（含 Vue SFC template/script/style）
- 跨文件重复代码检测（含 TypeScript 类型共享）
- 死代码检测（未使用 export、函数、变量、类、接口）
- 冗余导入/依赖检测（含类型导入）
- 重复逻辑识别（相似条件判断、异常处理）
- 生成可操作的冗余清单（含 fix-suggestion）
- Severity 分级（high/medium/low）

## 执行流程
1. duplicate-code-detection（重复代码检测）
2. unused-code-detection（死代码检测）
3. redundancy-report（冗余报告生成，含 severity + fix-suggestion）

## 原子 skill 依赖关系
- duplicate-code-detection：无依赖
- unused-code-detection：无依赖（可与 1 并行执行）
- redundancy-report：依赖 duplicate-code-detection 和 unused-code-detection

## 主 skill 完成标准
1. 文件内重复代码已识别，位置精确到行号，标注 severity
2. 跨文件重复代码已识别，列出相似文件对，标注 severity
3. 死代码已识别（未使用 export、函数、变量、常量），标注 severity
4. 冗余导入已识别（未使用的 import），标注 severity
5. 冗余报告包含：位置、重复率/使用率、severity 级别、fix-suggestion
6. 支持至少 3 种语言：JavaScript/TypeScript/Vue（含 SFC 三段式分析）

## 重试规则
- 每个原子 skill 失败后可重试 **3 次**
- 如扫描中断，保留已扫描的结果，从断点继续

## 针对不同代码类型的处理

### Vue/React 组件
- 检测组件内重复的模板片段（`<template>`）
- 检测重复的 data/methods/computed（`<script>`）
- 检测重复的样式规则（`<style>`）
- 检测未使用的组件 props（含 TypeScript props 类型）
- 检测重复的 CSS 类名

### JavaScript/TypeScript
- 检测重复的函数逻辑（含泛型/类型别名重复）
- 检测未使用的 export（含 `export type`）
- 检测重复的 import 路径
- 检测可提取的公共方法/类型
- 检测重复的 interface/type 定义

### 配置文件
- 检测重复的配置项
- 检测未使用的配置键
- 检测冗余的依赖声明

## 质量指标
- **代码重复率**：目标 < 5%
- **死代码率**：目标 0%
- **冗余导入率**：目标 0%
- **误报率**：目标 < 10%

## Severity 定义
- **high**：跨文件完全重复（100% 匹配）、未使用的 export、打包体积浪费显著
- **medium**：文件内重复、可提取的公共函数、未使用的 props
- **low**：冗余 import、中度相似代码（50-69%）、未使用的类型

## 使用示例
用户输入："检查 src/utils 目录下的代码冗余"

执行流程：
1. duplicate-code-detection 扫描目录，识别文件内和跨文件的重复代码（含 Vue SFC / TypeScript）
2. unused-code-detection 检测未使用的函数、变量、类型、import
3. redundancy-report 生成冗余清单，包含位置、severity 级别、fix-suggestion

## 触发关键词
- "检查代码冗余"
- "检测重复代码"
- "找出死代码"
- "清理未使用代码"
- "代码重复率"
- "冗余导入"
- "重复代码检测"
- "Vue 组件冗余"
- "TypeScript 类型冗余"

## 注意事项
- 不修改代码，仅报告冗余
- 提供精确的行号和代码片段
- 对每个冗余点标注 severity（high/medium/low）
- 区分"完全重复"和"相似代码"
- 保留原代码不做任何修改
- fix-suggestion 提供具体可操作的修复步骤

## 文件系统位置
- 主 skill 路径：./.claude/skills/code-redundancy-checker/SKILL.md
- 原子 skill 路径：./.claude/skills/code-redundancy-checker/atomic-skills/下各子目录

## 支持的文件类型
- JavaScript/TypeScript (.js, .ts, .jsx, .tsx)
- Vue 组件 (.vue，含 template/script/style 三段式)
- 配置文件 (.json, .config.js, .config.ts)
- CSS/SCSS/Less (.css, .scss, .less)

## 输出产物
- 重复代码清单（文件内 + 跨文件，含 Vue SFC / TypeScript 专项）
- 死代码清单（函数、变量、类型、import，含 TypeScript 类型）
- 冗余报告（汇总 + 详细清单，含 severity 级别 + fix-suggestion）
- 修复优先级建议

---
## 原子 skill 详细定义

### 1. duplicate-code-detection
**能力**：检测文件内和跨文件的重复代码（含 Vue SFC、TypeScript 类型）
**输入**：目标文件或目录路径
**输出**：重复代码清单（位置、片段、重复次数、相似度、severity）
**增强**：新增 Vue SFC template/script/style 专项检测、TypeScript 类型别名重复检测
**完成标准**：识别所有重复代码块，位置精确到行号，标注 severity

### 2. unused-code-detection
**能力**：检测死代码（未使用的 export、函数、变量、import、TypeScript 类型）
**输入**：目标文件或目录路径
**输出**：死代码清单（类型、位置、使用次数、severity）
**增强**：新增 TypeScript 类型（type/interface）未使用检测、`import type` 冗余检测
**完成标准**：识别所有死代码，区分"真未使用"和"条件使用"，标注 severity

### 3. redundancy-report
**能力**：汇总检测结果，生成可操作的冗余报告
**输入**：duplicate-code-detection 和 unused-code-detection 的输出
**输出**：完整冗余报告（汇总 + 详情 + severity 级别 + fix-suggestion + 优先级）
**增强**：每个冗余点提供 fix-suggestion（含具体修复命令/步骤）、severity 级别判定
**完成标准**：报告包含所有冗余点、severity、fix-suggestion、具体修复步骤

---
版本：1.1（改进版）
主 skill 名称：code-redundancy-checker
状态：启用