---
name: requirement-generator
description: 将用户自然语言需求转化为标准化、可执行的机器需求文档（requirements.json），支持多模态输入，依赖外部项目上下文。
---

# Requirement Generator 主 Skill（v1.3）

## 概述
本主 skill 将用户自然语言需求（文本、图片、文档）转化为标准化、机器可读的需求规格文档 `requirements.json`，并生成人类可读的详细拆解文档 `requirements.md`。

**两种输入模式**：
- **通用模式**：输入为自然语言、图片、文档、代码片段等，按下文「执行流程（v1.2）」执行。
- **原型链接模式（v1.3 新增）**：输入包含原型页面 URL 时，**必须**改按「原型链接模式」章节执行：先与用户确认纳入范围，再只依据原型中确定的内容生成固定格式需求文档，供 `page-layout-designer` 与 `code-generator` 使用。该章节与通用模式冲突时，以该章节为准。

## 核心理念
- **零项目扫描**：不读取 package.json、不扫描 src/、不探测技术栈
- **上下文可插拔**：项目上下文由 scan-object-info 或用户手动提供
- **语义驱动**：仅基于需求语义分析，不绑定具体组件库或框架
- **标准输出**：输出符合 code-generator 输入规范的 JSON + Markdown 双文档
- **用户决策优先**：缺失上下文时，由用户决定如何补充

## 核心能力
- 多模态需求输入（文本、图片、文档、代码片段、API 文档片段）
- 需求模块化分解 + 分析（合并入 analysis）
- 7种通用前端流程识别 + sub-flow detection + UI组件识别（合并入 design-designer）
- REST API规格设计
- 测试用例生成
- 多维度需求质量评估（completeness/consistency/testability/security + feasibility/urgency）
- 项目上下文读取（仅读取，不探测）

## 执行流程（v1.2）

```
requirement-input-processor → requirement-analysis →
function-flow-designer + ui-component-identifier → api-spec-designer →
test-case-generator → requirement-evaluation →
project-context-reader → requirement-documentation
```

## 原子 skill 依赖关系

| 原子 skill | 依赖 |
|-----------|------|
| requirement-input-processor | 无 |
| requirement-analysis | requirement-input-processor |
| function-flow-designer | requirement-analysis |
| ui-component-identifier | function-flow-designer + requirement-analysis |
| api-spec-designer | requirement-analysis |
| test-case-generator | ui-component-identifier + requirement-analysis |
| requirement-evaluation | function-flow-designer + ui-component-identifier + api-spec-designer + test-case-generator |
| project-context-reader | requirement-evaluation |
| requirement-documentation | 所有前置 skill |

## 原型链接模式（v1.3）

**触发条件**：用户输入包含原型页面 URL（如 `*.html?v=...`）。用户同时给出文字补充时，文字内容视为用户确认信息，可参与生成。

**目标**：保证需求**完整且确定**。产出的文档交给 `page-layout-designer` 设计页面交互逻辑，再交给 `code-generator` 生成代码，并以文档中的测试用例评审代码。

### 一、核心原则

1. **只写确定内容**：正文只允许包含原型中明确呈现的内容，或用户在本次对话中明确确认的内容。
2. **禁止推测**：不得推导、补全、类比、套用常见做法；不得写「可能」「应该」「通常」「建议」「推测」等措辞；不得发明接口、字段、权限、校验、文案、测试数据。
3. **确认优先于生成**：范围未经用户确认，不得生成需求文档。
4. **可追溯**：每条模块、字段、规则、流程、用例都标注原型来源位置；原文文案、数值、状态值逐字保留，不改写。
5. **不阻塞**：原型未明确的内容不向用户追问补全，只记录在「原型未明确项」中；是否补充由用户决定。

### 二、执行流程

```
读取原型链接 → 按页面模块拆分 → 【范围确认关卡】→ 逐模块提取确定内容
  → 按固定格式生成文档 → 完成后校验 → 输出并提示下游使用方式
```

