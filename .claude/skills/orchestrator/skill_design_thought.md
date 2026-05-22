# 设计原则

只有一个Reasoner调度器：理解用户意图，去匹配自己的主skill，主skill读取Reasoner传入的意图匹配组合自己的原子skill和执行顺序，生成任务skill，任务skill中记录当前任务的信息，执行完毕后依据日期归档。并可以依据任务skill从中断的子任务继续执行。

---

# 文件系统设计

```
.skills/
├── orchestrator/
│   ├── SKILL.md
│   ├── README.md
│   ├── skills_register.md
│   ├── missing_skills.md
│   └── …
├── 主skill/
│   ├── SKILL.md
│   ├── README.md
│   └── atomic-skills/
│       ├── 原子skill1
│       ├── 原子skill2
│       └── …
└── tasks/
    ├── current/
    │   └── task_skill.md
    └── history/
        ├── 2026-04/
        │   ├── 月度任务索引.md
        │   ├── task_20260401_01_project_analyze.md
        │   ├── task_20260401_02_update_versions.md
        │   ├── task_20260402_01_get_ui.md
        │   └── …
        ├── 2026-03/
        │   └── …
        └── templates/
            ├── task_skill_template.md
            └── 月度任务索引模版.md
```

---

# 执行流程

## (1) 意图识别与目标推理

Reasoner调度器（.skills/orchestrator/SKILL.md）解析用户输入，明确最终目标，自主判断目标复杂度——简单目标（无需多原子技能、无需保存状态）直接自主输出结果【end】；复杂目标则压缩生成明确意图，自主判断需要多步执行，进入下一步。

## (2) 历史意图检索

### (2.1)

Reasoner调度器对明确意图做特征提取，检索历史任务索引（不遍历全量历史文件），召回Top3~5最相关历史任务，判断相似度是否≥阈值（如0.85）；

### (2.2)

有高度相似且已完成的历史记录，则检索.skills/tasks/history/下的对应任务，并输出结果/结论，当前任务结束。【end】

### (2.3)

没有高度相似历史记录，则判断在.skills/tasks/current下是否有与意图相关的未完成的任务？

#### (2.3.1)

有相关任务，提示给用户选择是继续执行第（6）步？还是开始新任务第（3）步？

#### (2.3.2)

没有相关任务，则进行第（3）步。

## (3) 主skill匹配

Reasoner调度器（.skills/orchestrator/SKILL.md）根据意图和目标，自主规划所需能力，读取.skills/orchestrator/skills_register.md下已注册的主skill，自主匹配所需主skill（支持单主skill或多主skill组合），判断匹配合理性：

### (3.1)

没有匹配的主skill或匹配不符合需求，记录到完善列表（.skills/orchestrator/missing_skills.md），并自主执行，最终自主输出结果。【end】

### (3.2)

有多个符合需求的主skill，由用户选择使用哪个，选择后，将意图和目标传入所选主skill，进行第（4）步。

### (3.3)

有唯一符合需求的主skill，将意图和目标传入该主skill，进行第（4）步。

## (4) 任务生成

主skill接收用户意图和目标，只读取.skills/orchestrator/skills_register.md下已注册的主skill所属的原子skill，Reasoner调度器同步参与原子skill的选择、逻辑和依赖关系分析，确定执行顺序（并行执行的原子skill需遵循状态同步规则，同一时间仅允许一个原子skill写入task_skill.md，避免读写冲突），主skill依据任务skill模版（.skills/tasks/templates/task_skill_template.md）生成任务skill（task_skill.md，固定名称）到.skills/tasks/current/下。task_skill.md包含任务的所有状态、执行日记、原子skill完成的标准、主skill完成的标准等信息，并最终将原子skill的执行结果进行汇总、输出。

## (5) 执行与错误处理

Reasoner调度器全程掌控执行流程，按照task_skill.md的顺序执行原子skill，实时更新task_skill.md下子任务的状态，并且后续当子任务状态变更时均需要更新，不符合完成的标准或出错的原子skill，可重试3次。原子skill出错是否影响后续执行？

### (5.1)

影响，暂停任务，将错误抛出给用户确认，根据用户确认信息继续操作第（6）步；Reasoner调度器同步分析错误原因（仅聚焦当前原子技能失败原因，不追溯无关步骤），准备后续重规划，且仅为后续反思提供依据，不额外占用执行资源。

### (5.2)

不影响，将错误信息记录到task_skill.md的该原子skill的执行日志中，供用户查看，Reasoner调度器继续推进后续执行。

## (6) 任务恢复

Reasoner调度器读取当前task_skill.md任务状态和历史上下文，从未完成的原子任务继续执行，执行过程中若发现原计划不合理（如原子skill匹配错误、顺序不当），自主调整执行计划（仅允许微调原子技能顺序、补充同类型原子技能，不允许替换主skill或新增未注册技能），直到所有原子任务均完成。

## (7) 结果校验

