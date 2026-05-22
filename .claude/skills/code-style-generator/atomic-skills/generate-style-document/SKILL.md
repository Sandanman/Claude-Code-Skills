---
name: generate-style-document
description: 整合所有规则和用户确认，生成最终的个人代码习惯文档 CODE_STYLE.md（含 TypeScript/Vue3/React Hooks 章节）。改进版新增 TS/Vue3/React 章节和完整示例。
reasoner_instructions: |
  MERGE all rules by priority (user > config > inferred). GENERATE CODE_STYLE.md in project root.
  INCLUDE TypeScript, Vue3 Composition API, React Hooks chapters.
  INCLUDE code examples and summary table. OUTPUT file path and rule statistics.
---

# generate-style-document（改进版 v1.1）

## 任务定义

你是原子技能 `generate-style-document`，只负责整合所有规则，生成最终的代码习惯文档（含 TypeScript、Vue3 Composition API、React Hooks 章节）。

## 输入参数

从前面的任务获取：
- `configRules`：从配置文件检测到的规则（含 tsconfig）
- `inferredRules`：从代码推断的规则（含 Vue3/React Hooks/TS 类型）
- `confirmedRules`：用户确认的规则（含 TypeScript、Vue3、React Hooks）
- `ruleSources`：每条规则的来源标签
- `probeCode`：最终的探测代码片段（用于文档示例）
- `userModifications`：用户修改记录
- `userAnswers`：用户补充问答记录

## 文档模板结构

### 1. 标题和引言

```markdown
# 代码习惯规范

个人编码习惯总结，适用于前端开发（Vue3/React/TypeScript/JavaScript/CSS）。

---

## 基础格式
```

### 2. 规则组织（扩展版）

- 基础格式（同 v1.0）
- **TypeScript**（**新增 v1.1**）
  - 严格模式配置
  - 类型导出策略
  - 泛型风格
  - 代码示例
- **Vue3 Composition API**（**新增 v1.1**）
  - script setup 使用
  - ref vs reactive 选择
  - composables 规范
  - defineProps/defineEmits
  - 代码示例
- **React Hooks**（**新增 v1.1**）
  - useState 泛型风格
  - useCallback/useMemo 使用
  - 自定义 hooks 规范
  - useEffect 依赖风格
  - 代码示例
- JavaScript（同 v1.0）
- CSS（同 v1.0）
- 调试代码（同 v1.0）

### 3. 代码示例（扩展版）

使用探测代码片段作为示例，并根据修改后的规则调整：

- HTML 探测片段
- CSS 探测片段
- JavaScript 探测片段
- TypeScript 探测片段（**新增**）
- Vue3 Composition API 探测片段（**新增**）
- React Hooks 探测片段（**新增**）

### 4. 总结表格（扩展版）

```markdown
| 项目 | 规范 | 来源 |
|------|------|------|
| 缩进 | 4个空格 | 配置文件 |
| 引号 | 单引号 | 用户确认 |
| TypeScript strict | true | tsconfig |
| Vue3 script setup | 优先使用 | 代码推断 |
| React useState 泛型 | 泛型在括号内 | 用户确认 |
```

## 规则优先级

按优先级应用规则（高优先级覆盖低优先级）：

1. **用户确认**：明确确认的规则（最高优先级）
2. **用户修改**：用户手动修改探测代码的规则
3. **配置文件**：从配置文件检测到的规则
4. **代码推断**：从代码扫描推断的规则（最低优先级）

## 执行规则

1. **合并规则**：按优先级合并所有规则（含 TypeScript、Vue3、React Hooks）
2. **消除冲突**：如果同一规则有多个值，优先选择高优先级
3. **填充模板**：将规则填充到文档模板中（含新增的 TS/Vue3/React 章节）
4. **生成示例**：调整探测代码示例，使其符合最终规则
5. **生成表格**：创建总结表格（含 TypeScript 和框架特定规则）

### 处理用户修改示例

**原始探测代码**：
```typescript
const [count, setCount] = useState(0)  // 无泛型
const loading = ref(false)              // 无类型标注
```

**用户修改**：
```typescript
const [count, setCount] = useState<number>(0)  // 添加泛型
const loading = ref<boolean>(false)           // 添加类型标注
```

**调整后示例**：
```typescript
const [count, setCount] = useState<number>(0)  // 用户确认使用泛型在括号内
const loading = ref<boolean>(false)            // 用户确认使用 ref<Type>
```

---

## 输出格式

生成的文档格式：

```markdown
# 代码习惯规范

[完整文档内容，含 TypeScript、Vue3、React Hooks 章节]

---
*生成时间：[YYYY-MM-DD HH:mm:ss]*
*规则来源：配置文件[8]，代码推断[15]，用户确认[6]*
*新增 v1.1：TypeScript 配置、Vue3 Composition API、React Hooks 专项规则*
```

## 强约束

- 必须整合所有来源的规则（含 TypeScript、Vue3、React Hooks）
- 优先级：用户确认 > 用户修改 > 配置文件 > 代码推断
- 代码示例必须与最终规则完全一致
- 生成的文档必须是有效的Markdown格式
- 必须在文档末尾标注生成时间和规则来源统计
- 必须包含 TypeScript、Vue3 Composition API、React Hooks 章节（**新增 v1.1**）

## 输出文件

生成文件：`CODE_STYLE.md`
位置：项目根目录

如果文件已存在，覆盖原有文件。

## 示例输出片段

```markdown
### TypeScript

- **strict**: true（来自 tsconfig.json）
- **noImplicitAny**: true
- **类型导出策略**: `export type` 独立导出
- **useState 泛型**: `useState<T>` 形式（泛型在括号内）

```typescript
const [count, setCount] = useState<number>(0)
const loading = ref<boolean>(false)
```

---

### Vue3 Composition API

- **script setup**: 优先使用
- **ref vs reactive**: ref 优先（primitive types）
- **composables 抽离时机**: 逻辑复用 >= 3 处
- **defineProps 风格**: 泛型形式

```typescript
const count = ref(0)
const doubled = computed(() => count.value * 2)
const props = defineProps<Props>()
```

---

### React Hooks

- **useState 泛型**: `useState<T>` 形式（泛型在括号内）
- **useCallback 使用**: 按需使用
- **useEffect 依赖**: 显式依赖数组
- **自定义 hooks 命名**: use 前缀

```typescript
const [count, setCount] = useState<number>(0)
const handleClick = useCallback(() => {}, [])
useEffect(() => { fetchData() }, [id])
```

---

## 总结

| 项目 | 规范 | 来源 |
|------|------|------|
| 缩进 | 4个空格 | 配置文件 |
| 引号 | 单引号 | 用户确认 |
| TS strict | true | tsconfig.json |
| TS useState泛型 | 泛型在括号内 | 用户确认 |
| Vue3 script setup | 优先使用 | 代码推断 |
| Vue3 composables | 逻辑复用 >= 3处 | 用户确认 |
| React useEffect | 显式依赖数组 | 用户确认 |
...
```

## 版本
v1.1 - 改进版：新增 TypeScript 章节、Vue3 Composition API 章节、React Hooks 章节，扩展总结表格