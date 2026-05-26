# Orchestrator v1.2 Skills 完整指南

## 版本信息

- **版本**: 1.2
- **更新时间**: 2026-05-21
- **相对 v1.0 的主要改进**: 上下文感知、多skill组合、Token追踪增强、并行层识别、智能fallback

---

## 目录结构概览

```
.claude/skills/                          # v1.2 改进后的skill集合
├── orchestrator/                            # 唯一总控调度器（Reasoner）
│   ├── SKILL.md                             # 核心入口（9步执行流程）
│   ├── README.md                            # 使用指南
│   ├── algorithms.md                        # 10个核心算法（~600行伪代码）
│   ├── config.md                            # 16个配置块
│   ├── technical_implementation.md          # 11个技术实现模块
│   ├── user_interaction.md                  # 6个决策点交互模板
│   ├── skills_register.md                   # 技能注册表（13个主skill + 79个原子skill）
│   ├── missing_skills.md                    # 缺失技能记录
│   └── atomic-skills/                       # orchestrator的6个原子能力
│       ├── intent-recognition/              # LLM意图识别（含rule fallback）
│       ├── skill-matcher/                   # 主skill匹配（关键词+领域+操作）
│       ├── task-generator/                 # DAG构建+拓扑排序+并行层识别
│       ├── execution-controller/            # 流式执行+Token追踪+错误评估
│       ├── result-validator/               # 完成标准校验+反思重规划
│       └── task-archiver/                   # 归档+月度索引更新+可固化检测
│
├── [13个主Skill]                            # 主技能（协同执行）
│   ├── code-generator/         [9原子skill]  # 代码生成（+multi-scenario-adapter）
│   ├── code-optimizer/         [7原子skill]  # 代码优化（+performance-analysis）
│   ├── bug-solver/             [7原子skill]  # Bug修复（+bug-triage）
│   ├── code-redundancy-checker/[3原子skill]  # 冗余检测
│   ├── code-style-generator/   [5原子skill]  # 代码风格
│   ├── requirement-generator/  [10原子skill]# 需求标准化
│   ├── scan-object-info/      [9原子skill]  # 项目扫描
│   ├── performance-optimizer/  [6原子skill] # 性能优化 [新增]
│   ├── security-scanner/       [4原子skill]  # 安全扫描 [新增]
│   ├── test-generator/        [4原子skill]  # 测试生成 [新增]
│   ├── doc-generator/          [4原子skill]  # 文档生成 [新增]
│   ├── git-helper/             [4原子skill]  # Git操作 [新增]
│   └── deploy-helper/          [4原子skill]  # 部署辅助 [新增]
│
└── README.md                               # 本文件
```

---

## v1.2 技能统计

| 类别 | v1.0 数量 | v1.2 数量 | 新增/改进 |
|------|---------|---------|----------|
| 主skill | 7个 | **13个** | +6个新skill |
| 原子skill | ~49个 | **79个** | +30个原子能力 |
| 配置文件 | 5个 | **6个** | +missing_skills.md |
| 核心算法 | 8个 | **10个** | +并行层识别、反思重规划 |
| 配置项 | ~15块 | **16块** | +Token追踪配置 |
| 决策点 | 6个 | **6个** | 保持（优化模板） |

---

## 主Skill完整列表

| # | 主Skill | 原子数 | 改进 | v1.0原子数 |
|---|---------|--------|------|-----------|
| 1 | code-generator | 9 | +multi-scenario-adapter | 8 |
| 2 | code-optimizer | 7 | +performance-analysis | 6 |
| 3 | bug-solver | 7 | +bug-triage | 6 |
| 4 | code-redundancy-checker | 3 | 增强severity+fix-suggestion | 3 |
| 5 | code-style-generator | 5 | +TS/Vue3/React支持 | 5 |
| 6 | requirement-generator | 10 | 增强quality.score+flow类型 | 10 |
| 7 | scan-object-info | 9 | +置信度+并行执行 | 9 |
| 8 | performance-optimizer | 6 | **新增** | 0 |
| 9 | security-scanner | 4 | **新增** | 0 |
| 10 | test-generator | 4 | **新增** | 0 |
| 11 | doc-generator | 4 | **新增** | 0 |
| 12 | git-helper | 4 | **新增** | 0 |
| 13 | deploy-helper | 4 | **新增** | 0 |

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

### performance-optimizer（性能优化）
**触发关键词**：性能优化、首屏加载优化、渲染性能、Web Vitals、Lighthouse
**6个原子skill**：performance-data-collection → performance-analysis → benchmark-generation → optimization-strategy-design → optimization-application → optimization-verification

