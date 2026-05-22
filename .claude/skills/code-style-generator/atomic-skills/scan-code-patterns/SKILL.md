---
name: scan-code-patterns
description: 扫描项目代码文件，推断命名规范、引号习惯、组件风格、Vue3 Composition API 规则和 React Hooks 规范。改进版新增 Vue3 composables 检测、React Hooks 泛型风格检测、TypeScript 类型偏好检测。
reasoner_instructions: |
  SCAN source files (max 3 per type). INFERENCE naming patterns, quote style, arrow function style, Vue3 Composition API, React Hooks.
  MERGE with configRules (skip conflicting rules).
  OUTPUT inferredRules as JSON with confidence levels and scannedFiles list.
---

# scan-code-patterns（改进版 v1.1）

## 任务定义

你是原子技能 `scan-code-patterns`，只负责扫描项目代码文件，推断代码规范模式，含 Vue3 Composition API、React Hooks 和 TypeScript 类型偏好。

## 输入参数

从上一个任务获取：
- `configRules`：已从配置文件检测到的规则（含 tsconfig）

## 扫描策略

### 文件选择规则

扫描以下类型的文件（每种类型最多3个）：

1. **JavaScript/TypeScript文件**：`src/**/*.js`、`src/**/*.ts`、`src/**/*.tsx`
2. **Vue文件**：`src/**/*.vue`
3. **React文件**：`src/**/*.jsx` / `src/**/*.tsx`
4. **CSS/Less文件**：`src/**/*.css` / `src/**/*.less`

## 推断规则列表

### 1-9. 基础规则（同 v1.0）
（HTML属性引号、命名规范、const/let、箭头函数、Vue风格、React风格、CSS单位、大括号、关键字后空格）

### 10. Vue3 Composition API 规则（**新增 v1.1**）
**检测方法**：扫描 `<script setup lang="ts">`、composables 目录、ref/reactive 使用比例

**输出字段**：
- `vue3_script_setup`: "always" | "as-needed" | "never"
- `vue3_ref_vs_reactive`: "ref优先" | "reactive优先" | "混合使用"
- `composables_naming`: "camelCase" | "PascalCase"
- `composables_dir`: "composables" | "hooks" | "utils"
- `define_props_style`: "泛型形式" | "withDefaults" | "选项式"
- `watch_vs_watchEffect`: "watch" | "watchEffect" | "混合"

**判断规则**：
- `<script setup>` 出现率 > 70% → "always"
- ref 使用占比 > reactive → "ref优先"
- 目录名 `composables/` → composables_dir = "composables"

### 11. React Hooks 规则（**新增 v1.1**）
**检测方法**：扫描 useState 泛型风格、useCallback 使用频率、自定义 hooks 命名

**输出字段**：
- `react_useState_generic`: "泛型在括号内" | "泛型在括号外" | "无泛型偏好"
- `react_useCallback_usage`: "always" | "as-needed" | "never"
- `react_custom_hooks_naming`: "use前缀" | "use后缀" | "无偏好"
- `react_effect_dependency_style`: "显式依赖数组" | "省略空数组" | "无偏好"

**判断规则**：
- `useState<T>(null)` 型出现率 > 60% → "泛型在括号内"
- `useCallback` 出现且通常包裹函数 → "always"

### 12. TypeScript 类型使用偏好（**新增 v1.1**）
**检测方法**：统计 type vs interface 使用比例、export type 使用频率

**输出字段**：
- `ts_type_vs_interface`: "type优先" | "interface优先" | "混合使用"
- `ts_export_type`: "独立export type" | "inline混合" | "无偏好"
- `ts_inline_type`: "inline类型" | "type别名" | "混合使用"

**判断规则**：
- `type` 定义数量 > `interface` 定义数量 → "type优先"
- `export type` 单独出现率 > 50% → "独立export type"

## 输出格式

```json
{
    "inferredRules": {
        "html_attribute_quotes": "double",
        "component_naming": "PascalCase",
        "js_variable_naming": "camelCase",
        "css_class_naming": "kebab-case",
        "const_let_preference": "const优先",
        "arrow_function_braces": "always",
        "vue_script_style": "script-setup",
        "vue_scoped_style": "as-needed",
        "vue3_script_setup": "always",
        "vue3_ref_vs_reactive": "ref优先",
        "composables_naming": "camelCase",
        "composables_dir": "composables",
        "define_props_style": "泛型形式",
        "watch_vs_watchEffect": "watch",
        "react_useState_generic": "泛型在括号内",
        "react_useCallback_usage": "as-needed",
        "react_custom_hooks_naming": "use前缀",
        "react_effect_dependency_style": "显式依赖数组",
        "ts_type_vs_interface": "interface优先",
        "ts_export_type": "独立export type",
        "ts_inline_type": "inline类型",
        "css_unit_preference": "rem",
        "brace_style": "1tbs",
        "space_after_keyword": true,
        "final_newline": true
    },
    "scannedFiles": {
        "javascript": ["src/utils/utils.ts"],
        "vue": ["src/views/Home/index.vue", "src/components/MeetingCard.vue"],
        "react": ["src/components/UserList.tsx"],
        "css": ["src/assets/styles/global.css"]
    },
    "confidence": {
        "html_attribute_quotes": "high",
        "vue_script_style": "high",
        "vue3_script_setup": "high",
        "react_useState_generic": "high",
        "arrow_function_braces": "medium"
    },
    "stats": {
        "totalFilesScanned": 8,
        "rulesInferred": 18,
        "rulesFromConfig": 8,
        "vue3Rules": 6,
        "reactHooksRules": 4,
        "tsTypeRules": 3
    }
}
```

## 强约束

- 只读取文件，不修改任何文件
- 扫描每种类型的文件不超过3个
- 必须记录扫描了哪些文件
- 必须为每条推断规则标记置信度
- 输出必须是合法的JSON格式
- 新增 Vue3/React Hooks/TS 类型推断规则（**新增 v1.1**）

## 版本
v1.1 - 改进版：新增 Vue3 Composition API 规则推断、React Hooks 规则推断、TypeScript 类型偏好推断