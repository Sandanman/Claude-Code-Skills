# Claude Code Skills

面向 Claude Code 的 AI Agent Skill 编排系统。所有用户请求统一进入 `orchestrator`，由它完成意图识别、Skill 匹配、任务规划、执行控制、结果校验和归档。

## 项目简介

系统以主 Skill 和原子 Skill 为执行单元，使用统一任务流程组织单步任务和多 Skill 协作任务。任务规划阶段生成 DAG，按依赖关系执行，可并行的节点并行处理；执行结果写入当前任务文件的共享上下文，供后续节点读取。

核心能力包括：

- 统一入口：所有请求由 `orchestrator` 调度
- Skill 匹配：依据意图、关键词和注册表选择合适的主 Skill
- DAG 规划：表达 Skill 依赖、执行顺序和并行关系
- 共享上下文：通过 `task_skill.md` 传递中间结果和任务状态
- 断点恢复：从当前任务文件中的未完成节点继续执行
- 结果校验：校验原子 Skill 完成标准和整体任务目标
- 缺失处理：发现能力缺失时记录并进行安全的替代路径处理
- 自动归档：完成任务后按月归档，并更新任务索引

## 项目结构

```text
Claude-Code-Skills/
├── CLAUDE.md
├── README.md
├── VERSION.md
└── .claude/
    ├── settings.json
    ├── settings.local.json
    ├── rules/
    ├── skills/
    │   ├── orchestrator/
    │   ├── tasks/
    │   └── <other-skills>/
    └── history/
```

### 关键目录

| 路径 | 作用 |
|------|------|
| `.claude/skills/orchestrator/` | 唯一任务编排入口及注册信息 |
| `.claude/skills/tasks/current/task_skill.md` | 当前任务状态、执行日记和共享上下文 |
| `.claude/skills/tasks/history/YYYY-MM/` | 已完成任务的月度归档 |
| `.claude/rules/` | 项目通用行为和编码规则 |
| `.claude/settings.json` | Slash commands 配置 |

## 主 Skill

主 Skill 由 `orchestrator/skills_register.md` 注册。当前系统包含代码生成、代码优化、Bug 修复、项目扫描、需求生成、安全扫描、测试生成、文档生成、Git 操作、部署辅助、产品设计、项目云图和项目规划等能力。

主 Skill 内部可按领域组织原子 Skill。原子 Skill 应保持单一职责，并声明输入、输出、依赖关系和完成标准。

## 统一执行流程

```text
用户请求
    ↓
意图识别与复杂度评估
    ↓
匹配主 Skill
    ↓
生成任务 DAG
    ↓
初始化 tasks/current/task_skill.md
    ↓
按依赖层执行 Skill，并更新状态和共享上下文
    ↓
结果校验
    ↓
输出执行摘要和业务结果
    ↓
归档任务并更新索引
```

复杂任务可以组合多个主 Skill；无依赖的节点允许并行执行，有依赖的节点按 DAG 顺序执行。任务状态、执行日记和中间结果统一写入当前任务文件，任务完成后归档到历史目录。

## 快速开始

系统通过 Claude Code CLI 使用：

```bash
claude
claude --help
```

用户可以直接描述需求，也可以使用已注册的 Slash command，例如 `/orchestrator`、`/code-generator`、`/bug-solver` 或 `/project-planner`。

## 扩展新的主 Skill

1. 在 `.claude/skills/` 下创建使用 `kebab-case` 命名的目录
2. 编写 `SKILL.md`，明确职责、输入、输出、依赖和完成标准
3. 如有需要，在目录内增加原子 Skill
4. 在 `.claude/skills/orchestrator/skills_register.md` 注册主 Skill
5. 在 `.claude/settings.json` 添加 Slash command（如需直接调用）
6. 使用统一任务流程验证状态更新、共享上下文、结果校验和归档

## 目录命名约定

| 类型 | 格式 | 示例 |
|------|------|------|
| 主 Skill 目录 | `kebab-case` | `code-generator` |
| 原子 Skill 目录 | `kebab-case` | `code-validation` |
| 当前任务文件 | 固定文件名 | `task_skill.md` |
| 历史归档目录 | `YYYY-MM/` | `2026-10/` |

## 相关文档

- [Orchestrator SKILL.md](.claude/skills/orchestrator/SKILL.md)
- [Orchestrator README.md](.claude/skills/orchestrator/README.md)
- [Skill 注册表](.claude/skills/orchestrator/skills_register.md)
- [版本管理记录](VERSION.md)

**当前架构**：`orchestrator` 统一调度、DAG 组织执行、共享上下文传递结果、校验后归档任务。
