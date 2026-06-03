# vite-vue3 Pattern（成熟模式，τ×0.3）

## 模式信息
- 成熟度：成熟（出现≥5次）
- τ 折扣：70%（τ=150，原τ=500）
- 创建日期：2026-06-03

## 模式特征

### 必要特征（全部满足才能命中）
- `vite` 依赖
- `vue` 依赖（主版本≥3）
- `vite.config.*` 文件存在

### 常见特征（命中加分）
- `@vitejs/plugin-vue` 依赖
- `vite.config.ts` 存在
- `src/main.ts` 或 `src/main.tsx` 入口文件
- `src/App.vue` 入口组件
- `index.html` 在根目录

### 可选特征
- `pinia` 依赖
- `vue-router` 依赖
- `axios` 依赖
- `sass`/`scss` 依赖

## 预填充上下文

```markdown
## 预填充技术栈
- 构建工具：Vite
- 框架：Vue3
- 渲染模式：CSR（默认）
- TS：检测 tsconfig.json 确认
- 样式方案：检测 package.json 中的预处理器确认
```

## 跳过的原子技能
- detect-tech-stack（框架已确认：Vue3 + Vite）
- scan-config-context（构建工具已确认：Vite）
- detect-tech-stack（可选）
- detect-net-router（可选）

## 更新规则
- 连续10次匹配后，τ 折扣提升至 80%（τ×0.2）
- 连续3次不匹配，降级为成长模式