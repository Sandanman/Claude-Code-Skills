---
name: cheers
description: 首次将 Claude Code Skills 引入项目时的初始化 skill。当用户提到"初始化项目"、"设置项目"、"首次配置"、"项目引导"、"cheers"时触发。依次执行：检测/生成 CLAUDE.md → 扫描项目信息补充（与项目云图并行生成）→ 生成项目代码风格 → 生成个人代码风格。最终在 CLAUDE.md 中写入代码生成优先级说明（个人风格优先，项目风格兜底），并汇总项目云图生成状态。本 skill 是编排型主 skill。
reasoner_instructions: |
  EXECUTE FULL WORKFLOW: check-claude-md-and-cloud-map → scan-project (parallel with cloud-map-generation if accepted) → generate-project-style → generate-personal-style → finalize-claude-md-and-merge-cloud-map-result。
  全程中文交流，友善引导。CLAUDE.md 或项目云图已存在时跳过对应初始化步骤，项目云图生成与 scan/style 步骤并行执行以缩短串行等待。
  DO NOT SKIP ANY CORE STEP.
---

# Cheers（项目初始化引导）v1.0

## 概述

`cheers` 是首次将 Claude Code Skills 引入项目时执行的引导 skill。通过依次调用扫描、生成类 skill，生成/更新项目的 `CLAUDE.md`，为后续所有代码生成任务建立项目上下文和个人偏好双重基线。

**与 code-style-generator / personal-code-habits-generator 的区别**：
- 本 skill 是编排型入口，依次调用多个 skill
- 输出文件统一为 `CLAUDE.md`（项目上下文配置）
- 最终在 CLAUDE.md 中写入代码生成优先级：**个人风格优先，项目风格兜底**

## 核心理念

---

## 详细步骤

### Step 1: 检测 CLAUDE.md + 检测/询问项目云图

使用 Glob 或 Read 工具检测项目根目录是否存在 `CLAUDE.md`，同时检测是否存在 `docs/project-cloud-map.md`。两项检测一次性做完，云图的询问也在这一步提前问，答案决定是否在后续并行启动云图生成。

**CLAUDE.md 复用判断**：
- 如果 CLAUDE.md 已存在 → 跳过 init，记录 `pattern_reused: true`
- 如果 CLAUDE.md 不存在 → 继续流程

**项目云图复用判断**：
- 如果 `docs/project-cloud-map.md` 已存在 → 跳过询问，记录 `cloud_map: "pattern_reused"`
- 如果不存在 → 在开场引导中一并询问用户是否要生成（见下方询问文案），记录用户的选择：
  - 同意 → 记录 `cloud_map: "pending_parallel"`，进入 Step 2 时后台并行调用 `.claude/skills/project-cloud-map/SKILL.md`（项目级模式）
  - 拒绝/不回应 → 记录 `cloud_map: "skipped"`，不追问，不阻塞

**开场引导（含云图询问）**：
```
你好！欢迎使用 cheers 项目初始化引导。

我来帮你完成以下配置：
1. 检测/生成 CLAUDE.md（项目上下文配置）
2. 扫描项目信息（技术栈、框架、配置）
3. 生成项目代码风格（CODE_STYLE.md）
4. 生成你的个人代码习惯（CODE_STYLE_PERSONAL.md）

另外，这个项目目前还没有「项目云图」（docs/project-cloud-map.md）。
它相当于给 AI 用的一张项目导航地图：用关系图（Mermaid）记录各模块的作用以及模块之间的调用联系，主要帮你：
- 查上下文——新增/修改需求前，AI 先在图上定位相关文件、函数、调用链路，快速找到该改哪里、会影响到哪些地方
- 留痕——需求改完后，在对应节点上追加一条变更记录，方便以后快速知道"这里什么时候被谁改过、改了什么"

要不要顺带一起生成？如果同意，它会和下面的扫描/风格生成步骤同时在后台跑，不会增加等待时间。

整个过程大约 5-10 分钟，你随时可以跳过不熟悉的步骤。
准备好了吗？我们开始吧！
```

### Step 2: 调用 scan-object-info

调用 `.claude/skills/scan-object-info/SKILL.md`，扫描项目技术栈。

**获取内容**：
- 框架类型（Vue / React / Node 等）
- UI 库
- 状态管理方案
- 请求方案
- 路由方案
- 配置文件（package.json / tsconfig.json / eslint 等）
- 项目目录结构

**用户可跳过**：如果用户说"跳过扫描"或项目无现有代码，直接进入 Step 3。

**扫描结果写入 task_skill.md 共享上下文**。

### Step 3: 生成代码风格

依次调用两个 skill：

#### 3a. code-style-generator

调用 `.claude/skills/code-style-generator/SKILL.md`，生成项目代码规范。

**结果记录**：key points 精简记录到 task_skill.md，供 Step 4 读取。

#### 3b. personal-code-habits-generator

调用 `.claude/skills/personal-code-habits-generator/SKILL.md`，通过对话收集个人偏好。

**用户可跳过**：如果用户拒绝回答，记录 `personal_habits: "skipped"`，继续流程不阻塞。

