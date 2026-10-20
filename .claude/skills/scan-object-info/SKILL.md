---
name: scan-object-info
description: 智能扫描并分析前端项目的技术栈信息，支持技术栈检测、配置扫描、网络请求与路由检测、项目结构分析和项目模式识别。
---

# scan-object-info（v1.2）

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

- ...
```

### 共享上下文传递规则

```text
stack-001: 上游技能的输出必须写入 task_skill.md 共享上下文
stack-002: 下游技能优先从共享上下文读取，避免重新读取文件
stack-003: 共享上下文命中率低于 50% 时触发警告
```

---

## 原子技能列表（v1.2）

| 原子技能 | 估算规模 | 职责 | 执行阶段 |
| --- | ---: | --- | --- |
| pattern-matcher | 150 | 项目模式匹配，跳过已知模式 | 0（预处理）|
| scan-package-json | 200 | 解析 package.json | 1（并行）|
| scan-project-structure | 300 | 扫描目录结构 | 1（并行）|
| scan-config-context | 400 | 扫描配置和环境变量 | 1（并行）|
| detect-tech-stack | 600 | 检测框架、UI 和状态管理 | 2（并行）|
| detect-net-router | 500 | 检测请求和路由方案 | 2（并行）|
| skill-stack-context | 50 | 写入共享上下文 | 任意（最后）|

### 执行计划（并行优化）

```
并行组1：scan-package-json + scan-project-structure + scan-config-context
并行组2：detect-tech-stack + detect-net-router（依赖组1）
串行：skill-stack-context（更新共享上下文）
```

---

## 输出格式

### 完整输出（所有技能）

```markdown

## 项目摘要
[基于detect_tech_stack + scan_config_context + detect_net_router综合输出]

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

## 输入契约

- `target_path`：待扫描项目路径，默认当前项目根目录。
- `scan_scope`：扫描范围，可为 `all` 或指定技术栈、配置、结构、网络路由等范围。
- `write_shared_context`：是否写入 `.claude/skills/tasks/current/task_skill.md`，默认由任务上下文决定。
- `output_preference`：输出完整报告或按需裁剪的章节。

扫描范围必须来自用户输入或上层任务上下文，不得擅自扩大扫描范围。

## 输出契约

- 输出格式：中文 Markdown 报告，可选写入共享上下文。
- 报告必须包含项目摘要、实际执行的扫描范围、检测结果、confidence 和问题记录。
- 每个检测结果使用 `high`、`medium` 或 `low` 标注置信度，并说明证据来源。
- 返回状态：`passed`、`partial`、`failed` 或 `cancelled`。
- 核心输出路径和共享上下文路径由任务上下文确定；不得声称写入未实际生成的文件。

## 主 Skill 完成标准

1. 用户指定的扫描范围已执行，或明确记录未执行的范围和原因。
2. 项目摘要、基本信息、项目结构、配置、技术栈、网络与路由结果已按输出偏好生成。
3. 每个检测结果均包含 confidence 等级和可追溯的证据说明。
4. 并行扫描任务均已完成，或其失败、跳过和影响范围已明确记录。
5. 共享上下文已按输入契约成功写入，或已记录未写入的原因。
6. 文件缺失、降级结果和不确定结论均已明确标记。

## 完成后校验

在报告任务完成前必须逐项检查：

1. 实际执行范围与用户指定的 `scan_scope` 一致。
2. 输出章节与 `output_preference` 一致，不输出未执行扫描得到的结论。
3. 所有检测结果均包含 `high`、`medium` 或 `low` confidence 及证据来源。
4. 并行组任务的结果、失败项和影响范围均已汇总。
5. 共享上下文在要求写入时已成功更新，内容可读取且来源可追溯。
6. 缺失文件和降级处理已在报告中标明，不使用猜测值伪造检测结果。
7. Markdown 标题、表格和代码块结构完整，报告非空且可读取。
8. 任一核心校验失败时不得报告 `passed`，应返回 `partial` 或 `failed`。

## 状态与错误处理

- `passed`：指定扫描、报告生成、共享上下文写入和完成后校验全部成功。
- `partial`：部分文件缺失、部分扫描失败或存在低置信度结论，但已生成可用结果。
- `failed`：核心扫描、依赖解析、报告写入或完成后校验失败。
- `cancelled`：用户取消扫描或输出，不覆盖已有结果。

输入路径无效、核心扫描失败或写入失败时停止受影响的后续步骤，并记录失败原因。
