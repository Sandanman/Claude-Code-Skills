---
name: generate-and-confirm
description: 根据检测结果生成规范探测代码，收集用户确认和补充规则，输出带来源的确认结果。
reasoner_instructions: |
  MERGE configRules and inferredRules. GENERATE probe code with edge cases.
  SHOW probe code to user. USE AskUserQuestion for missing rules (max 3 per batch).
  RECORD user modifications and answers. OUTPUT confirmedRules JSON.
---


## 概述

## 核心能力
- 合并 configRules + inferredRules 生成探测代码
- 展示探测代码供用户确认和修改
- 分批次提问收集补充信息（框架特定规则）
- 记录规则来源（config / inferred / user）

- **优先读取**共享上下文 `task_skill.md` 中的 detect-and-scan 输出
- 如果共享上下文无数据，才读取直接输入

- **必须写入**共享上下文 `task_skill.md`
- 输出内容：confirmedRules + ruleSources + userModifications + userAnswers + probeCode


### 阶段1：合并规则并生成探测代码

合并 `configRules` 和 `inferredRules`，生成以下探测代码：
- HTML 探测代码
- CSS 探测代码
- JavaScript 探测代码
- TypeScript 探测代码（含泛型 edge cases）
- Vue3 Composition API 探测代码
- React Hooks 探测代码

### 阶段2：展示探测代码并处理反馈

展示探测代码，提示用户确认或修改。

**用户修改代码** → 解析修改，更新规则，标记来源为 "user"

**用户确认** → 保持原有规则，标记来源为 "user"

### 阶段3：分批次提问收集补充规则

每批不超过3个问题，根据检测到的框架类型显示对应批次：

#### 基础格式批次
- 函数空行规则
- 模块注释格式

#### TypeScript 批次（如检测到 TS）
- 类型导出策略（export type 独立 vs inline 混合）
- 泛型约束偏好（明确约束 vs 按需约束）

#### Vue3 批次（如检测到 Vue3）
- composables 抽离时机
- ref vs reactive 选择偏好
- defineProps 使用风格

#### React 批次（如检测到 React）
- useEffect 依赖数组风格
- useCallback 使用策略

## 输出格式

```json
{
  "confirmedRules": {
    "indent_style": "space",
    "indent_size": 4,
    "quotes": "single",
    "semi": false,
    "html_attribute_quotes": "double",
    "component_naming": "PascalCase",
    "function_empty_line": "同模块无空行，异模块1空行",
    "module_comment_style": "分割线注释",
    "ts_type_export": "export type 独立",
    "vue3_composables_extraction": "逻辑复用 >= 3处",
    "vue3_ref_vs_reactive": "ref 优先",
    "react_useEffect_dependency": "显式依赖数组"
  },
  "ruleSources": {
    "indent_style": "config",
    "quotes": "config",
    "html_attribute_quotes": "inferred",
    "function_empty_line": "user",
    "ts_type_export": "user",
    "vue3_composables_extraction": "user"
  },
  "userModifications": [
    {
      "rule": "html_attribute_quotes",
      "original": "double",
      "modified": "single",
      "reason": "用户修改探测代码"
    }
  ],
  "userAnswers": [
    { "question": "函数之间的空行规则？", "answer": "同模块无空行，异模块1空行" },
    { "question": "TypeScript 类型导出策略？", "answer": "export type 独立" }
  ],
  "probeCode": {
    "html": "<!-- HTML 规范探测 -->...",
    "css": "/* CSS 规范探测 */...",
    "typescript": "// TypeScript 规范探测...",
    "vue3": "<script setup lang=\"ts\">...",
    "react": "// React Hooks 规范探测..."
  }
}
```

## 强约束
- 必须使用 `AskUserQuestion` 工具，不能直接输出问题
- 每批问题不超过3个
- 必须记录规则的来源（config / inferred / user / default）
- 必须记录用户修改的内容
- 输出必须是合法的JSON格式

## 版本
