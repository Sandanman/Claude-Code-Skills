# 全局技能注册表（主技能索引）v1.3

> 本文件是主技能索引，仅列所有已注册的主 Skill 及其基本信息。
> 原子技能详情请查看 `.claude/skills/orchestrator/atomic_skills_register.md`。

version: 1.3
说明：
1. 本索引供 Reasoner（orchestrator）读取，用于意图匹配
2. 原子技能详情在 `atomic_skills_register.md` 中，按主技能分组
3. 新增/删除/修改主技能时，同步更新本索引和 `atomic_skills_register.md`
4. 未注册的主技能不允许被 orchestrator 选择和执行

---

## 主技能索引

```yaml
- name: orchestrator
  desc: 智能调度总控 — 意图识别、Skill 匹配、任务生成、执行控制、结果校验、任务归档（已废弃，降级为 orchestrator-pro 轻量 fallback）
  path: .claude/skills/orchestrator/SKILL.md
  core_ability: 9步执行流程、上下文感知、多Skill组合、Token追踪、断点恢复
  match_keywords: [所有意图]
  status: 已废弃（由 orchestrator-pro 接管，complexity<4 时内部委托）
  is_reasoner: false
  note: complexity < 4 时由 orchestrator-pro 委托执行轻量路径；complexity ≥ 4 由 orchestrator-pro 完整 τ 优化路径执行

- name: orchestrator-pro
  desc: 智能调度总控（τ 增强版）— 以 τ 为统一性能指标，通过时间缩微提升 Agent 表现
  path: .claude/skills/orchestrator-pro/SKILL.md
  core_ability: K1任务折叠、K2技能堆叠、K3全栈协同、K4模式挖掘
  match_keywords: [所有意图]
  status: 启用
  is_reasoner: true

- name: code-generator
  desc: 根据需求文档或需求描述自动生成符合项目规范的代码，支持多种输入形式并自动适配项目技术栈（v1.3 整合韬定律，τ 控制、任务折叠、技能栈叠、协同设计、模式复用）
  path: .claude/skills/code-generator/SKILL.md
  core_ability: 需求理解、技术栈检测、代码结构设计、代码生成、模块整合、代码验证、文档更新、τ 动态预算、Task Folding、Skill Stacking、Pattern Mining
  match_keywords: 根据需求写代码, 实现这个功能, 生成代码, 写一个函数, 实现这个模块, 按照需求文档开发, 帮我实现
  status: 启用

- name: code-optimizer
  desc: 系统化地优化代码，基于代码质量分析识别改进点，提供可执行的优化方案，并应用修改以提升代码质量、性能和可维护性（v2.0 τ 增强版，整合性能优化+冗余检测）
  path: .claude/skills/code-optimizer/SKILL.md
  core_ability: 静态代码质量分析、代码模式识别、性能分析、冗余检测、优化建议、自动化代码重构、优化验证、文档维护
  match_keywords: 优化代码, 重构代码, 更好的实现方式, 性能优化, 提高代码质量, 改进这个函数, 简化这段代码, 消除代码重复, 检查代码冗余, 检测重复代码, 找出死代码, 清理未使用代码, 冗余导入, 代码重复率
  status: 启用

- name: code-style-generator
  desc: 自动检测项目代码规范，生成个人代码习惯文档 CODE_STYLE.md
  path: .claude/skills/code-style-generator/SKILL.md
  core_ability: 检测配置文件、扫描代码推断规范、生成代码风格文档
  match_keywords: 生成代码习惯文档, 创建代码风格规范, 生成CODE_STYLE, 检测代码规范, 代码规范文档
  status: 启用

- name: cheers
  desc: 首次将 Claude Code Skills 引入项目时的初始化 skill。依次执行：检测/生成 CLAUDE.md → 扫描项目信息 → 生成项目代码风格 → 生成个人代码习惯，最终在 CLAUDE.md 中写入代码生成优先级说明（个人风格优先，项目规范兜底）。τ 增强版（K1 任务折叠、K2 技能栈叠、K4 模式复用）。
  path: .claude/skills/cheers/SKILL.md
  core_ability: CLAUDE.md 检测/生成、项目信息扫描、代码风格生成、个人习惯收集、CLAUDE.md 合并更新
  match_keywords: 初始化项目, 设置项目, 首次配置, 项目引导, cheers, 首次使用, 欢迎使用
  status: 启用

- name: bug-solver
  desc: 系统化地解决应用程序中的bug，通过7个原子Skill协同工作，从问题识别到修复验证，完整记录和追溯整个debug过程（v1.3 整合韬定律，τ 控制、任务折叠、技能栈叠、协同设计、模式复用）
  path: .claude/skills/bug-solver/SKILL.md
  core_ability: 问题分类(Bug Triage)、问题识别、代码分析、根因定位、安全修复、修复验证、测试建议、τ 动态预算、Task Folding、Skill Stacking、Pattern Mining
  match_keywords: 解决bug, 修复错误, 调试问题, 定位问题, debug, bug修复, 错误分析
  status: 启用

- name: personal-code-habits-generator
  desc: 从人的角度主动询问用户，生成个人代码习惯文档 CODE_STYLE_PERSONAL.md（v1.2 整合韬定律，τ 控制、任务折叠、技能栈叠、模式复用）。与 code-style-generator（从代码推断）不同，本 skill 通过主动询问用户来收集个人开发习惯，适合新环境或系统化整理个人习惯。
  path: .claude/skills/personal-code-habits-generator/SKILL.md
  core_ability: 对话式习惯收集、分批次提问、τ 预算管理、CODE_STYLE_PERSONAL.md 生成、用户确认与补充
  match_keywords: 生成我的代码习惯, 生成个人代码规范, 我习惯怎么写代码, 记录我的开发习惯, 我的编码偏好, 生成代码风格, 个人代码习惯
  status: 启用

- name: scan-object-info
  desc: 智能扫描并分析前端项目的各种技术信息（框架、UI库、状态管理、请求方案、配置文件、项目结构、路由方案、环境变量等），基于韬定律K1 Task Folding、K2 Skill Stacking、K3 Co-Design、K4 Pattern Mining
  path: .claude/skills/scan-object-info/SKILL.md
  core_ability: 智能意图识别、精准技能选择、依赖关系分析、结构化输出、错误处理、技术栈全面扫描
  match_keywords: 扫描项目, 分析项目, 项目信息, 技术栈, 项目结构, 配置文件, 依赖分析, 框架识别, UI库, 状态管理, 请求方案, 路由方案, 环境变量
  status: 启用

- name: requirement-generator
  desc: 将用户自然语言需求转化为标准化、可执行的机器需求文档（requirements.json），支持多模态输入，依赖外部项目上下文
  path: .claude/skills/requirement-generator/SKILL.md
  core_ability: 多模态需求输入、需求模块化分解、7种通用前端流程识别、REST API规格设计、测试用例生成、需求质量评估
  match_keywords: 需求分析, 需求文档, 功能规格, 将需求标准化, 需求转化为规格
  status: 启用

- name: performance-optimizer
  desc: "[已合并至 code-optimizer v2.0] 专注于前端性能优化，通过性能分析、基准测试生成和优化验证，系统化地提升应用性能（首屏加载、渲染性能、资源体积等）。功能已整合进 code-optimizer，无需单独使用。"
  path: .claude/skills/code-optimizer/SKILL.md
  core_ability: 性能数据分析、基准测试生成、优化方案设计、优化方案应用、优化效果验证
  match_keywords: 性能优化, 首屏加载优化, 渲染性能, 资源体积, 加载速度优化, Web Vitals, Lighthouse
  status: 已合并

- name: security-scanner
  desc: 系统化地扫描前端项目中的安全漏洞，包括XSS、CSRF、依赖漏洞、敏感信息泄露等，提供修复建议
  path: .claude/skills/security-scanner/SKILL.md
  core_ability: 漏洞扫描、依赖安全检查、敏感信息检测、安全报告生成、修复建议
  match_keywords: 安全扫描, 安全漏洞, XSS, CSRF, 依赖安全, 敏感信息检测, 安全审计
  status: 启用

- name: test-generator
  desc: 根据现有代码或需求自动生成测试用例，覆盖单元测试、集成测试和E2E测试，支持主流测试框架（Vitest、Jest、Playwright）
  path: .claude/skills/test-generator/SKILL.md
  core_ability: 测试用例设计、测试代码生成、测试框架适配、测试覆盖分析
  match_keywords: 生成测试, 测试用例, 单元测试, 集成测试, E2E测试, 添加测试, 测试覆盖
  status: 启用

- name: skill-analyzer
  desc: 系统化地解读和分析任意 Skill 的 SKILL.md 文件，生成结构化的分析报告（功能说明、执行流程、输出结果、架构设计、思维方式、优缺点分析、使用建议）。当用户要求"解读"、"分析"、"理解"某个 Skill 时触发。
  path: .claude/skills/skill-analyzer/SKILL.md
  core_ability: 8维度 Skill 分析、功能解读、执行流程解析、架构设计推断、优缺点评估、文档生成
  match_keywords: 解读Skill, 分析Skill, 理解Skill, 解读架构, 分析设计, Skill分析报告, 解读文档
  status: 启用

- name: doc-generator
  desc: 自动生成代码文档，包括API文档、README、组件文档、变更日志等，支持多种格式（Markdown、API文档、TypeDoc、JSDoc）
  path: .claude/skills/doc-generator/SKILL.md
  core_ability: API文档生成、README生成、组件文档生成、变更日志生成、文档格式转换
  match_keywords: 生成文档, API文档, README, 组件文档, 变更日志, 文档更新, 生成注释
  status: 启用

- name: git-assistant
  desc: 智能 Git 操作助手，基于华为韬定律 τ 优化技能选择组合，支持 commit 生成、分支管理、历史分析、冲突解决、Stash 操作、版本管理、提交规范检查
  path: .claude/skills/git-assistant/SKILL.md
  core_ability: 意图识别与路由、τ 优化的原子技能选择、Git 命令生成
  match_keywords: 提交, commit, 分支, branch, 冲突, conflict, stash, 历史, history, blame, tag, 版本, merge, rebase, git操作
  status: 启用

- name: deploy-helper
  desc: 辅助部署操作，支持Docker配置、CI/CD流水线生成、环境配置、部署脚本生成，适配主流平台（Vercel、Netlify、Docker）
  path: .claude/skills/deploy-helper/SKILL.md
  core_ability: Docker配置生成、CI/CD流水线生成、环境配置、部署脚本生成、部署验证
  match_keywords: 部署, Docker, CI/CD, 环境配置, 部署脚本, Vercel, Netlify, 自动化部署
  status: 启用
```

---

## 主技能统计（v1.5）

| 类别 | 数量 |
|------|------|
| 总主技能数 | 16 |
| Reasoner（调度器） | 2（orchestrator, orchestrator-pro）|
| 功能主技能 | 14 |

---

## 维护说明

- 添加新主技能 → 更新本索引 + 在 `atomic_skills_register.md` 添加原子技能
- 调整匹配关键词 → 修改本索引对应条目
- 原子技能详情 → 查看 `atomic_skills_register.md`

---

**版本**: 1.5
**最后更新**: 2026-06-05