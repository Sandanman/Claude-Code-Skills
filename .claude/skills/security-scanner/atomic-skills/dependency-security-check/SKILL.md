---
name: dependency-security-check
description: 检查依赖包的安全漏洞（npm audit），在依赖安全检查时触发
---

# Dependency Security Check

## 概述

Dependency Security Check 负责检查项目依赖树中的安全漏洞，通过运行 `npm audit` 读取 npm 官方漏洞数据库，对比项目中所有直接依赖和间接依赖的版本，识别已知 CVE 漏洞。同时分析漏洞的可利用性、修复版本和修复路径，提供升级或替换建议。

## 核心能力

- 运行 `npm audit --json` 获取完整的依赖漏洞报告
- 解析漏洞数据，提取 CVE 编号、严重程度、影响版本范围
- 分析漏洞可利用性（是否需要用户交互、网络可达性等）
- 生成依赖升级建议（优先升级直接依赖，次选间接依赖）
- 支持 .npmrc 配置忽略特定漏洞（需人工确认是否合理）

## 输入

- **ProjectRoot**: 项目根目录路径
- **PackageManager**: 包管理器类型（npm/yarn/pnpm，默认自动检测）
- **IgnoreList**: 需要忽略的漏洞 ID 列表（白名单配置）
- **AuditLevel**: 审计级别（moderate/high/critical，默认 moderate）

## 输出

- **DependencyAuditReport**: npm audit 的完整报告（JSON格式）
- **VulnerablePackagesSummary**: 有漏洞的包汇总（按严重程度分组）
- **UpgradeRecommendations**: 依赖升级建议清单
- **AdvisoryDetails**: 每个漏洞的详细信息（CVE、影响版本、修复版本）

**输出示例格式**:
```json
{
  "auditTime": "2026-05-21T10:01:00Z",
  "packageManager": "npm",
  "totalVulnerabilities": 8,
  "critical": 0,
  "high": 2,
  "medium": 4,
  "low": 2,
  "vulnerablePackages": [
    {
      "package": "lodash",
      "version": "4.17.15",
      "advisoryId": "1755",
      "severity": "high",
      "cve": "CVE-2021-23337",
      "title": "Command Injection",
      "url": "https://www.npmjs.com/advisories/1755",
      "fixVersion": ">=4.17.21",
      "upgradePath": "lodash@4.17.21"
    }
  ],
  "upgradeRecommendations": [
    {
      "package": "lodash",
      "currentVersion": "4.17.15",
      "recommendedVersion": "4.17.21",
      "breakingChangeRisk": "low"
    }
  ]
}
```

## 执行逻辑

1. **环境检查**: 确认 package-lock.json 存在且是最新的
2. **Audit 执行**: 运行 `npm audit --json` 或等效的 yarn/pnpm 命令
3. **结果解析**: 解析 JSON 输出，提取漏洞列表和元数据
4. **信息增强**: 查询 npm API 获取每个漏洞的 CVE 编号和修复版本
5. **升级路径计算**: 计算从当前版本到修复版本的升级路径
6. **Break Change 评估**: 检查大版本升级是否可能引入破坏性变更
7. **报告生成**: 生成结构化的依赖安全报告

## 依赖关系

- 依赖: 无
- 被依赖: security-report

## 完成标准

1. npm/yarn/pnpm audit 命令成功执行并返回结果
2. 所有漏洞按 Critical/High/Medium/Low 分级
3. 每个高危（High+）漏洞有对应的 upgradePath
4. 如存在 Critical 漏洞，必须明确标注且不可忽略
5. 生成 `dependency-audit-report.json` 保存结果