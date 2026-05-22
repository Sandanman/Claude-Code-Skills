---
name: orchestrator
description: Orchestrator Skill - Reasoner 调度器，负责理解用户意图、匹配主skill、协调任务执行、管理错误处理和任务归档。是整个skill系统的总控Reasoner，所有项目或者代码相关的任务都需要优先通过它来驱动。
reasoner_instructions: |
  EXECUTE FULL ORCHESTRATOR WORKFLOW: parse intent → retrieve history → match skill → generate task → execute atomic steps → archive → update index. DO NOT SKIP ANY STEP.
---
---

# Orchestrator Skill - Reasoner 调度器

## 概述

Orchestrator 是整个 skill 系统的总控 Reasoner，负责理解用户意图、匹配主skill、协调任务执行、管理错误处理和任务归档。它是唯一的总调度器，所有任务都通过它来驱动。

## ⚡ 执行入口指令

**【重要】当此 Skill 被调用时，Reasoner 必须立即按以下步骤执行：**

1. **接收用户输入**：获取用户的原始请求内容
2. **执行意图识别**（跳转至"核心职责 → 1. 意图识别与目标推理"）
3. **按照流程依次执行**所有步骤，直到任务完成
4. **禁止跳过任何步骤**，必须完整执行流程
5. **确保所有文件操作完成**：
   - 生成 `tasks/current/task_skill.md`
   - 更新 `missing_skills.md`（如需要）
   - 归档任务到 `tasks/history/YYYY-MM/`
   - 更新月度索引 `月度任务索引.md`

**现在就开始执行！**

---

## 核心职责

### 1. 意图识别与目标推理（LLM驱动）

**【重要变更】**：意图识别优先使用 LLM 驱动方案，规则算法仅作为 fallback。

- **输入解析**：构造 LLM Prompt，对用户输入进行深度语义分析
- **复杂度判断**：LLM 自主判断目标复杂度（简单目标 vs 复杂目标）
  - 简单目标：无需多原子技能、无需保存状态 → 直接自主输出结果【end】
  - 复杂目标：需要多步执行 → 压缩生成结构化意图，进入执行流程
- **意图压缩**：LLM 生成结构化意图 JSON（包含 domain、action、target、keywords、约束等）
- **置信度评估**：LLM 输出置信度，低于阈值（默认0.6）时提示用户确认
- **Fallback机制**：LLM 调用失败或解析错误时，自动切换到规则算法

**【执行时按需读取】**
```
读取文件1：.claude/skills/orchestrator/algorithms.md
读取章节：第1.5节 - LLM意图识别（新）
读取内容：Prompt模板、LLM调用代码、置信度评估、fallback机制

读取文件2：.claude/skills/orchestrator/config.md
读取章节：第0节 - LLM意图识别配置
读取内容：模型选择、置信度阈值、重试配置

读取文件3：.claude/skills/orchestrator/skills_register.md
读取章节：主技能列表
读取内容：已注册的主技能（用于LLM Prompt上下文）

读取文件4：.claude/skills/tasks/current/project_context.json（如存在）
读取章节：项目上下文
读取内容：项目技术栈、框架、配置（用于LLM理解背景）
用途：提供项目背景信息，提升意图识别准确性
```

**【执行流程】**
```
用户原始输入
    ↓
读取已注册主技能列表 + 项目上下文（如有）
    ↓
构造 LLM Intent Prompt（系统提示词 + 用户输入 + 上下文）
    ↓
调用 LLM（使用 config.md 配置参数）
    ↓
解析 LLM 返回的结构化意图 JSON
    ↓ 解析成功 & 置信度 ≥ 0.6
✅ 进入执行流程（复杂目标）或直接执行（简单目标）
    ↓ 解析失败 或 置信度 < 0.6
⚠️ 提示用户确认意图 / 切换规则算法 fallback
```

### 2. 历史意图检索

#### 2.1 特征提取与检索
- 对明确意图进行特征提取
- 检索历史任务索引（不遍历全量历史文件）
- 召回 Top3~5 最相关历史任务
- 计算相似度，判断是否 ≥ 阈值（默认0.85）

**【执行时按需读取】**
```
读取文件1：.claude/skills/orchestrator/algorithms.md
读取章节：第2节 - 历史意图检索算法
读取内容：特征提取方法、相似度计算公式、Jaccard相似度、召回策略

读取文件2：.claude/skills/orchestrator/config.md
读取章节：第1节 - 相似度与匹配配置
读取内容：相似度阈值(0.85)、特征权重配置、召回数量(Top3-5)
用途：获取匹配算法和阈值参数
```

