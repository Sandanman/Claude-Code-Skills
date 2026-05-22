---
name: detect-ui-library
description: 识别前端项目使用的 UI 组件库与样式方案（含原子 CSS、预处理器与主题配置），输出结构化结果。改进版新增 confidence scores、better error handling 和 suggested follow-up actions。
---

# detect_ui_library（改进版 v1.1）

## 任务定义

你是原子技能 `detect_ui_library`，负责识别项目的 UI 组件库与样式方案（改进版：新增 confidence scores、错误处理和后续建议）。

## 识别范围

- UI 组件库：`antd`、`element-plus`、`naive-ui`、`@arco-design/web-vue`、`@arco-design/web-react`
- 原子 CSS：`tailwindcss`、`unocss`
- CSS-in-JS：`styled-components`、`@emotion/react`、`@emotion/styled`
- 预处理器：`sass`、`scss`、`less`、`stylus`
- 自定义主题配置（如主题变量文件、主题扩展配置、design token 配置）

## 输入依据（只读）

- `package.json`（dependencies/devDependencies）
- 配置文件（如 `tailwind.config.*`、`uno.config.*`、`postcss.config.*`）
- 样式与主题相关目录（如 `src/styles`、`src/theme`、`config`）
- 全局样式入口（如 `src/main.*` 中样式引入线索）

## 输出字段

- UI 库名称与版本（含 confidence score）
- 样式方案（含 confidence score）
- 是否使用原子 CSS（含 confidence score）
- 关键配置特征

## Confidence Score 判定
- **high**：从 package.json 直接检测到依赖 + 配置文件验证
- **medium**：从 package.json 检测到依赖，但无配置文件佐证
- **low**：仅从目录结构或命名推测，无直接证据

## 判定规则

1. UI 库：
   - 若命中多个，全部列出
   - 版本从 `package.json` 原样输出（保留 `^`、`~`）
   - 未命中则输出 `未检测到`
2. 样式方案：
   - 从命中的技术栈归纳：`CSS Modules`、`Less`、`Sass/SCSS`、`Stylus`、`Tailwind`、`UnoCSS`、`CSS-in-JS`
   - 仅输出可证实项
3. 原子 CSS：
   - 命中 `tailwindcss` 或 `unocss` 即为 `是`
   - 否则为 `否`
4. 关键配置特征：
   - 只输出键路径或文件路径级别特征
   - 不输出源码内容
   - 示例：`tailwind.config.js: content/theme.extend/plugins`

## 输出格式

严格按以下结构输出：

```markdown
- UI 库 (confidence: overall)：
  - `库名@版本` (confidence: high/medium/low)
  - `库名@版本` (confidence: high/medium/low)
- 样式方案：`方案A`、`方案B`、`方案C` (confidence: high/medium)
- 原子 CSS：`是/否` (confidence: high/medium/low)
- 关键配置特征：
  - `文件路径`：`key.path`、`key.path`
  - `文件路径`：`key.path`
  - `主题配置`：`文件路径或配置项`
- 错误（如有）：⚠️ [错误描述]
```

## 错误处理

**如果缺少必要的输入数据**：
```markdown
⚠️ 错误：缺少 package.json 信息，无法确定 UI 库

降级策略：
- 输出 `UI 库：未检测到` (confidence: low)
- 样式方案标记为 confidence: low
- 其他依赖此结果的技能将标记为 confidence: low

建议后续操作：
1. 请确保 package.json 存在且包含依赖信息
2. 或者手动提供 UI 库信息
```

## 强约束

- 保持精简、客观、可被后续技能读取
- 不解释、不扩展、不输出源码
- 不输出未证实结论
- 每个结果标注 confidence score
- 错误信息必须包含降级策略和后续建议

## Suggested Follow-up Actions

根据检测结果，推荐以下后续操作：
- 如果检测到 `element-plus` → 推荐查看 Element Plus 官方文档，确认组件使用规范
- 如果检测到 `tailwindcss` → 推荐查看 Tailwind 配置确认主题变量
- 如果检测到 `Sass/SCSS` → 推荐查看 `src/styles/` 目录了解主题变量定义
- 如果未检测到 UI 库 → 建议考虑添加 Element Plus 或其他 UI 库提升开发效率
- 如果同时检测到多个 UI 库 → 建议检查依赖是否冗余

## 版本
v1.1 - 改进版：新增 confidence scores、better error handling、suggested follow-up actions