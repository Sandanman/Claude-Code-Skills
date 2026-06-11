# 华为韬定律 × AI Agent 系统设计（v1.2 问题修复版）

> 本文档将华为韬定律彻底拆解，并与现有 Claude Code Skills 架构（v1.4+v1.6 三指标版）对照验证。
> 对应 Orchestrator Pro v1.6，完整实现三指标体系（τ 驱动决策 + Token/时间辅助观测）。

---

# 第一部分：华为韬定律完全拆解

## 1.1 问题背景：摩尔定律的困境

要理解韬定律，先理解它解决什么问题。

**摩尔定律的核心逻辑**：
> 芯片上晶体管数量每 18 个月翻倍，性能提升一倍。

实现方式：**空间缩微**——把晶体管做越小，同样面积能放更多晶体管，算力更强。

**2026 年的现实困境**：

| 困境 | 说明 |
|------|------|
| 物理极限 | 晶体管已小到接近原子尺寸（~0.1nm），量子隧穿效应导致漏电失控 |
| 成本爆炸 | 先进制程（3nm/2nm）Fab建造成本超 200 亿美元，良率难以保证 |
| 设备封锁 | EUV 光刻机被限制进口，14nm 以下制程难以量产 |
| 功耗墙 | 晶体管密度翻倍 → 发热量翻倍，散热成为瓶颈 |

**结论**：继续走"把晶体管做小"的路线，收益递减、代价递增，行业需要新思路。

## 1.2 韬定律的核心思想

**一句话概括**：
> 从"空间缩微"转向"时间缩微"——不再执着于把芯片做小，而是让芯片跑得更快。

### 核心指标：τ（时间常数）

```
τ（时间常数）= 信号在芯片上传输一个逻辑门所需的时间
            = RC（电路电阻×电容）
```

**物理意义**：
- τ 越小 → 电路充放电越快 → 时钟频率可以越高 → 性能越强
- τ 与性能成**反比**：性能 ∝ 1/τ

**韬定律的核心公式**：

```
芯片性能 ∝ N / τ

N = 逻辑门数量（决定功能密度）
τ = 时间常数（决定运算速度）

摩尔定律：提升 N（更多晶体管，更小尺寸）
韬  定 律：降低 τ（全链路压缩延迟）
```

### 通俗类比：两条路爬楼

| | 摩尔定律 | 韬定律 |
|---|---|---|
| 目标 | 爬得更高（更多楼层） | 爬得更快（更短时间内到达） |
| 方法 | 把楼梯台阶做窄（缩小晶体管） | 缩短楼梯总高度、减少转弯（压缩延迟） |
| 瓶颈 | 台阶太窄走不稳（量子效应） | 楼道太长浪费时间 |
| 类比 | 给电梯提速 | 给电梯减重+装高速电机 |

## 1.3 四大关键技术拆解

### K1：逻辑折叠（Logical Folding）

**原意**：将原本平铺在芯片上的逻辑电路"折叠"起来，缩短导线长度。

**芯片上的问题**：
```
传统布线：信号从 A 点到 B 点，需要穿越整个芯片
          导线长 → RC 大 → τ 大 → 速度慢

折叠后：   将 A 和 B 折叠相邻，信号近距离传输
          导线短 → RC 小 → τ 小 → 速度快
```

**关键约束**：
- 折叠不是无限折叠，要平衡面积和连线延迟
- 需要算法找到"最优折叠路径"，不是暴力缩短所有连线

### K2：三维堆叠（3D Stacking）

**原意**：不再只追求单芯片缩小，而是把多个芯片层叠起来，用 TSV（Through-Silicon Via，硅通孔）垂直互联。

```
传统 2D 芯片：
┌────────────────────────┐
│     逻辑芯片 (CPU)       │
└────────────────────────┘

3D 堆叠芯片：
┌────────────────────────┐
│     内存层 (HBM)         │  ← TSV 垂直互联，延迟 < 1ns
├────────────────────────┤
│   逻辑芯片 (CPU/NPU)     │
├────────────────────────┤
│   基础芯片 (I/O/电源)    │
└────────────────────────┘

好处：
- 垂直互联比横向互联距离短 100 倍以上
- 不同工艺的芯片可以混合堆叠（逻辑用先进制程，内存用成熟制程）
```

**TSV 硅通孔的作用**：
- 层与层之间的"高速公路"，信号直上直下
- 带宽巨大、延迟极低
- 功耗比横向走线更低

### K3：全栈软硬件协同（Full-Stack Co-Design）

**原意**：芯片设计不再是硬件团队闭门造车，而是从应用到编译器到芯片架构全链路协同优化。

```
传统瀑布式：
  应用层 → 操作系统 → 编译器 → 指令集 → 芯片架构
                                          ↓
  各层独立优化，经常"上层白努力"（上层优化被下层瓶颈吃掉）

协同优化：
  应用特征 ─────────────────────→┐
                                ↓
  编译器优化 ←──→ 芯片微架构 ←──┘
       ↑              ↓
  操作系统 ←→ 指令集设计
```

**核心洞察**：
- 单独优化某一层，收益有限
- 系统级优化才能真正降低 τ
- 越接近应用层做优化，收益越大

### K4：成熟制程深挖（Deep Mature Process）

**原意**：与其追逐 2nm/EUV（被封锁、性能收益递减），不如把 14nm/28nm 这些成熟制程的潜力挖透。

**为什么 14nm 值得深挖**：
```
14nm 的问题不是"太小"，而是"太大"（同样功能占用面积大）

通过架构创新，可以在 14nm 上实现：
- 更高的主频（通过降低 τ）
- 更好的能效比（通过架构优化）
- 更高的良率（工艺更成熟）
- 更低的成本（设备不受封锁）

结果：用架构创新弥补制程差距
```

**类比**：
> 博尔特穿普通跑鞋，通过优化跑步姿态和步频，仍然比穿顶级跑鞋但姿态错误的人跑得快。

---

## 1.4 韬定律与摩尔定律的关系：互补而非颠覆

```
         摩尔定律                 韬定律
        "空间缩微"             "时间缩微"
            ↓                      ↓
    更多晶体管              更快的系统
    更好工艺节点            更好架构

    几何尺寸优化        系统架构提速
    (What the chip is)  (How the chip works)

         互补关系
    ┌─────────────────────┐
    │  后摩尔时代芯片演进   │
    │  = 摩尔定律 + 韬定律  │
    └─────────────────────┘
```

**韬定律的定位**：
- 不替代摩尔定律（不是"摩尔已死"）
- 从**时间维度**补充摩尔定律的**空间维度**
- 共同构成后摩尔时代完整的技术演进路径

---

# 第二部分：AI Agent 韬定律系统设计

## 2.1 核心映射框架

| 芯片领域 | AI Agent 领域 | 核心意义 |
|---------|--------------|---------|
| τ（时间常数） | **τ_agent**（响应延迟与认知成本） | 核心性能指标 |
| 摩尔定律（Scaling Law） | 模型参数增大路线 | 空间路线，逼近瓶颈 |
| **韬定律** | **Agent 韬定律** | 时间路线，优化响应路径 |
| 逻辑折叠 | 任务折叠（Task Folding） | 缩短执行路径 |
| 三维堆叠 | 技能栈叠（Skill Stacking） | 垂直互联复用 |
| 软硬协同 | 模型×规则协同（Co-Design） | 全栈优化 |
| 成熟制程 | 模式复用（Pattern Mining） | 跳出堆参数路线 |

