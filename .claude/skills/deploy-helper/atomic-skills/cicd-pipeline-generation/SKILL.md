---
name: cicd-pipeline-generation
description: 根据已确认的 CI 平台和项目脚本生成 CI/CD 配置；当用户要求 GitHub Actions、GitLab CI 或自动化发布时触发。
---

# CI/CD Pipeline Generation

## 输入

- `project_context`：包管理器、Node 版本和实际 scripts。
- `platform`：`github`、`gitlab` 或用户确认的其他平台；自动检测失败时暂停确认。
- `trigger_config`：push、pull request、tag 或 manual。
- `deploy_target`：部署目标和已确认命令。
- `environments`：实际需要的环境，不默认创建 staging/production。
- `output_path`：workflow 或 pipeline 文件路径。

## 执行逻辑

1. 检查平台配置和项目脚本。
2. 仅加入项目存在或用户确认的 lint、type-check、test、build 和 deploy 命令。
3. 生成依赖缓存、Job 依赖、触发条件和最小权限配置。
4. 列出 Secret 名称和来源，不写入值；部署命令必须匹配目标环境。
5. 写入前预览并检查已有配置。

## 完成标准

- 平台语法、触发条件和 Job 依赖结构有效。
- 流水线阶段与实际脚本和部署目标一致，未添加虚构命令。
- Action、镜像和 CLI 版本明确或标记待确认。
- Secret 仅以引用形式出现，配置文件路径正确。

## 完成后校验

重新读取 YAML，检查权限、条件、缓存、依赖和 Secret 脱敏。平台校验工具不可用时记录跳过原因；部署未执行时不得报告部署成功。返回标准状态值。
