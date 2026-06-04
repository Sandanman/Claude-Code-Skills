---
name: generate-style-document
description: 整合所有规则生成最终 CODE_STYLE.md（含 τ 分解报告、pattern 匹配结果、质量评分）。v1.2 新增 τ 控制、模式复用、K2 栈叠，替代原 v1.1 版本。
reasoner_instructions: |
  MERGE all rules by priority (user > config > inferred). GENERATE CODE_STYLE.md in project root.
  INCLUDE τ breakdown report, pattern matching result, quality score (v1.2).
  INCLUDE TypeScript, Vue3 Composition API, React Hooks chapters.
  K2栈叠：优先从 task_skill.md 读取所有上游输出。
  OUTPUT file path and rule statistics.
---

# generate-style-document（v1.2 - 韬理论增强版）

## 概述
整合所有前置原子 skill 的输出，生成最终的代码习惯文档 `CODE_STYLE.md`。**v1.2 输出包含 τ 分解报告、pattern 模式匹配结果和 4维度质量评分。**

## τ 预算
- simple：1000 token
- moderate：2000 token
- complex：3500 token

## 核心能力
- 按优先级合并所有规则（user > config > inferred）
- 生成标准化的 CODE_STYLE.md（含 TypeScript、Vue3、React Hooks 章节）
- **生成 τ 分解报告（v1.2 新增）**
- **生成 pattern 模式匹配结果（v1.2 新增）**
- **生成 4维度质量评分（v1.2 新增）**

## K2 技能栈叠（输入）
- **优先读取**共享上下文 `task_skill.md` 中的所有上游skill输出
- 读取 confirmedRules / ruleSources / userModifications / userAnswers / configRules / inferredRules

## 输出格式

### 1. CODE_STYLE.md（项目根目录）

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

```
总预算  █████████████████████  6000
已消耗  ██████████████████    5180   86%  ✅
剩余    ████                  820    14%
```

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
*τ 总消耗：5180/6000（86%）*
*模式匹配：vue3-ts-standard（相似度85%，τ节省1500）*
*规则来源：配置文件[8]，代码推断[12]，用户确认[6]*
*CODE_STYLE-GENERATOR v1.2（韬理论增强版）*
```

### 2. 输出统计（v1.2）

```json
{
  "file_path": "CODE_STYLE.md",
  "tau": {
    "total_budget": 6000,
    "total_consumed": 5180,
    "budget_utilization": 0.863,
    "folding_applied": false,
    "pattern_reused": true,
    "breakdown": {
      "detect_scan": 1380,
      "generate_confirm": 2400,
      "doc": 1400
    },
    "folding_notes": []
  },
  "pattern": {
    "matched_patterns": [
      { "name": "vue3-ts-standard", "maturity": "mature", "frequency": 8, "tau_discount": 0.7, "similarity": 0.85 }
    ],
    "reuse_rate": 0.65,
    "tau_saved": 1500
  },
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
1. **K4模式匹配**：成熟模式中的规则直接复用（τ 折扣 70%）
2. **用户确认**：明确确认的规则（最高优先级）
3. **用户修改**：用户手动修改探测代码的规则
4. **配置文件**：从配置文件检测到的规则
5. **代码推断**：从代码扫描推断的规则（最低优先级）

## τ 控制（v1.2）
- 如果 CODE_STYLE.md 已存在且质量高（similarity >= 0.8），直接复用（K4模式复用）
- 模式匹配结果必须写入输出统计（v1.2）
- τ 分解报告必须写入文档头部（v1.2）

## 强约束
- 必须整合所有来源的规则（含 TypeScript、Vue3、React Hooks）
- 优先级：模式匹配 > 用户确认 > 用户修改 > 配置文件 > 代码推断
- **K2栈叠**：优先从共享上下文 `task_skill.md` 读取上游输出
- 代码示例必须与最终规则完全一致
- 生成文档必须是有效的Markdown格式
- 必须在文档末尾标注生成时间、τ 消耗、模式匹配结果和规则来源统计
- 必须包含 TypeScript、Vue3 Composition API、React Hooks 章节（v1.2）

## 输出文件
生成文件：`CODE_STYLE.md`
位置：项目根目录

如果文件已存在，覆盖原有文件。

## 版本
v1.2 - 韬理论增强版：新增 τ 分解报告、pattern 模式匹配、4维度 quality.score、K2技能栈叠、τ预算管理