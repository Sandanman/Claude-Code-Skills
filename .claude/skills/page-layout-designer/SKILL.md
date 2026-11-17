---
name: page-layout-designer
description: 在需求文档基础上补充页面交互、UI 和方法规格，通过分阶段提问设计前端页面布局、组件、交互、方法、页面状态、响应式行为和视觉规范，生成可让 AI 100% 实现可交付页面的 Markdown 与 JSON 页面设计文档；未指定接口的交互使用 mock，不做接口联调；支持需求文档驱动、纯对话从 0 到 1，以及对已有页面设计新增/修改模块的增量设计。
version: 1.4
match_keywords:
  - 页面布局设计
  - 设计页面
  - 页面设计文档
  - 前端页面原型
  - 页面结构设计
  - UI布局
  - 页面交互设计
  - 生成页面规格
  - 生成页面布局文档
  - 按照页面设计生成代码
  - 从零设计页面
  - 新增页面模块交互
  - 修改页面模块交互
  - 增量修改页面设计
layer: generation
upstream_dependencies:
  - scan-object-info
status: 启用
---

# Page Layout Designer 主 Skill v1.4

## 一、定位与边界

本 Skill 将用户对页面的自然语言描述，通过分阶段、递归式提问，整理为可供 AI 读取和 `code-generator` 使用的页面设计文档。

**目标：交付级完备。** 本 Skill 的产物是对需求文档（含原型、需求 JSON）的页面交互、UI 和方法的补充。需求中已明确的内容直接引用，未明确的内容（前置条件、失败反馈、loading、防重复、方法签名、视觉取值等）通过提问补全。文档完成后，AI 依据它生成的页面应是可交付页面：每个交互都有对应的、100% 实现的方法，UI 取值无需再猜。凡会导致生成代码存在歧义的字段，都不能留空，必须由用户确认或明确标记 `[待确认]`。

**数据策略（API / Mock）**：

- 需求或用户明确指定了某交互调用的接口时，该交互的方法使用 `data_mode: api`，并记录接口、入参、出参。
- 没有说明调用接口的交互，不做接口联调，一律使用 `data_mode: mock`。
- mock 数据只能在方法内部返回：由生命周期钩子或按钮点击等交互触发的方法返回，不得在模块顶层、常量文件或组件 data 初始值中预置业务数据。
- mock 方法的签名和返回结构应与将来真实接口保持一致，后续替换为接口时只改方法内部实现，不改调用方。

覆盖范围：

- 页面范围、入口、角色和权限；
- 页面整体布局及嵌套区域布局；
- 区域中的文本、输入框、按钮、筛选、表格、列表、卡片、切换等组件；
- 控件触发的交互、数据变化、反馈和异常处理；
- 页面生命周期方法和交互方法的完整规格（名称、触发、入参、返回、状态变更、`api` 或 `mock`）；
- 弹窗、抽屉、Popover、确认框的完整规格；
- loading、empty、error、disabled、readonly、success、partial、permission 等页面状态；
- 响应式断点、区域变化、隐藏/折叠/排序/滚动策略；
- 项目组件库映射和视觉 Token。

不负责：

- 直接生成页面业务代码（由 `code-generator` 依据本文档生成，本 Skill 只保证文档足以让其 100% 实现）；
- 修改业务代码或组件库配置；
- 臆测未确认的业务规则、布局、颜色或尺寸；
- 替代产品需求、API 详细设计或完整测试设计；未指定接口时不设计接口，只定义 mock 方法。

所有不确定信息必须标记为 `[待确认]`，模型提出但用户未确认的内容必须标记为 `[建议]`。

## 二、执行路径

本 Skill 默认使用 Durable Path，因为它需要多轮用户确认、跨阶段共享上下文和写入文档。

```text
任务初始化与输出冲突检查（选择任务场景、提问模式和复杂度档位）
→ 对话 0→1 场景：阶段 0 需求澄清；增量场景：定位基线、影响分析（均见 2.7）；需求文档场景直接进入下一步
→ 页面基础信息确认 ∥ 读取项目上下文、技术栈、组件库和规范（并行，见 2.6）
→ 页面整体布局确认
→ 递归拆分布局节点并询问直接子区域
→ 区域组件与交互事件合并确认（原阶段 4 + 5，阶段 5 同时确认每个交互的方法规格，包括生命周期方法）
→ 弹窗/抽屉/Popover 深挖
→ 页面和组件状态设计（默认模板 + 例外确认）
→ 响应式行为确认
→ 视觉规范和组件映射确认
→ 每阶段确认后增量写入 JSON（唯一数据源）并运行 draft 校验脚本
→ 由 JSON 渲染 Markdown
→ 终检：final 校验脚本 + 语义检查
→ 输出摘要并按任务流程归档
```

### 2.1 提问模式

任务初始化时，必须让用户选择提问模式，并在 `metadata.questioning_mode` 记录；用户未选择时默认 `draft_first`。任务场景（见 2.7）和复杂度档位（见 2.4）在同一次 `AskUserQuestion` 中一并确认。用户可在任意阶段切换模式，已确认内容不受影响，切换后只影响后续阶段。

| 模式 | 值 | 适用场景 | 提问方式 |
| --- | --- | --- | --- |
| 草案优先 | `draft_first` | 已有描述、截图/线框图或可参考的同类页面，希望快速确认 | 先生成草案，用户确认或修改 |
| 从零提问 | `from_scratch` | 需求尚不清晰、希望逐项思考，或要求完全由自己决定每个细节 | 不预设草案，按阶段逐项开放提问 |

两种模式共用同一套阶段、字段、校验项和完成标准，只是收集方式不同；各阶段的具体差异见对应阶段说明。

**通用规则（两种模式均适用）**：

