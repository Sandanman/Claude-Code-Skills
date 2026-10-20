---
name: code-optimizer
description: 系统化分析并优化代码质量、冗余和运行性能，生成可执行方案，按用户确认应用代码变更，完成基准验证并同步相关文档。
version: 3.0
---

# Code Optimizer 主 Skill

## 概述

Code Optimizer 面向代码质量、可维护性和性能优化任务。它先建立可复现的质量与性能基线，再识别冗余和可优化模式，提出可审阅的方案；只有在用户确认后才应用变更，最后执行功能、质量和性能验证并更新相关文档。

## 核心能力

- 代码质量分析：复杂度、代码异味、可维护性和安全风险
- 冗余检查：重复代码、死代码、冗余导入及 TypeScript/Vue 类型冗余
- 性能分析：Web Vitals、渲染/执行效率、资源加载和 Bundle 体积
- 基准测试：生成 Before 快照和可重复的性能测试配置
- 优化方案：针对每个问题提供风险、收益、影响范围和实施步骤
- 代码应用：执行用户确认的代码重构、依赖按需引入和构建配置优化
- 验证与文档：对比 Before/After，运行测试并同步注释、README 或 API 文档

## 七原子 Skill DAG

```text
quality-and-perf-analysis ─┐
                           ├─> pattern-and-benchmark-recognition
redundancy-check ──────────┘              │
                                          v
                              optimization-proposal
                                          │
                                          v
                                code-optimization
                                          │
                                          v
                              optimization-verification
                                          │
                                          v
                                documentation-update
```

| 原子 Skill | 依赖 | 主要输出 |
|---|---|---|
| `quality-and-perf-analysis` | 无 | `quality_report`、`perf_baseline`、`bundle_analysis` |
| `redundancy-check` | 无 | `redundancy_report` |
| `pattern-and-benchmark-recognition` | 前两个原子 Skill | `patterns`、`benchmarks`、`metrics_baseline` |
| `optimization-proposal` | `pattern-and-benchmark-recognition` | `proposals`、推荐方案和风险说明 |
| `code-optimization` | `optimization-proposal`、用户确认 | `applied_changes`、变更报告 |
| `optimization-verification` | `code-optimization` | `verification_report`、PASS/FAIL 结论 |
| `documentation-update` | `optimization-verification` | `doc_updates` |

## 并行执行策略

1. `quality-and-perf-analysis` 与 `redundancy-check` 使用同一目标范围并行执行；两者只读项目文件，不互相覆盖输出。
2. `pattern-and-benchmark-recognition` 等待两个上游报告完成后并行执行模式识别和基准配置生成。
3. 方案、应用、验证和文档阶段按 DAG 顺序执行，避免下游使用不完整数据。
4. 每个阶段把结构化结果写入共享上下文 `.claude/skills/tasks/current/task_skill.md`；无法写入时保留阶段结果并报告原因。

## 输入契约

```yaml
required:
  target: 目标文件、目录或页面路径
optional:
  goal: 优化目标和约束
  test_command: 项目测试命令
  build_command: 项目构建命令
  performance_target: 性能测试页面或场景
  selected_proposal: 用户确认的方案
```

目标范围不明确、存在未确认的破坏性修改或缺少必要运行条件时，先记录阻塞项，不擅自扩大范围。

## 输出契约

所有报告必须说明目标范围、使用的命令/工具、实际结果、未完成项和文件路径。共享上下文使用以下键：

```yaml
quality_report: object
perf_baseline: object
bundle_analysis: object
redundancy_report: object
patterns: array
benchmarks: object
metrics_baseline: object
proposals: array
applied_changes: array
verification_report: object
doc_updates: array
```

阶段报告可写入项目既有输出目录；若项目未约定目录，使用 `.claude/outputs/code-optimizer/`，不得伪造不存在的路径或测试结果。

## 完成标准

- 质量、冗余和性能分析均已完成，或明确记录降级结果和原因
- 每个重要问题有文件路径、位置、严重级别、证据和建议
- 基准快照可复现，Before/After 使用相同条件；没有性能数据时不得宣称性能提升
- 优化方案明确列出影响范围、风险、预期收益和验证方式
- 代码变更仅来自用户确认的方案，语法、类型、构建和相关测试结果已记录
- 验证报告包含功能回归、安全检查、质量和性能对比，并明确 PASS、PARTIAL 或 FAIL
- 文档更新与实际变更一致；不存在文档时记录跳过原因

## 重试与错误处理

- 原子 Skill 失败时记录错误、已执行命令和上下文，修复输入或环境后最多重试 2 次。
- 上游报告缺失或为空时暂停依赖它的阶段，不用猜测数据；可执行的独立阶段继续并标记降级。
- 性能工具或开发服务器不可用时执行静态分析或手动基准配置，并在报告中标记“未实测”。
- 应用阶段发生冲突、语法错误或测试失败时停止后续阶段，保留失败位置并等待修正。
- 验证 FAIL 时返回 `code-optimization`，仅在用户确认后重新应用；不得循环覆盖用户变更。

## 共享上下文

共享上下文只保存本任务的结构化输入、阶段输出、命令和状态。下游优先读取上游已确认结果，发现目标文件或基线变化时重新验证，不把旧结果当作当前事实。敏感信息、Token、密钥和完整环境变量不得写入共享上下文或报告。

## 安全边界

- 默认只读分析；任何代码、配置、依赖或文档写入都必须来自用户明确确认的方案。
- 不修改目标范围之外的文件，不执行删除、发布、外部写入或危险命令。
- 变更前可在用户确认后按项目约定创建备份；回滚或恢复同样是用户确认后的可选机制，不自动生成或执行回滚脚本。
- 不为了达到指标引入未经批准的依赖、降低安全检查或改变业务行为。
- 真实性能数据、测试结果和风险必须如实记录，禁止用示例数字替代实测结果。

## 触发关键词

优化代码、代码重构、性能优化、代码质量、消除重复、清理死代码、首屏加载、渲染性能、Lighthouse、Bundle、Web Vitals。
