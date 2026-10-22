# Orchestrator

`orchestrator` 是统一任务编排入口，负责将用户请求转换为可执行任务，并根据明确度、风险和状态需求选择最小执行路径。

## 核心流程

```text
用户输入
  ↓
意图识别与路由判定
  ├── Fast Path：明确、单一、低风险
  └── Durable Path：复杂、含状态或高风险
        ↓
读取必要 Skill 与依赖
  ↓
按路径执行
  ↓
分级校验
  ↓
输出结果
  ↓
Durable Path 按需归档
```

## 路径选择

### Fast Path

适用于高置信度、单主 Skill、复杂度不超过 3、无依赖、低风险、无需确认、无需恢复的任务。

Fast Path 只执行：

1. 一次意图识别和主 Skill 匹配。
2. 读取选中的主 Skill 及明确声明的必要依赖。
3. 执行主 Skill 的最小步骤。
4. 执行 L0 基础校验。
5. 输出结果，不创建完整任务文件、不检索历史、不执行反思和月度归档。

### Durable Path

以下任务必须进入 Durable Path：多 Skill、多步骤依赖、低置信度、匹配歧义、需要用户确认、跨步骤共享上下文、重试、暂停/恢复、删除/覆盖/部署/权限/凭证、Git 写操作、数据迁移或外部系统写入。

Durable Path 执行完整的任务状态、依赖 DAG、错误恢复、L1 校验、按需历史检索和归档流程。Fast Path 执行中触发上述条件时，只能升级为 Durable Path，并保留已完成上下文。

两条路径共享意图、匹配、输出和安全协议，但不强制执行相同步骤集合。

## 上下文读取原则

- 匹配前只读取用户输入和主 Skill 注册元数据。
- 匹配后只读取选中的 `SKILL.md` 及其声明的依赖。
- Fast Path 不读取无关 Skill、历史正文、任务模板和完整原子注册表。
- Durable Path 只在恢复、用户要求或需要复用执行模式时检索历史。
- 同一任务已读取的文件直接复用，不重复读取。

## 主 Skill 可观测性

确定主 Skill 后，Orchestrator 必须立即输出固定选择信息：

```text
主 Skill：{main_skill}
匹配关键词：{matched_keywords}
匹配分数：{match_score}
选择理由：{selection_reason}
声明依赖：{dependencies}
执行路径：{route_mode}
```

最终摘要继续保留这些字段，并补充：

```text
是否持久化：{persisted}
校验级别：{validation_level}
任务 ID：{task_id 或 N/A}
状态：{status}
```

`match_score` 为 `0-1` 范围、保留 3 位的小数；无法可靠计算时输出 `unknown`。`selection_reason` 必须说明用户意图与 Skill 能力的对应关系，或说明唯一/最高分选择依据。无依赖时 `dependencies` 输出 `[]`。Fast → Durable 升级时保留原选择信息，并追加升级原因，不得重新匹配或覆盖原始选择记录。


## 主 Skill 加载

主 Skill 注册表只提供匹配元数据。确定主 Skill 后，必须读取对应的 `SKILL.md`，解析原子 Skill、依赖和执行规则。未注册 Skill 不允许执行。


Durable Path 检查缺失依赖和循环依赖，使用稳定拓扑排序识别计划层。`parallel_layers` 仅表示计划层，当前默认 `execution_mode: serial_by_default`，不将计划并行描述为实际并行。

## 状态持久化

Fast Path 默认不创建完整任务状态。Durable Path 使用任务 ID 隔离的状态文件；仍兼容读取旧的 `tasks/current/task_skill.md`。发现多个活动任务时不得覆盖或自动选择，必须精确恢复或请求用户选择。

## 校验与归档

- `L0`：输出存在、非空、无明显错误并满足最低标准。
- `L1`：逐项验证 Durable 任务的完成标准，必要时计算偏差。
- `L2`：仅在 L1 失败、高风险或用户要求时触发反思，默认不主动反思。

只有 Durable Path 归档。归档失败时保留原任务文件和最终结果；历史结果只能作为参考，不能替代当前校验。

## 安全边界

以下情况禁止 Fast Path：低置信度、匹配接近、需要确认、不可逆修改、敏感配置、权限或外部系统副作用。安全判断优先于复杂度评分，旧版 Skill 未声明新安全元数据时按 Durable Path 处理。
