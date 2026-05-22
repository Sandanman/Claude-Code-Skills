# Security Scanner

## 概述

Security Scanner 是前端项目的系统性安全扫描技能，通过静态代码分析和依赖检查，系统化地识别项目中的安全漏洞、依赖风险和敏感信息泄露问题。

## 核心能力

- **漏洞模式扫描**: 基于签名的静态分析，检测 XSS、CSRF、注入、DOM 污染等漏洞模式
- **依赖安全检查**: 集成 npm audit，分析依赖树中的已知 CVE 漏洞
- **敏感信息检测**: 正则匹配 + 语义分析，检测硬编码的密钥、密码、Token
- **分级报告**: 按 Critical/High/Medium/Low 分级，附带修复建议和参考资料

## 适用场景

- 项目上线前的安全审计
- 依赖更新后的安全回归检查
- 第三方代码接入前的安全评估
- 定期安全维护和漏洞监控

## 原子技能列表

| 原子技能 | 职责 |
|---------|------|
| vulnerability-scan | 扫描 XSS、CSRF、注入等常见 Web 安全漏洞 |
| dependency-security-check | 检查依赖包的安全漏洞（npm audit） |
| sensitive-info-detection | 检测硬编码的敏感信息 |
| security-report | 汇总结果，生成安全报告 |

## 执行流程图

```
vulnerability-scan ─┐
                    │
dependency-security-check ─→ security-report
                    │
sensitive-info-detection ──┘
```

## 输出产物

- `security-scan-report.md` - 安全扫描综合报告
- `security-findings.json` - 结构化的发现项数据（便于 CI 集成）
- `security-fix-suggestions.md` - 修复建议清单

## 快速开始

```bash
# 通过 orchestrator 触发
# 用户: "对这个项目进行安全扫描"

# 支持指定扫描范围
# 用户: "只扫描 src/utils 目录的安全漏洞"
```