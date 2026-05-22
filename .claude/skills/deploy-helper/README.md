# Deploy Helper

## 概述

Deploy Helper 是辅助部署操作的技能，通过 Docker 配置生成、CI/CD 流水线生成、环境配置和部署验证，帮助开发者将前端应用快速部署到各种平台。

## 核心能力

- **Docker 部署**: 生成优化的 Dockerfile 和 docker-compose.yml
- **CI/CD 自动化**: 生成 GitHub Actions / GitLab CI 流水线配置
- **环境配置**: 生成多环境变量配置和部署脚本
- **部署验证**: 提供健康检查、冒烟测试、回滚机制

## 适用场景

- 首次部署前端应用到 Docker 环境
- 配置自动化 CI/CD 流水线
- 从零搭建 DevOps 环境
- 多环境部署配置（development/staging/production）

## 原子技能列表

| 原子技能 | 职责 |
|---------|------|
| dockerfile-generation | 生成 Dockerfile 和 docker-compose.yml |
| cicd-pipeline-generation | 生成 CI/CD 流水线配置（GitHub Actions、GitLab CI） |
| env-config-generation | 生成环境变量配置文件和部署脚本 |
| deployment-verification | 验证部署结果（健康检查、回滚机制） |

## 执行流程图

```
dockerfile-generation ─┐
                       │
cicd-pipeline-generation ─┤
                       ├──→ deployment-verification
env-config-generation ─────┘
```

## 输出产物

- `Dockerfile` - Docker 构建文件
- `docker-compose.yml` - 本地开发环境配置
- `.github/workflows/deploy.yml` - GitHub Actions 流水线
- `.env.example` - 环境变量模板
- `deploy.sh` - 部署脚本
- `health-check.sh` - 健康检查脚本

## 快速开始

```bash
# 通过 orchestrator 触发
# 用户: "为这个项目生成 Docker 配置"
# 用户: "配置 GitHub Actions CI/CD"
# 用户: "生成部署脚本"
```