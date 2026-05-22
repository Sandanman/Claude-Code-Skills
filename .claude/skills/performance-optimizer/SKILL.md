---
name: performance-optimizer
description: 专注于前端性能优化，通过性能分析、基准测试生成和优化验证，系统化地提升应用性能（首屏加载、渲染性能、资源体积等）
---

# Performance Optimizer

## 概述
Performance Optimizer 是前端项目的系统性性能优化技能，通过数据收集、性能分析、基准测试生成、优化方案设计与应用、优化效果验证六个原子技能的协同工作，帮助开发者识别性能瓶颈并实施有效的优化方案。适用于项目启动阶段性能基线建立、迭代过程中的性能回归修复、以及重大版本发布前的性能调优。

## 核心能力
- 收集多维度性能数据（Lighthouse、Web Vitals、DevTools Performance Timeline）
- 识别加载性能、渲染性能、Bundle体积三大维度的瓶颈
- 生成可量化的基准测试，支持优化前后的效果对比
- 设计并应用代码分割、懒加载、缓存策略、资源压缩等优化方案
- 验证优化效果，确保功能正确性并量化性能提升

## 执行流程
1. **performance-data-collection** - 收集 Lighthouse、Web Vitals、DevTools 等性能数据
2. **performance-analysis** - 分析数据，识别加载、渲染、Bundle体积瓶颈
3. **benchmark-generation** - 生成性能基准测试用例，量化优化前后差异
4. **optimization-strategy-design** - 设计优化策略（代码分割、懒加载、缓存、压缩）
5. **optimization-application** - 应用优化策略，生成优化后的代码
6. **optimization-verification** - 验证优化效果，对比性能指标变化

## 原子skill依赖关系
- **performance-data-collection**: 无依赖
- **performance-analysis**: 依赖 performance-data-collection
- **benchmark-generation**: 依赖 performance-analysis
- **optimization-strategy-design**: 依赖 performance-analysis, benchmark-generation
- **optimization-application**: 依赖 optimization-strategy-design
- **optimization-verification**: 依赖 optimization-application

## 主skill完成标准
1. 成功收集项目当前性能数据并生成报告
2. 识别出至少3个有效性能瓶颈
3. 生成基准测试用例覆盖主要性能场景
4. 设计并应用至少3个优化策略
5. 优化后在关键指标上有可量化的提升（LCP、FCP、FCP、Bundle Size）
6. 生成优化验证报告，对比优化前后的数据变化

## 重试规则
- 每个原子skill失败后可重试 **3次**
- 重试间隔为指数退避：1s、4s、16s
- 连续3次失败后终止主skill执行，记录断点状态

## 触发关键词
- 性能优化
- 首屏加载优化
- 渲染性能
- 资源体积
- 加载速度优化
- Web Vitals
- Lighthouse
- bundle优化
- 懒加载
- 代码分割

## 注意事项
- 执行前需确认项目已安装依赖并可正常运行
- 性能数据收集需要在本地开发服务器运行状态下进行
- 对于大型项目，建议分模块逐步优化，优先处理影响核心指标的场景
- 优化方案需要根据实际业务场景选择，避免过度优化

## 文件系统位置
- 主skill路径: ./.claude/skills/performance-optimizer/SKILL.md
- 原子skill路径: ./.claude/skills/performance-optimizer/atomic-skills/下各子目录