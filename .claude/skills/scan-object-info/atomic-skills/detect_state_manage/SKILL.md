---
name: detect-state-manage
description: 识别前端项目状态管理方案与版本（Redux/RTK、Pinia/Vuex、Zustand/Jotai/Recoil、MobX、内置 hooks），输出结构化结果。改进版新增 confidence scores、better error handling 和 suggested follow-up actions。
---

# detect_state_manage（改进版 v1.1）

## 任务定义

你是原子技能 `detect_state_manage`，负责识别项目状态管理方案（改进版：新增 confidence scores、错误处理和后续建议）。

## 识别范围

- Redux / Redux Toolkit
- Pinia / Vuex
- Zustand / Jotai / Recoil
- MobX
- 内置 hooks 状态（无第三方状态管理库）

## 输入依据（只读）

- `package.json`（dependencies/devDependencies）
- 项目目录结构（如 `src/stores`、`src/store`、`src/redux`）
- 典型入口/注册文件（如 `main.*`、`store/index.*`）

## 判定规则

1. 先从依赖命中状态库：
   - Redux：`redux`、`@reduxjs/toolkit`、`react-redux`
   - Vue：`pinia`、`vuex`
   - 轻量库：`zustand`、`jotai`、`recoil`
   - MobX：`mobx`、`mobx-react-lite`
2. 如命中多个库，全部输出
3. 若未命中任何第三方状态库：
   - 若存在 React/Vue 框架依赖，输出 `内置 hooks/响应式状态`
   - 否则输出 `未检测到`
4. 版本号从 `package.json` 原样输出（保留 `^`、`~`）

## 输出字段

- 状态管理库名称（含 confidence score）
- 版本（含 confidence score）
- 使用方式简要说明

## Confidence Score 判定
- **high**：从 package.json 检测到状态库依赖 + 存在对应的 store 目录/文件
- **medium**：从 package.json 检测到状态库依赖，但无对应目录/文件
- **low**：仅从目录结构推测，无 package.json 证据

## 输出格式

严格按以下结构输出：

```markdown
- 状态管理方案 (confidence: overall)：
  - 名称：`库名` (confidence: high/medium/low)
    版本：`x.y.z` 或 `未声明` (confidence: high/medium/low)
    使用方式：`简要说明`
  - 名称：`库名` (confidence: high/medium/low)
    版本：`x.y.z` 或 `未声明` (confidence: high/medium/low)
    使用方式：`简要说明`
- 错误（如有）：⚠️ [错误描述]
```

## 使用方式说明规范

- Redux Toolkit：`集中式 store + slice + dispatch/selectors`
- Redux：`集中式 store + reducer + dispatch`
- Pinia：`defineStore + 响应式状态`
- Vuex：`集中式 store + state/mutations/actions`
- Zustand：`create store hooks`
- Jotai：`atom + hooks`
- Recoil：`atom/selector + hooks`
- MobX：`observable/action + 响应式绑定`
- 内置 hooks/响应式状态：`useState/useReducer` 或 `ref/reactive`

## 错误处理

**如果缺少必要的输入数据**：
```markdown
⚠️ 错误：缺少 package.json 信息，无法确定状态管理方案

降级策略：
- 输出 `状态管理方案：未知` (confidence: low)
- 其他依赖此结果的技能将标记为 confidence: low

建议后续操作：
1. 请确保 package.json 存在且包含依赖信息
2. 或者手动提供状态管理信息
```

## 强约束

- 保持客观、精简、可被后续任务直接使用
- 不解释扩展背景，不输出源码
- 每个结果标注 confidence score
- 错误信息必须包含降级策略和后续建议

## Suggested Follow-up Actions

根据检测结果，推荐以下后续操作：
- 如果检测到 `Pinia` → 推荐查看 `src/stores/` 目录结构，了解 store 划分
- 如果检测到 `Redux Toolkit` → 推荐查看 `src/store/` 目录结构，了解 slice 划分
- 如果检测到 `Zustand/Jotai` → 推荐了解轻量状态管理方案的适用场景
- 如果检测到 `内置 hooks/响应式状态` → 建议考虑添加 Pinia/Zustand 统一状态管理
- 如果检测到多个状态库 → 建议检查依赖是否冗余，可能需要迁移

## 版本
v1.1 - 改进版：新增 confidence scores、better error handling、suggested follow-up actions