---
name: deploy-helper
description: 辅助部署操作，支持Docker配置、CI/CD流水线生成、环境配置、部署脚本生成，适配主流平台（Vercel、Netlify、Docker）
---

# Deploy Helper

## 概述

Deploy Helper 是辅助部署操作的技能，通过4个原子技能协同工作，覆盖 Docker 配置、CI/CD 流水线、环境变量配置和部署验证。帮助开发者将前端应用部署到各种平台（Vercel、Netlify、Docker、Nginx），支持 GitHub Actions、GitLab CI 等主流 CI/CD 工具。

## 核心能力

- 生成 Dockerfile 和 docker-compose.yml
- 生成 CI/CD 流水线配置（GitHub Actions/GitLab CI）
- 生成环境变量配置文件和部署脚本
- 验证部署结果（健康检查、自动化测试、回滚机制）
- 支持多环境配置（development/staging/production）
- 提供 Nginx 配置和反向代理设置

## 执行流程

1. **dockerfile-generation** - 生成 Dockerfile 和 docker-compose.yml
2. **cicd-pipeline-generation** - 生成 CI/CD 流水线配置（GitHub Actions、GitLab CI）
3. **env-config-generation** - 生成环境变量配置文件和部署脚本
4. **deployment-verification** - 验证部署结果（健康检查、回滚机制）

## 原子skill依赖关系

- **dockerfile-generation**: 无依赖
- **cicd-pipeline-generation**: 无依赖
- **env-config-generation**: 无依赖
- **deployment-verification**: 依赖 cicd-pipeline-generation 或 env-config-generation

## 主skill完成标准

1. 根据项目技术栈生成对应的 Dockerfile
2. 生成 docker-compose.yml 支持本地开发环境
3. 生成 CI/CD 流水线配置（至少包含构建、测试、部署步骤）
4. 生成环境变量配置模板（.env.example）
5. 生成的配置语法正确，可直接使用
6. 提供部署验证命令（健康检查、启动命令）

## 重试规则

- 每个原子skill失败后可重试 **3次**
- 检测到非 Docker 项目时，仅生成基础配置
- 部署验证在非 CI 环境中提供手动验证指南

## 触发关键词

- 部署
- Docker
- CI/CD
- 环境配置
- 部署脚本
- Vercel
- Netlify
- 自动化部署
- Dockerfile
- GitHub Actions
- GitLab CI
- Nginx
- docker-compose

## 注意事项

- Dockerfile 基于项目检测到的技术栈（Node.js 基础镜像版本）
- CI/CD 配置需要用户提供远程仓库 URL
- 所有生成的配置在写入前提供预览，不自动覆盖已有文件
- 敏感信息（API Key、Secret）不在配置中硬编码，使用环境变量

## 文件系统位置

- 主skill路径: ./.claude/skills/deploy-helper/SKILL.md
- 原子skill路径: ./.claude/skills/deploy-helper/atomic-skills/下各子目录