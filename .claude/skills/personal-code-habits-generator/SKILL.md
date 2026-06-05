---
name: personal-code-habits-generator
description: 从人的角度主动询问用户，生成个人代码习惯文档 CODE_STYLE_PERSONAL.md。v1.2 整合韬定律（τ 控制、任务折叠、技能栈叠、模式复用），通过对话式收集个人开发习惯。当用户提到"生成我的代码习惯"、"生成个人代码规范"、"我习惯怎么写代码"、"记录我的开发习惯"、"我的编码偏好"时触发。与 code-style-generator（从代码推断）不同，本 skill 通过主动询问用户来收集个人开发习惯。
reasoner_instructions: |
  EXECUTE FULL WORKFLOW: greet → ask-batch-1 → ask-batch-2 → ask-batch-3 → generate-document。
  全程中文交流，语气友好自然，像一次舒适的技术对话。
  不要一次性问完所有问题，分批次问，每批次不超过5个问题。
  v1.2 整合韬定律：K1任务折叠、K2技能栈叠、K3协同设计、K4模式复用、τ预算管理。
  DO NOT SKIP ANY STEP.
---

# Personal Code Habits Generator（个人代码习惯生成器）v1.2 韬理论增强版

## 概述

本 skill 通过**主动询问用户**了解其个人代码开发习惯，生成标准化代码习惯文档 `CODE_STYLE_PERSONAL.md`。**v1.2 整合华为韬定律四大核心（K1任务折叠、K2技能栈叠、K3协同设计、K4模式复用），实现 τ 压缩与收集效率最大化。**

与 `code-style-generator`（被动扫描代码推断规范）不同，本 skill 采用对话式收集方式，适合新环境、没有现有代码、或想系统化整理个人习惯的场景。

## 核心理念

### 韬理论四大映射

| 华为韬定律 | AI Agent 映射 | personal-code-habits-generator 落地 |
|-----------|--------------|-------------------------------------|
| **K1 逻辑折叠** | 任务折叠（Task Folding） | 5个对话步骤压缩为3个对话轮次 |
| **K2 三维堆叠** | 技能栈叠（Skill Stacking） | 用户回答写入共享上下文，下一轮直接读取 |
| **K3 软硬协同** | 模型×规则协同（Co-Design） | 简单问题（选 A/B/C）规则接管，省 τ |
| **K4 成熟制程** | 模式复用（Pattern Mining） | 已有 CODE_STYLE_PERSONAL.md 直接复用，τ→0 |

### τ（时间常数）公式

```
τ_habit = τ_greet + τ_ask_round + τ_generate + τ_confirm

性能 = f(文档质量) / τ_habit
目标：τ 最小化，质量不降
```

## v1.2 改进（基于韬理论）

1. **K1 任务折叠**：5个对话步骤 → 压缩为3个对话轮次（τ减少~40%）
   - `greet + ask-batch-1` → 合并为第一轮对话
   - `ask-batch-2 + ask-batch-3` → 合并为第二轮对话
   - `generate + confirm` → 合并为第三轮对话
2. **K2 技能栈叠**：所有用户回答写入共享上下文，下一轮直接读取
3. **K3 协同设计**：简单选择题（格式类问题）规则直接判断，不消耗模型 τ
4. **K4 模式复用**：如果 `CODE_STYLE_PERSONAL.md` 已存在，查询模式库，成熟模式 τ 折扣70%
5. **τ 预算管理**：分级预算（simple/moderate/complex），超预算触发折叠或降级
6. **质量扩展**：增加 feasibility_score（用户配合度）和 pattern_matching_result（模式匹配结果）

## 核心能力

- 对话式收集个人代码习惯（全程友好自然的中文对话）
- **K1折叠**：分3轮对话完成收集，每轮不超过5个问题
- **K3协同**：简单选择类问题规则接管，不消耗模型 τ
- **K4模式**：已有 CODE_STYLE_PERSONAL.md 时复用模式，τ 大幅降低
- 分批次提问（避免用户疲劳，每批 ≤5 个问题）
- 生成标准化 `CODE_STYLE_PERSONAL.md` 文档（含质量报告）
- 用户确认与补充

## 执行流程（v1.2 - 3轮对话）

```
第一轮：greet + ask-batch-1（合并）
         ↓
第二轮：ask-batch-2 + ask-batch-3（合并）
         ↓
第三轮：generate + confirm（合并）
```

## τ 预算分级（v1.2）

| 复杂度 | 总预算 | greet+ask-1 | ask-2+ask-3 | generate+confirm |
|--------|--------|-------------|-------------|-------------------|
| simple | 3000 | 800 | 1200 | 1000 |
| moderate | 6000 | 1500 | 2500 | 2000 |
| complex | 10000 | 2500 | 4000 | 3500 |

**总 τ 预算**：simple=3000 / moderate=6000 / complex=10000

复杂度判断：
- **simple**：用户明确说"简单整理"、跳过不熟悉领域、直接给出偏好
- **moderate**：中等提问量、需要追问细节、部分领域跳过
- **complex**：用户要求详细、所有领域都涉及、大量补充说明

