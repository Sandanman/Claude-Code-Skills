---
name: optimization-strategy-design
description: 设计性能优化策略（代码分割、懒加载、缓存、压缩），在完成瓶颈分析和基准测试后触发
---

# Optimization Strategy Design

## 概述

Optimization Strategy Design 是性能优化的核心决策阶段，接收性能瓶颈报告和基准测试数据，为每个识别出的瓶颈设计具体、可执行的优化策略。策略覆盖六大优化维度：资源加载优化（CDN、压缩、合并）、代码分割（路由级、组件级）、懒加载（图片、组件、路由）、缓存策略（HTTP Cache、Service Worker、Memory Cache）、渲染优化（虚拟列表、骨架屏、SSR）、依赖优化（按需引入、替换轻量替代品）。

## 核心能力

- **资源加载策略**: 设计 CDN 配置、资源压缩（JS/CSS/图片）、资源预加载/预获取方案
- **代码分割策略**: 设计路由级/组件级代码分割方案，减少首屏包体积
- **懒加载策略**: 设计图片懒加载、组件延迟加载、路由预加载策略
- **缓存策略**: 设计 HTTP Cache-Control、Service Worker、Etag/Last-Modified 缓存方案
- **渲染优化策略**: 设计骨架屏、虚拟滚动、Intersection Observer 懒渲染方案
- **依赖优化策略**: 分析大体积依赖，设计按需引入或替换方案

## 输入

- **PerformanceBottleneckReport**: 瓶颈分析报告，包含所有待优化的瓶颈
- **BaselineMetrics**: 基准测试指标，用于计算预期优化效果
- **ProjectContext**: 项目技术栈（Vue/React、Webpack/Vite、Node版本等）

## 输出

- **OptimizationStrategyReport**: 优化策略报告，包含每个瓶颈的优化方案和实施步骤
- **ExpectedImpact**: 每个策略实施后的预期性能提升估算
- **ImplementationPlan**: 优化实施计划，包含优先级排序和依赖关系
- **RiskAssessment**: 每个策略的风险评估（兼容性、破坏性、复杂度）

**输出示例格式**:
```yaml
strategies:
  - id: STR-001
    bottleneckId: BN-001
    strategy: route-level-code-splitting
    framework: vite
    implementation: |
      const routes = [
        { path: '/', component: () => import('./views/Home.vue') },
        { path: '/dashboard', component: () => import('./views/Dashboard.vue') }
      ]
    expectedImprovement:
      bundleSize: -35%
      lcp: -800ms
    risk: low
    effort: 2h
  - id: STR-002
    bottleneckId: BN-002
    strategy: image-lazy-loading
    implementation: |
      <img v-lazy="src" />
    expectedImprovement:
      initialLoad: -200ms
    risk: low
    effort: 1h
```

## 执行逻辑

1. **瓶颈聚合**: 将相似的瓶颈归类（加载类、渲染类、Bundle类）
2. **策略候选**: 针对每个瓶颈，列出所有适用的优化策略
3. **方案评估**: 评估每个策略的预期效果、实施难度、兼容性风险
4. **方案选择**: 根据投入产出比选择最优策略组合
5. **依赖排序**: 确定策略实施顺序（先无依赖再有关联依赖）
6. **实施计划**: 生成具体的实施步骤和代码示例
7. **报告输出**: 生成结构化的优化策略报告

## 依赖关系

- 依赖: performance-analysis, benchmark-generation
- 被依赖: optimization-application

## 完成标准

1. 每个 Critical/High 级别的瓶颈都有对应优化策略
2. 每个策略包含：implementation（具体代码）、expectedImprovement（预期改善）、risk（风险评估）
3. 策略实施计划按优先级排序，先易后难
4. 总预期性能提升 >= 30%（在关键指标上）
5. 生成 `optimization-strategy-report.md` 并保存