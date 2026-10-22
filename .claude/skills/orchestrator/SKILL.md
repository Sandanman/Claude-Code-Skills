---
name: orchestrator
description: 统一任务编排入口，按复杂度执行意图识别、技能匹配、任务规划、执行、校验、输出和归档
impl_status: action_based
---

# Orchestrator

## 1. 核心定位

`orchestrator` 是任务编排的统一入口，负责将用户请求转换为可执行任务，并持续保存任务状态。它提供 Fast Path 与 Durable Path 两种执行路径，共享意图、匹配、结果和安全协议，但按任务风险和状态需求裁剪执行步骤。

核心链路：

```text
用户输入
  ↓
意图识别与路由判定
  ├── Fast Path
  │     ↓
  │   主 Skill 匹配与读取 → 执行 → L0 校验 → 输出
  │
  └── Durable Path
        ↓
      主 Skill 匹配与读取 → 按需历史检索 → DAG/任务状态
        → 原子 Skill 执行 → L1/L2 校验 → 输出 → 归档
```

主 Skill 确定后，执行流程必须输出主 Skill 的可观测性信息，包括匹配关键词、匹配分数、选择理由、声明依赖和执行路径。

## 2. 执行路径

复杂度评分只作为路由输入，不能单独决定安全级别。编排器先判断 `confidence`、`risk_level`、`statefulness`、`ambiguity` 和 `requires_confirmation`，再选择执行路径。

### Fast Path

适用于明确、单一、低风险、单主 Skill、无恢复需求的任务：

```text
意图识别 → 主 Skill 匹配 → 读取选中 Skill → 执行 → 基础校验 → 输出
```

Fast Path 默认跳过历史检索、完整 DAG、完整任务模板、反思循环和月度归档，不创建完整 `tasks/current/task_skill.md`。仍必须执行主 Skill 的最低完成标准和安全检查。

### Durable Path

以下情况必须使用 Durable Path：多主 Skill、依赖或多步骤、低置信度、匹配歧义、需要用户确认、跨步骤共享上下文、需要暂停/恢复、重试、高风险写操作或不可逆副作用。

Durable Path 保留历史检索、DAG、任务状态、错误恢复、分级校验和归档能力。Fast Path 执行中一旦触发上述条件，只能单向升级为 Durable Path，并保留已有意图、匹配结果和执行上下文。

两条路径共享意图、匹配、结果和安全协议，但不强制执行相同的步骤集合。

## 3. 步骤 1：意图识别与复杂度判断

输入用户原始请求，读取项目上下文（如存在）和主 Skill 注册表，生成结构化意图：

- `domain`
- `action`
- `target`
- `constraints`
- `keywords`
- `success_criteria`
- `complexity_assessment`
- `confidence`
- `risk_level`
- `statefulness`
- `ambiguity`
- `requires_confirmation`

路由规则：

1. `confidence` 不足、存在匹配歧义或需要确认时进入 Durable Path。
2. 涉及删除、覆盖、部署、权限、凭证、Git 写操作、数据迁移或外部系统写入时进入 Durable Path。
3. 仅当复杂度不高、单主 Skill、无依赖、低风险、无恢复需求时进入 Fast Path。
4. 旧版 Skill 未声明新的安全元数据时，默认进入 Durable Path。

明确需求且只匹配一个低风险 Skill 时，不重复执行完整意图澄清。

## 4. 步骤 2：按需历史任务检索

仅在 Durable Path 且满足以下条件之一时检索历史：用户明确要求参考历史、需要恢复任务、需要复用历史执行模式或需要估算/迁移参考。Fast Path 默认跳过历史检索。

历史结果只用于提供上下文和参考，不直接跳过当前任务的必要校验。

## 5. 步骤 3：主 Skill 匹配

综合比较 `domain`、`action`、`keywords`、目标类型、触发关键词和能力描述，输出候选列表、匹配分数和选择理由。

处理分支：

- 无匹配：记录 `missing_skills.md`，尝试自主执行；无法执行时向用户说明原因和可行的重试方式。
- 单匹配且置信度足够：直接选择唯一候选，不重复澄清。
- 多匹配或分数接近：展示必要候选并请求用户选择。

确定主 Skill 后，立即在控制台输出选择结果，格式固定为：

```text
主 Skill：{skill-name}
匹配关键词：{matched_keywords}
匹配分数：{match_score}
选择理由：{selection_reason}
声明依赖：{dependencies}
执行路径：{route_mode}
```

字段要求：

- `match_score` 使用 `0-1` 范围的小数，保留 3 位；无法计算时输出 `unknown`，不得臆造分数。
- `selection_reason` 必须说明匹配到的用户意图、关键能力或唯一/最高分选择依据。
- `dependencies` 输出主 Skill 声明的直接依赖；无依赖时输出 `[]`。
- `route_mode` 输出 `fast` 或 `durable`。路由升级时追加 `升级原因`。