当所有原子skill执行完毕时，Reasoner调度器依据task_skill.md中的完成标准进行一一校验，同时自主评估结果是否符合最终目标（仅当结果与目标偏差≥0.2阈值时触发反思）。不符合标准的进行重试，最多进行3次；若重试后仍不达标，Reasoner调度器分析原因，尝试补充原子skill或调整执行顺序（不允许新增主skill），再次校验，反思重规划最多触发3次，若3次后仍不达标，不再继续反思，直接进入步骤（8）。

## (8) 结果输出

无论是否有重试，重试结果如何，均整合各原子skill的结果，输出到结果文档。如果有重试失败的信息，将失败信息记录到结果文档中；Reasoner调度器同步记录反思日志（仅记录关键问题、可落地优化方向，不记录冗余思考过程，控制日志体量）。

## (9) 任务归档

### (9.1)

将task_skill.md根据当前年月YYYY-MM移入到历史文件夹（tasks/history/[YYYY-MM]）下，如果没有当前月份的文件夹[YYYY-MM]则直接新建，有当前月份文件夹则直接移入。

### (9.2)

更新历史文件夹（tasks/history/[YYYY-MM]）下的月份索引文件，如果有则直接写入更新，如果没有则依据.skills/tasks/templates/月度任务索引模版.md模版新建当月任务索引后写入。

### (9.3)

特殊可固化的文档，提示用户可手动移至项目目录下。【end】

---

# 执行流程图

```mermaid
graph TD
    A[用户输入] --> B{意图识别}
    B -->|简单目标| C[直接输出结果] --> Z[结束]
    B -->|复杂目标| D[生成明确意图]
    D --> E{检索历史任务}
    E -->|有高度相似完成任务| F[输出历史结果] --> Z
    E -->|无高度相似任务| G{有未完成相关任务?}
    G -->|是| H[提示用户：继续或新建]
    G -->|否| I[匹配主skill]
    I -->|无匹配| J[记录missing_skills.md] --> Z
    I -->|多匹配| K[用户选择主skill]
    I -->|唯一匹配| K
    K --> L[生成任务skill.md]
    L --> M[执行原子skill序列]
    M --> N{原子skill执行成功?}
    N -->|是| O[更新任务状态]
    N -->|否(可重试)| P[重试最多3次]
    P --> Q{重试成功?}
    Q -->|是| O
    Q -->|否| R{影响后续执行?}
    R -->|是| S[暂停，用户确认] --> H
    R -->|否| T[记录错误，继续]
    O --> U{所有原子skill完成?}
    U -->|否| M
    U -->|是| V[校验完成标准]
    V --> W{符合目标?}
    W -->|是| X[输出结果]
    W -->|否(偏差≥0.2)| Y[反思重规划(最多3次)]
    Y --> Z
    X --> Z
    Z --> AA[归档任务]
    AA --> AB[更新月度索引]
    AB --> AC[结束]
    style A fill:#f9f,stroke:#333
    style Z fill:#9f9,stroke:#333
    style AA fill:#ff9,stroke:#333
```

---

# Skill 创建规范

## 强制要求

### 1. 必须依照 skill-creator 标准
创建任何新 skill 时，必须遵循 skill-creator 插件的设计原则和最佳实践：

- **意图捕获**：明确 skill 要解决什么问题、何时触发、期望输出
- **渐进式设计**：先设计主 skill，再拆分原子 skill
- **文档完整性**：每个 skill 必须包含完整的 SKILL.md 文档
- **用户访谈**：必要时询问用户需求，确保设计符合预期

### 2. 必须符合 Skill 格式规范

#### 主 Skill 文件结构
```
skill-name/
├── SKILL.md (必需)
│   ├── YAML frontmatter
│   │   ├── name (必需)
│   │   └── description (必需)
│   └── Markdown 正文
│       ├── 概述
│       ├── 核心能力
│       ├── 执行流程
│       ├── 原子skill依赖关系
│       ├── 完成标准
│       └── 使用示例
└── README.md (推荐)
    ├── 快速开始
    ├── 使用示例
    ├── 执行流程详解
    └── 常见问题
```

#### 原子 Skill 文件结构
```
atomic-skills/
└── skill-name/
    └── SKILL.md (必需)
        ├── 概述
        ├── 核心能力
        ├── 输入
        ├── 输出（包含示例）
        ├── 执行逻辑
        ├── 依赖关系
        ├── 完成标准
        └── 错误处理
```

#### SKILL.md 格式规范

**YAML Frontmatter 必需字段**：
```yaml
---
name: skill-name
description: 何时触发，该技能做什么。必须包含技能的功能描述和具体的触发场景。
---
```

**Markdown 正文结构**：
```markdown
# Skill Name

## 概述
[清晰描述skill的作用和目标]

## 核心能力
- 能力1
- 能力2
- 能力3

## 执行流程
1. 步骤1
2. 步骤2
3. 步骤3

## 完成标准
1. 标准1
2. 标准2
3. 标准3

## 使用示例
[具体的示例]
```