## 2.1b 三指标体系（v1.4 新增 — τ 驱动决策 + Token/时间辅助观测）

> **核心设计原则**：τ 驱动所有决策，Token 和 Duration 仅作为辅助观测指标，不参与决策。

### 2.1b.1 三指标职责分工

| 指标 | 角色 | 用途 | 告警阈值 | 决策参与 |
|------|------|------|---------|---------|
| **τ（主标准）** | 驱动所有决策 | 任务路由、Task Folding、紧急折叠、效率评分 | 80%警告/95%严重/100%终止 | ✅ **100% 决策驱动** |
| **Token（辅助 A）** | 成本/上下文窗口观测 | 上下文窗口压力、成本估算 | <20%警告/<5%严重 | 仅观测/告警，不阻断 |
| **Duration（辅助 B）** | 性能基准/异常检测 | ms/token 比值异常检测（正常<5ms） | >10ms/token 警告/>20ms/token 严重 | 仅观测/告警，不阻断 |

### 2.1b.2 τ 驱动决策的哲学基础

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

**三指标关系图**：

```
                ┌─────────────────────────────────────────┐
                │           三指标并行追踪                  │
                │                                         │
  用户输入  ──→ │  ┌─────────────┐   ┌─────────────┐  ┌─────────────┐  ──→ 执行决策
                │  │ τ Controller │   │Token Tracker │  │Duration Tracker│
                │  │  (主标准)    │   │  (辅助A)    │  │  (辅助B)     │
                │  │  决策驱动 ✓  │   │  仅观测告警  │  │  仅观测告警  │
                │  └──────┬──────┘   └──────┬──────┘  └──────┬──────┘
                │         │                 │                 │
                │         ↓                 ↓                 ↓
                │    任务路由           Token 预算         ms/token 比值
                │    Task Folding       上下文压力          异常延迟检测
                │    紧急折叠           成本估算            死循环告警
                │    效率评分                               性能基准
                └─────────────────────────────────────────┘
```

### 2.1b.3 三指标量化公式

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

### 2.1b.4 三指标并行报告格式（v1.4 新增）

步骤 8 结果输出时，同时输出三套指标：

```markdown
## 三指标分解报告（v1.4 新增）

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

### 异常标记（v1.4 新增）
   ⚠️ token_drift：Token 效率(0.78) < τ 效率(0.82)，Token 消耗偏高
   ✓ latency_ratio：0.40ms/token，正常
   ✓ time_drift：无异常
```

### 2.1b.5 异常标记与告警机制

```python
# 综合异常检测
# τ 充足但 Token 或时间偏紧 → 潜在未追踪消耗
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

### 2.1b.6 三指标与 K1-K4 的关系

| 韬定律技术 | τ（主标准）| Token（辅助A）| Duration（辅助B）|
|-----------|-----------|-------------|----------------|
| K1 Task Folding | ✅ 折叠触发（τ_remaining < 30%）| — | — |
| K2 Skill Stacking | ✅ 命中率追踪 | — | — |
| K3 Co-Design | ✅ 三层贡献度汇总 | 成本分析 | 性能基准 |
| K4 Pattern Mining | ✅ τ 折扣计算 | — | — |

---

## 2.2 τ_agent 量化定义

### 2.2.1 τ_agent 公式

```
τ_agent = τ_intent + τ_match + τ_plan + τ_exec + τ_validate

其中：
τ_intent    = 意图识别耗时
τ_match     = 技能匹配耗时
τ_plan      = 任务规划耗时（含 DAG 构建）
τ_exec      = 原子技能执行耗时（Σ 各 skill）
τ_validate  = 结果校验耗时

总性能 = f(任务质量) / τ_agent

三指标预算配置（v1.1 修正）：
┌──────────┬────────────┬────────────┬──────────────────────────────────┐
│ 复杂度    │ orchestrator │ 主Skill τ_budget │ Duration 预算                │
│          │ τ 总预算    │ （仅覆盖 exec）   │ （辅助观测，非决策驱动）        │
├──────────┼────────────┼────────────┼──────────────────────────────────┤
│ simple   │ 5,000      │ 2,500       │ 15,000ms                         │
│ moderate │ 15,000     │ 8,000       │ 30,000ms                         │
│ complex  │ 50,000     │ 25,000      │ 80,000ms                         │
└──────────┴────────────┴────────────┴──────────────────────────────────┘

orchestrator τ 总预算流向：
  τ_intent    (≤10%) → orchestrator 内部消耗
  τ_match     (≤15%) → orchestrator 内部消耗
  τ_plan      (≤5%)  → orchestrator 内部消耗
  τ_exec      (≥60%) → 分配给主 Skill 的 τ_budget（独立消耗，无双重计算）
  τ_validate  (≤5%)  → orchestrator 内部消耗
  ─────────────────────────────────
  合计        100%   → 主 Skill τ_budget ≤ orchestrator τ_exec 预算

> ⚠️ τ_budget 与 τ 量纲说明：
> - orchestrator τ 总预算 = duration_ms × 0.5 + tokens × 0.001（复合指标）
> - 主 Skill τ_budget = 主 Skill 自身 exec 阶段的 τ 预算，与 orchestrator 解耦
> - Duration 预算 = 纯时间指标（毫秒），仅用于辅助观测，不参与决策
```

### 2.2.1b complexity → τ_budget 档位映射机制

```
orchestrator 步骤 1 输出的 complexity_score：
    1-3   → simple 档（直接映射）
    4-6   → moderate 档（直接映射）
    7-10  → complex 档（直接映射）

主 Skill 的 τ_budget 从 skills_register.md 的 frontmatter 读取对应档位值。
若主 Skill 未定义某档位，则向上取档（例如仅定义 simple/moderate，
complex 任务使用 moderate 档值并注明降级执行）。
```

### 2.2.2 现有代码中的三指标实现（✅ v1.4+v1.6 已完整实现）

v1.4+v1.6 Orchestrator Pro 中已完整实现三指标追踪：

```python
# ===== τ 主标准（v1.4 已实现）=====
class TauController:
    TAU_BUDGETS = {
        "simple":    5_000,
        "moderate":  15_000,
        "complex":   50_000,
    }
    def record_step(self, step, duration_ms, tokens):
        tau = duration_ms * 0.5 + tokens * 0.001
        # τ 驱动决策：80%预警/95%严重/100%终止

# ===== Token 辅助标准 A（v1.4 新增）=====
class TokenTracker:
    def __init__(self, budget):
        self.budget = budget
    def record_step(self, step, duration_ms, tokens):
        self.consumed += tokens
        # Token 告警：<20% 警告 / <5% 严重（仅观测，不阻断）

# ===== Duration 辅助标准 B（v1.4 新增）=====
class DurationTracker:
    def record_step(self, step, elapsed_ms, tokens):
        ms_per_token = elapsed_ms / max(tokens, 1)
        # 延迟异常检测：>10ms/token 警告 / >20ms/token 严重（仅观测）

# ===== 三指标并行追踪（步骤 5 执行控制）=====
tau_record = tau_controller.record_step(step="exec", ...)
token_record = token_tracker.record_step(step="exec", ...)
duration_record = duration_tracker.record_step(step="exec", ...)

