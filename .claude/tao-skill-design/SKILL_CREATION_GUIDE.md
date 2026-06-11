# Skill 创建指南 v2.2（τ 增强版）

> 本指南是 Skill 系统的**可操作手册**，配套 `README.md` 的 5 步概述，提供完整的创建流程、模板和规范。
>
> **前置阅读**：`README.md` 第 1-3 节（版本信息、目录结构、技能统计）

---

## ⚠️ 设计规范遵循声明（创建 Skill 前必读）

> **所有主 Skill 必须遵循以下设计规范体系，否则无法正确接入 orchestrator-pro 的 τ 增强体系。**

**规范层级关系：**

```
.claude/tao-skill-design/TAO_THEORY_DESIGN.md（原 .claude/skills/tao-theory-design.md 重构拆分版）
    │
    └── 拆分为 .claude/tao-skill-design/（当前指南引用的来源）
            ├── 00-theory.md        → 华为韬定律 + K1-K4 通俗类比
            ├── 01-tau-formula.md   → τ 公式 + 三指标体系 + 三档预算
            ├── 02-k1-k4.md          → K1-K4 技术规范详解
            ├── 03-rules.md          → Rules 约束体系
            └── 04-skill-design.md  → 新增 Skill 设计规范（**核心必读**）
                    │
                    └── 本文件（SKILL_CREATION_GUIDE.md）—— 操作手册
```

**强制遵循要求：**

| 必须遵循 | 遵循内容 | 来源 |
|---------|---------|------|
| ✅ 华为韬定律核心思想 | K1-K4 四大技术（Task Folding / Skill Stacking / Co-Design / Pattern Mining）| `00-theory.md` 1.3 节 + `02-k1-k4.md` |
| ✅ τ 量纲与三指标体系 | τ = duration×0.5 + tokens×0.001；τ 驱动决策，Token/Duration 辅助观测 | `01-tau-formula.md` 2.1b 节 |
| ✅ 三档预算配置 | simple=5000 / moderate=15000 / complex=50000；主 Skill τ_budget 仅覆盖 exec 阶段 | `01-tau-formula.md` 2.2.1 节 |
| ✅ 新增 Skill 必要字段 | name/desc/version/match_keywords/τ_budget/layer/upstream_dependencies/status | `04-skill-design.md` 4.1 节 |
| ✅ SKILL.md 完整结构 | τ_agent 公式 / τ 估算表 / K1-K4 设计 / 强约束 / stack-enforce 规则 | `04-skill-design.md` 4.2 节 |
| ✅ Rules 约束 | fold-* / stack-* / codesign-* / pattern-* / tau-* | `03-rules.md` |
| ✅ Pattern 成熟度标准 | 1次=试验(10%) / 2-4次=成长(40%) / ≥5次=成熟(70%) | `02-k1-k4.md` 2.6.2 节 |
| ✅ Skill Stacking 写入规范 | 上游 skill 输出必须写入 task_skill.md，下游 skill 优先从共享上下文读取 | `02-k1-k4.md` 2.4.3 节 |

**禁止违反的硬性规则（FORBIDDEN）：**
- ❌ 创建不包含 `τ_budget` 字段的 SKILL.md
- ❌ SKILL.md 中缺少 K1-K4 任意一项的设计说明（复杂度极低的 skill 除外）
- ❌ 跳过 `stack-enforce-002`（写入 task_skill.md 共享上下文）
- ❌ 创建不在 skills_register.md 中注册的 skill 并声称其支持 orchestrator-pro 调用

---

## ⭐ 创建方式：优先使用 `/skill-creator`（官方工具）

> **强烈建议**：所有 Skill 创建操作**必须使用 `/skill-creator`**，而非手动按照本指南逐项操作。
>
> `/skill-creator` 是 Claude Code 内置的官方 Skill 创建工具，已自动整合本规范体系的所有要求：
> - 自动生成符合 `tao-theory-design.md` 设计逻辑的 SKILL.md
> - 自动填写 frontmatter（τ_budget / layer / match_keywords 等）
> - 自动注册到 skills_register.md / atomic_skills_register.md
> - 自动更新 settings.json / CLAUDE.md

