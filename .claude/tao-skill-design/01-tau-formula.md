# τ_agent 公式与三指标体系

> **前置引用**：`00-theory.md` — 提供映射框架（2.1 核心映射表格）和 K1-K4 通俗类比
>
> **引用关系**：本文档被 `02-k1-k4.md`（三指标与 K1-K4 关系）和 `04-skill-design.md`（τ_budget 配置）引用。

---

# 2.1b 三指标体系（v1.4 — τ 驱动决策 + Token/时间辅助观测）

> **核心设计原则**：τ 驱动所有决策，Token 和 Duration 仅作为辅助观测指标，不参与决策。

## 2.1b.1 三指标职责分工

| 指标 | 角色 | 用途 | 告警阈值 | 决策参与 |
|------|------|------|---------|---------|
| **τ（主标准）** | 驱动所有决策 | 任务路由、Task Folding、紧急折叠、效率评分 | 80%警告/95%严重/100%终止 | ✅ **100% 决策驱动** |
| **Token（辅助 A）** | 成本/上下文窗口观测 | 上下文窗口压力、成本估算 | <20%警告/<5%严重 | 仅观测/告警，不阻断 |
| **Duration（辅助 B）** | 性能基准/异常检测 | ms/token 比值异常检测（正常<5ms） | >10ms/token 警告/>20ms/token 严重 | 仅观测/告警，不阻断 |

## 2.1b.2 τ 驱动决策的哲学基础

**华为韬定律的哲学**：在芯片设计中，τ（时间常数）是物理定律驱动的固有特性，不可违背。类比到 Agent 系统：

```
芯片领域：τ = RC（电阻×电容），是物理约束，驱动所有设计决策
         ↓
         不能通过"增大晶体管"来规避 τ 的物理限制
         必须通过架构创新（折叠、3D堆叠）来降低 τ

Agent 领域：τ_agent = duration_ms × 0.5 + tokens × 0.001，是系统约束
           ↓
           不能通过"无限增加 token"来规避 τ 的预算限制
           必须通过 Task Folding、Skill Stacking 来降低 τ_agent
```

## 2.1b.3 三指标量化公式

**τ（主标准 — 决策驱动）**：
```
τ = duration_ms × 0.5 + tokens × 0.001
```
- `duration_ms`：执行耗时（毫秒），直接反映响应速度
- `tokens`：Token 消耗，反映认知成本
- **权重 0.5 vs 0.001**：耗时主导（ms 量级），Token 为辅（千倍量级差异）
- 三档预算：simple=5,000 / moderate=15,000 / complex=50,000

**Token（辅助 A — 成本/上下文窗口）**：
```
token_efficiency = 1 - (token_consumed / token_budget)
token_drift = token_efficiency < tau_efficiency - 0.1
```
- 独立追踪，与成本对齐
- `token_drift = true` 时：Token 消耗偏高，可能存在未追踪的 LLM 调用
- 三档预算：simple=40,000 / moderate=80,000 / complex=200,000

**Duration（辅助 B — 性能基准/异常检测）**：
```
ms_per_token = duration_ms / max(tokens, 1)
duration_efficiency = 1 - (duration_consumed / duration_budget)
time_drift = duration_efficiency < tau_efficiency - 0.1
latency_ratio_high = ms_per_token > 10
```
- `ms_per_token`：正常值 < 5ms/token，>10 警告，>20 严重（可能死循环）
- `time_drift = true` 时：Duration 效率 < τ 效率 10% 以上，存在延迟异常

## 2.1b.4 三指标并行报告格式

步骤 8 结果输出时，同时输出三套指标：

```markdown
## 三指标分解报告

### τ 分解（主标准 — 决策驱动）
   总消耗: 7500 / 15000 (50.0%)
   ├─ intent:     800 (10.7%) [预算 1500]
   ├─ match:     1200 (16.0%) [预算 2250]
   ├─ plan:       400  (5.3%) [预算 750]
   ├─ exec:      4200 (56.0%) [预算 9000]
   ├─ validate:   500  (6.7%) [预算 750]
   └─ archive:    400  (5.3%) [预算 750]
   效率评分: 0.82 (优秀)  🟢
   折叠次数: 2 次（节省 35% exec τ）
   模式复用: 25% τ折扣（3个匹配模式）

### Token 分解（辅助标准 A — 成本/上下文窗口）
   总消耗: 45000 / 80000 (56.3%)
   ├─ intent:     4800 (10.7%) [预算 8000]
   ├─ match:     7200 (16.0%) [预算 12000]
   ├─ plan:       2400 (5.3%) [预算 4000]
   ├─ exec:    25200 (56.0%) [预算 48000]
   ├─ validate:   3000 (6.7%) [预算 4000]
   └─ archive:    2400 (5.3%) [预算 4000]
   效率评分: 0.78 (良好)  🟡
   预估成本: $0.45（辅助参考）

### Duration 分解（辅助标准 B — 延迟/性能基准）
   总消耗: 18000ms / 30000ms (60.0%)
   平均延迟: 0.40ms/token（正常 < 5ms/token）

### 综合指标
   上下文命中率: 68%
   Co-Design: Model=45% / Rules=30% / Skills=25%

### 异常标记
   ⚠️ token_drift：Token 效率(0.78) < τ 效率(0.82)，Token 消耗偏高
   ✓ latency_ratio：0.40ms/token，正常
   ✓ time_drift：无异常
```

