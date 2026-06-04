---
name: quality-and-perf-analysis
description: 并行执行代码质量静态分析和性能数据收集，统一输出质量报告 + 性能基线。Task Folding 合并了 code-quality-analysis + performance-data-collection，为 pattern-and-benchmark-recognition 提供双维度输入。
version: 1.0
merged_from:
  - code-quality-analysis
  - performance-data-collection (from performance-optimizer)
tau_layer: perception
---

# Quality and Perf Analysis 原子Skill

> 本 Skill 是 Task Folding 的产物，将 `code-quality-analysis` 和 `performance-data-collection` 合并为并行执行的感知层技能。

---

## 概述

并行执行代码质量静态分析和性能数据收集，统一输出质量报告和性能基线数据。作为优化管道的感知层（Layer 1），为后续分析层提供双维度输入。

**τ 压缩依据**：两个技能可以并行执行（无依赖关系），合并后 τ 节省约 30%（从串行 ~3000 τ 降至并行 ~1500 τ）。

---

## 核心能力

### 质量分析（来自 code-quality-analysis）
- 计算复杂度指标（圈复杂度、认知复杂度、函数长度）
- 检测重复代码段和代码克隆
- 识别常见代码异味（大组件、长方法、嵌套过深）
- 检查安全风险（XSS、硬编码密钥、eval 使用）
- 评估代码可维护性

### 性能数据收集（来自 performance-data-collection）
- 运行 Lighthouse CI 获取 Performance Score 和 Web Vitals 指标
- 采集 Core Web Vitals：LCP、FCP、CLS、TBT
- 使用 Bundle 分析工具（vite-bundle-visualizer / webpack-bundle-analyzer）分析体积分布
- 收集资源加载时序数据（TTFB、Content Download）
- 扫描大资源文件和未优化资源

---

## 并行执行策略

```python
# Skill Stacking: 同层并行执行
quality_task = execute_async(code_quality_analysis, target_files)
perf_task = execute_async(performance_data_collection, target_url)

# 两个任务并行，等待都完成后汇总
quality_report = await quality_task
perf_baseline = await perf_task

unified_output = merge_outputs(quality_report, perf_baseline)
write_to_shared_context("quality_report", quality_report)
write_to_shared_context("perf_baseline", perf_baseline)
```

---

## 输入

- 目标代码文件路径或目录路径
- 可选：额外的分析规则配置文件
- 可选：性能目标页面路径（如 `/dashboard`）

---

## 输出

```markdown
# Unified Analysis Report

## 质量分析报告

### 复杂度指标
- 圈复杂度：平均 18.5（目标 < 15）⚠️
- 认知复杂度：平均 12.3（目标 < 10）⚠️
- 重复代码率：8.2%（目标 < 5%）⚠️
- 异味数量：7 个

### 安全检查
- XSS 风险：1 处（v-html 使用）
- 硬编码密钥：无
- eval() 使用：无

### 质量评分：62/100（需要优化）

---

## 性能基线报告

### Lighthouse 指标
- Performance Score: 72/100 ⚠️
- FCP: 1800ms（目标 < 1800ms）⚠️ 边界
- LCP: 3200ms（目标 < 2500ms）❌
- TBT: 450ms（目标 < 200ms）❌
- CLS: 0.12（目标 < 0.1）❌

### Bundle 分析
- 总大小：2.45MB
- Gzip 大小：820KB
- 最大模块：vendor.js (1.2MB)

### 资源加载
- 未压缩图片：3 个（> 500KB）
- 同步加载的大组件：2 个

## 综合评估
- 质量：高优先级问题（圈复杂度、重复代码、XSS 风险）
- 性能：高优先级问题（LCP、Bundle 体积）
```

---

## Skill Stacking 输出规范

```python
# 输出到 task_skill.md 共享上下文
SHARED_CONTEXT = {
    "quality_report": {
        "complexity": {...},
        "duplication": {...},
        "code_smells": [...],
        "security": {...},
        "overall_score": 62,
    },
    "perf_baseline": {
        "lighthouse": {...},
        "web_vitals": {...},
        "bundle": {...},
        "resources": {...},
    },
    "unified_summary": {
        "quality_high_priority": [...],
        "perf_high_priority": [...],
        "combined_issues": [...],  # 跨维度关联问题
    }
}
```

---

## τ 预算

| 分项 | τ 预算 | 说明 |
|------|--------|------|
| quality_analysis | ~800 τ | 静态代码分析（可并行） |
| perf_collection | ~700 τ | Lighthouse + Bundle 分析 |
| merge_and_summarize | ~200 τ | 汇总双维度报告 |
| **总计** | **~1700 τ** | 串行需 ~3000 τ，并行节省约 43% |

---

## 依赖关系

- 依赖：无（首个感知层技能）
- 被依赖：`pattern-and-benchmark-recognition`（分析层）

---

## 完成标准

1. 质量报告包含：复杂度、重复率、异味、安全风险，至少 5 个质量点
2. 性能基线包含：Lighthouse 全部指标（Score/FCP/LCP/CLS/TBT）、Bundle 分析
3. Web Vitals 数据完整（LCP、FCP、CLS 至少）
4. 共享上下文命中率目标 >= 70%（下游优先从上下文读取）
5. 输出完整格式化的统一报告（markdown）
6. 数据持久化到 `.claude/outputs/performance/` 目录

---

## 错误处理

- **文件不存在**：报错并退出
- **Lighthouse 执行失败**：降级为静态性能分析，记录警告
- **Bundle 分析工具缺失**：跳过，标注"需要手动分析"
- **语法错误文件**：跳过并记录，不阻塞整体流程

---

## 注意事项

- 并行执行时，文件读取不冲突（两个技能读取不同维度）
- 质量分析是静态的，性能数据收集依赖开发服务器运行
- 共享上下文必须包含所有下游技能需要的数据，避免重复读取
- 某些"异味"可能是业务需要，需人工判断

## 原子skill位置

`.claude/skills/code-optimizer/atomic-skills/quality-and-perf-analysis/SKILL.md`