### Step 4: 合并输出，更新 CLAUDE.md

将 Step 2-3 的所有输出合并，生成/更新项目根目录的 `CLAUDE.md`。

**CLAUDE.md 标准格式（cheers 扩展版）**：

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 项目信息

- 项目名称：<scan-object-info 获取或用户填写>
- 技术栈：<框架 + UI 库 + 状态管理 + 路由>
- 关键配置：<package.json / tsconfig.json / eslint 等>

---

## 任务编排限制（cheers 初始化写入）

**强制要求**：项目中的所有任务都必须通过 `orchestrator` skill 进行意图识别、Skill 匹配、任务规划、执行和结果校验。

- 不得绕过 `orchestrator` 直接执行其他 Skill 或自行处理任务
- 所有用户请求统一由 `/orchestrator` 作为唯一入口进行编排
- 新增或修改任务流程时，必须保持 `orchestrator` 的统一入口地位

---

## 代码生成优先级（cheers 初始化写入）

**重要**：生成代码时优先使用以下风格：

1. **个人开发风格**（CODE_STYLE_PERSONAL.md）— 最高优先级
2. **项目代码风格**（CODE_STYLE.md）— 次优先级
3. **通用编码规范**（`.claude/rules/coding-standards.mdc`）— 兜底

当个人风格与项目规范冲突时，优先遵循项目规范以确保团队协作一致性，同时可在注释中注明个人偏好。

---

## 项目架构

<scan-object-info 获取的项目结构说明，可选补充>

---

## 项目代码风格

<code-style-generator 生成的 key points，精简记录>

---

## 个人开发风格

<personal-code-habits-generator 生成的 key points，精简记录>
如为"skipped"状态，注明：个人风格待补充（可再次运行 /personal-code-habits-generator）

---

**由 cheers skill 生成** | **生成时间**：<ISO 时间戳>
```

### 并行任务：生成项目云图（若 Step 1 中用户已同意）

若 Step 1 记录为 `cloud_map: "pending_parallel"`，在进入 Step 2 的同时，后台并行调用 `.claude/skills/project-cloud-map/SKILL.md`（项目级模式），与 Step 2（scan-object-info）、Step 3（code-style + personal-habits）同时执行，**不阻塞主线**，也不等待其完成才进入 Step 4。

到达 Step 4 时检查该并行任务状态：
- 已完成 → 记录 `cloud_map: "generated"`，在完成提示中展示结果
- 仍在执行 → 记录 `cloud_map: "generating"`，在完成提示中说明"云图仍在后台生成，完成后可查看 docs/project-cloud-map.md"
- 执行失败 → 记录 `cloud_map: "failed"`，简要说明原因，不影响 cheers 其余部分的完成判定

**用户在 Step 1 拒绝或不回应**：`cloud_map: "skipped"`，不触发本并行任务，不追问。

**docs/project-cloud-map.md 已存在**：`cloud_map: "pattern_reused"`，不触发本并行任务。

### 完成标准

1. CLAUDE.md 已存在或已生成
2. 项目信息已扫描（可选跳过）
3. CODE_STYLE.md 已生成（可选跳过）
4. CODE_STYLE_PERSONAL.md 已生成（可选跳过）
5. CLAUDE.md 已更新，含任务编排限制和代码生成优先级说明
6. 项目云图状态已确定（`pattern_reused` / `generated` / `generating` / `skipped` / `failed` 之一），不要求必须生成完毕

### 完成后提示

```text
项目初始化完成！

已生成/更新：
- CLAUDE.md（含任务编排限制和代码生成优先级说明）✓
- CODE_STYLE.md（项目代码风格）<视扫描结果>
- CODE_STYLE_PERSONAL.md（个人代码习惯）<视用户配合度>
- docs/project-cloud-map.md（项目云图）<视并行任务状态：已存在 / 已生成 / 仍在后台生成中 / 已跳过 / 生成失败>

后续使用：
- 所有任务必须通过 /orchestrator 统一编排
- 首次生成代码时，Claude 自动读取 CLAUDE.md 获取上下文
- 调整个人习惯：/personal-code-habits-generator
- 更新项目风格：/code-style-generator
- 查/改需求前先看项目云图，改完记得让它在云图里留一笔：project-cloud-map
```

## 注意事项

- **全程中文**：所有提示和输出均为中文
- **允许跳过**：用户对任何步骤不配合时，允许跳过（记录为 `skipped`），不阻塞后续流程
- **复用已有文件**：CLAUDE.md 或项目云图存在时跳过对应初始化步骤
- **共享上下文**：各 skill 输出写入 task_skill.md，供下游步骤读取，避免重复解析
- **不可覆盖**：不删除用户已修改的 CLAUDE.md 内容，只追加补充
- **优先级明确**：在 CLAUDE.md 中明确写入"个人风格优先，项目规范兜底"

## 版本

版本：1.2
主 skill 名称：cheers
状态：启用
核心功能：项目初始化引导 → 生成/更新 CLAUDE.md →（与扫描/风格生成并行）检测/生成项目云图
