---
name: deployment-verification
description: 验证部署结果（健康检查、回滚机制），在部署完成后触发
---

# Deployment Verification

## 概述

Deployment Verification 负责验证部署是否成功，通过健康检查、端点验证、冒烟测试等方式确认应用正常运行。如验证失败，提供详细的诊断信息和回滚建议。支持 Docker 容器验证、Kubernetes 部署验证、VM 验证等多种环境。

## 核心能力

- **健康检查端点**: 验证 `/health` 或 `/api/health` 端点响应
- **关键功能冒烟测试**: 验证核心页面/接口的可用性
- **性能基准验证**: 检查部署后是否满足基本的性能要求
- **回滚机制**: 在验证失败时提供一键回滚命令
- **日志分析**: 检查应用启动日志是否有 Error 级别的错误
- **诊断报告**: 生成部署诊断报告，包含健康状态、性能数据、建议

## 输入

- **DeploymentContext**: 部署上下文（部署方式、URL、环境）
- **DeploymentArtifacts**: 部署产物的变更（新增/修改的文件）
- **HealthCheckConfig**: 健康检查配置（端点、超时、重试次数）
- **Environment**: 部署环境（staging/production）
- **DeploymentLog**: 部署日志（用于分析启动问题）

## 输出

- **VerificationResult**: 验证结果（PASS/FAIL/WARNING）
- **HealthCheckReport**: 健康检查报告（含响应时间、状态码）
- **SmokeTestResults**: 冒烟测试结果
- **DiagnosticReport**: 诊断报告（失败时包含根因和解决方案）
- **RollbackCommand**: 回滚命令（如验证失败）
- **DeploymentSummary**: 部署摘要（部署时间、环境、版本）

**输出示例格式**:
```json
{
  "verificationTime": "2026-05-21T11:30:00Z",
  "environment": "production",
  "deploymentUrl": "https://app.example.com",
  "overallResult": "PASS",
  "checks": [
    {
      "checkType": "health_endpoint",
      "endpoint": "https://app.example.com/health",
      "statusCode": 200,
      "responseTime": 85,
      "result": "PASS",
      "details": "健康检查端点正常响应"
    },
    {
      "checkType": "smoke_test",
      "name": "首页加载",
      "target": "https://app.example.com/",
      "statusCode": 200,
      "result": "PASS"
    },
    {
      "checkType": "smoke_test",
      "name": "API 接口可用",
      "target": "https://app.example.com/api/meetings",
      "statusCode": 200,
      "result": "PASS"
    },
    {
      "checkType": "critical_error_log",
      "result": "PASS",
      "details": "无 Error 级别日志"
    }
  ],
  "performance": {
    "ttfb": 120,
    "fcp": 800,
    "lcp": 2100
  },
  "rollbackCommand": "docker-compose down && docker-compose -f docker-compose.backup.yml up -d",
  "recommendations": [
    "部署验证通过，建议执行最终用户冒烟测试",
    "考虑配置监控告警，持续跟踪健康状态"
  ]
}
```

## 执行逻辑

1. **环境检测**: 确定部署环境（Docker/Kubernetes/VM/Serverless）
2. **端点验证**: 发送 HTTP 请求到健康检查端点
3. **冒烟测试**: 执行关键功能冒烟测试（首页加载、核心 API）
4. **日志检查**: 检查应用启动日志是否有错误
5. **性能采集**: 采集部署后的响应时间数据
6. **结果判定**: 综合所有检查结果判定整体 PASS/FAIL
7. **回滚准备**: 如失败，生成回滚命令
8. **报告生成**: 生成验证报告和建议

## 依赖关系

- 依赖: cicd-pipeline-generation 或 env-config-generation
- 被依赖: 无（主skill终点）

## 完成标准

1. 健康检查端点返回 200 状态码（或其他正常状态）
2. 所有冒烟测试通过（核心页面/接口可用）
3. 应用日志中无 Error 级别错误
4. 验证失败时提供完整的回滚命令
5. 生成 `deployment-verification-report.json` 记录验证结果
6. 验证时间不超过 5 分钟（超时自动标记为 FAIL）