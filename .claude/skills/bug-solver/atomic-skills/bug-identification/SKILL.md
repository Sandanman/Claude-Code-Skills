---
name: bug-identification
description: 收集和整理用户提供的bug信息，基于bug-triage分类结果创建结构化的问题描述文档，为后续分析提供基础。在bug-triage完成后执行
---

# Bug Identification 原子Skill

## 概述
收集和整理用户提供的bug信息，基于bug-triage分类结果创建结构化的问题描述文档，为后续分析提供基础。

## 核心能力
- 提取用户描述中的关键信息
- 根据bug类型重点收集相关信息
- 整理复现步骤
- 收集环境信息
- 输出标准化的问题报告

## 输入
1. bug-triage输出的Bug分类报告
2. 用户对bug的详细描述

## 输出
结构化的bug报告文档：

```markdown
# Bug 问题识别报告

## 基础信息
- **问题类型**：frontend（来自bug-triage）
- **优先级**：high（来自bug-triage）
- **处理策略**：立即修复
- **发生环境**：Chrome浏览器（控制台错误）
- **发生频率**：稳定复现

## 问题描述
用户原始描述：
登录页面点击登录按钮没有反应，控制台显示TypeError: Cannot read property 'login' of undefined

## 复现步骤
1. 打开登录页面（/login）
2. 输入用户名和密码
3. 点击登录按钮
4. 观察：页面无反应，控制台显示错误

## 期望行为
点击登录按钮后，应调用登录API，验证成功后跳转到首页

## 实际行为
点击登录按钮后，无任何反应，控制台显示TypeError: Cannot read property 'login' of undefined

## 错误日志
```
TypeError: Cannot read property 'login' of undefined
    at Login (src/views/Login/index.vue:50:29)
```

## 环境信息
- 浏览器：Chrome 123.0
- 操作系统：macOS 14.0
- Node版本：18.17.0
- Vue版本：3.3.4

## 相关文件
- src/views/Login/index.vue（第50行）
- src/api/user.js
- src/utils/utils.js

## 问题分类
- 所属模块：登录
- 问题性质：逻辑错误（前端）
```

## 执行逻辑
1. 接收bug-triage的分类报告，了解类型和优先级
2. 接收用户对bug的详细描述
3. 提取错误日志和关键信息
4. 整理复现步骤（与bug类型对应）
5. 对比期望行为与实际行为
6. 收集环境信息
7. 输出结构化报告

## 依赖关系
- 依赖：bug-triage（必须有分类报告）
- 被依赖：code-analysis

## 完成标准
1. 问题类型已明确分类（与bug-triage结果一致）
2. 复现步骤完整清晰
3. 期望行为与实际行为对比明确
4. 包含错误日志或相关代码文件信息
5. 输出完整结构化报告

## 错误处理
- 如果用户描述模糊，询问关键信息：
  - "能提供完整的错误日志吗？"
  - "具体的复现步骤是什么？"
  - "在哪种环境下会出现这个问题？"
- 如果信息不足，暂停等待用户补充，不继续后续步骤

## 注意事项
- 保持客观，不猜测未证实的细节
- 优先记录事实，再进行判断
- 信息不足时，必须询问补充，不能跳过
- 根据bug-triage的类型和优先级调整信息收集重点

## 原子skill位置
./.claude/skills/bug-solver/atomic-skills/bug-identification/SKILL.md