| 步骤 | 说明 |
|------|------|
| 1. 读取原型 | 使用 WebFetch 读取链接。读取失败（内网、需登录、超时）时，请用户提供 HTML 文件、截图或粘贴内容，**不得根据链接名或经验猜测页面内容**。 |
| 2. 提取核对 | WebFetch 返回的是模型摘要，可能遗漏。提取时应要求保留原文文案、数值、状态值、条件分支；页面较大时按模块分次提取。提取结果与用户确认的信息不一致时，以用户为准。 |
| 3. 模块拆分 | 按页面模块（Tab、列表区、弹窗、筛选区、面包屑、公共导航等）拆分，生成「模块清单」。 |
| 4. 范围确认关卡 | 见下文「三、范围确认」。 |
| 5. 提取内容 | 仅对「纳入」模块提取；复用 `requirement-input-processor`、`requirement-analysis`、`function-flow-designer`、`ui-component-identifier`，但**只能归纳原型明确内容**。 |
| 6. 生成文档 | 按「四、固定文档格式」输出。 |
| 7. 校验 | 按「五、完成后校验（原型链接模式）」。 |

**本模式下的原子 skill 调整**：
- `api-spec-designer`：**不执行**。不推导接口；仅在「业务规则」中记录原文明确出现的接口行为（如错误码、并发限制）。
- `project-context-reader`：**不执行**。需求只依据原型；项目技术栈由 `page-layout-designer` 负责读取。`project_context_used` 记为 `false`。
- `requirement-evaluation`：不输出评分，改为执行「五、完成后校验」；`quality` 字段各分值置 `null` 并注明 `reason: "原型链接模式不评分"`。
- `test-case-generator`：只能从原型中明确的规则、状态、限制、文案生成用例，不补充经验性用例。

### 三、范围确认

读取原型后，先展示「模块清单」，由用户确认**哪些模块纳入、哪些排除**。

| 编号 | 模块名称 | 原型位置 | 初判类别 | 初判依据（原文） | 建议 |
|------|---------|---------|---------|-----------------|------|

**初判类别**（只能依据原型原文或链接参数判定，判定不出一律为「待判定」）：

| 类别 | 含义 | 默认建议 |
|------|------|---------|
| 本期新增/变更 | 原文标注为本期版本，或用户指出 | 纳入 |
| 历史已完成 | 原文标注为已上线/历史版本，或用户指出 | 排除 |
| 通用布局/公共 | 面包屑、导航、页头页脚、帮助链接等全局公共部分 | 排除 |
| 待判定 | 原文无法判断 | 无默认，必须由用户选择 |

规则：
- **所有模块都必须由用户明确确认**，包括默认建议的模块；用户未回复前不得生成。
- 模块数 ≤ 4 时可用 `AskUserQuestion`；超过时以表格展示，请用户按编号回复「纳入：…；排除：…」。
- 用户可要求将某模块拆到功能点粒度再确认。
- 用户确认后记录到文档「范围说明」；被排除的模块只在「范围说明」中列名和原因，**正文不得出现其任何细节**。
- 若某「纳入」模块依赖「排除」模块的内容（如跳转到详情页），只记录依赖关系本身（目标页面名/链接），不展开被排除模块的需求。

### 四、固定文档格式

产物为 `requirements_{需求名称}.md` 与 `requirements_{需求名称}.json`，保存位置不变。`.md` 必须严格按以下章节与顺序生成，**章节不得删减、不得调换；无内容的章节写「无」**。

