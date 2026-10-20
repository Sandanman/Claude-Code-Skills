---
name: optimization-verification
description: 验证优化后的功能正确性、代码质量和性能变化，使用 Before/After 对比生成可复现的 PASS、PARTIAL 或 FAIL 报告。
version: 2.0
---

# Optimization Verification 原子 Skill

## 概述

对已应用的优化执行功能回归、语法/类型/构建检查、安全检查以及质量和性能对比，客观记录实际结果。

## 核心能力

- 运行项目已有的单元、集成、E2E、lint、类型检查和构建命令
- 复测基准并对比复杂度、重复率、Bundle、Web Vitals、渲染或执行指标
- 检查 XSS、硬编码密钥、危险 API 和回归风险
- 按证据给出 PASS、PARTIAL 或 FAIL，并指出下一步

## 输入

`applied_changes`、`metrics_baseline`、`benchmarks`、测试/构建命令和目标范围。

## 输出

共享上下文键：`verification_report`。报告包含环境、命令、测试结果、Before/After 数据、未测项目、风险和最终结论；没有实测结果时写明“未实测”，不得使用样例数字。

## 执行逻辑

1. 检查目标和基线是否仍有效。
2. 优先执行功能和安全验证，再执行质量及性能基准。
3. 逐项记录原始输出、比较条件和结论。
4. 将失败项和可重试阶段写入报告。

## 依赖关系

- 依赖：`code-optimization`
- 被依赖：`documentation-update`

## 完成标准

功能和安全检查已执行或明确说明原因；质量和性能均有可比数据或未实测说明；报告包含完整 Before/After 对比、命令和 PASS/PARTIAL/FAIL 结论。

## 错误处理

功能测试失败时标记 FAIL 并建议返回应用阶段；性能工具不可用时标记 PARTIAL；基线失效时重新建立基线，不将不可比结果作为改善证据。

## 安全边界

验证默认只读，不修改业务代码；不上传测试数据，不泄露密钥；不因追求指标跳过安全或功能测试。
