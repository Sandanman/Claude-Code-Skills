---
name: detect-router-solution
description: 识别前端项目的路由方案（vue-router、react-router-dom、Next.js 文件路由、Nuxt 文件路由等）及其版本、配置和路由文件位置。改进版新增 confidence scores、better error handling 和 suggested follow-up actions。
---

# detect_router_solution（改进版 v1.1）

## 任务定义

你是原子技能 `detect_router_solution`，负责识别项目的路由方案（改进版：新增 confidence scores、错误处理和后续建议）。

## 识别范围

- Vue 生态：
  - `vue-router`（Vue2/Vue3）
  - Nuxt 文件系统路由
- React 生态：
  - `react-router-dom`
  - Next.js 文件系统路由
  - `@tanstack/router`
- 其他：
  - Angular Router
  - SvelteKit 文件路由
  - 自定义路由实现

## 输入依据（只读）

- `package.json`（dependencies/devDependencies）
- 路由配置文件（如 `src/router/index.*`、`src/routes.*`）
- 基于文件系统路由的目录结构（如 `pages/`、`app/routes/`）
- 框架配置文件（如 `nuxt.config.*`、`next.config.*`）

## 判定规则

1. 路由方案识别：
   - 从 `dependencies` 或 `devDependencies` 中识别路由库
   - 若存在 `pages/` 目录且使用 Next/Nuxt，则为文件系统路由
   - 若未命中路由库但存在路由配置文件，记录为 `自定义路由`

2. 路由类型判定：
   - `配置式路由`：使用路由配置文件（如 vue-router、react-router-dom）
   - `文件系统路由`：基于文件路径自动生成（如 Next.js、Nuxt）
   - `混合路由`：同时存在两种方式

3. 路由文件位置：
   - 对于配置式路由，输出配置文件路径
   - 对于文件系统路由，输出路由目录路径

4. 关键配置特征：
   - 仅输出关键配置项的路径级别信息
   - 不输出源码内容

## 输出字段

- 路由方案名称与版本（含 confidence score）
- 路由类型：`配置式路由` / `文件系统路由` / `混合路由`（含 confidence score）
- 路由文件位置
- 关键配置特征

## Confidence Score 判定
- **high**：从 package.json 检测到路由库 + 存在对应的路由配置文件
- **medium**：从 package.json 检测到路由库，但无配置文件
- **low**：仅从目录结构推测，无 package.json 证据

## 输出格式

严格按以下结构输出：

```markdown
- 路由方案：`包名@版本` (confidence: high/medium/low)
- 路由类型：`配置式路由/文件系统路由/混合路由` (confidence: high/medium/low)
- 路由文件位置：
  - `文件路径` (confidence: high/medium/low)
  - `目录路径` (confidence: high/medium/low)
- 关键配置特征：
  - `文件路径`：`配置项路径` (confidence: high/medium/low)
- 错误（如有）：⚠️ [错误描述]
```

## 错误处理

**如果缺少必要的输入数据**：
```markdown
⚠️ 错误：缺少框架信息，无法确定路由方案

降级策略：
- 输出 `路由方案：未知` (confidence: low)
- 其他依赖此结果的技能将标记为 confidence: low

建议后续操作：
1. 请先执行 detect_framework 获取框架信息
2. 或者手动提供路由方案信息
```

## 强约束

- 保持精简、客观、可被后续技能读取
- 不解释、不扩展、不输出源码
- 不输出未证实结论
- 版本号从 package.json 原样输出（保留 `^`、`~`）
- 每个结果标注 confidence score
- 错误信息必须包含降级策略和后续建议

## 适用场景

- 需要了解项目的路由架构
- 需要添加新路由时确认路由方案
- 需要分析路由配置权限、懒加载等特性
- 迁移项目时需要了解路由实现方式

## 前置条件

- 项目必须包含路由功能
- 对于文件系统路由，需要识别框架类型（由 `detect_framework` 提供）

## Suggested Follow-up Actions

根据检测结果，推荐以下后续操作：
- 如果检测到 `vue-router` → 推荐查看 `src/router/` 目录了解路由配置
- 如果检测到 `react-router-dom` → 推荐查看路由配置文件了解路由划分
- 如果检测到 `文件系统路由` → 推荐查看 `pages/` 目录了解页面组织
- 如果检测到 `混合路由` → 建议统一路由方案
- 如果添加新路由 → 建议遵循现有路由配置文件格式

## 版本
v1.1 - 改进版：新增 confidence scores、better error handling、suggested follow-up actions