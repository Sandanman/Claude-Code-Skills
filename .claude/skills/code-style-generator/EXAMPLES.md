# Code Style Generator 使用示例

## 示例1：基础使用

### 用户输入

```
生成我的代码习惯文档
```

### 执行流程

#### 步骤1：检测配置文件

```
检测到配置文件：
- .editorconfig: 存在
- .prettierrc.json: 存在
- eslint.config.js: 存在

提取规则：
- indent_style: space
- indent_size: 4
- quotes: single
- semi: false
...
```

#### 步骤2：扫描代码推断规则

```
扫描文件：
- src/utils/utils.js
- src/views/Home/index.vue
- src/components/MeetingCard.vue
- src/assets/styles/global.css

推断规则：
- html_attribute_quotes: double
- component_naming: PascalCase
- js_variable_naming: camelCase
- css_unit_preference: rem
...
```

#### 步骤3：生成探测代码

```html
<!-- HTML 规范探测 -->
<div class="container" id="main">
    <span class='text'>HTML引号习惯</span>
</div>
```

```javascript
// JavaScript 规范探测
const name = 'single quote'
const hasSemicolon = true;

function test() {
    if (condition) {
        // K&R风格
    }
    return obj
}
```

```vue
<!-- Vue 规范探测 -->
<template>
    <div class="component">
        {{ message }}
    </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('hello')
</script>
```

#### 步骤4：用户确认

```
请查看探测代码，确认是否符合你的习惯：
[展示代码]

需要补充确认的问题：
1. 函数空行规则？
2. 业务模块注释格式？
3. 注释风格？
4. 调试代码处理？
```

#### 步骤5：生成文档

```
生成文件：CODE_STYLE.md
规则来源：
- 配置文件：8条
- 代码推断：12条
- 用户确认：4条
```

---

## 示例2：用户修改探测代码

### 用户反馈

用户修改了探测代码：

```javascript
// 原始
const name = 'single quote'
const age = "double quote"
const hasSemicolon = true;

// 用户修改
const name = 'single quote'
const age = 'double quote'  // 改为单引号
const hasSemicolon = true   // 保留分号
```

### 系统响应

```
检测到用户修改：
- 引号规则：统一使用单引号（从混合改为单引号）
- 分号规则：使用分号（从配置文件的"不使用"改为"使用"）

规则优先级：用户修改 > 配置文件
已更新规则列表。
```

---

## 示例3：多框架项目

### 项目类型

同时包含 Vue 和 React 文件

### 执行流程

#### 步骤1：扫描代码

```
检测到框架：
- Vue文件：src/views/**/*.vue
- React文件：src/components/**/*.jsx

分别扫描两种文件类型...
```

#### 步骤2：生成探测代码

```vue
<!-- Vue 规范探测 -->
<script setup>
import { ref } from 'vue'
</script>
```

```jsx
// React 规范探测
import { useState } from 'react'

const Component = () => {
    const [count, setCount] = useState(0)
    return <div>{count}</div>
}
```

#### 步骤3：补充问题

```
Vue相关：
- scoped样式使用规则？

React相关：
- 条件渲染偏好？
- 列表渲染返回方式？
- 事件处理函数定义？
```

#### 步骤4：生成文档

```markdown
# 代码习惯规范

## Vue

### Script风格
- **script setup**

### 样式作用域
- **按需选择**

---

## React

### 组件定义
- **箭头函数组件**

### Hooks导入
- **按需导入**

### 条件渲染
- **三元表达式（二选一）/ &&短路（单一情况）**

### 列表渲染
- **map显式return**
```

---

## 示例4：配置文件缺失

### 项目状态

缺少 `.prettierrc` 和 `eslint.config.js`

### 执行流程

#### 步骤1：检测配置文件

```
检测到配置文件：
- .editorconfig: 存在
- .prettierrc.json: 不存在
- eslint.config.js: 不存在

仅提取到少量规则：
- indent_style: space
- indent_size: 4
- end_of_line: lf
```

#### 步骤2：增加代码推断

```
配置文件规则较少，增加代码扫描范围：
- JavaScript文件：5个
- Vue文件：5个
- CSS文件：3个

推断规则：
- quotes: single (置信度：高)
- semi: false (置信度：高)
- trailing_comma: none (置信度：中)
...
```

#### 步骤3：生成探测代码

```
由于配置文件缺失，生成的探测代码包含更多规则选项：
[详细代码]
```

#### 步骤4：增加确认问题

```
配置文件未定义的规则需要确认：
1. 引号使用偏好？
2. 分号使用偏好？
3. 行长度限制？
4. 尾逗号保留？
...
```

---

## 示例5：规则冲突处理

### 冲突场景

```
配置文件 (.prettierrc.json):
{
    "singleQuote": true
}

代码推断：
- 单引号使用率：45%
- 双引号使用率：55%
```

### 处理流程

```
检测到规则冲突：
- 配置文件：单引号
- 代码实际：双引号（55%）

优先级：配置文件 > 代码推断

采用规则：单引号

在探测代码中高亮显示此规则：
const name = 'single quote'  // ⚠️ 来自配置文件，与代码习惯不同
```

---

## 输出示例

### 生成的 CODE_STYLE.md 结构

```markdown
# 代码习惯规范

个人编码习惯总结，适用于前端开发（Vue/React/JavaScript/CSS）。

---

## 基础格式

### 缩进
- **4个空格**

### 引号
- HTML属性：双引号
- JavaScript/CSS：单引号

### 分号
- **不使用分号**

### 大括号
- **K&R风格**

...

---

## JavaScript

### 变量声明
- **const优先**

...

---

## Vue

### Script风格
- **script setup**

...

---

## React

### 组件定义
- **箭头函数组件**

...

---

## CSS

### 命名风格
- **kebab-case**

### 单位
- **rem相对单位**

...

---

## 代码示例

### Vue组件完整示例

```vue
<template>
    ...
</template>

<script setup>
...
</script>
```

### React组件完整示例

```jsx
import { useState } from 'react'

const Component = () => {
    ...
}

export default Component
```

---

## 总结

| 项目 | 规范 |
|------|------|
| 缩进 | 4个空格 |
| 引号 | HTML双引号，JS单引号 |
| ... | ... |

---

*生成时间：2026-04-02 18:30:00*
*规则来源：配置文件[8]，代码推断[12]，用户确认[5]*
```