# ===== 异常标记（v1.4 新增）=====
anomaly_flags = {
    "token_drift": token_efficiency < tau_efficiency - 0.1,
    "time_drift": duration_efficiency < tau_efficiency - 0.1,
    "latency_ratio_high": ms_per_token > 10,
}
```

**实现确认**：✅ **v1.4+v1.6 已完整实现**
- ✅ τ 作为主标准驱动所有决策（任务路由、Task Folding、紧急折叠）
- ✅ Token 独立追踪（成本观测、上下文窗口压力评估）
- ✅ Duration 独立追踪（ms/token 异常检测、性能基准）
- ✅ 三指标并行报告（步骤 8 输出）
- ✅ 异常标记机制（token_drift、time_drift、latency_ratio_high）

### 2.2.3 τ_agent 增强方案

```python
class TauController:
    """τ 控制中心 - 监控全链路延迟"""

    # τ 预算配置（可按任务类型配置）
    TAU_BUDGETS = {
        "simple":    {"total": 5000,   "intent": 500,  "exec": 4000},
        "moderate":  {"total": 15000,  "intent": 1000, "exec": 12000},
        "complex":   {"total": 50000,  "intent": 2000, "exec": 40000},
    }

    def measure_step(self, step_name: str, duration_ms: float, tokens: int):
        """记录每个步骤的 τ 消耗"""
        # τ = 执行延迟（ms）× 0.5 + token 消耗 × 0.001
        tau = duration_ms * 0.5 + tokens * 0.001
        # 对比预算，超出时触发 Task Folding 压缩

    def should_fold(self, current_depth: int, remaining_tau_budget: float) -> bool:
        """判断是否需要任务折叠"""
        # 剩余 τ 不足且深度 > 3 时触发折叠
        return remaining_tau_budget < 0.3 and current_depth > 3
```

**实现确认**：✅ **v1.4+v1.6 三指标控制中心已完整实现**，无需再"增强"，而是已在 orchestrator-pro 中落地。

## 2.3 K1 逻辑折叠 → Task Folding

### 2.3.1 映射原理

| 芯片逻辑折叠 | AI Agent 任务折叠 |
|------------|-----------------|
| 将长导线折叠缩短 | 将长任务链压缩精简 |
| 算法找最优折叠路径 | DAG 分析找冗余节点 |
| 折叠不是删除功能 | 折叠是合并等价路径 |

### 2.3.2 任务折叠策略

**问题**：当前代码中，复杂任务可能生成 10+ 个原子 skill，每个 skill 串行执行，即使某些可以合并。

```python
# 当前情况（示例）
atomic_skills = [
    "detect-framework",      # 1. 检测框架
    "detect-ui-library",     # 2. 检测 UI 库（可与 1 合并）
    "detect-state-manage",   # 3. 检测状态管理
    "scan-project-structure",# 4. 扫描项目结构
    "detect-router-solution",# 5. 检测路由方案
    "scan-env-variables",    # 6. 扫描环境变量
    "generate-report",      # 7. 生成报告（可与 4-6 合并）
]
```

**折叠规则**：
```
折叠触发条件：
1. 连续 3 个原子 skill 总 τ < 单个合并 skill 的 τ
2. 合并后不丢失关键信息
3. 合并 skill 已存在（不新建）

折叠示例：
- detect-framework + detect-ui-library → detect-tech-stack（合并检测）
- scan_* 系列 → scan-project（统一扫描，一次遍历）
```

**可行性验证**：
```python
# 代码中已有 DAG 构建和拓扑排序（algorithms.md 算法4、5）
# 只需在 topological_sort 后增加折叠决策：
def identify_foldable(skills: list, graph: dict) -> list:
    """识别可折叠的连续 skill 组"""
    # 折叠条件：
    # 1. 多个 skill 共享相似的输入上下文
    # 2. 合并后 τ_reduced > τ_merged（即节省的时间 > 合并成本）
    # 3. 不存在下游依赖的中间结果
```

**结论**：✅ **v1.6 已完整实施**。Task Folding 在 orchestrator-pro 步骤 4（任务生成）和步骤 5（执行控制）中实现：
- 步骤 4：`should_fold()` 判断是否触发折叠，`find_foldable_groups()` 识别可折叠组
- 步骤 5：执行中 `emergency_fold()` 实时检测，τ 不足时跳过非核心 skill
- v1.5 新增：匹配 skill 后必须读取 SKILL.md，加载原子 skill 列表（Task Folding 的输入数据源）

### 2.3.3 Task Folding 规则设计

```markdown
# Task Folding Rules

## 折叠条件
fold-001: 连续 N 个原子 skill 的 τ 总和 < 合并后单 skill 的 τ 时，触发折叠
fold-002: 合并后的 skill 必须在 skills_register.md 中已存在，不新建 skill
fold-003: 折叠深度最多 3 层（折叠后不能再折叠）
fold-004: 用户明确要求的 skill 不可折叠

## 折叠决策
fold-005: τ_remaining < 30% 且 depth > 3 时，强制折叠
fold-006: 折叠前需评估：折叠是否降低任务质量
fold-007: 折叠操作记录到 task_skill.md 执行日记

## 禁止折叠
fold-008: 涉及不同 domain 的 skill 不能折叠（如 framework 检测 + security 扫描）
fold-009: 共享中间结果的 skill 不能折叠（除非下游已全部完成）
fold-010: 用户要求"详细分析"时禁止折叠
```

## 2.4 K2 三维堆叠 → Skill Stacking

### 2.4.1 映射原理

| 芯片 3D 堆叠 | AI Agent 技能栈叠 |
|------------|-----------------|
| TSV 垂直互联，超低延迟 | Skill 上下文直传，无重解析 |
| 跨层共享内存（HBM） | 跨 Skill 共享 task_skill.md |
| 不同工艺层各尽其用 | 不同成熟度 Skill 各尽其能 |
| 混合集成（逻辑+存储） | 混合集成（主 Skill + 原子 Skill） |

### 2.4.2 Skill Stacking 架构

```python
# Skill Stacking 的核心：上下文共享通道
# 类比 TSV：skill 之间的高速数据通道

class SkillStacker:
    """技能栈叠器 - 实现跨 Skill 上下文互联"""

    # TSV 等效：task_skill.md 作为共享内存层
    SHARED_CONTEXT_FILE = ".claude/skills/tasks/current/task_skill.md"

    def stack_skills(self, skill_list: list, shared_ctx: dict) -> list:
        """
        技能栈叠策略：
        1. 分析技能间的数据依赖
        2. 将可共享的中间结果写入共享上下文
        3. 下游技能直接从共享上下文读取，而非重新解析
        """
        # 层级 1: 感知层（scan-object-info）
        # 层级 2: 分析层（code-optimizer, security-scanner）
        # 层级 3: 生成层（code-generator, test-generator）
        # 层级 4: 输出层（doc-generator）

        # 层内并行，层间串行（类比 3D 堆叠中的层间通信）
        return self.build_stack_layers(skill_list)

    def get_shared_result(self, skill_name: str, key: str) -> any:
        """从共享上下文获取上游技能结果（类比 TSV 直传）"""
        task_md = self.read_task_skill_md()
        return task_md.get("执行日记", {}).get(skill_name, {}).get(key)