## τ 控制规则（v1.2 新增）

### τ 折叠触发规则
- **fold-001**：τ_remaining < 30% 且 深度 > 2 时，强制折叠可选步骤
- **fold-002**：用户回答简洁明确时，直接进入下一轮，跳过追问（K4复用）
- **fold-003**：用户明确要求的检测步骤不可折叠
- **fold-004**：超过2层折叠深度后禁止继续折叠

### τ 预警规则
- **τ-010**：τ消耗 > 80% 总预算时，触发 warning 预警
- **τ-011**：τ消耗 > 95% 总预算时，跳过所有可选步骤
- **τ-012**：τ消耗 > 100% 时，强制终止非核心步骤

### K2 技能栈叠规则
- **stack-001**：每轮对话完成后，必须将用户回答写入共享上下文 `task_skill.md`
- **stack-002**：下一轮对话优先从共享上下文读取，避免重复询问
- **stack-003**：共享上下文命中率 < 50% 时，触发堆叠效率警告
- **stack-004**：层间通信优先级：共享上下文 > 重新询问

### K3 协同设计规则
- **codesign-001**：格式化问题（缩进/引号/分号）规则直接判断（省模型 τ）
- **codesign-002**：二选一问题直接列出选项，不消耗模型 τ 思考
- **codesign-003**：用户已回答的偏好直接记录，无需确认合理性
- **codesign-004**：用户跳过的问题，标记为 `skipped`，不追问

### K4 模式复用规则
- **pattern-001**：启动时查询模式库，检测是否已有相似 CODE_STYLE_PERSONAL.md
- **pattern-002**：相似度 >= 0.6 时复用已有模式，成熟模式 τ 折扣 70%
- **pattern-003**：复用率 = 已匹配模式数 / 总检测项数，< 30% 时触发新模式挖掘
- **pattern-004**：用户本次新增的习惯项 → 写入模式库（标记为试验模式）

## 输出格式

生成的 `CODE_STYLE_PERSONAL.md` 格式与 `code-style-generator` 保持一致，JSON 中所有字段从用户回答中获取，无推断：

```json
{
  "version": "1.2",
  "generated_at": "<当前时间 ISO 格式>",
  "source": "personal-interview",
  "tau": {
    "complexity": "moderate",
    "total_budget": 6000,
    "total_consumed": 5180,
    "remaining": 820,
    "budget_utilization": 0.863,
    "folding_applied": false,
    "pattern_reused": true,
    "breakdown": {
      "greet_ask_1": 1380,
      "ask_2_ask_3": 2400,
      "generate_confirm": 1400
    },
    "folding_notes": ["已有相似CODE_STYLE_PERSONAL.md，跳过部分追问"]
  },
  "pattern": {
    "matched_patterns": [
      { "name": "vue3-ts-personal", "maturity": "mature", "frequency": 8, "tau_discount": 0.7, "similarity": 0.85 }
    ],
    "reuse_rate": 0.65,
    "tau_saved": 1500
  },
  "habits": {
    "formatting": {
      "indent": "<2空格|4空格|Tab>",
      "quotes": "<单引号|双引号>",
      "semicolons": "<需要|不需要>",
      "lineLength": "<数字>",
      "bracketStyle": "<1tbs|stroustrup|allman|自定义>"
    },
    "naming": {
      "variables": "<camelCase|snake_case|other>",
      "constants": "<UPPER_SNAKE_CASE|other>",
      "files": "<kebab-case|camelCase|PascalCase|snake_case>",
      "components": "<PascalCase|other>",
      "directories": "<kebab-case|snake_case|other>"
    },
    "typescript": {
      "strictMode": "<true|false>",
      "interfaceVsType": "<interface|type|看情况>",
      "anyUsage": "<禁止|警告|允许>",
      "optionalFields": "<?:|Optional<>>",
      "enumUsage": "<enum|const object|union>"
    },
    "vue3": {
      "compositionApi": "<composition|options|混合>",
      "scriptSetup": "<倾向|不倾向|看情况>",
      "reactivePrefix": "<ref|reactive|both>",
      "componentNaming": "<PascalCase|kebab-case>",
      "propsTyping": "<defineProps|泛型|TypeScript类型>"
    },
    "react": {
      "hooks": "<always|看情况|倾向class>",
      "naming": "<useXxx|xxxHook>",
      "stateManagement": "<useState|Zustand|其他>",
      "componentFiles": "<.tsx|.jsx>",
      "styleInCode": "<inline|CSS Modules|styled-components|tailwind>"
    },
    "errorHandling": {
      "async": "<try-catch|always|看情况>",
      "errorBoundaries": "<使用|不使用>",
      "logging": "<console.log|logger|其他>"
    },
    "testing": {
      "framework": "<Vitest|Jest|Playwright|other>",
      "coverage": "<80%|90%|无要求>",
      "unitTests": "<每个函数|关键逻辑|不写>",
      "e2eTests": "<有|无>"
    },
    "documentation": {
      "jsdoc": "<always|重要函数|不写>",
      "inlineComments": "<必要处|尽量少|详细>",
      "readme": "<完整|简单|无>"
    },
    "git": {
      "commitFormat": "<conventional|其他格式>",
      "branchNaming": "<feature/|fix/|其他>",
      "commitMessageStyle": "<feat:|fix:|其他>"
    }
  },
  "additional_notes": "<用户提供的额外习惯说明>",
  "quality": {
    "overall_score": 92,
    "completeness_score": 85,
    "consistency_score": 90,
    "feasibility_score": 88,
    "issues": [],
    "recommendations": []
  }
}
```