### 3. 必须注册到 skills_register.md

创建完成后，**必须**将主 skill 和所有原子 skill 注册到 `.claude/skills/orchestrator/skills_register.md`。

#### 主 Skill 注册格式
```markdown
- name: skill-name
  desc: [一句话描述skill的核心功能]
  path: ./.claude/skills/skill-name/SKILL.md
  core_ability: 能力1, 能力2, 能力3
  match_keywords: 关键词1, 关键词2, 关键词3
  status: 启用
```

#### 原子 Skill 注册格式
```markdown
## skill-name 的原子技能
atomic_skills:
  - name: atomic-skill-1
    core_ability: [核心能力描述]
    depend: [依赖的原子skill名称，无则填"无"]
    status: 启用
  - name: atomic-skill-2
    core_ability: [核心能力描述]
    depend: atomic-skill-1
    status: 启用
```

## 创建流程（必须遵循）

### 步骤1：需求确认
- 确认用户想要创建什么类型的 skill
- 明确 skill 的触发场景
- 明确 skill 的预期输出

### 步骤2：主 Skill 设计
- 设计主 skill 的核心能力
- 定义执行流程
- 定义完成标准
- 创建 SKILL.md 和 README.md

### 步骤3：原子 Skill 拆分
- 根据主 skill 的执行流程，拆分为多个原子 skill
- 每个原子 skill 必须职责单一
- 定义原子 skill 之间的依赖关系
- 为每个原子 skill 创建 SKILL.md

### 步骤4：注册到系统
- 将主 skill 注册到 skills_register.md 的【一】主技能列表
- 将所有原子 skill 注册到 skills_register.md 的【二】各主技能对应的原子技能

### 步骤5：验证
- 检查所有 SKILL.md 文件是否符合格式规范
- 检查 skills_register.md 是否完整注册
- 检查依赖关系是否正确
- 提供使用示例供用户测试

## 格式检查清单

创建 skill 时，必须检查以下项：

### 主 Skill 检查
- [ ] SKILL.md 文件存在
- [ ] YAML frontmatter 包含 name 和 description
- [ ] 包含概述、核心能力、执行流程、完成标准
- [ ] README.md 文件存在（推荐）
- [ ] 已注册到 skills_register.md 的主技能列表

### 原子 Skill 检查
- [ ] 每个原子 skill 都有独立的目录
- [ ] 每个原子 skill 都有 SKILL.md 文件
- [ ] 包含概述、核心能力、输入、输出、依赖关系、完成标准
- [ ] 已注册到 skills_register.md 的原子技能列表
- [ ] 依赖关系正确标注

### 内容质量检查
- [ ] description 足够详细，包含触发场景
- [ ] 完成标准明确可验证
- [ ] 提供具体的使用示例
- [ ] 输出格式有清晰的示例

## 错误处理

如果发现以下问题，必须修正：

1. **未注册到 skills_register.md**
   - 错误：创建的 skill 未注册
   - 修正：立即添加注册信息

2. **SKILL.md 缺少必需字段**
   - 错误：缺少 name 或 description
   - 修正：补充 YAML frontmatter

3. **原子 skill 依赖关系错误**
   - 错误：依赖的 skill 不存在或循环依赖
   - 修正：调整依赖关系

4. **description 不够详细**
   - 错误：description 过于简单，无法准确触发
   - 修正：补充触发场景和使用说明

## 示例：完整的 Skill 创建流程

### 用户需求
用户："我想创建一个代码优化 skill"

### 执行步骤

**步骤1：需求确认**
```
Q: 这个 skill 要解决什么问题？
A: 系统化地优化代码，提升性能和可维护性

Q: 什么时候触发？
A: 用户说"优化代码"、"重构"、"更好的实现方式"等

Q: 期望输出是什么？
A: 修改后的代码、优化报告
```

**步骤2：主 Skill 设计**
```markdown
创建 code-optimizer/SKILL.md：
- name: code-optimizer
- description: 系统化地优化代码...
- 核心能力：静态分析、模式识别、代码重构、效果验证
- 执行流程：分析 → 识别 → 建议 → 重构 → 验证 → 文档
```

**步骤3：原子 Skill 拆分**
```
创建 6 个原子 skill（这个6个是示例，按照实际需求拆分，实际可能更多）：
1. code-quality-analysis（无依赖）
2. pattern-recognition（依赖 code-quality-analysis）
3. improvement-suggestion（依赖 pattern-recognition）
4. code-refactoring（依赖 improvement-suggestion）
5. optimization-verification（依赖 code-refactoring）
6. documentation-update（依赖 optimization-verification）
```

**步骤4：注册到系统**
```markdown
更新 skills_register.md：
- 在【一】主技能列表中添加 code-optimizer
- 在【二】原子技能中添加 6 个原子 skill
```