随后只读取选中 Skill 的 `SKILL.md` 及其声明的依赖，并缓存已读取内容。未注册 Skill 不允许执行。

## 6. 步骤 4：按路径生成任务

Fast Path 只检查选中 Skill 是否存在依赖，不生成完整 DAG 或任务文件。发现依赖、第二个 Skill、确认节点、重试需求或跨步骤上下文时，升级为 Durable Path。

Durable Path 执行：

1. 检查依赖是否存在。
2. 检测循环依赖。
3. 使用稳定的拓扑排序生成执行顺序。
4. 识别计划层；计划层不代表实际并行。
5. 生成唯一任务 ID。
6. 创建 `tasks/current/task_skill_{任务ID}.md`，兼容读取旧的 `tasks/current/task_skill.md`。

循环依赖、缺失依赖或多个活动任务应在执行前返回明确错误，不覆盖已有任务。

## 7. 步骤 5：执行控制

Fast Path 直接执行唯一低风险目标，不默认重试或持久化。Durable Path 按依赖和执行模式执行原子 Skill，默认 `serial_by_default`。

每个 Durable 原子 Skill 开始前更新状态为“执行中”，并输出开始事件。成功时写入结果和共享上下文；失败时记录影响等级。需要重试、暂停、恢复、跨步骤共享上下文或发生高影响错误时，保持 Durable 状态。

共享上下文格式：

```markdown
<!-- atomic-skill: skill-name -->
核心输出
<!-- /atomic-skill: skill-name -->
```

## 8. 步骤 6：任务恢复

Durable Path 发现任务状态时，读取任务 ID、路由模式、依赖、已完成结果、错误日志、校验级别和共享上下文。已完成的 Skill 不重复执行；`待恢复` Skill 先验证已有输出和外部副作用，再决定是否重试。

旧的 `tasks/current/task_skill.md` 仅作为兼容读取来源。发现多个活动任务时不得自动覆盖或忽略，必须精确选择。恢复时不得覆盖已有结果或错误记录。

## 9. 步骤 7：分级结果校验

- Fast Path 使用 `L0`：检查输出存在、非空、无明显错误并满足最低完成标准。
- Durable Path 使用 `L1`：逐项验证主 Skill 和原子 Skill 完成标准，必要时计算有明确依据的偏差。
- `L2` 仅在 L1 失败、高风险或用户要求时触发反思，默认不主动反思，触发后最多 3 次。

没有量化目标时偏差标记为“不适用”，不强行计算。校验结果必须说明 `passed`、未通过项、风险备注、是否需要恢复、反思次数和下一步。

## 10. 步骤 8：结果输出

输出执行摘要，至少包含：

- 主 Skill 可观测性：`main_skill`、`matched_keywords`、`match_score`、`selection_reason`、`dependencies`
- 执行路径：`route_mode`、是否持久化和校验级别
- 任务 ID（Durable Path）或主 Skill
- 原子 Skill 执行状态
- 关键产出
- 校验结论、未通过项和偏差（如适用）
- 失败、升级、重试或暂停信息

固定摘要格式：

```text
主 Skill：{main_skill}
匹配关键词：{matched_keywords}
匹配分数：{match_score}
选择理由：{selection_reason}
声明依赖：{dependencies}
执行路径：{route_mode}
是否持久化：{persisted}
校验级别：{validation_level}
任务 ID：{task_id 或 N/A}
状态：{status}
```

无匹配、校验失败或安全升级时，明确说明当前状态和用户下一步。

## 11. 步骤 9：按需归档

仅 Durable Path 在终态（“已完成”或“失败”）后调用 `task-archiver`：

1. 按任务 ID 将 `tasks/current/task_skill_{任务ID}.md` 移动到 `tasks/history/YYYY-MM/task_skill_{任务ID}.md`。
2. 更新或创建当月任务索引。
3. 保留执行摘要、校验结果、错误日志和共享上下文。
4. 验证本次任务的历史文件和索引，不要求当前目录全局为空。

Fast Path 不归档。归档失败时保留原任务文件和最终结果。

## 12. 原子 Skill 注册

当前通用原子 Skill：

- `intent-recognition`
- `skill-matcher`
- `task-generator`
- `execution-controller`
- `result-validator`
- `task-archiver`

注册、依赖和执行顺序以 `skills_register.md` 为准。

## 13. 完成标准

- 统一流程覆盖简单和复杂任务，并根据复杂度选择执行策略。
- 匹配主 Skill 后已读取对应 `SKILL.md`。
- 依赖、并行层、状态、日志、错误和共享上下文持续可恢复。
- 结果校验包含明确结论、偏差和有限反思记录。
- 任务文件被完整归档，月度索引可恢复任务结果。
