# 新增主 Skill 设计规范

> **前置引用**：
> - `01-tau-formula.md` — 提供 τ_budget 三档配置和 complexity → τ_budget 映射机制
> - `02-k1-k4.md` — 提供 K1-K4 技术规范（Skill Stacking 集成需要引用 K2、Pattern Mining 需要引用 K4）
> - `03-rules.md` — 提供 stack-share-* 规则（Skill Stacking 集成）和 co-design 规则（Co-Design 贡献度）
>
> **引用关系**：本文档为新增 Skill 的操作手册，是系统的最终使用层。

---

# 第四部分：新增主 Skill 设计规范（v1.1 新增）

> 当需要新增一个主 Skill（如 code-generator、bug-solver 等）时，必须遵循以下规范。
> 遵循这些规范，新 Skill 才能正确接入 orchestrator-pro 的 τ 体系、Skill Stacking 和 Pattern Mining。

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
> 主 Skill 的 τ_budget 应 ≤ orchestrator τ_exec 预算的 60%（参见 `01-tau-formula.md` 2.2.1 三档预算配置表）。

**τ_budget 示例**（引用自 `01-tau-formula.md` 2.2.1）：

| Skill | simple | moderate | complex |
|-------|--------|---------|---------|
| code-generator | 2,500 | 8,000 | 20,000 |
| bug-solver | 2,000 | 6,000 | 15,000 |
| code-structure-analyzer | 2,000 | 8,000 | 20,000 |
| doc-generator | 1,500 | 4,000 | 10,000 |

**layer 层级定义**（引用自 `00-theory.md` 2.1 映射框架）：

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
    core_skills = [s for s in atomic_skills if s.get("is_core", False)]
    optional_skills = [s for s in atomic_skills if not s.get("is_core", False)]

    core_budget = skill_budget * 0.6
    optional_budget = skill_budget * 0.4

    total_weight = sum(s.get("tau_weight", 1.0) for s in core_skills)
    for s in core_skills:
        s["tau_allocated"] = core_budget * (s.get("tau_weight", 1.0) / total_weight)

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

> 引用 `03-rules.md` 的 stack-share-* 规则（强制执行）

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