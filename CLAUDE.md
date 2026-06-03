# Claude Code Skills 项目配置

> 本文件为项目上下文和快速参考手册。详细编码规范见 `.claude/rules/coding-standards.mdc`，语言规则见 `.claude/rules/language-chinese.mdc`。

---

## PROJECT_INFO

| 项目名称 | Claude Code Skills |
|---------|---------------------|
| 项目类型 | CLI Tool / AI Agent Skills |
| 技术栈 | Node.js / Claude API / Claude Code |
| 开发入口 | Claude Code CLI（`/help` 查看帮助）|

---

## 项目概述

本项目是一套 Claude Code 的 Skill 系统，通过 Orchestrator（智能调度总控）驱动多个主 Skill 协同工作，覆盖代码生成、优化、测试、部署等全流程。

---

## 项目结构

```
.claude/
├── rules/                          # 行为规则（alwaysApply: true）
│   ├── coding-standards.mdc        # 编码规范
│   ├── language-chinese.mdc        # 语言规则
│   ├── pattern-mining.mdc         # 模式挖掘
│   ├── skill-stacking.mdc         # 技能叠加
│   ├── task-folding.mdc           # 任务折叠
│   └── tau-control.mdc            # τ 控制流
├── project_context.json          # 项目上下文模板（框架/UI库/代码风格等，供 orchestrator 读取）
├── settings.json                  # Claude Code 主配置（钩子、权限、规则加载、14个 slash commands）
├── settings.local.json            # 本地配置（不提交到版本控制）
├── history/                       # 历史归档
│   ├── skills_v.1.0.zip
│   └── v.1.2.2.zip
└── skills/                        # 技能系统
    ├── orchestrator/              # 智能调度总控（已废弃，降级为轻量 fallback，由 orchestrator-pro 接管）
    │   ├── skills_register.md      # 主技能索引（供 Reasoner 读取）
    │   └── atomic_skills_register.md  # 原子技能详情（按主技能分组）
    ├── orchestrator-pro/          # 智能调度总控（τ 增强版，唯一入口）
    ├── code-generator/            # 代码生成
    ├── code-optimizer/           # 代码优化
    ├── code-redundancy-checker/   # 冗余代码检测
    ├── code-style-generator/      # 代码风格生成
    ├── bug-solver/               # Bug 修复
    ├── requirement-generator/    # 需求文档生成
    ├── scan-object-info/         # 前端项目扫描
    ├── performance-optimizer/     # 性能优化
    ├── security-scanner/         # 安全扫描
    ├── test-generator/           # 测试用例生成
    ├── doc-generator/           # 文档生成
    ├── git-assistant/           # Git 辅助
    ├── deploy-helper/           # 部署辅助
    └── tao-theory-design.md     # τ 理论设计文档
    └── tasks/                   # 任务历史记录
        ├── current/             # 当前进行中的任务
        ├── history/             # 历史任务归档
        └── templates/           # 任务模板

根目录/
├── CLAUDE.md                      # 项目上下文配置（本文件）
├── README.md                      # 项目说明
├── .git/                          # Git 仓库
└── .gitignore
```

---

## 技能系统（Skills）

### 总控调度（Orchestrator）

`orchestrator` 是所有任务的唯一入口 Reasoner，执行 9 步流程：意图识别 → 历史检索 → Skill 匹配 → 任务生成 → 执行控制 → 任务恢复 → 结果校验 → 结果输出 → 任务归档。

### 可用 Skill（详细说明见各 Skill 目录下的 SKILL.md）

所有任务统一通过 `orchestrator` 调度入口，详情见 `.claude/skills/orchestrator/SKILL.md`。

| Skill | 说明 | 触发方式 |
|-------|------|---------|
| `orchestrator` / `orchestrator-pro` | 智能调度总控（τ 增强版）| 默认自动触发 |
| `code-generator` | 代码生成 | 用户请求时触发 |
| `bug-solver` | 系统化 Bug 修复 | 用户报告 Bug 时触发 |
| `code-optimizer` | 代码优化 | 用户请求时触发 |
| `code-redundancy-checker` | 冗余代码检测 | 用户请求时触发 |
| `requirement-generator` | 需求文档生成 | 用户请求时触发 |
| `scan-object-info` | 前端项目扫描 | 用户请求时触发 |
| `performance-optimizer` | 性能优化 | 用户请求时触发 |
| `security-scanner` | 安全扫描 | 用户请求时触发 |
| `test-generator` | 测试用例生成 | 用户请求时触发 |
| `doc-generator` | 文档生成 | 用户请求时触发 |
| `git-helper` / `git-assistant` | Git 辅助操作 | 用户请求时触发 |
| `deploy-helper` | 部署辅助 | 用户请求时触发 |

查看完整 Skill：`ls .claude/skills/`

### Slash Commands（已注册在 `settings.json` 的 `commands` 配置中）

