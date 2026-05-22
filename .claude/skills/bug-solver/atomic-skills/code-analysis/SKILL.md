---
name: code-analysis
description: 基于问题识别阶段的报告，分析相关代码文件，识别潜在的代码问题、异常处理、边界条件等，为根因定位提供依据。在问题识别后执行
---

# Code Analysis 原子Skill

## 概述
基于问题识别阶段的报告，分析相关代码文件，识别潜在的代码问题、异常处理、边界条件等，为根因定位提供依据。

## 核心能力
- 定位并分析相关代码文件
- 检查错误处理逻辑
- 识别边界条件和异常场景
- 分析数据流和调用关系
- 标记可疑代码段

## 输入
bug-identification输出的结构化问题报告

## 输出
代码分析报告：

```markdown
# 代码分析报告

## 分析目标
分析登录功能的API调用逻辑，定位TypeError: Cannot read property 'login' of undefined的原因

## 相关文件分析

### 文件1: src/views/Login/index.vue
- 文件类型：Vue组件
- 关键代码段：
  - 第28行：import userAPI from '@/utils/utils'
  - 第50行：const response = await userAPI.login({...})
- 问题点分析：
  - 第50行调用userAPI.login，但userAPI可能未正确初始化
  - 未检查userAPI是否为undefined
- 潜在风险：
  - userAPI对象可能在异步加载时未初始化完成
  - 导入路径错误导致userAPI为undefined

### 文件2: src/api/user.js
- 文件类型：JS模块
- 关键代码段：
  - 第3行：const userAPI = { login: async (data) => {...} }
  - 第10行：export default userAPI
- 问题点分析：
  - 导出看起来正常
  - 可能在Login组件中导入路径错误

## 可疑代码段汇总
| 位置 | 问题描述 | 严重性 | 可能影响 |
|------|----------|--------|----------|
| Login/index.vue:28 | 导入路径为'@/utils/utils'，可能错误 | 高 | 导致userAPI为undefined |
| Login/index.vue:50 | 调用userAPI.login前未检查对象存在性 | 高 | 触发TypeError |
| Login/index.vue:57 | 未处理API调用失败情况 | 中 | 用户无失败反馈 |

## 初步结论
最可能原因：userAPI模块在Login组件中导入路径错误，导致userAPI为undefined。
```

## 执行逻辑
1. 根据问题识别报告中的"相关代码文件"信息，定位文件
2. 分析每个相关文件的代码逻辑
3. 检查错误处理、边界条件、数据流
4. 标记所有可疑代码段
5. 输出完整分析报告

## 依赖关系
- 依赖：bug-identification（必须有结构化问题报告）
- 被依赖：root-cause-analysis

## 完成标准
1. 所有相关代码文件已分析
2. 至少识别出3个可疑代码段
3. 包含数据流和调用关系分析
4. 包含异常处理和边界条件分析
5. 输出完整的代码分析报告

## 错误处理
- 如果相关文件不存在，记录为警告
- 如果代码逻辑复杂难以分析，标记为"需要人工审查"
- 如果缺少关键文件，暂停并请求用户确认文件路径

## 注意事项
- 保持客观，不猜测未证实的细节
- 优先分析已知相关文件，不扩展到无关文件
- 代码复杂时，标记而非强行解释

## 原子skill位置
./.claude/skills/bug-solver/atomic-skills/code-analysis/SKILL.md