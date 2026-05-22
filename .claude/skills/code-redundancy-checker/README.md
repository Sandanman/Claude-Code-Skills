# Code Redundancy Checker

独立检测代码冗余的 Claude Code Skill，快速识别重复代码、死代码和冗余导入，为代码清理提供精准的冗余清单。

## 功能特性

- **文件内重复代码检测**：识别同一文件中连续重复的代码块
- **跨文件重复代码检测**：识别不同文件间完全相同或高度相似的代码
- **死代码检测**：检测未使用的 export、函数、变量、import
- **冗余导入检测**：识别已导入但从未使用的语句
- **优先级报告**：按严重程度分级，提供修复建议

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

## 原子技能

| 原子技能 | 依赖 | 功能 |
|----------|------|------|
| `duplicate-code-detection` | 无 | 检测重复代码（文件内 + 跨文件） |
| `unused-code-detection` | 无 | 检测死代码（未使用函数/变量/import） |
| `redundancy-report` | 前两个 | 汇总检测结果，生成可操作报告 |

## 执行流程

```
duplicate-code-detection → unused-code-detection → redundancy-report
```

`duplicate-code-detection` 和 `unused-code-detection` 可并行执行。

## 输出示例

```
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

## 修复行动计划

### 阶段一：立即清理（P0）
| # | 操作 | 文件 | 风险 |
|---|------|------|------|
| 1 | 删除冗余 import | src/utils/formatter.ts 第 5 行 | 低 |
| 2 | 删除未使用 export | src/utils/helpers.ts 第 15-22 行 | 中 |

### 阶段二：计划清理（P1）
| # | 操作 | 文件 | 风险 |
|---|------|------|------|
| 3 | 提取重复代码到公共模块 | src/utils/date.ts + formatter.ts | 中 |
| 4 | 删除未使用函数 | src/components/Calendar.vue 第 88-95 行 | 中 |
```

## 支持的文件类型

- JavaScript/TypeScript (`.js`, `.ts`, `.jsx`, `.tsx`)
- Vue 组件 (`.vue`)
- 配置文件 (`.json`, `.config.js`)

## 质量指标

| 指标 | 目标 |
|------|------|
| 代码重复率 | < 5% |
| 死代码率 | 0% |
| 冗余导入率 | 0% |
| 误报率 | < 10% |

## 注意事项

- 本 Skill **仅检测冗余，不修改代码**
- 提供精确的行号和代码片段
- 对每个冗余点标注严重程度（高/中/低）
- 区分"完全重复"和"相似代码"

## 目录结构

```
code-redundancy-checker/
├── SKILL.md                          # 主 Skill 定义
├── README.md                         # 本文档
└── atomic-skills/
    ├── duplicate-code-detection/     # 重复代码检测
    │   └── SKILL.md
    ├── unused-code-detection/        # 死代码检测
    │   └── SKILL.md
    └── redundancy-report/            # 冗余报告生成
        └── SKILL.md
```

## 版本

- v1.0 - 初始版本