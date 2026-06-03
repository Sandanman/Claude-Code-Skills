# Git Assistant 技能注册表 v1.0

version: 1.0
说明：git-assistant 的原子技能注册表

## git-assistant 原子技能

### intent-router
```yaml
- name: intent-router
  desc: Git 意图路由，分析用户意图选择最优原子技能组合
  path: .claude/skills/git-assistant/atomic-skills/intent-router/SKILL.md
  core_ability: 意图识别、关键词匹配、τ 优化选择
  tau_estimate: 300
  is_core: true
```

### commit-generation
```yaml
- name: commit-generation
  desc: 分析变更内容，生成符合 Conventional Commits 的 commit message
  path: .claude/skills/git-assistant/atomic-skills/commit-generation/SKILL.md
  core_ability: diff 分析、类型推断、message 生成
  tau_estimate: 800
  is_core: true
```

### branch-management
```yaml
- name: branch-management
  desc: 分支创建/切换/删除，验证命名规范
  path: .claude/skills/git-assistant/atomic-skills/branch-management/SKILL.md
  core_ability: 分支操作、分支名验证、分支策略建议
  tau_estimate: 600
  is_core: false
```

### history-analysis
```yaml
- name: history-analysis
  desc: 分析 commit 历史，查找变更来源
  path: .claude/skills/git-assistant/atomic-skills/history-analysis/SKILL.md
  core_ability: git log/blame、作者统计、变更频率分析
  tau_estimate: 1200
  is_core: false
```

### conflict-resolution
```yaml
- name: conflict-resolution
  desc: 检测冲突类型，分析解决策略
  path: .claude/skills/git-assistant/atomic-skills/conflict-resolution/SKILL.md
  core_ability: 冲突检测、解决策略生成、手动合并指导
  tau_estimate: 1500
  is_core: true
```

### stash-management
```yaml
- name: stash-management
  desc: git stash 管理（save/pop/list/drop）
  path: .claude/skills/git-assistant/atomic-skills/stash-management/SKILL.md
  core_ability: stash 操作、stash 列表解析
  tau_estimate: 500
  is_core: false
```

**版本**: 1.0 | 最后更新: 2026-06-02
