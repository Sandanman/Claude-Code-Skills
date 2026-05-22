---
name: scan-code-patterns
description: 扫描项目代码文件，推断命名规范、引号习惯、组件风格等无法从配置文件直接获取的规则
reasoner_instructions: |
  SCAN source files (max 3 per type). INFERENCE naming patterns, quote style, arrow function style, Vue/React preferences.
  MERGE with configRules (skip conflicting rules).
  OUTPUT inferredRules as JSON with confidence levels and scannedFiles list.
---

# scan-code-patterns

## 任务定义

你是原子技能 `scan-code-patterns`，只负责扫描项目代码文件，推断代码规范模式。

## 输入参数

从上一个任务获取：
- `configRules`：已从配置文件检测到的规则

## 扫描策略

### 文件选择规则

扫描以下类型的文件（每种类型最多3个）：

1. **JavaScript文件**：`src/**/*.js`
2. **Vue文件**：`src/**/*.vue`
3. **React文件**：`src/**/*.jsx` / `src/**/*.tsx`
4. **CSS/Less文件**：`src/**/*.css` / `src/**/*.less`

### 推断规则列表

#### 1. HTML/Vue/React 属性引号
**检测方法**：统计 HTML 标签属性中的引号使用频率

```html
<div class="container">  → 双引号
<div class='container'>  → 单引号
```

**输出字段**：
- `html_attribute_quotes`: "double" | "single"

---

#### 2. 命名规范
**检测方法**：分析文件名和变量名

**输出字段**：
- `component_naming`: "PascalCase" | "kebab-case"
- `js_variable_naming`: "camelCase" | "snake_case"
- `css_class_naming`: "kebab-case" | "camelCase" | "BEM"

**示例**：
```
文件名：MeetingCard.vue → component_naming: "PascalCase"
变量名：getUserInfo → js_variable_naming: "camelCase"
CSS类名：.home-page → css_class_naming: "kebab-case"
```

---

#### 3. const/let 使用偏好
**检测方法**：统计 const 和 let 的使用比例

**输出字段**：
- `const_let_preference`: "const优先" | "按需选择"

**判断规则**：
- const 使用占比 > 70% → "const优先"
- 否则 → "按需选择"

---

#### 4. 箭头函数风格
**检测方法**：检测箭头函数是否总是使用大括号

**输出字段**：
- `arrow_function_braces`: "always" | "single-line-omit"

**示例**：
```javascript
// always
const fn = () => {
    return result
}

// single-line-omit
const fn = () => result
```

---

#### 5. Vue 组件风格
**检测方法**：检测 Vue 文件中是否使用 `<script setup>`

**输出字段**：
- `vue_script_style`: "script-setup" | "options-api"
- `vue_scoped_style`: "always" | "as-needed" | "never"

---

#### 6. React 组件风格
**检测方法**：检测 React 组件定义方式

**输出字段**：
- `react_component_style`: "arrow-function" | "function-declaration"
- `react_hooks_import`: "named-import" | "namespace"
- `react_props_destructuring`: "in-function" | "in-parameters"

**示例**：
```jsx
// arrow-function
const Component = () => { }

// function-declaration
function Component() { }

// named-import
import { useState, useEffect } from 'react'

// namespace
import React from 'react'
```

---

#### 7. CSS 单位偏好
**检测方法**：统计 CSS 中 px 和 rem 的使用频率

**输出字段**：
- `css_unit_preference`: "px" | "rem" | "mixed"

---

#### 8. 大括号风格
**检测方法**：检测 if/for/while 后的大括号位置

**输出字段**：
- `brace_style`: "1tbs" (K&R) | "allman"

**示例**：
```javascript
// K&R风格 (1tbs)
if (condition) {
    // ...
}

// Allman风格
if (condition)
{
    // ...
}
```

---

#### 9. 关键字后空格
**检测方法**：检测 if/for/while 后括号前是否有空格

**输出字段**：
- `space_after_keyword`: true | false

**示例**：
```javascript
if (condition) { }  // true
if(condition) { }   // false
```

---

#### 10. 文件末尾换行符
**检测方法**：检查文件是否以换行符结尾

**输出字段**：
- `final_newline`: true | false

## 执行规则

1. **统计推断**：对每种规则统计出现频率，选择占比 > 60% 的模式
2. **置信度标记**：如果占比在 50%-60% 之间，标记为 `low_confidence`
3. **未找到规则**：如果未扫描到相关代码，标记为 `null`
4. **覆盖配置文件**：如果配置文件已有规则，跳过推断

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
        "react_component_style": null,
        "react_hooks_import": null,
        "react_props_destructuring": null,
        "css_unit_preference": "rem",
        "brace_style": "1tbs",
        "space_after_keyword": true,
        "final_newline": true
    },
    "scannedFiles": {
        "javascript": ["src/utils/utils.js", "src/api/meeting.js"],
        "vue": ["src/views/Home/index.vue", "src/components/MeetingCard.vue"],
        "css": ["src/assets/styles/global.css"]
    },
    "confidence": {
        "html_attribute_quotes": "high",
        "vue_script_style": "high",
        "arrow_function_braces": "medium"
    },
    "stats": {
        "totalFilesScanned": 8,
        "rulesInferred": 12,
        "rulesFromConfig": 8
    }
}
```

## 强约束

- 只读取文件，不修改任何文件
- 扫描每种类型的文件不超过3个
- 必须记录扫描了哪些文件
- 必须为每条推断规则标记置信度
- 输出必须是合法的JSON格式
