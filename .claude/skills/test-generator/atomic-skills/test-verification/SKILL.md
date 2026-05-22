---
name: test-verification
description: 验证测试代码的正确性，确保测试可运行，在生成测试代码后触发
---

# Test Verification

## 概述

Test Verification 负责验证生成的测试代码的正确性和可执行性。通过静态分析（TypeScript 类型检查、ESLint 语法验证）和动态验证（运行测试文件语法检查），确保生成的测试代码可以直接运行，不会在执行时因语法错误或类型错误失败。

## 核心能力

- **TypeScript 类型检查**: 运行 `tsc --noEmit` 验证类型正确性
- **ESLint 语法验证**: 运行 ESLint 检查测试代码语法和最佳实践
- **Import 路径验证**: 验证所有 import 路径是否正确（文件存在）
- **测试语法验证**: 运行框架自带的语法检查（`vitest --run --no-coverage` 或 `jest --verify`)
- **可运行性检查**: 尝试运行测试套件，确保没有运行时错误
- **Mock 完整性验证**: 检查 mock 函数是否正确配置

## 输入

- **GeneratedTestFiles**: test-code-generation 输出的测试文件列表
- **ProjectContext**: 项目根目录和技术栈信息
- **VerificationConfig**: 验证配置（是否运行测试、是否检查类型、详细程度）
- **DetectedFramework**: 检测到的测试框架信息

## 输出

- **VerificationReport**: 验证报告，包含每项检查的结果
- **SyntaxErrors**: 语法错误列表（如有）
- **TypeErrors**: 类型错误列表（如有）
- **ImportErrors**: Import 路径错误列表（如有）
- **TestExecutionResult**: 测试执行结果（PASS/FAIL/SKIP）
- **VerificationSummary**: 验证摘要（总检查项、通过率、是否可提交）

**输出示例格式**:
```json
{
  "verificationTime": "2026-05-21T10:05:00Z",
  "totalFiles": 3,
  "passedFiles": 3,
  "failedFiles": 0,
  "checks": [
    {
      "checkType": "typescript",
      "file": "src/__tests__/date.test.ts",
      "status": "PASS",
      "errors": []
    },
    {
      "checkType": "import",
      "file": "src/__tests__/date.test.ts",
      "status": "PASS",
      "errors": []
    },
    {
      "checkType": "vitest-verify",
      "file": "src/__tests__/date.test.ts",
      "status": "PASS",
      "errors": []
    }
  ],
  "overallStatus": "PASS",
  "summary": "所有测试文件验证通过，可以运行"
}
```

## 执行逻辑

1. **文件遍历**: 遍历所有生成的测试文件
2. **TypeScript 检查**: 运行 `tsc --noEmit` 检查类型错误
3. **Import 路径检查**: 验证每个 import 路径对应的文件是否存在
4. **ESLint 检查**: 运行 ESLint 验证语法和最佳实践
5. **框架验证**: 运行框架自带的验证命令（`vitest --run --no-coverage` 等）
6. **错误聚合**: 汇总所有错误，按严重程度分级
7. **报告生成**: 生成验证报告，标记通过/失败文件

## 依赖关系

- 依赖: test-code-generation
- 被依赖: 无（主skill终点）

## 完成标准

1. 所有测试文件通过 TypeScript 类型检查（无 type error）
2. 所有 import 路径正确（无 Module not found 错误）
3. 测试文件不包含 ESLint 错误（warning 可以接受）
4. 框架语法验证通过（`vitest --run` 等命令不报语法错误）
5. 生成 `test-verification-report.json` 记录验证结果
6. 总体状态为 PASS 或仅有 LOW 级别 warning