**使用方式**：
```bash
/skill-creator                    # 启动创建向导（交互式）
/skill-creator <skill-name>       # 指定名称创建
```

**何时需要阅读本指南**：
- 理解 `/skill-creator` 背后的设计逻辑（K1-K4 / τ 体系 / Rules 约束）
- 自定义 `/skill-creator` 生成的 SKILL.md 内容
- 手动检查或修改已创建的 Skill
- 扩展本规范体系（修改 Rules / τ 预算配置等）

---

## 配套参考文件（位于 `.claude/tao-skill-design/`）

| 文件 | 内容 |
|------|------|
| `00-theory.md` | 华为韬定律 + K1-K4 通俗类比 + 核心映射框架 |
| `01-tau-formula.md` | τ 公式 + 三指标体系 + 三档预算配置 |
| `02-k1-k4.md` | K1-K4 技术规范详解（含 Task Folding / Skill Stacking / Co-Design / Pattern Mining）|
| `03-rules.md` | Rules 约束体系（.mdc 格式，fold-* / stack-* / codesign-* / pattern-* / tau-*）|
| `04-skill-design.md` | 新增主 Skill 设计规范（**核心必读**：必填字段/SKILL.md 模板/注册流程）|
| `index.md` | 总索引 + 模块关系图 + 快速参考 |

> `tao-theory-design.md`（`.claude/skills/tao-theory-design.md`）为原始完整版，以上拆分文件均引用自该文件。

---

## 1. Skill 系统架构速览

```
orchestrator-pro（Reasoner，唯一入口）
    ├── 意图识别 → 匹配主 Skill
    └── 调度主 Skill 执行
            │
            ├── <主 Skill A>
            │       └── atomic-skills/ → skill-1 → skill-2 → skill-3
            ├── <主 Skill B>
            │       └── atomic-skills/ → skill-1 → skill-2
            └── ...
```

### 五个关键注册点

| 文件 | 位置 | 作用 | 更新时机 |
|------|------|------|---------|
| `skills_register.md` | `orchestrator/` | 主 Skill 索引（15个主 Skill 的入口信息） | 新增/修改主 Skill 时 |
| `atomic_skills_register.md` | `orchestrator/` | 各主 Skill 的原子技能详情 + 依赖关系 | 新增/修改原子 Skill 时 |
| `settings.json` | `.claude/` | Slash Command 注册 | 新增支持 `/cmd` 调用的 Skill 时 |
| `CLAUDE.md` | 项目根目录 | 主 Skill 表更新（数量+条目） | 新增主 Skill 时 |
| `.claude/tao-skill-design/04-skill-design.md` | — | SKILL.md 编写规范依据 | — |

---

## 2. 创建前：判断要创建哪种 Skill

```
用户请求
    ├── "帮我生成代码" / "写一个函数"        → code-generator
    ├── "优化这段代码" / "重构"              → code-optimizer
    ├── "找出重复代码" / "死代码"            → code-optimizer（redundancy-check）
    ├── "报错了 / 有 Bug"                   → bug-solver
    ├── "扫描项目技术栈"                    → scan-object-info
    ├── "需求文档 / 需求标准化"              → requirement-generator
    ├── "安全漏洞扫描"                      → security-scanner
    ├── "生成测试用例"                      → test-generator
    ├── "生成文档 / README"                 → doc-generator
    ├── "Git 操作"                          → git-assistant
    ├── "Docker / CI/CD 部署"               → deploy-helper
    │
    └── 现有 Skill 无法覆盖                  → 【新建主 Skill】
```

**判断原则**：
- 现有 Skill 能覆盖 → 在现有 Skill 下新增/增强原子技能
- 现有 Skill 无法覆盖 → 新建主 Skill（按本指南流程）

---

## 3. 创建流程

> **重要**：推荐使用 `/skill-creator`（官方工具）一站式完成 Skill 创建，手动流程仅作备用理解参考。

### 步骤 1：确定 Skill 定位

**新建主 Skill** 需要回答：

1. **Skill 名称**（英文 slug，kebab-case）：用于目录名、注册表、命令
2. **描述**（一句话）：用于注册表和 Orchestrator 匹配
3. **触发关键词**（≥3 个）：用户说什么时触发此 Skill
4. **所属层级**：perception / analysis / generation / output
5. **τ_budget 档位**：simple / moderate / complex 三档值
6. **上游依赖**：依赖哪些上游 Skill（如 scan-object-info）

