
## 模式信息
- 创建日期：2026-06-03

## 模式特征

### 必要特征（全部满足才能命中）
- `next` 依赖
- `app/` 目录存在（App Router）
- `next.config.*` 文件存在

### 常见特征（命中加分）
- `react` 依赖（Next.js 隐含 React）
- `src/app/layout.tsx` 或 `src/app/page.tsx`
- TypeScript 配置文件存在
- Tailwind CSS 配置存在

### 可选特征
- `@tanstack/react-query` 依赖
- `next-auth` 依赖
- `styled-components` 或 `@emotion/react` 依赖

## 预填充上下文

```markdown
## 预填充技术栈
- 框架：Next.js
- 渲染模式：SSR/SSG/ISR（需检测 revalidate 配置）
- TS：检测 tsconfig.json 确认
- 构建工具：Next.js 内置（无需额外配置）
- 路由方案：App Router（文件路由）
```

## 跳过的原子技能
- detect-tech-stack（框架已确认：Next.js）
- detect-net-router（App Router 已确认）
