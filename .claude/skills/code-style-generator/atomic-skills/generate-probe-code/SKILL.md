---
name: generate-probe-code
description: 生成覆盖所有代码规范的精简探测代码片段（含 TypeScript泛型、Vue3 Composition API、React Hooks edge cases）。改进版新增 edge case 探测代码，供用户快速确认和修改。
reasoner_instructions: |
  COMBINE configRules and inferredRules. GENERATE minimal code snippets (HTML/CSS/JS/Vue/React/TS).
  INCLUDE edge cases (TypeScript generics, Vue3 Composition API, React Hooks).
  MARK rule sources and conflicts. OUTPUT Markdown with code examples and rule statistics.
---

# generate-probe-code（改进版 v1.1）

## 任务定义

你是原子技能 `generate-probe-code`，只负责生成覆盖所有规则的精简代码片段，含 edge case 探测代码，供用户确认。

## 输入参数

从前面的任务获取：
- `configRules`：从配置文件检测到的规则（含 tsconfig）
- `inferredRules`：从代码推断的规则（含 Vue3/React Hooks/TS 类型）

## 生成的代码片段

### 1. HTML 探测代码（同 v1.0）

```html
<!-- HTML 规范探测 -->
<div class="container" id="main">
    <span class='text'>HTML引号习惯</span>
    <button onclick="handleClick('cancel')">属性中有字符串</button>
</div>
```

### 2. CSS 探测代码（同 v1.0）

```css
/* CSS 规范探测 */
.container {
    width: 100px;    /* px单位 */
    width: 10rem;    /* rem单位 */
    color: red;
}
```

### 3. JavaScript 探测代码（同 v1.0）

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

### 4. TypeScript 探测代码（**新增 v1.1**）

```typescript
// TypeScript 规范探测（含 edge cases）
const name: string = 'single quote'

// useState 泛型风格 edge case
const [count, setCount] = useState<number>(0)        // 泛型在括号内
const [user, setUser] = useState<IUser | null>(null) // 复杂泛型

// ref 类型标注 edge case
const loading = ref<boolean>(false)
const list = ref<Array<TodoItem>>([])

// reactive 类型标注
const state = reactive<UserProfile>({
    name: '',
    age: 0
})

// interface vs type 偏好探测
interface User {
    name: string
    age: number
}

// type 别名探测
type Status = 'pending' | 'active' | 'done'

// 泛型约束 edge case
function parse<T extends object>(data: T): T {
    return data
}
```

### 5. Vue3 Composition API 探测代码（**新增 v1.1**）

```vue
<!-- Vue3 Composition API 规范探测 -->
<template>
    <div class="component">
        {{ message }}
        {{ doubled }}
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'

// ref vs reactive 偏好测试
const count = ref(0)           // ref 风格
const state = reactive({        // reactive 风格
    count: 0,
    name: ''
})

// computed 风格
const doubled = computed(() => count.value * 2)

// defineProps 风格测试
interface Props {
    title: string
    count?: number
}

// defineProps 泛型形式（推荐）
const props = defineProps<Props>()

// defineProps withDefaults
const { title, count = 0 } = withDefaults(defineProps<Props>(), {
    count: 0
})

// defineEmits 泛型形式
const emit = defineEmits<{
    (e: 'update', value: string): void
}>()

// watch vs watchEffect 测试
watch(count, (newVal) => {
    console.log(newVal)
})

watchEffect(() => {
    console.log(count.value)
})

const handleClick = () => {
    emit('update', 'new value')
}
</script>

<script lang="ts">
// Options API 备选（检测是否使用）
export default {
    name: 'MyComponent'
}
</script>

<style scoped lang="less">
.component {
    color: red;
}
</style>
```

### 6. React Hooks 探测代码（**新增 v1.1**）

