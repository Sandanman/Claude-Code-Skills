# nuxt3 Pattern（成长模式，τ×0.6）

## 模式信息
- 成熟度：成长（出现2-4次）
- τ 折扣：40%（τ=360，原τ=600）
- 创建日期：2026-06-03

## 模式特征

### 必要特征（全部满足才能命中）
- `nuxt` 依赖（主版本≥3）
- `nuxt.config.*` 文件存在

### 常见特征（命中加分）
- `vue` 依赖（Nuxt 隐含 Vue3）
- `pages/` 目录存在（Nuxt 文件路由）
- `server/` 目录存在（Nuxt Server Routes）
- `app.vue` 入口文件

### 可选特征
- `@pinia/nuxt` 依赖
- `@vueuse/nuxt` 依赖
- Tailwind CSS 配置存在

## 预填充上下文

```markdown
## 预填充技术栈
- 框架：Nuxt3
- 渲染模式：SSR（默认，可配置 SSG）
- TS：检测 tsconfig.json 确认
- 构建工具：Nuxt 内置
- 路由方案：Nuxt 文件路由
- 状态管理：Pinia（常见配置）
```

## 跳过的原子技能
- detect-tech-stack（框架已确认：Nuxt3）
- detect-net-router（Nuxt 文件路由已确认）

## 注意事项
- 成长模式不享受最高折扣（40%而非70%）
- 需要确认渲染模式（SSR vs SSG 需检测 nuxt.config.*）

## 更新规则
- 连续5次匹配后，晋升为成熟模式（τ×0.3）
- 连续3次不匹配，标记为试验模式