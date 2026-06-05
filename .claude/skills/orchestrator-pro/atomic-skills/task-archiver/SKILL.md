---
name: task-archiver
description: 任务归档（τ 增强版）— 归档 task_skill.md + 更新月度索引 + Pattern 存储 + 可固化文档提示
impl_status: action_based
---

# Task Archiver 原子 Skill（τ 增强版，action_based）

> **角色**：task-archiver 由 orchestrator-pro 在步骤 9 调用，执行任务归档操作。
> 本文件为行为规则（action_based），不包含伪代码，所有操作均可由 Reasoner 直接执行。
> 依据：skill-design.md 步骤 9；`.claude/rules/task-folding.mdc` fold-life-009/010/011。

## 版本历史
- v1.1 (2026-06-05): 从 `design_spec` 改为 `action_based`，所有伪代码替换为显式行为规则
- v1.0 (2026-06-02): 基于 v1.2 增强，增加 Pattern 模式存储

---

## 1. 核心定位

**Task Archiver** 是任务生命周期的最后一步，负责：
1. 将 `tasks/current/task_skill.md` 归档至 `tasks/history/YYYY-MM/`
2. 更新或创建当月任务索引文件
3. 提示用户迁移可固化文档
4. 存储执行模式至 Pattern 库（τ 增强）

**触发时机**：orchestrator-pro 步骤 9，所有原子 skill 执行完毕且结果校验通过后。

---

## 2. 归档前置条件检查

在执行归档前，Reasoner 必须确认以下条件：

```
归档前置检查：
1. Read tasks/current/task_skill.md
2. 确认"当前状态"字段为"已完成"或"失败"（不允许对"执行中"任务归档）
3. 如果状态为"执行中"或"待执行"：
   → 输出警告："当前任务尚未完成，仍在执行中，不执行归档"
   → 中止归档，提示用户先完成任务或手动选择归档
4. 确认当前任务有有效的任务ID（YYYYMMDD_HHMMSS 格式）
5. 确认归档路径格式：tasks/history/{YYYY-MM}/task_skill_{任务ID}.md
```

---

## 3. 归档操作序列（必须按顺序执行）

### 步骤 A：创建历史目录

```
# 如果 tasks/history/YYYY-MM/ 不存在，则创建
Bash mkdir -p .claude/skills/tasks/history/{YYYY-MM}/
```

**示例**：
```bash
mkdir -p .claude/skills/tasks/history/2026-06/
```

---

### 步骤 B：移动 task_skill.md

```
Bash mv .claude/skills/tasks/current/task_skill.md \
        .claude/skills/tasks/history/{YYYY-MM}/task_skill_{任务ID}.md
```

**示例**：
```bash
mv .claude/skills/tasks/current/task_skill.md \
   .claude/skills/tasks/history/2026-06/task_skill_20260605_143022.md
```

---

### 步骤 C：更新或创建月度任务索引

```
# 判断月度索引是否存在
if tasks/history/YYYY-MM/月度任务索引.md 存在：
    Read tasks/history/YYYY-MM/月度任务索引.md
    Edit 在文件末尾追加新任务条目（见下方格式）
    Write tasks/history/YYYY-MM/月度任务索引.md

else：
    Read .claude/skills/tasks/templates/月度任务索引模版.md
    Write tasks/history/YYYY-MM/月度任务索引.md
```

**月度任务索引条目格式**（追加到现有索引末尾）：
```markdown
## task_skill_{任务ID}

| 字段 | 值 |
|------|-----|
| 任务ID | {任务ID} |
| 用户意图 | {原始输入（最多100字）} |
| 最终目标 | {目标（最多100字）} |
| 归属主skill | {主skill名称} |
| 创建时间 | {YYYY-MM-DD HH:MM:SS} |
| 完成时间 | {YYYY-MM-DD HH:MM:SS} |
| 执行摘要 | {1-2句话描述核心产出} |
| 归档时间 | {YYYY-MM-DD HH:MM:SS} |

### 可固化文档
| 文件名 | 绝对路径 | 文档类型 | 生成时间 |
|--------|---------|---------|---------|
| {文件名1} | {绝对路径1} | {文档类型1} | {时间1} |
| {文件名2} | {绝对路径2} | {文档类型2} | {时间2} |

> 固化文档路径已永久保存于 `tasks/history/YYYY-MM/task_skill_{任务ID}.md → 最终结果汇总 → 可固化文档`
> 后续任务需要时可直接读取该归档文件获取固化文档路径
```

