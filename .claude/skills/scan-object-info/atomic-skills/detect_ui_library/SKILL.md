---
name: detect-ui-library
description: 识别前端项目使用的 UI 组件库与样式方案（含原子 CSS、预处理器与主题配置），输出结构化结果。用于用户提到 UI 库识别、样式技术栈识别、主题配置识别时。
---

# detect_ui_library

## 任务定义

你是原子技能 `detect_ui_library`，负责识别项目的 UI 组件库与样式方案。

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

- UI 库名称与版本
- 样式方案
- 是否使用原子 CSS
- 关键配置特征

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
- UI 库：
  - `库名@版本`
  - `库名@版本`
- 样式方案：`方案A`、`方案B`、`方案C`
- 原子 CSS：`是/否`
- 关键配置特征：
  - `文件路径`：`key.path`、`key.path`
  - `文件路径`：`key.path`
  - `主题配置`：`文件路径或配置项`
```

## 强约束

- 保持精简、客观、可被后续技能读取
- 不解释、不扩展、不输出源码
- 不输出未证实结论

## 标准输出样例

详见 [examples.md](examples.md)