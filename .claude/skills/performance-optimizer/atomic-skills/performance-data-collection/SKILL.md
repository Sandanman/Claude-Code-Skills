---
name: performance-data-collection
description: 收集性能数据（Lighthouse、Web Vitals、DevTools指标），在需要建立性能基线或评估当前性能状态时触发
---

# Performance Data Collection

## 概述

Performance Data Collection 是性能优化流程的起点，负责从多个数据源系统性地收集项目的性能数据，包括 Lighthouse 审计结果、Web Vitals 真实用户体验指标、Chrome DevTools Performance Timeline 数据以及 Bundle 分析数据。这些数据为后续的性能分析提供客观、可量化的基础。

## 核心能力

- 运行 Lighthouse CI 获取全面的性能评分（Performance、Accessibility、Best Practices、SEO）
- 提取 Core Web Vitals 指标：LCP（最大内容绘制）、FID（首次输入延迟）、CLS（累积布局偏移）
- 收集 Chrome DevTools Performance Timeline 数据（长任务、强制重排、网络请求）
- 使用 webpack-bundle-analyzer 或 vite-bundle-visualizer 分析 Bundle 体积分布
- 扫描资源加载情况（图片、CSS、JS 加载顺序和大小）
- 收集网络请求性能数据（TTFB、Content Download、DNS Lookup）

## 输入

- **ProjectContext**: 项目根目录路径和技术栈信息
- **PerformanceTargets**: 需要重点关注的目标页面或组件路径（如 `/dashboard`、`/login`）
- **CollectionConfig**: 数据收集配置（是否启用 Lighthouse、是否分析 Bundle、采样时长）

## 输出

- **PerformanceBaselineReport**: JSON格式的性能基线报告，包含所有收集到的指标数据
- **LighthouseReport**: Lighthouse 完整审计结果（JSON + HTML）
- **WebVitalsReport**: 真实用户监控数据或实验室数据
- **BundleAnalysisReport**: Bundle 体积分析报告（各模块大小、依赖关系）
- **ResourceLoadReport**: 资源加载时序报告

**输出示例格式**:
```json
{
  "timestamp": "2026-05-21T10:00:00Z",
  "project": "{{PROJECT_NAME}}",
  "lighthouse": {
    "performance": 72,
    "first-contentful-paint": 1800,
    "largest-contentful-paint": 3200,
    "total-blocking-time": 450,
    "cumulative-layout-shift": 0.12
  },
  "webVitals": {
    "LCP": 3200,
    "FID": 85,
    "CLS": 0.12
  },
  "bundle": {
    "totalSize": 2450000,
    "gzippedSize": 820000,
    "modules": [...]
  }
}
```

## 执行逻辑

1. **环境检查**: 验证项目依赖已安装、开发服务器是否运行
2. **Lighthouse 执行**: 对目标页面运行 Lighthouse CLI，收集 Performance、Accessibility 等指标
3. **Web Vitals 采集**: 使用 `web-vitals` 库或 Puppeteer 采集 LCP、FID、CLS 数据
4. **Bundle 分析**: 运行 Bundle 分析工具，输出各模块体积报告
5. **DevTools 数据提取**: 通过 Puppeteer 提取 Performance Timeline 中的长任务和网络请求数据
6. **数据汇总**: 整合所有数据源，生成统一的 PerformanceBaselineReport
7. **数据持久化**: 将报告保存至 `.claude/outputs/performance/` 目录

## 依赖关系

- 依赖: 无
- 被依赖: performance-analysis

## 完成标准

1. Lighthouse 成功执行并返回所有关键指标（Performance Score、FCP、LCP、TTFB、CLS、TBT）
2. Web Vitals 数据成功采集（至少包含 LCP、FID、CLS）
3. Bundle 分析完成，输出各模块体积分布
4. 生成 `performance-baseline-report.json` 并保存到指定目录
5. 数据完整率达到 100%（无缺失的关键指标）