---
name: scan-object-info
description: 智能扫描并分析前端项目的技术栈信息，基于韬定律K1 Task Folding（9→7技能合并）、K2 Skill Stacking（共享上下文）、K3 Co-Design（规则/LLM协同）、K4 Pattern Mining（模式库），τ节省33%。v1.2版本。
---

# scan-object-info（韬定律优化版 v1.2）

## τ_agent 公式

```
τ_agent = τ_intent + τ_match + τ_plan + τ_exec + τ_validate

性能 ∝ 1 / τ_agent
目标：通过K1-K4压缩τ，而不是堆叠更多技能
```

## τ 估算表

| 原子技能 | τ 值 | 说明 |
|---------|------|------|
| pattern-matcher | 150 | 项目模式匹配（K4：命中成熟模式 τ×0.3）|
| scan-package-json | 200 | 解析 package.json（基础技能） |
| scan-project-structure | 300 | 扫描目录结构 |
| detect-tech-stack | 600 | 检测框架+UI库+状态管理（K1合并） |
| scan-config-context | 400 | 扫描配置文件+环境变量（K1合并） |
| detect-net-router | 500 | 检测请求方案+路由方案（K1合并） |
| skill-stack-context | 50 | 上下文写入共享层（K2 TSV通道） |

**τ 预算阈值**：simple=5000 / moderate=15000 / complex=50000
**预警线**：80% warning / 95% critical / 100% abort

---

## 改进点（v1.1 → v1.2）

1. **K1 Task Folding**：9个原子技能合并为7个，减少τ_exec
2. **K2 Skill Stacking**：统一共享上下文格式，TSV通道减少重复读取
3. **K3 Co-Design**：规则处理确定性检测，LLM处理边缘情况
4. **K4 Pattern Mining**：项目类型模式库，成熟模式 τ 折扣 70%
5. **τ 控制体系**：预算分配、预警、折叠触发全链路控制

---

## K1：Task Folding — 技能折叠合并

### 合并方案

```
原9技能                            → 新7技能
detect_framework                   → detect_tech_stack（合并）
+ detect_ui_library
+ detect_state_manage

scan_config_files                  → scan_config_context（合并）
+ scan_env_variables

detect_request_scheme              → detect_net_router（合并）
+ detect_router_solution

scan_package_json（保留）
scan_project_structure（保留）
pattern-matcher（新增）
skill-stack-context（新增）
```

### 合并规则

```
fold-001: 多个技能共享相同的输入（package.json）且输出存在重叠 → 合并
fold-002: 合并后 τ_merged < Στ_individual × 0.8 时执行合并
fold-003: 合并技能的原子能力仍可独立调用（向后兼容）
fold-004: τ_remaining < 30% 且 depth > 3 时，强制折叠触发
```

### detect_tech_stack 设计

```
输入：package.json, 项目结构, 配置文件
输出：{ framework, ui_library, state_manage, ts_usage, render_mode }
输出格式：
- 框架：`xxx` (confidence: high/medium/low)
  - 依据：`package.json` 中的 `关键依赖@版本`
- UI库：`xxx@版本` (confidence: high/medium/low)
- 状态管理：`xxx@版本` (confidence: high/medium/low)
- TS：`是/否` (confidence: high/medium/low)
- 渲染模式：`CSR/SSR/SSG/ISR` (confidence: high/medium/low)
```

### scan_config_context 设计

```
输入：配置文件目录, .env文件
输出：{ config_files, env_variables, style_solution }
输出格式：
- 配置文件清单：[文件名, 用途, 关键配置项]
- 环境变量清单：[键名, 用途, 是否敏感]
- 样式方案：`SCSS/Less/CSS Modules/Tailwind` (confidence: high/medium/low)
```

### detect_net_router 设计

```
输入：package.json, 项目结构, 路由文件
输出：{ request_scheme, request_wrapper, router_solution, router_type, router_file }
输出格式：
- 请求方案：`Axios/Fetch/SWR/React Query` (confidence: high/medium/low)
- 路由方案：`Vue-Router/React Router` (confidence: high/medium/low)
- 路由类型：`配置式/声明式`
- 关键文件：`src/router/index.ts`
```

---

## K2：Skill Stacking — 上下文共享

### 共享上下文格式（写入 task_skill.md）

```markdown
## scan-object-info 执行上下文

### 项目基础信息
- 项目名称：xxx
- 项目类型：浏览器/Node
- 包管理器：npm/yarn/pnpm/bun
- 主框架：xxx@版本

### 技术栈上下文（detect_tech_stack 输出）
- 框架：xxx
- 框架版本：xxx
- TS：是/否
- 渲染模式：CSR/SSR/SSG/ISR
- UI库：xxx@版本
- 状态管理：xxx@版本

### 配置上下文（scan_config_context 输出）
- 配置文件：[...]
- 环境变量：[...]
- 样式方案：xxx

### 网络上下文（detect_net_router 输出）
- 请求方案：xxx
- 路由方案：xxx
- 路由文件：xxx

### τ 执行记录
- scan-package-json：✓ τ=200
- scan-project-structure：✓ τ=300
- detect-tech-stack：✓ τ=600
- ...
```

