---
name: dockerfile-generation
description: 根据已确认的项目运行方式生成 Docker 配置；当用户要求 Dockerfile、容器化或 Compose 配置时触发。
---

# Dockerfile Generation

## 输入

- `project_context`：框架、Node 版本、构建和启动命令、产物目录、端口。
- `package_manager`：`npm`、`yarn`、`pnpm` 或 `bun`。
- `deployment_mode`：静态站点、Node 服务、开发容器或用户指定模式。
- `compose_services`：仅生成用户确认的服务，不默认添加数据库或 Nginx。
- `output_path`：输出目录和覆盖策略。

## 执行逻辑

1. 从项目证据检测包管理器、脚本、框架和运行模式。
2. 对缺失的 Node 版本、端口、启动命令或服务依赖标记待确认。
3. 生成匹配模式的 Dockerfile、可选 Dockerfile.dev、Compose 和 `.dockerignore`。
4. 仅在用户要求且有配置证据时生成 Nginx 或额外服务。
5. 写入前预览，检查 Dockerfile/Compose 语法工具是否可用。

## 完成标准

- 安装命令与锁文件匹配，构建和启动命令来自项目证据。
- 多阶段构建、非 root 和健康检查仅在运行模式适用时使用。
- `.dockerignore` 不包含必要构建文件，Compose 不含未经确认的服务。
- 文件存在、非空、路径一致；构建校验未执行时明确记录。

## 完成后校验

重新读取输出，检查路径、命令、端口、上下文和 Secret。可用时执行 Dockerfile/Compose 配置解析；Docker daemon 不可用不等同于配置已构建。返回 `passed`、`partial`、`failed` 或 `cancelled`。
