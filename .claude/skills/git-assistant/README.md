# Git Assistant 使用说明

## 功能

`git-assistant` 负责识别 Git 意图、选择最小原子 Skill 组合、整合分析结果，并在确认后执行有风险的 Git 操作。

## 触发关键词

```text
提交、commit、commit message、分支、branch、merge、rebase、冲突、conflict、
stash、历史、history、blame、tag、版本、release、CHANGELOG、semver、
提交规范、conventional commits、分支健康、过期分支、长期分支
```

## 典型组合

| 用户意图 | 原子 Skill 组合 | 是否默认执行写操作 |
|---|---|---|
| 提交当前代码 | `intent-router → commit-generation` | 否，需确认 commit |
| 检查提交规范 | `intent-router → commit-generation`（批量模式） | 是，只读 |
| 创建、切换或删除分支 | `intent-router → branch-management` | 否，写操作需确认 |
| 分析分支健康 | `intent-router → branch-management`（分析模式） | 是，只读 |
| 分析提交历史 | `intent-router → history-analysis` | 是，只读 |
| 解决冲突 | `intent-router → conflict-resolution` | 否，修改和 checkout 需确认 |
| 查看或分析 stash | `intent-router → stash-management` | 是，只读 |
| 保存、恢复或删除 stash | `intent-router → stash-management` | 否，写操作需确认 |
| 管理版本和 Tag | `intent-router → version-management` | 否，创建、删除和 push 需确认 |

主 Skill 不要求每次执行全部原子 Skill。只选择与用户意图匹配的最小依赖闭包；`commit-spec-check` 能力已经并入 `commit-generation`。

## Commit 云图条件链路

当用户确认 commit 后，且项目根目录存在 `docs/project-cloud-map.md`，执行：

```text
commit-generation
  → cloud-map-sync
  → 确认最终 staged 文件范围
  → git commit
  → 重新读取 git status
```

云图不存在时静默跳过。云图读取、写入或暂存失败时阻塞 commit，避免代码提交与云图状态不一致。

## Commit Message

遵循 Conventional Commits：

```text
<type>(<scope>): <short description>

[body]

[footer]
```

支持的 type：`feat`、`fix`、`docs`、`style`、`refactor`、`test`、`chore`。

## 文件结构

```text
git-assistant/
├── SKILL.md
├── README.md
└── atomic-skills/
    ├── intent-router/          # Git 意图识别与路由
    ├── commit-generation/      # Commit 生成、验证和批量规范检查
    ├── branch-management/      # 分支操作和健康分析
    ├── conflict-resolution/    # 冲突检测、分析和解决指南
    ├── stash-management/       # Stash 管理和分析
    ├── history-analysis/       # Git 历史、作者和分支分析
    ├── version-management/     # Tag、semver 和 CHANGELOG
    └── cloud-map-sync/         # Commit 前云图条件同步
```

## 安全边界

- 删除分支、Tag 或 stash 前必须确认。
- 远程 push、强制操作和工作区切换前必须确认。
- 冲突解决只生成建议时不修改文件；`checkout --ours/--theirs` 必须确认。
- 不使用 `git add -A` 扩大未确认的暂存范围。
- 用户输入不能未经安全处理直接拼接到 Shell 命令。

## 完成校验

执行结束后必须检查：

1. 返回状态与实际结果一致；
2. 失败或未确认的操作没有被报告为成功；
3. 写操作后的 Git 状态已重新读取；
4. Commit 场景的最终 staged 范围已确认；
5. 输出中的文件、命令和分析结论均来自本次 Git 上下文。