1. **不得臆测**：任何内容必须来自用户输入、项目上下文或已确认内容；推导不出的字段列为 `[待确认]` 问题单独询问。
2. **阶段总结**：每一阶段先总结已确认信息，再提出当前阶段问题或草案；用户未确认时不得进入依赖该信息的后续阶段。
3. **提问上限**：一次 `AskUserQuestion` 最多 3 个相互关联的问题或问题组。
4. **确认必须可见且完整**：向用户确认前，必须在对话中完整展示待确认内容（草案表、布局树、弹层规格等）；用户没有看到的内容不得记为 `confirmed`。每个对象确认前，必须覆盖该阶段列出的全部必填项，缺项的对象保持 `suggested` 或 `pending`，不得因“用户点了确认”而降级要求。
5. **答案不具体不落盘**：用户选择“提供色值”“沿用组件库”等选项但没有给出具体值、名称时，不得写入或猜值，必须追问具体内容，或标记 `[待确认]`。
6. **交付完备性**：凡 AI 生成代码时需要猜测才能继续的字段（文案、取值、前置条件、失败反馈、方法签名、mock 返回结构、视觉取值），都视为必填项，按阶段逐项收集。

**`draft_first` 模式规则**：

1. **草案优先**：每个阶段先基于用户描述、截图/线框图、项目上下文和已确认阶段内容，生成该阶段完整草案，草案内容一律标记 `[建议]`，再让用户选择「确认 / 修改 / 否决」。用户确认后去掉 `[建议]`；用户修改或否决的部分只重新生成对应部分，不整阶段重来。
2. **批量提问**：同级兄弟节点、同一区域内的组件及其事件合并为一次提问，以表格展示并为每项给出默认选项；每个问题组可包含多个同类节点或组件。

**`from_scratch` 模式规则**：

1. 不生成草案，不使用默认选项预填答案；每个问题由用户自行回答，选项仅用于列举常见类型，不得预选。
2. 按各阶段原有顺序逐项开放提问：布局节点逐个拆分，阶段 4 与阶段 5 分开确认，状态逐项确认。
3. 用户回答含糊时追问，不替用户补全；不确定内容标记 `[待确认]`。
4. 用户可随时说“按建议来”，对当前阶段临时改用草案方式，不改变全局模式。

### 2.2 JSON 作为唯一数据源

- 每个阶段确认后，立即把已确认内容增量写入 `page-layout.json`，写入期间 `metadata.status` 为 `draft`。
- JSON 中每个布局节点、组件、交互、overlay、状态对象携带 `confirm_status`：`confirmed | suggested | pending`，用于区分已确认、待用户确认和待确认内容。`from_scratch` 模式下用户回答的内容直接记为 `confirmed`，无需经过 `suggested`。
- 增量写入的目标路径与第五节输出路径相同，在任务初始化的输出冲突检查阶段一并展示并获得确认；目标已存在时仍须先请求覆盖确认。
- Markdown 不再独立撰写，最终由 JSON 按 5.2 章节顺序渲染生成（见第五节）。
- 最终校验时不得残留 `suggested` 内容：未确认的内容转入 `open_questions`，并将状态降为 `partial`。

### 2.3 增量校验（脚本化）

结构类校验由只读脚本 `.claude/skills/page-layout-designer/scripts/validate-layout.mjs` 执行，脚本只读取文件、输出 JSON 报告，不修改任何文件。

```text
node .claude/skills/page-layout-designer/scripts/validate-layout.mjs --json <page-layout.json> --mode draft
node .claude/skills/page-layout-designer/scripts/validate-layout.mjs --json <page-layout.json> --md <page-layout.md> --mode final
# 增量场景：追加 --base 指向基线 JSON
node .claude/skills/page-layout-designer/scripts/validate-layout.mjs --json <新版本 page-layout.json> --md <page-layout.md> --mode final --base <基线 page-layout.json>
```

| 模式 | 运行时机 | 检查内容 |
| --- | --- | --- |
| `draft` | 每个阶段确认并增量写入 JSON 之后 | JSON 可解析；ID 唯一；布局 `parent_id` 与嵌套关系；组件 `source` 取值合法且附加字段齐全（已填写 `source` 的组件）；组件 `layout_id`、交互 `source_id`、overlay 触发和按钮交互、状态 `target_id` 的引用；方法 `data_mode` 取值合法、`mock` 方法的 `mock_return` 与 `mock_scope`、`api` 方法的 `endpoint`；交互 `method_id` 与方法 `interaction_id` / `target_id` 的引用；交互 `target_id` 指向尚未创建对象时仅警告 |
| `final` | Markdown 渲染完成后 | `draft` 全部检查，外加：每个组件都已填写 `source`；叶子区域有组件或 `content_note`；`async: true` 对象的 loading / empty / error 已定义或 `not_applicable` 且有原因；每个交互都有 `method_id` 或 `no_method_reason`；每个 `async: true` 的组件都有生命周期或交互方法加载它；交互的 `precondition`、`failure_feedback`、`loading_behavior`、`duplicate_guard` 已填写（可为 `not_applicable` 且有原因）；无残留 `suggested`；项目上下文、响应式、视觉 Token 已填写或标记 `[待确认]`；Markdown 章节齐全、顺序正确，且 JSON 中每个 ID 都出现在 Markdown 中（增量场景在“待确认项与建议”之后、“校验结果”之前增加“变更记录”章节） |
| 增量（`metadata.scenario` 为 `incremental_*`，两种模式均检查） | 同上 | `base_document_id`、`base_version` 已填写，`final` 要求 `change_log` 非空；`change_log` 的 `id` 唯一、`type` 合法、有 `summary` 和 `target_ids`，`modify` 有 `before` / `after`，`add` / `modify` 的目标存在、`remove` 的目标已不存在 |
| 增量 + `--base` | 同上 | 与基线 JSON 对比：`base_document_id` / `base_version` 与基线一致，`version` 已递增；基线对象（布局节点、组件、交互、方法、overlay 及按钮、状态）被删除而没有 `remove` 记录、内容被改动而没有 `modify` 记录，或 `add` 的 ID 已存在于基线，均报错 |

执行规则：

