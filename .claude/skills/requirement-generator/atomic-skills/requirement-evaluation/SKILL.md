---
name: requirement-evaluation
description: 全面评估需求完整性、一致性、可测试性、安全性和可维护性，识别缺陷和风险。在测试用例生成后自动执行。改进版新增多维度 quality.score（completeness/consistency/testability/security）。
---

# Requirement Evaluation 原子 Skill（改进版 v1.1）

## 概述
对需求的完整性、一致性、可测试性、安全性和可维护性进行全面评估，识别潜在缺陷、风险和改进点。**改进版新增多维度 quality.score 体系（completeness/consistency/testability/security），提供更全面的质量评估。**

## 核心能力
- 评估需求完整性（是否缺少关键要素）
- 检测需求矛盾和冲突
- 评估可测试性（是否可验证）
- **评估需求一致性（命名/术语/流程一致）（新增 v1.1）**
- 识别安全风险（XSS、CSRF、SQL注入）
- **评估可测试性（输入可控/输出可观察/状态可检测）（增强 v1.1）**
- 评估性能风险（大列表未分页）
- 输出质量评分报告（含 5 个维度）

## 输入
test-case-generator 输出的测试用例
function-flow-designer 输出的流程设计
ui-component-identifier 输出的UI组件清单
api-spec-designer 输出的API规格

## 输出
需求评估报告，包含以下内容：

```json
{
  "overall_score": 92,
  "completeness_score": 98,
  "consistency_score": 95,
  "testability_score": 90,
  "security_score": 100,
  "issues": [
    {
      "type": "incomplete",
      "description": "缺少错误状态的处理，如登录失败后的提示信息未定义",
      "location": "api_spec.response.error",
      "severity": "medium",
      "dimension": "completeness"
    }
  ],
  "recommendations": [
    "建议添加'记住我'功能，提升用户体验",
    "建议为密码字段添加强度提示"
  ],
  "completeness_detail": {
    "modules_covered": 1,
    "total_modules": 1,
    "percentage": 100,
    "fields_with_validation": 2,
    "total_fields": 2,
    "api_with_error_response": 1,
    "total_apis": 1
  },
  "consistency_detail": {
    "naming_consistent": true,
    "terminology_consistent": true,
    "flow_consistent": true
  },
  "testability_detail": {
    "input_controllable": true,
    "output_observable": true,
    "state_detectable": true,
    "test_cases_coverage": "80%"
  },
  "security_detail": {
    "xss_risk": false,
    "csrf_risk": false,
    "sql_injection_risk": false,
    "auth_bypass_risk": false
  },
  "risk_assessment": {
    "security": { "xss": false, "csrf": false, "sql_injection": false, "auth_bypass": false },
    "performance": { "large_list": false, "n_plus_one": false }
  }
}
```

## 多维度 Quality Score 评估体系（**新增 v1.1**）

### 1. overall_score（综合评分）
| 评分 | 说明 |
|------|------|
| 90-100 | 需求完整、清晰、无缺陷，可直接开发 |
| 80-89 | 基本完整，有1-2个中等缺陷，建议修复 |
| 70-79 | 需求基本可用，但有多个缺陷，需重点修复 |
| <70 | 需求不完整，无法直接开发 |

### 2. completeness_score（完整性）
| 检查项 | 检查内容 |
|--------|----------|
| 模块覆盖 | 所有模块都有需求描述、流程、UI、API、测试 |
| 字段覆盖 | 所有表单字段都有验证规则 |
| 异常处理 | 所有API调用都有错误响应 |
| 权限控制 | 所有敏感操作都有权限检查 |
| 交互反馈 | 所有操作都有加载/成功/失败反馈 |

### 3. consistency_score（一致性，**新增 v1.1**）
| 检查项 | 检查内容 |
|--------|----------|
| 命名一致 | 同一实体在UI、API、测试中命名一致（如 `username` vs `userName`） |
| 术语一致 | 不同文档使用相同术语 |
| 流程一致 | 流程图与测试用例一致 |
| sub-flow 一致 | sub_flow 与主流程节点关联正确 |

### 4. testability_score（可测试性，**增强 v1.1**）
| 检查项 | 检查内容 |
|--------|----------|
| 输入可控 | 所有输入都有明确值 |
| 输出可观察 | 所有输出都可验证 |
| 状态可检测 | 所有状态变化可被检测 |
| 边界条件明确 | 字段最大/最小值、长度限制已定义 |

### 5. security_score（安全性）
| 风险 | 检查点 |
|------|--------|
| XSS | 是否使用 v-html 或 innerHTML？ |
| CSRF | 是否有 CSRF Token？ |
| SQL注入 | 是否拼接 SQL？ |
| 认证绕过 | 是否有权限验证？ |

### 6. performance_risk（性能风险）
| 风险 | 检查点 |
|------|--------|
| 大列表 | 是否有分页？ |
| N+1查询 | 是否每个用户都发起单独请求？ |
| 频繁请求 | 是否有不必要的轮询？ |

## 执行逻辑
1. 接收所有上游输出
2. 按评估维度逐一检查
3. 标记每个检查项的结果
4. 计算综合评分（5个维度）
5. 生成问题列表和改进建议
6. 输出评估报告

## 依赖关系
- 依赖：test-case-generator + function-flow-designer + ui-component-identifier + api-spec-designer

## 完成标准
1. 完成所有5个维度的评估
2. 标记所有问题和风险
3. 提供具体改进建议
4. 计算综合评分（5个维度）
5. 输出完整的JSON格式数据

## 示例

**输入**：
- 模块：用户登录
- 测试用例：正常登录、用户名为空、密码为空
- API：POST /api/login，响应只有成功和401
- UI：表单（用户名、密码）、登录按钮
- sub_flow：表单验证子流程

**评估**：
1. completeness：缺少错误提示信息（如密码错误）→ completeness_score -5
2. consistency：命名一致 → consistency_score 100
3. testability：有测试用例，边界明确 → testability_score 高
4. security：无 XSS 风险 → security_score 100
5. overall：average → overall_score 92

**输出**：
```json
{
  "overall_score": 92,
  "completeness_score": 90,
  "consistency_score": 100,
  "testability_score": 95,
  "security_score": 100,
  "issues": [
    {
      "type": "incomplete",
      "description": "登录失败时，API响应有错误码，但UI未定义如何提示用户（如：密码错误）",
      "location": "ui_component.buttons",
      "severity": "medium",
      "dimension": "completeness"
    }
  ],
  "recommendations": [
    "建议添加'记住我'功能，提升用户体验",
    "建议为密码字段添加强度提示"
  ],
  "completeness_detail": {
    "modules_covered": 1, "total_modules": 1, "percentage": 100,
    "fields_with_validation": 2, "total_fields": 2,
    "api_with_error_response": 1, "total_apis": 1
  },
  "consistency_detail": {
    "naming_consistent": true, "terminology_consistent": true, "flow_consistent": true
  },
  "testability_detail": {
    "input_controllable": true, "output_observable": true, "state_detectable": true, "test_cases_coverage": "100%"
  },
  "security_detail": {
    "xss_risk": false, "csrf_risk": false, "sql_injection_risk": false, "auth_bypass_risk": false
  }
}
```

## 注意事项
- 评估必须客观，基于事实
- 问题必须具体，有定位
- 建议必须可操作
- 不提出技术实现建议，只提需求层面问题

## 版本
v1.1 - 改进版：新增多维度 quality.score 体系（completeness_score、consistency_score、testability_score、security_score），扩展 evaluation 维度