#### 2.2 高度相似历史记录处理
若存在高度相似且已完成的历史任务：
- 检索 `.skills/tasks/history/` 下对应任务文件
- 输出历史结果/结论
- 当前任务结束【end】

#### 2.3 未完成任务检查
若无高度相似历史记录：
- 检查 `.skills/tasks/current/` 下是否存在相关未完成任务
  - **存在**：提示用户选择（继续执行或开始新任务）
  - **不存在**：进入步骤3

### 3. 主skill匹配

读取 `.skills/orchestrator/skills_register.md` 中的主skill列表：
- **无匹配**：记录到 `missing_skills.md`，自主执行并输出结果【end】
- **多匹配**：提示用户选择使用哪个主skill
- **唯一匹配**：直接使用该主skill

将意图和目标传入所选主skill，进入步骤4。

**【执行时按需读取】**
```
读取文件1：.claude/skills/orchestrator/algorithms.md
读取章节：第3节 - 主skill匹配算法
读取内容：匹配分数计算、多skill组合逻辑、匹配合理性验证

读取文件2：.claude/skills/orchestrator/user_interaction.md
读取章节：D2 - 多skill匹配选择
读取内容：用户提示模板、选项格式、默认选择规则
用途：实现匹配逻辑和用户交互
```

### 4. 任务生成（与主skill协同）

主skill职责：
- 读取自身对应的原子skill（从 `skills_register.md` 中读取）
- 与Reasoner协同完成原子skill的选择、逻辑和依赖关系分析
- 确定执行顺序（注意：并行执行需遵循状态同步规则，同一时间仅允许一个原子skill写入task_skill.md）
- 依据模板 `.skills/tasks/templates/task_skill_template.md` 生成任务skill文件
- 将任务skill保存到 `.skills/tasks/current/task_skill.md`

任务skill必须包含：
- 任务基础信息（ID、意图、目标、主skill、状态等）
- 原子skill列表（含状态、依赖、完成标准）
- 主skill完成标准
- 执行日记模板
- 结果汇总区域
- 归档说明

**【执行时按需读取】**
```
读取文件1：.claude/skills/orchestrator/algorithms.md
读取章节：第4节 - 依赖关系分析算法
读取内容：DAG构建、循环依赖检测、拓扑排序(Kahn算法)、并行执行识别

读取文件2：.claude/skills/orchestrator/technical_implementation.md
读取章节：第1节(任务ID生成)、第2节(文件锁机制)、第3节(原子写入)
读取内容：任务ID生成算法、文件锁实现、原子写入流程

读取文件3：.claude/skills/orchestrator/config.md
读取章节：第4节(任务规模限制)、第6节(状态同步配置)
读取内容：最大原子skill数量、文件锁超时、并行执行限制
用途：生成符合规范的task_skill.md文件
```

### 5. 执行流程控制（流式输出）

Reasoner全程掌控执行：
- 按照 `task_skill.md` 中的顺序执行原子skill
- 实时更新子任务状态
- 每次状态变更都需更新文件
- **流式输出**：每个阶段实时输出进度，用户无需等待所有步骤完成
- 不符合完成标准或出错的原子skill允许重试（最多3次）
- **Token 追踪**：每次 LLM 调用后调用 `TokenTracker.record_skill_usage()`，实时记录 token 消耗（详见 `technical_implementation.md` 第11节、`config.md` 第0.6节）

**【流式输出时机】**

```
任务开始 → skill_start → skill_success/fail → ... → task_summary
              ↓              ↓
         skill_start → skill_success/fail
              ↓              ↓
         skill_start → skill_success/fail → validation...
```

每个原子skill执行时，输出以下流式消息（按顺序）：

