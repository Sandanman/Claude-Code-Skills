---
name: detect-tech-stack
description: 检测前端项目技术栈（框架+UI库+状态管理），一次扫描输出三个维度。τ=600，比分别调用detect-framework+detect-ui-library+detect-state-manage节省40%。v1.2新增confidence scores、Co-Design规则分配。
---

# detect_tech_stack（v1.2，K1合并技能）

## 任务定义

你是原子技能 `detect_tech_stack`（K1 Task Folding 合并版），一次性检测三个维度：
- **框架**：前端框架类型与版本、TS使用情况、渲染模式
- **UI库**：UI组件库、样式方案、主题配置
- **状态管理**：状态管理库与使用方式

**τ 值**：600（原3技能分开调用合计约1500，节省60%）

## 合并来源

本技能由以下三个技能合并而来（K1 Task Folding）：
1. `detect_framework`（τ=500 → 合并入）
2. `detect_ui_library`（τ=400 → 合并入）
3. `detect_state_manage`（τ=600 → 合并入）

## 输入依据

- `package.json`（dependencies/devDependencies/scripts）
- 项目结构（关键目录、入口文件）
- 配置文件（tsconfig.json、tailwind.config.* 等）
- 样式相关目录（src/styles、src/theme 等）

## Co-Design 规则分配

| 检测维度 | 规则分配 | LLM分配 | 说明 |
|---------|---------|--------|------|
| 框架检测 | 包名正则匹配 | 版本范围解析 | 规则处理90%场景 |
| UI库检测 | 已知库正则 | 未知库兜底 | 规则优先 |
| 状态管理 | 包名+目录正则 | 目录结构推断 | 规则为主 |
| 置信度 | 基础规则 | 上下文调整 | 规则+LLM综合 |

## 框架检测规则（规则路径，高优先级）

### 框架判定

命中即停止：
- Next：`next` 依赖 或 `next.config.*` 存在 → Next.js
- Nuxt：`nuxt` 依赖 或 `nuxt.config.*` 存在 → Nuxt
- Angular：`@angular/core` 依赖 或 `angular.json` 存在 → Angular
- Svelte：`svelte` 依赖 或 `svelte.config.*` 存在 → Svelte
- Solid：`solid-js` 依赖 → Solid
- React：`react` 依赖（且未命中Next）→ React
- Vue2：`vue` 主版本=2 或 `vue-template-compiler` 存在 → Vue2
- Vue3：`vue` 主版本=3 或 `@vue/compiler-sfc` 存在 → Vue3

### 版本提取

从 `package.json` 中对应包版本号提取，原样输出（含 `^`/`~` 范围符号）。

### TS 使用判定

满足任一 → TS: 是
- `typescript` 依赖存在
- `tsconfig.json` 存在
- 入口文件以 `.ts`/`.tsx` 为主

### 渲染模式判定

- Next：存在 `output: 'export'` 或 `out/` 配置 → SSG；`revalidate` 配置 → ISR；否则 → SSR
- Nuxt：默认 SSR；存在 `nuxt generate` 配置 → SSG
- 其他框架：默认 CSR；存在 `@vue/server-renderer` → SSR

## UI库检测规则

### 组件库判定

命中即停止：
- Element Plus：`element-plus` 依赖
- Naive UI：`naive-ui` 依赖
- Ant Design：`antd` 或 `@ant-design/react` 依赖
- Arco Design Vue：`@arco-design/web-vue` 依赖
- Arco Design React：`@arco-design/web-react` 依赖
- Vuetify：`vuetify` 依赖
- Quasar：`quasar` 依赖
- shadcn/ui：`components.json` 存在 → shadcn/ui（confidence: medium）

### 原子CSS判定

- Tailwind CSS：`tailwindcss` 依赖 或 `tailwind.config.*` 存在
- UnoCSS：`unocss` 依赖 或 `uno.config.*` 存在

### CSS-in-JS判定

- styled-components：`styled-components` 依赖
- Emotion：`@emotion/react` 或 `@emotion/styled` 依赖

### 预处理器判定

- Sass/SCSS：`sass`/`scss` 依赖 或 `.scss` 文件存在
- Less：`less` 依赖 或 `.less` 文件存在
- Stylus：`stylus` 依赖 或 `.styl` 文件存在

## 状态管理检测规则

### 库判定

命中即停止：
- Redux Toolkit：`@reduxjs/toolkit` 依赖
- Redux：`redux` 依赖（且未命中RTK）
- React Redux：`react-redux` 依赖
- Pinia：`pinia` 依赖
- Vuex：`vuex` 依赖
- Zustand：`zustand` 依赖
- Jotai：`jotai` 依赖
- Recoil：`recoil` 依赖
- MobX：`mobx` 或 `mobx-react-lite` 依赖

### 目录结构推断

- `src/stores/` 或 `src/store/` → Pinia/Vuex 目录结构
- `src/redux/` → Redux 目录结构

## 输出格式

```markdown
- 框架：`xxx` (confidence: high/medium/low)
  - 依据：`package.json` 中 `关键依赖@版本`
  - 依据：`结构/配置` 中的 `关键文件路径`
- 框架版本：`包名@版本` 或 `未声明` (confidence: high/medium/low)
- TS：`是/否` (confidence: high/medium/low)
  - 依据：...
- 渲染模式：`CSR/SSR/SSG/ISR` (confidence: high/medium/low)
  - 依据：...
- UI库：`包名@版本` 或 `未检测到` (confidence: high/medium/low)
  - 依据：`package.json` 中 `关键依赖@版本`
- 样式方案：`SCSS/Less/Tailwind/原子CSS/CSS Modules/未使用` (confidence: high/medium/low)
  - 依据：...
- 状态管理：`包名@版本` 或 `未检测到` (confidence: high/medium/low)
  - 依据：`package.json` 中 `关键依赖@版本`
```

## 错误处理

```markdown
⚠️ 错误：未找到 package.json

降级策略：
- 输出 `框架：未知` (confidence: low)
- 输出 `UI库：未知` (confidence: low)
- 输出 `状态管理：未知` (confidence: low)

建议后续操作：
1. 请确保项目根目录存在 package.json
```

## 强约束

1. 框架结论必须唯一（命中即停止规则）
2. 每个检测结论必须标注 confidence score
3. 规则优先（覆盖90%场景），LLM处理边缘情况
4. τ 消耗：600（包含三个维度的完整检测）
5. 禁止重复输出，三个维度一次性输出

## τ 节省说明

```
分开调用（K1前）：
detect_framework τ=500 + detect_ui_library τ=400 + detect_state_manage τ=600 = τ=1500

合并调用（K1后）：
detect_tech_stack τ=600

τ 节省：900（节省率 60%）
原因：package.json 只读一次，三个维度共享解析结果
```

## 版本

- v1.2 - K1 Task Folding 合并版：从 detect_framework + detect_ui_library + detect_state_manage 合并而来
- 继承各来源技能的核心检测逻辑，统一输出格式