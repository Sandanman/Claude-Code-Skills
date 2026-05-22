---
name: sensitive-info-detection
description: 检测硬编码的API密钥、密码、tokens等敏感信息，在敏感信息检测时触发
---

# Sensitive Info Detection

## 概述

Sensitive Info Detection 通过正则模式匹配和语义分析，检测前端代码和配置文件中硬编码的敏感信息，包括 API Key、Private Key、Access Token、Secret Key、数据库密码、云服务凭证（AWS、阿里云、腾讯云）、JWT Token 格式等。检测到敏感信息后，仅报告文件路径和行号，不读取具体值，保护隐私安全。

## 核心能力

- **密钥检测**: 检测 `api_key`、`secret_key`、`private_key`、`access_token`、`auth_token`
- **密码检测**: 检测 `password`、`passwd`、`pwd` 相关的硬编码值
- **云凭证检测**: AWS Access Key、阿里云 AccessKey、腾讯云 SecretId 等
- **JWT 检测**: 检测 JWT Token 格式（header.payload.signature）
- **连接字符串检测**: 检测包含密码的数据库连接字符串
- **.env 文件处理**: 仅报告文件路径，不读取具体值
- **误报过滤**: 过滤测试数据、示例代码、注释中的误报

## 输入

- **SourceCodeContext**: 项目源码目录路径
- **DetectionPatterns**: 自定义检测模式（扩展默认模式库）
- **ExcludePaths**: 排除路径（如 `.git/`、`node_modules/`、`*.test.ts`）
- **ScanConfig**: 扫描配置（是否检测 .env 文件、是否启用 AI 辅助分析）

## 输出

- **SensitiveFindings**: 敏感信息发现列表（不包含实际值）
- **SeverityAssessment**: 每个发现的风险等级评估
- **ExposureAnalysis**: 暴露面分析（是否在客户端代码中暴露）
- **RemediationSteps**: 修复步骤建议（使用环境变量、.env 文件等）

**输出示例格式**:
```json
{
  "scanTime": "2026-05-21T10:02:00Z",
  "totalFindings": 3,
  "findings": [
    {
      "id": "SENS-001",
      "type": "api_key",
      "severity": "critical",
      "file": "src/config/api.ts",
      "line": 5,
      "variableName": "API_KEY",
      "exposure": "client-side",
      "description": "API Key 硬编码在前端代码中，可被客户端直接访问",
      "remediation": "将 API_KEY 移至环境变量，使用 import.meta.env.VITE_API_KEY 访问"
    },
    {
      "id": "SENS-002",
      "type": "jwt_token",
      "severity": "high",
      "file": "src/utils/auth.ts",
      "line": 28,
      "pattern": "Bearer eyJ...",
      "exposure": "source-code",
      "description": "源代码中发现 JWT Token，可能被提交到版本库"
    }
  ]
}
```

## 执行逻辑

1. **模式库初始化**: 加载内置的敏感信息正则模式库
2. **文件扫描**: 递归扫描源码，排除 node_modules、.git
3. **正则匹配**: 对每个文件执行所有检测模式
4. **语义过滤**: 分析匹配上下文，过滤注释、示例代码、测试数据中的误报
5. **环境变量检查**: 检查 .env.example 是否包含真实值（不应包含）
6. **风险评估**: 评估每个发现的风险等级（考虑暴露面、利用难度）
7. **报告生成**: 生成发现报告（不包含实际敏感值）

## 依赖关系

- 依赖: 无
- 被依赖: security-report

## 完成标准

1. 所有源码文件扫描完成（排除 node_modules/.git）
2. 每个发现不包含敏感信息的实际值（仅报告路径、行号、类型）
3. 误报率控制在 10% 以内（经人工抽检验证）
4. .env 文件仅报告存在，不读取内容
5. 生成 `sensitive-findings.json` 保存结果