```markdown
# {需求名称}

## 0. 文档信息
| 项 | 内容 |
|----|------|
| 来源链接 | {原型 URL，含版本参数} |
| 原型版本 | {链接中的版本参数；无则写「无」} |
| 生成时间 | {实际时间} |
| 范围确认 | 已确认（{确认时间}） |
| 内容原则 | 仅含原型明确内容，无推测 |

## 1. 需求名称
{一行；取自页面标题或用户指定}

## 2. 需求简述
{1–3 句，仅陈述原型明确的目标与对象，不加评价和推断}

## 3. 需求详细说明

### 3.1 范围说明
| 编号 | 模块 | 结论 | 原因 |
|------|------|------|------|
| M-xx | … | 纳入 / 排除 | 用户确认：{原因} |

（仅当有参考页面时增加，见「七」）
参考采纳记录：
| 参考 ID | 参考页面 | 参考点 | 结论 | 用户确认内容 |
|---------|---------|--------|------|-------------|
| REF-xx | {名称+链接} | {参考点名称} | 采纳 / 修改后采纳 / 不采纳 | {修改后采纳时写用户描述；其余写「无」} |

### 3.2 模块划分
| 模块 ID | 模块名称 | 原型位置 | 说明 |
|---------|---------|---------|------|
（仅「纳入」模块）

### 3.3 字段与元素规格
按模块分组，每个控件/字段一行：
| ID | 所属模块 | 名称/文案 | 类型 | 必填 | 校验/限制 | 默认值 | 来源 |
|----|---------|----------|------|------|----------|--------|------|
F-xx，原型中未出现的列写「—」，不得补值。

### 3.4 业务规则与约束
| 规则 ID | 所属模块 | 规则（含具体数值/条件） | 来源 |
|---------|---------|------------------------|------|
R-xx，一条规则只表达一件事，数值、阈值逐字保留。

### 3.5 状态与枚举
| 对象 | 状态值 | 界面显示 | 流转条件 | 来源 |
|------|--------|---------|---------|------|

### 3.6 执行流程
每个流程：流程 ID（FLOW-xx）、触发条件、主流程步骤（编号）、分支/异常步骤、结束状态；状态机用状态流转表。只写原型明确的步骤与分支。

### 3.7 交互与反馈
| 触发（控件+事件） | 前置条件 | 结果 | 反馈文案（逐字） | 来源 |
|------------------|---------|------|-----------------|------|
原型仅为占位提示的交互，在此写明「原型仅提示：{文案}」，真实行为不写。

### 3.8 页面跳转与显隐条件
| 对象 | 条件/动作 | 结果 | 来源 |
|------|----------|------|------|
含：跳转目标、按钮按状态显示/隐藏、版本开关、URL 参数控制。

## 4. 测试用例（完成标准）

### 4.1 用例清单
| 用例 ID | 所属模块 | 关联 ID | 类型 | 前置条件 | 操作步骤 | 预期结果 | 来源 |
|---------|---------|---------|------|---------|---------|---------|------|
TC-xx；关联 ID 必填，指向 F/R/FLOW 编号；类型限：功能 / 校验 / 边界 / 状态 / 交互 / 显隐。

### 4.2 规则—用例覆盖矩阵
| 规则/流程 ID | 覆盖用例 |
|-------------|---------|
每条 R-xx、FLOW-xx 至少有一条用例；无法形成用例的写原因。

## 5. 原型未明确项
| 编号 | 位置 | 事实描述 |
|------|------|---------|
U-xx，仅陈述「原型此处为占位 / 未定义 / 未展示」这一事实；不提建议、不提推测；**这些项不是代码生成与评审的依据**。
```

**格式设计说明（面向下游）**：
- 各表的稳定 ID（M/F/R/FLOW/TC/U）是下游引用依据：`page-layout-designer` 可按 `M-xx` 对应页面范围与区域，按 `F-xx` 对应组件，按 `3.6/3.7` 对应交互事件，按 `3.5/3.8` 对应页面状态与显隐；`code-generator` 评审时按 `TC-xx` 逐条核对，并通过 `关联 ID` 回溯到规则与字段。
- `预期结果` 必须可被观察或断言（如具体文案、按钮显隐、请求返回码、数值边界），不得写「正常」「正确」之类不可验证表述。
- 原型示例数据（如列表里的 5 条演示数据）只作为字段取值参考，不作为规则；如需引用，标注「示例」。

**JSON 结构（原型链接模式）**：保持 v1.2 顶层字段，并新增/调整如下：

