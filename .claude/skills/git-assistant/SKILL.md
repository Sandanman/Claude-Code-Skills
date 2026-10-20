---
name: git-assistant
description: |
  智能 Git 操作助手。当用户提到提交、分支、历史、冲突、stash、版本标签、提交规范或分支健康分析时触发。
---

# Git Assistant

## 核心定位

Git Assistant 负责识别 Git 操作意图、选择最小原子 Skill 组合、整合结果并在确认边界内执行操作。主 Skill 不直接承担各类 Git 业务逻辑；具体分析和操作由原子 Skill 完成。

## 原子 Skill

| Skill | 职责 | 路由方式 |
|---|---|---|
| `intent-router` | 识别用户意图并选择技能 | 每次进入时执行 |
| `commit-generation` | 生成 Conventional Commit、单条验证和批量检查 | `commit`、`spec-check` |
| `branch-management` | 分支操作和分支健康分析 | `branch`、`branch-health` |
| `history-analysis` | log、blame、作者和分支历史分析 | `history` |
| `conflict-resolution` | 冲突检测、ours/theirs 分析和解决指南 | `conflict` |
| `stash-management` | stash 的 list、show、save、apply、pop、drop 和分析 | `stash` |
| `version-management` | Tag、semver、版本建议和 CHANGELOG | `version` |
| `cloud-map-sync` | commit 前同步项目云图变更日志 | commit 确认后的条件链路 |

`commit-spec-check` 的能力已合并到 `commit-generation`，不再作为独立 Skill。`cloud-map-sync` 不由用户意图直接选择。

## 执行流程

### 1. 意图识别与路由

调用 `intent-router`，返回匹配意图、选择的原子 Skill、依赖顺序和未识别关键词。没有匹配结果时停止并请求用户明确 Git 操作，不猜测执行动作。

### 2. Git 上下文扫描

读取以下上下文并传给后续 Skill：

```text
git status --porcelain
git branch --show-current
git diff --staged --stat
git status --short --branch
```

### 3. 最小依赖闭包执行

主 Skill 不要求每次执行全部原子 Skill。根据意图选择最小组合，并保留依赖顺序：

```text
提交：intent-router → commit-generation
规范检查：intent-router → commit-generation（批量模式）
分支：intent-router → branch-management
历史：intent-router → history-analysis
冲突：intent-router → conflict-resolution
stash：intent-router → stash-management
版本：intent-router → version-management
```

多意图请求按用户输入中的操作顺序执行；涉及前置分析的操作必须等待前置结果。原子 Skill 缺少必需输入时暂停，不得用猜测内容补全。

### 4. 结果整合与确认

统一结果格式：

```yaml
status: passed | partial | failed | skipped
result: {}
issues: []
requires_confirmation: false
commands: []
```

以下操作必须在执行前展示计划、影响范围和命令，并获得用户确认：删除分支或 Tag、强制操作、远程 push、stash pop/drop/clean、切换工作区、解决冲突时 checkout ours/theirs，以及 commit。

只读分析（history、branch health、stash list/show、版本建议、提交规范检查）默认不需要确认。

### 5. Commit 条件链路

当 `commit-generation` 生成并通过用户确认后：

```text
commit-generation
  → 检查 docs/project-cloud-map.md
  → 存在时执行 cloud-map-sync
  → 展示最终 staged 文件范围并确认
  → git commit
  → 重新读取 git status 验证
```

`cloud-map-sync` 不存在云图时静默跳过；读取、写入或暂存云图失败时阻塞 commit，并返回失败原因。云图更新必须纳入最终 commit 范围确认。

## 输入契约

```yaml
user_input: string
options:
  intent: string | null
  target: string | null
  confirmation: boolean | null
  commit_range: string | null
```

## 输出契约

```yaml
status: passed | partial | failed | skipped
intent:
  action: string
  matched_intents: []
selected_skills: []
result: {}
commands: []
requires_confirmation: boolean
issues: []
verification:
  status: passed | partial | failed | not_run
  git_status: string | null
```

## 完成标准

1. 意图和 Git 上下文已记录，或明确记录读取失败原因。
2. 只执行与用户意图匹配的最小原子 Skill 组合。
3. 每个原子 Skill 的输入、输出、状态和问题均已保留。
4. 所有高风险或改变工作区的操作均在执行前完成确认。
5. Commit 场景已处理云图条件链路，并确认最终 staged 范围。
6. 执行后重新读取 Git 状态；只读场景已输出分析结果。
7. 未执行、失败或未确认的步骤不得报告为成功。

## 完成后校验

- 检查输出 `status` 与实际执行结果一致。
- 检查选中的 Skill 路径确实存在，禁止引用不存在的原子目录。
- 检查命令中的用户输入已安全处理，不能通过字符串拼接注入 Shell 参数。
- 检查 commit 后状态、云图暂存状态和提交范围。
- 检查报告内容只来自本次 Git 扫描，不使用虚构数据。

## 安全规则

- 不自动执行破坏性、远程或不可逆操作。
- 不使用 `git add -A` 扩大用户未确认的暂存范围；只操作明确文件。
- 不把用户输入直接拼接到 Shell 命令；应使用参数化调用或安全转义。
- 冲突解决只生成建议时不修改文件；实际修改必须由用户明确确认。

## 版本历史

- v1.2 (2026-10-20)：去除专属运行机制，合并提交规范检查能力，新增云图条件链路。
- v1.1 (2026-06-03)：整合分支健康、提交规范、冲突分析和版本管理能力。
