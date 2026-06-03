---
name: scan-config-context
description: 扫描项目配置文件与环境污染量配置，一次输出配置清单、环境变量和样式方案。τ=400，比分别调用scan-config-files+scan-env-variables节省40%。v1.2新增Skill Stacking上下文共享。
---

# scan_config_context（v1.2，K1合并技能）

## 任务定义

你是原子技能 `scan_config_context`（K1 Task Folding 合并版），一次性扫描两个维度：
- **配置文件**：构建工具、代码规范、框架配置
- **环境变量**：.env 文件、环境变量键名、前缀规范

**τ 值**：400（原2技能分开调用合计约700，节省43%）

## 合并来源

本技能由以下两个技能合并而来（K1 Task Folding）：
1. `scan_config_files`（τ=300 → 合并入）
2. `scan_env_variables`（τ=400 → 合并入）

## 输入依据

- 项目根目录配置文件（package.json 除外）
- `.env*` 文件（.env、.env.development、.env.production 等）
- 构建工具配置（vite.config.*、webpack.config.* 等）
- 代码规范配置（eslint.config.*、prettier.config.* 等）

## Co-Design 规则分配

| 检测维度 | 规则分配 | LLM分配 | 说明 |
|---------|---------|--------|------|
| 配置文件扫描 | 文件名正则匹配 | 配置项解读 | 规则处理已知配置 |
| 环境变量扫描 | 文件存在性检测 | 键名用途推断 | 规则保证完整性 |
| 样式方案 | 包名+后缀正则 | 上下文推断 | 规则为主 |

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

## Skill Stacking 上下文写入

检测完成后，将结果写入 task_skill.md 共享上下文：

```markdown
### 配置上下文（scan_config_context 输出）
- 配置文件：[文件名清单]
- 环境变量：[{键名, 用途, 敏感度}]
- 前缀规范：xxx_*
- 样式方案：xxx
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

## τ 节省说明

```
分开调用（K1前）：
scan_config_files τ=300 + scan_env_variables τ=400 = τ=700

合并调用（K1后）：
scan_config_context τ=400

τ 节省：300（节省率 43%）
原因：配置文件扫描与环境变量扫描共享文件遍历
```

## 版本

- v1.2 - K1 Task Folding 合并版：从 scan_config_files + scan_env_variables 合并而来
- 继承各来源技能的核心检测逻辑，统一输出格式