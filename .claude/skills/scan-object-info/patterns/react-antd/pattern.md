# react-antd Pattern（成熟模式，τ×0.3）

## 模式信息
- 成熟度：成熟（出现≥5次）
- τ 折扣：70%（τ=150，原τ=500）
- 创建日期：2026-06-03

## 模式特征

### 必要特征（全部满足才能命中）
- `react` 依赖
- `antd` 或 `@ant-design/pro-components` 依赖

### 常见特征（命中加分）
- `@reduxjs/toolkit` 或 `redux` 依赖（Redux Toolkit 常见）
- `react-router-dom` 依赖（路由）
- `axios` 或 `umi-request` 依赖（请求）
- `less` 依赖（Ant Design 使用 Less）
- `craco` 或 `customize-cra`（CRA 定制）

### 可选特征
- `typescript` 依赖
- `react-scripts`（CRA 项目）
- `@tanstack/react-query` 依赖

## 预填充上下文

```markdown
## 预填充技术栈
- 框架：React
- 渲染模式：CSR（默认）
- TS：检测 tsconfig.json 确认
- UI库：Ant Design
- 状态管理：Redux Toolkit（常见组合）
- 样式方案：Less（Ant Design 默认）
- 路由方案：React Router（常见组合）
```

## 跳过的原子技能
- detect-tech-stack（框架已确认：React）
- detect-tech-stack（UI库已确认：Ant Design）
- detect-tech-stack（可跳过或仅验证）

## 更新规则
- 连续10次匹配后，τ 折扣提升至 80%（τ×0.2）
- 连续3次不匹配，降级为成长模式