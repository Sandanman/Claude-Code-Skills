---
name: detect-framework
description: 基于 package.json 与项目结构识别前端框架与版本，并判断是否使用 TS 与渲染模式（CSR/SSR/SSG/ISR）。用于用户提到框架识别、技术栈判断、SSR/SSG 判定、TS 使用情况时。
---

# detect_framework

## 任务定义

你是原子技能 `detect_framework`，用于识别前端项目使用的框架与版本，并给出唯一结论。

## 输入依据（只读）

- `package.json`（dependencies/devDependencies/scripts）
- 项目结构与配置文件是否存在（如 `next.config.*`、`nuxt.config.*`、`vite.config.*`、`angular.json` 等）
- 入口文件后缀（`src/main.ts`/`src/main.js` 等）

## 需要输出

- 框架：React / Vue2 / Vue3 / Angular / Svelte / Solid / Next / Nuxt 等（唯一）
- 框架版本（从依赖版本号提取；无则 `未声明`）
- 是否使用 TS（是/否）
- 渲染模式：CSR / SSR / SSG / ISR（唯一）

## 判定规则（从上到下命中即停止）

### 1) 框架判定

- Next：存在依赖 `next` 或配置 `next.config.*`
- Nuxt：存在依赖 `nuxt` 或配置 `nuxt.config.*`
- Angular：存在依赖 `@angular/core` 或根目录存在 `angular.json`
- Svelte：存在依赖 `svelte` 或 `svelte.config.*`
- Solid：存在依赖 `solid-js`
- React：存在依赖 `react`（且未命中 Next）
- Vue2：存在依赖 `vue` 且版本主号为 2（或存在依赖 `vue-template-compiler`）
- Vue3：存在依赖 `vue` 且版本主号为 3（或存在依赖 `@vue/compiler-sfc`）
- 若多项同时出现：按以上优先级取第一个命中项，确保结论唯一

### 2) 框架版本

- 从对应框架包的版本号提取（如 `vue`、`react`、`next`、`nuxt`、`@angular/core`、`svelte`、`solid-js`）
- 若仅出现范围符号（如 `^` `~`）不做展开，原样输出（例：`vue@^3.5.0`）

### 3) 是否使用 TS

满足任一条件即为 `是`：

- 存在 `typescript` 依赖
- 存在 `tsconfig.json`
- 入口文件或路由/状态/核心入口以 `.ts`/`.tsx` 为主（如 `src/main.ts`、`src/main.tsx`）

否则为 `否`

### 4) 渲染模式判定

- Next：
  - 若存在 `next export`、或配置/目录结构指向静态导出（如 `out/` 产物配置）-> `SSG`
  - 若出现 `revalidate`/ISR 相关配置线索（仅基于存在性判断）-> `ISR`
  - 否则默认 `SSR`
- Nuxt：默认 `SSR`；若存在静态站点线索（如 `nuxt generate`/静态预渲染配置）-> `SSG`
- 其他框架（React/Vue/Angular/Svelte/Solid）：
  - 默认 `CSR`
  - 若存在明确 SSR 框架/适配器依赖线索（如 `@vue/server-renderer`、`react-dom/server` 仅做存在性判断）-> `SSR`

## 输出格式

严格按以下结构输出（只输出结果，不加解释）：

```markdown
- 框架：`xxx`
- 版本：`包名@版本` 或 `未声明`
- TS：`是/否`
- 渲染模式：`CSR/SSR/SSG/ISR`
- 依据：
  - `package.json`：`关键依赖@版本`
  - `结构/配置`：`关键文件路径`（如存在）
```

## 强约束

- 结论必须唯一、明确
- 只输出框架名称、版本、关键特征（TS、渲染模式、依据）
- 不解释、不闲聊、不扩展
- 不输出源码

## 标准输出样例

详见 [examples.md](examples.md)