### security-scanner（安全扫描）
**触发关键词**：安全扫描、安全漏洞、XSS、CSRF、依赖安全、敏感信息检测
**4个原子skill**：vulnerability-scan → dependency-security-check → sensitive-info-detection → security-report

### test-generator（测试生成）
**触发关键词**：生成测试、测试用例、单元测试、集成测试、E2E测试、测试覆盖
**4个原子skill**：test-case-design → test-framework-detection → test-code-generation → test-verification

### doc-generator（文档生成）
**触发关键词**：生成文档、API文档、README、组件文档、变更日志
**4个原子skill**：api-doc-extraction → component-doc-generation → changelog-generation → doc-format-conversion

### git-helper（Git辅助）
**触发关键词**：Git操作、分支管理、提交规范、解决冲突、版本Tag、conventional commits
**4个原子skill**：branch-analysis → commit规范检查 → conflict-analysis → version-management

### deploy-helper（部署辅助）
**触发关键词**：部署、Docker、CI/CD、环境配置、部署脚本、Vercel、Netlify
**4个原子skill**：dockerfile-generation → cicd-pipeline-generation → env-config-generation → deployment-verification

---

## 改进主Skill详情

### code-generator（代码生成，v1.0 → v1.2）
**改进**：
- 新增 `multi-scenario-adapter` 原子skill（自动识别4种场景）
- 4场景路由：标准输入 / 简单需求 / 复杂需求 / 多模块
- tech-stack-detection 优先读取 `project_context.json`
- 9项完成标准（原8项）

### code-optimizer（代码优化，v1.0 → v1.2）
**改进**：
- 新增 `performance-analysis` 原子skill（第3步，pattern-recognition之后）
- 7步流程（原6步）
- improvement-suggestion 依赖 pattern-recognition AND performance-analysis
- 增强性能指标体系

### bug-solver（Bug修复，v1.0 → v1.2）
**改进**：
- 新增 `bug-triage` 原子skill（第1步，最前）
- 7步流程（原6步）
- bug-identification 依赖 bug-triage（原无依赖）
- 引入bug分类体系（critical/high/medium/low）

### code-redundancy-checker（冗余检测，v1.0 → v1.1）
**改进**：
- 支持Vue SFC三段检测、TypeScript类型重复检测
- 引入severity等级（HIGH/MEDIUM/LOW）
- redundancy-report 增加fix-suggestion

### code-style-generator（风格生成，v1.0 → v1.1）
**改进**：
- 增加TypeScript配置检测（tsconfig.json）
- 增加Vue3 Composition API规则检测
- 增加React Hooks规则检测
- 改进CODE_STYLE.md输出格式

### requirement-generator（需求生成，v1.0 → v1.1）
**改进**：
- 增强quality.score（五维度评分）
- 增加flow类型细分
- requirement-documentation 增加quality评分ASCII可视化

### scan-object-info（项目扫描，v1.0 → v1.1）
**改进**：
- 增加置信度评分（每条检测结果）
- 增加并行执行支持
- 增加project-summary自动生成
- 增加suggested follow-up actions

---

## 与 v1.0 的对比

| 维度 | v1.0 (.claude/skills/) | v1.2 (.claude/skills/) |
|------|------------------------|---------------------------|
| 主skill数量 | 7个 | **13个** (+6) |
| 原子skill数量 | ~49个 | **79个** (+30) |
| 意图识别 | 规则算法 | **LLM驱动 + fallback** |
| 技能匹配 | 简单关键词 | **动态权重+多skill组合** |
| 任务生成 | 串行执行 | **DAG+并行层识别** |
| 执行控制 | 基础状态更新 | **流式输出+Token追踪** |
| 错误处理 | 基础重试 | **5维度影响评估+分类** |
| 反思机制 | 简单校验 | **偏差量化+3次反思** |
| 上下文感知 | 无 | **读取project_context.json** |

---

## 使用建议

1. **启动新会话**：若要使用v1.2的改进，从 `skills/` 读取skill定义
2. **保持v1.0不变**：`.claude/skills/` 目录完全保留，两个版本并行
3. **逐步迁移**：可以先从新增skill（test-generator、security-scanner等）开始使用v1.2
4. **对比验证**：对同一需求分别用v1.0和v1.2执行，对比效果

---

**版本**: 1.2
**创建时间**: 2026-05-21
**总文件数**: 117个（8个orchestrator + 6个orchestrator原子 + 103个主skill文件）
**总skill数**: 13个主skill + 79个原子skill + 6个orchestrator原子