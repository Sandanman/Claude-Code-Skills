---
name: component-doc-generation
description: 为已确认路径中的 Vue 或 React 组件生成文档；当用户要求组件文档、Props、事件、插槽或使用示例时触发。
---

# Component Doc Generation

## 职责

解析指定范围内可静态分析的 Vue 或 React 组件，生成属性、事件、插槽/children、暴露方法和使用示例。支持范围和格式必须以输入确认，不对未支持的语法或运行时行为作确定性判断。

## 输入

- `component_paths`：组件文件或目录。
- `framework`：`vue`、`react` 或 `auto`；自动检测失败时暂停确认。
- `doc_format`：`markdown`、`vuepress` 或 `storybook`，仅在项目配置支持时生成。
- `include_examples`：是否生成示例。
- `exclude_patterns`：排除测试、构建产物或第三方目录。
- `output_path`：默认 `docs/components/`；写入前确认覆盖策略。

## 输出

- 每个组件一份文档，包含已确认的 description、props、events、slots/children、exposed API 和示例。
- `docs/components/README.md` 组件索引，链接到实际生成文件。
- 未能解析的语法、动态类型和缺失说明清单。

## 支持边界

- Vue：优先解析 `script setup`、`defineProps`、`defineEmits`、`slot` 和 `defineExpose`。
- React：解析函数组件、TypeScript props、事件 props、children、`forwardRef` 和 `useImperativeHandle`。
- class component、运行时注册和复杂类型只在证据充分时输出，其他情况标记低置信度。

## 执行逻辑

1. 校验路径、框架和输出格式。
2. 扫描组件文件并排除指定目录。
3. 提取组件接口和源码中的说明，保留文件证据。
4. 按配置生成示例，不为未知 props 或事件虚构行为。
5. 生成文档和索引预览，检查已有文件后写入。

## 完成标准

1. 指定范围内可读取的组件均有文档或明确记录跳过原因。
2. 已识别字段的类型、必需性、默认值和来源可追溯。
3. 索引链接指向实际文件；示例与检测到的 API 一致。
4. 输出目录非空，文档格式可读取。

## 完成后校验

重新读取文档和索引，检查链接、代码围栏、字段来源和输出路径。存在无法解析组件或工具限制时返回 `partial`；写入或核心解析失败返回 `failed`。
