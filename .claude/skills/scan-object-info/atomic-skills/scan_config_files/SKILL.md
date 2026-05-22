---
name: scan-config-files
description: 扫描并识别前端项目配置文件（Vite/Webpack/TS/ESLint/Prettier/PostCSS/Tailwind/env/框架配置），输出存在文件清单与关键配置结构摘要。改进版新增 confidence scores、better error handling 和 suggested follow-up actions。
---

# scan_config_files（改进版 v1.1）

## 任务定义

你是原子技能 `scan_config_files`，负责扫描并识别前端项目配置文件，并输出结构化摘要（不输出源码）（改进版：新增 confidence scores、错误处理和后续建议）。

## 扫描范围

- Vite：`vite.config.js`、`vite.config.ts`
- Webpack：`webpack.config.js`
- TS/JS 配置：`tsconfig.json`、`jsconfig.json`
- ESLint/Prettier：
  - `.eslintrc.cjs`、`.eslintrc.js`、`.eslintrc.json`
  - `eslint.config.js`、`eslint.config.ts`
  - `.prettierrc`、`.prettierrc.json`、`.prettierrc.js`
- PostCSS/Tailwind：`postcss.config.js`、`tailwind.config.js`、`tailwind.config.cjs`
- env 文件：
  - `.env`、`.env.local`
  - `.env.development`、`.env.development.local`
  - `.env.production`、`.env.production.local`
  - `.env.test`、`.env.test.local`
- 框架配置：
  - Next：`next.config.js`、`next.config.mjs`
  - Nuxt：`nuxt.config.ts`、`nuxt.config.js`
  - 其他：`svelte.config.*`、`astro.config.*`（如存在也列出）

## 输出要求

- 列出存在的配置文件（不存在的不输出）
- 简要说明每个文件作用与关键配置（只输出结构信息）
- **不输出源码**
- **结果精简、结构化，可被后续技能直接读取使用**
- **每个配置文件标注 confidence score**

## 执行规则

1. 从项目根目录开始扫描；如存在 `packages/*` 或 `apps/*`（单仓库），同时扫描其下一层项目目录
2. 配置摘要只提取"键路径与关键信息"，不贴值内容过长的字段
3. env 文件只输出：
   - 文件名
   - 变量名列表（不包含变量值）
4. 若同类配置存在多个文件（如 `vite.config.js` 与 `vite.config.ts`），全部列出并分别摘要
5. **Confidence Score 判定**：
   - high：文件存在且配置完整
   - medium：文件存在但配置不完整
   - low：文件仅通过文件名推测存在，未实际读取

## 摘要字段建议（按文件类型）

- Vite：`plugins`、`resolve.alias`、`server`、`build`、`base`、`define`、`css.preprocessorOptions`
- Webpack：`mode`、`entry`、`output`、`resolve.alias`、`module.rules`、`plugins`、`devServer`
- tsconfig/jsconfig：`compilerOptions`（如 `target/module/baseUrl/paths/types`）、`include`、`exclude`
- ESLint：`extends`、`plugins`、`rules`、`parser`、`parserOptions`、`overrides`
- Prettier：`semi`、`singleQuote`、`printWidth`、`tabWidth`、`trailingComma`
- PostCSS：`plugins`（插件名列表）
- Tailwind：`content`（扫描路径列表）、`theme.extend`（键名列表）、`plugins`（插件名列表）
- Next/Nuxt：只提取配置对象顶层关键键名（如 `modules/runtimeConfig/ssr/nitro` 等）

## 输出格式

严格按以下结构输出：

```markdown
- 配置文件列表（总数：x）：(confidence: overall)
  - `文件路径` (confidence: high/medium/low)
  - `文件路径` (confidence: high/medium/low)
- 配置摘要：
  - `文件路径` (confidence: high/medium/low)：
    - 作用：xxx
    - 关键配置：`key.path`、`key.path`、`key.path`
  - `文件路径` (confidence: high/medium/low)：
    - 作用：xxx
    - 关键配置：`key.path`、`key.path`
  - env (confidence: medium)：
    - `文件路径`：`VAR_A`、`VAR_B`、`VAR_C`
- 错误（如有）：⚠️ [错误描述]
```

## 错误处理

**如果配置文件扫描失败**：
```markdown
⚠️ 错误：无法扫描配置文件目录

降级策略：
- 继续扫描，其他技能可使用 package.json 中的信息
- 检测到的配置文件将标记为 confidence: low

建议后续操作：
1. 请确保项目目录存在且包含配置文件
2. 如果需要完整配置分析，请在项目根目录执行
```

## 强约束

- 只输出客观结果，不做主观分析
- 不解释扩展背景知识
- 不输出源码或大段配置值
- 每个配置文件标注 confidence score
- 错误信息必须包含降级策略和后续建议

## Suggested Follow-up Actions

根据检测结果，推荐以下后续操作：
- 如果检测到 `tsconfig.json` → 推荐使用 `detect_framework` 分析 TypeScript 配置
- 如果检测到 `.prettierrc` → 推荐使用 `code-style-generator` 生成代码规范
- 如果检测到 `.eslintrc` → 推荐执行 ESLint 检查
- 如果检测到 `tailwind.config.js` → 推荐使用 `detect_ui_library` 分析样式方案
- 如果未检测到任何配置文件 → 建议添加 `.editorconfig` 和 `.prettierrc` 规范化代码风格

## 版本
v1.1 - 改进版：新增 confidence scores、better error handling、suggested follow-up actions