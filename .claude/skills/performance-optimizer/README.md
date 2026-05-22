# Performance Optimizer

## 概述

Performance Optimizer 是前端项目的系统性性能优化技能，通过6个原子技能协同工作，从性能数据收集到优化效果验证，完整覆盖性能优化的全流程。

## 核心能力

- **多维度数据收集**: Lighthouse CI、Web Vitals (LCP/FID/CLS)、DevTools Performance Timeline、Bundle Analyzer
- **智能瓶颈分析**: 加载性能、渲染性能、Bundle体积三大维度全面分析
- **量化基准测试**: 生成可执行的基准测试脚本，量化优化前后差异
- **策略化优化**: 代码分割、路由懒加载、资源压缩、缓存策略等系统化方案
- **效果验证闭环**: Before/After对比报告，确认优化成效

## 适用场景

- 项目启动阶段建立性能基线
- 迭代过程中的性能回归修复
- 重大版本发布前的性能调优
- 首次接入性能监控的新项目

## 原子技能列表

| 原子技能 | 职责 |
|---------|------|
| performance-data-collection | 收集性能数据（Lighthouse、Web Vitals、DevTools） |
| performance-analysis | 分析数据，识别性能瓶颈 |
| benchmark-generation | 生成基准测试用例，量化性能差异 |
| optimization-strategy-design | 设计优化策略（代码分割、懒加载、缓存、压缩） |
| optimization-application | 应用优化策略，生成优化后的代码 |
| optimization-verification | 验证优化效果，对比指标变化 |

## 执行流程图

```
performance-data-collection
        ↓
performance-analysis
        ↓
benchmark-generation
        ↓
optimization-strategy-design
        ↓
optimization-application
        ↓
optimization-verification
```

## 输出产物

- `performance-baseline-report.json` - 原始性能基线数据
- `performance-bottleneck-report.md` - 瓶颈分析报告
- `benchmark-tests/` - 基准测试用例
- `optimization-strategy-report.md` - 优化策略方案
- `optimized-code/` - 优化后的代码（补丁形式）
- `optimization-verification-report.md` - 优化验证报告

## 快速开始

```bash
# 通过 orchestrator 触发
# 用户: "优化这个项目的首屏加载性能"

# 或直接使用主skill
# 在 Claude Code 中选择 performance-optimizer 技能
```