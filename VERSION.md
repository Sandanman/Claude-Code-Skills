# Claude Code Skills — 版本管理记录

> 版本格式: v.大版本号.小版本.小修改 (Semver-like)
> 归档目录: `.claude/history/`

---

## 版本列表

### v.1.3.3
- **日期**: 2026-06-11
- **提交**: aba2e38
- **类型**: 小版本升级
- **变更**:
  - 新增 `code-structure-analyzer` skill（v1.1 韬定律增强版）：读取项目中代码，分析流程、关键节点、变量和依赖，生成结构化 .md 文档，支持 Mermaid 子元素逻辑
  - 新增 `product-designer` skill（v1.1 韬定律增强版）：将简单需求扩展为完整产品模块设计，支持 Mermaid 流程图、多角色泳道、业务详细描述
  - orchestrator-pro 升级至 v1.6：修复步骤 3 未匹配主 skill 时的处理逻辑，新增三分支判断（无匹配/单匹配/多匹配）+ 自主执行兜底
  - orchestrator/skills_register.md 升级至 v1.8：注册 code-structure-analyzer 和 product-designer，主技能数 18
  - orchestrator/atomic_skills_register.md 升级至 v1.4：新增两个 skill 的原子技能注册（code-structure-analyzer 5个 + product-designer 10个），原子技能合计 83
  - 清理冗余文档：删除 SKILL_CREATION_GUIDE.md 和 tao-theory-design.md，重构为 .claude/tao-skill-design/ 目录（TAO_THEORY_DESIGN.md + 5 个分章文件）
  - 更新 settings.json：新增 /code-structure-analyzer 和 /product-designer slash commands（16 个）
  - 更新 CLAUDE.md：主 Skill 体系 15→17 个，slash commands 14→16 个
- **归档**: `.claude/history/v.1.3.3.zip`

### v.1.3.2
- **日期**: 2026-06-05
- **提交**: 7fba0f2
- **类型**: 小版本升级
- **变更**:
  - 新增 `personal-code-habits-generator` skill（v1.2 τ 增强版）：从人的角度主动询问用户，生成 CODE_STYLE_PERSONAL.md，与 code-style-generator 形成互补
  - 新增 `cheers` skill（v1.0）：项目初始化引导，依次调用 scan-object-info + code-style-generator + personal-code-habits-generator，生成/更新 CLAUDE.md（含代码生成优先级说明）
  - 更新 `orchestrator/skills_register.md`（v1.5）：注册 personal-code-habits-generator 和 cheers
  - 更新 `settings.json`：新增 `/cheers` 和 `/personal-code-habits-generator` slash commands（共 15 个）
  - 新建并整合 `CLAUDE.md`：合并项目概述、常用命令、核心架构、主 skill 体系、编码规范、语言规则、禁止事项
  - 删除冗余的 `CLAUDE0.md`
- **归档**: `.claude/history/v.1.3.2.zip`

### v.1.3.1
- **日期**: 2026-06-05
- **提交**: 5a53d82
- **类型**: 小版本升级
- **变更**:
  - skill-stacking.mdc 新增强制行为规则（5.1-5.4）：上游 skill 输出写入共享上下文、下游 skill 优先读取、命中率追踪、写入时机约束
  - task-folding.mdc 重大扩展，完善任务折叠逻辑
  - orchestrator-pro/SKILL.md 全面重构（+525行），τ增强版深化
  - orchestrator-pro/config.md 重大扩展
  - orchestrator-pro/technical_implementation.md 重大扩展
  - orchestrator-pro/atomic-skills/task-archiver/SKILL.md 重大重构
  - code-optimizer/SKILL.md v2.0 τ 增强
  - scan-object-info/SKILL.md 新增内容
- **归档**: `.claude/history/v.1.3.1.zip`

