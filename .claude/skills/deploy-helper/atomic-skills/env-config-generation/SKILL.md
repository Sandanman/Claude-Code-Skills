---
name: env-config-generation
description: 根据源码使用情况和部署目标生成环境变量模板及可选部署脚本；当用户要求 .env.example、部署脚本或环境配置时触发。
---

# Env Config Generation

## 输入

- `project_context`：框架、环境变量访问方式和启动/构建命令。
- `source_paths`：扫描环境变量引用的范围。
- `environments`：用户指定的环境名称。
- `deployment_platform`：目标平台和进程管理方式。
- `script_options`：是否生成 deploy/rollback、健康 URL、备份和回滚策略。
- `output_path`：输出目录和覆盖策略。

## 安全边界

带 `VITE_` 等客户端公开前缀的变量不是 Secret；它们会进入客户端构建，不能存放密码、数据库凭据或私钥。服务端 Secret 只在模板中记录名称、来源和配置位置，不输出值，也不把 Secret 伪装成公开变量。

## 执行逻辑

1. 扫描 `import.meta.env`、`process.env` 等引用并保留证据。
2. 根据构建工具和平台区分公开变量与服务端变量。
3. 按用户指定环境生成 `.env.example` 变体；未知环境不自动扩展。
4. 仅在命令、分支、健康 URL、备份目录和进程管理器已确认时生成脚本。
5. 写入前预览，检查已有文件和 Secret 脱敏。

## 完成标准

- 可静态发现的变量均列出，未发现的运行时变量标记限制。
- 每个变量有用途、公开性、来源或待确认标记。
- 脚本命令和回滚策略来自输入，不固定假设 `git pull`、PM2 或 localhost。
- 输出文件存在、非空、路径正确；Shell 校验未执行时明确记录。

## 完成后校验

重新读取模板和脚本，检查变量分类、敏感值、环境名称、Shell 语法和路径。缺少关键部署上下文返回 `partial`；发现真实 Secret 或写入失败返回 `failed`。