```

### 2.4.3 上下文共享示例

```
用户请求："分析这个 Vue 项目并优化性能"

无 Skill Stacking（传统流程）：
  scan-object-info      → 读取 package.json → 输出框架信息
  （task_skill.md 无记录）→ 下个 skill 重新读取文件
  code-optimizer        → 重新读取 package.json → 检测框架
  （重复读取，τ 浪费）

有 Skill Stacking（TSV 互联）：
  scan-object-info      → 输出 {framework: "Vue3", router: "Vue-Router"}
                           → 写入 task_skill.md 共享上下文

  code-optimizer        → 直接从 task_skill.md 读取框架信息
                           → 无需重新读取文件
                           → τ 减少 ~200ms（一次文件读取）

  test-generator        → 从共享上下文获取项目上下文
                           → 测试用例自动继承框架信息
```

### 2.4.4 可行性验证

**现有代码中的 TSV 等效实现**：
```python
# algorithms.md 算法8：verify_completion
# 技能结果写入 task_skill.md
skill_results.get(std.get("skill_name", ""), {}).get("output", {})

# technical_implementation.md：ParallelSkillExecutor
# 已实现共享 task_file 的并发写入保护（文件锁）
self.results_queue.put({"skill": skill["name"], "success": result.success, "output": result.output})
```

**结论**：✅ **v1.5+v1.6 已完整实施**。
- ✅ v1.5 新增：orchestrator-pro 步骤 3 匹配到主 skill 后，**必须显式读取该 skill 的 SKILL.md**（从 skills_register.md 的 path 字段获取路径），加载原子 skill 列表
- ✅ Task Folding 预加载：执行前递归读取依赖 skill 的 SKILL.md（Skill Stacking 上下文预加载）
- ✅ stack-share-* 规则已强制执行：上游 skill 输出写入 task_skill.md，下游 skill 优先从共享上下文读取
- ✅ v1.6 新增：三分支判断（无匹配/单匹配/多匹配），无匹配时记录 missing_skills.md + 自主执行兜底

## 2.5 K3 全栈协同 → Model-Rules Co-Design

### 2.5.1 映射原理

| 芯片软硬协同 | Agent Model-Rules 协同 |
|------------|---------------------|
| 编译器根据芯片架构优化指令 | 模型能力 × 规则约束协同分配 |
| 编译器感知微架构特性 | Orchestrator 感知 Skill 成熟度 |
| 软硬接口协同设计 | Model 能力边界 × Rules 覆盖边界协同 |
| 性能瓶颈在各层动态传递 | τ 瓶颈在各步骤动态传递 |

### 2.5.2 Co-Design 策略

**传统路线（摩尔路线）**：
```
更大模型（更多参数）→ 更多能力 → 但推理 τ 更大，token 消耗更高
问题：模型增大的 τ 成本 > 能力提升的收益
```

**Co-Design 路线（韬路线）**：
```
模型（能力边界） × Rules（约束覆盖） × Skills（执行效率）
→ 找到最优组合

示例：
- 简单任务：模型只做生成，规则接管规范检查（省 τ）
- 复杂任务：模型主控，规则辅助（补能力）
- 重复任务：直接复用历史结果（τ → 0）
```

### 2.5.3 三层协同机制

```python
class ModelRulesCoDesign:
    """Model × Rules × Skills 全栈协同"""

    def decide_distribution(self, task: dict, model_capability: dict, rules: dict) -> dict:
        """
        决策：每个任务环节，由模型、规则还是技能来处理
        目标：τ 最小化，质量不降

        决策矩阵：
        ┌──────────────────┬──────────┬────────┬────────┐
        │ 任务类型           │ 模型分配 │ 规则分配 │ 技能分配│
        ├──────────────────┼──────────┼────────┼────────┤
        │ 意图识别           │ ✓ 高     │ 中     │ 低     │
        │ 技能匹配           │ ✓ 高     │ ✓ 高   │ 低     │
        │ DAG 构建          │ 中       │ ✓ 高   │ ✓ 高   │
        │ 代码生成           │ ✓ 最高   │ 中     │ 中     │
        │ 结果校验           │ 中       │ ✓ 高   │ ✓ 高   │
        │ 任务归档           │ 低       │ ✓ 高   │ ✓ 高   │
        └──────────────────┴──────────┴────────┴────────┘
        """
```

### 2.5.4 可行性验证

现有代码中已有部分 Co-Design 实现：

```python
# SKILL.md 步骤5：执行流程控制
# Token 追踪（模型层）+ 错误影响评估（规则层）+ 技能执行（技能层）
response = client.messages.create(...)           # 模型
token_tracker.record_skill_usage(...)             # 模型计量
impact = assess_error_impact(skill, ...)         # 规则评估
result = execute_atomic_skill(skill)             # 技能执行

# SKILL.md 步骤7：结果校验
# 模型校验（verify_completion）+ 规则偏差量化（calculate_deviation）
```

**结论**：✅ **v1.6 已完整实施**。Co-Design 决策矩阵在 orchestrator-pro 步骤 1~9 中全面落地：
- 步骤 1（意图识别）：Model 高分配，Rules 中分配
- 步骤 3（技能匹配）：Model+Rules 双高分配
- 步骤 4（任务生成）：Rules 高分配（Task Folding 规则驱动）
- 步骤 5（执行控制）：三层协同（Model 生成 + Rules 评估 + Skills 执行）
- 步骤 7（结果校验）：Model+Rules+Skills 三层贡献度显式记录到 task_skill.md
- Co-Design 汇总：Model × Rules × Skills 三层贡献度归档（v1.6 步骤 8 三指标报告）

## 2.6 K4 成熟制程 → Pattern Mining

### 2.6.1 映射原理

| 芯片成熟制程 | Agent 模式复用 |
|------------|-------------|
| 14nm 成本低、良率高、可控 | 成熟模式经过验证、复用成本低 |
| 通过架构创新弥补制程差距 | 通过模式复用弥补模型能力差距 |
| EUV 封锁下最优路径 | Scaling 受限下的最优路径 |
| 深挖 14nm 潜力 | 深挖现有 Skill 潜力 |

### 2.6.2 Pattern Mining 策略

```python
class PatternMiner:
    """模式挖掘器 - 发现和复用成熟模式"""

    def mine_pattern(self, task: dict, history: list) -> dict:
        """
        从历史任务中挖掘可复用的模式

        模式复用率 = 已匹配的历史模式数 / 当前任务步骤数
        复用率越高 → τ 越低

        成熟模式评估：
        - 出现次数 >= 5 次：成熟模式（τ_reduction = 0.7）
        - 出现次数 2-4 次：成长模式（τ_reduction = 0.4）
        - 出现次数 1 次：  试验模式（τ_reduction = 0.1）
        - 无历史记录：     新建模式（τ_reduction = 0.0）
        """
        matched_patterns = []
        for history_task in history:
            similarity = calculate_similarity(task, history_task)
            if similarity >= 0.6:
                matched_patterns.append(history_task)

        # 计算复用率
        reuse_rate = len(matched_patterns) / len(task["steps"])
        return {
            "reuse_rate": reuse_rate,
            "maturity": self.assess_maturity(len(matched_patterns)),
            "suggestions": self.suggest_patterns(matched_patterns)
        }

    def assess_maturity(self, frequency: int) -> str:
        if frequency >= 5: return "成熟"
        if frequency >= 2: return "成长"
        if frequency == 1: return "试验"
        return "新建"
