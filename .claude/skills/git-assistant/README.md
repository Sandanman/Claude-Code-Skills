# Git Assistant 使用说明

> 帮用户用自然语言做 Git 操作，用韬定律找到最快路径

## 快速开始

### 触发关键词

```
提交、commit、branch、分支、冲突、conflict、stash、
history、历史、blame、tag、版本、merge、rebase、
规范检查、changelog、分支健康、过期分支、semver
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

用户: "检查最近的提交是否符合 conventional commits"
→ intent-router + commit-generation（含批量规范检查）
→ 批量验证提交 → 输出规范检查报告

用户: "生成这个项目的 CHANGELOG"
→ intent-router + version-management
→ 分析 Tag → 生成 CHANGELOG 报告

用户: "生成分支健康报告，清理过期分支"
→ intent-router + branch-management (analyze)
→ 分支分析 → 过期/长期分支 → 合并建议
```

## 支持的操作（v1.2 整合 git-helper，合并 commit-spec-check）

| 操作 | 示例 | 技能组合 | τ |
|------|------|---------|---|
| 提交 | "提交当前代码" | intent-router + commit-generation | 1700 |
| 分支 CRUD | "创建 feat/auth 分支" | intent-router + branch-management | 900 |
| 分支健康分析 | "生成分支健康报告" | intent-router + branch-management (analyze) | 1200 |
| 历史 | "分析变更历史" | intent-router + history-analysis | 1500 |
| 冲突解决 | "解决 merge 冲突" | intent-router + conflict-resolution | 1800 |
| 暂存 | "stash 当前修改" | intent-router + stash-management | 800 |
| 提交规范检查 | "检查是否符合 conventional commits" | intent-router + commit-generation（含批量） | 1700 |
| 版本管理 | "生成 CHANGELOG" | intent-router + version-management | 1000 |

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
τ = 300+600+1200+1400 = 3500 ❌
```

τ 优化（正确）：
```
intent-router + commit-generation
τ = 300+1400 = 1700 ✅
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
    ├── intent-router/          ← 意图识别与路由（τ=300）
    ├── commit-generation/       ← Commit 生成 + 规范验证 + 批量检查（τ=1400）[v1.2 合并]
    ├── branch-management/        ← 分支 CRUD + 健康分析（τ=600/900）
    ├── conflict-resolution/     ← 冲突解决 + 详细分析（τ=1500）
    ├── stash-management/        ← Stash 管理（τ=500）
    ├── history-analysis/        ← 历史分析（τ=1200）
    └── version-management/      ← 版本管理 + CHANGELOG（τ=700）
```

**版本**: 1.2 | 最后更新: 2026-06-03 | 整合 git-helper 全部功能，统一 τ 表，合并 commit-spec-check 入 commit-generation