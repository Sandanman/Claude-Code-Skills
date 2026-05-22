---
name: test-generator
description: 根据现有代码或需求自动生成测试用例，覆盖单元测试、集成测试和E2E测试，支持主流测试框架（Vitest、Jest、Playwright）
---

# Test Generator

## 概述

Test Generator 是前端项目的自动化测试生成技能，通过4个原子技能协同工作，从测试用例设计、框架检测、测试代码生成到验证确认，完整覆盖测试生成流程。支持 Vue/React 组件测试、API 集成测试、E2E 交互测试，适配 Vitest、Jest、Playwright、Cypress 等主流框架。

## 核心能力

- 分析源码和需求文档，设计覆盖正常路径、边界条件、异常场景的测试用例
- 自动检测项目已使用的测试框架和测试工具
- 生成符合项目规范的测试代码（单元测试/集成测试/E2E测试）
- 验证测试代码语法正确且可执行（无运行时错误）
- 支持测试覆盖分析，识别未覆盖的代码分支

## 执行流程

1. **test-case-design** - 设计测试用例，覆盖正常路径、边界条件、异常场景
2. **test-framework-detection** - 检测项目使用的测试框架（Vitest、Jest、Playwright）
3. **test-code-generation** - 根据测试用例设计生成测试代码
4. **test-verification** - 验证测试代码的正确性，确保测试可运行

## 原子skill依赖关系

- **test-case-design**: 无依赖
- **test-framework-detection**: 无依赖
- **test-code-generation**: 依赖 test-case-design, test-framework-detection
- **test-verification**: 依赖 test-code-generation

## 主skill完成标准

1. 成功分析目标代码或需求，设计出完整的测试用例
2. 测试用例覆盖正常路径、边界条件、异常场景三类场景
3. 检测到正确的测试框架并使用对应语法生成代码
4. 测试代码语法正确，无 TypeScript/ESLint 错误
5. 测试代码可执行（至少能通过 `npm run test` 的语法检查）
6. 生成测试文件保存到正确的目录位置（`__tests__/` 或 `test/`）

## 重试规则

- 每个原子skill失败后可重试 **3次**
- test-framework-detection 失败后使用默认框架（Vitest）
- test-code-generation 失败后重试时简化测试用例

## 触发关键词

- 生成测试
- 测试用例
- 单元测试
- 集成测试
- E2E测试
- 添加测试
- 测试覆盖
- 写测试
- 为xxx写测试

## 注意事项

- 生成测试代码前先检查项目是否有 `vitest.config.ts` 或 `jest.config.js`
- E2E 测试需要项目有对应的页面路由
- 生成的测试代码需要人工review，不自动执行完整测试套件
- 边界条件和异常场景的测试用例设计需结合业务逻辑

## 文件系统位置

- 主skill路径: ./.claude/skills/test-generator/SKILL.md
- 原子skill路径: ./.claude/skills/test-generator/atomic-skills/下各子目录