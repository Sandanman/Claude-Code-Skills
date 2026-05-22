---
name: security-scanner
description: 系统化地扫描前端项目中的安全漏洞，包括XSS、CSRF、依赖漏洞、敏感信息泄露等，提供修复建议
---

# Security Scanner

## 概述

Security Scanner 是前端项目的系统性安全扫描技能，通过4个原子技能协同工作，覆盖漏洞扫描、依赖安全检查、敏感信息检测和安全报告生成四个维度，帮助开发者识别项目中的安全风险并提供修复建议。适用于项目上线前安全审计、依赖更新后的安全回归检查、以及日常安全维护。

## 核心能力

- 扫描 XSS、CSRF、SQL注入、命令注入等常见 Web 安全漏洞模式
- 集成 npm audit 检查依赖包的安全漏洞
- 检测硬编码的 API Key、Password、Token、Secret 等敏感信息
- 生成结构化的安全报告，按严重程度分级并提供修复建议
- 支持 CI 集成，可在流水线中自动运行安全扫描

## 执行流程

1. **vulnerability-scan** - 扫描 XSS、CSRF、注入等常见 Web 安全漏洞
2. **dependency-security-check** - 检查依赖包的安全漏洞（npm audit）
3. **sensitive-info-detection** - 检测敏感信息泄露（API密钥、密码、token硬编码）
4. **security-report** - 汇总安全扫描结果，生成安全报告

## 原子skill依赖关系

- **vulnerability-scan**: 无依赖
- **dependency-security-check**: 无依赖
- **sensitive-info-detection**: 无依赖
- **security-report**: 依赖 vulnerability-scan, dependency-security-check, sensitive-info-detection

## 主skill完成标准

1. 成功扫描所有源码文件，无遗漏
2. 识别出所有已知的安全漏洞模式
3. npm audit 检查无未被忽略的高危漏洞
4. 无硬编码的敏感信息（或已确认的误报）
5. 生成完整的安全报告，包含所有发现项和修复建议
6. 高危（Critical/High）漏洞必须有明确修复方案

## 重试规则

- 每个原子skill失败后可重试 **3次**
- 重试间隔为指数退避：1s、4s、16s
- dependency-security-check 失败时跳过但记录，不阻断整体流程

## 触发关键词

- 安全扫描
- 安全漏洞
- XSS
- CSRF
- 依赖安全
- 敏感信息检测
- 安全审计
- npm audit
- 漏洞检测

## 注意事项

- 安全扫描仅分析代码模式，不执行代码，安全性有保障
- 误报需要人工确认（如测试代码中的假数据）
- 涉及 .env 文件时只报告路径，不读取具体值
- 扫描结果应定期归档，便于安全审计追溯

## 文件系统位置

- 主skill路径: ./.claude/skills/security-scanner/SKILL.md
- 原子skill路径: ./.claude/skills/security-scanner/atomic-skills/下各子目录