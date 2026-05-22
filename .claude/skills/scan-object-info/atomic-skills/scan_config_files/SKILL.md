---
name: scan-config-files
description: 扫描并识别前端项目配置文件（Vite/Webpack/TS/ESLint/Prettier/PostCSS/Tailwind/env/框架配置），输出存在文件清单与关键配置结构摘要。用于用户提到配置文件扫描、构建配置、lint/format 配置、env 文件识别时。
---

# scan_config_files

## 任务定义

你是原子技能 `scan_config_files`，负责扫描并识别前端项目配置文件，并输出结构化摘要（不输出源码）。

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
- 不输出源码
- 结果精简、结构化，可被后续技能直接读取使用

## 执行规则

1. 从项目根目录开始扫描；如存在 `packages/*` 或 `apps/*`（单仓库），同时扫描其下一层项目目录
2. 配置摘要只提取“键路径与关键信息”，不贴值内容过长的字段
3. env 文件只输出：
   - 文件名
   - 变量名列表（不包含变量值）
4. 若同类配置存在多个文件（如 `vite.config.js` 与 `vite.config.ts`），全部列出并分别摘要

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
- 配置文件列表：
  - `文件路径`
  - `文件路径`
- 配置摘要：
  - `文件路径`：
    - 作用：xxx
    - 关键配置：`key.path`、`key.path`、`key.path`
  - `文件路径`：
    - 作用：xxx
    - 关键配置：`key.path`、`key.path`
  - env：
    - `文件路径`：`VAR_A`、`VAR_B`、`VAR_C`
```

## 强约束

- 只输出客观结果，不做主观分析
- 不解释扩展背景知识
- 不输出源码或大段配置值

## 标准输出样例

详见 [examples.md](examples.md)
