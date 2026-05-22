---
name: cicd-pipeline-generation
description: 生成CI/CD流水线配置（GitHub Actions、GitLab CI），在需要配置CI/CD时触发
---

# CI/CD Pipeline Generation

## 概述

CI/CD Pipeline Generation 负责根据项目技术栈生成 CI/CD 流水线配置文件，支持 GitHub Actions（`.github/workflows/`）和 GitLab CI（`.gitlab-ci.yml`）。生成的流水线包含代码检查、测试运行、构建打包、部署发布等阶段，支持多环境部署（staging/production）和触发条件配置。

## 核心能力

- **GitHub Actions**: 生成 `.github/workflows/` 下的 workflow 文件
- **GitLab CI**: 生成 `.gitlab-ci.yml` 配置
- **多阶段流水线**: 代码检查 → 单元测试 → 构建 → 部署
- **缓存优化**: 配置 node_modules、构建缓存复用
- **多环境部署**: staging 和 production 环境的独立部署步骤
- **触发条件**: 支持 push、PR、tag、manual 多种触发方式
- **Secret 管理**: 使用 GitHub Secrets / GitLab CI Variables 的配置建议

## 输入

- **ProjectContext**: 项目技术栈和 package.json
- **Platform**: CI 平台（github/gitlab/auto-detect）
- **Environments**: 部署环境列表（默认 staging, production）
- **DeployTarget**: 部署目标（vercel/netlify/firebase/ecs/docker/aliyun）
- **TriggerConfig**: 触发条件配置（push/PR/tag/manual）
- **RegistryConfig**: 容器镜像仓库配置（用于 Docker 部署）

## 输出

- **WorkflowFile**: CI/CD 流水线配置文件
- **SecretsConfig**: 需要配置的 Secret 清单（不含值）
- **DeployScript**: 部署脚本（如需要自定义部署逻辑）
- **PipelineDiagram**: 流水线阶段图（文字描述）

**输出示例格式**:
```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [published]

env:
  NODE_VERSION: '20'

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit

  build:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g vercel
      - run: vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 执行逻辑

1. **平台检测**: 检测 .git 远程仓库类型，判断 GitHub/GitLab
2. **框架检测**: 检测 Vue/React/Next.js，确定构建命令
3. **模板选择**: 选择对应的 CI/CD 模板（GitHub Actions 或 GitLab CI）
4. **阶段设计**: 设计流水线阶段（lint → test → build → deploy）
5. **缓存配置**: 配置依赖缓存步骤（减少构建时间）
6. **部署逻辑**: 根据 deployTarget 生成部署命令
7. **Secret 配置**: 列出需要配置的 Secret 清单
8. **文件生成**: 生成流水线配置文件到对应目录

## 依赖关系

- 依赖: 无
- 被依赖: deployment-verification

## 完成标准

1. 流水线包含完整阶段：lint → test → build → deploy
2. 每个阶段有明确的 `runs-on` 和依赖关系
3. 配置了 node_modules 缓存以加速构建
4. Secret 使用占位符，不在配置中暴露真实值
5. 支持多环境部署（staging 和 production 分离）
6. 生成的配置文件语法正确，可通过 CI 平台验证