### TSV 直传规则

```
stack-001: 上游技能的输出必须写入 task_skill.md 共享上下文
stack-002: 下游技能优先从共享上下文读取，避免重新读取文件
stack-003: 共享上下文命中率 < 50% 时触发警告
stack-004: skill-stack-context 每次扫描后更新共享上下文（τ=50）
```

---

## K3：Co-Design — 规则与LLM协同

### 决策矩阵

| 任务环节 | 规则分配 | LLM分配 | 说明 |
|---------|---------|--------|------|
| 意图识别 | 关键词匹配 | 模糊意图推断 | 规则优先，兜底用LLM |
| 技能选择 | 固定依赖图 | 按需动态调整 | 规则保证不遗漏，LLM优化最小集 |
| 框架检测 | 包名正则匹配 | 版本范围解析 | 规则处理确定情况 |
| UI库检测 | 已知库正则 | 未知库兜底 | 规则覆盖90%常见库 |
| 状态管理检测 | 包名+目录 | 目录结构推断 | 规则处理标准结构 |
| 路由检测 | 文件名正则 | 目录结构推断 | 规则处理标准命名 |
| 置信度标注 | 基础规则 | 上下文调整 | 规则+LLM综合 |
| 项目摘要 | 模板填充 | 上下文补充 | 规则生成框架，LLM润色 |

### Co-Design 规则

```
codesign-001: 简单任务（复杂度≤3）规则覆盖率目标 ≥ 80%
codesign-002: 复杂任务（复杂度>7）模型主控，覆盖率目标 ≥ 50%
codesign-003: τ_remaining < 30% 时，强制使用规则路径（跳过LLM推断）
```

---

## K4：Pattern Mining — 模式复用

### 项目类型模式库

```
.claude/skills/scan-object-info/patterns/
├── vue3-element-plus/     # Vue3 + Element Plus 模式（成熟，τ×0.3）
│   └── pattern.md
├── react-antd/           # React + Ant Design 模式（成熟，τ×0.3）
│   └── pattern.md
├── next-app-router/       # Next.js App Router 模式（成长，τ×0.6）
│   └── pattern.md
├── vite-vue3/             # Vite + Vue3 通用模式（成熟，τ×0.3）
│   └── pattern.md
└── nuxt3/                 # Nuxt3 模式（成长，τ×0.6）
    └── pattern.md
```

### 模式匹配流程

```
1. 从 package.json 提取主框架 + 包名特征
2. 与模式库匹配（关键词匹配 + Jaccard 相似度）
3. 相似度 ≥ 0.6 时，命中成熟模式
4. 命中模式 → 直接复用上下文，跳过重复扫描（节省 τ）
```

### Pattern Mining 规则

```
pattern-001: 相似度 ≥ 0.6 时，命中成熟模式，τ 折扣 70%
pattern-002: 相似度 ≥ 0.4 时，命中成长模式，τ 折扣 40%
pattern-003: 无历史模式时，新建模式（τ 无折扣）
pattern-004: 命中模式后，仅扫描变化的部分（增量扫描）
```

---

## 原子技能列表（v1.2）

| 原子技能 | τ | 职责 | 并行组 |
|---------|---|------|-------|
| pattern-matcher | 150 | 项目模式匹配，跳过已知模式 | 0（预处理）|
| scan-package-json | 200 | 解析 package.json | 1（并行）|
| scan-project-structure | 300 | 扫描目录结构 | 1（并行）|
| scan-config-context | 400 | 扫描配置+环境变量 | 1（并行）|
| detect-tech-stack | 600 | 检测框架+UI+状态管理 | 2（并行）|
| detect-net-router | 500 | 检测请求+路由方案 | 2（并行）|
| skill-stack-context | 50 | 写入共享上下文 | 任意（最后）|

### 执行计划（并行优化）

```
预处理：pattern-matcher（τ=150）
并行组1：scan-package-json + scan-project-structure + scan-config-context
并行组2：detect-tech-stack + detect-net-router（依赖组1）
串行：skill-stack-context（更新共享上下文）
```

---

## 输出格式

### 完整输出（所有技能）

```markdown
# 项目扫描结果 v1.2（韬定律优化版）

## 项目摘要
[基于detect_tech_stack + scan_config_context + detect_net_router综合输出]

## τ 执行报告
- τ 总消耗：xxx（预算：xxx）
- τ 节省：pattern-matcher 命中模式，跳过 scan-config-context（-400）
- τ 分配：intent=10% / match=15% / exec=65% / validate=10%

## 1. 项目基本信息（scan-package-json）
[输出内容]

## 2. 项目结构（scan-project-structure）
[输出内容]

## 3. 配置文件（scan-config-context）
[输出内容]

## 4. 技术栈（detect-tech-stack）
[输出内容]

## 5. 网络与路由（detect-net-router）
[输出内容]

## 技术债务提示
[基于检测结果的自动分析]

## 建议后续操作
[基于检测结果的自动化推荐]
```