- 报告中的 `errors` 逐条给出 `rule`、`id` 和说明。出错时只修复报告指出的对象并重新运行，不整阶段或整份文档重来；`final` 失败重试最多 3 次，重试前记录失败原因。
- 脚本报告写入 JSON 的 `validation`，并记录 `validation.method` 为 `script`；`warnings` 中的 `pending_items` 对应最终状态 `partial`。
- 脚本只覆盖结构类校验。“文档是否包含未标记的臆测内容”仍由模型在终检时人工核对。
- 运行环境没有 Node.js，或脚本不可执行时，不得跳过校验：由模型按上表同样的规则逐项人工检查，`validation.method` 记录为 `manual`，并在最终摘要中说明。

### 2.4 页面复杂度分档

任务初始化时，模型根据用户输入（页面描述、截图或线框图）初判页面复杂度，连同提问模式一起展示给用户确认，记入 `metadata.complexity_tier`。阶段 3 的布局树确认后复核，档位可升降，已确认内容不受影响。

| 档位 | 值 | 判定参考 |
| --- | --- | --- |
| 简单 | `simple` | 一级区域 ≤ 3，叶子区域 ≤ 6，overlay ≤ 1，无多角色权限差异 |
| 标准 | `standard` | 不属于简单或复杂 |
| 复杂 | `complex` | 一级区域 ≥ 5，或叶子区域 ≥ 15，或 overlay ≥ 4，或存在多角色权限差异 |

档位只改变 `draft_first` 下每次确认的批量大小：

| 档位 | `draft_first` 确认粒度 |
| --- | --- |
| `simple` | 阶段 2–6 合并：生成整页草案（布局树、组件、事件、overlay），一次确认；阶段 7、8 合并为一次确认 |
| `standard` | 按阶段确认（2.1 的 `draft_first` 规则） |
| `complex` | 阶段 3–5 按一级区域逐个成批确认（区域子树、组件、事件为一批），overlay 逐个确认，状态按区域确认 |

约束：

- 所有档位的产物字段、校验项和完成标准完全一致，不得因合并确认而省略必填项（例如 overlay 按钮仍须有独立 `interaction_id`，核心异步区域仍须覆盖三类状态）。
- `from_scratch` 模式不受档位影响，仍按用户驱动的逐项提问；档位仅作为记录。
- 校验脚本按阶段增量运行的规则不变：`simple` 档位合并确认后，对合并涉及的各阶段一并运行一次 `draft` 校验。

### 2.5 区域模板库

`draft_first` 下生成草案时，先用区域模板库 `.claude/skills/page-layout-designer/templates/region-patterns.md` 匹配区域，再生成「模板 + 差异项」草案，用户只确认或修改差异项。

- 模板只提供结构骨架（组件类型、默认交互类型、默认状态类型）；业务字段、列定义、接口、文案和权限不预填，一律标记 `[待确认]`，不得借模板绕过“不得臆测”。
- 模板生成的组件、交互、overlay 带 `pattern_id`，`confirm_status` 为 `suggested`，用户确认后改为 `confirmed`。模板不预填组件 `source`，来源按阶段 4 的组件来源判定补全。
- 模板的默认交互必须逐项进入交互清单，默认异步状态必须进入 `states`，规则与普通草案一致。
- 没有合适模板时按普通草案生成，项目已有公共组件优先于模板中的通用组件。
- `from_scratch` 模式不使用模板，除非用户说“按建议来”。

### 2.6 并行执行

只有彼此独立的只读任务可以并行，需要用户确认和写文件的步骤仍保持串行。

| 并行任务 | 汇合点 |
| --- | --- |
| 读取项目上下文或执行 `scan-object-info` 与阶段 1 页面范围提问并行 | 进入阶段 2 之前必须拿到上下文，或用户选择跳过并标记 `[待确认]` |
| `draft` 校验脚本与下一阶段草案生成并行 | 向用户展示下一阶段草案之前必须拿到校验结果；校验失败时先修复再展示 |

约束：

- 所有对 `page-layout.json` 的写入由主流程单点串行执行，并行任务只读，不得同时写同一个文件。
- 并行不改变确认顺序：用户未确认的阶段不得写入后续阶段的内容，不得因并行提前进入依赖该信息的阶段。
- 并行任务失败或超时时，退回串行执行，不得省略对应步骤。

### 2.7 任务场景

任务初始化时确认场景，记入 `metadata.scenario`；用户描述已能判断场景时，先给出判断再请用户确认。场景只改变“起点”，阶段 1–8 的字段、校验项和完成标准不变。

| 场景 | 值 | 判断依据 | 起点 |
| --- | --- | --- | --- |
| 需求文档驱动 | `from_requirement` | 提供了需求文档、原型或需求 JSON | 读取需求（用户指定路径优先，否则查找 `docs/lijianxin/requirement-generator/`，多个候选时让用户选择），已明确内容直接引用，缺失项提问补全 |
| 对话 0→1 | `from_conversation` | 没有需求文档，只有自然语言描述、截图或想法 | 阶段 0 需求澄清 |
| 增量新增 | `incremental_add` | 已有页面设计，要新增某个模块 | 定位基线 → 影响分析 |
| 增量修改 | `incremental_modify` | 已有页面设计，要修改或删除某个模块的布局、组件、交互、方法、状态等 | 定位基线 → 影响分析 |

#### 对话 0→1（`from_conversation`）

没有需求文档时，先做**阶段 0：需求澄清**，把对话整理为需求摘要，用户确认后才进入阶段 1：

- 澄清内容：页面目标、核心用户、核心任务（用户要在页面完成什么）、涉及的数据实体和字段、业务规则（含具体数值和条件）、固定文案、已知接口（没有则按第一节使用 mock）。
- 写入位置：目标、用户、任务写入 `page_scope`；每条业务规则写入 `business_rules`，附 `source: conversation`；对话中改口或补充时，以最新确认的为准，并在 `evidence` 记录变更。
- `draft_first`：把用户已说的内容整理成需求摘要，只整理不扩写，来自用户的条目直接列出，模型补充的条目标记 `[建议]`，用户确认或修改。`from_scratch`：逐项开放提问，不预设答案。
- 不得臆测：用户没说的业务规则、字段、数值、文案不得编造，提问或标记 `[待确认]`；超出本页范围的问题记入 `open_questions`，不阻塞设计。
- 追溯：组件、交互、方法的 `requirement_ref` 指向 `business_rules` 的 ID 或写明 `conversation`；mock 数据取自用户给出的示例，没有时询问用户。
- 用户后续用新增、调整的方式追加需求时，按增量场景处理，不重新做阶段 0。

