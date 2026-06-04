---
name: optimization-proposal
description: 基于模式识别报告和基准测试，生成优化方案（激进/保守/折中）。Task Folding 合并了 improvement-suggestion 和 optimization-strategy-design 的策略设计部分，统一输出优化方案文档。
version: 1.0
merged_from:
  - improvement-suggestion (from code-optimizer)
  - optimization-strategy-design (from performance-optimizer)
tau_layer: generation
---

# Optimization Proposal 原子Skill

> 本 Skill 是 Task Folding 的产物，将 `improvement-suggestion` 的方案生成和 `optimization-strategy-design` 的策略设计合并为统一的生成层技能。

---

## 概述

基于模式识别报告和基准测试，生成优化方案。为每个识别出的代码模式和性能瓶颈设计具体、可执行的优化策略，提供激进/保守/折中三个选项供用户决策。

**τ 压缩依据**：将原来分散在两个 Skill 中的方案生成逻辑统一，减少跨 Skill 上下文传递开销。

---

## 核心能力

### 代码质量维度（来自 improvement-suggestion）
- 为每个代码模式生成优化方案（激进/保守/折中）
- 提供具体的代码修改建议（diff 格式）
- 评估每个方案的圈复杂度改善、重复率降低
- 说明预期收益和潜在风险

### 性能优化维度（来自 optimization-strategy-design）
- 设计资源加载策略（CDN、压缩、预加载）
- 设计代码分割策略（路由级/组件级懒加载）
- 设计缓存策略（HTTP Cache、Service Worker）
- 设计渲染优化策略（骨架屏、虚拟滚动、Intersection Observer）
- 设计依赖优化策略（按需引入、替换轻量替代品）
- 评估每个策略的预期 LCP/FCP/CLS 改善

---

## 输入

- **patterns**：来自 `pattern-and-benchmark-recognition` 的模式列表（从共享上下文读取）
- **benchmarks**：来自 `pattern-and-benchmark-recognition` 的基准测试配置（从共享上下文读取）
- **metrics_baseline**：性能指标基线快照（从共享上下文读取）

---

## 输出

```markdown
# Optimization Proposal Report

## 优化方案概览
- 模式问题总数：3 个（高优先级 2 个，中优先级 1 个）
- 性能瓶颈总数：2 个
- 推荐方案：激进方案（优先性能和可维护性）

---

## 代码质量问题优化方案

### 问题 1：重复日期格式化

#### 方案 1：激进优化（推荐）
- **修改内容**：
  ```diff
  -import { ref } from 'vue'
  +import { ref, computed } from 'vue'

  +const formatDate = (timestamp) => {
  +  const date = new Date(timestamp)
  +  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
  +}
  +
  +const formattedStartTime = computed(() => formatDate(props.meeting.startTime))
  +const formattedEndTime = computed(() => formatDate(props.meeting.endTime))
  ```
- **风险评估**：低
- **预期收益**：
  - 渲染时间减少 5-10%
  - 圈复杂度：无变化
  - 重复代码率：-3.5%

#### 方案 2：保守优化
- **修改内容**：提取 formatDate 为独立函数，保持调用方式
- **风险评估**：低
- **预期收益**：代码复用，无缓存机制

#### 方案 3：折中优化
- **修改内容**：使用缓存变量，但不做 computed
- **风险评估**：中
- **预期收益**：平衡性能和改动量

---

## 性能瓶颈优化方案

### 瓶颈 1：LCP 过长（当前 3200ms → 目标 < 2500ms）

#### 方案 1：激进优化（推荐）
- **策略**：路由级代码分割 + 资源预加载
- **修改内容**：
  ```diff
  const routes = [
  -  { path: '/dashboard', component: Dashboard }
  +  { path: '/dashboard', component: () => import('./views/Dashboard.vue') }
  ]
  ```
- **预期改善**：LCP -800ms，Bundle -35%
- **风险**：低
- **实施难度**：2h

#### 方案 2：保守优化
- **策略**：图片预加载 + CDN 配置
- **预期改善**：LCP -400ms
- **风险**：低
- **实施难度**：1h

#### 方案 3：折中优化
- **策略**：组件懒加载 + 骨架屏
- **预期改善**：LCP -500ms
- **风险**：低
- **实施难度**：3h

---

## 综合优化收益评估

| 维度 | 优化前 | 优化后（激进） | 改善 |
|------|--------|--------------|------|
| 圈复杂度 | 18.5 | 11.2 | -39.5% |
| 重复代码率 | 8.2% | 1.5% | -81.7% |
| LCP | 3200ms | 2400ms | -25.0% |
| Bundle Size | 2.45MB | 1.60MB | -35% |

## 推荐方案选择

**推荐激进方案**，理由：
1. 性能和代码质量同时最大化改善
2. 风险可控（均为低风险修改）
3. 实施难度在可接受范围内（总预计 5h）

---

## Skill Stacking 输出规范

```python
SHARED_CONTEXT = {
    "proposals": {
        "code_quality": [
            {
                "issue": "重复日期格式化",
                "selected_strategy": "computed_caching",
                "options": {
                    "aggressive": {...},
                    "conservative": {...},
                    "balanced": {...}
                },
                "selected": "aggressive",
                "expected_benefit": {...}
            }
        ],
        "performance": [
            {
                "bottleneck": "LCP 过长",
                "selected_strategy": "route_code_splitting",
                "options": {...},
                "selected": "aggressive",
                "expected_improvement": {"lcp": "-800ms", "bundle": "-35%"}
            }
        ]
    },
    "total_effort_hours": 5,
    "overall_risk": "low"
}
```

---

## τ 预算

| 分项 | τ 预算 | 说明 |
|------|--------|------|
| code_proposal_generation | ~500 τ | 为每个代码模式生成方案 |
| perf_strategy_design | ~500 τ | 为每个性能瓶颈设计策略 |
| merge_and_decide | ~300 τ | 合并方案，生成推荐决策 |
| generate_diff_examples | ~200 τ | 为每个方案生成 diff 示例 |
| **总计** | **~1500 τ** | 合并后比两个独立 skill 节省约 400 τ |

---

## 依赖关系

- 依赖：`pattern-and-benchmark-recognition`（必须先完成）
- 被依赖：`code-optimization`

---

## 完成标准

1. 为每个代码模式提供 3 个方案（激进/保守/折中），每个含 diff 修改
2. 为每个性能瓶颈提供至少 2 个策略，每个含预期改善数值
3. 每个方案包含：风险评估、实施难度、预期收益
4. 明确推荐方案并说明理由
5. 生成完整的综合收益评估表
6. 输出完整格式化的优化方案报告（markdown）

---

## 错误处理

- **模式列表为空**：报错并退出
- **基准测试缺失**：跳过性能策略，仅生成代码质量方案
- **用户未选择方案**：默认使用推荐方案（激进），标注"默认选择"
- **预期收益计算失败**：标注"需要运行时验证"

---

## 注意事项

- 激进方案追求最优效果，保守方案追求最小风险
- 所有方案都必须保证功能正确性
- 性能策略需要根据实际业务场景选择，避免过度优化
- 推荐方案综合考虑收益、风险和实施成本

## 原子skill位置

`.claude/skills/code-optimizer/atomic-skills/optimization-proposal/SKILL.md`