# Skills 系统 v1.3（τ 增强版）

基于华为韬定律的 AI Agent 技能编排系统，以 τ（时间常数）为核心性能指标，通过时间缩微（而非堆模型参数）提升 Agent 综合表现。

---

## 项目简介

Skills 系统是一套 AI 代码助手的技能编排框架，由 **Orchestrator Pro（τ 增强版调度器）** 统一管理用户意图识别、任务规划和执行流程。当用户提出需求时，系统自动匹配对应的主 Skill，组合原子 Skill 生成可执行的任务计划，支持 τ 驱动的任务折叠、断点恢复、Skill Stacking 上下文共享和自动归档。

**核心特性（τ 增强版）：**
- τ 动态预算控制：按复杂度三档分配预算（simple/moderate/complex），80% 预警 / 95% 严重 / 100% 终止
- Task Folding（任务折叠）：τ 不足时自动压缩冗余链路，τ 节省约 30%
- Skill Stacking（技能栈叠）：通过 task_skill.md TSV 垂直互联，减少重复解析
- Co-Design（协同设计）：Model × Rules × Skills 三层责任分配，显式化贡献度
- Pattern Mining（模式复用）：历史模式相似度 ≥ 0.6 时复用子步骤，成熟模式 τ 折扣 70%
- 断点恢复：从 task_skill.md 任意位置继续执行
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
    ├── rules/                             # 行为规则（alwaysApply: true）
    │   ├── tau-control.mdc                 # τ 控制核心规则
    │   ├── task-folding.mdc               # 任务折叠规则
    │   ├── skill-stacking.mdc             # 技能栈叠规则
    │   ├── pattern-mining.mdc             # 模式复用规则
    │   └── ...                             # 其他规则
    └── skills/                            # 技能系统根目录
        ├── orchestrator-pro/              # 智能调度总控（τ 增强版，唯一入口）
        │   ├── SKILL.md                    # 核心技能定义
        │   ├── config.md                   # τ 配置参数
        │   └── atomic-skills/              # orchestrator-pro 原子能力
        │       ├── tau-controller/         # τ 控制中心
        │       ├── pattern-miner/          # 模式挖掘器
        │       └── ...
        ├── orchestrator/                   # 轻量 fallback 路径（已废弃，complexity<4 时由 orchestrator-pro 内部调用）
        ├── tasks/                         # 任务工作区
        │   ├── current/                   # 当前任务（task_skill.md）
        │   ├── history/                   # 历史任务（YYYY-MM/）
        │   │   └── YYYY-MM/
        │   │       ├── task_*.md          # 归档的任务文件
        │   │       └── 月度任务索引.md
        │   └── templates/                 # 任务模版
        ├── code-generator/                # 主 Skill：代码生成（v1.3 τ 增强版）
        ├── code-optimizer/                 # 主 Skill：代码优化（v2.0 τ 增强版，整合性能优化+冗余检测）
        ├── code-style-generator/           # 主 Skill：代码风格生成（v1.2）
        ├── bug-solver/                    # 主 Skill：Bug 修复（v1.3 τ 增强版）
        ├── scan-object-info/               # 主 Skill：项目信息扫描（v1.2 韬定律优化版）
        ├── requirement-generator/          # 主 Skill：需求生成（v1.2）
        ├── security-scanner/              # 主 Skill：安全扫描
        ├── test-generator/                # 主 Skill：测试生成
        ├── doc-generator/                 # 主 Skill：文档生成
        ├── git-assistant/                 # 主 Skill：Git 操作（v1.2 τ 增强版，整合 git-helper）
        └── deploy-helper/                 # 主 Skill：部署辅助
```

---

## 主 Skill 一览

| 主 Skill | 版本 | 核心能力 | 原子 Skill 数 |
|---|---|---|---|
| `orchestrator-pro` | τ 增强版 | 意图识别、τ 预算分配、Skill 匹配、任务生成、Task Folding、执行控制、断点恢复、结果校验、自动归档 | 8 |
| `code-generator` | v1.3 τ 增强版 | 需求理解、技术栈检测（τ 智能路由）、代码设计、生成、整合、验证、文档更新、Task Folding、Pattern Mining | 9 |
| `code-optimizer` | v2.0 τ 增强版 | 代码质量分析、性能分析、模式识别、重构、验证、文档更新（整合 performance-optimizer + 冗余检测） | 7 |
| `code-style-generator` | v1.2 | 配置检测、代码推断、规范探测、风格确认、文档生成 | 5 |
| `bug-solver` | v1.3 τ 增强版 | Bug 分类、问题识别、代码分析、根因定位、修复生成、验证、测试建议、Task Folding、Pattern Mining | 7 |
| `scan-object-info` | v1.2 韬定律版 | 解析 package.json、扫描项目结构、检测框架、UI库、状态管理、路由、环境变量（Task Folding 9→7 合并） | 7 |
| `requirement-generator` | v1.2 | 需求分解、API 设计、测试用例生成、需求评估、文档生成 | 10 |
| `security-scanner` | — | 漏洞扫描、依赖安全检查、敏感信息检测、安全报告 | 4 |
| `test-generator` | — | 测试用例设计、框架检测、测试代码生成、验证 | 4 |
| `doc-generator` | — | API 文档提取、组件文档生成、变更日志、格式转换 | 4 |
| `git-assistant` | v1.2 τ 增强版 | 分支管理、提交生成+验证、冲突解决、stash、历史分析、版本管理（整合 git-helper） | 7 |
| `deploy-helper` | — | Dockerfile 生成、CI/CD 流水线、环境配置、部署验证 | 4 |

> **已合并的 Skill**（不再独立使用）：`performance-optimizer` → 合并入 `code-optimizer v2.0`；`git-helper` → 合并入 `git-assistant`；`code-redundancy-checker` → 合并入 `code-optimizer v2.0`

---

## 快速开始

### 触发方式

当用户输入与代码开发相关的需求时，Orchestrator Pro 自动被触发并选择执行路径：

```
用户："优化 MeetingCard 组件的性能"
用户："修复登录按钮点击无反应的问题"
用户："帮我实现一个用户登录功能"
用户："扫描项目使用的技术栈"
```

### 执行流程（τ 增强版，复杂度分流）

**复杂度分流入口**：
```
用户输入
    ↓