### 步骤 2：创建目录和文件结构

**标准主 Skill 目录结构**（参考 `scan-object-info`）：

```
.claude/skills/<skill-name>/
├── SKILL.md                  # 必选，核心定义文件（τ 增强版）
├── README.md                  # 可选，使用说明
├── atomic-skills/             # 可选，原子技能目录（kebab-case）
│   ├── atomic-skill-1/        # 每个原子技能一个子目录
│   │   └── SKILL.md
│   └── atomic-skill-2/
│       └── SKILL.md
└── patterns/                 # 可选，K4 Pattern Mining 模式库
    └── <project-type>/
        └── pattern.md
```

### 步骤 3：使用 /skill-creator 创建（推荐）或手动编写 SKILL.md

**推荐方式（使用官方工具）**：
```bash
/skill-creator <skill-name>
```
`/skill-creator` 会自动引导你完成所有设计决策，生成符合本规范的 SKILL.md。

**备用方式（手动编写）**：
如果需要手动创建或自定义，详见第 4 节「SKILL.md 编写规范」。

### 步骤 4：设计原子技能（如需要）

- 复杂 Skill 需要 3-9 个原子技能
- 每个原子技能一个子目录 + SKILL.md
- 定义 `is_core`（核心/可选）和 `τ_weight`（权重）

### 步骤 5：注册到 skills_register.md（`orchestrator/skills_register.md`）

在 `## 主技能索引` 的 YAML 块中添加：

```yaml
- name: my-skill
  desc: 一句话描述本 Skill 的核心功能
  path: .claude/skills/my-skill/SKILL.md
  core_ability: 核心能力描述（用顿号分隔）
  match_keywords: [关键词1, 关键词2, 关键词3]  # ≥3 个
  status: 启用
  note: 附加说明（可选）
```

### 步骤 6：注册原子技能（`orchestrator/atomic_skills_register.md`）

```yaml
## N. my-skill 原子技能

atomic_skills:
  - name: atomic-skill-1
    core_ability: 原子技能能力描述
    depend: 无  # 或具体依赖的原子技能名
    status: 启用
    tau: 300           # τ 预算（token 量纲）
    parallel_group: 0   # 并行组编号，组内可并行，组间串行
    is_core: true      # 是否为核心 Skill（核心不可折叠）
```

### 步骤 7：注册 slash command（`.claude/settings.json`）

在 `commands` 数组中添加：

```json
{
  "name": "/my-skill",
  "description": "一句话描述"
}
```

### 步骤 8：更新 CLAUDE.md（项目根目录）

1. 在主 Skill 表中添加新条目（名称 + 触发关键词）
2. Skill 总数 +1

### 步骤 9：编写 README.md（如需要）

使用说明文档，包含：
- 功能描述
- 使用场景
- 输入/输出格式
- 依赖的上游 Skill

### 步骤 10：创建 Pattern（可选，K4 Pattern Mining）

在 `.claude/skills/patterns/<domain>/` 下创建模式文件：

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
```

### 步骤 11：验证注册

```bash
# 1. 确认文件存在
ls .claude/skills/<skill-name>/SKILL.md

# 2. 确认注册表更新
grep -n "name: my-skill" .claude/skills/orchestrator/skills_register.md

# 3. 验证 YAML 格式正确（必须 2 空格缩进）
# 检查 skills_register.md 中新增条目的缩进是否为 2 空格

# 4. 确认 slash command 已添加
grep "my-skill" .claude/settings.json