| 时机 | 消息类型 | 示例输出 |
|------|---------|---------|
| 任务开始 | 🚀 | `🚀 任务开始 \| 20260521_123456`<br>`   主技能: bug-solver, 共6个原子技能`<br>`   复杂度: 🟡 一般 (score=5/10)` |
| skill开始 | ⚡ | `⚡ 执行 1/6`<br>`   技能: bug-identification`<br>`   进度: [▓▓▓▓░░░░░░░░░░░░] 16% (剩余5个)` |
| skill成功 | ✅ | `✅ bug-identification 完成`<br>`   耗时: 3.2秒 \| 剩余: 5 个技能`<br>`   💰 token: +12,450 \| 成本: $0.19` |
| skill失败 | ❌/⚠️ | `⚠️ code-analysis 失败（第1/3次重试）`<br>`   错误: [截取前100字符]`<br>`   💰 token: +8,230 \| 成本: $0.12` |
| LLM调用（单次） | 💰 | `💰 LLM调用: intent_recognition, 消耗 1,245 token, 成本 $0.023` |
| 预算预警 | ⚠️ | `⚠️ Token 消耗预警：任务已消耗 80% 预算`<br>`   已用: 160,000 / 200,000 token \| 成本: $2.40` |
| 校验 | 🔍 | `🔍 校验进度: 2/5 - 代码规范检查` |
| 反思 | 💭 | `💭 反思重规划 (1/3)` |
| 任务总结 | 📋 | `✅ 任务完成 \| 耗时: 2分14秒`<br>`   成功率: 100%`<br>`   💰 Token: 45,230 \| 成本: $0.82 \| 预算: 22.6%` |

#### 错误处理逻辑

判断原子skill出错是否影响后续执行：

**影响后续（5.1）**：
1. 暂停任务
2. 将错误抛出给用户确认
3. 根据用户确认信息操作下一步
4. Reasoner分析错误原因（仅聚焦当前原子skill失败原因，不追溯无关步骤）
5. 准备后续重规划，仅为反思提供依据，不额外占用执行资源

**不影响后续（5.2）**：
1. 将错误信息记录到执行日志
2. 用户可查看
3. Reasoner继续推进后续执行

**【执行时按需读取】**
```
读取文件1：.claude/skills/orchestrator/algorithms.md
读取章节：第7节 - 错误影响判断算法
读取内容：影响评分模型(5维度)、错误分类、判断规则

读取文件2：.claude/skills/orchestrator/config.md
读取章节：第15节 - 错误分类配置、第2节 - 重试与反思配置
读取内容：错误类型定义、重试次数(≤3次)、重试策略

读取文件3：.claude/skills/orchestrator/user_interaction.md
读取章节：D3 - 错误处理选择
读取内容：错误提示模板、用户选项(重试/跳过/取消/人工修复)、默认行为
用途：实现错误分析和用户交互
```

### 6. 任务恢复

Reasoner从 `task_skill.md` 读取当前任务状态和历史上下文：
- 从未完成的原子任务继续执行
- 执行过程中若发现原计划不合理（如原子skill匹配错误、顺序不当），可自主调整执行计划
  - ✅ 允许：微调原子技能顺序、补充同类型原子技能
  - ❌ 禁止：替换主skill、新增未注册技能
- 直到所有原子任务均完成

**【执行时按需读取】**
```
读取文件1：.claude/skills/orchestrator/user_interaction.md
读取章节：D1 - 未完成任务发现、D4 - 执行计划调整确认
读取内容：任务恢复上下文格式、调整方案提示、用户选择处理
用途：实现任务恢复时的用户交互
```

### 7. 结果校验与反思

当所有原子skill执行完毕后：

**校验流程**：
1. Reasoner依据 `task_skill.md` 中的完成标准逐一校验
2. 自主评估结果是否符合最终目标
3. 仅当结果与目标偏差 ≥ 0.2 阈值时触发反思

**不符合标准处理**：
- 进行重试（最多3次）
- 若重试后仍不达标：
  - Reasoner分析原因
  - 尝试补充原子skill或调整执行顺序（不允许新增主skill）
  - 再次校验
  - 反思重规划最多触发3次
  - 若3次后仍不达标，不再继续反思，直接进入步骤8

**【执行时按需读取】**
```
读取文件1：.claude/skills/orchestrator/algorithms.md
读取章节：第5节(完成标准验证)、第6节(目标偏差评估)、第8节(反思重规划算法)
读取内容：验证类型、偏差计算公式、反思触发条件、反思分类、重规划限制

读取文件2：.claude/skills/orchestrator/config.md
读取章节：第2节 - 重试与反思配置
读取内容：重试次数(≤3次)、反思次数上限(3次)、偏差阈值(0.2)、反思日志长度限制

读取文件3：.claude/skills/orchestrator/user_interaction.md
读取章节：D5 - 反思失败处理
读取内容：反思上限提示、用户选项(继续尝试/放弃/手动干预)、默认行为
用途：实现结果验证和反思重规划逻辑
```