```json
{
  "version": "1.3",
  "mode": "prototype_link",
  "source": "prototype_url",
  "source_url": "<原型 URL>",
  "project_context_used": false,
  "requirement": { "name": "", "summary": "" },
  "scope": { "confirmed_at": "", "included": [{ "id": "M-01", "name": "" }], "excluded": [{ "id": "M-0x", "name": "", "reason": "" }] },
  "modules": [], "fields": [], "rules": [], "states": [], "flows": [], "interactions": [], "visibility": [],
  "api_spec": { "explicit": [] },
  "test_cases": [{ "id": "TC-01", "module": "M-01", "refs": ["R-01"], "type": "", "precondition": "", "steps": [], "expected": "", "source": "" }],
  "coverage": [{ "ref": "R-01", "cases": ["TC-01"] }],
  "unspecified": [{ "id": "U-01", "location": "", "fact": "" }],
  "quality": { "overall_score": null, "reason": "原型链接模式不评分" }
}
```

`.json` 与 `.md` 的条目、ID 与数量必须一致；`test_cases` 保持 `code-generator` 的 `requirement-reader` 可读取的字段。

### 五、完成后校验（原型链接模式）

在报告完成前逐项检查，任一失败不得报告 `passed`：

1. 范围已由用户确认，且 `.md` 的「范围说明」与 `.json` 的 `scope` 一致。
2. `.md` 章节完整、顺序与「固定文档格式」一致；`.json` 可解析，且条目 ID 与 `.md` 一一对应。
3. 所有 F/R/FLOW/TC 条目都有「来源」，来源指向原型的真实位置。
4. 排除模块的细节没有出现在正文、用例或 JSON 中。
5. 正文无推测性措辞（可能、应该、通常、一般、建议、推测、大概），无原型中不存在的字段、接口、文案、权限。
6. 所有 TC 的「关联 ID」存在；每条 R-xx、FLOW-xx 在覆盖矩阵中至少有一条用例或明确原因。
7. 所有 TC 的「预期结果」可观察、可断言。
8. 「原型未明确项」只含事实陈述，且未被当作规则或用例依据。
9. 有参考页面时，另按「七」的校验项检查。

状态：全部通过为 `passed`；读取失败、用户未确认范围为 `failed`/`cancelled`（不生成文档）；仅部分模块无可用内容时为 `partial` 并说明。

### 六、输出后提示

完成后向用户说明：已纳入/排除的模块、原型未明确项数量，以及下游使用方式：
1. 将 `.md` 提供给 `page-layout-designer` 设计页面布局与交互；
2. 将 `.json` 与页面设计文档提供给 `code-generator` 生成代码；
3. 代码评审以「4. 测试用例」为完成标准。

### 七、竞品/参考页面对标（附加规则）

用于「需求中要求参考某个竞品或已有页面」的场景。**参考页面不是需求本身**，只提供「可选参考点」；是否采纳由用户逐项决定，未被采纳的内容一律不写入需求。

**触发条件**：输入中包含参考页面（链接、截图），且用户表达了「参考」「对标」「类似」等意图。可与原型链接同时出现。无法判断某个链接是「原型」还是「参考页面」时，必须询问用户，不自行判定。

**流程**：

```
读取参考页面 → 拆成「可参考点」清单 → 用户逐项选择采纳方式 → 仅将采纳项并入需求
```

1. **读取**：规则同「二、执行流程」步骤 1–2（读取失败请用户提供截图或 HTML，不猜测）。
2. **拆分**：按页面模块或功能点拆成清单，只列参考页面中**可见**的内容（布局、字段、按钮、状态、交互表现），格式如下：

   | 编号 | 参考点 | 参考页面中的呈现（原文/可见表现） |
   |------|--------|--------------------------------|

3. **逐项确认**：每个参考点由用户选择：
   - **采纳**：按参考页面的呈现写入需求；
   - **修改后采纳**：以用户给出的修改描述为准写入，不保留被修改的部分；
   - **不采纳**：不写入。

   所有参考点都必须有明确结论，未回复的参考点按「不采纳」处理且不得写入，同时提示用户。
4. **并入需求**：采纳项归入对应模块，沿用固定格式的 F/R/FLOW/TC 条目，来源标记为 `〔参考：{名称}·{位置}〕`，其测试用例同样遵守「预期结果可观察」要求。