## 执行流程详解

### 第一轮对话：启动 + 第一批问题（τ 折叠 greet + ask-1）

先用温暖友好的语气开场，说明目的和大概过程，然后立即开始第一批提问。

开场白示例：
```
你好！我来帮你系统整理个人代码习惯，生成一份专属的 CODE_STYLE_PERSONAL.md 文档。
整个过程大概分 2-3 轮对话，每轮 3-5 个问题。你随时可以跳过不熟悉的问题。
准备好了吗？我们开始吧！

【第一轮 - 基础格式化】
先从最基础的格式化习惯开始：
1. 缩进用几个空格？（2 / 4 / Tab）
2. 引号用单引号还是双引号？
3. 语句末尾需要分号吗？
4. 单行最长多少字符？
5. 大括号风格？（1TBS / Stroustrup / Allman / 自定义）
```

使用 `AskUserQuestion` 工具提问第一批（最多5个）。将用户回答写入 `task_skill.md` 共享上下文。

### 第二轮对话：第二批 + 第三批问题（τ 折叠 ask-2 + ask-3）

根据用户背景选择提问方向：
- 如果用户做过 Vue3 项目 → 问 Vue3 相关
- 如果用户做过 React 项目 → 问 React 相关
- 如果用户写过 TypeScript → 问 TypeScript 相关

**第三批 - 命名规范**（必须问）：
- 变量命名习惯？（camelCase / snake_case / 其他）
- 常量命名习惯？（UPPER_SNAKE_CASE / 其他）
- 文件命名习惯？（kebab-case / camelCase / PascalCase / snake_case）
- Vue/React 组件文件怎么命名？
- 目录命名习惯？

**第四批 - 语言与框架**（根据用户背景选问，不熟悉的直接跳过）：

*TypeScript*：
- 开启 strict 模式吗？
- interface 还是 type？
- 是否禁止使用 any？
- 可选字段用 `?:` 还是 `Optional<>`？
- 枚举用 enum 还是 const object？

*Vue 3*：
- 倾向 Composition API 还是 Options API？
- 使用 `<script setup>` 吗？
- Props 用什么方式定义类型？

*React*：
- 倾向 Hooks 还是 Class 组件？
- 自定义 Hook 怎么命名？
- 状态管理用什么方案？

**第五批 - 工程实践**：
- async/await 是否必须 try-catch？
- 测试框架用什么？
- JSDoc 什么时候写？
- Git commit 信息格式？

### 第三轮对话：生成 + 确认（τ 折叠 generate + confirm）

将所有收集到的习惯整理为 JSON 结构，生成 `CODE_STYLE_PERSONAL.md` 文件。

文件内容包含：
1. JSON 格式的结构化数据（τ 报告 + habits + quality）
2. 人类可读的 Markdown 版本摘要

写入完成后向用户确认：
- "已生成 CODE_STYLE_PERSONAL.md，请检查以下内容是否准确..."
- 列出关键习惯摘要
- "有遗漏或需要修改的地方吗？"
- "有没有额外的习惯想补充？"

如有修改，更新文件。

### 完成标准

1. 用户回答已收集（格式化 + 命名规范）
2. 框架偏好已确认（Vue3/React/TS 等）
3. CODE_STYLE_PERSONAL.md 已生成
4. τ 消耗报告已生成
5. 模式匹配结果已记录
6. 用户确认或修改完成

## 注意事项

- **全程中文**：所有提问和输出均为中文
- **自然对话感**：不要像填表，要像舒适的技术对话
- **允许跳过**：用户对某领域不熟悉时，直接跳过该问题
- **不要假设**：所有习惯均来自用户回答，不做任何推断或假设
- **一致性检查**：生成后提示用户检查是否与其实际习惯一致
- **分批次提问**：每轮不超过 5 个问题，避免用户疲劳
- **K2 强制**：所有用户回答必须写入共享上下文
- **τ 优先**：效率可略有牺牲（≥80%），τ 超支不可接受

## 文件系统位置

- 主 skill 路径：./.claude/skills/personal-code-habits-generator/SKILL.md
- 共享上下文：./.claude/skills/tasks/current/task_skill.md
- 模式库：./.claude/skills/patterns/personal-habit-patterns/（v1.2 新增）

## 版本

版本：1.2（韬理论增强版）
主 skill 名称：personal-code-habits-generator
状态：启用
核心改进：K1任务折叠(5→3轮对话) + K2技能栈叠 + K3协同设计 + K4模式复用 + τ预算管理