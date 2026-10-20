---
name: generate-style-document
description: 合并已确认的代码规范并生成项目根目录下的 CODE_STYLE.md，同时输出规则统计和质量结果。
reasoner_instructions: |
  MERGE all rules by priority (user > config > inferred). GENERATE CODE_STYLE.md in project root.
  INCLUDE TypeScript, Vue3 Composition API, React Hooks chapters.
  OUTPUT file path and rule statistics.
---


## 概述

## 核心能力
- 按优先级合并所有规则（user > config > inferred）
- 生成标准化的 CODE_STYLE.md（含 TypeScript、Vue3、React Hooks 章节）
- **生成 4维度质量评分（v1.2 新增）**

- **优先读取**共享上下文 `task_skill.md` 中的所有上游skill输出
- 读取 confirmedRules / ruleSources / userModifications / userAnswers / configRules / inferredRules

## 输出格式

### 1. CODE_STYLE.md（项目根目录）

```markdown
# 代码习惯规范

个人编码习惯总结，适用于前端开发（Vue3/React/TypeScript/JavaScript/CSS）。

---

## 基础格式

- **缩进**：4个空格（来自 配置文件）
- **引号**：单引号（来自 用户确认）
- **分号**：无分号（来自 配置文件）
- **行长度**：≤120字符
- **尾逗号**：es5（在必要时）

## TypeScript（v1.2）

- **strict**: true（来自 tsconfig.json）
- **noImplicitAny**: true
- **类型导出策略**: `export type` 独立导出
- **useState 泛型**: `useState<T>` 形式（泛型在括号内）

```typescript
// useState 泛型形式
const [count, setCount] = useState<number>(0)
// ref 类型标注
const loading = ref<boolean>(false)
```

## Vue3 Composition API（v1.2）

- **script setup**: 优先使用
- **ref vs reactive**: ref 优先（primitive types）
- **composables 抽离时机**: 逻辑复用 >= 3 处
- **defineProps 风格**: 泛型形式

```typescript
const count = ref(0)
const doubled = computed(() => count.value * 2)
const props = defineProps<Props>()
```

## React Hooks（v1.2）

- **useState 泛型**: `useState<T>` 形式（泛型在括号内）
- **useCallback 使用**: 按需使用
- **useEffect 依赖**: 显式依赖数组
- **自定义 hooks 命名**: use 前缀

---

## 总结表格（v1.2）

| 项目 | 规范 | 来源 |
|------|------|------|
| 缩进 | 4个空格 | config |
| 引号 | 单引号 | user |
| TS strict | true | tsconfig |
| TS useState泛型 | 泛型在括号内 | user |
| Vue3 script setup | 优先使用 | inferred |
| Vue3 composables | 逻辑复用 >= 3处 | user |
| React useEffect | 显式依赖数组 | user |

---

*生成时间：2026-06-04 10:00:00*
*规则来源：配置文件[8]，代码推断[12]，用户确认[6]*
```

### 2. 输出统计（v1.2）

```json
{
  "file_path": "CODE_STYLE.md",


  "quality": {
    "overall_score": 92,
    "completeness_score": 95,
    "consistency_score": 90,
    "feasibility_score": 88,
    "issues": [],
    "recommendations": []
  },
  "rule_stats": {
    "from_config": 8,
    "from_inferred": 12,
    "from_user": 6,
    "from_pattern": 4,
    "total": 30
  }
}
```

## 规则优先级（v1.2）

按优先级应用规则（高优先级覆盖低优先级）：
2. **用户确认**：明确确认的规则（最高优先级）
3. **用户修改**：用户手动修改探测代码的规则
4. **配置文件**：从配置文件检测到的规则
5. **代码推断**：从代码扫描推断的规则（最低优先级）

## 强约束
- 必须整合所有来源的规则（含 TypeScript、Vue3、React Hooks）
- 代码示例必须与最终规则完全一致
- 生成文档必须是有效的Markdown格式
- 必须包含 TypeScript、Vue3 Composition API、React Hooks 章节（v1.2）

## 输出文件
生成文件：`CODE_STYLE.md`
位置：项目根目录

如果文件已存在，先询问用户选择覆盖、合并、另存为新文件或取消；未经用户确认不得覆盖原有文件。

## 版本
