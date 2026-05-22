---
name: optimization-verification
description: 验证优化效果，对比优化前后的性能指标，在应用优化策略后触发
---

# Optimization Verification

## 概述

Optimization Verification 是性能优化流程的收尾阶段，负责运行优化后的应用，通过基准测试验证优化效果，生成 Before/After 对比报告，并判断优化是否达到预期目标。如未达标，分析原因并决定是否需要重新迭代优化。

## 核心能力

- 运行基准测试套件，获取优化后的性能指标
- 对比优化前后的指标变化（差值和百分比）
- 计算整体 Performance Score 提升幅度
- 判断是否达到优化目标（基于预设阈值）
- 生成可视化的 Before/After 对比报告
- 如未达标，提供进一步优化的建议

## 输入

- **BaselineMetrics**: 优化前的基准指标（benchmark-generation 阶段保存）
- **OptimizationStrategyReport**: 应用的优化策略清单
- **AppliedChanges**: 已应用的代码变更列表
- **VerificationConfig**: 验证配置（是否重新运行 Lighthouse、是否在 CI 中验证）

## 输出

- **VerificationReport**: 优化验证报告，包含 Before/After 对比和结论
- **MetricsComparison**: 结构化的指标对比数据（JSON格式）
- **PassFailResult**: 每个指标的 PASS/FAIL 判定
- **IterationSuggestion**: 如未达标，后续进一步优化建议

**输出示例格式**:
```json
{
  "verificationTime": "2026-05-21T11:30:00Z",
  "overallResult": "PASS",
  "scoreImprovement": {
    "before": 72,
    "after": 89,
    "delta": 17,
    "improvementRate": "23.6%"
  },
  "metricsComparison": [
    {
      "metric": "largest-contentful-paint",
      "before": 3200,
      "after": 2100,
      "unit": "ms",
      "threshold": 2500,
      "beforePass": false,
      "afterPass": true,
      "improvement": "-34.4%"
    }
  ],
  "conclusion": "优化成功，Performance Score 提升 17 分，LCP 改善 34.4%"
}
```

## 执行逻辑

1. **测试运行**: 在优化后的代码上运行基准测试套件
2. **数据采集**: 收集优化后的各项性能指标
3. **对比计算**: 计算每个指标的优化前/后差值和百分比变化
4. **阈值判定**: 对比阈值配置，判断每个指标是否达标
5. **报告生成**: 生成结构化的验证报告（JSON + Markdown）
6. **结论判定**: 综合所有指标，判定整体优化是否成功
7. **后续建议**: 如未达标，生成进一步优化建议

## 依赖关系

- 依赖: optimization-application
- 被依赖: 无（主skill终点）

## 完成标准

1. 基准测试成功运行并返回所有指标数据
2. 生成完整的 Before/After 对比报告（JSON + Markdown格式）
3. 每个关键指标都有明确的 PASS/FAIL 判定
4. 整体 Performance Score 有提升（delta > 0）
5. 至少 60% 的指标达到 PASS 状态
6. 如未达标，输出后续优化建议