# 预编排流程：前端页面开发（frontend-page-development）

> 预编排流程是 orchestrator 内预先定义的多主 Skill 固定链路。命中后直接按 Durable Path 执行，不再逐个询问“选哪个 Skill”，各阶段之间的产物和上下文由本文件约定。
> 索引见 `.claude/skills/orchestrator/pipelines_register.md`。

## 1. 使用方式

用户这样说即可触发：

```text
依照需求文档 {文档链接或路径} 完成前端页面
```

同义说法：完成前端页面、前端页面开发、按需求文档开发页面、从需求到页面代码、需求文档到前端页面。

## 2. 总链路

```text
S1 requirement-generator   需求分析，生成需求文档（.md + .json）
        ↓  G1
S2 page-layout-designer    参照需求文档，补全待确认项、前端技术章及全部 UI 交互/事件，产出页面完整交互 JSON（+ .md）
        ↓  G2
S3 code-generator          读取页面交互 JSON，生成前端可交付代码
```

三个阶段严格串行（`serial`），不并行。阶段之间设关卡（G1、G2），关卡不通过不得进入下一阶段。

## 3. 输入识别与起点

先判定用户给出的“文档链接”属于哪一类（`input_kind`），再决定 S1 的执行方式。无法判断时用 `AskUserQuestion` 询问一次，不自行猜测。

| `input_kind` | 判定依据 | S1 处理 |
|--------------|----------|---------|
| `prototype_url` | 原型页面 URL（如 `*.html`、`*.html?v=...`） | 执行，走 requirement-generator 的「原型链接模式」（含范围确认关卡） |
| `requirement_doc` | 已有 `requirements_*.json` / `.md`（路径或链接） | 跳过，状态记为“已提供”；仅校验 JSON 可解析且 `.md` 与 `.json` 同时存在 |
| `other_doc_or_text` | 其他需求文档、图片、自然语言需求 | 执行，走 requirement-generator 的通用模式 |

起点由已有产物决定：用户同时给出可用的 `page-layout.json` 时，S2 也可跳过（状态“已提供”，须先运行 `validate-layout.mjs --mode final`）。跳过阶段必须在摘要中显式标记，不得静默省略。

用户明确说“只做到某阶段”（如“只做页面交互设计”）时，在该阶段结束后停止并标记 `stop_after`，此时不进入后续阶段。

## 4. 阶段定义

### S1：需求分析（requirement-generator）

| 项 | 内容 |
|----|------|
| 输入 | `input_kind` 对应的文档、链接或文本 |
| 执行 | 读取 `.claude/skills/requirement-generator/SKILL.md`，按其流程执行，包括其自带的交互确认（原型模式的范围确认） |
| 产出 | `docs/lijianxin/requirement-generator/requirements_{需求名称}.json` 与 `.md` |
| 完成标准 | requirement-generator 的完成后校验状态为 `passed` 或 `partial` |

**G1 关卡**：状态为 `passed` 或 `partial` 且文件存在、JSON 可解析，直接进入 S2，不额外询问。状态为 `failed` 或 `cancelled` 时终止，不进入 S2，并输出失败原因。

### S2：页面交互设计（page-layout-designer）

| 项 | 内容 |
|----|------|
| 输入 | S1 产出的 `requirements_*.json`（`requirement_path`）；用户已确认的技术栈 |
| 执行 | 读取 `.claude/skills/page-layout-designer/SKILL.md`，场景固定为 `from_requirement`，不再询问场景 |
| 任务初始化 | 提问模式、复杂度档位、技术栈/项目上下文来源、输出路径合并为一次提问；`.claude/project-context.json` 存在时直接读取，不再问技术栈 |
| 补全范围 | 需求中的“原型未明确项”（U-xx）、项目技术栈与规范章节、页面布局、组件、交互/事件及方法规格、overlay、状态、响应式、视觉规范，全部补到 page-layout-designer 的必填项要求 |
| 产出 | `docs/lijianxin/page-layout-designer/{页面名}_{timestamp}/page-layout.json`（唯一数据源）与 `page-layout.md` |
| 完成标准 | `validate-layout.mjs --mode final` 通过，`validation.method` 已记录 |

**待确认项处理（S2 结束前必须执行一次）**：

1. 汇总 JSON 中所有 `open_questions` 的 `pending` 项和仍标注 `[待确认]` 的字段，分批展示（`AskUserQuestion` 单次最多 4 个问题）。
2. 每项由用户选择：给出具体取值 / 采用文档中的建议默认值（记为用户确认）/ 保留待确认。
3. 已决定的项写回 JSON（`confirm_status`、去掉 `[待确认]`、更新 `open_questions`），重新渲染 Markdown 并重新运行 final 校验。
4. 用户选择“保留待确认”的项记入共享上下文的 `accepted_pending`，S3 沿用 page-layout 中的现状，不再询问。
5. 超出本页范围的项（`out_of_scope`）不阻塞。

**G2 关卡**：final 校验为 `passed`，或为 `partial` 且所有 `pending` 项都已按上述规则处置（已决定或已列入 `accepted_pending`），才进入 S3。校验失败按 page-layout-designer 规则重试（最多 3 次），仍失败则终止并输出未通过项。

### S3：代码生成（code-generator）

