---
name: redundancy-check
description: 深度检测代码冗余（重复代码、死代码、冗余导入、TypeScript 类型冗余），整合 duplicate-code-detection + unused-code-detection + redundancy-report 三个检测阶段，输出 severity 分级和 fix-suggestion。为 code-optimizer 提供精准的冗余清单，为后续优化建议和代码重构提供依据。
version: 1.0
merged_from:
  - duplicate-code-detection
  - unused-code-detection
  - redundancy-report
tau_layer: perception
---

# Redundancy Check 原子Skill

> Task Folding 合并了三个冗余检测原子技能（duplicate-code-detection + unused-code-detection + redundancy-report）为统一的感知层技能。与 `quality-and-perf-analysis` 并行执行，共同为 `pattern-and-benchmark-recognition` 提供输入。

---

## 概述

深度检测代码冗余，系统化地识别文件内重复代码、跨文件重复代码、死代码（未使用的 export/函数/变量/类型）、冗余导入/依赖等。输出包含 severity 分级（high/medium/low）和 fix-suggestion，为代码优化提供精准的冗余清单。

**τ 压缩依据**：将三个独立的检测技能合并为一个感知层技能，减少跨 Skill 上下文传递开销。与 `quality-and-perf-analysis` 并行执行，τ 效率提升约 25%。

---

## 核心能力

### 重复代码检测（来自 duplicate-code-detection）
- 文件内重复代码检测（同文件中的重复代码块）
- 跨文件重复代码检测（不同文件间的重复代码）
- Vue SFC 三段式检测（`<template>` 模板 / `<script>` 逻辑 / `<style>` 样式）
- TypeScript 类型重复检测（重复的 type/interface/enum 定义）
- 相似代码检测（精确匹配 / 高度相似 70-99% / 中度相似 50-69%）

### 死代码检测（来自 unused-code-detection）
- 未使用的 export 检测（含 `export type`）
- 未使用的函数/方法检测
- 未使用的变量/常量检测
- 未使用的 import 检测（含 `import type` 冗余）
- 未使用的类/接口/类型检测（TypeScript 专项）
- 未使用的组件 props 检测（Vue）
- 条件使用识别（避免误报：try/catch 动态 require、window.xxx 等）

### 冗余报告（来自 redundancy-report）
- 汇总两个检测阶段的输出
- Severity 分级（high/medium/low）
- 修复优先级排序（基于 severity + 修复收益）
- 每个冗余点的 fix-suggestion（含具体修复步骤）
- 预估清理收益（代码行数、包体积、时间）

---

## 内部执行流程（3步子管道）

```
duplicate-code-detection（无依赖）
        ↓
unused-code-detection（无依赖，可与 1 并行）
        ↓
redundancy-report（依赖 1 和 2）
```

**Skill Stacking**：
- duplicate-code-detection 和 unused-code-detection 在感知层并行执行（无依赖，无数据冲突）
- redundancy-report 等待两个检测完成后汇总

---

## 输入

- 目标文件或目录路径（支持 glob 模式，如 `src/**/*.ts`）
- 可选：语言/框架配置（Vue SFC、TypeScript 等）

---

## 输出

```markdown
# 代码冗余检测报告

## 执行摘要

| 指标 | 数值 |
|------|------|
| 扫描文件数 | 15 |
| 代码总行数 | 3250 |
| 重复代码块 | 5 |
| 死代码块 | 8 |
| 总体重复率 | 8.2% |
| 可删除代码行数 | ~185 行 |

## Severity 分布

| 级别 | 数量 | 说明 |
|------|------|------|
| HIGH | 4 | 跨文件完全重复、未使用 export、打包体积浪费 |
| MEDIUM | 7 | 文件内重复、未使用函数 |
| LOW | 3 | 冗余 import、未使用 props |

---

## 一、重复代码检测结果

### 🔴 HIGH | 跨文件重复 100% | src/utils/date.ts ↔ src/utils/formatter.ts
**位置**：`src/utils/date.ts` 第 3-14 行 / `src/utils/formatter.ts` 第 8-19 行
**重复行数**：12行
**代码片段**：
```typescript
export function formatDate(date: Date): string { ... }
```
**fix-suggestion**：
1. 在 `src/utils/date.ts` 中保留该函数
2. 从 `src/utils/formatter.ts` 中删除重复代码（第 8-19 行）
3. 在 `src/utils/formatter.ts` 中添加：`import { formatDate } from './date'`
**预估收益**：减少 12 行代码，打包体积减少 ~300B
**预估时间**：10 分钟

---

## 二、死代码检测结果

### 🔴 HIGH | 未使用的 export | src/utils/helpers.ts
**类型**：export function
**名称**：`formatCurrency`
**位置**：第 15-22 行（8行）
**fix-suggestion**：
1. 全局搜索 `formatCurrency` 引用
2. 确认无引用后，删除该函数定义
**预估收益**：减少 8 行代码，打包体积减少 ~200B
**预估时间**：5 分钟

---

## 三、修复行动计划（按 severity 排序）

### 🔴 阶段一：HIGH 立即清理（预计 30 分钟）
| 操作 | 文件 | 预估时间 |
|------|------|----------|
| 提取重复代码到公共模块 | date.ts ↔ formatter.ts | 15 分钟 |
| 删除未使用 export | helpers.ts 第 15-22 行 | 5 分钟 |

### 🟡 阶段二：MEDIUM 计划清理（预计 60 分钟）
| 操作 | 文件 | 预估时间 |
|------|------|----------|
| 消除文件内重复代码 | components/A.vue | 20 分钟 |
| 删除未使用函数 | Calendar.vue 第 88-95 行 | 10 分钟 |

### 🟢 阶段三：LOW 优化清理（预计 15 分钟）
| 操作 | 文件 | 预估时间 |
|------|------|----------|
| 删除冗余 import | MeetingList.vue 第 3 行 | 2 分钟 |

---

## 清理后预期指标

| 指标 | 清理前 | 清理后 | 变化 |
|------|--------|--------|------|
| 代码总行数 | 3250 | ~3065 | -185 行 |
| 重复代码率 | 8.2% | 1.5% | -6.7% |
| HIGH 冗余点 | 4 | 0 | -4 |
```

