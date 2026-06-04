# Code Optimizer（τ 增强版）

系统化地优化代码，基于代码质量分析和性能分析识别改进点，提供可执行的优化方案，并应用修改以提升代码质量、性能和可维护性。整合 τ-Agent 监控（Task Folding、Skill Stacking、Co-Design、Pattern Mining），在用户请求代码优化或性能优化时自动触发。

> 本 Skill 由 `code-optimizer` 和 `performance-optimizer` 合并而成，通过华为韬定律 K1 Task Folding 将 13 个原子技能压缩为 6 个，τ 效率提升约 20-30%。

## 快速开始

### 触发方式

当用户请求代码优化或性能优化时自动触发：

```
用户: "优化 src/components/MeetingCard.vue，减少复杂度，提高渲染性能"
用户: "优化首屏加载性能，Lighthouse 分数提升到 90+"
```

### 执行命令

Claude Code 将按以下 6 步管道自动执行（τ 压缩后）：

```
quality-and-perf-analysis
        ↓
pattern-and-benchmark-recognition
        ↓
optimization-proposal
        ↓
code-optimization
        ↓
optimization-verification
        ↓
documentation-update
```

---

## 文件结构

```
code-optimizer/
├── SKILL.md                         # 主 skill 定义（τ 增强版 v2.0）
├── README.md                        # 本文件
└── atomic-skills/
    ├── quality-and-perf-analysis/   # 并行质量+性能数据收集（Task Folding）
    │   └── SKILL.md
    ├── pattern-and-benchmark-recognition/  # 模式识别+基准测试（Task Folding）
    │   └── SKILL.md
    ├── optimization-proposal/        # 生成优化方案（Task Folding）
    │   └── SKILL.md
    ├── code-optimization/           # 应用优化方案（Task Folding）
    │   └── SKILL.md
    ├── optimization-verification/   # 验证优化效果（合并两个 optimizer）
    │   └── SKILL.md
    └── documentation-update/        # 更新文档
        └── SKILL.md
```

---

## τ 增强架构

### Task Folding（K1）

通过 Task Folding 将原来两个 optimizer 的 13 个原子技能压缩为 6 个：

| 旧原子技能 | 合并目标 | 说明 |
|-----------|---------|------|
| code-quality-analysis | → quality-and-perf-analysis | 并行执行 |
| performance-data-collection | → quality-and-perf-analysis | 并行执行 |
| pattern-recognition | → pattern-and-benchmark-recognition | 并行执行 |
| benchmark-generation | → pattern-and-benchmark-recognition | 并行执行 |
| improvement-suggestion | → optimization-proposal | 合并设计 |
| optimization-strategy-design | → optimization-proposal | 合并设计 |
| code-refactoring | → code-optimization | 合并应用 |
| optimization-application | → code-optimization | 合并应用 |
| optimization-verification | → optimization-verification | 合并验证 |

### Skill Stacking（K2）

上游技能输出写入 `task_skill.md` 共享上下文，下游技能优先从上下文读取，避免重复解析文件。

### Co-Design（K3）

Model × Rules × Skills 三层协同分配：
- 简单任务：规则覆盖率目标 >= 80%
- 复杂任务：模型主控，规则辅助

### Pattern Mining（K4）

成熟优化模式（出现 >= 5 次）τ 折扣 70%，直接复用。

---

## τ 预算体系

```python
TAU_BUDGETS = {
    "simple":    {"total": 5000,   "exec": 3200},
    "moderate":  {"total": 15000,  "exec": 10600},
    "complex":   {"total": 50000,  "exec": 38500},
}
```

| τ 阈值 | 行为 |
|--------|------|
| > 80% | 触发警告 |
| > 95% | 触发强制 Task Folding |
| > 100% | 终止非核心步骤 |

---

## 质量指标体系

### 代码质量指标
| 指标 | 目标值 |
|------|--------|
| 圈复杂度 | < 15 |
| 认知复杂度 | < 10 |
| 重复代码率 | < 5% |
| 函数行数 | < 50 行 |
| 文件行数 | < 300 行 |