### 8. 结果输出

无论是否有重试，重试结果如何，均需：
- 整合各原子skill的结果
- 输出到结果文档
- 如有重试失败信息，记录到结果文档
- Reasoner同步记录反思日志
  - 仅记录关键问题
  - 列出可落地优化方向
  - 不记录冗余思考过程
  - 控制日志体量
- **Token 消耗汇总**（使用 TokenTracker 输出，详见第11节）
  - 任务级总消耗（总token、输入/输出token数、预估成本）
  - 调用次数和平均单次消耗
  - 预算使用百分比
  - 按技能分组的 token 明细
  - 会话级累计消耗（跨任务累积）

**【执行时按需读取】**
```
读取文件1：.claude/skills/orchestrator/algorithms.md
读取章节：第8节 - 反思重规划算法
读取内容：结果整合流程、反思日志生成规则、记录原则、日志格式

读取文件2：.claude/skills/orchestrator/config.md
读取章节：第0.6节(Token消耗追踪配置)、第2节(重试与反思配置)、第11节(输出格式配置)
读取内容：TokenTracker配置参数、反思日志长度限制(300字)、输出文档结构

读取文件3：.claude/skills/orchestrator/technical_implementation.md
读取章节：第11节 - Token消耗追踪
读取内容：TokenTracker类实现、与流式输出的集成示例、Orchestrator生命周期
用途：在 LLM 调用处集成 token 追踪，在任务总结时输出统计
```

### 9. 任务归档

#### 9.1 文件移动
将 `task_skill.md` 根据当前年月 `YYYY-MM` 移动到：
```
tasks/history/[YYYY-MM]/
```
- 若该月份文件夹不存在则新建
- 移动后文件名保持不变：`task_skill_{任务ID}.md`

**【执行时按需读取】**
```
读取文件1：.claude/skills/orchestrator/technical_implementation.md
读取章节：第1节 - 任务ID生成、第4节 - 文件恢复机制
读取内容：任务ID生成算法(YYYYMMDDHHMMSS_随机6位)、文件恢复策略

读取文件2：.claude/skills/orchestrator/config.md
读取章节：第5节 - 文件与存储配置、第10节 - 归档策略配置
读取内容：归档路径格式、归档触发条件、归档失败重试次数
用途：实现任务文件的移动和归档
```

#### 9.2 更新月度索引
更新历史文件夹下的月份索引文件：
- 若索引文件已存在：直接写入更新
- 若不存在：依据模板 `tasks/templates/月度任务索引模版.md` 新建索引文件后写入

**【执行时按需读取】**
```
读取文件1：.claude/skills/orchestrator/templates/月度任务索引模版.md
读取内容：月度索引模板格式、字段定义、内容结构
用途：生成符合规范的月度任务索引文件
```

#### 9.3 用户提示
对于特殊可固化的文档，提示用户可手动移至项目目录下。

**【执行时按需读取】**
```
读取文件1：.claude/skills/orchestrator/user_interaction.md
读取章节：D6 - 可固化文档提示
读取内容：可固化判定标准、提示模板、用户选项(移至docs/、仅索引、手动处理)、默认行为
用途：实现可固化文档的用户提示和处理
```

---

## 执行流程总览

```
用户输入
    ↓
意图识别 (LLM驱动 + fallback机制)
    ↓
LLM分析 → 结构化意图JSON → 置信度评估
    ↓
简单目标? → 直接输出【end】
    ↓ (复杂目标)
生成明确意图
    ↓
检索历史任务 → 高度相似已完成? → 输出历史结果【end】
    ↓
检查未完成任务 → 有? → 用户选择:继续或新建
    ↓
匹配主skill → 无匹配【end】| 多匹配用户选 | 唯一匹配
    ↓
与主skill协同生成task_skill.md
    ↓
🚀 任务开始（流式输出：复杂度、意图置信度）
    ↓
TokenTracker 初始化（token_budget=200000）
    ↓
执行原子skill序列
    ↓ ↺ (并行层内可同时执行)
┌─────────────────────────────────────────────────────┐
│  ⚡ skill开始（流式输出：进度条、剩余数量）           │
│  ⏳ 执行中...                                        │
│  ✅ skill完成（流式输出：耗时、结果摘要）            │
│     💰 token: +12,450 | 成本: $0.19                  │
│     或 ❌ skill失败（流式输出：重试状态）            │
│     💰 token: +8,230 | 成本: $0.12                   │
│  ⚠️ 预算预警（触发阈值80%/95%）                       │
└─────────────────────────────────────────────────────┘
    ↓
原子skill执行成功? → 否 → 重试(≤3次) → 影响后续? → 是 → 用户确认 → 调整计划
    ↓ (是/重试成功)                                    ↓ (否) → 记录继续
更新状态 → 所有子任务完成? → 否 → 继续执行
    ↓ (是)
校验完成标准 → 符合目标? → 否(偏差≥0.2) → 💭 反思重规划(≤3次)
    ↓ (是)
📋 任务总结（流式输出：成功率、总耗时）
    💰 Token: 45,230 | 成本: $0.82 | 预算: 22.6%
    ↓
归档任务 → 更新月度索引
    ↓
【end】
```