# 5. 确认 CLAUDE.md 已更新
grep "my-skill" CLAUDE.md
```

### 步骤 12：提交 git

```bash
git add .claude/skills/my-skill/
git add .claude/skills/orchestrator/skills_register.md
git add .claude/skills/orchestrator/atomic_skills_register.md
git add .claude/settings.json
git add CLAUDE.md
git commit -m "feat: 新增 my-skill 主技能"
```

---

## 4. SKILL.md 编写规范（τ 增强版，参考 scan-object-info/SKILL.md）

> ⚠️ **规范来源**：本节内容完整遵循 `tao-skill-design/04-skill-design.md` 第 4 节设计规范，并参考 `scan-object-info/SKILL.md` 的实际实现结构。
>
> **所有 τ 增强版 SKILL.md 必须包含**：
> 1. frontmatter（`name/desc/version/match_keywords/τ_budget/layer/upstream_dependencies/status`）
> 2. `## τ_agent 公式` — 声明 τ 量纲
> 3. `## τ 估算表` — 每个原子技能的 τ 值
> 4. K1-K4 设计章节（视复杂度决定详略）
> 5. `## 强约束` — 7 条强制规则
> 6. `## ⭐ K2 Skill Stacking 强制执行规则` — stack-enforce-001~004

### 4.1 完整 SKILL.md 模板（τ 增强版）

每个主 Skill 的 SKILL.md **必须包含以下所有章节**：

```markdown
---
name: <skill-name>
desc: <一句话描述>
version: x.y.z
match_keywords: [<关键词1>, <关键词2>, <关键词3>]   # ≥3 个
τ_budget:                    # 仅覆盖 τ_exec 阶段
  simple:   <值>               # complexity 1-3
  moderate: <值>               # complexity 4-6
  complex: <值>                # complexity 7-10
layer: <perception|analysis|generation|output>
upstream_dependencies: [<skill-name>]  # 依赖的上游 Skill
status: 启用
---

# <主 Skill 名称> 主Skill v<版本>（韬定律增强版）

## τ_agent 公式
```
τ_agent = τ_intent + τ_match + τ_plan + τ_exec + τ_validate
性能 ∝ 1 / τ_agent
目标：通过K1-K4压缩τ，而不是堆叠更多技能
```

## τ 估算表

| 原子技能 | τ 值 | 说明 |
|---------|------|------|
| atomic-skill-1 | 150 | xxx |
| atomic-skill-2 | 200 | xxx |

**τ 预算阈值**：simple=5000 / moderate=15000 / complex=50000
**预警线**：80% warning / 95% critical / 100% abort

---

## 核心能力
- <能力1>
- <能力2>

---

## 版本历史
- v<版本> (<日期>): 初始版本

---

## 改进点（上一版本 → 本版本）
1. K1 Task Folding：<合并说明>
2. K2 Skill Stacking：<上下文共享说明>
3. K3 Co-Design：<决策矩阵说明>
4. K4 Pattern Mining：<模式库说明>

---

## K1：Task Folding — 技能折叠合并

### 合并方案

原N技能 → 新M技能

### 合并规则

```
fold-001: xxx
fold-002: xxx
```

---

## K2：Skill Stacking — 上下文共享

### 共享上下文格式（写入 task_skill.md）

```markdown
## <Skill-name> 执行上下文

### 原子技能输出
<!-- atomic-skill: <atomic-skill-name> -->
| 字段 | 类型 | 说明 |
|------|------|------|
| {field} | {type} | {desc} |
<!-- /atomic-skill: <atomic-skill-name> -->
```

### 写入映射

| 原子 skill | 写入位置 | 写入内容 |
|-----------|---------|---------|
| atomic-skill-1 | `### xxx` | xxx |

---

## K3：Co-Design — 规则与LLM协同

### 决策矩阵

| 任务环节 | 规则分配 | LLM分配 | 说明 |
|---------|---------|--------|------|
| 意图识别 | 高 | 中 | 规则优先，LLM兜底 |
| xxx | 中 | 高 | xxx |

---

## K4：Pattern Mining — 模式复用

### 模式库结构

```
.claude/skills/<skill-name>/patterns/
├── <pattern-1>/            # 成熟，τ×0.3
│   └── pattern.md
└── <pattern-2>/            # 成长，τ×0.6
    └── pattern.md
```

### 模式匹配流程

```
1. 从 {输入} 提取特征
2. 与模式库匹配（相似度阈值 0.6）
3. 命中模式 → 直接复用上下文，跳过重复执行
```

---

## 原子技能列表

| 原子技能 | τ | 职责 | 并行组 |
|---------|---|------|-------|
| atomic-skill-1 | 150 | xxx | 0（预处理）|
| atomic-skill-2 | 200 | xxx | 1（并行）|

