---
name: code-structure-analyzer
description: 分析页面、业务模块或流程的代码结构、执行流程、关键节点、变量和依赖关系，并生成结构化 Markdown 文档。
---

# Code Structure Analyzer

## 概述

读取项目中指定页面、业务模块或流程的代码，分析文件结构、执行流程、关键节点、重要变量和依赖关系，并在目标路径所在目录生成结构化 Markdown 文档。

## 输入契约

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `target_path` | string | 是 | 待分析的文件或目录 |
| `options.depth` | string | 否 | `shallow`、`moderate` 或 `deep`，默认 `moderate` |
| `options.include_patterns` | string[] | 否 | 包含的文件模式 |
| `options.exclude_patterns` | string[] | 否 | 排除的文件模式 |

## 输出契约

在 `target_path` 所在目录生成 `{分析对象名称}.md`，并返回：

```yaml
status: passed | partial | failed
output_path: string
analysis:
  overview: {}
  file_structure: {}
  flow: {}
  critical_nodes: []
  variables: []
  dependencies: {}
  child_logic: null | {}
issues: []
```

输出文档包含：

- 代码概览：文件数量、代码行数和技术栈
- 文件结构树
- 执行流程和 ASCII 流程图
- 关键节点分析表
- 重要变量清单
- 依赖关系：模块、NPM、API 和环境变量
- 模块边界说明
- 子元素引用摘要（按用户选择生成）

## 使用场景

| 场景 | 输入示例 | 输出示例 |
| --- | --- | --- |
| 单文件分析 | `src/views/UserList.vue` | `src/views/UserList.md` |
| 模块分析 | `src/store/modules/auth` | `src/store/modules/auth.md` |
| 流程分析 | `src/api/auth.ts` | `src/api/auth.md` |
| 整个项目 | `src/` | `src.md` |

## 执行流程

### 步骤 1：读取代码和项目上下文

读取目标路径并检测技术栈。若共享上下文中存在范围匹配且可追溯的 `tech_stack`、`project_type`，可以复用；否则重新检测。

```python
tech_stack = read_valid_context("tech_stack") or detect_tech_stack_from_path(target_path)
project_type = read_valid_context("project_type") or infer_project_type(target_path)

files = collect_files(
    target_path,
    include_patterns=options.get(
        "include_patterns",
        ["*.vue", "*.ts", "*.js", "*.tsx", "*.jsx"]
    ),
    exclude_patterns=options.get(
        "exclude_patterns",
        ["*.spec.ts", "*.test.ts", "node_modules"]
    )
)
```

目标路径不存在、无可分析文件或读取失败时停止后续步骤并返回 `failed` 或 `partial`，不得使用猜测内容补全结果。

### 步骤 1.5：子元素引用询问

这是步骤 1 的条件子步骤。发现本地子元素引用时，询问用户分析深度：

- `list_only`：仅列出引用，不读取子元素内容
- `read_signatures`：读取签名、用途和位置
- `deep_read`：读取签名、用途、位置、核心逻辑和关键变量

没有本地引用时使用 `skip`。本地引用仅包括相对路径、项目路径别名和已由项目配置声明的本地别名，不依据包名字符特征判断。

```python
child_refs = extract_local_imports(
    files,
    aliases=read_project_aliases(project_root)
)

if not child_refs:
    child_action = "skip"
else:
    child_action = ask_user(
        f"检测到 {len(child_refs)} 个本地子元素引用，是否展开读取其逻辑？",
        options=[
            {"label": "仅列出引用（默认，快速）", "value": "list_only"},
            {"label": "读取签名和核心逻辑", "value": "read_signatures"},
            {"label": "深度读取全部逻辑", "value": "deep_read"}
        ]
    )

if child_action == "list_only":
    child_logic = None
elif child_action == "read_signatures":
    child_logic = read_child_signatures(child_refs, max_depth=3)
elif child_action == "deep_read":
    child_logic = deep_read_children(child_refs, max_depth=5)
```

### 步骤 2：并行解析结构和依赖

代码结构扫描与依赖关系解析可以并行执行，完成后合并结果。

```python
def parse_code_structure_parallel(files):
    with ThreadPoolExecutor(max_workers=2) as executor:
        structure_future = executor.submit(scan_code_structure, files)
        dependency_future = executor.submit(scan_dependencies, files)
        return merge_results(
            structure_future.result(),
            dependency_future.result()
        )
```

代码结构提取包括：

- 文件列表和大小
- 函数、方法及参数
- Vue、React 和 Node.js 组件或模块
- 类、常量、枚举和类型定义