```

### 2.6.3 模式库设计

```markdown
## 模式库结构

.claude/skills/patterns/
├── scan-patterns/
│   ├── vue3-scan.md      # Vue3 项目扫描模式（成熟）
│   ├── react-scan.md     # React 项目扫描模式（成熟）
│   └── node-backend.md   # Node.js 后端模式（成长）
├── code-gen-patterns/
│   ├── vue-component.md  # Vue 组件生成模式（成熟）
│   └── api-handler.md    # API 处理器模式（成熟）
└── optimize-patterns/
    ├── perf-vue.md        # Vue 性能优化模式（成熟）
    └── perf-react.md      # React 性能优化模式（成长）
```

### 2.6.4 可行性验证

```python
# algorithms.md 算法2：历史相似度计算
# 已有 Jaccard + 加权维度的相似度算法
# 只需扩展为模式匹配：

def calculate_pattern_similarity(task_a: dict, task_b: dict) -> float:
    """
    与历史相似度计算的区别：
    - 历史相似度：判断是否完全相同任务 → 决定是否复用结果
    - 模式相似度：判断部分模式是否可复用 → 决定 τ 节省量
    """
    # 提取任务模式特征（比意图更细粒度）
    pattern_a = extract_pattern(task_a)
    pattern_b = extract_pattern(task_b)
    return jaccard_similarity(pattern_a, pattern_b)
```

**结论**：✅ **v1.4+v1.6 已完整实施**。Pattern Mining 在 orchestrator-pro 步骤 2（双轨并行）和步骤 9（Pattern 存储）中落地：
- 步骤 2 轨道 B：Pattern Mining 独立于历史相似度，相似度阈值 0.6（低于历史相似度的 0.85）
- 成熟模式（≥5次）τ 折扣 70%，成长模式（2-4次）τ 折扣 40%
- 步骤 9：Pattern 模式固化，自动存入 `.claude/skills/patterns/` 模式库

---

# 第三部分：Rules 设计（τ 压缩约束体系）

## 3.1 四大技术约束

### Task Folding 约束

```markdown
# .claude/rules/task-folding.mdc

## 折叠触发规则
fold-trigger-001: 当 τ_remaining < 30% 且任务深度 > 3 时，触发强制折叠
fold-trigger-002: 当连续 3 个原子 skill 的 τ 总和 > 合并后单 skill 的 τ 时，触发折叠
fold-trigger-003: 每个任务最多折叠 2 次（折叠深度限制）

## 折叠执行规则
fold-exec-001: 折叠前需确认合并后的 skill 存在且完成标准兼容
fold-exec-002: 折叠操作必须记录到执行日记（含折叠原因和 τ 收益估算）
fold-exec-003: 折叠后重新计算 τ 预算分配

## 折叠保护规则
fold-protect-001: 用户明确要求的 skill 不可折叠（user_required=True）
fold-protect-002: 核心 skill 不可折叠（is_core=True）
fold-protect-003: 涉及不同 domain 的 skill 不可折叠
fold-protect-004: 用户要求"详细分析"时，禁止折叠
```

### Skill Stacking 约束

```markdown
# .claude/rules/skill-stacking.mdc

## 上下文共享规则
stack-share-001: 上游 skill 的输出必须写入 task_skill.md 共享上下文
stack-share-002: 下游 skill 优先从共享上下文读取，避免重复解析
stack-share-003: TSV 类共享（跨 Skill 直传）优先级：共享上下文 > 重新读取

## 层间通信规则
stack-layer-001: 同层 skill 可并行执行（共享上下文保护锁）
stack-layer-002: 层间依赖通过共享上下文传递，不传递文件句柄
stack-layer-003: 栈叠层级深度最多 4 层（对应感知/分析/生成/输出）

## 堆叠效率规则
stack-eff-001: 共享上下文命中率 < 50% 时，触发堆叠效率警告
stack-eff-002: 新增 skill 必须证明可跨层复用，否则不允许加入栈
stack-eff-003: 栈叠后 τ 收益必须 > 10%，否则保持原有结构
```

### Co-Design 约束

```markdown
# .claude/rules/co-design.mdc

## 能力分配规则
codesign-001: 简单任务（复杂度 <= 3）规则覆盖率目标 >= 80%
codesign-002: 复杂任务（复杂度 > 7）模型主控，规则辅助，覆盖率目标 >= 50%
codesign-003: 所有任务必须通过 Co-Design 决策，禁止纯模型或纯规则路线

## 边界协同规则
codesign-010: 模型能力边界（capability boundary）必须标注，规则覆盖边界必须覆盖
codesign-011: 新增规则必须评估对 τ 的影响（正向/负向/中性）
codesign-012: 新增模型能力必须评估规则覆盖是否完整

## 反馈闭环规则
codesign-020: 每个任务结束后，计算 Model × Rules × Skills 三层贡献度
codesign-021: 贡献度统计用于优化下次 Co-Design 决策
codesign-022: τ 超出预算时，分析是哪一层的贡献问题
```

### Pattern Mining 约束

```markdown
# .claude/rules/pattern-mining.mdc

## 复用触发规则
pattern-001: 相似度 >= 0.6 时，优先复用历史模式，而非重新执行
pattern-002: 成熟模式（出现 >= 5 次）τ 折扣 70%
pattern-003: 成长模式（出现 2-4 次）τ 折扣 40%

## 模式评估规则
pattern-010: 复用率 = 已匹配模式数 / 总步骤数
pattern-011: 复用率 < 30% 时，建议触发新模式挖掘
pattern-012: 新建模式必须经过 2 次验证才能晋升为成长模式

## 模式库管理规则
pattern-020: 模式库按 domain + action 组织（.claude/skills/patterns/）
pattern-021: 每季度评估模式库覆盖率，清理长期未复用的模式
pattern-022: 模式描述必须包含：触发条件、执行步骤、τ 收益、验证状态
```

## 3.2 τ 控制核心规则

```markdown
# .claude/rules/tau-control.mdc

## τ 预算规则
tau-001: 每个任务启动时分配 τ 预算（simple=5000, moderate=15000, complex=50000）
tau-002: 80% 预警，95% 严重警告，100% 终止（已实现于 TokenTracker）
tau-003: τ 超出时优先折叠任务，其次跳过可选步骤，禁止终止核心步骤

## τ 分项预算
tau-010: τ_intent 预算 <= 总预算的 10%
tau-011: τ_match 预算 <= 总预算的 15%
tau-012: τ_exec 预算 >= 总预算的 60%（执行是核心）
tau-013: 各步骤 τ 超出预算时，可从后续步骤"借"τ，但总 τ 不能超