### 执行计划（并行优化）

```
预处理：atomic-skill-0（τ=xxx）
并行组1：atomic-skill-1 + atomic-skill-2
串行：atomic-skill-3（更新共享上下文）
```

---

## 输入/输出规范

### 输入

| 参数 | 类型 | 说明 |
|------|------|------|
| {param} | {type} | {desc} |

### 输出

{描述输出产物和格式}

---

## 输出格式

### 完整输出（所有技能）
{markdown 格式}

### 智能裁剪（按需调用）

| 用户意图 | 触发技能 | 输出范围 |
|---------|---------|---------|
| xxx | atomic-skill-1 | 1 |

---

## 置信度标注

- **high**：有明确证据
- **medium**：仅有依赖声明
- **low**：基于间接信号推测

---

## 错误处理

**降级策略**：
- ⚠️ {错误描述}
  - 降级：{降级输出}
  - 建议后续操作：{操作}

---

## 强约束

1. **K1 优先**：技能合并后 τ 节省必须 > 20%
2. **K2 强制**：所有原子 skill 输出必须写入共享上下文（task_skill.md）
3. **K3 按需**：简单任务用规则，复杂任务用 LLM
4. **K4 缓存**：命中模式后跳过重复执行
5. **τ 预警**：80% 预警 / 95% 严重 / 100% 终止（核心步骤除外）
6. **置信度**：每个检测结果必须标注 confidence
7. **输出精简**：只输出必要信息

---

## ⭐ K2 Skill Stacking 强制执行规则（MUST）

> 背景：`tao-skill-design/04-skill-design.md` 和 `.claude/rules/skill-stacking.mdc` 明确要求上游 skill 输出写入共享上下文。

### 执行前：检查共享上下文

**stack-enforce-001**（MUST）：
在开始执行之前，检查 `tasks/current/task_skill.md` 是否存在：
- 存在 → 继续执行
- 不存在 → 等待 orchestrator-pro 生成后继续

### 执行中：每个原子 skill 完成后写入上下文

**stack-enforce-002**（MUST）：
每个原子 skill 完成后，必须执行：
```
1. Read tasks/current/task_skill.md
2. Edit 在对应区域的 <!-- atomic-skill: {name} -->...<!-- /atomic-skill: {name} --> 写入输出
3. Write tasks/current/task_skill.md
```

### 执行后：汇总写入

**stack-enforce-003**（MUST）：
所有原子 skill 执行完毕后，必须执行汇总步骤：
```
1. Read tasks/current/task_skill.md
2. Edit 追加 τ 执行记录
3. Write tasks/current/task_skill.md
```

### 禁止行为

**stack-enforce-004**（FORBIDDEN）：
- 禁止在不写入 task_skill.md 共享上下文的情况下完成本 skill
- 禁止跳过汇总写入步骤（即使 τ 预算紧张，汇总步骤是强制步骤）

---

## Co-Design 贡献度

| 环节 | Model | Rules | Skills |
|------|-------|-------|--------|
| {step} | {val} | {val} | {val} |

---

## Skill Stacking 集成

### 上游依赖

- scan-object-info（读取 project_context）

### 共享上下文写入（task_skill.md）

| 字段 | 类型 | 说明 |
|------|------|------|
| {field} | {type} | {desc} |

### Skill Stacking 验证清单

□ 定义 shared_outputs：列出写入 task_skill.md 的所有字段
□ 定义 upstream_dependencies：列出依赖的上游 Skills
□ 定义 read_priority：shared_context > 文件重读
□ 堆叠效率可验证：stack_hit_rate 可追踪

---

## Pattern 贡献规范

### 成熟度等级

```
1 次       → 试验模式（τ 折扣 10%）
2-4 次     → 成长模式（τ 折扣 40%）
≥5 次      → 成熟模式（τ 折扣 70%）

晋升路径：试验(1次) → 成长(2次) → 成熟(5次)
```

---

## 主skill完成标准（N项）

