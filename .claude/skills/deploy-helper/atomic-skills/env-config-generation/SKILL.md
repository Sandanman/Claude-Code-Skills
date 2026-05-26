---
name: env-config-generation
description: 生成环境变量配置文件和部署脚本，在需要配置部署环境时触发
---

# Env Config Generation

## 概述

Env Config Generation 负责生成环境变量配置文件（.env.example、.env.production 等）和部署脚本。生成的配置覆盖多环境（development/staging/production），提供不同环境下的变量模板和获取来源说明，同时生成安全的部署脚本（部署前备份、部署中切换、部署后验证）。

## 核心能力

- **.env.example 生成**: 基于项目中 `import.meta.env` 或 `process.env` 使用情况生成变量模板
- **多环境配置**: 生成 development/staging/production 三套环境变量
- **敏感变量说明**: 标注哪些变量需要从 Secret Manager 获取，不应硬编码
- **部署脚本**: 生成 shell 部署脚本，支持备份、回滚、多环境切换
- **Nginx 配置**: 生成反向代理和静态资源服务的 Nginx 配置
- **启动脚本**: 生成 PM2/Ecosystem 配置或 systemd 服务配置

## 输入

- **ProjectContext**: 项目技术栈和当前环境变量使用情况
- **Environments**: 需要生成的环境列表（默认 dev/staging/prod）
- **DeploymentPlatform**: 部署平台（ecs/aliyun/vercel/netlify/custom）
- **ExistingEnvFile**: 现有的 .env 文件内容（用于分析需要哪些变量）
- **DeployScriptType**: 部署脚本类型（shell/pm2/ansible，默认 shell）

## 输出

- **EnvExampleFiles**: 各环境的 .env.example 文件
- **EnvMissingList**: 项目中引用但未在 .env.example 中声明的变量
- **DeployScript**: 部署脚本（deploy.sh、rollback.sh）
- **NginxConfig**: Nginx 配置文件（如适用）
- **StartupScript**: PM2 ecosystem.config.js 或服务配置

**输出示例格式**:
```bash
# .env.example

# ===========================================
# API Configuration
# ===========================================
# 获取方式: 在 Vercel/Netlify 控制台创建
VITE_API_BASE_URL=https://api.example.com
VITE_API_TIMEOUT=10000

# ===========================================
# Authentication
# ===========================================
# 获取方式: 第三方认证平台（Auth0/Clerk）
VITE_AUTH_PROVIDER=auth0
VITE_AUTH_CLIENT_ID=your_client_id

# ===========================================
# Feature Flags
# ===========================================
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false

# ===========================================
# DO NOT ADD SECRETS HERE
# 以下变量为服务端 Secret，不得出现在 .env.example 中
# VITE_SECRET_KEY=xxx
# VITE_DB_PASSWORD=xxx
```

```bash
# deploy.sh 示例
#!/bin/bash
set -e

# 配置
APP_NAME="{{PROJECT_NAME}}"
DEPLOY_ENV="production"
BACKUP_DIR="/opt/backups/$APP_NAME"

echo "==> 1. 创建备份"
mkdir -p "$BACKUP_DIR"
cp -r /var/www/$APP_NAME "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"

echo "==> 2. 拉取最新代码"
cd /var/www/$APP_NAME
git pull origin main

echo "==> 3. 安装依赖"
npm ci

echo "==> 4. 构建"
npm run build

echo "==> 5. 重启服务"
pm2 restart $APP_NAME --update-env

echo "==> 6. 健康检查"
curl -f http://localhost:3000/health || { echo "健康检查失败，执行回滚"; ./rollback.sh; exit 1; }

echo "==> 部署完成"
```

## 执行逻辑

1. **变量扫描**: 扫描源码中的 `import.meta.env` 和 `process.env` 使用情况
2. **变量分类**: 将变量分为 Public（VITE_ 前缀）和 Private（Secret）
3. **环境配置生成**: 为每个环境生成对应的 .env.example
4. **部署脚本生成**: 生成可执行的部署脚本（deploy.sh、rollback.sh）
5. **Nginx 配置生成**: 如需要 Nginx，生成反向代理和静态资源配置
6. **PM2 配置生成**: 如使用 PM2，生成 ecosystem.config.js
7. **文件输出**: 将所有配置文件写入到项目目录

## 依赖关系

- 依赖: 无
- 被依赖: deployment-verification

## 完成标准

1. .env.example 覆盖项目中所有使用的环境变量
2. 每个变量有注释说明其用途和获取方式
3. 部署脚本包含：备份、部署、健康检查、回滚步骤
4. Secret 变量不在 .env.example 中暴露（仅标注需要配置）
5. 部署脚本可执行（`chmod +x deploy.sh`）
6. 所有配置文件保存到 `.claude/outputs/deploy/` 并提供复制到根目录的建议