### 性能指标
| 指标 | 目标改善 |
|------|----------|
| LCP | < 2.5s |
| FCP | < 1.8s |
| CLS | < 0.1 |
| TBT | < 200ms |
| Bundle Size | 减少 >= 10% |

---

## 优化方案分级

每个优化问题提供 3 个方案供选择：

| 方案 | 特点 | 适用场景 |
|------|------|----------|
| 激进优化 | 性能最优，可能有破坏性改动 | 需要极致性能、对测试覆盖有信心时 |
| 折中优化 | 平衡性能和稳定性 | 大多数场景首选 |
| 保守优化 | 最小改动、风险最低 | 需要快速修复、暂时无法大规模重构时 |

---

## 使用示例

### 输入

```
优化 src/components/MeetingCard.vue，减少复杂度，提高渲染性能
```

### 执行流程

**Step 1: quality-and-perf-analysis**
- 并行执行：静态代码质量分析 + 性能数据收集（Lighthouse/Web Vitals）
- 输出：质量报告（圈复杂度、重复率、异味）+ 性能基线（LCP/FCP/CLS/TBT）

**Step 2: pattern-and-benchmark-recognition**
- 识别可优化代码模式（大函数、重复逻辑、XSS 风险）
- 生成性能基准测试用例（Before 基线快照）
- 输出：模式列表（3 种以上）+ 基准测试配置

**Step 3: optimization-proposal**
- 基于模式识别 + 基准测试双维度
- 为每个问题生成 3 个优化方案（激进/折中/保守）
- 输出：优化方案文档（含 diff 代码修改和预期收益）

**Step 4: code-optimization**
- 应用用户选择的优化方案（代码重构 + 构建配置）
- 生成回滚脚本
- 输出：优化后代码 + 回滚脚本 + diff 对比

**Step 5: optimization-verification**
- 验证功能正确性（语法检查、构建测试）
- 对比 Before/After 指标（质量 + 性能）
- PASS/FAIL 判定
- 输出：验证报告（全部指标达标）

**Step 6: documentation-update**
- 更新组件注释和 JSDoc
- 更新 README 使用说明
- 更新 API 文档（如有）
- 输出：文档更新清单

### 输出产物

- 优化后的代码文件
- 质量 + 性能基线报告
- 代码 diff 对比
- Before/After 验证报告
- 更新后的文档

---

## τ 分解报告示例

每个任务完成后输出 τ 分解报告：

```markdown
# τ 分解报告

## τ 预算
- 任务类型：moderate
- 总预算：15000 τ | 实际消耗：14200 τ

## τ 分解
| 步骤 | 预算 | 实际 | 状态 |
|------|------|------|------|
| quality-and-perf-analysis | 1700 | 1650 | 正常 |
| pattern-and-benchmark-recognition | 1400 | 1350 | 正常 |
| optimization-proposal | 1500 | 1480 | 正常 |
| code-optimization | 3000 | 2900 | 正常 |
| optimization-verification | 1500 | 1420 | 正常 |
| documentation-update | 300 | 280 | 正常 |

## τ 收益
- Task Folding 节省：约 1500 τ（10%）
- Skill Stacking 节省：约 800 τ（5.3%）
- Pattern Mining 节省：约 400 τ（2.7%）
- 总节省：约 2700 τ（18%）
```

---

## 注意事项

1. **功能优先**：始终优先保证功能正确性，其次才是优化
2. **多方案选择**：提供多个优化方案，让用户根据实际情况选择
3. **Skill Stacking**：下游技能优先从共享上下文读取，避免重复解析文件
4. **τ 控制**：τ > 80% 时触发警告，τ > 95% 时触发强制折叠
5. **备份回滚**：优化前自动备份原始代码，支持回滚
6. **Pattern Mining**：成熟模式（>= 5 次）直接复用，τ 折扣 70%