# Orchestrator Pro 配置参数（v1.4）

本文档定义 orchestrator-pro v1.4 的所有配置参数。τ 为主标准，Token + Duration 为辅助标准。
配置基于华为韬定律原理，性能 ∝ 1/τ。

---

## 1. 三指标预算配置（v1.4 新增）

### 1.1 τ 预算（主标准）

> τ = duration_ms × 0.5 + tokens × 0.001，用于驱动所有决策。

```python
TAU_BUDGETS = {
    "simple": {
        "total":    5000,
        "intent":   500,   # 10.0%
        "match":    750,   # 15.0%
        "plan":     250,   # 5.0%
        "exec":     3000,  # 60.0%
        "validate": 250,   # 5.0%
        "archive":  250,   # 5.0%
    },
    "moderate": {
        "total":    15000,
        "intent":   1500,  # 10.0%
        "match":    2250,  # 15.0%
        "plan":     750,   # 5.0%
        "exec":     9000,  # 60.0%
        "validate": 750,   # 5.0%
        "archive":  750,   # 5.0%
    },
    "complex": {
        "total":    50000,
        "intent":   5000,  # 10.0%
        "match":    7500,  # 15.0%
        "plan":     2500,  # 5.0%
        "exec":     30000, # 60.0%
        "validate": 2500,  # 5.0%
        "archive":  2500,  # 5.0%
    },
}
```

### 1.2 Token 预算（辅助标准 A，v1.4 新增）

> Token 独立追踪，与成本对齐，用于观测和告警。权重分配与 τ 完全同步。
> 注意：Token 预算与 LLM API 定价直接对齐，moderate 档约 $0.80。

```python
TOKEN_BUDGETS = {
    "simple": {
        "total":    40000,
        "intent":   4000,  # 10.0%
        "match":    6000,  # 15.0%
        "plan":     2000,  # 5.0%
        "exec":    24000,  # 60.0%
        "validate": 2000,  # 5.0%
        "archive":  2000,  # 5.0%
        # 预估成本（以 $0.01/1K token 计）
        "estimated_cost": 0.40,
    },
    "moderate": {
        "total":    80000,
        "intent":   8000,  # 10.0%
        "match":   12000,  # 15.0%
        "plan":     4000,  # 5.0%
        "exec":    48000,  # 60.0%
        "validate": 4000,  # 5.0%
        "archive":  4000,  # 5.0%
        "estimated_cost": 0.80,
    },
    "complex": {
        "total":   200000,
        "intent":  20000,  # 10.0%
        "match":   30000,  # 15.0%
        "plan":    10000,  # 5.0%
        "exec":   120000,  # 60.0%
        "validate": 10000,  # 5.0%
        "archive":  10000,  # 5.0%
        "estimated_cost": 2.00,
    },
}
```

### 1.3 Duration 预算（辅助标准 B，v1.4 新增）

> Duration 独立追踪，用于异常检测（死循环、API 阻塞）。权重分配与 τ 完全同步。
> 注意：执行时间（ms）受网络/模型调度影响，正常范围 < 5ms/token。

```python
DURATION_BUDGETS = {
    "simple": {
        "total":    15000,   # ms
        "intent":   1500,   # 10.0%
        "match":    2250,   # 15.0%
        "plan":     750,    # 5.0%
        "exec":     9000,   # 60.0%
        "validate":  750,   # 5.0%
        "archive":   750,   # 5.0%
    },
    "moderate": {
        "total":    30000,   # ms
        "intent":   3000,   # 10.0%
        "match":    4500,   # 15.0%
        "plan":     1500,   # 5.0%
        "exec":    18000,   # 60.0%
        "validate": 1500,   # 5.0%
        "archive":  1500,   # 5.0%
    },
    "complex": {
        "total":    80000,   # ms
        "intent":   8000,   # 10.0%
        "match":   12000,   # 15.0%
        "plan":     4000,   # 5.0%
        "exec":    48000,   # 60.0%
        "validate": 4000,   # 5.0%
        "archive":  4000,   # 5.0%
    },
}
```

### 1.4 三档判断（统一）

> 档位由 complexity_score 决定，三套预算同步分配。

| 复杂度 | complexity_score | τ 预算 | Token 预算 | Duration 预算 |
|--------|-----------------|--------|-----------|-------------|
| simple | ≤ 3 | 5,000 | 40,000 | 15,000ms |
| moderate | 4-6 | 15,000 | 80,000 | 30,000ms |
| complex | 7-10 | 50,000 | 200,000 | 80,000ms |

### 1.2 τ 测量公式

```python
def measure_tau(duration_ms: float, tokens: int) -> float:
    """
    τ = duration_ms × 0.5 + tokens × 0.001
    权衡执行延迟和 token 消耗
    """
    return duration_ms * 0.5 + tokens * 0.001
```

### 1.3 三指标预警阈值（v1.4 新增）

