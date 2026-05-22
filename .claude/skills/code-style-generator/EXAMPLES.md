# Code Style Generator 使用示例（改进版 v1.1）

## 示例1：Vue3 + TypeScript 项目

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
- tsconfig.json: 存在 ← 新增 v1.1

提取规则：
- indent_style: space
- indent_size: 4
- quotes: single
- semi: false
- tsconfig.strict: true ← 新增 v1.1
- tsconfig.strictNullChecks: true ← 新增 v1.1
```

#### 步骤2：扫描代码推断规则

```
扫描文件：
- src/utils/utils.ts
- src/views/Home/index.vue
- src/components/MeetingCard.vue
- src/composables/useMeeting.ts ← 新增 Vue3 Composition API
- src/types/meeting.ts

推断规则：
- html_attribute_quotes: double
- component_naming: PascalCase
- js_variable_naming: camelCase
- vue_script_style: script-setup ← 新增 v1.1
- composables_naming: camelCase (useMeeting.ts) ← 新增 v1.1
- ts_generic_style: useState<T> ← 新增 v1.1
```

#### 步骤3：生成探测代码（含 edge cases）

```typescript
// TypeScript 规范探测 ← 新增 v1.1
const result = useState<TodoItem | null>(null)  // 泛型在括号外
const loading = ref<boolean>(false)  // ref 带类型
const user = reactive<UserProfile>({ ... })  // reactive 带类型

// Vue3 Composition API 探测 ← 新增 v1.1
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  id: string
  title: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update', value: string): void
}>()

const count = ref(0)
const doubled = computed(() => count.value * 2)
const loading = ref<boolean>(false)
</script>
```

#### 步骤4：用户确认

```
请查看探测代码，确认是否符合你的习惯：

需要补充确认的问题（新增 v1.1）：
1. TypeScript 类型导出策略？（export type / export interface）
2. Vue3 composables 抽离时机？（逻辑 > 3 处 / 按需）
3. React useEffect 依赖数组风格？（空数组 [] / 显式依赖）
```

#### 步骤5：生成文档

```
生成文件：CODE_STYLE.md
规则来源：
- 配置文件：8条
- 代码推断：15条（含 Vue3/TS 专项）
- 用户确认：5条
```

---

## 示例2：TypeScript edge case 探测

### 场景：React + TypeScript 项目

```typescript
// useState 泛型风格测试 ← 新增 v1.1
// 方式A：泛型在括号内
const [user, setUser] = useState<IUser | null>(null)

// 方式B：泛型在括号外
const [user, setUser] = useState<Type>(null)

// 用户修改了原始探测代码：
// 原始：const [count, setCount] = useState(0)
// 用户修改为：
const [count, setCount] = useState<number>(0)

系统：检测到用户修改：
      - TypeScript 泛型风格：统一使用 useState<T> 形式（泛型在括号内）
```

---

## 示例3：Vue3 Composition API 探测

### 项目类型

Vue3 + TypeScript + Composition API

### 探测代码

```vue
<!-- Vue3 规范探测 v1.1 -->
<template>
    <div class="component">
        {{ message }}
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

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

// defineProps 泛型形式
const props = defineProps<Props>()

// defineProps 带默认值
const { title, count = 0 } = withDefaults(defineProps<Props>(), {
    count: 0
})

// emit 定义
const emit = defineEmits<{
    (e: 'update', value: string): void
}>()

const handleClick = () => {
    emit('update', 'new value')
}
</script>

<style scoped lang="scss">
.component {
    color: red;
}
</style>
```

### 补充问题

```
Vue3 Composition API 相关（新增 v1.1）：
1. ref vs reactive 选择偏好？
2. composables 抽离时机？（逻辑复用 > 3 处 / 按需）
3. defineProps 风格？（泛型形式 / withDefaults）
```

---

## 输出示例：CODE_STYLE.md（改进版）

### 新增 TypeScript 章节

```markdown
## TypeScript

### 严格模式
- **strict**: true
- **noImplicitAny**: true
- **strictNullChecks**: true

### 类型导出
- **导出策略**：按需导出（export type / export interface 分开）

### 泛型风格
- **useState泛型**：`useState<T>` 形式（泛型在括号内）
- **ref类型标注**：`ref<Type>` 形式

### 代码示例

```typescript
const [count, setCount] = useState<number>(0)
const loading = ref<boolean>(false)
const user = reactive<UserProfile>({ ... })
```
```

### 新增 Vue3 Composition API 章节

```markdown
## Vue3 Composition API

### Script 风格
- **script setup**：优先使用

### ref vs reactive
- **偏好**：`ref` 优先（primitive types）
- **reactive 使用场景**：复杂对象、表单数据

### Composables
- **命名**：camelCase，前缀 use（如 `useMeeting.ts`）
- **抽离时机**：逻辑复用 >= 3 处

### defineProps / defineEmits
- **风格**：泛型形式（defineProps<Props>）

### 代码示例

```typescript
// ref vs reactive
const count = ref(0)
const user = reactive({ name: '' })

// computed
const doubled = computed(() => count.value * 2)

// defineProps
const props = defineProps<{
    title: string
    count?: number
}>()
```
```

---

## 示例4：规则冲突处理（含 TS 配置）

### 冲突场景

```
配置文件 (.prettierrc.json):
{
    "singleQuote": true
}

代码推断：
- 单引号使用率：45%
- 双引号使用率：55%

tsconfig.json:
{
    "strict": true,
    "strictNullChecks": true
}
```

### 处理流程

```
检测到规则冲突：
- 配置文件：单引号
- 代码实际：双引号（55%）

优先级：配置文件 > 代码推断
采用规则：单引号

TS配置：
- strict: true → 项目使用严格的 TS 规范
- noImplicitAny: true → 不允许隐式 any

在探测代码中高亮显示此规则：
const name = 'single quote'  // ⚠️ 来自配置文件，与代码习惯不同
```

---

*生成时间：2026-05-21*
*规则来源：配置文件[8]，代码推断[15]，用户确认[5]*
*v1.1 新增：TypeScript 配置检测、Vue3 Composition API、React Hooks 专项规则*