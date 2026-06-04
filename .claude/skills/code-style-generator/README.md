# Code Style Generator（v1.2 韬理论增强版）

自动检测项目代码规范，生成个人代码习惯文档 `CODE_STYLE.md`。**v1.2 整合华为韬定律四大核心（K1任务折叠、K2技能栈叠、K3协同设计、K4模式复用），τ 消耗减少约 55%。**

## 核心特性

- ✅ **自动检测**：从配置文件和代码推断编码规范
- ✅ **智能推断**：扫描项目代码，推断命名规范、引号习惯等
- ✅ **K1任务折叠**：5原子skill压缩为3，τ减少~40%
- ✅ **K2技能栈叠**：共享上下文直传，下游skill τ 减少~15%
- ✅ **K3协同设计**：框架类型检测规则接管，省模型τ~10%
- ✅ **K4模式复用**：成熟模式τ折扣70%，整体τ节省~10%
- ✅ **τ 预算管理**：分级预算（simple/moderate/complex），超预算触发折叠
- ✅ **用户确认**：生成探测代码片段，用户快速确认或修改
- ✅ **补充提问**：只针对无法自动检测的规则提问
- ✅ **多框架支持**：支持 Vue3、React、Vue2、原生 JavaScript 项目
- ✅ **TypeScript 支持**：检测 tsconfig.json 配置，推断 TS 规范
- ✅ **Vue3 Composition API 专项**：composables 命名、ref vs reactive 等
- ✅ **React Hooks 专项**：泛型 useState、自定义 hooks 规范

## 快速开始

### 触发方式

使用自然语言描述需求：
```
生成我的代码习惯文档
创建代码风格规范文档
生成 CODE_STYLE.md
检测项目代码规范
```

### 执行流程（v1.2 - 3原子skill，K1任务折叠）

```
detect-and-scan（原 detect-config-rules + scan-code-patterns 合并）
         ↓
generate-and-confirm（原 generate-probe-code + confirm-and-supplement 合并）
         ↓
generate-style-document
```

## τ 预算分级（v1.2 新增）

| 复杂度 | 总预算 | detect-scan | generate-confirm | doc |
|--------|--------|-------------|-----------------|-----|
| simple | 3000 | 800 | 1200 | 1000 |
| moderate | 6000 | 1500 | 2500 | 2000 |
| complex | 10000 | 2500 | 4000 | 3500 |

## 新增内容（v1.2，基于韬理论）

### K1 任务折叠
- 原5个原子skill压缩为3个（τ减少约40%）
- `detect-config-rules` + `scan-code-patterns` → `detect-and-scan`
- `generate-probe-code` + `confirm-and-supplement` → `generate-and-confirm`

### K2 技能栈叠
- 所有skill输出强制写入共享上下文 `task_skill.md`
- 下游skill优先从共享上下文读取，无重复文件读取

### K3 协同设计
- 框架类型（Vue3 / React）由规则直接判断，不消耗模型τ
- 配置文件存在性检测由规则直接判断

### K4 模式复用
- 已有 CODE_STYLE.md 时，查询模式库相似度
- 成熟模式（出现 >= 5次）τ 折扣 70%

## 文件结构（v1.2）

```
code-style-generator/
├── SKILL.md                          # 主skill文档（v1.2 韬理论增强版）
├── README.md                         # 使用说明
├── EXAMPLES.md                       # 详细使用示例
└── atomic-skills/
    ├── detect-config-rules/          # detect-and-scan（K1折叠：config + scan）
    │   └── SKILL.md
    ├── scan-code-patterns/           # ⚠️ 已废弃，合并入 detect-config-rules
    │   └── SKILL.md（存根）
    ├── generate-probe-code/          # generate-and-confirm（K1折叠：probe + confirm）
    │   └── SKILL.md
    ├── confirm-and-supplement/      # ⚠️ 已废弃，合并入 generate-probe-code
    │   └── SKILL.md（存根）
    └── generate-style-document/     # 生成最终文档（含 τ 报告 + pattern + quality）
        └── SKILL.md
```

## 检测的规则项

### 配置文件规则（K3协同，规则接管）

| 规则 | 配置文件 | 检测方式 |
|------|---------|---------|
| 缩进 | .editorconfig, .prettierrc | 规则直接读取 |
| 引号 | .prettierrc, eslint | 规则直接读取 |
| 分号 | .prettierrc, eslint | 规则直接读取 |
| 行长度 | .editorconfig, .prettierrc | 规则直接读取 |
| 尾逗号 | .prettierrc | 规则直接读取 |
| 文件末尾换行符 | .editorconfig | 规则直接读取 |
| **TS strict** | **tsconfig.json** | **规则直接读取** |
| **TS noImplicitAny** | **tsconfig.json** | **规则直接读取** |

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

## 质量评估（v1.2 新增）

| 维度 | 说明 |
|------|------|
| overall_score | 综合评分（4维度加权平均） |
| completeness_score | 规则覆盖完整性 |
| consistency_score | 规则一致性（配置/推断/用户） |
| feasibility_score | 技术可行性 |

## 模式匹配（v1.2 新增）

| 模式成熟度 | 出现次数 | τ 折扣 |
|-----------|---------|--------|
| 成熟 | >= 5次 | 70% |
| 成长 | 2-4次 | 40% |
| 试验 | 1次 | 10% |

## 常见问题

### Q1: 什么是 τ 预算管理？（v1.2 新增）

A: τ 是时间常数，代表认知成本。v1.2 为每个复杂度级别分配固定 τ 预算，超出时触发折叠或降级，保证执行效率。

### Q2: 什么是 K1 任务折叠？（v1.2 新增）

A: K1任务折叠：将多个相似的原子skill合并执行。v1.2 将5个原子skill压缩为3个：`detect-and-scan` 合并了 config + scan，`generate-and-confirm` 合并了 probe + confirm。

### Q3: 什么是 K4 模式复用？（v1.2 新增）

A: K4模式复用：识别需求模式库，相似度 >= 0.6 时复用成熟模式。成熟模式（出现 >= 5次）τ 折扣70%，整体τ节省~10%。

### Q4: 为什么有些规则无法自动检测？

A: 某些规则属于"偏好"或"习惯"，无法从代码中推断，例如：函数空行规则、注释风格、调试代码保留规则。

### Q5: 如果我对探测代码不满意怎么办？

A: 可以直接修改探测代码，系统会自动识别你的修改并更新规则。

### Q6: 可以同时支持 Vue 和 React 吗？

A: 可以。系统会检测项目中的文件类型，同时生成两种框架的规范。

---

*Author: Claude Code*
*Version: 1.2.0（韬理论增强版）*
*核心改进：K1任务折叠(5→3原子skill) + K2技能栈叠 + K3协同设计 + K4模式复用 + τ预算管理*