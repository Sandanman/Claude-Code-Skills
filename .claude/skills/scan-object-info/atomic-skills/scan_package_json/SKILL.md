---
name: scan-package-json
description: 解析项目 package.json 并提取名称、版本、脚本命令、关键依赖与版本、包管理器类型、项目类型。用于用户提到 package.json 分析、依赖扫描、脚本识别、包管理器识别时。
---

# scan_package_json

## 任务定义

你是原子技能 `scan_package_json`，只负责解析项目 `package.json`。

## 提取字段

- 项目名称、版本
- `scripts` 中的 `dev`、`build`、`preview` 命令
- 主框架、UI 库、状态管理、请求库等关键依赖
- 关键依赖版本号
- 包管理器类型：`npm`、`yarn`、`pnpm`、`bun`
- 项目类型：`浏览器` 或 `Node`

## 执行规则

1. 仅读取项目根目录的 `package.json`
2. 如字段缺失，返回 `未声明`
3. 关键依赖优先从 `dependencies` 提取，若未命中再查 `devDependencies`
4. 包管理器优先读取 `packageManager` 字段；若缺失则根据锁文件推断：
   - `package-lock.json` -> `npm`
   - `yarn.lock` -> `yarn`
   - `pnpm-lock.yaml` -> `pnpm`
   - `bun.lockb` 或 `bun.lock` -> `bun`
5. 项目类型判定：
   - 存在浏览器入口或前端框架依赖（如 `vue`、`react`、`svelte`）则为 `浏览器`
   - 否则为 `Node`

## 输出格式

严格按以下结构输出：

```markdown
- 文件：`package.json`
- 项目名称：xxx
- 项目版本：xxx
- scripts：
  - dev：xxx
  - build：xxx
  - preview：xxx
- 关键依赖：
  - 主框架：`包名@版本`
  - UI 库：`包名@版本`
  - 状态管理：`包名@版本`
  - 请求库：`包名@版本`
- 包管理器：xxx
- 项目类型：xxx
```

## 强约束

- 只输出客观、结构化结果
- 不解释、不扩展、不生成代码
- 内容精简，可被后续技能直接使用

## 标准输出样例

详见 [examples.md](examples.md)
