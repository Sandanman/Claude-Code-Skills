---
name: benchmark-generation
description: 生成性能基准测试用例，量化优化前后的性能差异，在完成性能分析后触发
---

# Benchmark Generation

## 概述

Benchmark Generation 负责生成可量化的性能基准测试用例，这些测试覆盖关键性能场景（如首屏加载、路由切换、大列表渲染），用于在优化前后运行并对比结果。基准测试是性能优化的量化依据，确保优化效果可测量、可复现、可证明。

## 核心能力

- 生成基于 Lighthouse CI 的自动化性能基准测试脚本
- 为每个关键页面生成独立的基准测试用例
- 设计性能指标对比框架（Before/After 差值计算）
- 生成模拟真实用户场景的测试用例（滚动、点击、输入等交互）
- 输出结构化的基准测试报告，支持 CI 集成

## 输入

- **PerformanceBottleneckReport**: performance-analysis 输出的瓶颈分析报告
- **ProjectContext**: 项目路由结构、技术栈、关键页面路径
- **TestConfig**: 测试配置（运行次数、并发数、设备模拟、throttle配置）

## 输出

- **BenchmarkTestSuite**: 基准测试用例集（Node.js 脚本或 Lighthouse CI 配置）
- **BaselineMetrics**: 优化前的基准指标快照
- **ThresholdConfig**: 性能阈值配置（每个指标的 PASS/FAIL 标准）
- **ComparisonReportTemplate**: 优化前后对比报告模板

**输出示例格式**:
```json
{
  "benchmarkSuite": "benchmark-runner.js",
  "testCases": [
    {
      "name": "homepage-fcp",
      "metric": "first-contentful-paint",
      "target": "https://localhost:3000/",
      "threshold": 1800,
      "unit": "ms"
    },
    {
      "name": "homepage-lcp",
      "metric": "largest-contentful-paint",
      "target": "https://localhost:3000/",
      "threshold": 2500,
      "unit": "ms"
    },
    {
      "name": "bundle-size-main",
      "metric": "total-bundle-size",
      "target": "./dist/assets/",
      "threshold": 500000,
      "unit": "bytes"
    }
  ]
}
```

## 执行逻辑

1. **关键场景识别**: 基于 bottleneck 报告和路由配置，识别需要测试的关键场景
2. **测试用例设计**: 为每个场景设计测试用例（URL、交互步骤、等待条件）
3. **阈值配置**: 基于基线报告设置 PASS/FAIL 阈值（通常取基线的 80% 或 Web Vitals 良好阈值）
4. **测试脚本生成**: 生成可执行的 Node.js 测试脚本（使用 Puppeteer + Lighthouse）
5. **基线快照**: 运行测试脚本，保存当前性能指标作为基准快照
6. **报告模板**: 生成 Before/After 对比报告模板

## 依赖关系

- 依赖: performance-analysis
- 被依赖: optimization-strategy-design

## 完成标准

1. 生成至少 5 个可执行的基准测试用例
2. 每个测试用例包含：name、metric、target、threshold、unit
3. 测试脚本可独立运行：`node benchmark-runner.js`
4. 基线快照已保存，可用于后续优化前后的对比
5. 生成 `benchmark-tests/` 目录包含所有测试文件和配置