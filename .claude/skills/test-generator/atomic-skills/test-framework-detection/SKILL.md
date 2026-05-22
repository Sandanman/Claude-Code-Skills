---
name: test-framework-detection
description: 检测项目使用的测试框架（Vitest、Jest、Playwright），在生成测试代码前触发
---

# Test Framework Detection

## 概述

Test Framework Detection 负责检测项目已使用的测试框架和相关工具，通过分析 package.json、配置文件和现有测试文件，确定项目使用的是 Vitest、Jest、Playwright、Cypress 还是其他框架。检测结果决定后续 test-code-generation 的代码语法和文件格式。

## 核心能力

- 检测单元测试框架（Vitest、Jest、Mocha + Chai）
- 检测 E2E 测试框架（Playwright、Cypress）
- 识别测试配置文件（vitest.config.ts、jest.config.js、playwright.config.ts）
- 识别测试文件规范（`__tests__/` 目录、`*.test.ts`、`.spec.ts` 后缀）
- 分析项目技术栈（Vue 3 + Vite 项目默认倾向 Vitest）
- 确定测试运行命令（`npm test` 脚本配置）

## 输入

- **ProjectRoot**: 项目根目录路径
- **PackageJSON**: package.json 内容（如果已读取）
- **FrameworkHint**: 用户指定的框架偏好（可选参数）

## 输出

- **DetectedFramework**: 检测到的测试框架信息
- **FrameworkVersion**: 框架版本号
- **ConfigFile**: 测试配置文件路径
- **TestFilePattern**: 测试文件命名规范（`*.test.ts` 或 `*.spec.ts`）
- **TestDirectory**: 测试目录（`__tests__/` 或 `test/`）
- **TestCommands**: 测试相关 npm 脚本（test、test:unit、test:e2e 等）

**输出示例格式**:
```json
{
  "detectedAt": "2026-05-21T10:00:00Z",
  "unitFramework": {
    "name": "vitest",
    "version": "1.3.0",
    "configFile": "vitest.config.ts",
    "testPattern": "*.test.ts",
    "testDirectory": "__tests__",
    "commands": ["npm run test", "npm run test:unit"],
    "additionalMatchers": ["@vitest/matchers"]
  },
  "e2eFramework": {
    "name": "playwright",
    "version": "1.42.0",
    "configFile": "playwright.config.ts"
  },
  "confidence": 0.95,
  "detectionSource": "package.json + vitest.config.ts"
}
```

## 执行逻辑

1. **package.json 分析**: 检查 devDependencies 中的测试框架
2. **配置文件扫描**: 查找 vitest.config.ts、jest.config.js、cypress.config.ts 等
3. **测试目录检查**: 检查 `__tests__/`、`test/`、`tests/` 目录
4. **现有测试文件分析**: 读取现有测试文件，分析 import 语句确定框架
5. **技术栈推断**: Vue + Vite 项目默认使用 Vitest，React 项目默认使用 Jest
6. **版本获取**: 从 package.json 或 node_modules 读取框架版本
7. **配置输出**: 输出完整的检测结果和测试命令

## 依赖关系

- 依赖: 无
- 被依赖: test-code-generation

## 完成标准

1. 成功识别单元测试框架（Vitest/Jest/Mocha 其中之一）
2. 如项目配置了 E2E 测试，识别对应的框架（Playwright/Cypress）
3. 输出正确的测试文件命名规范和测试目录
4. 识别所有测试相关 npm 脚本
5. 置信度 >= 0.8（可通过 FrameworkHint 参数覆盖）