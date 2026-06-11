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

这是一个 **AI Agent Skills 编排系统**，基于华为韬定律（τ-Law），以 τ（时间常数）为核心性能指标，通过时间缩微而非堆模型参数来提升 Agent 综合表现。所有用户请求统一通过 `orchestrator-pro` 调度。

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

### 调度器（唯一入口）

**orchestrator-pro** 是所有任务的唯一入口，内部按复杂度自动分流：

```
用户输入 → 意图识别 + complexity 评分
    ├── complexity < 4  → orchestrator 轻量 9 步
    └── complexity ≥ 4 → orchestrator-pro τ 增强 9 步
```

τ 优化路径包含：Task Folding + Skill Stacking + Pattern Mining + 三指标报告。

### τ（时间常数）体系

```
τ = duration_ms × 0.5 + tokens × 0.001（驱动所有决策）

三档预算：simple=5000 / moderate=15000 / complex=50000
预警：80% 警告 / 95% 严重 / 100% 终止
```

四大韬定律技术：
- **K1 Task Folding**：τ 不足时自动折叠可合并的任务链路（节省约 30%）
- **K2 Skill Stacking**：通过 `task_skill.md` TSV 垂直互联，下游 skill 直读上游结果
- **K3 Co-Design**：Model × Rules × Skills 三层贡献度显式化
- **K4 Pattern Mining**：历史相似度 ≥ 0.6 复用子步骤，成熟模式 τ 折扣 70%

### 任务状态管理

所有任务状态写入 `.claude/skills/tasks/current/task_skill.md`（固定文件名），实时更新原子 skill 状态列和执行日记。任务完成后自动归档到 `.claude/skills/tasks/history/YYYY-MM/`。

---

## 关键文件位置

| 文件 | 作用 |
|------|------|
| `.claude/skills/orchestrator-pro/SKILL.md` | τ 增强调度器，完整 9 步流程 |
| `.claude/skills/orchestrator/skills_register.md` | 主 skill 注册表（意图匹配数据源） |
| `.claude/skills/tasks/current/task_skill.md` | 当前任务状态文件（执行中实时写入） |
| `.claude/skills/tasks/templates/task_skill_template.md` | 任务文件模板 |
| `.claude/rules/*.mdc` | τ 控制、任务折叠、技能栈叠、模式复用规则 |
| `settings.json` → `commands` | Slash commands（16 个入口） |
| `skill-design.md` | 完整设计思路文档 |

---

## 主 Skill 体系（17 个）

所有任务通过 `/orchestrator-pro`（唯一入口）自动调度，也可直接触发 slash command：

| Skill | 触发关键词 |
|-------|-----------|
| `/orchestrator-pro` | 唯一入口，complexity 分流自动执行 |
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

**新增主 skill**：创建目录 → 编写 SKILL.md → 注册到 `orchestrator/skills_register.md` → 添加到 `settings.json` commands。

---

## 语言规则

- 思考过程、回答内容、工具说明 → **必须中文**
- 文件内容、命令行输出、技术错误信息 → 保留原样
- 技术术语（Skill、τ、Task Folding 等）→ 保留英文

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