## 2.1b.5 异常标记与告警机制

```python
# 综合异常检测
if tau_record["remaining_pct"] > 0.50 and (token_pct < 0.30 or duration_pct < 0.30):
    stream.warning(f"⚠️ 综合异常：τ 充足但 Token/时间偏紧，可能存在未追踪消耗")

# 三指标效率对比
if tau_efficiency - token_efficiency > 0.1:
    anomaly_flags["token_drift"] = True   # Token 消耗异常
if tau_efficiency - duration_efficiency > 0.1:
    anomaly_flags["time_drift"] = True    # 时间消耗异常
if duration_tracker.get_avg_ms_per_token() > 10:
    anomaly_flags["latency_ratio_high"] = True  # 延迟异常
```

## 2.1b.6 三指标与 K1-K4 的关系

| 韬定律技术 | τ（主标准）| Token（辅助A）| Duration（辅助B）|
|-----------|-----------|-------------|----------------|
| K1 Task Folding | ✅ 折叠触发（τ_remaining < 30%）| — | — |
| K2 Skill Stacking | ✅ 命中率追踪 | — | — |
| K3 Co-Design | ✅ 三层贡献度汇总 | 成本分析 | 性能基准 |
| K4 Pattern Mining | ✅ τ 折扣计算 | — | — |

---

# 2.2 τ_agent 量化定义

## 2.2.1 τ_agent 公式

```
τ_agent = τ_intent + τ_match + τ_plan + τ_exec + τ_validate

其中：
τ_intent    = 意图识别耗时
τ_match     = 技能匹配耗时
τ_plan      = 任务规划耗时（含 DAG 构建）
τ_exec      = 原子技能执行耗时（Σ 各 skill）
τ_validate  = 结果校验耗时

总性能 = f(任务质量) / τ_agent
```

### 三档预算配置

| 复杂度 | orchestrator τ 总预算 | 主Skill τ_budget（仅覆盖 exec） | Duration 预算（辅助观测）|
|--------|----------------------|-------------------------------|------------------------|
| simple | 5,000 | 2,500 | 15,000ms |
| moderate | 15,000 | 8,000 | 30,000ms |
| complex | 50,000 | 25,000 | 80,000ms |

### orchestrator τ 总预算流向

```
τ_intent    (≤10%) → orchestrator 内部消耗
τ_match     (≤15%) → orchestrator 内部消耗
τ_plan      (≤5%)  → orchestrator 内部消耗
τ_exec      (≥60%) → 分配给主 Skill 的 τ_budget（独立消耗，无双重计算）
τ_validate  (≤5%)  → orchestrator 内部消耗
────────────────────────────────
合计        100%   → 主 Skill τ_budget ≤ orchestrator τ_exec 预算
```

> ⚠️ **τ_budget 与 τ 量纲说明**：
> - orchestrator τ 总预算 = duration_ms × 0.5 + tokens × 0.001（复合指标）
> - 主 Skill τ_budget = 主 Skill 自身 exec 阶段的 τ 预算，与 orchestrator 解耦
> - Duration 预算 = 纯时间指标（毫秒），仅用于辅助观测，不参与决策

### complexity → τ_budget 档位映射

```
orchestrator 步骤 1 输出的 complexity_score：
    1-3   → simple 档
    4-6   → moderate 档
    7-10  → complex 档

主 Skill 的 τ_budget 从 skills_register.md 的 frontmatter 读取对应档位值。
若主 Skill 未定义某档位，则向上取档（如仅定义 simple/moderate，
complex 任务使用 moderate 档值并注明降级执行）。
```

## 2.2.2 三指标实现代码

```python
# ===== τ 主标准 =====
class TauController:
    TAU_BUDGETS = {
        "simple":    5_000,
        "moderate":  15_000,
        "complex":   50_000,
    }
    def record_step(self, step, duration_ms, tokens):
        tau = duration_ms * 0.5 + tokens * 0.001
        # τ 驱动决策：80%预警/95%严重/100%终止

# ===== Token 辅助标准 A =====
class TokenTracker:
    def record_step(self, step, duration_ms, tokens):
        self.consumed += tokens
        # Token 告警：<20% 警告 / <5% 严重（仅观测，不阻断）

# ===== Duration 辅助标准 B =====
class DurationTracker:
    def record_step(self, step, elapsed_ms, tokens):
        ms_per_token = elapsed_ms / max(tokens, 1)
        # 延迟异常检测：>10ms/token 警告 / >20ms/token 严重（仅观测）

# ===== 异常标记 =====
anomaly_flags = {
    "token_drift": token_efficiency < tau_efficiency - 0.1,
    "time_drift": duration_efficiency < tau_efficiency - 0.1,
    "latency_ratio_high": ms_per_token > 10,
}
```

**实现确认**：✅ **v1.4+v1.6 已完整实施**

---

**引用关系**：
- `02-k1-k4.md` — 引用本文档 2.1b.6 三指标与 K1-K4 关系表，以及 2.2.1 三档预算配置
- `04-skill-design.md` — 引用本文档 2.2.1 τ_budget 示例表格和 complexity 映射机制