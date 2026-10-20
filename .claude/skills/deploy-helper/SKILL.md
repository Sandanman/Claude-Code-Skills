---
name: deploy-helper
description: 根据已确认的部署目标生成 Docker、CI/CD、环境配置或部署验证产物；当用户要求部署、Docker、CI/CD、环境变量、部署脚本、健康检查或回滚方案时使用，并按目标选择最小必要原子 Skill。
---

# Deploy Helper

## 概述

Deploy Helper 生成可审阅的部署配置和验证方案，不等同于实际部署。所有平台、环境、命令、端口、健康检查地址和回滚方式必须来自项目证据或用户输入，不能用固定示例替代未知信息。

## 按需编排

| 用户目标 | 执行 Skill | 依赖 |
|---|---|---|
| Docker 配置 | `dockerfile-generation` | 无 |
| CI/CD 流水线 | `cicd-pipeline-generation` | 无 |
| 环境变量或部署脚本 | `env-config-generation` | 无 |
| 部署后验证 | `deployment-verification` | 需要真实部署上下文；可引用配置结果 |
| 完整部署方案 | Docker、CI/CD、环境配置可并行；验证在部署完成且上下文可用后执行 | 按实际目标决定 |

未选择的原子 Skill 不执行。Vercel、Netlify、Docker、VM、Kubernetes 等目标使用各自证据和命令，不强制生成不适用的产物。

## 输入契约

- `target_path`：项目根目录或部署配置目录。
- `deployment_target`：Docker、CI 平台、Serverless、VM、Kubernetes 或用户指定目标。
- `environment`：`development`、`staging`、`production` 或用户指定环境。
- `project_context`：框架、包管理器、构建/启动命令、端口和产物目录；缺失项必须标记。
- `selected_tasks`：`docker`、`cicd`、`env`、`verification` 的组合。
- `write_files`：是否写入；写入前展示路径、差异和覆盖策略。
- `verification_context`：仅验证时需要 URL、端点、凭据边界、日志或部署产物；不读取或输出 Secret。

## 输出契约

- 配置文件：仅生成与目标匹配的 Docker、CI/CD、环境模板或脚本。
- 验证报告：记录检查项、状态、证据、限制和回滚建议；不声称实际部署成功，除非确实执行并获得结果。
- Secret：只输出名称、来源和配置位置，不输出值。
- 返回状态：`passed`、`partial`、`failed` 或 `cancelled`。

## 完成标准

仅对本次选择的原子 Skill 评估：

1. 生成物与部署目标、框架、包管理器和已确认命令一致。
2. 配置文件存在、非空、路径与预览一致，且未未经确认覆盖已有文件。
3. 未知的端口、URL、Secret、分支、凭据和回滚命令未被硬编码为事实。
4. CI 仅包含项目实际存在或用户确认的脚本；不强制添加不存在的 lint/test/build 命令。
5. 验证结果只反映实际执行的检查；配置生成不等于部署完成。

## 完成后校验

1. 重新读取生成文件，检查 YAML、Dockerfile、Shell 或 JSON 的语法；可用工具缺失时记录跳过原因。
2. 检查路径、覆盖策略、环境名称、Secret 脱敏和命令来源。
3. Docker 任务检查构建上下文、非 root 设置、健康检查可达性和运行方式是否匹配。
4. CI 任务检查权限、触发条件、Job 依赖、Action/镜像版本和 Secret 引用。
5. 验证任务检查 URL、端点、超时、状态码、日志和回滚证据；缺少真实上下文返回 `partial`。

## 错误与状态

- `passed`：选定产物和校验全部成功。
- `partial`：部分输入缺失、工具不可用、平台能力受限或仅生成配置未执行部署。
- `failed`：目标无效、核心生成/写入失败或安全校验失败。
- `cancelled`：用户取消写入、覆盖或验证。

每个原子 Skill 最多重试 3 次；不得通过假设平台、凭据或健康端点掩盖失败。

## 触发关键词

部署、Docker、Dockerfile、CI/CD、GitHub Actions、GitLab CI、环境配置、部署脚本、健康检查、回滚、Vercel、Netlify、Nginx。

## 文件系统位置

- 主 Skill：`./.claude/skills/deploy-helper/SKILL.md`
- 原子 Skill：`./.claude/skills/deploy-helper/atomic-skills/`
- 默认输出：由任务指定；未指定时先预览，不直接写入项目根目录。
