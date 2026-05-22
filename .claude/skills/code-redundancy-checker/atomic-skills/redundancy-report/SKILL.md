---
name: redundancy-report
description: 汇总duplicate-code-detection和unused-code-detection的检测结果，生成完整的可操作冗余报告，包含severity分级（high/medium/low）、fix-suggestion和具体修复步骤。在两个检测原子skill完成后执行。
---

# Redundancy Report 原子 Skill（改进版 v1.1）

## 概述
汇总重复代码检测和死代码检测的结果，生成完整的可操作冗余报告。对每个冗余点进行 severity 分级（high/medium/low），按优先级排序，并提供具体的 fix-suggestion（修复步骤）和预估收益。

## 核心能力
- 汇总两个检测阶段的输出
- **Severity 分级**（high/medium/low）
- 修复优先级排序（基于 severity + 修复收益）
- 冗余统计与指标计算
- **fix-suggestion 生成**（每个冗余点提供具体修复步骤）
- 修复收益预估（代码行数、包体积、性能）
- 生成 Markdown 格式报告
- 估算清理工作量

## 报告结构（改进版）

### 1. 执行摘要
- 扫描范围（文件数、代码行数）
- 检测到冗余总数
- **Severity 分布**（HIGH/MEDIUM/LOW 数量）
- 预估可删除代码行数
- 预估性能收益

### 2. 冗余分类汇总

#### 重复代码汇总
- 文件内重复代码块数（含 Vue SFC / TypeScript 类型）
- 跨文件重复代码块数
- 可提取为公共函数的重复代码
- 总体重复率（目标 < 5%）

#### 死代码汇总
- 未使用的 export 数（含 TypeScript 类型）
- 未使用的函数数
- 未使用的变量数
- 未使用的 import 数（含 import type）
- 可删除代码行数估算

### 3. Severity 分级

#### HIGH（立即处理，影响打包体积）
- 跨文件完全重复代码（100% 匹配）
- 未使用的 export（浪费打包体积）
- 重复 3 次以上的代码块
- 未使用的 enum/class（大体积类型）

#### MEDIUM（计划处理，影响可维护性）
- 文件内重复代码
- 高度相似代码（70%~99%）
- 未使用的函数（确认后删除）
- 未使用的 interface/type

#### LOW（有空处理）
- 冗余 import
- 未使用的 props
- 中度相似代码（50%~69%）

### 4. fix-suggestion

对每个冗余点，提供：
- **位置**：精确文件路径和行号
- **当前问题**：冗余类型和代码片段
- **fix-suggestion**：具体操作步骤（编号列表，每步可执行）
- **预估收益**：删除后可减少的代码行数、预期性能提升
- **风险等级**：低/中/高（修改可能带来的风险）
- **预估时间**：5分钟/15分钟/30分钟

### 5. 修复行动计划（按 severity 排序）

建议的清理顺序：
1. **HIGH 优先**：删除未使用的 export 和 enum（零风险或低风险）
2. **HIGH 合并**：提取跨文件重复代码到公共模块
3. **MEDIUM**：消除文件内重复代码
4. **MEDIUM**：删除未使用的函数和 interface
5. **LOW**：清理冗余 import 和 props

## 输入
- duplicate-code-detection 输出的重复代码清单（含 severity + fix-suggestion）
- unused-code-detection 输出的死代码清单（含 severity + fix-suggestion）

## 输出
完整冗余报告（含 severity 分级 + fix-suggestion）：

