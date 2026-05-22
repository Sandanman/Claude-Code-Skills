# Test Generator

## 概述

Test Generator 是前端项目的自动化测试生成技能，根据现有代码或需求文档自动生成测试用例，支持单元测试、集成测试和 E2E 测试，覆盖 Vitest、Jest、Playwright、Cypress 等主流测试框架。

## 核心能力

- **智能用例设计**: 分析代码逻辑，自动设计正常路径、边界条件、异常场景的测试用例
- **框架自动适配**: 检测项目测试框架，使用对应语法生成代码
- **全面场景覆盖**: 覆盖 Happy Path、Edge Cases、Error Scenarios 三类测试场景
- **可执行代码**: 生成的测试代码语法正确，可直接运行
- **覆盖分析**: 识别未覆盖的代码分支，建议补充用例

## 适用场景

- 为新功能编写单元测试
- 为现有代码补充测试覆盖
- 快速生成 E2E 测试骨架代码
- 重构前的测试用例设计

## 原子技能列表

| 原子技能 | 职责 |
|---------|------|
| test-case-design | 设计测试用例，覆盖正常路径、边界条件、异常场景 |
| test-framework-detection | 检测项目使用的测试框架（Vitest、Jest、Playwright） |
| test-code-generation | 根据测试用例设计生成测试代码 |
| test-verification | 验证测试代码的正确性，确保测试可运行 |

## 执行流程图

```
test-case-design ─┐
                  │
test-framework-detection ─→ test-code-generation → test-verification
```

## 输出产物

- `test-cases-design.md` - 测试用例设计文档
- `__tests__/*.test.ts` - 生成的测试代码文件
- `test-coverage-report.md` - 测试覆盖分析报告

## 快速开始

```bash
# 通过 orchestrator 触发
# 用户: "为 src/utils/date.ts 写单元测试"
# 用户: "生成这个登录模块的集成测试"

# 或直接指定目标
# 用户: "用 Vitest 格式为这个组件生成测试"
```