**禁止事项**：
- 不做竞品分析、优劣评价、功能对比表、「为什么这样设计」的解读。
- 不推断参考页面背后不可见的内容（后端规则、权限、数据来源、校验逻辑、异常分支）；页面没展示的一律不写。
- 不默认照搬参考页面的品牌名、文案、图片；文案只有在用户明确「采纳」时才逐字写入。
- 不因为「竞品有」就为本需求补充原型和用户都没提到的功能。

**冲突处理**：同一功能点在原型页面与参考页面中表现不一致时，以原型页面和用户确认为准，并向用户确认是否仍需采纳该参考点；不自行取舍。

**落盘约定**：
- `.md`：在「0. 文档信息」增加一行「参考页面」（名称+链接，无则不加该行）；在「3.1 范围说明」下增加「参考采纳记录」表（见固定格式）；未采纳的参考点只在该表列名称与「不采纳」，**正文、用例中不得出现其细节**。
- `.json`：`scope.references` 记录参考页面与逐项结论：

```json
{
  "scope": {
    "references": [
      {
        "id": "REF-01", "name": "", "url": "",
        "points": [{ "id": "REF-01-01", "name": "", "decision": "adopt | adopt_modified | reject", "user_note": "" }]
      }
    ]
  }
}
```

**追加校验**：
1. 每个参考点都有用户确认的结论，`.md` 与 `.json` 一致。
2. 来源标记为「参考」的条目，都能在「参考采纳记录」中找到结论为「采纳」或「修改后采纳」的参考点。
3. 「不采纳」参考点的细节没有出现在正文、用例或 JSON 的其他字段中。
4. 全文无竞品评价、对比或推断性措辞。

---

## 主 Skill 完成标准（v1.2，通用模式）

1. 原始需求已解析（文本/图片/文档/代码片段，含 `input_type` 细分）
2. 需求类型已分析（新建/修改、API 需求、权限）
3. 功能流程已识别（CRUD/线性/状态机等，含 sub-flow）
4. UI 组件类型已识别（form、button、table 等，含 validation 子流程）
5. API 接口已设计，或明确记录无需新增 API
6. 测试用例已生成
7. 需求质量已评估（7 维度：completeness/consistency/testability/security/feasibility/urgency/overall）
8. 项目上下文已读取，或已记录用户选择的上下文来源（scan-object-info、用户上传或跳过）
9. `requirements.json` 和 `requirements.md` 已按命名规则写入指定目录
10. 输出内容与原始需求、已确认上下文和各分析结果一致

## 完成后校验

在报告任务完成前必须逐项检查：

1. 输出目录存在，且包含对应的 `requirements.json` 和 `requirements.md`。
2. 两个文件均非空且可读取；JSON 文件可被解析。
3. JSON 包含 `version`、`generated_at`、`source`、`requirement`、`modules`、`flow`、`ui_components`、`api_spec`、`test_cases` 和 `quality` 字段。
4. `source` 与实际输入类型一致，`generated_at` 使用实际生成时间，不使用固定示例时间。
5. 所有质量评分均为实际分析结果；评分在 `0-100` 范围内，无法可靠计算时使用 `null` 并记录原因。
6. 模块、流程、UI 组件、API 和测试用例之间的引用关系一致。
7. 项目上下文来源可追溯；未自动扫描项目，且用户选择已被准确记录。
8. Markdown 结构完整，JSON 和 Markdown 的核心内容一致。
9. 任一校验失败时不得报告 `passed`，应返回失败原因。

## 状态与错误处理

- `passed`：输入、分析、文档生成、文件写入和完成后校验全部成功。
- `partial`：非核心上下文缺失或部分分析不可用，但已生成可用文档并明确记录影响。
- `failed`：输入解析、核心分析、文件写入或完成后校验失败。
- `cancelled`：用户取消上下文选择或文档生成，不覆盖已有输出。

输入无效、核心分析失败或文件写入失败时停止后续生成，不使用猜测值补全业务数据。

## 重试规则
- 每个原子skill失败后可重试 **3次**
- requirement-evaluation 发现问题可返回 requirement-analysis 重新分析（最多循环 **2次**）
- project-context-reader 无法获取上下文时，等待用户选择

