# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 项目概述

| | |
|---|---|
| 项目名称 | Claude Code Skills |
| 项目类型 | CLI Tool / AI Agent Skills |
| 技术栈 | Node.js / Claude API / Claude Code |
| 开发入口 | Claude Code CLI（`/help` 查看帮助）|

这是一个 **AI Agent Skills 编排系统**。当当前项目同时存在并启用 `orchestrator` 时，所有用户请求优先通过它调度；如果任一检查项不满足，不得假设 `orchestrator` 可用，也不得因本文件中的说明强制调用它。

---

## 常用命令

```bash
# Claude Code CLI
claude              # 启动 Claude Code
claude --help       # 查看帮助
claude /help        # 查看所有 Slash Commands

# Skill 管理
ls .claude/skills/  # 查看所有可用技能
cat .claude/skills/<name>/SKILL.md  # 查看特定 Skill 详情
```

---

## 核心架构

### 调度器（条件入口）

**orchestrator** 只有在以下条件同时满足时才是所有任务的统一入口：

- `.claude/skills/orchestrator/SKILL.md` 存在且可读取
- 注册表中存在启用的 `orchestrator` 条目
- `.claude/settings.json` 中存在 `orchestrator` command

满足条件时按复杂度选择执行策略；任一条件不满足时，不得强制调用不存在的 `orchestrator`，应按当前项目实际可用 Skill 执行。

```
用户输入 → 意图识别 + complexity 评分
    ├── complexity < 4  → 轻量执行策略
    └── complexity ≥ 4 → 完整执行策略
```

两种策略共享同一套意图识别、Skill 匹配、DAG 生成、执行控制、结果校验和任务归档流程。

### 任务状态管理

所有任务状态写入 `.claude/skills/tasks/current/task_skill.md`（固定文件名），实时更新原子 skill 状态列和执行日记。任务完成后自动归档到 `.claude/skills/tasks/history/YYYY-MM/`。

---

## 关键文件位置

| 文件 | 作用 |
|------|------|
| `.claude/skills/orchestrator/SKILL.md` | 统一任务编排器，完整任务流程 |
| `.claude/skills/orchestrator/skills_register.md` | 主 skill 注册表（意图匹配数据源） |
| `.claude/skills/tasks/current/task_skill.md` | 当前任务状态文件（执行中实时写入） |
| `.claude/skills/tasks/templates/task_skill_template.md` | 任务文件模板 |
| `.claude/rules/*.mdc` | 项目编码、语言和工作流规则 |
| `settings.json` → `commands` | Slash commands（以当前配置为准） |
| `skill-design.md` | 完整设计思路文档 |

---

## 主 Skill 体系

所有任务仅在 `orchestrator` 三项可用性检查通过时才通过 `/orchestrator` 统一调度；否则按当前项目实际可用 Skill 执行。也可直接触发已存在且已注册的 slash command：

| Skill | 触发关键词 |
|-------|-----------|
| `/orchestrator` | 统一任务编排入口，按复杂度选择执行策略 |
| `/code-generator` | 实现功能、生成代码、写函数 |
| `/code-optimizer` | 优化代码、重构、性能优化、冗余检测 |
| `/code-style-generator` | 检测代码规范、生成 CODE_STYLE |
| `/code-structure-analyzer` | 分析代码结构、流程图、关键节点、依赖关系 |
| `/personal-code-habits-generator` | 生成我的代码习惯、记录开发习惯 |
| `/bug-solver` | 解决 bug、修复错误、调试问题 |
| `/cheers` | 初始化项目、首次配置、项目引导 |
| `/scan-object-info` | 扫描项目、技术栈、分析项目结构 |
| `/requirement-generator` | 需求分析、需求标准化 |
| `/security-scanner` | 安全扫描、XSS、CSRF |
| `/test-generator` | 生成测试、单元/E2E |
| `/doc-generator` | API 文档、README |
| `/git-assistant` | commit、分支、冲突、stash |
| `/deploy-helper` | Docker、CI/CD、部署脚本 |
| `/skill-analyzer` | 解读 Skill、分析架构 |
| `/product-designer` | 设计产品模块、扩展需求、用户故事、功能规格 |
| `/project-cloud-map` | 生成项目云图、页面/入口关系、模块、数据流和交互分析 |
| `/project-planner` | 项目规划、迭代计划、每日工作、进度追踪、超期预警、多项目管理 |

**新增主 skill**：创建目录 → 编写 SKILL.md → 注册到 `orchestrator/skills_register.md` → 添加到 `settings.json` commands。

---

## 语言规则

- 思考过程、回答内容、工具说明 → **必须中文**
- 文件内容、命令行输出、技术错误信息 → 保留原样
- 技术术语（Skill、DAG、Task Archiver 等）→ 保留英文

---

## 编码规范要点

详见 `.claude/rules/coding-standards.mdc`，核心规则：

- 缩进 4 空格；单引号；无分号；行长度 ≤200；LF
- 组件 PascalCase；变量 camelCase；常量 UPPER_SNAKE_CASE
- async/await 必须 try-catch；定时器 onBeforeUnmount 清理
- Vue 组件样式必须 `scoped`；Less 嵌套 ≤3 层
- 导入顺序：Vue 核心 → 第三方 → 本地组件 → API → 工具 → 配置

---

## 严格禁止事项

| 禁止 | 正确做法 |
|------|---------|
| `var` 声明 | `const` / `let` |
| 裸 `await` 无错误处理 | 必须 `try-catch` 包裹 |
| 无 `scoped` 的 Vue 组件样式 | 组件样式必须 `scoped` |
| 超过 3 层的 Less 嵌套 | 重构选择器 |
| 硬编码 API URL / token | 使用环境变量 |
| 定时器不清理 | `onBeforeUnmount` 中清理 |
| 字符串拼接路径 | 使用 `@/` 路径别名 |