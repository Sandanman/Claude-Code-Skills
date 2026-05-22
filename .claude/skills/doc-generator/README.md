# Doc Generator

## 概述

Doc Generator 是前端项目的自动化文档生成技能，自动从代码中提取 API 定义、生成组件文档、创建变更日志，支持多种输出格式。

## 核心能力

- **API 文档提取**: 从路由文件、API 层代码中提取接口定义
- **组件文档生成**: 自动生成 Vue/React 组件的 props、events、slots、示例
- **变更日志生成**: 从 git commit 和 PR 中自动生成规范化的 CHANGELOG
- **格式转换**: 支持 Markdown/HTML/PDF/JSON 多种格式输出
- **注释补充**: 自动识别并补充缺失的 JSDoc/TSDoc 注释

## 适用场景

- 项目初始化时生成完整的 README 和 API 文档
- 新增组件后更新组件文档
- 发布新版本时生成 CHANGELOG
- 将 Markdown 文档转换为 HTML/PDF 格式

## 原子技能列表

| 原子技能 | 职责 |
|---------|------|
| api-doc-extraction | 从代码中提取 API 定义（endpoint、参数、返回值） |
| component-doc-generation | 生成组件文档（props、events、slots、usage） |
| changelog-generation | 生成变更日志（基于git commit和PR） |
| doc-format-conversion | 文档格式转换（Markdown/HTML/PDF） |

## 执行流程图

```
api-doc-extraction ─┐
                    │
component-doc-generation ─┤
                    ├──→ doc-format-conversion
changelog-generation ──────┘
```

## 输出产物

- `README.md` - 项目主文档
- `API.md` - API 文档
- `docs/components/` - 组件文档目录
- `CHANGELOG.md` - 变更日志
- `docs/api.html` - 交互式 API 文档（可选）

## 快速开始

```bash
# 通过 orchestrator 触发
# 用户: "生成这个项目的 README 和 API 文档"
# 用户: "为所有组件生成文档"
# 用户: "生成 CHANGELOG"
```