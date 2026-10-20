---
name: api-doc-extraction
description: 从已确认范围中提取可静态识别的 API 定义；当用户要求 API 文档、OpenAPI 或接口清单时触发。
---

# API Doc Extraction

## 职责

从服务端路由、OpenAPI/GraphQL 契约或客户端请求封装中提取可静态确认的接口信息。`vue-router` 和 `react-router` 仅表示页面路由，不作为服务端 API 框架；动态注册、运行时拼接和缺少类型的信息必须标记为未确认。

## 输入

- `source_paths`：源码、契约或 API 层路径。
- `api_source`：`server_route`、`openapi`、`graphql`、`client_request` 或用户指定来源。
- `output_format`：`markdown`、`openapi_json`、`openapi_yaml` 或 `postman`，必须是项目支持的格式。
- `api_scope`：全部或指定模块。
- `write_files`：是否写入；写入前确认输出路径和覆盖策略。

## 输出

- 结构化端点清单：method、path、参数、请求体、响应、认证线索和证据路径。
- Markdown 默认写入 `docs/api.md`；OpenAPI 默认写入 `docs/openapi.json` 或用户指定路径。
- 无法静态确认项、动态路由和缺失类型清单。

## 执行逻辑

1. 检查输入范围和来源类型。
2. 扫描路由、契约或请求封装，识别 method 和 path。
3. 提取参数、请求体、响应类型、错误码和认证线索，并保留证据路径。
4. 对动态或不完整信息标记 `confidence: low`，不补造业务字段。
5. 按选定格式生成预览；写入前检查现有文件。
6. 对 OpenAPI 输出执行可用的 schema 解析或校验；工具缺失时记录原因。

## 完成标准

1. 所选范围内的可静态识别端点均有条目，未将“未发现”表述为“没有”。
2. 每个条目包含已确认的 method、path 和可获取的参数/响应信息。
3. 输出格式与用户选择一致，且文件存在、非空、路径可追溯。
4. 动态路由、缺失类型和工具限制已列入未覆盖项。

## 完成后校验

- 重新读取输出并检查 Markdown 或 JSON/YAML 结构。
- OpenAPI 输出可解析时检查版本、paths 和方法结构。
- 检查证据路径、置信度、输出路径和覆盖策略一致。
- 核心输入不可读或输出失败返回 `failed`；存在未确认项返回 `partial`。

## 状态

返回 `passed`、`partial`、`failed` 或 `cancelled`。最多重试 3 次；不得通过扩大扫描范围或猜测类型掩盖失败。