#### τ 预警阈值（主标准，驱动所有决策）

```python
TAU_WARNING_THRESHOLD = 0.80    # 80% 预警（⚠️）
TAU_CRITICAL_THRESHOLD = 0.95 # 95% 严重警告（🚨）
TAU_ABORT_THRESHOLD = 1.00     # 100% 终止（⛔）
```

#### Token 预警阈值（辅助标准 A，观测/告警，不阻断）

```python
TOKEN_WARNING_THRESHOLD = 0.80    # 80% 预警（⚠️）— 注意上下文窗口限制
TOKEN_CRITICAL_THRESHOLD = 0.95   # 95% 严重警告（🚨）
TOKEN_ABORT_THRESHOLD = 1.00      # 100% 终止（⛔）
# 触发条件：token_consumed / token_budget_total >= threshold
```

#### Duration 异常检测阈值（辅助标准 B，检测异常延迟）

```python
DURATION_WARNING_THRESHOLD = 0.80    # 80% 预警
DURATION_CRITICAL_THRESHOLD = 0.95  # 95% 严重警告
# ms/token 异常阈值（独立于预算比例）
LATENCY_WARNING_MSPT = 10.0    # ms/token > 10 → 警告（⚠️）
LATENCY_CRITICAL_MSPT = 20.0   # ms/token > 20 → 严重（🚨），可能死循环或 API 阻塞
LATENCY_NORMAL_MSPT = 5.0       # ms/token 正常上限参考值
# 触发条件：elapsed_ms / tokens >= threshold（tokens > 0 时有效）
```

#### 综合异常检测（v1.4 新增）

```python
# τ 充足但 Token/时间偏紧 → 潜在未追踪消耗
COMPOSITE_ANOMALY_TAU_SUFFICIENT = 0.50  # τ remaining > 50%
COMPOSITE_ANOMALY_AUX_LOW = 0.30          # token 或 duration remaining < 30%
```

### 1.4 τ 借位优先级

```python
TAU_BORROW_PRIORITY = ["archive", "validate", "plan", "match", "intent", "exec"]
# 借位方向：低优先级 → 高优先级
# validate 可向 exec 借，archive 可向 validate 借
# exec 不可被借（执行是核心）
# Token/Duration 不参与借位（独立追踪）
```

---

## 2. Task Folding 配置

### 2.1 折叠触发条件

```python
FOLD_TRIGGERS = {
    "tau_remaining_pct": 0.30,    # τ_remaining < 30% 触发
    "depth_threshold": 3,         # 任务深度 > 3 触发
    "tau_ratio_threshold": 1.0,   # 连续3个 skill τ > 合并后 skill τ
    "max_fold_depth": 2,          # 最多折叠 2 次
    "min_group_size": 2,           # 至少 2 个 skill 才折叠
}
```

### 2.2 折叠保护清单

```python
FOLD_PROTECTED = {
    "user_required": True,   # 用户明确要求的 skill 不可折叠
    "is_core": True,         # 核心 skill 不可折叠
    "cross_domain": True,     # 跨 domain skill 不可折叠
    "detailed_mode": True,    # 详细分析模式不可折叠
}
```

### 2.3 折叠合并候选

```python
FOLD_MERGE_CANDIDATES = {
    "scan_group": [
        "scan-package-json",
        "scan-project-structure",
        "scan-env-variables",
        "detect-framework",
        "detect-ui-library",
        "detect-router-solution",
        "detect-state-manage",
    ],
    # 可合并为：scan-project-context 或 detect-tech-stack
}
```

---

## 3. Skill Stacking 配置

### 3.1 栈叠层级定义

```python
STACK_LAYERS = {
    1: {"name": "感知层", "skills": ["scan-object-info"]},
    2: {"name": "分析层", "skills": ["code-optimizer", "security-scanner"]},
    3: {"name": "生成层", "skills": ["code-generator", "test-generator", "doc-generator"]},
    4: {"name": "输出层", "skills": ["git-assistant", "deploy-helper"]},
}
STACK_MAX_DEPTH = 4
```

### 3.2 命中率阈值

```python
STACK_HIT_RATE_WARNING = 0.50   # < 50% 触发警告
STACK_TAU_GAIN_MIN = 0.10       # 堆叠后 τ 收益必须 > 10%
```

### 3.3 Skill 上下文声明

```python
SKILL_CONTEXT_SCHEMA = {
    "required_keys": list[str],   # 需要从共享上下文读取的键
    "output_keys": list[str],     # 输出到上下文的键
    "cache_ttl": int,             # 缓存有效期（秒），默认 300
}
```

---

## 4. Co-Design 配置

### 4.1 各步骤贡献度矩阵

