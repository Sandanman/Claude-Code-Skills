---
name: requirement-evaluation
description: 全面评估需求完整性、一致性、可测试性、安全性、可行性、紧急度，识别缺陷和风险。在测试用例生成后自动执行。v1.2新增 feasibility_score 和 urgency_score（7维度）。
---

# Requirement Evaluation 原子 Skill（v1.2 - 7维度评估版）

## 概述
对需求的7个维度进行全面评估，识别潜在缺陷、风险和改进点。**v1.2新增 feasibility_score（可行性）和 urgency_score（紧急度），形成7维度评估体系。**

## τ 预算
- simple：300 token
- moderate：600 token
- complex：1000 token

## 核心能力
- 评估需求完整性（是否缺少关键要素）
- 检测需求矛盾和冲突
- 评估需求一致性（命名/术语/流程一致）
- 评估可测试性（输入可控/输出可观察/状态可检测）
- 识别安全风险（XSS、CSRF、SQL注入）
- **评估可行性（技术可行性、依赖可满足性）（新增 v1.2）**
- **评估紧急度（业务优先级、截止时间压力）（新增 v1.2）**
- 评估性能风险（大列表未分页）
- 输出质量评分报告（含 7 个维度）

## 输入
- **K2栈叠**：优先从共享上下文 `task_skill.md` 读取上游 skill 输出
- test-case-generator 输出的测试用例
- design-designer（原 function-flow-designer + ui-component-identifier 折叠合并）输出的流程+UI
- api-spec-designer 输出的API规格

## 输出
需求评估报告（7维度 v1.2）：

```json
{
  "overall_score": 92,
  "completeness_score": 98,
  "consistency_score": 95,
  "testability_score": 90,
  "security_score": 100,
  "feasibility_score": 88,
  "urgency_score": 72,
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
    "modules_covered": 1, "total_modules": 1, "percentage": 100,
    "fields_with_validation": 2, "total_fields": 2,
    "api_with_error_response": 1, "total_apis": 1
  },
  "consistency_detail": {
    "naming_consistent": true, "terminology_consistent": true, "flow_consistent": true
  },
  "testability_detail": {
    "input_controllable": true, "output_observable": true, "state_detectable": true,
    "test_cases_coverage": "80%"
  },
  "security_detail": {
    "xss_risk": false, "csrf_risk": false, "sql_injection_risk": false, "auth_bypass_risk": false
  },
  "feasibility_detail": {
    "tech_feasible": true,
    "dependencies_satisfiable": true,
    "external_apis_available": true,
    "complexity_manageable": true
  },
  "urgency_detail": {
    "business_priority": "high",
    "has_deadline": false,
    "impact_scope": "single_user"
  },
  "risk_assessment": {
    "security": { "xss": false, "csrf": false, "sql_injection": false, "auth_bypass": false },
    "performance": { "large_list": false, "n_plus_one": false }
  }
}
```

## 多维度 Quality Score 评估体系（v1.2 - 7维度）

### 1. overall_score（综合评分）
> 公式：`overall = weighted_average(completeness×0.25 + consistency×0.15 + testability×0.2 + security×0.2 + feasibility×0.1 + urgency×0.1)`
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

### 3. consistency_score（一致性）
| 检查项 | 检查内容 |
|--------|----------|
| 命名一致 | 同一实体在UI、API、测试中命名一致（如 `username` vs `userName`） |
| 术语一致 | 不同文档使用相同术语 |
| 流程一致 | 流程图与测试用例一致 |
| sub-flow 一致 | sub_flow 与主流程节点关联正确 |

### 4. testability_score（可测试性）
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

### 6. feasibility_score（可行性，**新增 v1.2**）
| 检查项 | 检查内容 |
|--------|----------|
| tech_feasible | 当前技术栈是否支持（框架、库版本） |
| dependencies_satisfiable | 所有外部依赖是否可满足 |
| external_apis_available | 调用的外部API是否可用 |
| complexity_manageable | 实现复杂度是否在可接受范围内 |
> 评估目标：识别技术上无法实现的需求，避免后续返工

### 7. urgency_score（紧急度，**新增 v1.2**）
| 检查项 | 检查内容 |
|--------|----------|
| business_priority | 业务优先级（high/medium/low） |
| has_deadline | 是否有明确截止时间 |
| impact_scope | 影响范围（entire_product/single_module/single_user） |
> 评估目标：为开发排序提供依据（与 quality score 共同决定开发优先级）

### performance_risk（性能风险）
| 风险 | 检查点 |
|------|--------|
| 大列表 | 是否有分页？ |
| N+1查询 | 是否每个用户都发起单独请求？ |
| 频繁请求 | 是否有不必要的轮询？ |

## 执行逻辑
1. **K2栈叠**：优先从共享上下文 `task_skill.md` 读取所有上游skill输出
2. 按7个评估维度逐一检查
3. 标记每个检查项的结果
4. 计算综合评分（7维度加权平均，详见公式）
5. 生成问题列表和改进建议
6. 输出评估报告

## 依赖关系（v1.2）
- **K2栈叠**：优先从共享上下文 `task_skill.md` 读取上游skill输出
- 依赖：design-designer（原 function-flow-designer + ui-component-identifier 折叠合并）+ api-spec-designer + test-case-generator

## 完成标准（v1.2）
1. 完成所有7个维度的评估
2. 标记所有问题和风险
3. 提供具体改进建议
4. 计算综合评分（7维度加权平均）
5. 输出完整的JSON格式数据（含 feasibility_detail 和 urgency_detail）

## 示例

**输入**：
- 模块：用户登录
- 测试用例：正常登录、用户名为空、密码为空
- API：POST /api/login，响应只有成功和401
- UI：表单（用户名、密码）、登录按钮
- sub_flow：表单验证子流程

**评估（7维度）**：
1. completeness：缺少错误提示信息（如密码错误）→ completeness_score -5
2. consistency：命名一致 → consistency_score 100
3. testability：有测试用例，边界明确 → testability_score 高
4. security：无 XSS 风险 → security_score 100
5. feasibility：技术可行，依赖满足 → feasibility_score 95
6. urgency：业务优先级高，无截止时间 → urgency_score 80
7. overall：weighted_average → overall_score 92

**输出**：
```json
{
  "overall_score": 92,
  "completeness_score": 90,
  "consistency_score": 100,
  "testability_score": 95,
  "security_score": 100,
  "feasibility_score": 95,
  "urgency_score": 80,
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
  "feasibility_detail": {
    "tech_feasible": true, "dependencies_satisfiable": true,
    "external_apis_available": true, "complexity_manageable": true
  },
  "urgency_detail": {
    "business_priority": "high", "has_deadline": false, "impact_scope": "single_user"
  }
}
```

## 注意事项
- 评估必须客观，基于事实
- 问题必须具体，有定位
- 建议必须可操作
- 不提出技术实现建议，只提需求层面问题
- **K2栈叠**：优先从共享上下文读取上游输出

## 版本
v1.2 - 7维度评估版：新增 feasibility_score（可行性）和 urgency_score（紧急度），K2技能栈叠，τ 预算管理