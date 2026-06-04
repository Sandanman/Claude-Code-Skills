# Code Style Generator 使用示例（v1.2 韬理论增强版）

## 示例1：Vue3 + TypeScript 项目

### 用户输入

```
生成我的代码习惯文档
```

### 执行流程（v1.2 - 3步骤，K1任务折叠）

#### 步骤1（K1折叠）：detect-and-scan（原 detect-config-rules + scan-code-patterns）

```
检测到配置文件：
- .editorconfig: 存在
- .prettierrc.json: 存在
- eslint.config.js: 存在
- tsconfig.json: 存在

K3协同（规则接管，不消耗模型τ）：
- 框架类型：Vue3（src/**/*.vue 存在）
- tsconfig.strict: true
- tsconfig.strictNullChecks: true

扫描文件：
- src/utils/utils.ts
- src/views/Home/index.vue
- src/components/MeetingCard.vue
- src/composables/useMeeting.ts

推断规则：
- html_attribute_quotes: double
- component_naming: PascalCase
- js_variable_naming: camelCase
- vue_script_style: script-setup
- composables_naming: camelCase
- ts_generic_style: useState<T>
```

#### 步骤2（K1折叠）：generate-and-confirm（原 generate-probe-code + confirm-and-supplement）

展示探测代码，用户确认或修改：

```vue
<!-- Vue3 规范探测 v1.2 -->
<script setup lang="ts">
const count = ref(0)
const doubled = computed(() => count.value * 2)
const props = defineProps<Props>()
</script>
```

补充问题（根据检测到的框架类型，K3协同）：
```
1. ref vs reactive 选择偏好？
2. composables 抽离时机？
```

#### 步骤3：generate-style-document

生成 CODE_STYLE.md（含 τ 分解报告 + pattern 匹配 + quality score）：

```
CODE_STYLE.md 生成完成
τ 总消耗：5180/6000（86%）
τ 折叠：未触发（预算充足）
模式匹配：vue3-ts-standard（相似度85%，τ节省1500）
规则来源：配置文件[8]，代码推断[12]，用户确认[6]
质量评分：综合92 / 完整性95 / 一致性90 / 可行性88
```

---

## 示例2：v1.2 τ 分解报告示例

### τ 分解可视化

```
总预算  █████████████████████  6000
已消耗  ██████████████████    5180   86%  ✅
剩余    ████                  820    14%
```

| 步骤 | τ 预算 | τ 消耗 | 状态 |
|------|--------|--------|------|
| detect-scan | 1500 | 1380 | ✅ 92% |
| generate-confirm | 2500 | 2400 | ✅ 96% |
| doc | 2000 | 1400 | ✅ 70% |
| **总计** | **6000** | **5180** | **86%** |

### Pattern 模式匹配

```
模式匹配结果：
- 匹配模式：vue3-ts-standard
- 成熟度：成熟（出现8次）
- 相似度：85%
- τ 折扣：70%
- τ 节省：1500

复用率：65%（已匹配规则 / 总规则数）
```

---

## 示例3：Vue3 Composition API 探测（v1.2）

### 项目类型

Vue3 + TypeScript + Composition API

### 探测代码

```vue
<!-- Vue3 规范探测 v1.2 -->
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

// emit 定义
const emit = defineEmits<{
    (e: 'update', value: string): void
}>()

const handleClick = () => {
    emit('update', 'new value')
}
</script>
```

### K3协同补充问题

```
K3协同（由规则直接判断，不消耗模型τ）：
- 框架类型：Vue3 ✅ 已确认

用户补充问题（K3协同优化后，最多3个）：
1. ref vs reactive 选择偏好？（ref 优先 / reactive 优先 / 按需选择）
2. composables 抽离时机？（逻辑复用 >= 3处 / 按需抽离 / 始终抽离）
3. defineProps 风格？（泛型形式 / withDefaults / 按需选择）
```

---

## 示例4：TypeScript edge case 探测（v1.2）

### 场景：React + TypeScript 项目

```typescript
// TypeScript 规范探测（含 edge cases）v1.2
const result = useState<TodoItem | null>(null)  // 泛型在括号内
const loading = ref<boolean>(false)  // ref 带类型
const user = reactive<UserProfile>({ ... })  // reactive 带类型

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

### K4模式复用示例

```
检测到已有 CODE_STYLE.md：
- 相似度：85%
- 匹配模式：react-ts-standard（成熟模式，出现12次）
- τ 折扣：70%
- τ 节省：1800

复用规则（来自成熟模式）：
- ts_strict: true → 直接复用
- react_useState_generic: "泛型在括号内" → 直接复用
- react_useCallback_usage: "按需使用" → 直接复用

