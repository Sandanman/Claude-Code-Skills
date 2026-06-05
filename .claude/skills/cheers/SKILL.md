---
name: cheers
description: 首次将 Claude Code Skills 引入项目时的初始化 skill。当用户提到"初始化项目"、"设置项目"、"首次配置"、"项目引导"、"cheers"时触发。依次执行：检测/生成 CLAUDE.md → 扫描项目信息补充 → 生成项目代码风格 → 生成个人代码风格。最终在 CLAUDE.md 中写入代码生成优先级说明（个人风格优先，项目风格兜底）。本 skill 是编排型主 skill，τ 增强版（K1 任务折叠、K2 技能栈叠、K4 模式复用）。
reasoner_instructions: |
  EXECUTE FULL WORKFLOW: check-claude-md → scan-project → generate-project-style → generate-personal-style → finalize-claude-md。
  全程中文交流，友善引导。τ 增强：K4 模式复用（CLAUDE.md 已存在时跳过 init），K1 任务折叠（合并部分步骤）。
  DO NOT SKIP ANY CORE STEP.
---

# Cheers（项目初始化引导）v1.0 τ 增强版

## 概述

`cheers` 是首次将 Claude Code Skills 引入项目时执行的引导 skill。通过依次调用扫描、生成类 skill，生成/更新项目的 `CLAUDE.md`，为后续所有代码生成任务建立项目上下文和个人偏好双重基线。

**与 code-style-generator / personal-code-habits-generator 的区别**：
- 本 skill 是编排型入口，依次调用多个 skill
- 输出文件统一为 `CLAUDE.md`（项目上下文配置）
- 最终在 CLAUDE.md 中写入代码生成优先级：**个人风格优先，项目风格兜底**

## 核心理念

### 韬定律集成

| 华为韬定律 | AI Agent 映射 | cheers 落地 |
|-----------|--------------|------------|
| **K1 逻辑折叠** | 任务折叠（Task Folding） | 合并 CLAUDE.md 检测与补充步骤 |
| **K2 三维堆叠** | 技能栈叠（Skill Stacking） | 各 skill 输出写入 task_skill.md，下游直接读取 |
| **K4 成熟制程** | 模式复用（Pattern Mining） | CLAUDE.md 已存在时跳过 init，τ→0 |

### τ 预算

| 步骤 | τ 预算 | 说明 |
|------|--------|------|
| step1: 检测 CLAUDE.md | 800 | K4 复用检测 |
| step2: 扫描项目信息 | 2500 | 调用 scan-object-info |
| step3: 生成风格文档 | 3500 | code-style + personal-habits |
| step4: 合并更新 CLAUDE.md | 1200 | 写入文件 + 优先级说明 |
| **总计（moderate）** | **8000** | |

## 执行流程（4 步）

```
Step 1: 检测 CLAUDE.md 是否存在（K4 模式复用）
         ↓
Step 2: 调用 scan-object-info 扫描项目信息（可跳过）
         ↓
Step 3: 调用 code-style-generator + personal-code-habits-generator（可跳过）
         ↓
Step 4: 合并所有输出，更新 CLAUDE.md（含代码生成优先级）
```

---

## 详细步骤

### Step 1: 检测 CLAUDE.md 是否存在

使用 Glob 或 Read 工具检测项目根目录是否存在 `CLAUDE.md`。

**K4 模式复用判断**：
- 如果 CLAUDE.md 已存在 → 跳过 init，τ 节省 800，记录 `pattern_reused: true`
- 如果 CLAUDE.md 不存在 → 继续流程

**开场引导**：
```
你好！欢迎使用 cheers 项目初始化引导。

我来帮你完成以下配置：
1. 检测/生成 CLAUDE.md（项目上下文配置）
2. 扫描项目信息（技术栈、框架、配置）
3. 生成项目代码风格（CODE_STYLE.md）
4. 生成你的个人代码习惯（CODE_STYLE_PERSONAL.md）

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

**扫描结果写入 task_skill.md 共享上下文**（K2 技能栈叠）。

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

### 完成标准

1. CLAUDE.md 已存在或已生成
2. 项目信息已扫描（可选跳过）
3. CODE_STYLE.md 已生成（可选跳过）
4. CODE_STYLE_PERSONAL.md 已生成（可选跳过）
5. CLAUDE.md 已更新，含代码生成优先级说明

### 完成后提示

```
项目初始化完成！

已生成/更新：
- CLAUDE.md（含代码生成优先级说明）✓
- CODE_STYLE.md（项目代码风格）<视扫描结果>
- CODE_STYLE_PERSONAL.md（个人代码习惯）<视用户配合度>

后续使用：
- 首次生成代码时，Claude 自动读取 CLAUDE.md 获取上下文
- 调整个人习惯：/personal-code-habits-generator
- 更新项目风格：/code-style-generator
```

## 注意事项

- **全程中文**：所有提示和输出均为中文
- **允许跳过**：用户对任何步骤不配合时，允许跳过（记录为 `skipped`），不阻塞后续流程
- **K4 复用**：CLAUDE.md 存在时跳过 Step 1 init，节省 τ
- **K2 栈叠**：各 skill 输出写入 task_skill.md，下游读取，避免重复解析
- **不可覆盖**：不删除用户已修改的 CLAUDE.md 内容，只追加补充
- **优先级明确**：在 CLAUDE.md 中明确写入"个人风格优先，项目规范兜底"

## 版本

版本：1.0
主 skill 名称：cheers
状态：启用
核心功能：项目初始化引导 → 生成/更新 CLAUDE.md