---

### 步骤 D：检查可固化文档

```
# Read 当前（或归档前）的 task_skill.md，查找以下类型的可固化文档
固化文档类型：
- CODE_STYLE.md（代码规范文档）
- .env.example（环境变量示例）
- docker-compose.yml.override（Docker 配置）
- .editorconfig / .prettierrc 等配置文件

if 检测到固化文档：
    # 【固化文件路径记录】必须写入 task_skill.md（归档前完成）
    # 依据：.claude/rules/task-folding.mdc fold-life-010b / fold-life-010c
    Read tasks/current/task_skill.md
    Edit 在 "## 最终结果汇总" 区域追加或更新：
    ### 可固化文档
    | 文件名 | 绝对路径 | 文档类型 | 生成时间 |
    |--------|---------|---------|---------|
    | {文件名1} | {绝对路径1} | {文档类型1} | {时间1} |
    | {文件名2} | {绝对路径2} | {文档类型2} | {时间2} |
    Write tasks/current/task_skill.md
    # → 固化文件路径已保存，可在归档后的 task_skill_{ID}.md 中永久读取

    # 用户提示（可选）
    输出提示：
    "📁 可固化文档已检测到，请手动移至项目目录："
    "- {文件路径}（{文档类型}）"
    "💡 固化文档路径已记录在 tasks/history/YYYY-MM/task_skill_{ID}.md → 最终结果汇总 → 可固化文档"
else：
    不输出提示，继续执行
```

---

### 步骤 E：Pattern 模式存储（τ 增强，可选）

```
# 仅当任务成功（all_passed=True）且偏差 < 0.2 时执行
if validation_report.all_passed AND deviation < 0.2：
    # 提取 Pattern 特征
    features = {
        "domain_action": "{intent.domain}_{intent.action}",
        "skill_sequence": [原子skill_1, 原子skill_2, ...],
        "complexity_band": "{low/mid/high}",
        "tau_budget": {actual_consumed},
    }

    # 判断 Pattern 库路径
    category = "{domain}-{action}"
    pattern_dir = ".claude/skills/patterns/{category}/"

    if pattern_dir 存在：
        Write .claude/skills/patterns/{category}/{pattern_id}.md
        输出："🧠 Pattern 已存储：{category}/{pattern_id}.md"
    else：
        Bash mkdir -p .claude/skills/patterns/{category}/
        Write .claude/skills/patterns/{category}/{pattern_id}.md
```

**Pattern 文件格式**：
```markdown
# Pattern: {pattern_id}

**类别**: {category}
**成熟度**: experimental（首次）/ growing（≥2次）/ mature（≥5次）
**验证次数**: {count}
**τ 折扣**: {discount}%
**最后使用**: {YYYY-MM-DD}

## 触发条件
- domain: {domain}
- action: {action}
- complexity_band: {low/mid/high}

## 执行步骤
{skill_sequence}

## τ 收益
- 本次 τ 消耗：{actual}
- 预算：{budget}
- 效率：{efficiency}%
```

---

## 4. 归档后验证

```
归档完成后，Reasoner 必须确认：
1. tasks/current/task_skill.md 不再存在（已移走）
2. tasks/history/YYYY-MM/task_skill_{任务ID}.md 存在
3. tasks/history/YYYY-MM/月度任务索引.md 已更新（包含新条目）
4. current/ 目录为空（或仅有锁文件）
```

**归档失败处理**：
```
if 归档过程中出现错误（如目录权限问题）：
    → 输出错误信息，说明具体失败原因
    → 提示用户手动归档：
      "- 将 tasks/current/task_skill.md 手动移动到 tasks/history/{YYYY-MM}/"
      "- 手动更新 tasks/history/{YYYY-MM}/月度任务索引.md"
    → 记录错误到当前会话，不阻塞任务输出
```

---

## 5. 继承自 v1.2 的完整逻辑

v1.2 的所有功能（按月归档、更新索引、可固化文档检测）完全保留，已融入上方显式操作步骤。

---

**版本**: 1.1
**最后更新**: 2026-06-05
**维护者**: 项目团队
**状态**: action_based（行为规则，可由 Reasoner 直接执行）