#### 增量新增 / 修改（`incremental_add` / `incremental_modify`）

对已有页面设计做局部变更，不整页重做，不扰动未涉及的内容：

1. **定位基线**：优先使用用户指定的 `page-layout.json`，否则在默认输出目录 `docs/lijianxin/page-layout-designer/` 下按页面名查找最新版本；多个候选时让用户选择。没有 JSON、只有页面代码时，经用户同意只读扫描代码反推基线，反推内容标记 `suggested`，经用户确认后才视为基线；两者都没有时转为 `from_requirement` 或 `from_conversation`。基线文件本身不修改。
2. **基线校验**：对基线运行 `draft` 校验。基线已有的错误先告知用户，不擅自修复；用户可选择在本次变更中一并修复，并记入 `change_log`。
3. **明确变更**：逐项确认变更类型（新增 / 修改 / 删除）、目标模块（布局节点 ID 或名称）和变更内容。一次可有多处变更，每处一条记录。
4. **影响分析**：列出受影响的布局节点、组件、交互、方法、overlay、状态、响应式规则和视觉项，以及引用它们的其他对象，展示给用户确认后才改动。删除类变更必须列出将被一并清理的所有引用对象。
5. **局部提问**：只对受影响对象，按阶段 3–8 的同样规则和必填项提问。新增模块走“布局节点 → 组件 → 交互与方法 → overlay → 状态 → 响应式”的完整子集；修改只对被改字段及其依赖项重问。未涉及对象的 `confirm_status` 和内容保持不变。
6. **写入规则**：
   - 既有 ID 不重命名、不重新编号，新增 ID 不得与基线冲突且风格一致；
   - 被删除的对象及其级联引用逐项移除，每个被移除的 ID 都要记入 `change_log`；
   - `change_log` 每条包含 `id`（如 `chg.001`）、`type`（`add | modify | remove`）、`target_ids`、`summary`、`before`、`after`（修改时给出变更前后摘要）、`confirm_status`；
   - `metadata` 增加 `base_document_id`、`base_version`，`version` 递增（如 `1.0` → `1.1`）。
7. **输出**：默认不改基线，把完整的新版本（Markdown + JSON）写入新目录 `{page_name}_{timestamp}`。用户要求原地更新时，先展示路径并获得覆盖确认，覆盖前把基线备份为 `page-layout.v{旧版本}.json`。Markdown 在最后按完整 JSON 重新渲染，并增加“变更记录”章节。
8. **校验**：`draft` / `final` 照常运行，并加 `--base <基线 JSON>`，检查基线对象没有未记入 `change_log` 的删除或改动（见 2.3）。
9. **复杂度**：增量场景按本次变更的影响范围（受影响叶子区域数、新增 overlay 数）取档，不重新判定整页。
10. **下游**：`change_log` 供 `code-generator` 判断只需重新生成哪些模块。

## 三、输入与上下文

### 3.1 用户输入

支持以下输入：

- 页面名称或页面目标；
- 页面截图、线框图或设计稿；
- 用户对页面结构的自然语言描述；
- 已有页面的修改要求；
- 页面路由、角色、数据来源和接口说明。

开始时提取已知信息，并将缺失内容列入待确认清单。页面名称未提供时必须先询问，不使用临时猜测名称写入最终文件。

### 3.2 项目上下文

优先读取现有项目上下文或使用 `scan-object-info` 的结果，至少确认：

- framework、framework_version、language；
- UI library、version、source、evidence、import_mode；
- 已有公共组件和组件路径；
- 样式方案、主题配置、design tokens；
- 路由、状态管理、请求方案；
- 项目规范和代码生成约束。

若没有可读取的上下文，必须让用户选择：

1. 执行 `scan-object-info`；
2. 提供项目上下文文件；
3. 跳过并将相关字段标记为 `[待确认]`。

不得因为缺少上下文而自行假设 Vue/React、组件库或 CSS 方案。

## 四、分阶段提问规则

### 阶段 1：页面范围

确认：

- 页面名称、目标和核心用户；
- 路由/入口、页面权限和设备范围；
- 数据来源：逐个交互确认是否指定了接口。需求文档 `api_spec` 为空或用户未说明某交互调用的接口时，默认该交互使用 mock（见第一节数据策略），不再追问接口细节；
- 新建页面还是修改已有页面。

### 阶段 2：页面整体布局

先询问页面属于哪一种整体布局：

- 上—中—下：例如顶部 Header、中部主体、底部 Footer；
- 左—中—右：例如左侧导航、中间工作区、右侧详情；
- 上—中：例如顶部工具栏和主体内容；
- 左—中：例如侧栏和内容区；
- 自定义组合：由用户描述一级区域。

布局类型只表示当前节点的直接子区域关系。确认后必须建立根节点和一级子节点，并逐一递归处理尚未拆分的区域。

### 阶段 3：递归拆分区域

`draft_first` 模式下，先根据已确认的一级布局和用户输入生成整棵布局树草案（所有节点标记 `[建议]`），再按同级兄弟节点批量确认；若用户确认草案，无需逐节点再问。对未被草案覆盖或用户否决的节点，以及 `from_scratch` 模式下的所有节点，按以下顺序逐个询问：

1. 该区域的职责和内容是什么？
2. 该区域内部是上下、左右、网格、流式、覆盖还是自定义布局？
3. 该区域是否继续拆分？若拆分，直接子区域分别叫什么、顺序和尺寸如何？
4. 该区域在移动端或窄屏下如何变化？记入该节点的 `responsive_behavior`，阶段 8 不再重复询问节点级行为。

直到叶子区域可以映射到具体内容或组件，例如标题、描述、输入框、按钮、筛选项、表格、列表、空状态占位等。不得跳过中间布局层级直接把组件挂到不明确的父节点。