1. <标准1>
2. <标准2>
```

### 4.2 frontmatter 规范

| 字段 | 必须 | 说明 |
|------|------|------|
| `name` | ✅ | 英文 slug，kebab-case，全局唯一 |
| `desc` | ✅ | 一句话描述，出现在 skills_register.md |
| `version` | ✅ | 语义化版本号 x.y.z |
| `match_keywords` | ✅ | 意图匹配关键词，≥3 个 |
| `τ_budget` | ✅ | 三档 τ 预算，仅覆盖 τ_exec 阶段 |
| `layer` | ✅ | 层级：perception/analysis/generation/output |
| `upstream_dependencies` | ✅ | 依赖的上游 Skill |
| `status` | ✅ | 启用/已废弃/已合并 |

**layer 层级定义**：

| 层级 | 职责 | 已有 Skill |
|------|------|-----------|
| `perception`（感知层）| 扫描、检测、收集项目信息 | scan-object-info |
| `analysis`（分析层）| 分析、诊断、定位问题 | bug-solver, code-optimizer, security-scanner |
| `generation`（生成层）| 生成、创建、实现新内容 | code-generator, test-generator, doc-generator |
| `output`（输出层）| 格式化、归档、生成文档 | code-structure-analyzer |

### 4.3 τ_budget 配置参考

| Skill | simple | moderate | complex |
|-------|--------|---------|---------|
| code-generator | 2,500 | 8,000 | 20,000 |
| bug-solver | 2,000 | 6,000 | 15,000 |
| code-structure-analyzer | 2,000 | 8,000 | 20,000 |
| doc-generator | 1,500 | 4,000 | 10,000 |

> ⚠️ τ_budget 仅覆盖 τ_exec 阶段，与 orchestrator 的 τ_intent/τ_match/τ_plan/τ_validate 解耦。
> 详情见 `.claude/tao-skill-design/01-tau-formula.md` 2.2.1 节。

### 4.4 原子技能 SKILL.md 格式

```markdown
---
name: <atomic-skill-name>
description: <一句话描述>
---

# <Atomic Skill 名称>

## 概述
<原子技能的具体职责>

## 输入
<期望从上游接收的数据（来自 task_skill.md 或参数）>

## 输出
<本技能执行后的输出（写入 task_skill.md）>

## 核心逻辑
<详细的执行逻辑说明>

## 异常处理
<可能出现的异常及处理方式>