| 项 | 内容 |
|----|------|
| 输入 | `page-layout.json`（UI、交互、方法、状态、overlay、响应式、视觉、技术栈的权威来源）；`requirements_*.json`（业务规则、测试用例、示例数据） |
| 执行 | 读取 `.claude/skills/code-generator/README.md` 与 `SKILL.md`，按场景1（标准化输入）执行；单页面不执行 `module-integration` |
| 开始前提问（一次） | 输出位置：目标前端项目路径（按其现有规范生成）或默认 `docs/lijianxin/code-generator/{页面名}/`；用户在触发语中已给出时不再问 |
| 实现约束 | 只实现 page-layout 已定义的行为，不新增功能；mock 数据只写在 `methods` 内，不接入文档未指定的接口；`accepted_pending` 项按文档现状处理，必要的实现取值（如宽度、`scroll.x`）在偏差中如实记录 |
| 产出 | 代码文件及其样式文件；终稿说明含文件清单、实现摘要、偏差、验证结果、遗留问题 |
| 完成标准 | 按 code-generator 的完成标准执行；需求 `.md` 中的 TC-xx 逐条核对，结果写入验证报告 |

验证工具（如 esbuild、lessc、测试框架）不存在时，不擅自安装依赖：记录“未执行”和原因，该阶段状态为 `partial`，并在遗留问题中提示用户接入后补跑。

## 5. 阶段间交接契约

各阶段产出写入任务文件“共享上下文”，使用 `<!-- atomic-skill: {阶段 Skill} -->` 标记，后续阶段只读取不重复询问：

| 字段 | 来源阶段 | 使用阶段 | 说明 |
|------|----------|----------|------|
| `input_kind` | 入口 | S1 | 见第 3 节 |
| `requirement_name` | S1 | S2、S3 | 需求名称，也作页面名默认值 |
| `requirement_path` | S1 | S2、S3 | `requirements_*.json` 路径（`.md` 同目录同名） |
| `tech_stack` | S2 | S3 | React/Vue、UI 库及版本、样式方案等；`[待确认]` 项保持原样 |
| `page_layout_path` | S2 | S3 | `page-layout.json` 路径（`.md` 同目录） |
| `accepted_pending` | S2 | S3 | 用户选择保留的待确认项清单 |
| `output_dir` | S3 开始前 | S3 | 代码输出目录 |

### 已知衔接约定（S3）

code-generator 原子 Skill 当前未显式声明读取 `page-layout.json`，且 `requirement-reader` 的必需字段按 v1.2 结构（`ui_components`、`api_spec.endpoints`）校验，而原型链接模式生成的 JSON（`mode: prototype_link`）不含这些字段。orchestrator 在进入 S3 时按下列方式传入，以免因字段校验被误拒：

- 将 `page_layout_path` 作为 `existing_context` 与 `requirements_data` 的补充输入传给 code-generator；
- UI 组件规格取自 `page-layout.json` 的 `components`，接口与 mock 规格取自 `methods`，项目上下文取自 `project_context`；
- 对 `mode: prototype_link` 的需求 JSON，不按 v1.2 的必需字段拒绝，`api_spec.explicit` 为空表示全部使用 mock。

## 6. 任务状态与恢复

- 创建 `docs/lijianxin/tasks/current/task_{任务ID}.md`，阶段表使用 S1、S2、S3，各阶段内部原子 Skill 的进展写入执行日记。
- 阶段状态：待执行 / 执行中 / 已完成 / 已提供 / 已跳过 / 失败 / 待恢复；`partial` 作为结果标注附在“已完成”之后。
- 中断恢复：从第一个未完成阶段继续；已有产物先校验再复用，不重复执行已完成阶段；覆盖已有产物前必须确认。
- 终态后调用 `task-archiver` 归档并更新月度索引。

## 7. 校验（L1）

在各阶段自身完成标准之外，流程级检查：

1. S1、S2、S3 的产物路径都存在，且与共享上下文一致。
2. page-layout 中的 `requirement_ref` 均能在需求文档中找到对应的 F/R/FLOW/TC 编号。
3. 代码实现覆盖 page-layout 的全部组件、交互、方法、overlay 和状态；TC-xx 的核对结果已记录。
4. 没有出现需求与 page-layout 中均未定义的字段、接口、文案。
5. 所有跳过、`partial`、`accepted_pending` 和未执行的校验都已在摘要中如实列出。

任一项失败不得报告 `passed`。

## 8. 输出摘要

沿用 orchestrator 固定摘要格式，并追加阶段信息：

```text
主 Skill：pipeline:frontend-page-development
匹配关键词：{matched_keywords}
匹配分数：{match_score}
选择理由：{selection_reason}
声明依赖：[requirement-generator, page-layout-designer, code-generator]
执行路径：durable
是否持久化：是
校验级别：L1
任务 ID：{task_id}
状态：{status}

阶段状态：
- S1 需求分析：{状态}，产出 {requirements 路径}
- S2 页面交互设计：{状态}，产出 {page-layout 路径}
- S3 代码生成：{状态}，产出 {代码目录}
遗留项：{accepted_pending、未执行校验、其他偏差}
```

## 9. 完成标准

- 命中预编排流程时已读取本文件和三个阶段 Skill 的 SKILL.md。
- S1、S2、S3 均已执行，或有明确的“已提供 / 已跳过 / stop_after”记录。
- G1、G2 关卡结果已记录；S2 的待确认项已全部处置。
- 需求文档、页面交互 JSON、前端代码三类产物齐全，路径可追溯。
- L1 校验结论、遗留项、任务归档与月度索引完整。