```markdown
# 代码冗余检测报告 v1.1

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
| 🔴 HIGH | 4 | 跨文件完全重复、未使用 export、打包体积浪费 |
| 🟡 MEDIUM | 7 | 文件内重复、未使用函数 |
| 🟢 LOW | 3 | 冗余 import、未使用 props |

**结论**：检测到 14 个冗余点，其中 HIGH 优先级 4 个，建议优先清理跨文件重复代码。

---

## 一、重复代码检测结果

### 1.1 概览
- 文件内重复：2 块（42 行）
- 跨文件重复：3 块（89 行）
- Vue SFC 重复：0 块（0 行）
- TypeScript 类型重复：1 块（16 行）
- 总体重复率：8.2%（目标 < 5% ❌）

### 1.2 详细清单

#### 🔴 HIGH | 跨文件重复 100% | src/utils/date.ts ↔ src/utils/formatter.ts
**位置**：
- `src/utils/date.ts` 第 3-14 行
- `src/utils/formatter.ts` 第 8-19 行

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
4. 验证：运行 `npm run build` 确认打包正常

**预估收益**：减少 12 行重复代码，打包体积减少 ~300B

**风险等级**：低

**预估时间**：10 分钟

---

## 二、死代码检测结果

### 2.1 概览
- 未使用的 export：2 个
- 未使用的函数：3 个
- 未使用的 TypeScript 类型：2 个
- 未使用的 import：2 个
- 可删除代码行数：~75 行

### 2.2 详细清单

#### 🔴 HIGH | 未使用的 export | src/utils/helpers.ts
**类型**：export function
**名称**：`formatCurrency`
**位置**：第 15-22 行（8行）
**影响**：打包时包含但未使用，增加包体积

**fix-suggestion**：
1. 在所有文件中搜索 `formatCurrency` 引用（全局搜索）
2. 确认无任何引用后，删除该函数定义
3. 验证：运行 `npm run build` 确认打包正常

**预估收益**：减少 8 行代码，打包体积减少 ~200B

**风险等级**：低（已确认无任何引用）

**预估时间**：5 分钟

---

## 三、修复行动计划

### 🔴 阶段一：立即清理 HIGH（预计 30 分钟）

| # | Severity | 操作 | 文件 | 预估时间 | 风险 |
|---|----------|------|------|----------|------|
| 1 | HIGH | 提取重复代码到公共模块 | date.ts + formatter.ts | 15 分钟 | 中 |
| 2 | HIGH | 删除未使用 export | helpers.ts 第 15-22 行 | 5 分钟 | 低 |
| 3 | HIGH | 删除未使用 enum | types/meeting.ts | 5 分钟 | 中 |
| 4 | HIGH | 删除未使用 class | utils/legacy.ts | 5 分钟 | 中 |

### 🟡 阶段二：计划清理 MEDIUM（预计 60 分钟）

| # | Severity | 操作 | 文件 | 预估时间 | 风险 |
|---|----------|------|------|----------|------|
| 5 | MEDIUM | 消除文件内重复代码 | components/A.vue | 20 分钟 | 低 |
| 6 | MEDIUM | 删除未使用函数 | Calendar.vue 第 88-95 行 | 10 分钟 | 中 |
| 7 | MEDIUM | 删除未使用 interface | types/user.ts | 15 分钟 | 低 |

### 🟢 阶段三：优化清理 LOW（预计 15 分钟）

| # | Severity | 操作 | 文件 | 预估时间 | 风险 |
|---|----------|------|------|----------|------|
| 8 | LOW | 删除冗余 import | MeetingList.vue 第 3 行 | 2 分钟 | 低 |
| 9 | LOW | 删除冗余 import | formatter.ts 第 5 行 | 2 分钟 | 低 |

---

## 四、清理后预期指标

| 指标 | 清理前 | 清理后 | 变化 |
|------|--------|--------|------|
| 代码总行数 | 3250 | ~3065 | -185 行 |
| 重复代码率 | 8.2% | 1.5% | -6.7% |
| 打包体积 | ~250KB | ~245KB | -5KB |
| HIGH 冗余点 | 4 | 0 | -4 |
| 可删除代码行数 | 185 | 0 | - |

---

生成时间：2026-05-21
检测工具：code-redundancy-checker v1.1
```

## 完成标准
- 报告包含所有冗余点的详细信息
- 每个冗余点有 severity 级别、位置、fix-suggestion
- 提供清理优先级（按 severity 排序）和行动计划
- 预估清理收益（代码行数、包体积、时间）
- 支持导出为 Markdown 格式

## 输出格式
- 默认输出 Markdown 格式报告
- 可选输出 JSON 格式（便于程序处理）
- 报告保存路径：`./reports/redundancy-report-{timestamp}.md`

## 注意事项
- 不生成任何修复后的代码，仅提供 fix-suggestion
- 对每个冗余点标注风险等级和预估时间
- 提供多个修复方案选项（简化/完整）
- 区分"可直接删除"和"需确认后删除"两类
- HIGH 优先级冗余必须优先处理

## 版本
v1.1 - 改进版：新增 severity 级别（high/medium/low）、fix-suggestion 生成（具体修复步骤）、预估时间和打包收益分析