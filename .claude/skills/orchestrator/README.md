# Orchestrator

`orchestrator` 是统一任务编排入口，负责将用户请求转换为可执行任务，并在执行过程中维护状态、日志、共享上下文和归档结果。

## 核心流程

```text
用户输入
  ↓
意图识别与复杂度判断
  ↓
统一编排流程
  ↓
历史任务检索
  ↓
主 Skill 匹配
  ↓
读取匹配主 Skill 的 SKILL.md
  ↓
DAG、拓扑排序与并行层识别
  ↓
原子 Skill 执行
  ↓
任务恢复与状态同步
  ↓
结果校验
  ↓
结果输出
  ↓
任务归档
```

## 目录结构

```text
orchestrator/
├── SKILL.md                              # 主调度流程
├── algorithms.md                         # 通用调度算法
├── config.md                             # 通用编排配置
├── technical_implementation.md           # 技术实现示例
├── skills_register.md                     # 原子 Skill 注册表
└── atomic-skills/
    ├── intent-recognition/SKILL.md       # 结构化意图识别
    ├── skill-matcher/SKILL.md             # 主 Skill 匹配
    ├── task-generator/SKILL.md            # DAG 与任务文件生成
    ├── execution-controller/SKILL.md      # 执行、状态和错误控制
    ├── result-validator/SKILL.md         # 结果校验与反思
    └── task-archiver/SKILL.md             # 任务归档与月度索引
```

## 复杂度策略

复杂度评分只用于选择执行策略，不再切换不同的编排实现：

- `complexity_score < 4`：采用轻量执行策略，仍执行统一编排流程。
- `complexity_score >= 4`：采用完整执行策略，仍执行统一编排流程。

两种策略共享相同的任务依赖、执行状态、结果校验和归档规则。

## 关键行为

### 主 Skill 加载

主 Skill 注册表只提供匹配元数据。确定主 Skill 后，必须读取对应的 `SKILL.md`，解析原子 Skill 列表、依赖和执行规则，再生成任务。

### DAG 与并行执行

任务生成阶段会检查缺失依赖和循环依赖，使用稳定拓扑排序生成执行顺序，并识别可并行执行的任务层。

### 状态持久化

任务状态写入 `tasks/current/task_skill.md`，记录原子 Skill 状态、执行日志、错误日志和共享上下文。任务中断后可从该文件恢复。

### 共享上下文

上游 Skill 的核心输出写入任务文件，下游 Skill 优先读取对应区域，避免重复解析项目文件：

```markdown
<!-- atomic-skill: skill-name -->
核心输出
<!-- /atomic-skill: skill-name -->
```

### 错误处理

低影响错误允许独立分支继续执行；高影响错误暂停任务并保留恢复状态；可重试错误按有限次数重试。

### 结果校验与归档

结果校验逐项检查完成标准，计算偏差并执行最多 3 次反思。完成或失败后，将任务文件移动到 `tasks/history/YYYY-MM/`，并更新月度索引。

## 相关文件

- `.claude/skills/orchestrator/SKILL.md`：简单任务的轻量流程
- `.claude/skills/orchestrator/skills_register.md`：原子 Skill 注册和依赖
- `.claude/skills/tasks/templates/task_skill_template.md`：任务文件模板
- `.claude/skills/tasks/current/task_skill.md`：当前任务状态
- `.claude/skills/tasks/history/`：历史任务归档