每个布局节点必须拥有唯一稳定的 `id`，推荐 `layout.header`、`layout.main.filters` 形式。

### 阶段 4：组件和内容（`draft_first` 下与阶段 5 合并确认）

对每个叶子区域询问适用内容和组件：

- 文本：标题、说明、提示、错误文案；
- 输入：类型、占位符、默认值、必填、校验、清空方式；
- 按钮：文案、类型、图标、权限、禁用条件；
- 筛选：字段、选项来源、多选/单选、查询/重置行为；
- 表格/列表：列、排序、分页、行操作、批量操作；
- 卡片/指标/图表：数据、单位；
- 切换/标签页/折叠：选项、默认项、切换后内容和数据策略；
- 上传、日期、级联、树选择等特殊组件：限制、校验和反馈。

组件必须关联所属 `layout_id`，组件库存在对应组件时优先使用项目组件库；没有证据时标记 `[待确认]`。组件使用的组件库组件在此处一并记录，阶段 8 不再逐个组件重复询问。

**组件来源判定（所有组件必填 `source`）**：每个组件按下表确认来源，判定顺序自上而下，命中即停止：

| 顺序 | `source` | 判定条件 | 必填附加字段 |
| --- | --- | --- | --- |
| 1 | `project_common` | 项目已有公共组件能满足该区域的结构和交互（来自 3.2 项目上下文或用户指定） | `component_path` |
| 2 | `ui_library` | 项目组件库的原生组件即可满足，不需要二次封装 | `ui_component`（组件库组件名，有证据时填写，否则 `[待确认]`） |
| 3 | `new_shared` | 本页或其他已知页面中出现 ≥ 2 次，且结构与交互一致，或用户明确要求抽成公共组件 | `reuse_reason`（出现位置或用户要求） |
| 4 | `page_local` | 仅在本页出现一次、与本页业务强绑定，不满足以上条件 | `reuse_reason`（说明为何不复用、不抽取） |

判定规则：

- **不得臆测**：项目上下文没有公共组件清单时，不得判为 `project_common`，应先询问用户或标记 `[待确认]`；“出现 ≥ 2 次”只统计本次页面设计中已确认的组件和 overlay，以及用户明确提到的其他页面。
- `draft_first` 下 `new_shared` 和 `page_local` 的判定为 `[建议]`，并随阶段 4 联合草案表一并确认；`from_scratch` 下逐个组件询问，不预选。
- 区域模板（2.5）生成的组件不预填来源，项目有等价公共组件时优先 `project_common`，其余按本表判定。
- `new_shared` 只表示建议抽取，不在本 Skill 内创建组件文件；组件拆分和落盘由 `code-generator` 根据 `source` 执行。
- 同一结构在多处出现且来源不一致时，必须在草案中指出并统一，用户可保留不同来源但需写明 `reuse_reason`。表格、列表、卡片、图表等异步组件标记 `async: true`；它们的 loading / empty / error 状态不在本阶段询问，统一在阶段 7 确认，用户在本阶段主动提到的状态直接记入 `states`。

**合并确认规则（仅 `draft_first`）**：阶段 4 与阶段 5 按区域批量进行，联合草案表优先按区域模板（见 2.5）生成。每次针对一批叶子区域，先生成「组件 + 事件」联合草案表（组件、关联 `layout_id`、事件类型、处理步骤、接口/数据变化、成功/失败反馈），用户一次确认或修改。事件仍须覆盖阶段 5 列出的全部必填项，不得因合并而省略；事件打开 overlay 时进入阶段 6 深挖。

**`from_scratch` 模式**：阶段 4 逐个叶子区域开放询问内容和组件，全部确认后再进入阶段 5 逐项询问事件。

### 阶段 5：交互事件（`draft_first` 下随阶段 4 同批确认）

本阶段字段要求不变；`draft_first` 下确认动作与阶段 4 的联合草案表合并完成，`from_scratch` 下在阶段 4 完成后单独逐项询问。组件确认后仍须检查每个可交互组件均已进入交互清单。

从已确认组件中逐项提取交互，不凭空新增交互。每个事件至少确认：

- 触发组件和事件类型；
- 触发前置条件和参数；
- 具体处理步骤；
- 是否请求接口、更新哪些数据或状态；
- 成功反馈、失败反馈和错误恢复；
- 目标区域或跳转目标；
- 防重复提交、加载中和权限限制。

按钮、筛选、切换、分页、排序、表单提交、删除、批量操作、复制、下载和跳转都必须进入交互清单。仅展示性组件不强行添加事件。

**交互必填项（缺一不可，不适用的写 `not_applicable` 并说明原因）**：`precondition`（前置条件）、`steps`（处理步骤）、`success_feedback`（成功反馈，逐字文案与反馈形式）、`failure_feedback`（失败反馈与错误恢复）、`loading_behavior`（加载中表现与允许的操作）、`duplicate_guard`（防重复策略）、`permission`（权限限制）、`after_success`（成功后的数据与界面变化，例如是否刷新列表、是否保持当前筛选和分页）。需求文档只给出提示文案而未给出这些项时（例如“原型占位”），逐项询问用户，不得因原型只有提示就省略。

**方法规格（每个交互和每个生命周期动作都要有）**：

1. 页面初始化加载（如进入页面时拉取列表）和其他生命周期动作，同样作为方法记录，`trigger_type: lifecycle`，并写明生命周期钩子，其框架写法依项目技术栈而定，未知时标记 `[待确认]`。
2. 每个方法记录：`name`、`trigger_type`（`lifecycle | interaction`）、触发的交互 ID 或生命周期钩子、`params`（入参名、类型、含义）、`returns`（返回结构）、`state_changes`（修改哪些页面数据和状态）、`target_id`（作用的组件或区域）、`error_cases`（失败时的返回或抛出）。
3. `data_mode` 按第一节数据策略判定：需求或用户指定了接口 → `api`，同时记录 `endpoint`（方法、路径）、请求参数、响应结构；未指定 → `mock`。
4. `mock` 方法必须写明 `mock_return`（方法内返回的数据结构及示例）和 `mock_scope: in_method`；mock 数据来源优先取需求文档中的示例数据（例如 `sample_data`），没有时询问用户，不得臆造业务字段。mock 方法需要模拟查询类逻辑（搜索、筛选、分页）时，在 `mock_logic` 中写明按需求规则执行的过滤方式。
5. 不涉及数据的纯界面交互（如打开弹窗、页面跳转）不需要方法时，填写 `no_method_reason`。

