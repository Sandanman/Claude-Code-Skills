---
name: scan-package-json
description: 解析项目 package.json 并提取名称、版本、脚本命令、关键依赖与版本、包管理器类型、项目类型。改进版新增 confidence scores、better error handling 和 suggested follow-up actions。
---

# scan_package_json（改进版 v1.1）

## 任务定义

你是原子技能 `scan_package_json`，只负责解析项目 `package.json`（改进版：新增 confidence scores、错误处理和后续建议）。

## 提取字段

- 项目名称、版本
- `scripts` 中的 `dev`、`build`、`preview` 命令
- 主框架、UI 库、状态管理、请求库等关键依赖
- 关键依赖版本号
- 包管理器类型：`npm`、`yarn`、`pnpm`、`bun`
- 项目类型：`浏览器` 或 `Node`

## 执行规则

1. **只读取项目根目录的 `package.json`**
2. **如字段缺失，返回 `未声明`**
3. 关键依赖优先从 `dependencies` 提取，若未命中再查 `devDependencies`**
4. 包管理器优先读取 `packageManager` 字段；若缺失则根据锁文件推断：
   - `package-lock.json` -> `npm`
   - `yarn.lock` -> `yarn`
   - `pnpm-lock.yaml` -> `pnpm`
   - `bun.lockb` 或 `bun.lock` -> `bun`
5. **项目类型判定**：
   - 存在浏览器入口或前端框架依赖（如 `vue`、`react`、`svelte`）则为 `浏览器`
   - 否则为 `Node`
6. **错误处理**：如 package.json 不存在，输出明确的错误信息和降级建议
7. **Confidence Score**：每个提取结果标注置信度（基于数据来源的可靠性）

## 输出格式

严格按以下结构输出：

```markdown
- 文件：`package.json` (confidence: high)
- 项目名称：xxx (confidence: high)
- 项目版本：xxx (confidence: high)
- scripts：
  - dev：xxx (confidence: high)
  - build：xxx (confidence: high)
  - preview：xxx (confidence: medium，如果仅在 devDependencies 中)
- 关键依赖：
  - 主框架：`包名@版本` (confidence: high)
  - UI 库：`包名@版本` (confidence: high)
  - 状态管理：`包名@版本` (confidence: high)
  - 请求库：`包名@版本` (confidence: high)
- 包管理器：xxx (confidence: medium，如果通过锁文件推断)
- 项目类型：xxx (confidence: high)
- 错误（如有）：⚠️ [错误描述]
```

## Confidence Score 判定
- **high**：字段在 package.json 中明确定义
- **medium**：字段通过锁文件推断或从 devDependencies 获取
- **low**：字段缺失或无法确定

## 错误处理

**如果 package.json 不存在**：
```markdown
⚠️ 错误：未找到 package.json 文件

降级策略：
- 使用默认配置继续扫描
- 其他依赖 package.json 的技能将标记为 confidence: low

建议后续操作：
1. 请确保项目根目录存在 package.json
2. 如果在子目录中执行，请切换到项目根目录
```

## 强约束

- 只输出客观、结构化结果
- 不解释、不扩展、不生成代码
- 内容精简，可被后续技能直接使用
- 每个字段标注 confidence score
- 错误信息必须包含降级策略和后续建议

## Suggested Follow-up Actions

根据检测结果，推荐以下后续操作：
- 如果检测到 Vue3 → 推荐使用 `code-style-generator` 生成 Vue3 代码规范
- 如果检测到旧版本依赖 → 推荐执行依赖更新检查
- 如果项目类型为 `浏览器` → 推荐执行 `scan-object-info` 全面分析

## 版本
v1.1 - 改进版：新增 confidence scores、better error handling、suggested follow-up actions