# Orchestrator Pro 技能注册表 v1.0

version: 1.0
说明：
1. 本注册表管理 orchestrator-pro 的编排能力，包括 8 个原子 skill
2. orchestrator-pro 集成华为韬定律，τ 为核心性能指标
3. 所有编排 skill 需在此注册，未注册不允许执行

---

## orchestrator-pro 原子技能

### tau-controller（新增）
```yaml
- name: tau-controller
  desc: τ 控制核心 — 预算分配、τ 测量、折叠决策、效率评分。贯穿全程的横切控制器
  path: .claude/skills/orchestrator-pro/atomic-skills/tau-controller/SKILL.md
  core_ability: τ 预算管理、τ 测量记录、τ 驱动的折叠决策、效率评分报告
  match_keywords: τ, tau, 性能, 效率, 预算, 分解报告
  status: 启用
  tau_role: controller  # 横切控制器，不直接参与编排链路输出
```

### pattern-miner（新增）
```yaml
- name: pattern-miner
  desc: Pattern Mining 模式挖掘 — 从任务历史中提取和复用成熟模式
  path: .claude/skills/orchestrator-pro/atomic-skills/pattern-miner/SKILL.md
  core_ability: 模式特征提取、模式库搜索、τ 折扣计算、模式存储、成熟度评估
  match_keywords: 模式, pattern, 复用, 历史, 成熟
  status: 启用
  tau_role: pattern  # 在步骤 2 并行执行，步骤 9 存储
```

### intent-recognition（继承 + τ）
```yaml
- name: intent-recognition
  desc: 意图识别（τ 增强版）— 将用户自然语言转化为结构化意图，增加 τ 测量和 Co-Design
  path: .claude/skills/orchestrator-pro/atomic-skills/intent-recognition/SKILL.md
  core_ability: 领域分类、操作分类、复杂度评估、置信度评估、τ 预算初始化
  depend: 无
  status: 启用
  tau_role: step1  # 步骤 1 执行器
  is_core: true
```

### skill-matcher（继承 + τ）
```yaml
- name: skill-matcher
  desc: 技能匹配（τ 增强版）— 增加 Co-Design 贡献度标注和 τ 效率评分
  path: .claude/skills/orchestrator-pro/atomic-skills/skill-matcher/SKILL.md
  core_ability: 加权评分匹配、多 skill 组合检测、τ 效率加权、Co-Design 显式化
  depend: intent-recognition
  status: 启用
  tau_role: step3  # 步骤 3 执行器
  is_core: true
```

### task-generator（增强 + Task Folding）
```yaml
- name: task-generator
  desc: 任务生成（τ 增强版）— 增加 Task Folding 折叠决策模块
  path: .claude/skills/orchestrator-pro/atomic-skills/task-generator/SKILL.md
  core_ability: DAG 构建、循环依赖检测、Kahn 拓扑排序、并行层识别、Task Folding 折叠
  depend: intent-recognition, skill-matcher
  status: 启用
  tau_role: step4  # 步骤 4 执行器
  is_core: true
```

### execution-controller（增强 + τ 监控）
```yaml
- name: execution-controller
  desc: 执行控制（τ 增强版）— 增加 τ 实时监控、动态折叠触发、Skill Stacking 命中追踪
  path: .claude/skills/orchestrator-pro/atomic-skills/execution-controller/SKILL.md
  core_ability: 并行层执行、流式输出、Token 追踪、5 维错误评估、τ 实时监控、紧急折叠
  depend: task-generator
  status: 启用
  tau_role: step5  # 步骤 5 执行器
  is_core: true
```

### result-validator（增强 + τ 效率）
```yaml
- name: result-validator
  desc: 结果校验（τ 增强版）— 增加 τ 效率评分、Co-Design 贡献度报告
  path: .claude/skills/orchestrator-pro/atomic-skills/result-validator/SKILL.md
  core_ability: 完成标准验证、偏差量化、反思循环、τ 效率评分、贡献度汇总
  depend: execution-controller
  status: 启用
  tau_role: step7  # 步骤 7 执行器
  is_core: true
```

### task-archiver（增强 + Pattern 存储）
```yaml
- name: task-archiver
  desc: 任务归档（τ 增强版）— 增加 Pattern 模式存储
  path: .claude/skills/orchestrator-pro/atomic-skills/task-archiver/SKILL.md
  core_ability: 月度归档、索引更新、可固化文档检测、Pattern 模式存储、成熟度更新
  depend: result-validator
  status: 启用
  tau_role: step9  # 步骤 9 执行器
```

---

## τ 编排链路

```
用户输入
   ↓
[1] intent-recognition + tau-controller.allocate_budget()
   ↓
[2] skill-matcher（轨道A历史 + 轨道B Pattern Mining 并行）
   ↓
[3] skill-matcher.match_main_skill()
   ↓
[4] task-generator + Task Folding（折叠决策）
   ↓
[5] execution-controller（τ 实时监控 + 紧急折叠 + Skill Stacking）
   ↓
[6] 任务恢复（τ 元数据恢复）
   ↓
[7] result-validator（τ 效率评分 + Co-Design 汇总）
   ↓
[8] 结果输出（τ 分解报告）
   ↓
[9] task-archiver（Pattern 存储）
```

---

## τ 增强配置索引

- τ 预算配置：config.md → TAU_BUDGETS
- Task Folding 配置：config.md → FOLD_TRIGGERS / FOLD_PROTECTED
- Skill Stacking 配置：config.md → STACK_LAYERS
- Co-Design 配置：config.md → CO_DESIGN_MATRIX
- Pattern Mining 配置：config.md → PATTERN_MATURITY

---

**版本**: 1.0
**最后更新**: 2026-06-02
**父版本**: Orchestrator v1.2 skills_register.md