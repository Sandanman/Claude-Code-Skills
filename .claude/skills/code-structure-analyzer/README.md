# Code Structure Analyzer 使用说明

## 功能

`code-structure-analyzer` 读取指定页面、业务模块或流程的代码，分析结构、流程、关键节点、变量和依赖关系，并生成结构化 Markdown 文档。

## 使用方式

```text
/code-structure-analyzer <目标路径> [--depth <shallow|moderate|deep>]
```

示例：

```text
/code-structure-analyzer src/views/UserList.vue
/code-structure-analyzer src/store/modules/auth --depth moderate
/code-structure-analyzer src/api/auth.ts --depth deep
```

## 输入

- `target_path`：必填，待分析的文件或目录。
- `--depth`：可选，`shallow`、`moderate` 或 `deep`，默认 `moderate`。
- `include_patterns`：可选，指定包含的文件模式。
- `exclude_patterns`：可选，指定排除的文件模式。

## 分析内容

- 代码概览：文件数量、代码行数和技术栈
- 文件结构树
- 执行流程和 ASCII 流程图
- 入口、分支、循环、汇聚、API 和状态节点
- 状态变量、类型、常量和 API 相关变量
- 模块、NPM、API 端点和环境变量依赖
- 模块边界
- 本地子元素引用及按用户选择生成的摘要

## 深度选项

| 深度 | 适用场景 | 子元素处理 |
| --- | --- | --- |
| `shallow` | 快速了解结构 | 仅列出引用 |
| `moderate` | 标准分析，默认 | 发现引用后询问 |
| `deep` | 详细分析 | 询问后读取更深层逻辑 |

## 输出

默认在目标路径所在目录生成：

```text
{分析对象名称}.md
```

生成前如果目标文件已经存在，必须询问覆盖、合并、另存或取消。生成后校验文件存在、内容非空、必要章节完整，并返回 `passed`、`partial` 或 `failed` 状态。

## 错误处理

- 目标路径不存在或没有可分析文件时停止，不生成空文档。
- 单个文件解析失败时保留其他结果，并记录文件路径和原因。
- 未解析的依赖或未知文件类型标记为未确认，不使用猜测补全。
- 写入失败或用户取消覆盖时不得返回成功。

## 文件结构

```text
code-structure-analyzer/
├── SKILL.md
└── README.md
```

## 相关 Skill

- `doc-generator`：接收结构化分析结果并生成其他文档。
- `bug-solver`：使用结构分析结果定位可疑代码。
- `code-optimizer`：使用结构、依赖和关键路径分析结果制定优化方案。

## 版本

- 主 Skill：`code-structure-analyzer`
- 当前版本：1.1
- 状态：启用
- 最后更新：2026-10-20