| 命令 | 触发 Skill | 说明 |
|------|-----------|------|
| `/bug-solver` | bug-solver | 系统化 Bug 修复（7 步流程）|
| `/code-generator` | code-generator | 代码生成（多场景适配）|
| `/code-optimizer` | code-optimizer | 代码质量优化（重构 + 验证）|
| `/code-redundancy-checker` | code-redundancy-checker | 代码冗余检测（重复/死代码）|
| `/code-style-generator` | code-style-generator | 代码风格探测，生成 CODE_STYLE.md |
| `/scan-object-info` | scan-object-info | 前端项目技术栈扫描（韬定律优化版）|
| `/requirement-generator` | requirement-generator | 需求标准化，生成 requirements.json |
| `/performance-optimizer` | performance-optimizer | 性能优化与基准测试 |
| `/security-scanner` | security-scanner | 安全漏洞扫描（XSS/CSRF/依赖安全）|
| `/test-generator` | test-generator | 测试用例自动生成 |
| `/doc-generator` | doc-generator | API/组件文档自动生成 |
| `/git-assistant` | git-assistant | Git 智能操作（τ 优化版）|
| `/deploy-helper` | deploy-helper | Docker / CI/CD / 部署配置 |
| `/orchestrator-pro` | orchestrator-pro | 智能调度总控（τ 增强版）|

---

## 规则体系

> 详细规范在 `.claude/rules/` 目录中。以下为快速索引。

| 规则文件 | 说明 | 生效范围 |
|----------|------|---------|
| `coding-standards.mdc` | 编码规范（格式化、命名、组件结构、async/await、样式等） | 全局，alwaysApply |
| `language-chinese.mdc` | 全程使用中文，技术术语保留英文原文 | 全局，alwaysApply |

### 编码规范快速索引

> 完整规范见 `.claude/rules/coding-standards.mdc`（alwaysApply）

| 类别 | 核心要求 |
|------|---------|
| 格式化 | 4 空格缩进 / 无分号 / 单引号 / 行长度 ≤200 / LF 换行 |
| 命名 | PascalCase 组件 / camelCase 变量 / UPPER_SNAKE_CASE 常量 / kebab-case 类名 |
| 组件结构 | Vue 13 步顺序；React Hooks 顺序（useState → useNavigate → useMemo → useEffect → useCallback）|
| async/await | 必须 try-catch；禁止裸 await |
| 错误处理 | console.error + 用户提示；定时器在 onBeforeUnmount 中清理 |
| 样式 | scoped；Less 嵌套 ≤3 层；BEM 命名 |
| 变量声明 | const 优先 / 禁止 var / 显式类型标注 |
| 导入顺序 | Vue核心 → 第三方 → 本地组件 → API → 工具 → 配置（组间空一行）|
| Git 提交 | 10 字以内，抽象语义，禁止技术细节 |
| 硬编码 | 禁止硬编码 API URL / token / 密钥，必须用环境变量 |
| 严格禁止项 | var / 裸 await / 无 scoped / 超过 3 层嵌套 / 定时器不清理 |

### 语言规则快速索引

- 思考过程、回答内容、工具说明 → 必须中文
- 文件内容、命令行输出、技术错误信息 → 保留原样
- 技术术语 → 保留英文，首次出现括号标注中文（如 WebSocket）
- 本规则优先级 **低于** 项目规范

---

## 常用命令

```bash
# Claude Code CLI
claude              # 启动 Claude Code
claude --help       # 查看帮助
claude /help        # 查看 Slash Commands

# Skill 管理
ls .claude/skills/  # 查看所有可用技能
cat .claude/skills/<name>/SKILL.md  # 查看特定 Skill 详情
```

---

## 开发工作流

### 新功能开发

1. **理解需求** — 确认功能目标和验收标准
2. **设计** — 复杂功能先设计技术方案
3. **实现** — 遵守编码规范，参考 `.claude/rules/coding-standards.mdc`
4. **自测** — 运行相关验证
5. **提交** — 提交信息 10 字以内，抽象概括核心变更

### Bug 修复流程

1. **复现** — 读代码理解问题，确认 bug
2. **定位** — 找到根本原因
3. **修复** — 应用修复
4. **验证** — 确认修复有效
5. **提交** — 提交信息 10 字内

---

## 禁止事项

| 禁止项 | 正确做法 |
|--------|---------|
| `var` 声明变量 | `const` / `let` |
| 裸 `await` 无错误处理 | 必须 `try-catch` 包裹 |
| 无 `scoped` 的组件样式 | 组件样式必须添加 `scoped` |
| 超过 3 层的 Less 嵌套 | 重构选择器，减少嵌套 |
| 硬编码 API URL | 使用环境变量或配置中心 URL |
| 硬编码 token / 密钥 | 使用环境变量 |
| 定时器不清理 | 在 `onBeforeUnmount` 中清理 |
| 字符串拼接路径 | 使用 `@/` 路径别名 |

---

## Claude Code 配置

| 文件 | 作用 |
|------|------|
| `.claude/settings.json` | Claude Code 主配置（权限、钩子、规则加载、诊断等）|
| `.claude/rules/*.mdc` | 行为规则文件 |
| `.claude/skills/` | 技能系统目录 |

---

## 获取帮助

- Claude Code 帮助：`/help`
- 项目规范：参见 `.claude/rules/` 目录
- Skill 使用：各 Skill 目录下的 `SKILL.md` 和 `README.md`