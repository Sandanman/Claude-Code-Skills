# Claude Code Skills — 项目技能指南

## 当前版本

- **版本**：v.1.4.1
- **最后更新时间**：2026-10-22
- **变更**：重构 orchestrator 编排流程并新增版本管理能力

## 版本信息

- **版本格式**：`v.大版本号.小版本.小修改`
- **版本基线**：以根目录 `VERSION.md` 的最新记录为准
- **统一入口**：`orchestrator`
- **版本管理 Skill**：`claude-code-skills-release-manager`

---

## 目录结构概览

```text
.claude/
├── rules/                                  # 项目规则
├── project_context.json                    # 项目上下文
├── settings.json                           # Claude Code 配置
├── settings.local.json                     # 本地配置
└── skills/
    ├── orchestrator/                       # 统一任务编排器
    │   ├── SKILL.md                        # 核心入口与统一执行流程
    │   ├── README.md                       # 使用指南
    │   ├── algorithms.md                   # 调度算法
    │   ├── config.md                       # 编排配置
    │   ├── technical_implementation.md     # 技术实现
    │   ├── user_interaction.md             # 用户交互模板
    │   ├── skills_register.md               # 主 Skill 注册表
    │   ├── atomic_skills_register.md        # 原子 Skill 注册表
    │   ├── missing_skills.md                # 缺失 Skill 记录
    │   └── atomic-skills/                   # 通用原子 Skill
    ├── claude-code-skills-release-manager/  # 当前项目版本与归档管理
    ├── tasks/                              # 任务状态与历史归档
    └── README.md                           # 本文件
```

---

## 主 Skill 完整列表

| # | 主 Skill | 原子数 | 职责 |
| --- | --- | --- | --- |
| 1 | code-generator | 9 | 根据需求生成可维护代码 |
| 2 | code-optimizer | 7 | 分析并优化代码质量与性能 |
| 3 | bug-solver | 7 | 分类、分析和修复 Bug |
| 4 | code-style-generator | 5 | 检测并生成代码规范 |
| 5 | requirement-generator | 10 | 将自然语言需求标准化 |
| 6 | scan-object-info | 9 | 扫描项目技术栈和结构 |
| 7 | security-scanner | 4 | 扫描项目安全风险 |
| 8 | test-generator | 4 | 生成单元、集成和 E2E 测试 |
| 9 | doc-generator | 4 | 生成和维护项目文档 |
| 10 | git-assistant | 8 | 辅助 Git 操作和历史分析 |
| 11 | deploy-helper | 4 | 生成部署和 CI/CD 产物 |
| 12 | skill-analyzer | - | 分析 Skill 功能与架构 |
| 13 | product-designer | - | 设计产品模块和功能规格 |
| 14 | project-cloud-map | - | 生成项目结构和数据流云图 |
| 15 | project-planner | - | 规划迭代和项目进度 |
| 16 | claude-code-skills-release-manager | 2 | 管理版本文档和项目归档 |

---

## Orchestrator 核心改进详解

### 1. 意图识别增强（步骤1）

- **上下文感知**：自动读取 `.claude/project_context.json` 作为背景
- **LLM驱动**：结构化意图JSON（intent_id, domain, action, target, keywords, constraints, success_criteria, complexity_assessment, confidence）
- **置信度分级**：<0.6 时提示用户确认
- **智能fallback**：LLM不可用时自动切换到规则算法

### 2. 技能匹配增强（步骤3）

- **动态权重**：关键词50% + 领域30% + 操作20%
- **多skill组合**：复杂度≥7自动识别
- **缺失记录**：未匹配skill自动写入 `missing_skills.md`

### 3. 任务生成增强（步骤4）

- **DAG构建**：检测循环依赖
- **Kahn拓扑排序**：生成执行顺序
- **并行层识别**：无依赖skill可并行执行（受文件锁限制，实际串行）

### 4. 执行控制增强（步骤5）

- **流式输出**：🚀⚡✅❌📋 实时显示
- **Token追踪**：80%预警、95%严重警告、100%终止
- **错误影响评估**：5维度评分（依赖3+核心2+数据2+恢复-1+用户2）
- **重试策略**：单个skill最多3次，3次反思后仍失败则放弃

### 5. 结果校验增强（步骤7）

- **双重校验**：原子skill标准 + 整体目标达成度
- **偏差量化**：<0.1优秀、0.1~0.2合格、≥0.2触发反思
- **反思日志**：最多300字，仅记录关键问题

### 6. 归档增强（步骤9）

- **自动归档**：所有原子skill执行完毕后自动归档
- **月度索引**：自动维护 `tasks/history/YYYY-MM/月度任务索引.md`
- **可固化检测**：识别可复用文档

---

## 新增主Skill详情

### claude-code-skills-release-manager（版本与归档）

**触发关键词**：Claude Code Skills版本、本项目版本、更新 VERSION.md、Claude Code Skills归档、本项目归档、生成 Skills ZIP、发布版本

**职责**：统一管理当前项目的版本文档和版本归档，协调 `version-management` 与 `archive-generation` 两个原子 Skill；所有文档写入、复制、压缩和移动操作必须在用户确认后执行。版本管理读取版本基线、默认递增小修改位、生成 30 字以内的修改描述，并在确认后同步 `.claude/skills/README.md` 与根目录 `VERSION.md`；Git commit、Tag、push 等操作由 `git-assistant` 负责。

---

### security-scanner（安全扫描）

**触发关键词**：安全扫描、安全漏洞、XSS、CSRF、依赖安全、敏感信息检测

**4个原子 skill**：vulnerability-scan → dependency-security-check → sensitive-info-detection → security-report

### test-generator（测试生成）

**触发关键词**：生成测试、测试用例、单元测试、集成测试、E2E 测试、测试覆盖

**4个原子 skill**：test-case-design → test-framework-detection → test-code-generation → test-verification

### doc-generator（文档生成）

**触发关键词**：生成文档、API 文档、README、组件文档、变更日志

**4个原子 skill**：api-doc-extraction → component-doc-generation → changelog-generation → doc-format-conversion

### git-assistant（Git 操作）

**触发关键词**：提交、commit、分支管理、冲突解决、stash、历史分析、版本 Tag、conventional commits

**8个原子 skill**：intent-router → commit-generation → branch-management → conflict-resolution → history-analysis → stash-management → version-management → cloud-map-sync（commit 执行前自动链式触发，非意图路由项，仅当 docs/project-cloud-map.md 存在时执行）

### deploy-helper（部署辅助）

**触发关键词**：部署、Docker、CI/CD、环境配置、部署脚本、Vercel、Netlify

**4个原子 skill**：dockerfile-generation → cicd-pipeline-generation → env-config-generation → deployment-verification

---

## 使用说明

1. 所有用户请求统一通过 `orchestrator` 识别意图并选择主 Skill。
2. `orchestrator` 根据任务风险、依赖和确认要求选择 `fast` 或 `durable` 执行路径。
3. 需要版本管理或项目归档时，使用 `claude-code-skills-release-manager`，其写入和归档操作必须经过用户确认。
4. Git commit、Tag、push、branch、stash 等操作由 `git-assistant` 负责。

---

**当前版本**：v.1.4.1
**最后更新时间**：2026-10-22
