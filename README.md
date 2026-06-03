# Skills 系统 v1.2.x

基于意图驱动的多层级 Skill 编排系统，通过 Reasoner 调度器实现复杂任务的自主分解与执行。

---

## 项目简介

Skills 系统是一套 AI 代码助手的技能编排框架，由 **Orchestrator（调度器）** 统一管理用户意图识别、任务规划和执行流程。当用户提出需求时，系统自动匹配对应的主 Skill，组合原子 Skill 生成可执行的任务计划，支持断点恢复、并行执行、结果校验和自动归档。

**核心特性：**
- 意图识别：LLM 驱动 + 智能 fallback，支持置信度评估
- 多 Skill 组合：自动识别复杂任务，支持多主 Skill 协同
- 断点恢复：从 task_skill.md 任意位置继续执行
- Token 追踪：实时监控消耗，80% 预警 / 95% 严重警告 / 100% 终止
- 结果校验：双重校验 + 反思重规划（最多 3 轮）
- 自动归档：按月归档历史任务，维护月度索引

---

## 项目结构

```
Claude-Code-Skills/                        # 项目根目录
├── skill-design.md                        # 设计思路文档
├── README.md                              # 本文件
└── .claude/
    ├── settings.local.json                # 权限配置（$CLAUDE_PROJECT_DIR 相对路径）
    ├── history/                           # 操作历史
    └── skills/                            # 技能系统根目录
        ├── orchestrator/                  # Reasoner 调度器（总控入口）
        │   ├── SKILL.md                   # 核心技能定义
        │   ├── README.md                  # 使用指南
        │   ├── algorithms.md              # 核心算法（10 个）
        │   ├── config.md                  # 配置参数（16 个配置块）
        │   ├── technical_implementation.md # 技术实现（13 个模块）
        │   ├── user_interaction.md         # 用户交互（6 个决策点）
        │   ├── skills_register.md          # 主 Skill & 原子 Skill 注册表
        │   ├── missing_skills.md           # 缺失 Skill 记录
        │   └── atomic-skills/              # orchestrator 自身原子能力
        │       ├── intent-recognition/
        │       ├── skill-matcher/
        │       ├── task-generator/
        │       ├── execution-controller/
        │       ├── result-validator/
        │       └── task-archiver/
        ├── tasks/                         # 任务工作区
        │   ├── current/                   # 当前任务（task_skill.md）
        │   ├── history/                   # 历史任务（YYYY-MM/）
        │   │   └── YYYY-MM/
        │   │       ├── task_*.md          # 归档的任务文件
        │   │       └── 月度任务索引.md
        │   └── templates/                  # 任务模版
        │       ├── task_skill_template.md
        │       └── 月度任务索引模版.md
        ├── code-generator/                # 主 Skill：代码生成
        │   ├── SKILL.md
        │   ├── README.md
        │   └── atomic-skills/
        ├── code-optimizer/                 # 主 Skill：代码优化
        ├── code-style-generator/          # 主 Skill：代码风格生成
        ├── code-redundancy-checker/       # 主 Skill：代码冗余检测
        ├── bug-solver/                    # 主 Skill：Bug 修复
        ├── scan-object-info/             # 主 Skill：项目信息扫描
        ├── requirement-generator/         # 主 Skill：需求生成
        ├── performance-optimizer/         # 主 Skill：性能优化
        ├── security-scanner/              # 主 Skill：安全扫描
        ├── test-generator/                # 主 Skill：测试生成
        ├── doc-generator/                 # 主 Skill：文档生成
        ├── git-assistant/               # 主 Skill：Git 操作（τ 优化 + τ 统一 + 7 原子技能）
        └── deploy-helper/                # 主 Skill：部署辅助
```

---

## 主 Skill 一览

