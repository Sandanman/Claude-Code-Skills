---
name: confirm-and-supplement
description: 展示探测代码给用户确认，收集反馈，补充无法自动检测的规则（含 TypeScript 和框架特定问题）。改进版优化用户反馈收集，增加框架特定问题批次。
reasoner_instructions: |
  SHOW probe code to user. USE AskUserQuestion tool for missing rules (max 3 per batch).
  IMPROVED v1.1: Add TypeScript questions, Vue3 questions, React Hooks questions.
  RECORD user modifications and answers. OUTPUT confirmedRules JSON with ruleSources and userAnswers.
---

# confirm-and-supplement（改进版 v1.1）

## 任务定义

你是原子技能 `confirm-and-supplement`，只负责与用户交互，确认探测代码，收集补充信息。

## 输入参数

从前面的任务获取：
- `configRules`：从配置文件检测到的规则（含 tsconfig）
- `inferredRules`：从代码推断的规则（含 Vue3/React Hooks/TS 类型）
- `probeCode`：生成的探测代码片段（含 edge cases）

## 交互流程

### 步骤1：展示探测代码

将探测代码展示给用户，提示：

```
我已根据项目代码生成了代码规范探测片段（含 TypeScript、Vue3、React Hooks），请查看：

[探测代码片段]

如果代码不符合你的习惯，请直接修改代码。
如果符合你的习惯，请回复"确认"。
```

### 步骤2：处理用户反馈

**情况A：用户修改了代码**
- 解析修改后的代码
- 更新规则列表
- 标记规则来源为 "用户确认"

**情况B：用户确认**
- 保持原有规则不变
- 标记规则来源为 "用户确认"

**情况C：用户提出问题**
- 解答用户疑问
- 根据用户反馈调整规则

---

### 步骤3：补充无法自动检测的规则

使用 `AskUserQuestion` 工具，分批次提问（**优化 v1.1**）：

#### 批次1：基础格式规则

```json
{
    "questions": [
        {
            "header": "函数空行",
            "multiSelect": false,
            "options": [
                {"label": "无空行", "description": "所有函数紧凑排列"},
                {"label": "同模块无空行，异模块1空行", "description": "按业务逻辑分组"},
                {"label": "总是1空行", "description": "所有函数间都有空行"}
            ],
            "question": "函数之间的空行规则？"
        },
        {
            "header": "模块注释",
            "multiSelect": false,
            "options": [
                {"label": "无注释", "description": "仅用空行分隔"},
                {"label": "单行注释", "description": "// 用户相关"},
                {"label": "块注释", "description": "/* 用户相关 */"},
                {"label": "分割线注释", "description": "/* ******** 用户相关 ******** */"}
            ],
            "question": "不同业务模块之间的注释格式？"
        }
    ]
}
```

#### 批次2：TypeScript 特定规则（**新增 v1.1**）

```json
{
    "questions": [
        {
            "header": "TS类型导出",
            "multiSelect": false,
            "options": [
                {"label": "export type 独立", "description": "import type { User } from './types'"},
                {"label": "inline 混合导出", "description": "export { User, type UserRole }"},
                {"label": "无偏好", "description": "不区分 type 和值导出"}
            ],
            "question": "TypeScript 类型导出策略？"
        },
        {
            "header": "TS泛型约束",
            "multiSelect": false,
            "options": [
                {"label": "明确约束", "description": "<T extends约束> 显式写出约束"},
                {"label": "按需约束", "description": "只在需要时才加约束"}
            ],
            "question": "泛型约束偏好？"
        }
    ]
}
```

#### 批次3：Vue3 Composition API 特定规则（**新增 v1.1**）

**如果项目使用 Vue3**：