> **流式输出说明**：每个 ⏳ 执行阶段都会实时输出进度消息（见步骤5），用户可以在任务执行过程中看到每一步的状态，无需等待所有步骤完成。详见 `technical_implementation.md` 第10节。Token 消耗追踪详见 `technical_implementation.md` 第11节和 `config.md` 第0.6节。

---

## 关键规则

### 状态同步规则
- 并行执行的原子skill：同一时间仅允许一个写入 `task_skill.md`
- 避免读写冲突，确保状态一致性

### 重试机制
- 单个原子skill：最多重试3次
- 反思重规划：最多触发3次
- 重试失败信息必须记录到结果文档

### 计划调整限制
- ✅ 允许：微调原子技能顺序、补充同类型原子技能
- ❌ 禁止：替换主skill、新增未注册技能

### 相似度阈值
- 默认相似度阈值：0.85
- 历史任务检索：Top 3-5

### Token 追踪规则
- 任务开始时初始化 `TokenTracker(task_budget=200000)`，调用 `start_task(task_id)`
- 每次 LLM 调用后必须调用 `record_skill_usage(skill_name, input_tokens, output_tokens)`
- 80% 预算时普通预警（⚠️），95% 时严重警告（🚨），100% 时提示终止
- 任务完成时输出 `print_task_summary()` 并写入 task_skill.md 执行日记

---

## 文件依赖关系

```
SKILL.md (Orchestrator Reasoner)
    ↓ 读取
skills_register.md (技能注册表)
    ↓ 匹配
主skill (如 fix_frontend_bug)
    ↓ 读取
atomic-skills/ (原子技能)
    ↓ 生成
tasks/current/task_skill.md
    ↓ 执行更新
tasks/history/[YYYY-MM]/task_skill_{ID}.md (归档)
    ↓ 更新
tasks/history/[YYYY-MM]/月度任务索引.md
```

---

## 与其他Skill的交互

### 与主skill的交互
1. **输入**：传递用户意图和最终目标
2. **输出**：接收生成的 `task_skill.md` 文件
3. **协同**：共同确定原子skill执行顺序和依赖关系
4. **控制**：Reasoner掌控执行流程，主skill负责原子skill的具体实现

### 与任务文件的交互
- **读**：读取 `task_skill.md` 获取任务状态、执行顺序、完成标准
- **写**：实时更新子任务状态、执行日志、错误信息
- **归档**：完成任务后移动文件并更新索引

### 与 TokenTracker 的交互
- **初始化**：任务开始时 `TokenTracker = TokenTracker(task_budget=200000)`
- **记录**：每次 LLM 调用后调用 `record_skill_usage(skill_name, input_tokens, output_tokens)`
- **预警**：TokenTracker 内部自动检查阈值（80%/95%），触发预警输出
- **汇总**：任务完成时调用 `print_task_summary()` 输出完整 token 消耗报告

---

## 错误处理策略

1. **原子skill失败**：根据影响程度决定是暂停还是继续
2. **重试失败**：记录到反思日志，进入下一次重规划
3. **多次重试不达标**：停止重试，输出结果并标记失败
4. **文件操作失败**：记录错误并暂停任务，等待用户干预

---

## 归档策略

- **触发时机**：所有原子skill执行完毕（无论成功/失败）
- **归档路径**：`tasks/history/YYYY-MM/`
- **索引更新**：维护每月任务索引，便于历史检索
- **固化提示**：对于可复用的任务结果，提示用户手动迁移至项目目录