依赖提取包括：

- 文件级 `import`、`export` 和 `require`
- `package.json` 中的 NPM 依赖
- 环境变量使用
- API 端点引用

解析器选择应统一使用文件语言或文件扩展名的同一字段，支持 `vue`、`typescript`、`javascript`、`tsx` 和 `jsx`；未知类型使用通用解析器。

### 步骤 3：分析流程和关键节点

识别入口点、分支点、循环点、汇聚点、API 调用点、状态变更点和模块边界，并生成流程类型和 ASCII 流程图。

```python
def analyze_flow_logic(structure, dependencies):
    entry_points = identify_entry_points(dependencies)
    critical_nodes = identify_critical_nodes(dependencies)
    flow_type = classify_flow_type(structure, entry_points)
    flow_diagram = generate_flow_diagram(
        entry_points=entry_points,
        critical_nodes=critical_nodes,
        dependencies=dependencies
    )
    return {
        "entry_points": entry_points,
        "critical_nodes": critical_nodes,
        "flow_type": flow_type,
        "flow_diagram": flow_diagram
    }
```

重要变量包括：

- Vue 的 `ref`、`reactive` 和 `computed`
- React 的 `useState`、`useRef` 和相关 Hook 状态
- TypeScript 的 `interface`、`type` 和 `enum`
- 配置常量、API 端点、请求方法和请求头

### 步骤 4：生成结构文档

将代码概览、结构、依赖、流程、关键节点、变量和子元素分析合并为 Markdown 文档。文档中的结论必须来自本次扫描或可信共享上下文，并标记无法确认的内容。

### 步骤 5：输出和校验

输出路径为：

```text
join(dirname(target_path), "{basename(target_path)}.md")
```

若目标文件已存在，必须先询问用户选择：

- 覆盖
- 合并
- 另存为新文件
- 取消

取消或写入失败时不得返回成功。写入后检查文件确实存在、内容非空且包含必要章节。

## 深度选项

| 深度 | 适用场景 | 子元素默认行为 |
| --- | --- | --- |
| `shallow` | 快速了解结构 | 仅列出引用 |
| `moderate` | 标准分析 | 发现引用后询问 |
| `deep` | 详细分析 | 发现引用后询问是否深度读取 |

## 完成标准与完成后校验

任务只有满足以下条件才可标记为 `passed`：

1. 目标范围和分析深度已记录。
2. 目标文件或目录已成功读取，或明确记录降级原因。
3. 文件结构、流程、关键节点、变量和依赖关系已完成分析。
4. 子元素引用的处理选择已记录；未读取的内容不得伪称已分析。
5. 输出 Markdown 已成功写入目标路径。
6. 输出文件存在、非空，且包含代码概览、文件结构、执行流程、关键节点和依赖关系等必要章节。
7. 所有未解析文件、未知类型、失败步骤和未确认结论已记录在 `issues` 中。

完成后必须检查：

- `output_path` 指向实际生成文件；
- 实际输出范围没有超出目标范围；
- 文档内容未使用虚构的文件、变量、依赖或流程；
- 覆盖、合并或另存行为与用户选择一致；
- 生成结果与 `analysis` 输出一致。

校验不完整时返回 `partial` 或 `failed`，不得仅凭文件写入成功判定分析完成。

## 错误处理

- 每个读取、解析或生成阶段最多重试 3 次。
- 单个文件解析失败时保留其他结果，并在 `issues` 中记录文件路径和原因。
- 目标路径无效或没有可分析文件时停止，不生成空文档。
- 依赖解析不完整时标记 `partial`，不得推断缺失依赖。
- 写入已有文件前必须获得用户选择，不自动覆盖。

## 与其他 Skill 的关系

| 关系 | Skill | 交互方式 |
| --- | --- | --- |
| 下游 | `doc-generator` | 将结构化分析结果传入文档生成流程 |
| 平行 | `bug-solver` | 提供代码结构和可疑位置分析结果 |
| 平行 | `code-optimizer` | 提供结构、依赖和关键路径分析结果 |

## 触发关键词

分析代码结构、代码结构分析、生成流程图、流程分析、提取依赖关系、依赖分析、关键节点识别、变量提取。

## 文件系统位置

- 主 Skill：`.claude/skills/code-structure-analyzer/SKILL.md`
- 使用说明：`.claude/skills/code-structure-analyzer/README.md`
- 共享上下文：`.claude/skills/tasks/current/task_skill.md`

## 版本

- 主 Skill 名称：`code-structure-analyzer`
- 状态：启用
- 当前版本：1.1
- 最后更新：2026-10-20