## 输入形式（扩展版）
| 输入类型 | input_type 值 | 示例 |
|----------|---------------|------|
| 文本需求 | `user_text` | "实现用户登录功能，包含用户名、密码输入，登录按钮" |
| 图片+说明 | `ui_design_image` | [上传UI设计图] + "这是登录页面的设计" |
| 需求文档 | `uploaded_document` | 上传 requirements.docx 内容 |
| 代码片段 | `code_snippet` | [粘贴现有代码片段] + "在现有代码上修改" |
| API 文档 | `api_spec` | [粘贴 API 接口描述] + "新增此 API 调用" |
| 混合输入 | `mixed` | 文本 + 图片 + 代码片段组合 |
| 原型链接 | `prototype_url` | `https://…/page.html?v=V2611.01`，走「原型链接模式」 |
| 参考/竞品页面 | `reference_page` | 链接或截图 + "参考这个页面的筛选区"，走「原型链接模式·七」，逐项确认后才采纳 |

## 输出产物

需求文档统一保存至 `docs/lijianxin/requirement-generator/` 目录下。文件名规则：
- 用户输入了需求名称 → `requirements_{用户输入名称}.json` / `requirements_{用户输入名称}.md`
- 用户未输入名称 → `requirements_{timestamp}.json` / `requirements_{timestamp}.md`

```json
{
  "version": "1.2",
  "generated_at": "<实际生成时间>",
  "source": "user_text | uploaded_document | ui_design_image | code_snippet | api_spec | mixed",
  "project_context_used": true,
  "requirement": {
    "raw_text": "用户原始需求",
    "summary": "需求摘要",
    "code_action": "new",
    "requires_new_api": true,
    "has_auth": true
  },
  "project_context": { "source": "scan-object-info | manual | default", "data": { } },
  "modules": [ ],
  "flow": { },
  "ui_components": [ ],
  "api_spec": { },
  "test_cases": [ ],
  "quality": {
    "overall_score": null,
    "completeness_score": null,
    "consistency_score": null,
    "testability_score": null,
    "security_score": null,
    "feasibility_score": null,
    "urgency_score": null,
    "issues": [],
    "recommendations": []
  }
}
```

## quality.score 7维度评估体系（v1.2 新增 feasibility/urgency）
- **overall_score**：综合评分（0-100）
- **completeness_score**：完整性评分（模块覆盖、字段覆盖、异常处理）
- **consistency_score**：一致性评分（命名一致、术语一致、流程一致）
- **testability_score**：可测试性评分（输入可控、输出可观察、状态可检测）
- **security_score**：安全性评分（XSS、CSRF、注入风险）
- **feasibility_score**：可行性评分（技术可行性、依赖可满足性）**[新增 v1.2]**
- **urgency_score**：紧急度评分（业务优先级、截止时间压力）**[新增 v1.2]**

## 项目上下文读取规则
> 原型链接模式不执行本规则（见「原型链接模式」），项目上下文由 `page-layout-designer` 读取。

- 读取文件路径：`./.claude/project-context.json`
- 如果文件存在：自动读取并使用
- 如果文件不存在：
  - 询问用户：
    1. 执行 scan-object-info skill 扫描项目
    2. 手动上传 project-context.json
    3. 跳过，使用默认配置
- **不自动执行 scan-object-info**，仅提示用户

## 注意事项
- 所有输出**不依赖项目文件**，适用于任何前端项目
- 不预设任何UI组件库，完全由外部上下文提供
- 所有分析基于语义，非路径或代码结构
- 输出的 requirements.json 可直接用于 code-generator

## 文件系统位置
- 主skill路径：./.claude/skills/requirement-generator/SKILL.md
- 原子skill路径：./.claude/skills/requirement-generator/atomic-skills/下各子目录

## 版本
主skill名称：requirement-generator
状态：启用
- v1.3：新增「原型链接模式」——范围确认关卡（排除历史已完成/通用布局模块）、仅生成原型确定内容、固定文档格式（含稳定 ID、来源追溯、覆盖矩阵）、面向 page-layout-designer 与 code-generator 的衔接约定；新增「竞品/参考页面对标」附加规则（逐项确认采纳，未采纳内容不入需求，不做竞品分析与推断）。
