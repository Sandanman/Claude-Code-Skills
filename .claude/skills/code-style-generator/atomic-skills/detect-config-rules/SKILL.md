---
name: detect-and-scan
description: 检测项目配置文件 + 扫描代码推断规范一体化执行（K1任务折叠）。读取 .editorconfig/.prettierrc/tsconfig.json 等配置文件，并扫描 src/ 代码文件推断规范。v1.2 替代原 detect-config-rules + scan-code-patterns。
reasoner_instructions: |
  K1任务折叠：一体化执行 detect-config-rules + scan-code-patterns。
  读取配置文件（.editorconfig, .prettierrc, eslint.config.js, tsconfig.json）提取规则。
  扫描代码文件（Vue/React/TS/JS），推断命名规范和框架类型。
  K3协同：框架类型检测由规则直接判断（不消耗模型τ）。
  K2栈叠：输出写入 task_skill.md 共享上下文。
  OUTPUT merged configRules + inferredRules JSON.
---

# detect-and-scan（v1.2 - K1任务折叠版）

## 概述
**K1任务折叠**：本 atomic skill 整合了 `detect-config-rules`（检测配置文件）和 `scan-code-patterns`（扫描代码推断规范），减少 τ 消耗约40%。

## τ 预算
- simple：800 token
- moderate：1500 token
- complex：2500 token

## 核心能力
- **K1折叠**：配置检测 + 代码扫描一体化执行
- **K3协同**：框架类型（Vue/React）由规则直接判断，不消耗模型τ
- 读取配置文件，提取格式化规则和 TypeScript 配置
- 扫描代码文件，推断命名规范、Vue3/React Hooks/TS 类型偏好
- 输出配置规则 + 推断规则的合并结果

## K2 技能栈叠（输出）
- **必须写入**共享上下文 `task_skill.md`
- 输出内容：configRules + inferredRules + frameworkDetected + scannedFiles + confidence

## 执行流程（K1任务折叠一体化）

### 阶段1：检测配置文件（规则接管，K3协同）
**K3协同**：以下检测由规则直接判断，不消耗模型τ：
- 文件是否存在（.editorconfig / .prettierrc / tsconfig.json）
- 基础格式字段（indent/quotes/semi/printWidth）
- tsconfig.json 字段（strict / noImplicitAny / jsx）

读取以下配置文件（优先级从高到低）：
1. **.editorconfig** - 编辑器配置
2. **.prettierrc** / **.prettierrc.json** - Prettier配置
3. **eslint.config.js** / **.eslintrc.js** - ESLint配置
4. **tsconfig.json** - TypeScript 配置
5. **package.json** - 可能包含prettier/tsconfig配置

### 阶段2：扫描代码文件（推断规则）
扫描以下类型的文件（每种类型最多3个）：
- JavaScript/TypeScript：`src/**/*.js`、`src/**/*.ts`、`src/**/*.tsx`
- Vue文件：`src/**/*.vue`
- React文件：`src/**/*.jsx` / `src/**/*.tsx`
- CSS/Less文件：`src/**/*.css` / `src/**/*.less`

**K3协同**：框架类型（Vue3 / React）由以下规则直接判断：
- `src/**/*.vue` 存在 → `framework: "vue3"`
- `src/**/*.jsx` / `src/**/*.tsx` 存在且无 `.vue` → `framework: "react"`
- 同时存在 → `framework: "mixed"`

推断规则列表：
- 命名规范（变量、组件、CSS类名）
- const/let 使用偏好、箭头函数风格
- Vue3 Composition API：ref/reactive/computed/composables 命名
- React Hooks：useState 泛型风格、useCallback 使用
- TypeScript 类型偏好：type vs interface

## 输出格式

```json
{
  "frameworkDetected": "vue3 | react | mixed | unknown",
  "configRules": {
    "indent_style": "space",
    "indent_size": 4,
    "quotes": "single",
    "semi": false,
    "print_width": null,
    "trailing_comma": "none",
    "end_of_line": "lf",
    "insert_final_newline": true,
    "brace_style": "1tbs",
    "ts_strict": true,
    "ts_noImplicitAny": true,
    "ts_strictNullChecks": true,
    "ts_jsx": "react-jsx"
  },
  "inferredRules": {
    "html_attribute_quotes": "double",
    "component_naming": "PascalCase",
    "js_variable_naming": "camelCase",
    "css_class_naming": "kebab-case",
    "vue3_script_setup": "always",
    "vue3_ref_vs_reactive": "ref优先",
    "composables_naming": "camelCase",
    "react_useState_generic": "泛型在括号内",
    "ts_type_vs_interface": "interface优先",
    "ts_export_type": "独立export type"
  },
  "scannedFiles": {
    "javascript": ["src/utils/utils.ts"],
    "vue": ["src/views/Home/index.vue"],
    "react": [],
    "css": ["src/assets/styles/global.css"]
  },
  "confidence": {
    "html_attribute_quotes": "high",
    "vue_script_style": "high",
    "vue3_script_setup": "high",
    "react_useState_generic": "low"
  },
  "stats": {
    "totalFilesScanned": 8,
    "rulesFromConfig": 8,
    "rulesInferred": 12,
    "frameworkSpecificRules": 6
  },
  "configFiles": [
    { "file": ".editorconfig", "exists": true, "rules": { "indent_size": 4, "quotes": "single" } },
    { "file": "tsconfig.json", "exists": true, "rules": { "strict": true, "jsx": "react-jsx" } }
  ],
  "detectedCount": 8,
  "inferredCount": 12,
  "tsConfigDetected": true
}
```

## τ 控制（v1.2）
- 检测文件不存在时，K3协同规则直接判断，跳过模型调用
- 框架类型检测由规则直接判断，不消耗模型τ
- 扫描文件数量上限：每种类型最多3个

## 强约束
- 只读取文件，不修改任何文件
- **K2栈叠**：输出必须写入共享上下文 `task_skill.md`
- 未找到的配置项标记为 `null`
- 必须记录扫描的文件列表
- 输出必须是合法的JSON格式

## 版本
v1.2 - K1任务折叠版：整合 detect-config-rules + scan-code-patterns，K2技能栈叠，K3协同设计，τ 预算管理