---
name: security-report
description: 汇总安全扫描结果，生成安全报告，在所有扫描完成后触发
---

# Security Report

## 概述

Security Report 是安全扫描流程的收尾阶段，负责汇总来自 vulnerability-scan、dependency-security-check 和 sensitive-info-detection 三个原子技能的结果，生成结构化的综合安全报告。报告按严重程度分级，包含每项发现的风险描述、文件位置、修复建议，并提供总体安全评分和风险评估摘要。

## 核心能力

- **结果聚合**: 合并三个扫描来源的所有发现项，去重并归类
- **严重程度分级**: 按 Critical/High/Medium/Low 四级分级评估
- **风险排名**: 按风险程度排序，Critical 最优先
- **修复建议**: 为每个发现项提供具体的修复步骤和代码示例
- **总体评分**: 计算项目安全评分（100分制）
- **多格式输出**: 支持 JSON（CI集成）、Markdown（人工审查）、HTML（可视化）格式
- **历史对比**: 与上次扫描结果对比，展示新增/已修复的漏洞

## 输入

- **VulnerabilityFindings**: vulnerability-scan 的漏洞发现结果
- **DependencyAuditReport**: dependency-security-check 的依赖审计报告
- **SensitiveFindings**: sensitive-info-detection 的敏感信息发现结果
- **PreviousScanReport**: 上次扫描报告（用于历史对比，可选）
- **ReportConfig**: 报告配置（输出格式、是否包含修复代码示例、是否生成摘要邮件）

## 输出

- **SecurityScanReport**: 综合安全报告（Markdown格式，可读性好）
- **SecurityFindingsJSON**: 结构化发现数据（JSON格式，适合CI集成）
- **SecurityScore**: 安全评分（0-100）
- **RiskSummary**: 风险摘要（Critical/High/Medium/Low 数量统计）
- **FixSuggestions**: 修复建议清单

**输出示例格式**:
```json
{
  "reportTime": "2026-05-21T10:10:00Z",
  "project": "vue-meeting-app",
  "securityScore": 78,
  "scoreGrade": "B",
  "totalFindings": 11,
  "bySeverity": {
    "critical": 0,
    "high": 3,
    "medium": 5,
    "low": 3
  },
  "byCategory": {
    "vulnerability": 5,
    "dependency": 3,
    "sensitiveInfo": 3
  },
  "topRisks": [
    {
      "id": "VULN-001",
      "severity": "high",
      "title": "dangerouslySetInnerHTML XSS 漏洞",
      "file": "src/components/Editor.vue:42",
      "fixSuggestion": "使用 DOMPurify.sanitize(userContent)"
    }
  ],
  "remediationPlan": [
    {
      "priority": 1,
      "action": "升级 lodash@4.17.21 修复命令注入漏洞",
      "effort": "low",
      "breakingChangeRisk": "none"
    }
  ],
  "trend": {
    "vsPreviousScan": "improved",
    "fixedCount": 2,
    "newCount": 1
  }
}
```

## 执行逻辑

1. **数据聚合**: 合并三个来源的所有发现项
2. **去重处理**: 相同文件相同类型的发现合并
3. **分级评估**: 按 Critical > High > Medium > Low 排序
4. **评分计算**: 基于漏洞数量和严重程度计算安全评分
5. **修复建议**: 为每个 High+ 漏洞生成修复代码示例
6. **格式生成**: 生成 Markdown 报告、JSON 数据、HTML 报告
7. **归档保存**: 保存报告到 `.claude/outputs/security/` 目录

## 依赖关系

- 依赖: vulnerability-scan, dependency-security-check, sensitive-info-detection
- 被依赖: 无（主skill终点）

## 完成标准

1. 所有三个来源的发现项均已汇总，无遗漏
2. 报告包含所有发现项的 severity、description、fixSuggestion
3. Critical 和 High 漏洞数量为 0，或有明确的修复计划
4. 安全评分计算合理（无 High 漏洞时评分 >= 80）
5. 生成 Markdown、JSON 两种格式的报告
6. 报告保存到 `.claude/outputs/security/security-report-{date}.md`