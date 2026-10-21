---
name: skill-creator-orchestrator
description: 当用户要求新增 Skill、创建技能、定制已有 Skill、扩展 Skill 功能、修改 SKILL.md、调整 Skill 触发条件或完善 Skill 注册配置时使用。依据项目 orchestrator 规则完成需求分析、现状检查、Skill 创建或更新、注册同步、结构校验和结果输出；即使用户未明确提及 SKILL.md，只要目标是改变 Claude Code Skills 能力，也应优先使用本 Skill。
impl_status: action_based
---

# Skill Creator Orchestrator

## 1. 核心定位

`skill-creator-orchestrator` 专门负责在当前项目中新增 Skill，或对已有 Skill 进行定制、功能扩展和触发规则调整。它不是普通的代码生成器，而是将用户目标转换为符合项目约定的 Skill 目录、`SKILL.md`、注册信息和 slash command 配置，并在写入后完成一致性校验。

遵循以下原则：

- 先读取现有规则和目标 Skill，再决定创建或更新方案，避免覆盖用户已有内容。
- 保留已有 Skill 的目录名和 frontmatter `name`，更新已有 Skill 时不擅自改名。
- 新增主 Skill 必须同步更新 `.claude/skills/orchestrator/skills_register.md`、`.claude/skills/orchestrator/atomic_skills_register.md`（若新增原子 Skill）和 `.claude/settings.json` 的 `commands`。
- 只有用户明确要求或项目现有结构需要时才创建辅助资源；不为假设场景增加无用文件。
- 不执行 git commit，不覆盖无关的未提交修改；写入前检查工作区状态，发现目标文件存在用户修改时先说明并请求确认。
- 所有说明、报告和新增文档使用中文，技术标识符、路径、命令和配置键保持原样。

## 2. 触发分类

从用户请求中识别以下动作：

| action | 典型表达 | 主要结果 |
| --- | --- | --- |
| `create` | 新增 Skill、创建一个技能、增加能力 | 创建新 Skill 目录和 `SKILL.md`，同步注册 |
| `update` | 修改 Skill、定制、扩展功能、调整流程 | 读取并保留原 Skill，按要求增量修改并同步注册 |
| `register-only` | 把某个 Skill 注册进去、添加 slash command | 仅补齐缺失注册项并校验目标路径 |
| `analyze-first` | 先评估如何设计、暂不修改 | 输出方案和待确认项，不写入代码 |

如果用户同时提出多个动作，按 `analyze → create/update → register → validate` 顺序执行。若需求会改变主 Skill 的职责边界，先展示影响范围和候选方案，等待用户确认后再写入。

## 3. 必须读取的项目上下文

执行前读取并以当前内容为准：

1. `CLAUDE.md` 和适用的 `.claude/rules/*.mdc`。
2. `.claude/skills/orchestrator/SKILL.md`。
3. `.claude/skills/orchestrator/skills_register.md`。
4. `.claude/skills/orchestrator/atomic_skills_register.md`。
5. `.claude/settings.json`。
6. 目标 Skill 的 `SKILL.md`、同目录辅助资源和相关历史文档（更新场景）。
7. `.claude/skills/tasks/templates/task_skill_template.md`，确认任务状态字段和完成标准格式。

读取后记录：目标是否存在、当前 `name`、`description`、版本信息、是否已注册、是否已有 slash command、依赖和需要同步的文件。

## 4. 需求分析与设计

将用户请求整理为结构化意图：

```yaml
domain: skill-management
action: create | update | register-only | analyze-first
target: skill-name 或待命名 Skill
constraints: 用户指定的功能、输出、兼容性和范围
keywords: 触发词与同义表达
success_criteria: 可验证的完成标准
complexity_assessment: 步骤数、文件数、依赖和分支
confidence: 0-1
```

设计时明确：

- Skill 的唯一职责、触发边界和不适用场景。
- 输入、执行步骤、依赖关系、输出契约和完成标准。
- 是否需要原子 Skill；仅在流程具有稳定、可复用且需要独立状态的步骤时拆分。
- 是否需要 `references/`、`scripts/` 或 `assets/`；渐进式披露优先，避免把无关内容塞入 `SKILL.md`。
- 主 Skill 注册表中的 `desc`、`core_ability`、`match_keywords` 与实际行为一致。

信息不足时只询问影响文件结构、行为边界或验收标准的关键问题，不对用户未确认的业务规则臆测。简单且边界清晰的需求可直接执行，并在结果中列出采用的默认值。

