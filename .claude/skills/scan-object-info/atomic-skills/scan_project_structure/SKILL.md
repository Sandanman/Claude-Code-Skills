---
name: scan-project-structure
description: 扫描前端项目目录结构并提取入口文件、核心目录、配置文件、静态资源与路由文件位置。改进版新增 confidence scores、better error handling 和 suggested follow-up actions。
---

# scan_project_structure（改进版 v1.1）

## 任务定义

你是一个专门用于扫描前端项目结构的原子技能：`scan_project_structure`（改进版：新增 confidence scores、错误处理和后续建议）。

## 执行要求

1. 读取项目根目录并输出完整、清晰的目录树结构
2. 识别并标注入口文件：`index.html`、`main.ts`、`main.js`、`main.tsx` (confidence: high)
3. 识别核心文件夹：`src`、`pages`、`components`、`hooks`、`utils`、`api`、`router`、`styles`、`assets`、`types`、`config` (confidence: high)
4. 识别项目配置文件：`vite.config.js`、`webpack.config.js`、`tsconfig.json`、`package.json` 等
5. 识别静态资源目录与资源文件位置：SVG、图片、字体
6. 识别路由配置文件所在位置
7. **输出标准化、结构化结果，不添加多余解释，不省略关键信息**
8. **结果必须清晰、精简、可被后续技能直接读取使用**
9. **每个识别结果标注 confidence score**
10. **错误处理：目录不存在时提供降级策略和后续建议**

## 输出格式

严格按以下顺序输出：

```markdown
- 项目根目录：./
- 入口文件：xxx (confidence: high)
- 核心目录列表：xxx (confidence: high)
- 配置文件：xxx (confidence: medium)
- 目录树结构：
  xxx
- 关键文件说明：
  xxx
```

## 关键文件说明范围

`关键文件说明` 至少包含以下类别（如存在）：

- 路由文件 (confidence: high)
- 类型文件 (confidence: high)
- 请求文件 (confidence: high)
- 状态管理文件 (confidence: high)
- 全局样式文件 (confidence: high)

## Confidence Score 判定
- **high**：文件存在于标准路径（如 `src/main.ts`、`src/router/index.ts`）
- **medium**：文件存在于非标准路径（如自定义目录）
- **low**：文件仅通过命名推测存在，未实际读取

## 错误处理

**如果项目目录不存在或无法访问**：
```markdown
⚠️ 错误：无法访问项目目录

降级策略：
- 使用 `package.json` 中的信息推断目录结构
- 其他依赖目录结构的技能将标记为 confidence: low

建议后续操作：
1. 请确保项目目录存在且可访问
2. 检查当前工作目录是否正确
3. 如果在子目录中执行，请切换到项目根目录
```

## 强约束

- 仅输出客观、真实的项目结构信息
- 禁止多余解释
- 禁止 markdown 之外的格式
- 禁止输出代码片段
- 禁止主观分析
- 每个识别结果标注 confidence score
- 错误信息必须包含降级策略和后续建议

## Suggested Follow-up Actions

根据检测结果，推荐以下后续操作：
- 如果检测到 `src/router/` 目录 → 推荐使用 `detect_router_solution` 分析路由
- 如果检测到 `src/stores/` 目录 → 推荐使用 `detect_state_manage` 分析状态管理
- 如果检测到 `src/api/` 目录 → 推荐使用 `detect_request_scheme` 分析请求方案
- 如果检测到非标准目录结构 → 建议手动检查项目约定

## 版本
v1.1 - 改进版：新增 confidence scores、better error handling、suggested follow-up actions