```python
CO_DESIGN_MATRIX = {
    "intent":    {"model": 0.7, "rules": 0.2, "skills": 0.1},
    "match":     {"model": 0.5, "rules": 0.3, "skills": 0.2},
    "plan":      {"model": 0.3, "rules": 0.4, "skills": 0.3},
    "exec":      {"model": 0.6, "rules": 0.2, "skills": 0.2},
    "validate":  {"model": 0.4, "rules": 0.4, "skills": 0.2},
    "archive":   {"model": 0.1, "rules": 0.6, "skills": 0.3},
}
```

**说明**：
- `model`：该步骤中模型（LLM）的主导程度
- `rules`：规则系统的贡献程度
- `skills`：技能调用的贡献程度

### 4.2 规则覆盖率目标

```python
RULES_COVERAGE_TARGETS = {
    "simple":   0.80,   # 简单任务规则覆盖 ≥ 80%
    "moderate": 0.60,   # 中等任务规则覆盖 ≥ 60%
    "complex":  0.50,   # 复杂任务规则覆盖 ≥ 50%
}
```

---

## 5. Pattern Mining 配置

### 5.1 模式成熟度分级

```python
PATTERN_MATURITY = {
    "mature": {
        "min_usage": 5,
        "tau_discount": 0.70,
        "description": "成熟模式，已验证 ≥5 次"
    },
    "growing": {
        "min_usage": 2,
        "tau_discount": 0.40,
        "description": "成长模式，已验证 2-4 次"
    },
    "experimental": {
        "min_usage": 1,
        "tau_discount": 0.10,
        "description": "试验模式，已验证 1 次"
    },
    "new": {
        "min_usage": 0,
        "tau_discount": 0.00,
        "description": "新建模式，尚无验证"
    },
}
```

### 5.2 模式匹配阈值

```python
PATTERN_THRESHOLDS = {
    "reuse_trigger": 0.60,   # 相似度 ≥ 0.6 触发复用
    "history_full": 0.85,    # 历史相似度 ≥ 0.85 整任务复用
}
```

### 5.3 模式库路径

```python
PATTERN_LIBRARY_BASE = ".claude/skills/patterns/"
PATTERN_LIBRARY_CATEGORIES = [
    "frontend-scan",      # 前端项目扫描模式
    "api-generation",     # API 生成模式
    "bug-fix-standard",   # 标准 Bug 修复模式
    "perf-optimization",  # 性能优化模式
    "test-generation",    # 测试生成模式
]
```

### 5.4 模式库管理

```python
PATTERN_LIBRARY_MANAGEMENT = {
    "cleanup_after_days": 180,          # 180 天未使用则清理
    "promote_to_growing_after": 2,       # 验证 2 次晋升为成长
    "promote_to_mature_after": 5,        # 验证 5 次晋升为成熟
    "reuse_rate_warning": 0.30,          # 复用率 < 30% 警告
}
```

---

## 6. τ 效率评分配置

```python
TAU_EFFICIENCY_CONFIG = {
    "excellent_threshold": 0.80,   # > 0.8 优秀
    "pass_threshold": 0.50,        # 0.5-0.8 合格
    "formula": "tau_efficiency_score = (task_quality × pattern_discount × stack_discount) / tau_actual_consumed",
    "quality_weight": 1.0,          # 任务质量权重
    "pattern_weight": 0.25,         # 模式折扣权重
    "stack_weight": 0.10,           # 堆叠折扣权重
}
```

---

## 7. 决策点汇总（v1.4 新增 D8-D10）

| 决策点 | 触发条件 | 选项数 | 默认行为 | 标准类型 |
|--------|---------|--------|---------|---------|
| D1 τ 档位 | complexity_score | 3 | 根据复杂度分配 | 主标准（τ）|
| D2 Task Folding | τ_remaining<30% + depth>3 | 2 | 折叠 | 主标准（τ）|
| D3 Pattern 复用 | similarity ≥ 0.6 | 2 | 复用 | 主标准（τ）|
| D4 τ 借位 | step τ 超预算 | 2 | 借位 | 主标准（τ）|
| D5 紧急折叠 | τ_remaining < skill_tau × 0.5 | 3 | 跳过/降级/继续 | 主标准（τ）|
| D6 反思失败 | 3次反思后偏差≥0.2 | 3 | 输出当前结果 | — |
| D7 可固化文档 | 检测到可固化文档 | 3 | 仅索引 | — |
| D8 Token 紧张（辅助）| token_remaining < 20% | 1 | 告警（不阻断，仅观测）| 辅助标准 A |
| D9 延迟异常（辅助）| ms/token > 10ms | 1 | 告警（不阻断，仅观测）| 辅助标准 B |
| D10 综合异常（辅助）| τ>50% 但 token/dur<30% | 1 | 告警（不阻断，仅提示）| 综合检测 |

---

**版本**: 1.4
**最后更新**: 2026-06-05
**基于**: 华为韬定律 × Orchestrator v1.2 + 三指标体系（v1.4）