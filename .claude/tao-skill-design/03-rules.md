# Rules 约束体系

> **前置引用**：
> - `00-theory.md` — 提供映射框架
> - `01-tau-formula.md` — 提供 τ 公式和三指标体系
> - `02-k1-k4.md` — 提供 K1-K4 技术规范（Task Folding / Skill Stacking / Co-Design / Pattern Mining）
>
> **引用关系**：本文档被 `04-skill-design.md`（Skill Stacking 集成规范引用 03-rules.md 的 stack-* 约束）引用。

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
fold-protect-003: 涉及不同 domain 的 skill 不能折叠
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
stack-layer-003: 栈叠层级深度最多 4 层（感知/分析/生成/输出）

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

**引用关系**：
- `04-skill-design.md` — 引用本文档 stack-share-* 规则（用于 Skill Stacking 集成规范），co-design 规则（用于 Co-Design 贡献度定义）