## 完成标准
<本原子技能的完成判定条件>
```

### 4.5 参考文件推荐

| 复杂度 | 参考文件 | 原子技能数 |
|--------|---------|-----------|
| 低（7 个原子技能，并行优化）| `scan-object-info/SKILL.md` | 7 |
| 中（3-5 个原子技能）| `security-scanner/SKILL.md` | 4 |
| 高（6+ 个原子技能）| `bug-solver/SKILL.md` | 7 |
| 最高（多场景路由）| `code-generator/SKILL.md` | 9 |

---

## 5. 常见问题排查

### Q1：Skill 无法被 Orchestrator 匹配

**原因**：未注册到 `skills_register.md` 或关键词不匹配

**排查**：
1. 确认 `skills_register.md` 中有对应条目
2. 确认 `match_keywords` 包含用户可能使用的关键词（≥3 个）
3. 确认 `status` 为 `启用`
4. 确认 frontmatter 的 `name` 与 `skills_register.md` 中的 `name` 一致

### Q2：原子技能执行顺序不对

**原因**：依赖关系配置错误

**排查**：
1. 检查 `atomic_skills_register.md` 中的 `depend` 字段
2. 确认无循环依赖（A→B→C→A）
3. 确认 `depend: 无` 的技能在最前面

### Q3：并行执行结果丢失

**原因**：并行组的技能同时写入共享上下文时发生覆盖

**排查**：
1. 并行组内的技能应只读取、不写入（或写入不同 key）
2. 检查 `parallel_group` 编号是否正确
3. 汇总技能应在并行组之后串行执行

### Q4：YAML 格式错误

**原因**：缩进不一致（必须 2 空格）

**排查**：
```bash
# 检查缩进（必须是 2 空格）
grep -n "  " .claude/skills/orchestrator/skills_register.md | head -20
# 确认无 Tab 字符
grep -Pn "\t" .claude/skills/orchestrator/skills_register.md
```

### Q5：τ 预算超支

**原因**：`τ_budget` 档位值配置过低

**排查**：
1. 参考 `04-skill-design.md` 4.1 节的 τ_budget 示例表
2. 检查各原子技能的 τ 值相加是否超过档位预算
3. 若 τ_budget 不足，触发 Task Folding（折叠可选原子技能）

---

## 6. 新建 Skill 清单（Checklist）

> **推荐流程**：使用 `/skill-creator` 一站式完成，以下 Checklist 供手动验证和理解参考。

创建新的主 Skill 时，逐项检查：

```
[ ] 0. 运行 /skill-creator <skill-name>（推荐）
[ ] 1. 确定 Skill 名称（kebab-case）和触发关键词（≥3 个）
[ ] 2. 确定所属层级（perception/analysis/generation/output）
[ ] 3. 确定 τ_budget 三档值（参考 4.3 节配置参考表）
[ ] 4. 创建目录：.claude/skills/<skill-name>/
[ ] 5. 编写 SKILL.md（含 frontmatter + K1-K4 设计 + 强约束）
[ ] 6. 设计原子技能（如需要），在 atomic-skills/ 下创建各原子技能 SKILL.md
[ ] 7. 更新 orchestrator/skills_register.md（添加主 Skill 条目）
[ ] 8. 更新 orchestrator/atomic_skills_register.md（添加原子技能）
[ ] 9. 更新 .claude/settings.json（添加 slash command）
[ ] 10. 更新 CLAUDE.md（主 Skill 表数量+1）
[ ] 11. 编写 .claude/skills/<skill-name>/README.md（使用说明）
[ ] 12. 如有 Pattern 贡献，在 .claude/skills/patterns/ 下创建 pattern.md
[ ] 13. 验证 YAML 格式正确（2 空格缩进）
[ ] 14. git commit（提交信息：feat: 新增 <skill-name> 主技能）
```

> 注意：步骤 0-14 由 `/skill-creator` 自动引导完成，人工只需确认各步骤的设计决策是否符合本规范体系。

---

## 7. 参考文件索引

| 目的 | 参考文件 |
|------|---------|
| SKILL.md 标准格式（低复杂度）| `.claude/skills/scan-object-info/SKILL.md` |
| SKILL.md 标准格式（高复杂度）| `.claude/skills/bug-solver/SKILL.md` |
| SKILL.md 标准格式（多场景路由）| `.claude/skills/code-generator/SKILL.md` |
| 新增 Skill 设计规范 | `.claude/tao-skill-design/04-skill-design.md` |
| τ 公式 + 三档预算配置 | `.claude/tao-skill-design/01-tau-formula.md` |
| K1-K4 技术规范 | `.claude/tao-skill-design/02-k1-k4.md` |
| Rules 约束体系 | `.claude/tao-skill-design/03-rules.md` |
| 主技能注册表示例 | `.claude/skills/orchestrator/skills_register.md` |
| 原子技能注册表示例 | `.claude/skills/orchestrator/atomic_skills_register.md` |
| settings.json slash commands | `.claude/settings.json` |
| CLAUDE.md 主 Skill 表 | 项目根目录 `CLAUDE.md` |

---

*文档版本：v2.2 | 配套文件：`.claude/tao-skill-design/`（韬定律 AI Agent 系统设计规范）*

## 版本历史

- **v2.2** (2026-06-09): 新增「⭐ 创建方式：优先使用 /skill-creator（官方工具）」章节，明确所有 Skill 创建必须使用 `/skill-creator`；更新步骤 3 为推荐官方工具+备用手动方式；更新 Checklist 增加步骤 0（/skill-creator）；更新 index.md 快速参考引导使用 /skill-creator。
- **v2.1** (2026-06-09): 新增「设计规范遵循声明」章节，明确所有主 Skill 必须遵循 `tao-theory-design.md` 的完整设计逻辑（K1-K4 / τ 量纲 / 三指标体系 / Rules 约束）；在第 4 节前增加规范来源说明；新增 FORBIDDEN 禁止规则；修复配套参考文件列表；更新参考文件索引。
- **v2.0** (2026-06-09): 全面重构，整合 τ 增强规范、K1-K4 设计、stack-enforce 规则、Co-Design 贡献度、Pattern 成熟度等级
- **v1.2** (2026-06-03): 初始版本