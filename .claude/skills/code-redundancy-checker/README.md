# Code Redundancy Checker（改进版 v1.1）

独立检测代码冗余的 Claude Code Skill，快速识别重复代码、死代码和冗余导入，为代码清理提供精准的冗余清单。**改进版新增 Vue SFC 专项检测、TypeScript 类型检测、severity 级别和 fix-suggestion。**

## 功能特性

- **文件内重复代码检测**：识别同一文件中连续重复的代码块
- **跨文件重复代码检测**：识别不同文件间完全相同或高度相似的代码
- **Vue SFC 专项检测**：分析 .vue 文件的 template/script/style 三段式重复
- **TypeScript 类型检测**：检测重复的类型别名、接口定义
- **死代码检测**：检测未使用的 export、函数、变量、类型、import
- **冗余导入检测**：识别已导入但从未使用的语句（含 `import type`）
- **Severity 分级**：每个冗余点标注 high/medium/low
- **fix-suggestion**：每个冗余点提供具体可操作的修复步骤

## 快速开始

在 Claude Code 对话中，直接描述你的需求即可自动触发：

```
/code-redundancy-checker "检查 src/utils 目录下的代码冗余"
```

或使用自然语言：

- "检查代码冗余"
- "检测重复代码"
- "找出死代码"
- "清理未使用代码"
- "Vue 组件重复代码检测"

## 原子技能

| 原子技能 | 依赖 | 功能 |
|----------|------|------|
| `duplicate-code-detection` | 无 | 检测重复代码（文件内 + 跨文件 + Vue SFC + TS 类型） |
| `unused-code-detection` | 无 | 检测死代码（未使用函数/变量/类型/import） |
| `redundancy-report` | 前两个 | 汇总检测结果，生成可操作报告（含 severity + fix-suggestion） |

## 执行流程

```
duplicate-code-detection → unused-code-detection → redundancy-report
```

`duplicate-code-detection` 和 `unused-code-detection` 可并行执行。

## 输出示例（改进版）

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
| HIGH | 3 | 跨文件完全重复、未使用 export |
| MEDIUM | 7 | 文件内重复、未使用函数 |
| LOW | 3 | 冗余 import |

## 修复行动计划（含 fix-suggestion）

### 阶段一：立即清理（HIGH - 预计 10 分钟）

| # | Severity | 操作 | 文件 | fix-suggestion | 风险 |
|---|----------|------|------|----------------|------|
| 1 | HIGH | 删除未使用 export | src/utils/helpers.ts 第 15-22 行 | 删除函数定义，搜索全局确认无引用后删除 | 中 |
| 2 | HIGH | 跨文件重复代码 | src/utils/date.ts ↔ formatter.ts | 提取到 `utils/date.ts`，其他文件引用 | 中 |

### 阶段二：计划清理（MEDIUM - 预计 30 分钟）

| # | Severity | 操作 | 文件 | fix-suggestion |
|---|----------|------|------|----------------|
| 3 | MEDIUM | 删除冗余 import | src/views/MeetingList.vue 第 3 行 | 删除 `import { formatDate }` 行 |
```

## 支持的文件类型

- JavaScript/TypeScript (`.js`, `.ts`, `.jsx`, `.tsx`)
- Vue 组件 (`.vue`，含 template/script/style 三段式专项分析)
- CSS/SCSS/Less (`.css`, `.scss`, `.less`)
- 配置文件 (`.json`, `.config.js`, `.config.ts`)

## Severity 定义

| 级别 | 颜色标识 | 说明 | 示例 |
|------|----------|------|------|
| HIGH | 🔴 | 跨文件完全重复、未使用 export、打包体积显著浪费 | 同一函数在 3 个文件中复制 |
| MEDIUM | 🟡 | 文件内重复、可提取公共函数、未使用 props | 同一文件中两处相同的格式化逻辑 |
| LOW | 🟢 | 冗余 import、中度相似代码（50-69%）、未使用类型 | `import type` 但实际未做类型标注 |

## 质量指标

| 指标 | 目标 |
|------|------|
| 代码重复率 | < 5% |
| 死代码率 | 0% |
| 冗余导入率 | 0% |
| 误报率 | < 10% |

## 改进点（v1.0 -> v1.1）

1. **新增 Vue SFC 专项检测**：分析 .vue 文件的 template/script/style 三段式重复
2. **新增 TypeScript 类型检测**：检测未使用的 type/interface/export type
3. **新增 severity 级别**：每个冗余点标注 high/medium/low
4. **新增 fix-suggestion**：每个冗余点提供具体可操作的修复步骤
5. **改进检测算法**：基于 AST 的精确识别，降低误报率

## 注意事项

- 本 Skill **仅检测冗余，不修改代码**
- 提供精确的行号和代码片段
- 对每个冗余点标注 severity（high/medium/low）
- 每个冗余点提供 fix-suggestion
- 区分"完全重复"和"相似代码"

## 目录结构

```
code-redundancy-checker/
├── SKILL.md                          # 主 Skill 定义（改进版 v1.1）
├── README.md                         # 本文档
└── atomic-skills/
    ├── duplicate-code-detection/    # 重复代码检测（含 Vue SFC / TS 类型）
    │   └── SKILL.md
    ├── unused-code-detection/        # 死代码检测（含 TypeScript 类型）
    │   └── SKILL.md
    └── redundancy-report/            # 冗余报告生成（含 severity + fix-suggestion）
        └── SKILL.md
```

## 版本

- v1.1 - 改进版：新增 Vue SFC 检测、TypeScript 检测、severity 级别、fix-suggestion
- v1.0 - 初始版本