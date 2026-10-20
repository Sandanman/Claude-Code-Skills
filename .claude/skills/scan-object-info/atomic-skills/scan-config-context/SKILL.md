---
name: scan-config-context
---

## 任务定义

- **配置文件**：构建工具、代码规范、框架配置
- **环境变量**：.env 文件、环境变量键名、前缀规范

## 合并来源

## 输入依据

- 项目根目录配置文件（package.json 除外）
- `.env*` 文件（.env、.env.development、.env.production 等）
- 构建工具配置（vite.config.*、webpack.config.* 等）
- 代码规范配置（eslint.config.*、prettier.config.* 等）

## 配置文件扫描（规则路径）

### 构建工具判定

命中即停止：
- Vite：`vite.config.*` 或 `vitest.config.*` 存在
- Webpack：`webpack.config.*` 或 `webpack.*.config.*` 存在
- Rspack：`rspack.config.*` 存在
- Turbopack：`next.config.*` 且存在 `turbo.json`
- esbuild：`esbuild.config.*` 存在

### 代码规范判定

- ESLint：`.eslintrc*`、`eslint.config.*`、`eslint.config.js` 存在
- Prettier：`.prettierrc*`、`prettier.config.*` 存在
- Stylelint：`.stylelintrc*`、`stylelint.config.*` 存在

### 框架配置判定

- Next：`next.config.*` 存在
- Nuxt：`nuxt.config.*` 存在
- Vue：`vite.config.*` 或 `vue.config.*` 存在

## 环境变量扫描

### 扫描范围

扫描以下环境文件（存在即报告）：
- `.env`（基础配置）
- `.env.local`（本地覆盖）
- `.env.development`（开发环境）
- `.env.test`（测试环境）
- `.env.production`（生产环境）
- `.env.development.local`
- `.env.production.local`

### 前缀规范判定

- `VITE_*` → Vite 项目
- `NEXT_PUBLIC_*` → Next.js
- `REACT_APP_*` → CRA/React
- `APP_*` → 通用

### 敏感变量检测

检测以下敏感键名（标记为⚠️）：
- `API_KEY`、`SECRET`、`TOKEN`、`PASSWORD`、`PRIVATE_KEY`
- `AWS_SECRET`、`DATABASE_URL`（生产环境）
- `STRIPE_SECRET`、`STRIPE_KEY`

## 样式方案检测

见 detect_tech_stack 中的样式方案检测规则，本技能仅补充配置层面的证据。

## 输出格式

```markdown
- 配置文件清单：
  - `[文件名]`：`用途描述`
    - 关键配置项：`...`
- 环境变量清单：
  - `[键名]`：`用途描述`（环境：xxx）
  - ⚠️ `[敏感键名]`：`检测到敏感变量，建议检查是否泄露`
- 前缀规范：`xxx_*`
- 样式方案：`SCSS/Less/Tailwind/原子CSS/CSS Modules` (confidence: high/medium/low)
  - 关键配置文件：`src/styles/variables.scss` 等
```

## 错误处理

```markdown
⚠️ 错误：未找到任何配置文件

降级策略：
- 输出 `配置文件清单：未检测到配置文件` (confidence: low)
- 环境变量部分输出 `无环境变量配置`

建议后续操作：
1. 确认项目是否包含配置文件
```

## 版本

- 继承各来源技能的核心检测逻辑，统一输出格式