### 阶段 6：弹层和二次交互

当交互打开弹窗、抽屉、Popover、确认框或其他 overlay 时，必须继续询问：

- overlay 类型、触发源和打开条件；
- 标题、说明、主体内容和字段；
- 宽度/位置/是否可拖拽或点击遮罩关闭；
- 主按钮、次按钮及其他操作按钮的文案和样式；
- 每个按钮的处理、校验、loading、成功/失败反馈；
- 关闭、取消、返回和未保存内容的处理；
- overlay 内部的异步内容标记 `async: true`，其 loading、empty、error、disabled 状态统一在阶段 7 确认，用户在本阶段主动提到的直接记入 `states`。

弹层按钮必须有独立的 `interaction_id`，不能只写“点击后处理”。

### 阶段 7：页面状态

阶段 4、6 中用户已主动给出并记入 `states` 的状态，本阶段不再重复询问，只确认尚未记录的状态。

**默认模板 + 例外确认（仅 `draft_first`）**：所有核心异步区域（表格、列表、卡片、图表、表单提交、overlay 内异步内容）自动套用 `loading`（骨架或局部 loading，加载期间禁用相关操作）、`empty`（空文案 + 主操作）、`error`（错误文案 + 重试 + 降级内容）三项默认状态，写入草案并标记 `[建议]`。用户只需确认默认模板，并指出例外和自定义状态。模板中无法推导的文案、占位和降级内容标记 `[待确认]`。使用默认模板不得遗漏核心异步区域，也不得给非异步区域强加状态。

例外和自定义状态按以下清单确认，针对页面、区域和组件分别确认适用状态（`from_scratch` 模式不套用默认模板，直接按此清单对每个核心异步区域逐项询问）：

- `loading`：触发条件、骨架/旋转器/局部 loading、允许操作；
- `empty`：空文案、插图/占位、主操作；
- `error`：错误文案、重试操作、降级内容；
- `disabled`：禁用对象、原因提示、恢复条件；
- `readonly`：只读范围、仍可用的操作；
- `success`：成功展示和消失时机；
- `partial`：部分数据失败时的展示；
- `permission`：无权限文案、隐藏还是禁用；
- 业务自定义状态：状态值、触发事件和允许操作。

不适用的状态可以记录为 `not_applicable`，但必须说明适用范围，不能遗漏核心异步区域的 loading、empty 和 error。

### 阶段 8：响应式和视觉规范

本阶段只确认全局和尚未收集的内容，已在前序阶段确认的信息直接引用，不重复询问。

**响应式**：

- 全局：断点及桌面、平板、移动端策略，页面最大宽度、内容区宽度、栅格和对齐方式；
- 节点级行为（分栏变为堆叠、区域隐藏/折叠、顺序变化、横向滚动）已在阶段 3 记入各节点 `responsive_behavior`，本阶段由其汇总生成 `responsive.rules`（每条规则引用 `layout_id`），只对 `responsive_behavior` 为空或 `pending` 的节点补问。

**视觉规范**：

- 先读取项目已有 design token、主题配置和组件库主题，向用户展示已找到的 token 及其来源，用户选择「沿用 / 覆盖 / 自定义」。`draft_first` 下默认以 `[建议]` 沿用；`from_scratch` 下不预选。
- 只对项目中没有 token 且用户输入中未提及的项目逐项询问：主题色、语义色、背景色、边框色；标题、正文、辅助文字、数字、按钮文字的字号、行高和字重；间距、圆角、阴影、边框、密度和组件变体；
- 组件库中的实际组件已在阶段 4 记录，本阶段只汇总到 `component_variants`，并确认主题覆盖规则。

如果项目已有 design token，应引用 token 名称和来源，不重复创建同义值。

**视觉取值必须具体（交付要求）**：生成页面时不能靠猜，因此以下项必须有具体值（十六进制色值、px/rem 数值、字重数值等），或引用项目已有 token 名称与来源，或明确标记 `[待确认]`：主题色（主色、hover、active、浅色背景）、语义色（success、warning、danger、info，标签文字/背景/边框）、中性色（页面背景、卡片/表格背景、表头背景、行 hover 背景、边框/分割线、正文/辅助/禁用文字、遮罩）、字号/行高/字重、间距、圆角、阴影。用户选择“沿用组件库”时，必须先记录组件库名称和版本，没有名称时不得写入。`from_scratch` 下视觉取值逐项询问，不预设。

## 五、输出格式

默认输出到：

```text
docs/lijianxin/page-layout-designer/{page_name}_{timestamp}/page-layout.md
docs/lijianxin/page-layout-designer/{page_name}_{timestamp}/page-layout.json
```

若用户明确指定项目文档目录，则写入指定目录；目标已存在时必须先请求覆盖确认。

### 5.1 JSON 必备结构

```json
{
  "metadata": {
    "document_id": "page-layout-<id>",
    "page_name": "<页面名称>",
    "route": "<路由或[待确认]>",
    "version": "1.0",
    "scenario": "from_requirement | from_conversation | incremental_add | incremental_modify",
    "base_document_id": "<增量场景：基线 document_id>",
    "base_version": "<增量场景：基线 version>",
    "questioning_mode": "draft_first | from_scratch",
    "complexity_tier": "simple | standard | complex",
    "generated_at": "<实际时间>",
    "task_id": "<任务ID>",
    "status": "draft | passed | partial | failed | cancelled"
  },
  "project_context": {
    "framework": {},
    "ui_library": {},
    "style_system": {},
    "project_conventions": {},
    "source": "scan-object-info | provided | manual | skipped"
  },
  "page_scope": {
    "goal": "",
    "users": [],
    "entry": [],
    "permissions": [],
    "data_sources": [],
    "devices": []
  },
  "layout": {
    "root_id": "layout.page",
    "layout_type": "",
    "direction": "",
    "children": []
  },
  "components": [],
  "interactions": [],
  "methods": [],
  "overlays": [],
  "states": [],
  "responsive": { "breakpoints": [], "rules": [] },
  "visual_tokens": {
    "colors": {},
    "typography": {},
    "spacing": {},
    "radius": {},
    "shadow": {},
    "borders": {},
    "density": "",
    "component_variants": []
  },
  "business_rules": [],
  "change_log": [],
  "open_questions": [],
  "assumptions": [],
  "evidence": [],
  "validation": {}
}
```

