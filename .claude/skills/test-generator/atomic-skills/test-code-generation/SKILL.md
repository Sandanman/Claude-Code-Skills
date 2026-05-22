---
name: test-code-generation
description: 根据测试用例设计生成测试代码，在完成用例设计和框架检测后触发
---

# Test Code Generation

## 概述

Test Code Generation 是测试生成的核心阶段，接收 test-case-design 输出的测试用例和 test-framework-detection 检测到的框架信息，生成符合项目规范的测试代码。支持生成单元测试、集成测试和 E2E 测试，代码语法与项目框架完全匹配。

## 核心能力

- **Vitest 代码生成**: 生成 `describe`/`it`/`expect` 语法的 Vitest 测试代码
- **Jest 代码生成**: 生成兼容 Jest 的测试代码（含 beforeEach、mock 等）
- **Playwright 代码生成**: 生成 Page Object 模式的 E2E 测试代码
- **Vue 组件测试**: 生成 @vue/test-utils 的 mount/shallowMount 测试代码
- **API 集成测试**: 生成 supertest 或 MSW 的 API 测试代码
- **Mock 自动化**: 自动生成函数 mock、模块 mock、API mock

## 输入

- **TestCaseDesign**: test-case-design 输出的测试用例设计文档
- **DetectedFramework**: test-framework-detection 输出的框架检测结果
- **SourceCodeContext**: 目标代码的完整源码（用于解析类型和依赖）
- **GenerationConfig**: 生成配置（是否生成 mock、是否包含注释、代码风格）

## 输出

- **GeneratedTestFiles**: 生成的测试代码文件列表
- **TestFileMap**: 测试文件与源码文件的映射关系
- **MockDefinitions**: 自动生成的 mock 函数和模块定义
- **ImportStatements**: 生成的 import 语句（确保路径正确）

**输出示例格式**:
```typescript
// src/__tests__/date.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { formatDate, parseDate } from '../utils/date'

describe('date utils', () => {
  describe('formatDate', () => {
    it('正常格式化 YYYY-MM-DD', () => {
      const result = formatDate('2026-05-21', 'YYYY-MM-DD')
      expect(result).toBe('2026-05-21')
    })

    it('空字符串输入应抛出错误', () => {
      expect(() => formatDate('', 'YYYY-MM-DD')).toThrow('Invalid date')
    })

    it('无效日期格式应抛出错误', () => {
      expect(() => formatDate('not-a-date', 'YYYY-MM-DD')).toThrow('Invalid date format')
    })
  })
})
```

## 执行逻辑

1. **模板选择**: 根据检测到的框架选择对应代码模板
2. **用例遍历**: 遍历所有测试用例，转换为对应语法的测试代码
3. **类型解析**: 读取源码中的 TypeScript 类型定义，确保测试代码类型正确
4. **Mock 生成**: 为外部依赖（API、模块）生成 mock 定义
5. **Import 生成**: 生成正确的相对路径 import 语句
6. **路径决策**: 确定测试文件保存路径（基于测试文件规范）
7. **代码写入**: 生成完整的测试文件内容

## 依赖关系

- 依赖: test-case-design, test-framework-detection
- 被依赖: test-verification

## 完成标准

1. 所有 P0 和 P1 测试用例都有对应的测试代码
2. 测试代码语法正确（TypeScript 类型无误、import 路径正确）
3. 使用检测到的框架的官方语法（不用其他框架语法）
4. 测试文件保存到正确的目录（`__tests__/` 或 `test/`）
5. 每个生成的测试文件至少包含 3 个测试用例
6. 生成 `generated-test-files.json` 列出所有文件