| 主 Skill | 核心能力 | 原子 Skill 数 |
|---|---|---|
| `code-generator` | 需求理解、技术栈检测、代码结构设计、生成、整合、验证 | 9 |
| `code-optimizer` | 代码质量分析、性能分析、模式识别、重构、验证、文档更新 | 7 |
| `code-style-generator` | 配置检测、代码推断、规范探测、风格确认、文档生成 | 5 |
| `code-redundancy-checker` | 重复代码检测、死代码检测、冗余报告生成 | 3 |
| `bug-solver` | Bug 分类、问题识别、代码分析、根因定位、修复生成、验证、测试建议 | 7 |
| `scan-object-info` | 解析 package.json、扫描项目结构、检测框架、UI库、状态管理、路由、环境变量等 | 9 |
| `requirement-generator` | 需求分解、API 设计、测试用例生成、需求评估、文档生成 | 10 |
| `performance-optimizer` | 性能数据收集、基准测试、优化策略设计、应用、验证 | 6 |
| `security-scanner` | 漏洞扫描、依赖安全检查、敏感信息检测、安全报告 | 4 |
| `test-generator` | 测试用例设计、框架检测、测试代码生成、验证 | 4 |
| `doc-generator` | API 文档提取、组件文档生成、变更日志、格式转换 | 4 |
| `git-assistant` | 分支管理、提交生成+验证、冲突解决、stash、历史分析、版本管理、提交规范检查（τ 优化 + git-helper 合并） | 7 |
| `deploy-helper` | Dockerfile 生成、CI/CD 流水线、环境配置、部署验证 | 4 |

---

## 快速开始

### 触发方式

当用户输入与代码开发相关的需求时，Orchestrator 自动被触发：

```
用户："优化 MeetingCard 组件的性能"
用户："修复登录按钮点击无反应的问题"
用户："帮我实现一个用户登录功能"
用户："扫描项目使用的技术栈"
```

### 执行流程（9 步）

```
1. 意图识别 → LLM 解析 + 置信度评估
   ↓
2. 历史检索 → 召回 Top3-5 相似任务（相似度 ≥ 0.85 则复用）
   ↓
3. Skill 匹配 → 关键词+领域+操作评分（≥0.4 匹配）
   ↓
4. 任务生成 → DAG + 拓扑排序 + 并行层识别 → task_skill.md
   ↓
5. 执行控制 → 流式输出 + Token 追踪 + 错误影响评估
   ↓
6. 断点恢复 → 从未完成步骤继续
   ↓
7. 结果校验 → 双重校验 + 反思重规划（最多 3 轮）
   ↓
8. 结果输出 → 汇总 + Token 消耗 + 反思日志
   ↓
9. 自动归档 → 按月归档 + 更新月度索引
```

### 配置文件

所有文件操作权限已配置在 `.claude/settings.local.json`，使用 `$CLAUDE_PROJECT_DIR` 环境变量，可直接复制到任意项目使用。

---

## 扩展新的主 Skill

1. 在 `.claude/skills/` 下创建主 Skill 目录（`kebab-case` 命名）
2. 编写 `SKILL.md` 和 `atomic-skills/` 下的原子 Skill
3. 在 `orchestrator/skills_register.md` 的【一】主技能列表中注册
4. 在【二】原子技能列表中注册对应原子 Skill
5. Orchestrator 下次执行时自动识别并参与调度

---

## 目录命名约定

| 类型 | 格式 | 示例 |
|---|---|---|
| 主 Skill 目录 | `kebab-case` | `code-generator`、`bug-solver` |
| 原子 Skill 目录 | 与目录名相同 | `code-generator/` 下原子 Skill |
| 任务文件 | `task_YYYYMMDD_HHMMSS_*.md` | `task_skill_20260522_104500_123456.md` |
| 历史归档 | `YYYY-MM/` | `2026-05/` |
| 月度索引 | `月度任务索引.md` | 按月维护 |

---

## 版本历史

### v1.2（2026-06-03）git-assistant 整合 git-helper，τ 表统一

**变更说明：**
本版本将 `git-helper` 全部功能整合至 `git-assistant`，统一 τ 估算表，消除重复定义，新增功能如下：

**新增主 Skill（合并）：**
- `git-assistant` 替代 `git-helper`，τ 优化的技能选择（华为韬定律）+ git-helper 全部能力