## τ 汇报规则
tau-020: 任务完成后输出 τ 分解报告（各步骤耗时占比）
tau-021: τ 报告包含与历史均值的对比（判断任务健康度）
tau-022: 连续 3 次任务 τ 超预算，触发系统级优化建议
```

---

# 第四部分：新增主 Skill 设计规范（v1.1 新增）

> 当需要新增一个主 Skill（如 code-generator、bug-solver 等）时，必须遵循以下规范。
> 遵循这些规范，新 Skill 才能正确接入 orchestrator-pro 的 τ 体系、Skill Stacking 和 Pattern Mining。

---

## 4.1 新增 Skill 的必要字段（SKILL.md 头部）

每个主 Skill 的 `SKILL.md` 必须包含以下 frontmatter 或前置字段：

```markdown
---
name: {skill-name}            # 唯一标识，与目录名一致
desc: {一句话描述核心能力}      # 出现在 skills_register.md 中
version: x.y.z                 # 语义化版本号
match_keywords: []            # 意图匹配关键词（≥3 个，用于 skills_register.md 注册）
τ_budget:                     # 主 Skill τ 预算，仅覆盖 τ_exec 阶段（必须）
  simple:   {τ 值}              # 对应 complexity_score 1-3
  moderate: {τ 值}              # 对应 complexity_score 4-6
  complex: {τ 值}               # 对应 complexity_score 7-10
layer: {perception|analysis|generation|output}  # 所属层级（必须）
upstream_dependencies: []     # 依赖的上游 Skill（如 scan-object-info）
status: 启用|已合并            # 与 skills_register.md 保持一致
---
```

> ⚠️ **τ_budget 覆盖范围说明**：
> τ_budget **仅覆盖 τ_exec 阶段**（atomic_skills 执行），与 orchestrator 的 τ_intent/τ_match/τ_plan/τ_validate **完全解耦**，不存在双重计算。
> 主 Skill 的 τ_budget 应 ≤ orchestrator τ_exec 预算的 60%（参见 2.2b 三档预算配置表）。

**τ_budget 示例**：

| Skill | simple | moderate | complex |
|-------|--------|---------|---------|
| code-generator | 2,500 | 8,000 | 20,000 |
| bug-solver | 2,000 | 6,000 | 15,000 |
| code-structure-analyzer | 2,000 | 8,000 | 20,000 |
| doc-generator | 1,500 | 4,000 | 10,000 |

**layer 层级定义**：

| 层级 | 职责 | 已有 Skill |
|------|------|-----------|
| `perception`（感知层）| 扫描、检测、收集项目信息 | scan-object-info |
| `analysis`（分析层）| 分析、诊断、定位问题 | bug-solver, code-optimizer, security-scanner |
| `generation`（生成层）| 生成、创建、实现新内容 | code-generator, test-generator, doc-generator |
| `output`（输出层）| 格式化、归档、生成文档 | code-structure-analyzer |

---

## 4.2 SKILL.md 最小化示例模板

以下是一个满足所有注册要求的最小化 SKILL.md 示例，可直接参照创建新 Skill：

```markdown
# {Skill 名称} 主 Skill v1.0（韬定律增强版）

> 本 skill 用于：{一句话描述核心能力}

## 版本历史

- **v1.0** ({日期}): 初始版本

---

## 核心能力

- {能力 1}
- {能力 2}

---

## 韬定律整合

| 关键技术 | Agent 映射 | 实现位置 |
|---------|-----------|---------|
| K1 Task Folding | {描述} | {步骤} |
| K2 Skill Stacking | {描述} | {步骤} |
| K3 Co-Design | {描述} | {步骤} |
| K4 Pattern Mining | {描述} | {步骤} |

---

## 输入/输出规范

### 输入

| 参数 | 类型 | 说明 |
|------|------|------|
| {param} | {type} | {desc} |

### 输出

{描述输出产物和格式}

---

## 执行流程（N 步，τ 增强）

### 步骤 1：{步骤名称}
（描述执行逻辑）

### 步骤 2：{步骤名称}
（描述执行逻辑）

---

## Skill Stacking 集成

### 上游依赖

- scan-object-info（读取 project_context）

### 共享上下文写入（task_skill.md）

| 字段 | 类型 | 说明 |
|------|------|------|
| {field} | {type} | {desc} |

---

## Co-Design 贡献度

| 环节 | Model | Rules | Skills |
|------|-------|-------|--------|
| {step} | {val} | {val} | {val} |

---

## τ 预算（仅覆盖 τ_exec 阶段）

| 档位 | τ_budget | 说明 |
|------|----------|------|
| simple   | 2,500  | 对应 complexity 1-3 |
| moderate | 8,000  | 对应 complexity 4-6 |
| complex  | 20,000 | 对应 complexity 7-10 |

---

## 原子 Skills（atomic_skills）

| 名称 | 描述 | is_core | τ_weight |
|------|------|---------|----------|
| {atomic} | {desc} | true/false | {weight} |
```

> 参考已实现的 SKILL.md：
> - `.claude/skills/code-structure-analyzer/SKILL.md`（analysis 层示例）
> - `.claude/skills/bug-solver/SKILL.md`（analysis 层示例）
> - `.claude/skills/test-generator/SKILL.md`（generation 层示例）

---

## 4.3 Skill τ 预算分配机制

### 4.3.1 τ 预算流向

```
orchestrator-pro τ 总预算（complexity 分档）
    ↓
主 Skill 分配 τ_budget（如 code-generator: moderate=8,000）
    ↓
主 Skill 将 τ 分配给各 atomic_skills（按依赖关系 DAG）
    ↓
atomic_skill 执行 → τ_consumed 记录到 task_skill.md
```

### 4.3.2 主 Skill τ 预算分配公式

```python
def allocate_skill_budget(skill_budget: float, atomic_skills: list) -> dict:
    """
    将主 Skill 的 τ 预算分配给各 atomic_skills
    原则：核心 atomic_skill 占 60%，可选 atomic_skill 占 40%
    """
    # 识别核心 vs 可选 atomic_skill
    core_skills = [s for s in atomic_skills if s.get("is_core", False)]
    optional_skills = [s for s in atomic_skills if not s.get("is_core", False)]

    core_budget = skill_budget * 0.6
    optional_budget = skill_budget * 0.4

    # 核心 skill 按权重分配
    total_weight = sum(s.get("tau_weight", 1.0) for s in core_skills)
    for s in core_skills:
        s["tau_allocated"] = core_budget * (s.get("tau_weight", 1.0) / total_weight)

    # 可选 skill 均匀分配（可能被 Task Folding 折叠）
    if optional_skills:
        for s in optional_skills:
            s["tau_allocated"] = optional_budget / len(optional_skills)

    return atomic_skills
```

### 4.3.3 τ 超预算时的行为

| 情况 | 行为 |
|------|------|
| atomic_skill τ 超预算 | 记录warning，继续执行 |
| 主 Skill 总 τ 超预算 | 触发 Task Folding，跳过可选 atomic_skills |
| τ 剩余 < 10% | 跳过所有可选步骤，只执行核心步骤 |

---

## 4.4 Skill Stacking 集成规范

### 4.4.1 共享上下文写入格式（必须遵守）

主 Skill 执行完毕后，**必须**将核心输出写入 `task_skill.md` 的共享上下文区域：

```markdown
<!-- atomic-skill: {skill-name} -->
| 字段 | 类型 | 说明 |
|------|------|------|
| {field_name} | {type} | {description} |
<!-- /atomic-skill: {skill-name} -->
```

**示例（code-generator）**：

```markdown
<!-- atomic-skill: code-generation -->
| 字段 | 类型 | 说明 |
|------|------|------|
| generated_files | string[] | 生成的文件路径列表 |
| tech_stack | string | 检测到的技术栈 |
| code_style_ref | string | 参照的代码规范文件 |
<!-- /atomic-skill: code-generation -->
```

### 4.4.2 上游依赖读取规则

下游 Skill（如 test-generator）读取上游输出时：

```python
# 优先从 task_skill.md 共享上下文读取（Skill Stacking TSV 直传）
def read_upstream_context(skill_name: str, task_skill_md: str) -> dict:
    # 从 task_skill_md 中提取 <!-- atomic-skill: {skill_name} --> 包裹的内容
    upstream = extract_marked_block(task_skill_md, skill_name)
    if upstream:
        return parse_context(upstream)  # → 直接使用，无重复解析
    else:
        return read_from_project_files(skill_name)  # → fallback：重新读文件
