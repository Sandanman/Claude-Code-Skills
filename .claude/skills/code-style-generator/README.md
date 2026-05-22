# Code Style Generator Skill（改进版 v1.1）

自动检测项目代码规范，生成个人代码习惯文档 `CODE_STYLE.md`。**改进版新增 TypeScript 配置检测、Vue3 Composition API / React Hooks 专项规则。**

## 核心特性

- ✅ **自动检测**：从配置文件和代码推断编码规范
- ✅ **智能推断**：扫描项目代码，推断命名规范、引号习惯等
- ✅ **用户确认**：生成探测代码片段，用户快速确认或修改
- ✅ **补充提问**：只针对无法自动检测的规则提问
- ✅ **多框架支持**：支持 Vue3、React、Vue2、原生 JavaScript 项目
- ✅ **TypeScript 支持**：检测 tsconfig.json 配置，推断 TS 规范
- ✅ **Vue3 Composition API 专项**：composables 命名、ref vs reactive 等
- ✅ **React Hooks 专项**：泛型 useState、自定义 hooks 规范
- ✅ **优先级合并**：智能合并不同来源的规则

## 快速开始

### 触发方式

使用自然语言描述需求：

```
生成我的代码习惯文档
创建代码风格规范文档
生成 CODE_STYLE.md
检测项目代码规范
```

### 执行流程

```
用户输入
    ↓
检测配置文件 (.editorconfig, .prettierrc, eslint, tsconfig.json)
    ↓
扫描代码推断规范 (naming, quotes, style, Vue3, React Hooks)
    ↓
生成探测代码片段（含 edge cases）
    ↓
用户确认与补充
    ↓
生成 CODE_STYLE.md
```

## 新增内容（v1.1）

### TypeScript 配置检测
- `strict` / `noImplicitAny` / `strictNullChecks`
- `esModuleInterop` / `allowSyntheticDefaultImports`
- `moduleResolution` / `jsx`
- 自动推断项目的 TS 严格程度

### Vue3 Composition API 规则
- `script setup` vs `options-api` 使用偏好
- `ref` vs `reactive` 选择偏好
- `composables` 目录命名和文件命名
- `defineProps` / `defineEmits` 使用风格
- `watch` vs `watchEffect` 选择

### React Hooks 规则
- `useState` 泛型风格：`useState<string>` vs `useState(Type)`
- `useCallback` / `useMemo` 使用场景偏好
- 自定义 hooks 命名：use 前缀、返回值类型
- `useEffect` 依赖数组风格

## 文件结构

```
code-style-generator/
├── SKILL.md                          # 主skill文档（v1.1 改进版）
├── README.md                         # 使用说明
├── EXAMPLES.md                       # 详细使用示例（更新）
└── atomic-skills/
    ├── detect-config-rules/          # 检测配置文件规则（新增 TS 配置）
    │   └── SKILL.md
    ├── scan-code-patterns/           # 扫描代码推断规则（新增 Vue3/React Hooks）
    │   └── SKILL.md
    ├── generate-probe-code/         # 生成探测代码（新增 edge cases）
    │   └── SKILL.md
    ├── confirm-and-supplement/       # 用户确认与补充（优化反馈收集）
    │   └── SKILL.md
    └── generate-style-document/     # 生成最终文档（新增 TS/Vue3/React 章节）
        └── SKILL.md
```

## 检测的规则项

### 配置文件规则（自动检测）

| 规则 | 配置文件 | 检测方式 |
|------|---------|---------|
| 缩进 | .editorconfig, .prettierrc | 直接读取 |
| 引号 | .prettierrc, eslint | 直接读取 |
| 分号 | .prettierrc, eslint | 直接读取 |
| 行长度 | .editorconfig, .prettierrc | 直接读取 |
| 尾逗号 | .prettierrc | 直接读取 |
| 文件末尾换行符 | .editorconfig | 直接读取 |
| **TS strict** | **tsconfig.json** | **直接读取** |
| **TS noImplicitAny** | **tsconfig.json** | **直接读取** |

### 代码推断规则（自动推断）

| 规则 | 推断方法 |
|------|---------|
| HTML属性引号 | 统计 HTML 标签属性中的引号使用频率 |
| 组件命名规范 | 分析文件名（PascalCase/kebab-case） |
| 变量命名规范 | 分析变量名（camelCase/snake_case） |
| CSS类名命名 | 分析 CSS 类名（kebab-case/BEM） |
| const/let使用 | 统计 const 和 let 的使用比例 |
| 箭头函数风格 | 检测箭头函数是否总是使用大括号 |
| Vue Script风格 | 检测是否使用 `<script setup>` |
| **Vue3 composables** | **检测 composables 目录和文件命名** |
| **React hooks 泛型** | **检测 useState 泛型风格** |

### 用户确认规则（交互式提问）

| 规则 | 提问方式 |
|------|---------|
| 函数空行规则 | AskUserQuestion (选项) |
| 业务模块注释格式 | AskUserQuestion (选项) |
| 条件渲染偏好 | AskUserQuestion (选项) |
| 列表渲染方式 | AskUserQuestion (选项) |
| 注释风格 | AskUserQuestion (选项) |
| 调试代码处理 | AskUserQuestion (选项) |
| **TS 类型导出策略** | **AskUserQuestion (选项)** |
| **Vue3 composables 抽离时机** | **AskUserQuestion (选项)** |
| **React useEffect 依赖风格** | **AskUserQuestion (选项)** |

## 优势对比

### 相比纯提问方式

| 方案 | 问题数量 | 用户负担 | 准确性 |
|------|---------|---------|--------|
| 纯提问方式 | 20+ | 高 | 依赖用户记忆 |
| 本方案 | 3-5 | 低 | 基于实际代码 |

### 相比纯代码检测

| 方案 | 交互性 | 灵活性 | 覆盖率 |
|------|--------|--------|--------|
| 纯代码检测 | 无 | 低 | 无法检测偏好规则 |
| 本方案 | 有 | 高 | 覆盖所有规则类型 |

## 最佳实践

1. **配置文件优先**：建议项目使用 `.editorconfig`、`.prettierrc` 和 `tsconfig.json`，可大幅减少提问
2. **代码一致性**：保持代码风格一致，提高推断准确性
3. **TypeScript 项目**：建议配置 `strict: true`，提高代码质量
4. **Vue3 项目**：建议使用 `<script setup>`，提高开发效率
5. **及时更新**：修改编码习惯后，重新生成文档
6. **版本控制**：将 `CODE_STYLE.md` 加入 Git，方便团队同步

## 常见问题

### Q1: 为什么有些规则无法自动检测？

A: 某些规则属于"偏好"或"习惯"，无法从代码中推断，例如：
- 函数空行规则（业务逻辑分组）
- 注释风格（JSDoc/简洁）
- 调试代码保留规则

### Q2: 如果我对探测代码不满意怎么办？

A: 可以直接修改探测代码，系统会自动识别你的修改并更新规则。

### Q3: 可以同时支持 Vue 和 React 吗？

A: 可以。系统会检测项目中的文件类型，同时生成两种框架的规范。

### Q4: TypeScript 项目的规则如何检测？

A: 系统会读取 `tsconfig.json` 文件，提取 `strict`、`noImplicitAny`、`strictNullChecks` 等配置，并根据代码推断泛型风格和类型使用偏好。

### Q5: Vue3 Composition API 规则包括哪些？

A: 包括 `<script setup>` 使用偏好、ref vs reactive 选择、composables 目录和命名、`defineProps` 用法、watch vs watchEffect 选择等。

---

*Author: Claude Code*
*Version: 1.1.0（改进版）*