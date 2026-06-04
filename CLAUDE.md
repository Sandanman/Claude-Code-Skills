# Claude Code Skills 项目配置

> 本文件为项目上下文和快速参考手册。详细编码规范见 `.claude/rules/`，详细 Skill 文档见 `.claude/skills/*/SKILL.md`。

---

## 项目概述

| | |
|---|---|
| 项目名称 | Claude Code Skills |
| 项目类型 | CLI Tool / AI Agent Skills |
| 技术栈 | Node.js / Claude API / Claude Code |
| 开发入口 | Claude Code CLI（`/help` 查看帮助）|

本项目是一套 Claude Code 的 Skill 系统，通过 Orchestrator（智能调度总控）驱动多个主 Skill 协同工作，覆盖代码生成、优化、测试、部署等全流程。

---

## 项目结构

```
.claude/
├── rules/                   # 行为规则（alwaysApply: true）
│   ├── coding-standards.mdc  # 编码规范
│   ├── language-chinese.mdc  # 语言规则（全程中文）
│   ├── pattern-mining.mdc    # 模式挖掘
│   ├── skill-stacking.mdc    # 技能叠加
│   ├── task-folding.mdc     # 任务折叠
│   └── tau-control.mdc      # τ 控制流
├── skills/                  # 技能系统
│   ├── orchestrator-pro/    # 智能调度总控（唯一入口）
│   ├── code-generator/      # 代码生成（v1.3 τ 增强版）
│   ├── code-optimizer/      # 代码优化（v2.0 τ 增强版，整合性能优化）
│   ├── code-style-generator/     # 代码风格探测
│   ├── bug-solver/          # Bug 修复（v1.3 τ 增强版）
│   ├── requirement-generator/    # 需求文档
│   ├── scan-object-info/    # 技术栈扫描
│   ├── security-scanner/    # 安全扫描
│   ├── test-generator/      # 测试用例
│   ├── doc-generator/       # 文档生成
│   ├── git-assistant/       # Git 辅助（整合 git-helper）
│   └── deploy-helper/       # 部署辅助
├── settings.json            # Claude Code 主配置（13 个 slash commands）
└── settings.local.json      # 本地配置（不提交版本控制）

根目录/
├── CLAUDE.md                # 项目上下文配置（本文件）
├── README.md                # 项目说明
└── .gitignore
```

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

## 技能系统（Skills）

所有任务统一通过 `orchestrator-pro`（τ 增强版）调度入口。

| Skill | 说明 |
|-------|------|
| `orchestrator-pro` | 智能调度总控，唯一入口 |
| `code-generator` | 代码生成（v1.3 τ 增强版）|
| `bug-solver` | 系统化 Bug 修复（v1.3 τ 增强版）|
| `code-optimizer` | 代码优化（v2.0 τ 增强版，整合性能优化+冗余检测）|
| `requirement-generator` | 需求文档生成 |
| `scan-object-info` | 前端项目扫描 |
| `security-scanner` | 安全扫描 |
| `test-generator` | 测试用例生成 |
| `doc-generator` | 文档生成 |
| `git-assistant` | Git 智能操作 |
| `deploy-helper` | 部署辅助 |

### Slash Commands

| 命令 | Skill | 说明 |
|------|-------|------|
| `/orchestrator-pro` | orchestrator-pro | 智能调度总控（τ 增强版）|
| `/code-generator` | code-generator | 代码生成 |
| `/bug-solver` | bug-solver | Bug 修复（7 步流程）|
| `/code-optimizer` | code-optimizer | 代码优化（v2.0 τ 增强版，整合冗余检测）|
| `/code-style-generator` | code-style-generator | 代码风格探测 |
| `/requirement-generator` | requirement-generator | 需求标准化 |
| `/scan-object-info` | scan-object-info | 技术栈扫描 |
| `/security-scanner` | security-scanner | 安全扫描 |
| `/test-generator` | test-generator | 测试用例生成 |
| `/doc-generator` | doc-generator | 文档生成 |
| `/git-assistant` | git-assistant | Git 智能操作 |
| `/deploy-helper` | deploy-helper | Docker / CI/CD |

---

## 编码规范（详细版见 `.claude/rules/coding-standards.mdc`）

| 类别 | 核心要求 |
|------|---------|
| 格式化 | 4 空格缩进 / 无分号 / 单引号 / 行长度 ≤200 / LF |
| 命名 | PascalCase 组件 / camelCase 变量 / UPPER_SNAKE_CASE 常量 |
| 组件结构 | Vue 13 步顺序；React Hooks 顺序 |
| async/await | 必须 try-catch；禁止裸 await |
| 错误处理 | console.error + 用户提示；定时器 onBeforeUnmount 清理 |
| 样式 | scoped；Less 嵌套 ≤3 层；BEM 命名 |
| 导入顺序 | Vue核心 → 第三方 → 本地组件 → API → 工具 → 配置 |
| 硬编码 | 禁止硬编码 API URL / token / 密钥，使用环境变量 |

### 语言规则（详细版见 `.claude/rules/language-chinese.mdc`）

- 思考过程、回答内容、工具说明 → 必须中文
- 文件内容、命令行输出、技术错误信息 → 保留原样
- 技术术语 → 保留英文，首次出现括号标注中文

---

## 开发工作流

### 新功能开发

1. **理解需求** — 确认功能目标和验收标准
2. **设计** — 复杂功能先设计技术方案
3. **实现** — 遵守编码规范
4. **自测** — 运行相关验证
5. **提交** — 提交信息 10 字以内，抽象概括

### Bug 修复流程

1. **复现** — 读代码理解问题
2. **定位** — 找到根本原因
3. **修复** — 应用修复
4. **验证** — 确认修复有效
5. **提交** — 提交信息 10 字以内

---

## 严格禁止事项

| 禁止项 | 正确做法 |
|--------|---------|
| `var` 声明变量 | `const` / `let` |
| 裸 `await` 无错误处理 | 必须 `try-catch` 包裹 |
| 无 `scoped` 的组件样式 | 组件样式必须 `scoped` |
| 超过 3 层的 Less 嵌套 | 重构选择器，减少嵌套 |
| 硬编码 API URL / token | 使用环境变量 |
| 定时器不清理 | 在 `onBeforeUnmount` 中清理 |
| 字符串拼接路径 | 使用 `@/` 路径别名 |

---

## 获取帮助

- Claude Code 帮助：`/help`
- 项目规范：`.claude/rules/*.mdc`
- Skill 详情：`.claude/skills/<name>/SKILL.md`