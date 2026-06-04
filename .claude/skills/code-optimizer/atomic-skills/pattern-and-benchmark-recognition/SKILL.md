---
name: pattern-and-benchmark-recognition
description: 识别可优化的代码模式和生成性能基准测试用例。Task Folding 将 pattern-recognition 和 benchmark-generation 合并为并行执行的分析层技能，为 optimization-proposal 提供模式列表和基准测试配置。
version: 1.0
merged_from:
  - pattern-recognition (from code-optimizer)
  - benchmark-generation (from performance-optimizer)
tau_layer: analysis
---

# Pattern and Benchmark Recognition 原子Skill

> 本 Skill 是 Task Folding 的产物，将 `pattern-recognition` 和 `benchmark-generation` 合并为并行执行的分析层技能。

---

## 概述

识别可优化的代码模式和生成性能基准测试用例。分析层（Layer 2）同时处理代码模式识别和性能基准测试，两个任务并行执行，分别基于质量报告和性能基线数据。

**τ 压缩依据**：两个任务都依赖 `quality-and-perf-analysis` 的输出，可以并行执行。合并后 τ 节省约 25%（从串行 ~1600 τ 降至并行 ~1200 τ）。

---

## 核心能力

### 模式识别（来自 pattern-recognition）
- 识别低效算法模式（O(n²) → O(n)、重复计算）
- 检测冗余逻辑模式（重复判断、冗余监听）
- 发现不良实践模式（大组件、长方法、嵌套过深）
- 定位性能瓶颈（频繁 DOM 操作、未使用 computed/memo）
- 提取可复用模式（组件拆分、函数提取）

### 基准测试生成（来自 benchmark-generation）
- 生成基于 Lighthouse CI 的自动化性能基准测试脚本
- 为每个关键页面生成独立的基准测试用例
- 设计性能指标对比框架（Before/After 差值计算）
- 生成模拟真实用户场景的测试用例（滚动、点击、输入）
- 输出结构化的基准测试报告，支持 CI 集成

---

## 并行执行策略

```python
# Skill Stacking: 同层并行执行
pattern_task = execute_async(
    pattern_recognition,
    quality_report  # 来自共享上下文
)
benchmark_task = execute_async(
    benchmark_generation,
    perf_baseline  # 来自共享上下文
)

# 两个任务并行完成
patterns = await pattern_task
benchmarks = await benchmark_task

write_to_shared_context("patterns", patterns)
write_to_shared_context("benchmarks", benchmarks)
write_to_shared_context("metrics_baseline", extract_metrics(perf_baseline))
```

---

## 输入

- **quality_report**：来自 `quality-and-perf-analysis` 的质量分析报告（从共享上下文读取）
- **perf_baseline**：来自 `quality-and-perf-analysis` 的性能基线数据（从共享上下文读取）

**共享上下文读取优先级**：
1. 优先从 `task_skill.md` 共享上下文读取
2. 仅在上下文缺失时重新读取文件

---

## 输出

```markdown
# Pattern and Benchmark Report

## 识别的代码模式

### 模式 1：低效算法 - 重复日期格式化（优先级：高）
- 类型：性能相关
- 位置：MeetingCard.vue:45-48, 89-92
- 问题：每次渲染都重新格式化日期，未使用缓存
- 预期收益：渲染时间减少 5-10%

### 模式 2：大函数模式 - handleJoinMeeting 过长（优先级：高）
- 类型：可维护性相关
- 位置：MeetingCard.vue:78-125（48 行）
- 问题：单方法包含多个职责（验证/权限/网络/状态）

### 模式 3：XSS 风险 - v-html 渲染用户输入（优先级：高）
- 类型：安全相关
- 位置：MeetingCard.vue:145

---

## 基准测试配置

### 测试用例（5 个）
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
      "name": "homepage-cls",
      "metric": "cumulative-layout-shift",
      "target": "https://localhost:3000/",
      "threshold": 0.1,
      "unit": "score"
    },
    {
      "name": "bundle-size-main",
      "metric": "total-bundle-size",
      "target": "./dist/assets/",
      "threshold": 500000,
      "unit": "bytes"
    },
    {
      "name": "meeting-card-render",
      "metric": "render-time",
      "target": "src/components/MeetingCard.vue",
      "threshold": 50,
      "unit": "ms"
    }
  ]
}
```

### 基线快照
```json
{
  "lcp": 3200,
  "fcp": 1800,
  "cls": 0.12,
  "tbt": 450,
  "bundle_size": 2450000,
  "timestamp": "2026-06-04T10:00:00Z"
}
```

## Skill Stacking 输出规范

```python
SHARED_CONTEXT = {
    "patterns": [
        {
            "name": "重复日期格式化",
            "type": "performance",
            "priority": "high",
            "location": "MeetingCard.vue:45-48,89-92",
            "expected_benefit": "渲染时间 -5-10%"
        },
        # ...
    ],
    "benchmarks": {
        "test_cases": [...],
        "baseline_snapshot": {...}
    },
    "metrics_baseline": {
        "lcp": 3200, "fcp": 1800, "cls": 0.12,
        "bundle_size": 2450000
    }
}
```

---

## τ 预算

| 分项 | τ 预算 | 说明 |
|------|--------|------|
| pattern_recognition | ~600 τ | 分析质量报告，提取模式 |
| benchmark_generation | ~600 τ | 生成测试用例，保存基线 |
| merge_and_prioritize | ~200 τ | 合并两份报告，按优先级排序 |
| **总计** | **~1400 τ** | 并行执行，节省约 400 τ |

---

## 依赖关系

- 依赖：`quality-and-perf-analysis`（必须先完成）
- 并行关系：`pattern-recognition` 和 `benchmark-generation` 可并行执行
- 被依赖：`optimization-proposal`

---

## 完成标准

1. 识别至少 3 种代码模式，每个含位置、问题描述、预期收益
2. 生成至少 5 个基准测试用例，每个含 name/metric/target/threshold/unit
3. 基线快照已保存，可用于后续 Before/After 对比
4. 输出两份报告（模式列表 + 基准测试配置）
5. 共享上下文命中率 >= 70%
6. 所有输出持久化到 `.claude/outputs/` 目录

---

## 错误处理

- **质量报告为空**：报错并退出
- **性能基线缺失**：跳过 benchmark-generation，仅执行 pattern-recognition
- **代码文件读取失败**：跳过该模式并记录警告
- **Lighthouse 未配置**：生成手动测试用例配置（替代自动化）

---

## 注意事项

- 两个任务独立并行，使用不同的输入数据，无冲突
- 模式识别基于通用最佳实践，需人工确认业务相关权衡
- 基准测试用例需要项目在开发服务器运行状态下才能执行
- 优先从共享上下文读取上游数据，避免重复解析

## 原子skill位置

`.claude/skills/code-optimizer/atomic-skills/pattern-and-benchmark-recognition/SKILL.md`