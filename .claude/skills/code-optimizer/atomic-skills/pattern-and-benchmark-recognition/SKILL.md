---
name: pattern-and-benchmark-recognition
description: 基于质量、性能和冗余报告识别低效算法、重复逻辑、渲染问题和资源瓶颈，并生成可复现的 Before 基准配置。
version: 2.0
---

# Pattern and Benchmark Recognition 原子 Skill

## 概述

分析上游报告，归并相互关联的问题，定位可优化模式，并为可测量的目标生成基准配置。

## 核心能力

- 识别低效算法、重复计算、过深嵌套、大组件和不必要渲染
- 关联冗余、质量异味与性能瓶颈，按影响和风险排序
- 生成 Lighthouse、Web Vitals、Bundle 或场景基准配置
- 保存可复现的 Before 快照，明确环境、命令、阈值和限制

## 输入

从共享上下文读取 `quality_report`、`perf_baseline`、`bundle_analysis` 和 `redundancy_report`。缺失时只重新读取必要文件，并记录原因。

## 输出

共享上下文键：`patterns`、`benchmarks`、`metrics_baseline`。每个模式必须包含路径/位置、问题证据、优先级、影响和候选验证方法；每个基准必须包含场景、指标、目标、运行条件和结果记录位置。

## 执行逻辑

1. 并行处理质量/冗余模式归并和性能基准设计。
2. 去除重复问题，保留原始证据和数据来源。
3. 生成 Before 快照；工具不可用时输出手动执行配置并标记未实测。

## 依赖关系

- 依赖：`quality-and-perf-analysis`、`redundancy-check`
- 被依赖：`optimization-proposal`

## 完成标准

所有高影响问题均有具体位置和证据；基准配置可复现且包含必要运行条件；任何缺少实际数据的指标都明确标记为未实测。

## 错误处理

质量或冗余报告缺失时暂停依赖数据的归并；性能基线缺失时仍可生成代码模式，但不得伪造性能基线；目标无法读取时记录并跳过。

## 安全边界

不修改源代码、不执行未经批准的外部请求；基准只使用用户授权的本地或项目环境。