## 5. 创建流程

### 5.1 新增 Skill

1. 确认目录名符合 kebab-case，且不存在同名目录。
2. 创建 `.claude/skills/<skill-name>/SKILL.md`，包含 YAML frontmatter：`name`、`description`，必要时包含 `compatibility` 和 `impl_status`。
3. 编写简洁但可执行的正文，至少包含：核心定位、触发分类、执行流程、输入输出、完成标准、校验和错误处理。
4. 如需原子 Skill，在 `atomic-skills/<atomic-name>/SKILL.md` 创建详情，并同步原子注册表；没有必要时不要拆分。
5. 将主 Skill 添加到 `skills_register.md` 的主技能索引，并更新统计数字、版本或最后更新时间（沿用文件现有格式）。
6. 将 slash command 添加到 `.claude/settings.json` 的 `commands`，`name` 使用目录名，`description` 与 frontmatter 保持一致但可适当精简。

### 5.2 更新已有 Skill

1. 先读取目标 Skill 的完整内容和关联资源，识别现有行为与用户要求的差异。
2. 保留目录名、frontmatter `name` 和仍然有效的功能；只修改用户要求或为一致性所必需的内容。
3. 更新 `description` 时同时检查触发边界，避免与其他 Skill 关键词冲突。
4. 若增加/删除原子 Skill、依赖或输出路径，同步更新 `atomic_skills_register.md`、相关注册信息和正文引用。
5. 若 Skill 的主职责或命令描述变化，同步更新 `skills_register.md` 和 `.claude/settings.json`。
6. 不删除用户已有辅助资源，除非用户明确要求删除；发现过时内容时先在结果中说明。

## 6. 编排与任务状态

当变更涉及 3 个或以上文件，或包含原子 Skill 依赖时，按 orchestrator 统一流程处理：

1. 生成或更新 `.claude/skills/tasks/current/task_skill.md`，填写任务 ID、用户意图、主 Skill、子任务、依赖和完成标准。
2. 依赖检查：目标目录、注册表、settings 配置和辅助资源路径必须存在或明确为待创建；禁止循环依赖。
3. 可并行执行读取和静态检查；写入注册表前完成目标内容设计。
4. 每个步骤完成后更新任务状态、执行日志和共享上下文。
5. 任务完成后按项目约定归档；如果当前环境不应自动归档，至少说明任务文件状态和归档待办。

简单单文件更新可采用轻量路径，但仍必须完成 frontmatter 和结构校验。

## 7. 输出契约

完成后用中文输出简洁摘要，至少包含：

- `action`、目标 Skill、任务 ID（如创建了任务文件）。
- 新增或修改的文件路径。
- 注册状态：`skills_register.md`、`atomic_skills_register.md`、`.claude/settings.json`。
- 核心功能和触发关键词摘要。
- 校验结果、未解决项和需要用户确认的后续动作。

若为 `analyze-first`，只输出方案、文件影响范围、依赖关系和待确认问题，不得声称已完成写入。

## 8. 完成后校验

逐项检查并记录通过/失败：

- `SKILL.md` 存在、可读取，frontmatter 的 `name` 与目录名一致。
- `description` 明确说明功能和触发场景，没有与现有 Skill 明显冲突的误导描述。
- 正文包含可执行流程、输入输出和完成标准，且引用的路径真实存在或明确标注待创建。
- 主 Skill 已注册，`path` 指向实际 `SKILL.md`，`status` 正确。
- 若新增原子 Skill，原子详情和 `atomic_skills_register.md` 一致；若未新增，不凭空添加注册项。
- `.claude/settings.json` 中 slash command 不重复，名称、描述和目标 Skill 一致。
- YAML/JSON/Markdown 结构可解析，文件末尾有换行，无无关变更。
- 变更未写入 token、密钥或硬编码外部敏感信息。
- 若存在任务文件，所有子任务状态、完成标准、最终结果和归档信息完整。

任一关键校验失败时，状态只能为 `failed` 或 `partial`，必须输出具体原因和下一步，不得报告完成。

## 9. 版本与维护

更新已有 Skill 时，在正文版本历史中记录本次变更的日期和原因；新增 Skill 可从 `v1.0` 开始。日期使用执行时的实际日期，不得伪造未来时间。不要为了形式更新与本次变更无关的版本号或历史记录。