### v.1.3.0
- **日期**: 2026-06-04
- **提交**: 65bae48 / 7d24805
- **类型**: 大版本升级
- **变更**:
  - 韬定律 v1.3 全面升级
  - 整合 Task Folding（任务折叠）、Skill Stacking（技能栈叠）、Pattern Mining（模式库）
  - bug-solver/code-generator → v1.3 τ 增强版
  - code-optimizer → v2.0 τ 增强版，整合代码质量分析+性能优化+冗余检测
  - settings.json τ-Agent 监控 hooks（SessionStart/PreCompact/PostCompact/SessionEnd）
  - 归档文件: `.claude/history/v.1.3.0.zip`

### v.1.2.5
- **日期**: 2026-06-03
- **提交**: 94dc1d9
- **类型**: 小修改
- **变更**:
  - 全面重构 Skill 系统
  - 新增 `.claude/project_context.json` 项目上下文配置
  - 新增 `orchestrator-pro/atomic-skills/task-archiver/` 原子技能

### v.1.2.4
- **日期**: 2026-06-03
- **提交**: 9dca7f9
- **类型**: 小版本升级
- **变更**:
  - 新增 `orchestrator-pro`：基于华为韬定律的τ增强版编排系统
    - 集成 Task Folding、Skill Stacking、Co-Design、Pattern Mining
  - 新增 `git-assistant`：τ优化的智能 Git 操作助手
    - 意图识别路由 + 6 个原子技能（commit/branch/conflict/stash/history）
  - 新增 4 个规则文件: task-folding、skill-stacking、tau-control、pattern-mining
  - 新增华为韬定律设计文档: `tau-theory-design.md`
  - 更新技能注册表: 注册 git-assistant

### v.1.2.3
- **日期**: 2026-06-03
- **提交**: 809a999
- **类型**: 小修改
- **变更**:
  - git-assistant v1.2 整合 git-helper 全部功能（分支健康分析、提交规范检查、冲突分析、版本管理）
  - 统一主 SKILL.md 与 intent-router τ 估算表（commit-generation 800→1400）
  - 合并 commit-spec-check 入 commit-generation，删除独立目录
  - 新增 version-management 原子技能（Tag/CHANGELOG/semver）
  - 增强 7 个原子技能: stash/history/branch/commit/conflict/intent-router
  - 更新 README.md 版本记录至 v1.2.x

### v.1.2.2
- **日期**: 2026-06-03
- **提交**: 7a8dc40
- **类型**: 小修改
- **变更**:
  - 添加历史归档文件 v.1.2.2
  - 归档文件: `.claude/history/v.1.2.2.zip`

### v.1.2.1
- **日期**: 2026-05-26
- **提交**: c95af75
- **类型**: 小修改
- **变更**:
  - 新增 `coding-standards.mdc` 编码规范规则（alwaysApply: true）
  - 覆盖格式化、命名、组件结构、async/await、错误处理、样式、导入顺序、硬编码禁止项

### v.1.0.0
- **日期**: 2026-05-22
- **提交**: 3aa5b00
- **类型**: 初始版本
- **变更**:
  - 初始版本，bug-solver 技能
  - 归档文件: `.claude/history/skills_v.1.0.zip`

---

## 版本号规范

```
v.大版本号.小版本.小修改
```

| 字段 | 说明 | 递增规则 |
|------|------|---------|
| 大版本号 | 不兼容的重大架构变更 | 重大重构时手动指定 |
| 小版本 | 新增功能/技能，保持向后兼容 | 功能发布时递增 |
| 小修改 | Bug 修复、文档更新、小优化 | 补丁发布时自动递增 |

---

## 发布流程

1. 完成功能开发或修复
2. 确认版本号（参考上方规范）
3. 归档当前版本: `.claude/history/v.X.Y.Z.zip`
4. 创建提交: `git add .claude/history/v.X.Y.Z.zip && git commit -m "v.X.Y.Z"`
5. 更新本文件，添加新版本条目

---

*最后更新: 2026-06-11*