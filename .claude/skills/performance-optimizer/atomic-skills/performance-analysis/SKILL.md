---
name: performance-analysis
description: 分析性能数据，识别加载、渲染、Bundle体积瓶颈，在收集到性能数据后自动触发
---

# Performance Analysis

## 概述

Performance Analysis 是性能优化流程的第二阶段，接收来自 performance-data-collection 的性能基线报告，通过系统性分析识别出影响应用性能的关键瓶颈。分析覆盖三大维度：加载性能（首屏渲染速度、网络请求效率）、渲染性能（重排重绘、长任务阻塞）和 Bundle 体积（重复依赖、过大约束、未分割代码）。分析结果以结构化报告形式输出，为后续的优化策略设计提供依据。

## 核心能力

- **加载瓶颈分析**: 分析 FCP、LCP、TTFB 等指标异常原因（阻塞资源、渲染阻塞CSS/JS、服务器响应慢）
- **渲染瓶颈分析**: 识别长任务（>50ms 的 JavaScript 执行）、强制同步布局、频繁重排重绘
- **Bundle 瓶颈分析**: 识别大体积模块、重复依赖、Tree-shaking 失效、动态 import 缺失
- **资源加载分析**: 分析资源加载顺序、关键路径资源优化空间、图片资源优化空间
- **优先级排序**: 根据影响程度（Performance Score 权重）对瓶颈进行优先级排序
- **根因定位**: 精确定位到具体文件、代码行或依赖包

## 输入

- **PerformanceBaselineReport**: performance-data-collection 输出的性能基线报告（JSON格式）
- **SourceCodeContext**: 项目源码结构，用于定位瓶颈对应的代码位置
- **AnalysisScope**: 分析范围（全部/仅首屏/仅关键路由/仅Bundle）

## 输出

- **PerformanceBottleneckReport**: 性能瓶颈分析报告，列出所有识别出的瓶颈及根因
- **BottleneckSeverityRanking**: 瓶颈严重程度排名（Critical/High/Medium/Low）
- **OptimizationCandidates**: 可优化项清单，每个瓶颈对应具体的优化建议
- **ImpactEstimate**: 每个瓶颈对整体性能评分的影响估算

**输出示例格式**:
```json
{
  "timestamp": "2026-05-21T10:05:00Z",
  "totalBottlenecks": 8,
  "criticalBottlenecks": 2,
  "bottlenecks": [
    {
      "id": "BN-001",
      "category": "render-blocking",
      "severity": "critical",
      "metric": "FCP",
      "impactScore": 25,
      "description": "第三方字体加载阻塞首屏渲染",
      "rootCause": "fonts.googleapis.com CSS阻塞了关键渲染路径",
      "location": "index.html:12",
      "suggestion": "使用 font-display: swap 或预连接"
    }
  ]
}
```

## 执行逻辑

1. **数据解析**: 解析 PerformanceBaselineReport，提取所有性能指标
2. **阈值比对**: 将指标与 Web Vitals 良好阈值对比（LCP < 2.5s, FID < 100ms, CLS < 0.1）
3. **加载分析**: 扫描 HTML 中的 `<link rel="stylesheet">`、同步 `<script>`、阻塞型字体
4. **渲染分析**: 分析长任务、强制同步布局、DOM 深度、事件处理复杂度
5. **Bundle分析**: 解析 Bundle 报告，识别 > 100KB 的模块、重复的 npm 包
6. **优先级计算**: 基于 Performance Score 影响权重计算各瓶颈优先级
7. **报告生成**: 生成结构化报告，包含瓶颈描述、根因、位置、优化建议

## 依赖关系

- 依赖: performance-data-collection
- 被依赖: benchmark-generation, optimization-strategy-design

## 完成标准

1. 所有关键性能指标均已分析并有对应瓶颈说明
2. 瓶颈数量 >= 3（确保分析覆盖全面）
3. 每个瓶颈包含：severity（严重程度）、rootCause（根因）、location（位置）、suggestion（优化建议）
4. 生成 `performance-bottleneck-report.md` 并保存
5. 输出至少 1 个 Critical 级别的瓶颈（如存在）