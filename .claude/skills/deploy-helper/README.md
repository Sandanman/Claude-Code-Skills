# Deploy Helper

## 定位

按部署目标生成可审阅的 Docker、CI/CD、环境配置或验证产物。配置生成不等于实际部署；实际验证必须有真实部署上下文和可执行的检查条件。

## 原子 Skill

| 原子 Skill | 用途 | 默认输出 |
|---|---|---|
| `dockerfile-generation` | 生成与项目运行方式匹配的 Docker 配置 | 用户指定目录 |
| `cicd-pipeline-generation` | 生成 GitHub Actions 或 GitLab CI | 对应平台配置目录 |
| `env-config-generation` | 生成环境模板和可选部署脚本 | 用户指定目录 |
| `deployment-verification` | 执行或设计部署后检查 | 验证报告路径由任务指定 |

Docker、CI/CD 和环境配置可按需并行；验证应在部署完成并具备 URL、端点、日志或平台状态后执行。未选中的原子 Skill 不执行。

## 安全与写入

Secret 只记录名称和来源，不记录具体值。所有文件写入前展示路径和覆盖策略，不自动覆盖已有文件。未知的端口、域名、命令和回滚方式必须标记为待确认。

## 示例

```text
生成 Docker 配置       → dockerfile-generation
配置 GitHub Actions    → cicd-pipeline-generation
生成 .env.example      → env-config-generation
检查 staging 部署      → deployment-verification
```