**新增原子 Skill（整合）：**
- `commit-spec-check` → 合并入 `commit-generation`（τ: 800→1400）
- 新增 `version-management` 原子 Skill：Tag 管理 + CHANGELOG 生成 + semver 版本建议
- 新增 `intent-router` 扩展：spec-check、version、branch-health 三大意图路由

**增强原子 Skill：**
- `commit-generation`：新增批量规范检查（analyze_commits）、修正建议（suggest_fix）
- `branch-management`：新增分支健康分析（过期/长期/命名规范/合并建议）
- `conflict-resolution`：新增详细 ours/theirs 分析、难度评估、分步指南
- `stash-management`：新增 show/apply/clean 操作、stash 健康分析
- `history-analysis`：新增 shortlog 排名、提交趋势、分支对比
- `version-management`：补全 action 分支（list/suggest/create/push/delete/changelog）

**统一修复：**
- τ 表一致性：主 SKILL.md 与 intent-router/SKILL.md τ 值完全统一
- TYPE_MAP 集中化：提取至主 SKILL.md 公共常量规范，原子技能不再重复定义
- 移除重复的 TYPE_MAP 表（section 7/9 重复）

**删除：**
- `git-helper/` 目录（已合并至 `git-assistant`）
- `commit-spec-check/` 目录（已合并至 `commit-generation`）

---

### v1.2（2026-05-21）全面重构

**新增特性：**
- 上下文感知：自动读取 `.claude/project_context.json` 作为背景
- 多 Skill 组合：复杂度 ≥ 7.0 时自动识别多 Skill 协同（如 bug-solver + code-optimizer）
- Token 追踪：实时监控消耗，80% 预警、95% 严重警告、100% 终止
- 并行层识别：自动识别无依赖的原子 Skill，支持并行执行
- 智能 fallback：LLM 不可用时平滑降级到规则算法
- 双重校验：既验证各原子 Skill 完成标准，也验证整体目标达成度
- 反思日志：最多 300 字，仅记录关键问题和可落地方向

**新增主 Skill：**
- `performance-optimizer` — 性能优化和基准测试
- `security-scanner` — 安全漏洞扫描
- `test-generator` — 测试用例自动生成
- `doc-generator` — API/组件文档自动生成
- `git-helper` → `git-assistant` — Git 操作辅助（v1.2 2026-06-03 已合并入 git-assistant）
- `deploy-helper` — 部署辅助

**改进主 Skill：**
- `bug-solver` 新增 bug-triage 原子 Skill
- `code-optimizer` 新增 performance-analysis 原子 Skill
- `code-generator` 新增 multi-scenario-adapter 原子 Skill

### v1.0（初始版本）

- 9 步执行流程
- 5 个主 Skill：code-generator、code-optimizer、code-style-generator、bug-solver、scan-object-info
- 基础意图识别和 Skill 匹配
- 任务生成与状态更新
- 历史检索与月度归档

---

## 维护指南

### 日常维护

- 添加新主 Skill → 更新 `orchestrator/skills_register.md`
- 调整匹配参数 → 修改 `orchestrator/config.md`
- 定制用户提示 → 修改 `orchestrator/user_interaction.md`
- 补充缺失 Skill → 处理 `orchestrator/missing_skills.md`

### 定期维护

- 清理过期任务（>180 天）：自动归档到 tar.gz
- 更新技能列表：移除已弃用 Skill，添加新 Skill
- 审查反思日志：提取可落地的优化方向

---

## 相关文档

- [设计思路](skill-design.md) — 完整设计文档
- [Orchestrator SKILL.md](.claude/skills/orchestrator/SKILL.md) — 调度器核心定义
- [Orchestrator README.md](.claude/skills/orchestrator/README.md) — 使用指南
- [skills_register.md](.claude/skills/orchestrator/skills_register.md) — 技能注册表
- [config.md](.claude/skills/orchestrator/config.md) — 配置参数

---

**版本**：1.2.x
**最后更新**：2026-06-03
**维护者**：项目团队