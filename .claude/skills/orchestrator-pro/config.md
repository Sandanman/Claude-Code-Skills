# Orchestrator Pro 配置参数（v1.0）

本文档定义 τ 增强相关的所有配置参数。配置基于华为韬定律原理，性能 ∝ 1/τ。

---

## 1. τ 预算配置

### 1.1 三档预算（TAU_BUDGETS）

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

**τ 档位判断**：
- `simple`：complexity_score ≤ 3
- `moderate`：complexity_score 4-6
- `complex`：complexity_score 7-10

### 1.2 τ 测量公式

```python
def measure_tau(duration_ms: float, tokens: int) -> float:
    """
    τ = duration_ms × 0.5 + tokens × 0.001
    权衡执行延迟和 token 消耗
    """
    return duration_ms * 0.5 + tokens * 0.001
```

### 1.3 τ 预警阈值

```python
TAU_WARNING_THRESHOLD = 0.80   # 80% 预警（⚠️）
TAU_CRITICAL_THRESHOLD = 0.95 # 95% 严重警告（🚨）
TAU_ABORT_THRESHOLD = 1.00    # 100% 终止（⛔）
```

### 1.4 τ 借位优先级

```python
TAU_BORROW_PRIORITY = ["archive", "validate", "plan", "match", "intent", "exec"]
# 借位方向：低优先级 → 高优先级
# validate 可向 exec 借，archive 可向 validate 借
# exec 不可被借（执行是核心）
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
    2: {"name": "分析层", "skills": ["code-optimizer", "code-redundancy-checker", "security-scanner"]},
    3: {"name": "生成层", "skills": ["code-generator", "test-generator", "doc-generator"]},
    4: {"name": "输出层", "skills": ["git-helper", "deploy-helper"]},
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

## 7. 决策点汇总

| 决策点 | 触发条件 | 选项数 | 默认行为 |
|--------|---------|--------|---------|
| D1 τ 档位 | complexity_score | 3 | 根据复杂度分配 |
| D2 Task Folding | τ_remaining<30% + depth>3 | 2 | 折叠 |
| D3 Pattern 复用 | similarity ≥ 0.6 | 2 | 复用 |
| D4 τ 借位 | step τ 超预算 | 2 | 借位 |
| D5 紧急折叠 | τ_remaining < skill_tau × 0.5 | 3 | 跳过/降级/继续 |

---

**版本**: 1.0
**最后更新**: 2026-06-02
**基于**: 华为韬定律 × Orchestrator v1.2