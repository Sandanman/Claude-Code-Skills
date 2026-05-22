---
name: test-case-design
description: 设计测试用例，覆盖正常路径、边界条件、异常场景，在需要生成测试时触发
---

# Test Case Design

## 概述

Test Case Design 是测试生成流程的第一阶段，负责分析目标代码或需求文档，设计完整、可执行的测试用例集。设计覆盖三类场景：正常路径（Happy Path）、边界条件（Edge Cases）、异常场景（Error Scenarios）。每个测试用例包含：描述、输入数据、前置条件、预期输出、测试步骤、优先级。

## 核心能力

- **需求分析**: 解析函数签名、类型定义、业务逻辑，提取测试点
- **正常路径设计**: 设计覆盖所有主要功能分支的测试用例
- **边界条件设计**: 分析输入边界（空值、极大值、极小值、特殊字符）
- **异常场景设计**: 设计异常输入、超时、网络错误等异常场景的测试用例
- **测试优先级**: 标记 P0（核心功能）/P1（重要功能）/P2（次要功能）
- **测试数据设计**: 为每个用例设计具体的输入值和预期输出

## 输入

- **TargetCode**: 目标代码（函数、组件、模块路径）或需求描述
- **ProjectContext**: 项目技术栈和测试规范（如 CODE_STYLE.md 中有测试规范）
- **CoverageTarget**: 覆盖率目标（默认 80% 分支覆盖率）
- **TestType**: 测试类型（unit/integration/e2e，默认自动判断）

## 输出

- **TestCaseDesign**: 测试用例设计文档，包含所有用例的详细信息
- **TestCaseSummary**: 测试用例汇总表（名称、类型、优先级、预计执行时间）
- **CoveragePlan**: 覆盖率计划，列出需要覆盖的代码分支

**输出示例格式**:
```yaml
testCases:
  - id: TC-001
    name: "formatDate 正常格式化"
    type: unit
    priority: P0
    target: "src/utils/date.ts:formatDate"
    input:
      date: "2026-05-21"
      format: "YYYY-MM-DD"
    expected: "2026-05-21"
    testSteps:
      - "调用 formatDate('2026-05-21', 'YYYY-MM-DD')"
      - "断言返回值为 '2026-05-21'"
  - id: TC-002
    name: "formatDate 空字符串输入"
    type: unit
    priority: P1
    target: "src/utils/date.ts:formatDate"
    input:
      date: ""
      format: "YYYY-MM-DD"
    expected: "throw Error('Invalid date')"
    edgeCase: empty-string
  - id: TC-003
    name: "formatDate 无效日期格式"
    type: unit
    priority: P1
    target: "src/utils/date.ts:formatDate"
    input:
      date: "not-a-date"
      format: "YYYY-MM-DD"
    expected: "throw Error('Invalid date format')"
    edgeCase: invalid-format
```

## 执行逻辑

1. **代码解析**: 读取目标代码，分析函数签名、参数类型、返回值类型
2. **功能分解**: 将目标功能拆分为可测试的最小单元
3. **正常路径用例**: 为每个功能分支设计正常输入的测试用例
4. **边界条件用例**: 设计空值、零值、极大值、特殊字符等边界测试
5. **异常场景用例**: 设计无效输入、超出范围、异常抛出的测试
6. **优先级标记**: 根据功能重要性和影响范围标记优先级
7. **文档输出**: 生成结构化的测试用例设计文档

## 依赖关系

- 依赖: 无
- 被依赖: test-code-generation

## 完成标准

1. 每个函数/方法有至少 1 个正常路径测试用例
2. 每个参数有至少 1 个边界条件测试用例
3. 每个可能抛出异常的方法有至少 1 个异常场景测试
4. 所有用例有清晰的 input、expected、testSteps 描述
5. 生成 `test-cases-design.md` 并保存