complexity < 4 → 【轻量路径】orchestrator 9步轻量逻辑
complexity ≥ 4 → 【τ 优化路径】orchestrator-pro 完整 9步 + τ增强
```

**τ 优化路径（complexity ≥ 4）**：

```
1. 意图识别 + τ-Controller 预算分配
   ↓
2. Skill 匹配（双轨并行）：
   ├─ 轨道A：历史检索（相似度 ≥ 0.85 整任务复用）
   └─ 轨道B：Pattern Mining（相似度 ≥ 0.6 复用子步骤）
   ↓
3. Skill 匹配 → 关键词+领域+操作评分（≥0.4 匹配）
   ↓
4. 任务生成 → DAG + 拓扑排序 + Task Folding 折叠决策
   ↓
5. 执行控制 → 流式输出 + τ 实时监控 + Skill Stacking TSV + 紧急折叠
   ↓
6. 断点恢复 → τ 元数据恢复，从未完成步骤继续
   ↓
7. 结果校验 → 双重校验 + τ 效率评分 + Co-Design 贡献度汇总
   ↓
8. 结果输出 → 汇总 + τ 分解报告（各步骤占比 + 历史对比）
   ↓
9. 自动归档 → Pattern 模式固化 + 月度索引更新
```

**Task Folding 折叠示例**（简单需求，场景2）：
- 原始路径：multi-scenario-adapter → requirement-reader → requirement-analysis → tech-stack-detection → code-design → code-generation → code-validation → documentation-update（8步）
- 折叠后路径：multi-scenario-adapter → requirement-reader → [Group A] requirement-analysis+tech-stack-detection → [Group B] code-design+code-generation → [Group D] code-validation+documentation-update（5步）
- τ 节省：约 35%

### 配置文件

所有文件操作权限已配置在 `.claude/settings.local.json`，使用 `$CLAUDE_PROJECT_DIR` 环境变量，可直接复制到任意项目使用。

---

## 扩展新的主 Skill

1. 在 `.claude/skills/` 下创建主 Skill 目录（`kebab-case` 命名）
2. 编写 `SKILL.md` 和 `atomic-skills/` 下的原子 Skill
3. 在 `orchestrator/skills_register.md` 的【主技能索引】中注册
4. 在 `orchestrator/atomic_skills_register.md` 中注册对应原子 Skill
5. Orchestrator Pro 下次执行时自动识别并参与调度

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

### v1.3（2026-06-04）韬定律全面整合 — bug-solver & code-generator τ 增强版

**变更说明：**
本版本对 `bug-solver` 和 `code-generator` 进行韬定律（τ-Law）全面增强，整合 Task Folding、Skill Stacking、Co-Design、Pattern Mining 四大核心技术，实现 τ 节省约 30%。

**增强的主 Skill：**
- `bug-solver` → v1.3，新增 7 步 τ 分项预算、3 个 Task Folding 可折叠组、Skill Stacking TSV 上下文共享、Co-Design 责任分配、Pattern Mining 修复模式库（4 个内置模式）
- `code-generator` → v1.3，新增 4 场景 τ 权重分配、4 个 Task Folding 可折叠组、Skill Stacking 上下文键（9 个 skill）、Pattern Mining 生成模式库（5 个内置模式）

**τ 增强核心数据：**
- 简单任务（simple，complexity < 4）：总预算 2500-3000 token，轻量路径
- 中等任务（moderate，complexity 4-6）：总预算 8000-15000 token
- 复杂任务（complex，complexity ≥ 7）：总预算 15000-50000 token，完整 τ 优化路径

**删除的主 Skill：**
- `code-redundancy-checker/`：目录已删除，功能合并入 `code-optimizer v2.0` 的 `redundancy-check` 原子 skill
- `performance-optimizer/`：目录已删除，功能合并入 `code-optimizer v2.0`

**系统协同更新：**
- `orchestrator/skills_register.md` → v1.3，bug-solver/code-generator 描述更新
- `orchestrator/atomic_skills_register.md` → v1.3，τ-weight 标注，code-redundancy-checker 合并标记
- `orchestrator-pro/skills_register.md` → v1.1，父版本 v1.3
- `orchestrator-pro/config.md` → v1.1
- `settings.json`：移除 code-redundancy-checker slash command，更新 code-optimizer/bug-solver/code-generator 描述
- `CLAUDE.md`：移除已删除 skill 引用，更新版本标注
- orchestrator-pro/config.md STACK_LAYERS：`git-helper` → `git-assistant`

**原子 Skill 统计（v1.3）：**
- 活跃主 Skill：12 个（bug-solver/code-generator 新增 v1.3 τ 增强版）
- 已合并主 Skill：2 个（performance-optimizer、code-redundancy-checker）
- 原子 Skill 总数：61 个

---

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

**版本**：1.3（τ 增强版）
**最后更新**：2026-06-04
**维护者**：项目团队