---
name: doc-format-conversion
description: 文档格式转换（Markdown/HTML/PDF），在需要转换文档格式时触发
---

# Doc Format Conversion

## 概述

Doc Format Conversion 负责将文档在多种格式之间转换，支持 Markdown 到 HTML、Markdown 到 PDF、HTML 到 Markdown、JSON Schema 到 Markdown API 文档等转换。内置代码高亮、表格渲染、图表渲染支持，确保转换后的文档视觉效果良好。

## 核心能力

- **Markdown → HTML**: 将 Markdown 转换为 HTML，支持自定义样式主题
- **Markdown → PDF**: 将 Markdown 转换为 PDF（通过 HTML 中转或 Pandoc）
- **HTML → Markdown**: 将 HTML 转换回 Markdown（保留结构）
- **OpenAPI → Markdown**: 将 OpenAPI JSON/YAML 转换为可读 Markdown API 文档
- **JSON → Markdown**: 将 JSON 数据结构转换为 Markdown 表格
- **多文档合并**: 将多个 Markdown 文件合并为一个文档
- **目录生成**: 自动生成文档目录（Table of Contents）

## 输入

- **SourceDoc**: 源文档路径或内容
- **SourceFormat**: 源文档格式（markdown/html/json/openapi）
- **TargetFormat**: 目标格式（markdown/html/pdf）
- **ConversionConfig**: 转换配置（主题、是否包含目录、代码高亮配置）
- **OutputPath**: 输出文件路径

## 输出

- **ConvertedContent**: 转换后的文档内容
- **ConversionMetadata**: 转换元数据（标题、字数、图表数量等）
- **OutputFile**: 输出文件路径（如写入到文件）

**输出示例格式**:
```json
{
  "conversionTime": "2026-05-21T10:00:00Z",
  "source": "docs/api.md",
  "sourceFormat": "markdown",
  "target": "docs/api.html",
  "targetFormat": "html",
  "metadata": {
    "title": "API Documentation",
    "wordCount": 2500,
    "headingCount": 45,
    "codeBlockCount": 12,
    "tableCount": 8
  },
  "stylesApplied": "github-light",
  "tocGenerated": true
}
```

## 执行逻辑

1. **格式检测**: 自动检测源文档格式（可通过 SourceFormat 参数覆盖）
2. **内容解析**: 解析源文档，提取标题、段落、代码块、表格
3. **转换处理**: 按源格式和目标格式选择对应的转换器
4. **样式应用**: 应用 HTML 样式主题（GitHub Light/Dark、自定义 CSS）
5. **目录生成**: 如果启用 TOC，提取标题生成目录
6. **代码高亮**: 对代码块应用语法高亮（highlight.js 或 Prism.js）
7. **输出写入**: 将转换结果写入目标文件

## 依赖关系

- 依赖: api-doc-extraction 或 component-doc-generation
- 被依赖: 无

## 完成标准

1. Markdown → HTML 转换保持原有结构和格式
2. 代码块正确应用语法高亮
3. 表格转换正确（支持合并单元格）
4. 图片路径正确处理（相对路径/绝对路径）
5. 生成 `docs/` 目录下的输出文件
6. 转换后文档无乱码、无格式丢失