```json
{
    "questions": [
        {
            "header": "composables抽离",
            "multiSelect": false,
            "options": [
                {"label": "逻辑复用 >= 3处", "description": "多处复用同一逻辑时抽离"},
                {"label": "按需抽离", "description": "组件代码 > 100行时考虑抽离"},
                {"label": "始终抽离", "description": "所有可复用逻辑都抽离为 composable"}
            ],
            "question": "composables 抽离时机？"
        },
        {
            "header": "ref vs reactive",
            "multiSelect": false,
            "options": [
                {"label": "ref 优先", "description": "primitive types 使用 ref"},
                {"label": "按需选择", "description": "根据场景选择"},
                {"label": "reactive 优先", "description": "对象类型使用 reactive"}
            ],
            "question": "ref vs reactive 选择偏好？"
        },
        {
            "header": "defineProps风格",
            "multiSelect": false,
            "options": [
                {"label": "泛型形式", "description": "defineProps<Props>()"},
                {"label": "withDefaults", "description": "const { x = 1 } = withDefaults(...)"},
                {"label": "按需选择", "description": "根据场景选择"}
            ],
            "question": "defineProps 使用风格？"
        }
    ]
}
```

#### 批次4：React Hooks 特定规则（**新增 v1.1**）

**如果项目使用 React**：

```json
{
    "questions": [
        {
            "header": "useEffect依赖",
            "multiSelect": false,
            "options": [
                {"label": "显式依赖数组", "description": "useEffect(() => {}, [dep1, dep2])"},
                {"label": "省略空数组", "description": "useEffect(() => {})（仅 mount 时执行）"},
                {"label": "按需选择", "description": "根据场景选择"}
            ],
            "question": "React useEffect 依赖数组风格？"
        },
        {
            "header": "useCallback使用",
            "multiSelect": false,
            "options": [
                {"label": "始终包裹", "description": "所有传递给子组件的函数都用 useCallback"},
                {"label": "按需使用", "description": "只在性能瓶颈处使用"},
                {"label": "从不使用", "description": "不依赖 useCallback 优化"}
            ],
            "question": "useCallback 使用策略？"
        }
    ]
}
```

---

## 执行规则

1. **分批提问**：每批不超过3个问题，避免用户疲劳
2. **提供预览**：对于格式相关的问题，提供代码预览
3. **允许跳过**：用户可以选择"其他"，自定义规则
4. **记录来源**：标记每条规则的来源（配置文件/代码推断/用户确认）
5. **框架特定**：根据检测到的框架类型，显示对应的问题批次（**新增 v1.1**）

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
        "comment_style": "简洁注释",
        "debug_code": "允许调试代码",
        "ts_type_export": "export type 独立",
        "vue3_composables_extraction": "逻辑复用 >= 3处",
        "vue3_ref_vs_reactive": "ref 优先",
        "react_useEffect_dependency": "显式依赖数组",
        "react_useCallback_usage": "按需使用"
    },
    "ruleSources": {
        "indent_style": "config",
        "indent_size": "config",
        "quotes": "config",
        "semi": "config",
        "html_attribute_quotes": "inferred",
        "component_naming": "inferred",
        "function_empty_line": "user",
        "module_comment_style": "user",
        "ts_type_export": "user",
        "vue3_composables_extraction": "user",
        "react_useEffect_dependency": "user"
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
        {
            "question": "函数之间的空行规则？",
            "answer": "同模块无空行，异模块1空行"
        },
        {
            "question": "TypeScript 类型导出策略？",
            "answer": "export type 独立"
        },
        {
            "question": "composables 抽离时机？",
            "answer": "逻辑复用 >= 3处"
        },
        {
            "question": "useEffect 依赖数组风格？",
            "answer": "显式依赖数组"
        }
    ]
}
```

## 强约束

- 必须使用 `AskUserQuestion` 工具，不能直接输出问题
- 每批问题不超过3个
- 必须记录规则的来源
- 必须记录用户修改的内容
- 必须包含 TypeScript、Vue3、React Hooks 的特定问题（**新增 v1.1**）
- 输出必须是合法的JSON格式

## 版本
v1.1 - 改进版：新增 TypeScript 问题批次、Vue3 Composition API 问题批次、React Hooks 问题批次，优化用户反馈收集