布局节点至少包含 `id`、`name`、`parent_id`、`layout_type`、`direction`、`size`、`order`、`responsive_behavior`、`children`。组件、交互、overlay、状态必须使用稳定 ID，并通过 ID 建立引用。

**字段约定（校验脚本依赖，见 2.3）**：

- `layout.children` 为嵌套的布局节点对象；一级节点的 `parent_id` 等于 `layout.root_id`，其余节点的 `parent_id` 等于所在父节点的 `id`。
- 叶子布局节点若没有组件，必须填写 `content_note` 说明该区域的内容。
- 组件包含 `id`、`layout_id`、`type`、`source`（`project_common | ui_library | new_shared | page_local`，判定见阶段 4）；`project_common` 必须有 `component_path`，`ui_library` 建议填写 `ui_component`，`new_shared` 和 `page_local` 必须有 `reuse_reason`；由区域模板生成的组件、交互、overlay 附带 `pattern_id`；交互包含 `id`、`source_id`（组件、overlay 或 overlay 按钮 ID），可选 `target_id`（目标布局、组件或 overlay），跳转到外部路由或 URL 时使用 `target_route`。
- overlay 包含 `id`、`trigger_interaction_id`、`buttons[]`；每个按钮包含独立的 `id` 和 `interaction_id`。
- 交互除 `id`、`source_id` 外，还须包含 `precondition`、`steps`、`success_feedback`、`failure_feedback`、`loading_behavior`、`duplicate_guard`、`permission`、`after_success`（不适用的写 `not_applicable` 并附原因），以及 `method_id`（指向 `methods`）；不需要方法时填写 `no_method_reason`。
- 方法（`methods[]`）包含 `id`、`name`、`trigger_type`（`lifecycle | interaction`）、`interaction_id`（`interaction` 类型必填）或 `lifecycle_hook`（`lifecycle` 类型必填）、`target_id`（作用的组件或区域）、`params`、`returns`、`state_changes`、`error_cases`、`data_mode`（`api | mock`）。`api` 方法必须有 `endpoint`；`mock` 方法必须有 `mock_return` 和 `mock_scope: in_method`，可选 `mock_logic`。mock 数据只存在于方法返回值中，JSON 顶层、组件和布局对象不得携带业务 mock 数据。
- `business_rules[]` 包含 `id`（如 `br.001`）、`rule`（含具体数值和条件）、`source`（`requirement | conversation | user_confirmed`）、`confirm_status`；`from_conversation` 场景必填，其他场景用于补充需求未写明但用户确认过的规则。组件、交互、方法的 `requirement_ref` 可引用它或需求文档的 ID。
- `change_log[]` 仅增量场景使用：`id`（`chg.001`）、`type`（`add | modify | remove`）、`target_ids`、`summary`、`before` / `after`（`modify` 必填）、`confirm_status`；`metadata.base_document_id`、`metadata.base_version` 必填，`metadata.version` 必须相对基线递增。
- 状态包含 `id`、`target_id`（布局、组件或 overlay）、`state_type`、`applicability`（`applicable | not_applicable`）；`not_applicable` 必须填写 `reason`。
- 表格、列表、卡片、图表、表单提交及 overlay 内的异步内容标记 `async: true`，每个 `async: true` 对象都要有 `loading`、`empty`、`error` 三类状态。

### 5.2 Markdown 章节顺序

```text
# 页面布局设计文档
## 页面概览
## 项目技术栈与规范
## 页面布局树
## 区域与组件明细
## 交互与流程
## 方法与数据（API / Mock）
## 弹窗、抽屉与确认框
## 页面状态
## 响应式行为
## 视觉规范
## 页面代码生成约束
## 待确认项与建议
## 校验结果
```

增量场景（`incremental_add` / `incremental_modify`）在“待确认项与建议”之后、“校验结果”之前增加 `## 变更记录`，渲染 `change_log` 的全部条目（含 `before` / `after`），并列出基线版本与新版本；非增量场景不输出该章节。

JSON 是唯一数据源。Markdown 在所有阶段确认后，按 5.2 章节顺序逐节从 JSON 机械渲染：不新增、不改写 JSON 中没有的内容，也不能只写“详见 JSON”，每章必须展开对应 JSON 的完整内容。

## 六、校验与状态

生成前检查：

- 页面名称、布局根节点和必要确认项已完成；
- 输出路径不存在，或用户已明确确认覆盖；
- 项目上下文来源已记录。

生成后检查（第 1–8 项由 `validate-layout.mjs --mode final` 执行，规则见 2.3；每个阶段增量写入后已运行过 `draft` 校验，此处是完整终检）：

1. JSON 可解析，Markdown 和 JSON 文件非空；
2. 所有布局、组件、交互、overlay、状态 ID 唯一；
3. 布局节点的 `parent_id` 和 `children` 引用完整；
4. 组件的 `layout_id`、交互的 `source_id/target_id`、状态的 `target_id` 都指向存在对象；每个组件都有合法的 `source`，且 `component_path`、`reuse_reason` 等附加字段齐全；
5. overlay 的触发事件和按钮交互引用有效；每个交互都有有效的 `method_id` 或 `no_method_reason`，`mock` 方法含 `mock_return` 且 `mock_scope` 为 `in_method`，`api` 方法含 `endpoint`；
6. loading、empty、error 等异步场景已覆盖或明确 `not_applicable`；
7. 视觉 Token、响应式和项目规范字段已填写或标记 `[待确认]`；
8. Markdown 由 JSON 渲染生成，章节完整，各章节条目数量与 JSON 对应数组一致；
9. 生成的文档不包含未标记的臆测内容（由模型人工核对，脚本无法覆盖）。