需补充规则（无法从模式复用）：
- composables_dir: "composables" → 用户确认
- ts_export_type: "export type 独立" → 用户确认
```

---

## 输出示例：CODE_STYLE.md（v1.2 韬理论增强版）

```markdown
# 代码习惯规范

个人编码习惯总结，适用于前端开发（Vue3/React/TypeScript/JavaScript/CSS）。

---

## τ 分解报告（v1.2 新增）

| 步骤 | τ 预算 | τ 消耗 | 状态 |
|------|--------|--------|------|
| detect-scan | 1500 | 1380 | ✅ 92% |
| generate-confirm | 2500 | 2400 | ✅ 96% |
| doc | 2000 | 1400 | ✅ 70% |
| **总计** | **6000** | **5180** | **86%** |

**τ 折叠**：未触发（预算充足）
**τ 节省**：1500（来自模式复用，成熟模式 vue3-ts-standard τ 折扣70%）

---

## 模式匹配结果（v1.2 新增）

| 匹配模式 | 成熟度 | 相似度 | τ 折扣 |
|---------|--------|--------|--------|
| vue3-ts-standard | 成熟（8次） | 85% | 70% |

**复用率**：65%（已匹配规则 / 总规则数）

---

## 基础格式

- **缩进**：4个空格（来自 配置文件）
- **引号**：单引号（来自 用户确认）
- **分号**：无分号（来自 配置文件）
- **行长度**：≤120字符

## TypeScript

- **strict**: true（来自 tsconfig.json）
- **noImplicitAny**: true
- **类型导出策略**: `export type` 独立导出
- **useState 泛型**: `useState<T>` 形式（泛型在括号内）

```typescript
const [count, setCount] = useState<number>(0)
const loading = ref<boolean>(false)
```

## Vue3 Composition API

- **script setup**: 优先使用
- **ref vs reactive**: ref 优先（primitive types）
- **composables 抽离时机**: 逻辑复用 >= 3 处
- **defineProps 风格**: 泛型形式

---

## 总结表格（v1.2）

| 项目 | 规范 | 来源 |
|------|------|------|
| 缩进 | 4个空格 | config |
| 引号 | 单引号 | user |
| TS strict | true | tsconfig |
| TS useState泛型 | 泛型在括号内 | pattern |
| Vue3 script setup | 优先使用 | inferred |
| Vue3 composables | 逻辑复用 >= 3处 | pattern |

---

*生成时间：2026-06-04 10:00:00*
*τ 总消耗：5180/6000（86%）*
*模式匹配：vue3-ts-standard（相似度85%，τ节省1500）*
*质量评分：综合92 / 完整性95 / 一致性90 / 可行性88*
*CODE_STYLE-GENERATOR v1.2（韬理论增强版）*
```

---

## 示例5：K4 模式复用流程（v1.2 新增）

### 场景：已有 CODE_STYLE.md 的 Vue3 项目

#### K4模式匹配检测

```
启动时查询模式库：
- 检测到已有 CODE_STYLE.md
- 模式库匹配结果：
  - vue3-ts-standard: 相似度 85%，成熟模式，τ 折扣 70%
  - vue3-basic: 相似度 72%，成熟模式，τ 折扣 70%

采用策略：
- 相似度 >= 80%，直接复用已有规则（τ → 0）
- 相似度 60-80%，复用 + 用户确认
- 相似度 < 60%，重新检测

复用规则：
- indent: 4空格 ✅
- quotes: single ✅
- ts_strict: true ✅
- vue3_script_setup: always ✅

需重新检测规则：
- composables_naming: 需要扫描当前项目
- react_* : 跳过（未检测到 React）

τ 节省：1500（模式复用）
```

#### K4模式复用效果

```
原始 τ 消耗：6680
模式复用折扣：-1500
最终 τ 消耗：5180（减少 22%）
```

---

## 示例6：τ 超预算触发折叠（v1.2 新增）

### 场景：复杂项目，τ 接近上限

```
τ 状态：
- 总预算：10000
- 已消耗：9200（92%）
- 剩余：800（8%）

τ 预警触发（> 80%）：
⚠️ τ 消耗已达到 92%，接近预算上限

折叠决策：
- fold-trigger-002 触发：剩余 τ < 30% 且深度 > 2
- 可选步骤检测：
  - confirm-and-supplement（用户交互）→ 可折叠为自动模式
  - generate-style-document → 不可折叠（核心步骤）

执行方案：
1. generate-and-confirm 降级为自动确认（跳过用户提问）
2. generate-style-document 完整执行

折叠后 τ 节省：~400
最终 τ 消耗：8800（88%）
```

---

*生成时间：2026-06-04*
*规则来源：配置文件[8]，代码推断[12]，用户确认[6]，模式复用[4]*
*v1.2 韬理论增强版：K1任务折叠(5→3原子skill) + K2技能栈叠 + K3协同设计 + K4模式复用 + τ预算管理*