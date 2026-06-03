# Git Assistant 使用说明

> 帮用户用自然语言做 Git 操作，用韬定律找到最快路径

## 快速开始

### 触发关键词

```
提交、commit、branch、分支、冲突、conflict、stash、
history、历史、blame、tag、版本、merge、rebase
```

### 使用示例

```
用户: "提交当前代码"
→ git-assistant → intent-router + commit-generation
→ 生成 commit message → 确认 → 执行提交

用户: "创建 feat/auth 分支并提交登录功能"
→ intent-router + branch-management + commit-generation
→ 创建分支 → 生成 commit → 确认 → 执行

用户: "分析一下这个文件谁改的最多"
→ intent-router + history-analysis
→ 执行 git blame → 生成分析报告
```

## 支持的操作

| 操作 | 示例 | 技能组合 | τ 档位 |
|------|------|---------|--------|
| 提交 | "提交当前代码" | intent-router + commit-generation | simple |
| 分支 | "创建新分支并切换" | intent-router + branch-management | simple |
| 历史 | "分析变更历史" | intent-router + history-analysis | moderate |
| 冲突 | "解决 merge 冲突" | intent-router + conflict-resolution | moderate |
| 暂存 | "stash 当前修改" | intent-router + stash-management | simple |

## τ 优化原理

### 什么是 τ？

τ 是华为韬定律中的核心概念，代表认知/执行延迟：
```
τ_action = Σ(所选原子技能的 τ 估算)
```

git-assistant 的 τ 优化目标：**用最少的技能完成用户意图**

### 示例对比

无优化（错误）：
```
intent-router + branch-management + history-analysis + commit-generation
τ = 300+600+1200+800 = 2900 ❌
```

τ 优化（正确）：
```
intent-router + commit-generation
τ = 300+800 = 1100 ✅
```

## Commit Message 生成

遵循 Conventional Commits 规范：

```
<type>(<scope>): <short description>

[body]

[footer]
```

Type 类型：feat / fix / docs / style / refactor / test / chore

## 文件结构

```
git-assistant/
├── SKILL.md
├── README.md
└── atomic-skills/
    ├── intent-router/
    ├── commit-generation/
    ├── branch-management/
    ├── conflict-resolution/
    ├── stash-management/
    └── history-analysis/
```

**版本**: 1.0 | 最后更新: 2026-06-02
