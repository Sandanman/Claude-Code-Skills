# Orchestrator Pro（τ 增强版编排总控）

> 基于华为韬定律的 AI Agent 智能编排系统 | 性能 ∝ 1/τ

---

## 版本历史

- **v1.0** (2026-06-02): 初始实现，集成华为韬定律四大关键技术

---

## 核心定位

Orchestrator Pro 是 Orchestrator v1.2 的 τ 增强版本，以 **τ（时间常数）** 为核心性能指标，通过时间缩微而非空间扩展（堆模型）提升 Agent 效率。

**与 v1.2 的区别**：

| 维度 | v1.2 | v1.0 Pro |
|------|------|---------|
| 核心指标 | Token 追踪 | τ 全链路度量 |
| 任务生成 | DAG + 拓扑排序 | + **Task Folding 折叠** |
| 技能执行 | 流式 + Token | + **τ 实时监控 + 紧急折叠** |
| 历史检索 | 相似度 ≥ 0.85 | + **Pattern Mining ≥ 0.6** |
| 结果输出 | 执行摘要 | + **τ 分解报告** |
| 归档 | 月度索引 | + **模式库存储** |

---

## 华为韬定律四大技术集成

### K1：逻辑折叠 → Task Folding
- **触发条件**：τ_remaining < 30% 且任务深度 > 3
- **效果**：合并连续同 domain skill，缩短执行路径
- **示例**：detect-framework + detect-ui-library → detect-tech-stack

### K2：三维堆叠 → Skill Stacking
- **机制**：task_skill.md 作为共享上下文（TSV 等效）
- **效果**：下游 skill 复用上游结果，避免重复解析
- **命中率目标**：≥ 50%

### K3：全栈协同 → Model-Rules Co-Design
- **机制**：各步骤显式化 model/rules/skills 三层贡献
- **效果**：找到最优能力分配路径
- **覆盖率目标**：simple ≥ 80%, complex ≥ 50%

### K4：成熟制程 → Pattern Mining
- **机制**：从历史任务中挖掘可复用模式（相似度 ≥ 0.6）
- **效果**：τ 折扣 10%~70%
- **成熟模式**：≥ 5 次验证，τ 节省 70%

---

## 文件结构

```
orchestrator-pro/
├── SKILL.md                              # 主文件（τ 增强 9 步流程）
├── algorithms.md                         # 16 个核心算法（含新增 11-16）
├── config.md                             # τ 预算配置 + Co-Design 矩阵
├── technical_implementation.md           # τ 增强实现代码
├── README.md                             # 本文件
├── atomic-skills/
│   ├── tau-controller/                   # τ 控制核心（新增）
│   ├── pattern-miner/                    # 模式挖掘（新增）
│   ├── intent-recognition/               # τ 增强（继承）
│   ├── skill-matcher/                   # τ 增强（继承）
│   ├── task-generator/                   # +Task Folding（增强）
│   ├── execution-controller/             # +τ 监控（增强）
│   ├── result-validator/                # +τ 效率（增强）
│   └── task-archiver/                   # +Pattern 存储（增强）
```

---

## 使用方式

Orchestrator Pro 通过 orchestrator 统一入口触发，不需要直接调用。当复杂度高或需要 τ 控制时，Reasoner 自动升级到 Pro 模式。

### 手动触发

```
使用 orchestrator 处理任务时，添加环境变量或配置参数启用 Pro 模式：
目前由 Reasoner 自动判断，无需手动指定
```

### 查看 τ 报告

任务完成后，输出包含 τ 分解报告：

```
## τ 分解报告
   总消耗: 7500 / 15000 (50.0%)
   ├─ intent:     800 (10.7%)
   ├─ match:     1200 (16.0%)
   ├─ plan:       400  (5.3%)
   ├─ exec:      4200 (56.0%)
   ├─ validate:   500  (6.7%)
   └─ archive:    400  (5.3%)
   效率评分: 0.82 (优秀)
   折叠节省: 35% (2次折叠)
   模式复用: 25% τ折扣
   上下文命中率: 68%
   Co-Design: Model=45% / Rules=30% / Skills=25%
```

---

## τ 预算档位

| 档位 | 复杂度 | 总预算 | 使用场景 |
|------|--------|--------|---------|
| simple | 1-3 | 5,000 | 单步操作、无状态、≤2 文件 |
| moderate | 4-6 | 15,000 | 多步骤、有状态、多文件 |
| complex | 7-10 | 50,000 | 复杂决策、多 skill 协同 |

---

## 依赖规则文件

- `.claude/rules/tau-control.mdc` — τ 控制核心规则
- `.claude/rules/task-folding.mdc` — Task Folding 规则
- `.claude/rules/skill-stacking.mdc` — Skill Stacking 规则
- `.claude/rules/pattern-mining.mdc` — Pattern Mining 规则

---

## 模式库

模式库路径：`.claude/skills/patterns/`

初始模式：
- `frontend-scan/` — Vue/React 项目扫描模式
- `api-generation/` — API 处理器生成模式
- `bug-fix-standard/` — 标准 Bug 修复模式
- `perf-optimization/` — 性能优化模式

---

**版本**: 1.0
**最后更新**: 2026-06-02
**理论基础**: 华为韬定律（何庭波，2026）
**父版本**: Orchestrator v1.2