```

### 4.4.3 新 Skill 的 Skill Stacking 验证清单

新增 Skill 必须满足以下条件才能通过注册审核：

```
□ 定义 shared_outputs：列出写入 task_skill.md 的所有字段
□ 定义 upstream_dependencies：列出依赖的上游 Skills（如有）
□ 定义 read_priority：shared_context > 文件重读（必须遵守）
□ 堆叠效率可验证：stack_hit_rate 可追踪
```

---

## 4.5 Pattern Mining 贡献规范

### 4.5.1 贡献条件

主 Skill 可以在执行完毕后贡献 Pattern 到模式库，贡献条件：

| 条件 | 值 |
|------|---|
| 任务完成质量 | deviation < 0.2 |
| τ 效率 | τ_efficiency > 0.7 |
| 出现次数 | 同一 Pattern ≥ 2 次 |

### 4.5.2 Pattern 贡献格式

贡献到 `.claude/skills/patterns/{domain}/{skill-name}-{feature}.md`：

```markdown
# {Pattern 名称}

## 触发条件
- domain: {匹配 domain}
- action: {匹配 action}
- keywords: [{关键词列表}]

## 执行步骤
1. {步骤 1}
2. {步骤 2}

## τ 消耗
- tau_budget: {实际消耗}
- τ_efficiency: {效率分数}

## 成熟度
- frequency: {出现次数}
- maturity: {成熟/成长/试验}

## 验证状态
- validated: true/false
- validator: {验证者}
```

### 4.5.3 Pattern 成熟度等级与晋升规则

```
成熟度等级（统一标准，文档各处一致）：
  1 次       → 试验模式（τ 折扣 10%）
  2-4 次     → 成长模式（τ 折扣 40%）
  ≥5 次      → 成熟模式（τ 折扣 70%）

晋升路径：
  试验模式（1次）→ 成长模式（2次）→ 成熟模式（5次）
```

---

## 4.6 Co-Design 分层规范

### 4.6.1 新 Skill 的 Co-Design 贡献度定义

每个主 Skill 的 SKILL.md 必须显式声明 Model/Rules/Skills 三层贡献度：

```python
co_design_config = {
    # 描述：哪些任务环节由谁主控
    "intent_recognition":   {"model": 0.7, "rules": 0.2, "skills": 0.1},
    "code_analysis":       {"model": 0.5, "rules": 0.3, "skills": 0.2},
    "code_generation":     {"model": 0.8, "rules": 0.1, "skills": 0.1},
    "result_validation":   {"model": 0.3, "rules": 0.4, "skills": 0.3},
}
```

### 4.6.2 贡献度计算规则

- 三层贡献度总和 = 1.0（必须归一化）
- 每个环节由贡献度最高的层决定主控角色
- τ 超预算时，降低 Model 分配，提升 Rules 分配（省 token）

---

## 4.7 Skill 注册质量门槛

### 4.7.1 注册前必须满足的条件

```
□ SKILL.md 格式规范（包含必要字段：name/version/desc/τ_budget/layer/match_keywords）
□ match_keywords ≥ 3 个
□ atomic_skills 数量 ≥ 2 个（含依赖关系）
□ 完成标准（completion_standards）已定义
□ Skill Stacking 验证清单已填写（shared_outputs / upstream_dependencies）
□ Co-Design 贡献度已声明
```

### 4.7.2 注册流程

```
1. 在 .claude/skills/ 下创建 {skill-name}/ 目录
2. 编写 SKILL.md（含上述所有字段，可参照 4.2 节模板）
3. 编写 README.md（使用说明）
4. 在 skills_register.md 中注册（name/desc/path/match_keywords/status）
5. 在 atomic_skills_register.md 中注册（原子 skills 详情）
6. 在 settings.json commands 中添加 slash command
7. 在 CLAUDE.md 主 Skill 表中更新数量
```

---

# 第五部分：与现有架构的融合方案

## 5.1 融合架构图

```
用户输入
    ↓
Orchestrator Pro（已有，τ 增强 9 步流程）
    ↓
┌─────────────────────────────────────────┐
│  τ-Controller（内置）                    │
│  ├─ τ 测量：TauController 主标准          │
│  ├─ τ 预算：动态分配 + 预警               │
│  └─ 折叠决策：触发 Task Folding           │
└─────────────────────────────────────────┘
    ↓
主 Skill（已有 + 可新增）
    ↓
┌─────────────────────────────────────────┐
│  Skill Stacker（内置）                   │
│  ├─ 共享上下文：task_skill.md              │
│  └─ TSV 直传：强制上下文优先读取          │
└─────────────────────────────────────────┘
    ↓
原子 Skill（已有）
    ↓
┌─────────────────────────────────────────┐
│  Pattern Miner（内置）                   │
│  ├─ 模式匹配：步骤 2 双轨并行（阈值 0.6）  │
│  └─ 模式库：.claude/skills/patterns/    │
└─────────────────────────────────────────┘
    ↓
结果校验（已有，扩展 τ 维度）
```

## 5.1b 融合架构图（orchestrator 轻量路径）

```
用户输入
    ↓
Orchestrator（已有，9步流程）
    ↓
┌─────────────────────────────────────────┐
│  τ-Controller（新增）                    │
│  ├─ τ 测量：扩展 TokenTracker            │
│  ├─ τ 预算：动态分配 + 预警               │
│  └─ 折叠决策：触发 Task Folding           │
└─────────────────────────────────────────┘
    ↓
主 Skill（已有）
    ↓
┌─────────────────────────────────────────┐
│  Skill Stacker（增强）                   │
│  ├─ 共享上下文：扩展 task_skill.md       │
│  └─ TSV 直传：强制上下文优先读取          │
└─────────────────────────────────────────┘
    ↓
原子 Skill（已有）
    ↓
┌─────────────────────────────────────────┐
│  Pattern Miner（新增）                   │
│  ├─ 模式匹配：替代部分原子 Skill          │
│  └─ 模式库：.claude/skills/patterns/    │
└─────────────────────────────────────────┘
    ↓