---

## Skill Stacking 输出规范

```python
SHARED_CONTEXT = {
    "redundancy_report": {
        "summary": {
            "files_scanned": 15,
            "code_lines": 3250,
            "duplicate_blocks": 5,
            "dead_code_blocks": 8,
            "overall_duplication_rate": "8.2%",
            "deletable_lines": "~185 行"
        },
        "severity_distribution": {
            "HIGH": 4, "MEDIUM": 7, "LOW": 3
        },
        "duplicate_code": [...],    # 重复代码清单（含 severity + fix-suggestion）
        "dead_code": [...],         # 死代码清单（含 severity + fix-suggestion）
        "fix_action_plan": [...]    # 修复行动计划（按 severity 排序）
    },
    "redundancy_metrics": {
        "duplication_rate": "8.2%",
        "dead_code_rate": "2.5%",
        "unused_import_rate": "3.1%"
    }
}
```

---

## τ 预算

| 分项 | τ 预算 | 说明 |
|------|--------|------|
| duplicate-code-detection | ~400 τ | 重复代码扫描（可并行） |
| unused-code-detection | ~500 τ | 死代码扫描（可并行） |
| redundancy-report | ~300 τ | 汇总报告生成 |
| **总计** | **~1200 τ** | 并行执行约 800 τ |

---

## 与 quality-and-perf-analysis 的并行关系

```python
# Skill Stacking: 同层并行执行
quality_task = execute_async(quality_and_perf_analysis, target_files)
redundancy_task = execute_async(redundancy_check, target_files)

quality_report = await quality_task
redundancy_report = await redundancy_task

write_to_shared_context("quality_report", quality_report)
write_to_shared_context("redundancy_report", redundancy_report)
```

---

## 依赖关系

- 依赖：无（感知层技能）
- 并行关系：`duplicate-code-detection` 和 `unused-code-detection` 可并行执行
- 被依赖：`pattern-and-benchmark-recognition`（分析层）

---

## 完成标准

1. 文件内重复代码：100% 识别，误报率 < 10%
2. 跨文件重复代码：100% 识别，误报率 < 10%
3. 未使用的 export（含 export type）：100% 识别
4. 未使用的 import（含 import type）：100% 识别
5. 未使用的函数/变量：识别率 > 90%
6. 每个冗余点有 severity 级别（high/medium/low）和 fix-suggestion
7. 报告包含清理行动计划（按 severity 排序）
8. 共享上下文命中率 >= 70%

---

## 触发条件

本技能通过以下方式被调用：

**方式 1：显式触发**（用户明确请求冗余检测）
- 用户输入包含冗余检测关键词（检查代码冗余、检测重复代码、找出死代码、清理未使用代码、冗余导入、代码重复率）
- 由 orchestrator-pro 判断直接调用 `redundancy-check`

**方式 2：协作触发**（code-optimizer 完整优化流程）
- `code-optimizer` 的 `quality-and-perf-analysis` 发现重复率 > 5% 时
- 建议触发 `redundancy-check` 进行深度冗余检测
- 结果作为 `pattern-and-benchmark-recognition` 的输入

---

## 注意事项

- 不修改任何代码，仅报告冗余位置和 fix-suggestion
- 优先使用 AST 分析而非正则匹配，提高准确性
- 对动态引用（如 `window[xxx]`）标记为"可能使用"，不直接判定为死代码
- 区分"故意重复"（模板代码）和"意外重复"（需清理）
- HIGH 优先级冗余必须优先出现在报告中
- 与 `quality-and-perf-analysis` 的"重复代码率"检测互补：本技能做深度检测（行号、severity、fix-suggestion）

## 原子skill位置

`.claude/skills/code-optimizer/atomic-skills/redundancy-check/SKILL.md`