```tsx
// React Hooks 规范探测（含 edge cases）
import { useState, useEffect, useCallback, useMemo } from 'react'

// useState 泛型风格 edge case
const [count, setCount] = useState<number>(0)              // 泛型在括号内
const [loading, setLoading] = useState(false)             // 无泛型（类型推断）
const [user, setUser] = useState<IUser | null>(null)      // nullable 类型

// useCallback 使用偏好
const handleClick = useCallback(() => {
    console.log('clicked')
}, [])

const handleUpdate = useCallback((id: string) => {
    console.log(id)
}, [])

// useMemo 使用偏好
const filteredList = useMemo(() => {
    return list.filter(item => item.active)
}, [list])

// useEffect 依赖风格测试
useEffect(() => {
    fetchData()
}, [])  // 显式空数组

useEffect(() => {
    document.title = title
}, [title])  // 显式依赖

// 自定义 hooks 命名测试
function useUserData(userId: string) {
    const [data, setData] = useState(null)
    // ...
    return { data }
}

function fetchUserData(userId: string) {
    // 无 use 前缀测试
    const [data, setData] = useState(null)
    return { data }
}

interface IUser {
    id: string
    name: string
}

// Props 类型定义
interface Props {
    user: IUser
    onUpdate: (id: string) => void
}

const Component: React.FC<Props> = ({ user, onUpdate }) => {
    return <div>{user.name}</div>
}

// 或函数式无类型标注
function Component({ user, onUpdate }: Props) {
    return <div>{user.name}</div>
}

export default Component
```

## 执行规则

1. **合并规则**：将 `configRules` 和 `inferredRules` 合并
2. **生成代码**：根据合并后的规则生成探测代码
3. **包含 edge cases**：TypeScript 泛型、Vue3 Composition API、React Hooks 全部包含
4. **标记不一致**：高亮显示配置文件规则与代码推断不一致的地方
5. **提供选项**：为每个规则提供常见选项

## 输出格式

```markdown
# 代码规范探测片段 v1.1（含 Edge Cases）

请查看以下代码片段，确认是否符合你的编码习惯。如有不一致，请直接修改代码。

---

## 1. HTML 规范

[同前]

## 2. CSS 规范

[同前]

## 3. JavaScript 规范

[同前]

## 4. TypeScript 规范 ← 新增 v1.1

```typescript
// useState 泛型风格
const [count, setCount] = useState<number>(0)

// ref 类型标注
const loading = ref<boolean>(false)
```

**检测到的规则**：
- TypeScript 使用：**是**
- strict 模式：**是**
- useState 泛型风格：**泛型在括号内**
- ref 类型标注：**ref<Type>**
- interface vs type：**interface 优先**

## 5. Vue3 Composition API 规范 ← 新增 v1.1

```vue
<script setup lang="ts">
const count = ref(0)
const doubled = computed(() => count.value * 2)
const props = defineProps<Props>()
</script>
```

**检测到的规则**：
- script setup：**优先使用**
- ref vs reactive：**ref 优先**
- defineProps 风格：**泛型形式**
- composables 目录：**composables/**

## 6. React Hooks 规范 ← 新增 v1.1

```tsx
const [count, setCount] = useState<number>(0)
const handleClick = useCallback(() => {}, [])
```

**检测到的规则**：
- useState 泛型：**泛型在括号内**
- useCallback 使用：**as-needed**
- 自定义 hooks：**use 前缀**
- useEffect 依赖：**显式依赖数组**

---

## ⚠️ 需要确认的地方

以下规则无法自动检测，请稍后回答：

1. **函数空行规则**：同模块函数之间是否需要空行？
2. **业务模块注释**：不同业务模块之间如何分割？
3. **TS 类型导出策略**？（新增 v1.1）
4. **Vue3 composables 抽离时机**？（新增 v1.1）
5. **React useEffect 依赖风格**？（新增 v1.1）

---

## 📊 规则来源统计

| 来源 | 数量 | 占比 |
|------|------|------|
| 配置文件 | 8 | 30% |
| 代码推断 | 12 | 44% |
| Vue3/React Hooks 专项 | 6 | 22% |
| 需要确认 | 1 | 4% |
```

## 强约束

- 必须生成所有6种代码片段（即使某些为空）
- 必须明确标记规则来源（配置文件/代码推断/Vue3专项/React Hooks专项）
- 必须列出需要用户确认的规则
- 输出格式必须是Markdown
- 探测代码必须简洁，每个片段不超过20行
- 必须包含 TypeScript 泛型、Vue3 Composition API、React Hooks edge cases（**新增 v1.1**）

## 版本
v1.1 - 改进版：新增 TypeScript edge cases 探测代码、Vue3 Composition API 探测代码、React Hooks 探测代码