结果校验（已有，扩展 τ 维度）
```

## 5.2 对现有 9 步流程的影响

| 步骤 | 现有功能 | 韬定律增强 | 影响程度 |
|------|---------|-----------|---------|
| 1 意图识别 | LLM + fallback | τ 预算限制，超时规则降级 | 小 |
| 2 历史检索 | Jaccard 相似度 | 增加模式匹配（细粒度） | 中 |
| 3 技能匹配 | 关键词评分 | 增加 τ 效率评分 | 小 |
| 4 任务生成 | DAG + 拓扑排序 | **Task Folding 压缩** | **大** |
| 5 执行控制 | 流式 + Token 追踪 | **τ 实时监控 + 折叠触发** | **大** |
| 6 任务恢复 | 断点恢复 | τ 状态恢复 | 小 |
| 7 结果校验 | 偏差量化 | **增加 τ 效率评分** | 中 |
| 8 结果输出 | 执行摘要 | **增加 τ 分解报告** | 小 |
| 9 任务归档 | 月度索引 | **Pattern 模式固化** | 中 |

**影响最大的两个步骤**：步骤 4（任务生成）和步骤 5（执行控制）。

## 5.3 实施优先级（v1.6 全部完成）

```
Phase 1 ✅（已完成）：τ 可见化 + 三指标体系
├─ 扩展 TokenTracker → τ-Controller（τ 主标准）
├─ 新增 TokenTracker（Token 辅助 A）+ DurationTracker（Duration 辅助 B）
├─ 在 Orchestrator 9步中加入三指标测量点
└─ 输出端到端 τ + Token + Duration 三指标分解报告
结果：τ 可观测，Token/Duration 辅助告警

Phase 2 ✅（已完成）：Task Folding 落地
├─ 在 task-generator 中增加折叠模块（步骤 4）
├─ 实现 should_fold() + find_foldable_groups() + apply_folding()
├─ 步骤 5 紧急折叠：emergency_fold() 实时检测 τ 不足
└─ v1.5：步骤 3 匹配后必须读取匹配 skill 的 SKILL.md（Task Folding 数据源）
结果：τ 可控

Phase 3 ✅（已完成）：Skill Stacking 增强
├─ 增强 task_skill.md 的上下文共享能力（task_skill.md 共享上下文写入/读取）
├─ 实现 stack-share-* 规则（强制上下文优先读取）
├─ 增加上下文命中率统计（stack_hit_rate 写入 task_skill.md）
└─ v1.6：三分支判断（无匹配自主执行兜底 + missing_skills.md）
结果：τ 可优化

Phase 4 ✅（已完成）：Pattern Mining 落地
├─ 实现 Pattern Miner（步骤 2 双轨并行 + 步骤 9 Pattern 存储）
├─ 建立模式库（.claude/skills/patterns/）
└─ 实现 pattern-* 规则（相似度 ≥ 0.6 触发复用）
结果：τ 持续下降
```

---

# 第六部分：可行性综合评估

## 6.1 各映射点实施状态汇总（v1.6 全部完成）

| 映射 | 状态 | 对应版本 | 说明 |
|------|------|---------|------|
| τ 定义与量化 | ✅ 已实施 | v1.4+v1.6 | τ = duration_ms×0.5 + tokens×0.001，三档预算（simple/moderate/complex）|
| 三指标体系 | ✅ 已实施 | v1.4 | Token 辅助 A（成本观测）+ Duration 辅助 B（延迟异常检测）+ τ 主标准决策驱动 |
| Task Folding | ✅ 已实施 | v1.5+v1.6 | 步骤 4 折叠决策 + 步骤 5 紧急折叠 + 匹配后读取 SKILL.md |
| Skill Stacking | ✅ 已实施 | v1.5+v1.6 | 强制上下文优先读取 + stack_hit_rate + 三分支判断（无匹配自主执行）|
| Co-Design | ✅ 已实施 | v1.6 | 三层贡献度显式记录 + Co-Design 汇总归档到 task_skill.md |
| Pattern Mining | ✅ 已实施 | v1.4+v1.6 | 步骤 2 双轨并行（阈值 0.6）+ 步骤 9 Pattern 存储（τ 折扣）|
| Rules 体系 | ✅ 已实施 | v1.0+v1.5 | .mdc 规则系统完善，Task Folding + Skill Stacking + Co-Design + Pattern Mining 规则均已落地 |

## 6.2 核心优势

1. **无需颠覆现有架构**：所有增强都是"叠加"而非"替换"
2. **现有代码高度匹配**：TokenTracker、DAG、并行层识别等都是现成的
3. **规则系统天然适配**：.mdc 规则格式完美承载 τ 压缩约束
4. **分阶段可落地**：Phase 1~4 渐进实施，每阶段有可见成果

## 6.3 核心挑战

1. **τ 的精确测量**：当前的"耗时 ms"和"token 数"是间接指标，τ 本身更接近"认知成本"
   - 建议：用 token 消耗作为主要 τ 量纲（更稳定），耗时作为辅助参考
2. **Task Folding 的折叠判断**：自动判断"哪些可以合并"需要更精确的算法
   - 建议：初期只做"手动折叠建议"，人工确认后再自动执行
3. **Pattern Mining 的模式粒度**：比 intent 更细的粒度需要更多标注工作
   - 建议：先用现有历史任务训练模式提取，用人工反馈迭代

## 6.4 最终结论

> 华为韬定律与 AI Agent 系统设计的映射**已在 Orchestrator Pro v1.6 完整实施**。
>
> 核心价值：
> - 从"更好的模型"（摩尔路线）→ "更短的执行路径"（韬路线）
> - 从"更多 Skill"（空间扩展）→ "更高 Skill 复用"（时间压缩）
> - τ 作为**主标准驱动所有决策**，Token/Duration 作为**辅助观测指标**
> - 三指标并行追踪 + 三分支判断（无匹配自主执行兜底）= 鲁棒的 Agent 调度系统
>
> 实施状态：**Phase 1~4 全部完成**。核心设计文档：`orchestrator-pro/SKILL.md`（v1.6）+ `tao-theory-design.md`（v1.1）

---

*文档版本：v1.2 | 基于华为韬定律（何庭波，2026）设计 | 对应 Orchestrator Pro v1.6*

## 版本历史

- **v1.2** (2026-06-09): 文档问题修复：
  - 修复 τ_budget 定义矛盾：明确 τ_budget 仅覆盖 τ_exec 阶段，与 orchestrator 解耦
  - 修复 Duration 预算与 τ 量纲混淆：区分 orchestrator τ 总预算、主 Skill τ_budget、Duration 预算三个概念
  - 新增 2.2.1b：complexity_score → τ_budget 档位映射机制
  - 修复 layer 层级定义：doc-generator 归 generation 层，code-structure-analyzer 归 output 层
  - 统一 Pattern 成熟度阈值（1次=试验/2-4次=成长/≥5次=成熟），消除多处定义不一致
  - 新增 4.2 SKILL.md 最小化模板示例（解决无参考文件的问题）
  - 添加 match_keywords 到 frontmatter 必要字段
  - 修复第五部分 5.1 节重复编号（第二个改为 5.1b）
  - 重构第四部分章节编号（4.1-4.7）
- **v1.1** (2026-06-09): 第四部分重构：新增「新增主 Skill 设计规范」，包含必要字段规范、τ 预算分配机制、Skill Stacking 集成规范、Pattern Mining 贡献规范、Co-Design 分层规范、注册质量门槛；第五部分融合架构图同步更新（τ-Controller/Pattern Miner 标注为内置）
- **v1.0** (2026-06-08): 初始版本，完整实现华为韬定律 × AI Agent 系统设计映射，包含 τ 定义、三指标体系、K1-K4 映射、Rules 体系