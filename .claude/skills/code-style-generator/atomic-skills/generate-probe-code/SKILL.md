---
name: generate-probe-code
description: 生成覆盖所有代码规范的精简探测代码片段，供用户快速确认和修改
reasoner_instructions: |
  COMBINE configRules and inferredRules. GENERATE minimal code snippets (HTML/CSS/JS/Vue/React).
  MARK rule sources and conflicts. OUTPUT Markdown with code examples and rule statistics.
---

# generate-probe-code

## 任务定义

你是原子技能 `generate-probe-code`，只负责生成覆盖所有规则的精简代码片段，供用户确认。

## 输入参数

从前面的任务获取：
- `configRules`：从配置文件检测到的规则
- `inferredRules`：从代码推断的规则

## 生成的代码片段

### 1. HTML 探测代码

```html
<!-- HTML 规范探测 -->
<div class="container" id="main">
    <span class='text'>HTML引号习惯</span>
    <button onclick="handleClick('cancel')">属性中有字符串</button>
</div>
```

**覆盖规则**：
- HTML属性引号习惯
- 属性中字符串引号习惯

---

### 2. CSS 探测代码

```css
/* CSS 规范探测 */
.container {
    width: 100px;    /* px单位 */
    width: 10rem;    /* rem单位 */
    color: red;
}
```

**覆盖规则**：
- CSS单位偏好（px/rem）
- CSS命名风格（kebab-case）

---

### 3. JavaScript 探测代码

```javascript
// JavaScript 规范探测
const name = 'single quote'
const age = "double quote"
const hasSemicolon = true;

function test() {
    const obj = {
        key: 'value',
        nested: {
            data: 123
        }
    }

    if (condition) {
        // K&R风格
    }

    if(condition) {
        // 无空格风格
    }

    return obj
}

const fn = () => {
    return result
}

const fn2 = () => result
```

**覆盖规则**：
- 引号习惯（单引号/双引号）
- 分号习惯
- 大括号风格（K&R / Allman）
- 空格规则（if/for/while括号）
- const/let使用
- 箭头函数大括号
- 尾逗号

---

### 4. Vue 探测代码

```vue
<!-- Vue 规范探测 -->
<template>
    <div class="component" @click="handleClick">
        {{ message }}
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ChildComponent from './Child.vue'

const message = ref('hello')

const handleClick = () => {
    console.log('clicked')
}
</script>

<script>
import { ref } from 'vue'

export default {
    setup() {
        const message = ref('hello')
        return { message }
    }
}
</script>

<style scoped lang="less">
.component {
    color: red;
}
</style>
```

**覆盖规则**：
- Vue组件命名（PascalCase）
- Vue Script风格（script setup / Options API）
- Vue API导入（按需导入 / 全量导入）
- 样式作用域（scoped）

---

### 5. React 探测代码

```jsx
// React 规范探测
import { useState, useEffect } from 'react'
import React from 'react'

function Component(props) {
    const { name, age } = props
    const [count, setCount] = useState(0)

    return (
        <div className="wrapper">
            <span className='text'>{count}</span>
        </div>
    )
}

const Component2 = (props) => {
    const { name, age } = props

    return (
        <div className="wrapper">
            <span>{name}</span>
        </div>
    )
}

export default Component
```

**覆盖规则**：
- React组件定义方式（箭头函数 / function声明）
- Hooks导入方式（按需导入 / React命名空间）
- Props解构方式（函数内解构 / 参数解构）
- 导出方式（底部导出 / 定义时导出）

---

## 执行规则

1. **合并规则**：将 `configRules` 和 `inferredRules` 合并
2. **生成代码**：根据合并后的规则生成探测代码
3. **标记不一致**：高亮显示配置文件规则与代码推断不一致的地方
4. **提供选项**：为每个规则提供常见选项

## 输出格式

```markdown
# 代码规范探测片段

请查看以下代码片段，确认是否符合你的编码习惯。如有不一致，请直接修改代码。

---

## 1. HTML 规范

```html
<div class="container" id="main">
    <span class='text'>HTML引号习惯</span>
    <button onclick="handleClick('cancel')">属性中有字符串</button>
</div>
```

**检测到的规则**：
- HTML属性引号：**双引号**
- 属性中字符串引号：**单引号**

---

## 2. CSS 规范

```css
.container {
    width: 10rem;
    color: red;
}
```

**检测到的规则**：
- CSS单位：**rem**
- CSS命名：**kebab-case**

---

## 3. JavaScript 规范

```javascript
const name = 'single quote'
const age = "double quote"
const hasSemicolon = true;

function test() {
    const obj = {
        key: 'value',
        nested: {
            data: 123
        }
    }

    if (condition) {
        // K&R风格
    }

    return obj
}

const fn = () => {
    return result
}
```

**检测到的规则**：
- 引号：**单引号**
- 分号：**不使用**
- 大括号：**K&R风格**
- 空格：**if后有空格**
- 尾逗号：**不保留**

---

## 4. Vue 规范

[根据项目是否存在Vue文件决定是否显示]

---

## 5. React 规范

[根据项目是否存在React文件决定是否显示]

---

## ⚠️ 需要确认的地方

以下规则无法自动检测，请稍后回答：

1. **函数空行规则**：同模块函数之间是否需要空行？
2. **业务模块注释**：不同业务模块之间如何分割？
3. **条件渲染偏好**：三元表达式 or &&短路？
4. **列表渲染方式**：map显式return or 隐式return？
5. **调试代码处理**：是否允许console.log？

---

## 📊 规则来源统计

| 来源 | 数量 | 占比 |
|------|------|------|
| 配置文件 | 8 | 40% |
| 代码推断 | 7 | 35% |
| 需要确认 | 5 | 25% |
```

## 强约束

- 必须生成所有5种代码片段（即使某些为空）
- 必须明确标记规则来源（配置文件/代码推断）
- 必须列出需要用户确认的规则
- 输出格式必须是Markdown
- 探测代码必须简洁，每个片段不超过20行