状态定义：

- `passed`：生成、写入和全部核心校验成功；
- `partial`：文档可用，但存在非核心 `[待确认]` 或上下文缺失；
- `failed`：输入、写入、核心结构或一致性校验失败；
- `cancelled`：用户取消提问、覆盖或输出。

校验失败不得报告 `passed`。失败时只修复校验报告指出的对象并重新校验，最多重试 3 次；重试前记录失败原因，不覆盖已有有效产物。

## 七、任务、确认和恢复

- 由于需要提问和写入，必须使用 Durable Path，并记录任务 ID、当前阶段、已确认内容、待确认项、输出路径和校验结果。
- 写入前必须展示目标路径和产物范围；存在同名文件时必须请求覆盖确认。
- 用户未确认时只能停留在提问、预览或规划阶段。
- 恢复任务时先读取持久化状态和已有输出（含 `status: draft` 的 `page-layout.json`，其中的 `questioning_mode` 与 `complexity_tier` 沿用），核验副作用后从最近一个可验证阶段继续，不重复执行已确认成功的阶段；先对已有 JSON 运行一次 `draft` 校验，只重新确认 `confirm_status` 仍为 `suggested` 或 `pending` 的内容。
- 用户取消时保留已有文件，不覆盖、不删除，并将任务状态设为 `cancelled`。

## 八、完成标准

- 页面布局已按层级递归拆分，所有叶子区域都有内容或组件说明；
- 组件、交互、overlay、状态、响应式和视觉规范均已覆盖；
- 交互中的按钮、筛选、切换等事件可追溯到组件，弹层按钮具备完整行为说明；
- 项目组件库和规范来自实际上下文或明确标记待确认；
- 每个组件都已确认来源（复用项目组件、组件库原生、建议抽取、页面内实现），`code-generator` 可据此决定是否拆分组件文件；
- 每个交互都具备完整的前置条件、成功/失败反馈、loading、防重复、权限和成功后变化，并有对应的方法规格（`api` 或 `mock`），生命周期方法（如初始化加载）同样已定义；
- 未指定接口的交互全部为 `mock`，mock 数据仅在方法内返回，没有接口联调；
- 视觉取值为具体值或项目 token 引用，没有因用户选择“沿用”而无依据写入的内容；
- Markdown + JSON 已写入并通过结构和引用校验；
- 输出可直接作为 `code-generator` 的页面实现输入；
- 没有修改业务代码或静默覆盖已有文档。

## 九、版本历史

- v1.0：新增页面布局递归提问、组件/交互/弹层/状态/视觉规范收集，以及 Markdown + JSON 双文档输出。
- v1.1：提速优化，不改变产物字段、校验项和完成标准：① 草案优先，先生成 `[建议]` 草案再确认；② 批量提问，同级节点合并、阶段 4 与 5 合并；③ 状态采用默认模板加例外确认；④ JSON 作为唯一数据源并增量写入，Markdown 由 JSON 渲染生成；⑤ 新增提问模式选择，保留 v1.0 的 `from_scratch` 从零逐项提问方式，默认 `draft_first`；⑥ 消除重复收集：节点级响应式只在阶段 3 收集，视觉规范先引用项目 token，组件库映射在阶段 4 记录，异步状态统一在阶段 7 确认；⑦ 结构校验脚本化：新增只读脚本 `scripts/validate-layout.mjs`，每阶段运行 `draft` 校验，终检运行 `final` 校验，无 Node.js 时降级为人工逐项检查，并补充 JSON 字段约定和 `draft` 状态值；⑧ 复杂度分档（`simple | standard | complex`）：只调整 `draft_first` 的确认批量，不改变产物和校验；⑨ 新增区域模板库 `templates/region-patterns.md`：模板只提供结构骨架，业务内容仍标记 `[待确认]`；⑩ 并行执行：项目上下文读取与阶段 1 提问并行、`draft` 校验与下一阶段草案生成并行，写入保持串行。
- v1.2：新增组件来源判定：阶段 4 对每个组件确认 `source`（`project_common | ui_library | new_shared | page_local`），给出自上而下的判定顺序和附加字段（`component_path`、`ui_component`、`reuse_reason`）；`validate-layout.mjs` 增加来源检查（`draft` 校验取值与附加字段，`final` 要求必填）；区域模板不预填来源。
- v1.3：明确交付目标为“补充需求的页面交互与 UI，并让方法 100% 可实现，产出可交付页面”：① 新增数据策略：未指定接口的交互使用 `mock`，不做接口联调，mock 数据只在生命周期或交互触发的方法内返回；② 新增 `methods` 方法规格（`api | mock`、入参、返回、状态变更、`mock_return`），生命周期方法同样记录，新增 Markdown 章节“方法与数据（API / Mock）”；③ 阶段 5 增加交互必填项（前置条件、成功/失败反馈、loading、防重复、权限、成功后变化）；④ 阶段 8 要求视觉取值必须具体或引用 token；⑤ 新增通用规则：确认前必须完整展示内容、答案不具体不落盘、交付完备性；⑥ `validate-layout.mjs` 增加方法与交互完整性检查。
- v1.4：支持三类新场景，不改变产物字段、校验项和完成标准：① 任务场景 `scenario`（`from_requirement | from_conversation | incremental_add | incremental_modify`），2.7 给出各场景起点；② 对话 0→1：新增阶段 0 需求澄清，对话整理为 `business_rules` 与 `page_scope`，经确认后进入阶段 1；③ 增量新增/修改：定位基线、基线校验、影响分析、仅对受影响对象局部提问、既有 ID 不变、`change_log` 记录、版本递增、默认写入新目录；④ `validate-layout.mjs` 新增 `--base` 与 `change_log` 校验（基线对象的未记录删除/改动、版本递增、`add`/`remove` 一致性），增量场景增加“变更记录”章节。
