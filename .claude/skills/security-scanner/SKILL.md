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

## 输入契约

- `target_path`：待扫描项目或目录路径，默认当前项目根目录。
- `scan_scope`：扫描范围，可为 `all` 或用户明确指定的源码、依赖、配置、敏感信息范围。
- `dependency_audit`：是否执行依赖安全检查，必须由用户或上层任务明确指定。
- `include_env_paths`：是否检查 `.env` 文件路径；只报告路径和风险类型，不读取或输出具体值。
- `output_path`：安全报告输出路径，由任务上下文指定。
- `execution_mode`：`interactive` 或 `ci`，决定是否允许无人值守返回结果。

扫描范围和依赖审计选项必须来自用户输入或上层任务上下文，不得擅自扩大范围。

## 输出契约

- 输出格式：中文 Markdown 安全报告。
- 每个发现项必须包含：漏洞类型、严重程度、文件路径、证据摘要、置信度、修复建议和待确认项。
- 严重程度使用 `Critical`、`High`、`Medium`、`Low` 或 `Info`。
- 证据摘要不得包含 API Key、密码、Token 或其他敏感值。
- 报告必须记录实际扫描范围、跳过项、依赖审计结果和扫描时间。
- 返回状态：`passed`、`partial`、`failed` 或 `cancelled`。

## 主 Skill 完成标准

1. 用户指定的扫描范围已执行，或已记录无法扫描、跳过和不支持的范围。
2. 已覆盖 Skill 声明的漏洞、依赖和敏感信息检测类别，不声称发现所有未知漏洞。
3. 所有发现项均包含类型、严重程度、路径、证据摘要、置信度和修复建议。
4. 依赖安全检查已按输入契约执行；未执行或失败时已明确记录原因和影响。
5. 敏感信息检测不输出具体秘密值，误报和待人工确认项已标记。
6. 安全报告已写入指定路径，且包含完整扫描结果和修复建议。
7. Critical/High 发现项均有明确的处置方案或升级建议。

## 完成后校验

在报告任务完成前必须逐项检查：

1. 实际扫描范围与 `scan_scope` 一致，未擅自扩大或缩小范围。
2. 四个原子 Skill 的结果均已汇总；跳过、失败和不支持项已记录影响。
3. 每个发现项包含漏洞类型、严重程度、路径、证据摘要、置信度和修复建议。
4. 报告和日志中不存在具体 API Key、密码、Token、Secret 或 `.env` 文件内容。
5. 依赖审计要求为强制时，审计失败不得报告 `passed`；非强制时至少返回 `partial` 并记录原因。
6. 输出报告存在、非空、可读取，Markdown 标题、表格和代码块结构完整。
7. 报告中的高危问题、误报和人工确认项与汇总结果一致。
8. 任一核心校验失败时不得报告 `passed`，应返回 `partial` 或 `failed`。

## 状态与错误处理

- `passed`：指定扫描、结果汇总、报告写入和完成后校验全部成功。
- `partial`：部分文件无法读取、非强制依赖审计失败、存在低置信度结果或待人工确认项，但报告可用。
- `failed`：目标路径无效、核心扫描失败、强制依赖审计失败、报告写入失败或校验失败。
- `cancelled`：用户取消扫描或报告输出，不覆盖已有结果。

依赖审计失败是否阻断流程取决于 `dependency_audit` 是否为强制要求；不得静默忽略用户明确要求的检查。

## 重试规则

- 每个原子skill失败后可重试 **3次**
- 重试间隔为指数退避：1s、4s、16s
- 依赖安全检查失败时：如果 `dependency_audit` 为强制要求，返回 `failed` 并阻断报告完成；否则记录失败原因并返回 `partial`。


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