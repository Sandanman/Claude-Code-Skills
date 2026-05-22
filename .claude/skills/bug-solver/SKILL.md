---
name: bug-solver
description: 系统化地解决应用程序中的bug，通过6个原子skill协同工作，从问题识别到修复验证，完整记录和追溯整个debug过程。当用户报告错误、异常行为或提供bug信息时自动触发
---

# Bug Solver 主Skill

## 概述
本主skill用于系统化地解决应用程序中的bug，通过6个原子skill协同工作，从问题识别到修复验证，完整记录和追溯整个debug过程。

## 核心能力
- 系统化的问题诊断流程
- 代码级的根因定位
- 安全的修复方案生成
- 修复效果的验证
- 测试用例建议

## 执行流程
1. bug-identification（问题识别）
2. code-analysis（代码分析）
3. root-cause-analysis（根因定位）
4. fix-generation（修复生成）
5. fix-verification（修复验证）
6. test-suggestion（测试建议）

## 原子skill依赖关系
- bug-identification: 无依赖
- code-analysis: 依赖 bug-identification
- root-cause-analysis: 依赖 code-analysis
- fix-generation: 依赖 root-cause-analysis
- fix-verification: 依赖 fix-generation
- test-suggestion: 依赖 fix-verification

## 主skill完成标准
1. ✅ bug问题已明确归类（前端/后端/配置/逻辑错误）
2. ✅ 根因已定位并记录
3. ✅ 提供可执行的修复方案
4. ✅ 修复方案经过验证
5. ✅ 提供测试用例建议
6. ✅ 所有原子skill执行日志完整记录

## 重试规则
- 每个原子skill失败后可重试 **3次**
- 重试3次后仍失败，暂停任务等待用户确认
- fix-verification发现修复不完整时，可返回fix-generation阶段（最多循环 **2次**）

## 文件系统位置
- 主skill路径: ./.claude/skills/bug-solver/SKILL.md
- 原子skill路径: ./.claude/skills/bug-solver/atomic-skills/下各子目录

## 使用示例
用户输入："登录页面点击登录按钮没有反应，控制台显示TypeError: Cannot read property 'login' of undefined"

主skill将依次调用：
1. bug-identification 收集错误信息
2. code-analysis 分析相关代码
3. root-cause-analysis 定位根本原因
4. fix-generation 生成修复方案
5. fix-verification 验证修复效果
6. test-suggestion 建议测试用例

最终输出完整的bug解决报告。

## 注意事项
- 所有原子skill必须按序执行，不能跳过
- 任务执行过程中，所有状态和日志会实时写入task_skill.md
- 修复方案生成前必须通过根因分析
- 修复验证是必须的步骤，不能跳过

## 支持的bug类型
- **前端bug**：Vue/React组件错误、样式问题、交互异常
- **后端bug**：API错误、数据库错误、逻辑错误
- **配置bug**：环境变量错误、配置文件错误
- **集成bug**：第三方服务集成错误、依赖版本冲突