# vue3-element-plus Pattern（成熟模式，τ×0.3）

## 模式信息
- 成熟度：成熟（出现≥5次）
- τ 折扣：70%（τ=180，原τ=600）
- 创建日期：2026-06-03

## 模式特征

### 必要特征（全部满足才能命中）
- `vue` 依赖（主版本≥3）
- `element-plus` 依赖

### 常见特征（命中加分）
- `pinia` 依赖（状态管理）
- `@vitejs/plugin-vue` 依赖（构建工具）
- `vite` 配置存在
- `src/plugins/element.ts` 或类似自动导入配置
- `src/styles` 目录

### 可选特征
- `sass`/`scss` 依赖
- `vue-router` 依赖
- `axios` 依赖

## 预填充上下文

当命中此模式时，预填充以下上下文（跳过后续扫描）：

```markdown
## 预填充技术栈
- 框架：Vue3
- 渲染模式：CSR（默认）
- TS：检测 tsconfig.json 确认
- UI库：Element Plus
- 状态管理：Pinia（常见组合）
- 样式方案：SCSS（常见配置）
- 路由方案：Vue Router（常见组合）
```

## 跳过的原子技能（当命中时）
- detect-tech-stack（框架已确认：Vue3）
- detect-tech-stack（UI库已确认：Element Plus）
- detect-tech-stack（可跳过或仅验证）

## 更新规则
- 每次扫描到匹配此模式的项目，自动记录
- 连续10次匹配后，τ 折扣提升至 80%（τ×0.2）
- 连续3次不匹配（特征变化），降级为成长模式