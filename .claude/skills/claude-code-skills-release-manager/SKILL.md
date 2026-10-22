---
name: claude-code-skills-release-manager
description: 仅针对当前 Claude-Code-Skills 项目管理版本文档与版本归档，协调版本管理和 ZIP 归档两个原子 Skill；写入或归档前必须获得用户确认。
impl_status: action_based
---

# Claude Code Skills Release Manager

## 1. 核心定位

本 Skill 是当前 `Claude-Code-Skills` 项目的统一版本发布入口，组合两个原子 Skill：

- `version-management`：读取和更新项目版本文档。
- `archive-generation`：按已确认版本复制项目资源并生成 ZIP 归档。

它只服务当前项目，不是通用的版本管理、备份或 Git 发布工具。

## 2. 原子 Skill

| 原子 Skill | 职责 | 触发条件 |
| --- | --- | --- |
| `version-management` | 读取 `.claude/skills/README.md` 版本、建议版本号、生成修改描述、更新 `README.md` 和 `VERSION.md` | 版本检查、版本更新、版本记录 |
| `archive-generation` | 读取已确认版本、复制指定资源、创建版本目录、生成 ZIP 并移动到 `.claude/history` | 项目归档、版本 ZIP、Skills 打包 |

默认流程为：

```text
version-management → 用户确认版本 → archive-generation → 用户确认归档
```

只请求版本管理时，不执行归档；只请求归档时，仍须读取版本基线并确认版本文档状态。

## 3. 职责边界

### 负责

- 当前项目的版本基线读取和版本文档维护。
- 按确认版本创建项目归档目录和 ZIP。
- 版本文档与归档内容的一致性校验。
- 展示写入、复制、压缩和移动操作的影响范围。

### 不负责

- Git commit、Tag、push、branch、stash、Merge、Rebase 或冲突处理。
- 通用项目的 semver、CHANGELOG 或备份。
- 自动执行版本更新或归档。
- 删除源文件、覆盖已有归档或修改 `.claude/settings.local.json` 内容。

Git 操作交给 `git-assistant` 处理。

## 4. 统一执行流程

### 4.1 识别意图

将请求分类为：

- `version-only`：仅检查或更新版本文档。
- `archive-only`：按当前已确认版本生成归档。
- `release`：先完成版本管理，再执行归档。
- `create-skill`：创建或更新本 Skill；只修改 Skill 定义和注册，不执行版本或归档操作。

### 4.2 版本管理

调用 `version-management` 时：

1. 读取 `.claude/skills/README.md` 和 `VERSION.md`。
2. 校验 `v.大版本号.小版本.小修改` 格式。
3. 比较用户输入版本与当前最新版本：低于时请求明确确认，等于时仅更新当前版本描述，高于时新增版本。
4. 默认将小修改位加 1，用户输入的合法版本优先。
5. 总结当前修改并生成不超过 30 字的描述。
5. 写入 `.claude/skills/README.md` 和 `VERSION.md` 前展示预览并请求确认。
6. 更新后校验两个文件的版本号和描述一致。

如果版本基线不一致、目标文件已有未提交修改或版本无效，暂停并报告，不得静默覆盖。

### 4.3 项目归档

调用 `archive-generation` 时，读取 `.claude/skills/README.md` 中已确认的版本号，并确认以下源路径存在：

```text
.claude/rules
.claude/skills
.claude/project_context.json
.claude/settings.json
.claude/settings.local.json
.claude/skills/README.md
```

将它们复制到以版本号命名的目录，避免重复复制 `.claude/skills/README.md`，再生成同名 ZIP 并移动到 `.claude/history/<version>.zip`；确认 ZIP 移动成功且内容校验通过后，删除压缩前创建的版本目录。归档前必须展示目标和覆盖风险，并获得用户确认。

创建本主 Skill 或原子 Skill 时，不运行上述复制、压缩和移动流程。

## 5. 安全规则

- 所有版本文档写入、目录创建、复制、压缩和移动操作必须先确认。
- 不覆盖已存在的版本目录或 ZIP；如目标已存在，暂停并请求用户选择。
- 不修改 `.claude/settings.local.json` 内容，它仅作为归档输入。
- 不执行 `git add`、`git commit`、`git tag`、`git push`、`reset`、`restore` 或 `stash`。
- 版本号必须经过格式校验后才能参与路径构造。
- 不生成虚假提交 hash、测试结果或归档结果。

## 6. 输出契约

```yaml
status: passed | partial | failed | skipped
result: {}
issues: []
requires_confirmation: false
selected_atomic_skills: []
verification:
  status: passed | partial | failed | not_run
```

最终报告包含：意图分类、选中的原子 Skill、版本号、修改或归档路径、确认状态、校验结果和未执行步骤。创建 Skill 阶段必须明确版本更新和归档均为 `not_run`。

## 7. 完成标准

- 主 Skill 和两个原子 Skill 的名称、路径和注册信息一致。
- 版本管理与归档职责没有重复或越界。
- 版本管理仅在确认后更新文档。
- 归档仅在确认后复制、压缩和移动；ZIP 校验通过后删除本次创建的临时版本目录。
- 归档 ZIP 位于 `.claude/history/<version>.zip`，且内容校验通过。
- 未确认、失败或未执行的步骤没有被报告为成功。

## 8. 版本历史

- v1.0（2026-10-22）：合并项目版本管理和归档能力，拆分为两个原子 Skill。
