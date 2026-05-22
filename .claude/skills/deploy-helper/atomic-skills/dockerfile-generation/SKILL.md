---
name: dockerfile-generation
description: 生成Dockerfile和docker-compose.yml，在需要Docker化部署时触发
---

# Dockerfile Generation

## 概述

Dockerfile Generation 负责根据项目技术栈（Node.js 版本、框架类型、构建工具）生成优化的 Dockerfile 和 docker-compose.yml。生成的配置包含多阶段构建（减少最终镜像体积）、合理的层缓存策略、健康检查配置、生产环境最佳实践。

## 核心能力

- **多阶段构建**: 使用 build stage + production stage 减少镜像体积
- **基础镜像选择**: 根据 package.json 的 engines 选择合适的 Node.js 镜像
- **依赖缓存优化**: 合理排序 Dockerfile 指令，最大化构建缓存利用率
- **非 root 用户**: 生产镜像使用非 root 用户运行，提升安全性
- **健康检查**: 配置 HEALTHCHECK 指令，支持容器健康监控
- **开发/生产分离**: 分别生成 development 和 production 的 Dockerfile

## 输入

- **ProjectContext**: 项目技术栈（Node版本、框架、构建工具）
- **PackageManager**: 包管理器（npm/yarn/pnpm）
- **BuildCommand**: 构建命令（从 package.json scripts 中提取）
- **OutputDir**: 输出目录（默认项目根目录）
- **BaseImage**: 指定基础镜像（可选，默认自动选择）

## 输出

- **Dockerfile**: 生产环境的 Dockerfile
- **Dockerfile.dev**: 开发环境的 Dockerfile（支持热更新）
- **docker-compose.yml**: 完整的 docker-compose 配置
- **dockerignore**: .dockerignore 文件（排除 node_modules、.git 等）
- **nginx.conf**: 如需要反向代理，提供 Nginx 配置

**输出示例格式**:
```dockerfile
# Dockerfile (Multi-stage build)
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1
CMD ["node", "dist/server.js"]
```

## 执行逻辑

1. **环境检测**: 读取 package.json 提取 Node 版本、依赖、构建命令
2. **框架检测**: 检测 Vue/React/Next.js/Nuxt 等框架，确定运行方式
3. **镜像选择**: 基于 Node 版本和框架选择合适的基础镜像
4. **多阶段构建设计**: 设计 build stage 和 production stage
5. **层缓存优化**: 合理排序 COPY 指令（先复制依赖文件）
6. **安全配置**: 添加非 root 用户、健康检查
7. **docker-compose 生成**: 生成包含 app、db、nginx 的完整配置
8. **文件写入**: 生成所有文件到项目目录

## 依赖关系

- 依赖: 无
- 被依赖: 无

## 完成标准

1. Dockerfile 使用多阶段构建，最终镜像不含源代码
2. 镜像体积最小化（Node 基础镜像优先使用 alpine 变体）
3. 包含 `npm ci` 而非 `npm install`（可重现构建）
4. docker-compose.yml 包含 development 和 production 配置
5. .dockerignore 正确排除 node_modules、.git、dist 等目录
6. 所有生成的文件语法正确，可通过 `docker build` 测试