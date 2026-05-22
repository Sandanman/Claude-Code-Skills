---
name: doc-generator
description: 自动生成代码文档，包括API文档、README、组件文档、变更日志等，支持多种格式（Markdown、API文档、TypeDoc、JSDoc）
---

# Doc Generator

## 概述

Doc Generator 是前端项目的自动化文档生成技能，通过4个原子技能协同工作，从 API 文档提取、组件文档生成、变更日志生成到文档格式转换，完整覆盖项目文档生成需求。支持 TypeDoc、JSDoc、VuePress 文档等多种格式，可生成 README、API 文档、组件文档、CHANGELOG 等多种文档类型。

## 核心能力

- 从代码中提取 API 定义（endpoints、parameters、return types）
- 生成 Vue/React 组件文档（props、events、slots、usage examples）
- 从 git commits 和 PRs 生成变更日志
- 支持文档格式转换（Markdown/HTML/PDF/JSON）
- 自动识别并补充缺失的 JSDoc/TSDoc 注释
- 生成交互式 API 文档（支持 Swagger/OpenAPI 格式）

## 执行流程

1. **api-doc-extraction** - 从代码中提取API定义（endpoint、参数、返回值）
2. **component-doc-generation** - 生成组件文档（props、events、slots、usage）
3. **changelog-generation** - 生成变更日志（基于git commit和PR）
4. **doc-format-conversion** - 文档格式转换（Markdown/HTML/PDF）

## 原子skill依赖关系

- **api-doc-extraction**: 无依赖
- **component-doc-generation**: 无依赖
- **changelog-generation**: 无依赖
- **doc-format-conversion**: 依赖 api-doc-extraction 或 component-doc-generation

## 主skill完成标准

1. 成功扫描所有 API 路由/接口，提取完整的 endpoint 定义
2. 生成所有组件的文档（包含 props、events、slots、示例代码）
3. 生成符合 Keep a Changelog 规范的变更日志
4. 文档格式正确（Markdown 语法无误、示例代码可运行）
5. 文档内容准确（参数类型、返回值格式正确）
6. 生成文档保存到正确的位置（README.md、docs/ 目录等）

## 重试规则

- 每个原子skill失败后可重试 **3次**
- changelog-generation 在非 Git 仓库中执行时生成示例文档
- doc-format-conversion 失败时回退到 Markdown 格式输出

## 触发关键词

- 生成文档
- API文档
- README
- 组件文档
- 变更日志
- 文档更新
- 生成注释
- TSDoc
- JSDoc
- 生成CHANGELOG

## 注意事项

- Git 仓库中才执行 changelog-generation，非 Git 仓库生成模板
- PDF 转换需要 pandoc 或类似工具，未安装时输出 HTML 格式
- 敏感信息（如真实 API Key）不出现在生成的文档中
- 文档覆盖范围由扫描范围决定，扫描范围需明确指定

## 文件系统位置

- 主skill路径: ./.claude/skills/doc-generator/SKILL.md
- 原子skill路径: ./.claude/skills/doc-generator/atomic-skills/下各子目录