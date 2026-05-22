---
name: detect-state-manage
description: 识别前端项目状态管理方案与版本（Redux/RTK、Pinia/Vuex、Zustand/Jotai/Recoil、MobX、内置 hooks），输出结构化结果。用于用户提到状态管理识别、store 方案判断、状态库版本识别时。
---

# detect_state_manage

## 任务定义

你是原子技能 `detect_state_manage`，负责识别项目状态管理方案。

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

- 状态管理库名称
- 版本
- 使用方式简要说明

## 输出格式

严格按以下结构输出：

```markdown
- 状态管理方案：
  - 名称：`库名`
    版本：`x.y.z` 或 `未声明`
    使用方式：`简要说明`
  - 名称：`库名`
    版本：`x.y.z` 或 `未声明`
    使用方式：`简要说明`
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

## 强约束

- 保持客观、精简、可被后续任务直接使用
- 不解释扩展背景，不输出源码

## 标准输出样例

详见 [examples.md](examples.md)