### 智能裁剪（按需调用）

当用户指定具体需求时，只输出对应部分：

| 用户意图 | 触发技能 | 输出范围 |
|---------|---------|---------|
| 技术栈分析 | pattern-matcher + scan-package-json + detect-tech-stack | 1 + 4 |
| 路由检测 | scan-package-json + detect-net-router | 1 + 5 |
| 环境变量 | scan-config-context | 3 |
| 全面分析 | 全部7技能 | 完整报告 |

---

## 置信度标注（v1.2）

- **high**：有明确的包依赖声明和配置文件证据
- **medium**：仅有依赖声明，但无配置文件佐证
- **low**：基于间接信号推测（如文件后缀），未直接检测到依赖

每个检测结果必须标注 confidence score，无例外。

---

## 错误处理

**文件缺失时**：
```markdown
⚠️ 错误：未找到 package.json 文件

降级策略：
- 输出 `框架：未知` (confidence: low)
- 其他技能标记为 confidence: low

建议后续操作：
1. 请确保项目根目录存在 package.json
2. 或者手动提供项目框架信息
```

---

## 强约束

1. **K1 优先**：技能合并后 τ 节省必须 > 20%，否则保持分离
2. **K2 强制**：所有技能输出必须写入共享上下文（task_skill.md）
3. **K3 按需**：简单任务用规则，复杂任务用 LLM，禁止纯规则或纯 LLM
4. **K4 缓存**：命中模式后跳过重复扫描，τ 直接节省
5. **τ 预警**：80% 预警 / 95% 严重 / 100% 终止（核心步骤除外）
6. **置信度**：每个检测结果必须标注 confidence，无例外
7. **输出精简**：只输出必要信息，禁止冗余描述

---

## ⭐ K2 Skill Stacking 强制执行规则（MUST）

> **背景**：skill-design.md 和 `.claude/rules/skill-stacking.mdc` 明确要求上游 skill 输出写入共享上下文。
> 以下规则将 K2 设计意图转化为强制执行步骤。

### 执行前：检查共享上下文

**stack-enforce-001**（MUST）：
在开始执行 scan-object-info 之前，检查 `tasks/current/task_skill.md` 是否存在：
- 存在 → 继续执行（共享上下文已初始化）
- 不存在 → 等待 orchestrator-pro 生成 task_skill.md 后继续

### 执行中：每个原子 skill 完成后写入上下文

**stack-enforce-002**（MUST）：
每个原子 skill 完成后，必须执行：
```
1. Read tasks/current/task_skill.md
2. Edit 在对应主 skill 的"共享上下文"区域写入该 skill 的核心输出
   （格式：<!-- atomic-skill: {skill_name} -->...<!-- /atomic-skill: {skill_name} -->）
3. Write tasks/current/task_skill.md
```

**具体写入映射**：

| 原子 skill | 写入位置 | 写入内容 |
|-----------|---------|---------|
| pattern-matcher | `## scan-object-info 执行上下文` | 项目类型（是否命中模式，τ 节省量）|
| scan-package-json | `### 项目基础信息` | 项目名称、包管理器、主框架 |
| scan-project-structure | `### 项目结构` | 目录树摘要、关键文件清单 |
| scan-config-context | `### 配置上下文` | 配置文件清单、环境变量、样式方案 |
| detect-tech-stack | `### 技术栈上下文` | 框架、UI库、状态管理、TS、渲染模式、置信度 |
| detect-net-router | `### 网络上下文` | 请求方案、路由方案、关键文件 |

### 执行后：skill-stack-context 汇总写入

**stack-enforce-003**（MUST）：
所有原子 skill 执行完毕后，必须执行 skill-stack-context（τ=50）：
```
1. Read tasks/current/task_skill.md
2. Edit 在 "## τ 执行记录" 区域追加各 skill 的 τ 消耗
3. Edit 在 "## 共享上下文命中率追踪" 区域记录命中统计
4. Write tasks/current/task_skill.md
```

### 禁止行为

**stack-enforce-004**（FORBIDDEN）：
- 禁止在不写入 task_skill.md 共享上下文的情况下完成 scan-object-info
- 禁止在 skill-stack-context 未执行的情况下声称 scan-object-info 已完成
- 禁止跳过 skill-stack-context（即使 τ 预算紧张，skill-stack-context 是强制步骤）

---

## 版本

- v1.2 - 韬定律优化版：K1 Task Folding（9→7技能）、K2 Skill Stacking（共享上下文）、K3 Co-Design（规则/LLM决策矩阵）、K4 Pattern Mining（模式库）
- v1.1 - 改进版：新增 confidence scores、project-summary、suggested follow-up actions
- v1.0 - 初始版本