---
name: requirement-evaluation
description: 全面评估需求完整性、一致性、可测试性，识别缺陷和风险。在测试用例生成后自动执行。
---

# Requirement Evaluation 原子Skill

## 概述
对需求的完整性、一致性、可测试性、安全性和可维护性进行全面评估，识别潜在缺陷、风险和改进点，确保需求质量达到可开发标准。

## 核心能力
- 评估需求完整性（是否缺少关键要素）
- 检测需求矛盾和冲突
- 评估可测试性（是否可验证）
- 识别安全风险（XSS、CSRF、SQL注入）
- 评估性能风险（大列表未分页）
- 评估可维护性（代码复杂度）
- 输出质量评分和改进建议

## 输入
test-case-generator输出的测试用例
function-flow-designer输出的流程设计
ui-component-identifier输出的UI组件清单
api-spec-designer输出的API规格

## 输出
需求评估报告，包含以下内容：

```json
{
  "score": 95,
  "issues": [
    {
      "type": "incomplete",
      "description": "缺少错误状态的处理，如登录失败后的提示信息未定义",
      "location": "api-spec.designer/response/error",
      "severity": "medium"
    }
  ],
  "recommendations": [
    "建议添加'记住我'功能，提升用户体验",
    "建议为密码字段添加强度提示"
  ],
  "completeness": {
    "modules_covered": 1,
    "total_modules": 1,
    "percentage": 100
  },
  "test_coverage": {
    "normal": 1,
    "exception": 1,
    "boundary": 0,
    "auth": 0,
    "total": 2,
    "coverage": "80%"
  },
  "risk_assessment": {
    "security": {
      "xss": false,
      "csrf": false,
      "sql_injection": false,
      "auth_bypass": false
    },
    "performance": {
      "large_list": false,
      "n_plus_one": false
    }
  }
}
```

## 评估维度

### 1. 完整性（Completeness）
| 检查项 | 检查内容 |
|--------|----------|
| 模块覆盖 | 所有模块都有需求描述、流程、UI、API、测试 |
| 输入验证 | 所有输入字段都有验证规则 |
| 异常处理 | 所有API调用都有错误响应 |
| 权限控制 | 所有敏感操作都有权限检查 |
| 交互反馈 | 所有操作都有加载/成功/失败反馈 |

### 2. 一致性（Consistency）
| 检查项 | 检查内容 |
|--------|----------|
| 命名一致 | 同一实体在UI、API、测试中命名一致 |
| 术语一致 | 不同文档使用相同术语 |
| 流程一致 | 流程图与测试用例一致 |

### 3. 可测试性（Testability）
| 检查项 | 检查内容 |
|--------|----------|
| 输入可控制 | 所有输入都有明确值 |
| 输出可观察 | 所有输出都可验证 |
| 状态可检测 | 所有状态变化可被检测 |

### 4. 安全风险（Security Risk）
| 风险 | 检查点 |
|------|--------|
| XSS | 是否使用v-html或innerHTML？ |
| CSRF | 是否有CSRF Token？ |
| SQL注入 | 是否拼接SQL？ |
| 认证绕过 | 是否有权限验证？ |

### 5. 性能风险（Performance Risk）
| 风险 | 检查点 |
|------|--------|
| 大列表 | 是否有分页？ |
| N+1查询 | 是否每个用户都发起单独请求？ |
| 频繁请求 | 是否有不必要的轮询？ |

### 6. 可维护性（Maintainability）
| 检查项 | 检查内容 |
|--------|----------|
| 代码复杂度 | 模块是否过于复杂？ |
| 重复代码 | 是否有重复逻辑？ |
| 依赖清晰 | 模块间依赖是否合理？ |

## 评分标准
| 评分 | 说明 |
|------|------|
| 90-100 | 需求完整、清晰、无缺陷，可直接开发 |
| 80-89 | 基本完整，有1-2个中等缺陷，建议修复 |
| 70-79 | 需求基本可用，但有多个缺陷，需重点修复 |
| <70 | 需求不完整，无法直接开发 |

## 执行逻辑
1. 接收所有上游输出
2. 按评估维度逐一检查
3. 标记每个检查项的结果
4. 计算综合评分
5. 生成问题列表和改进建议
6. 输出评估报告

## 依赖关系
- 依赖：test-case-generator + function-flow-designer + ui-component-identifier + api-spec-designer

## 完成标准
1. ✅ 完成所有6个维度的评估
2. ✅ 标记所有问题和风险
3. ✅ 提供具体改进建议
4. ✅ 计算综合评分
5. ✅ 输出完整的JSON格式数据

## 错误处理
- **缺少上游数据**：标记为"未提供，跳过评估"
- **评估冲突**：记录多个观点

## 示例

**输入**：
- 模块：用户登录
- 测试用例：正常登录、用户名为空
- API：POST /api/login，响应只有成功和401
- UI：表单（用户名、密码）、登录按钮

**评估**：
1. 完整性：缺少错误提示信息（如密码错误）→ 问题
2. 一致性：命名一致 → OK
3. 可测试性：有测试用例 → OK
4. 安全：无XSS风险 → OK
5. 性能：无风险 → OK
6. 可维护性：简单 → OK

**输出**：
```json
{
  "score": 85,
  "issues": [
    {
      "type": "incomplete",
      "description": "登录失败时，API响应有错误码，但UI未定义如何提示用户（如：密码错误）",
      "location": "ui-component-identifier/buttons",
      "severity": "medium"
    }
  ],
  "recommendations": [
    "建议添加'记住我'功能，提升用户体验",
    "建议为密码字段添加强度提示"
  ],
  "completeness": {"modules_covered": 1, "total_modules": 1, "percentage": 100},
  "test_coverage": {"normal": 1, "exception": 1, "boundary": 0, "auth": 0, "total": 2, "coverage": "80%"},
  "risk_assessment": {
    "security": {"xss": false, "csrf": false, "sql_injection": false, "auth_bypass": false},
    "performance": {"large_list": false, "n_plus_one": false}
  }
}
```

## 注意事项
- 评估必须客观，基于事实
- 问题必须具体，有定位
- 建议必须可操作
- 不提出技术实现建议，只提需求层面问题

## 原子skill位置
./.claude/skills/requirement-generator/atomic-skills/requirement-evaluation/SKILL.md
