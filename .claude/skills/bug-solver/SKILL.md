---
name: bug-solver
description: 系统化地解决应用程序中的bug，通过7个原子skill协同工作，从bug分类到修复验证，完整记录和追溯整个debug过程。当用户报告错误、异常行为或提供bug信息时自动触发
---

# Bug Solver 主Skill

## 概述
本主skill用于系统化地解决应用程序中的bug，通过7个原子skill协同工作，从bug分类到修复验证，完整记录和追溯整个debug过程。

## 核心能力
- 系统化的bug分类和优先级判定
- 问题诊断流程
- 代码级的根因定位
- 安全的修复方案生成
- 修复效果的验证
- 测试用例建议

## 执行流程（7步管道）

```
┌─────────────────────┐
│  1. bug-triage      │ ← 无依赖 [NEW]
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  2. bug-             │ ← 依赖 bug-triage
│      identification  │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  3. code-analysis   │ ← 依赖 bug-identification
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  4. root-cause-     │ ← 依赖 code-analysis
│      analysis       │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  5. fix-generation  │ ← 依赖 root-cause-analysis
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  6. fix-verification│ ← 依赖 fix-generation
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  7. test-suggestion │ ← 依赖 fix-verification
└─────────────────────┘
```

## 原子skill依赖关系
- **bug-triage**: 无依赖
- **bug-identification**: 依赖 bug-triage
- **code-analysis**: 依赖 bug-identification
- **root-cause-analysis**: 依赖 code-analysis
- **fix-generation**: 依赖 root-cause-analysis
- **fix-verification**: 依赖 fix-generation
- **test-suggestion**: 依赖 fix-verification

## 主skill完成标准（7项）
1. bug已明确分类（类型：前端/后端/配置/逻辑，优先级：critical/high/medium/low）
2. bug问题已明确归类并创建结构化描述
3. 根因已定位并记录
4. 提供可执行的修复方案
5. 修复方案经过验证
6. 提供测试用例建议
7. 所有原子skill执行日志完整记录

## Bug分类系统

### 按类型分类
- **frontend**：Vue/React组件错误、样式问题、交互异常
- **backend**：API错误、数据库错误、逻辑错误
- **config**：环境变量错误、配置文件错误
- **logic**：业务逻辑错误、数据处理错误

### 按优先级分类
| 优先级 | 说明 | 响应时间 | 示例 |
|--------|------|----------|------|
| critical | 导致系统无法使用，数据丢失，安全问题 | 立即 | 登录崩溃、支付失败、XSS注入 |
| high | 核心功能无法使用，无替代方案 | 24小时 | 会议无法创建、用户无法注册 |
| medium | 功能部分受损，有替代方案 | 72小时 | 通知延迟、列表加载慢 |
| low | 体验问题，不影响核心功能 | 1周 | 样式偏差、轻微延迟 |

## 重试规则
- 每个原子skill失败后可重试 **3次**
- 重试3次后仍失败，暂停任务等待用户确认
- fix-verification发现修复不完整时，可返回fix-generation阶段（最多循环 **2次**）

## 文件系统位置
- 主skill路径：./.claude/skills/bug-solver/SKILL.md
- 原子skill路径：./.claude/skills/bug-solver/atomic-skills/下各子目录

## 使用示例
用户输入："登录页面点击登录按钮没有反应，控制台显示TypeError: Cannot read property 'login' of undefined"

主skill将依次调用：
1. bug-triage 分类bug（类型：frontend，优先级：high）
2. bug-identification 收集错误信息
3. code-analysis 分析相关代码
4. root-cause-analysis 定位根本原因
5. fix-generation 生成修复方案
6. fix-verification 验证修复效果
7. test-suggestion 建议测试用例

最终输出完整的bug解决报告。

## 注意事项
- 所有原子skill必须按序执行，不能跳过
- bug-triage决定了后续处理策略，关键步骤
- 修复方案生成前必须通过根因分析
- 修复验证是必须的步骤，不能跳过

## 支持的bug类型
- **前端bug**：Vue/React组件错误、样式问题、交互异常
- **后端bug**：API错误、数据库错误、逻辑错误
- **配置bug**：环境变量错误、配置文件错误
- **集成bug**：第三方服务集成错误、依赖版本冲突

---

## 原子skill详细定义

### 1. bug-triage [NEW]
**能力**：分类bug类型、优先级，制定处理策略  
**输入**：用户描述的错误信息  
**输出**：bug分类报告（类型、优先级、处理策略）  
**完成标准**：明确分类（类型+优先级），制定处理策略

### 2. bug-identification
**能力**：收集bug信息，创建结构化问题描述  
**输入**：bug-triage的分类结果 + 用户描述  
**输出**：结构化问题报告  
**完成标准**：问题类型已明确，复现步骤完整，期望/实际行为对比清晰

### 3. code-analysis
**能力**：分析相关代码文件，识别潜在问题  
**输入**：bug-identification的问题报告  
**输出**：代码分析报告  
**完成标准**：所有相关文件已分析，至少识别3个可疑代码段

### 4. root-cause-analysis
**能力**：定位根本原因，明确导致问题的代码行  
**输入**：code-analysis的分析报告  
**输出**：根因定位报告  
**完成标准**：根本原因明确陈述，提供4个以上证据

### 5. fix-generation
**能力**：设计并生成修复方案  
**输入**：root-cause-analysis的根因报告  
**输出**：修复方案文档（含diff）  
**完成标准**：至少2个方案，推荐方案明确

### 6. fix-verification
**能力**：验证修复是否解决问题  
**输入**：fix-generation的修复方案  
**输出**：修复验证报告  
**完成标准**：功能验证通过，结论明确（成功/失败/部分成功）

### 7. test-suggestion
**能力**：建议测试用例防止问题再次发生  
**输入**：fix-verification的验证报告  
**输出**：测试建议文档  
**完成标准**：至少3个单元测试场景，包含代码示例

---

版本：1.2（改进版）
主skill名称：bug-solver
状态：启用