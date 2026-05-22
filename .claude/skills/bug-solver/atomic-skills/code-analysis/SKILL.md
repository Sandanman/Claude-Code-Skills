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
代码分析报告，包含以下内容：

```markdown
# 代码分析报告

## 分析目标
[根据问题识别报告确定的分析目标，如：分析登录功能的API调用逻辑]

## 相关文件分析

### 文件1: [文件路径]
- 文件类型：[Vue组件/JS模块/API接口/配置文件等]
- 关键代码段：
  - [代码行号]: [代码内容]
  - [代码行号]: [代码内容]
- 问题点分析：
  - [问题1描述]
  - [问题2描述]
- 潜在风险：
  - [风险1]
  - [风险2]

### 文件2: [文件路径]
- 文件类型：[Vue组件/JS模块/API接口/配置文件等]
- 关键代码段：
  - [代码行号]: [代码内容]
  - [代码行号]: [代码内容]
- 问题点分析：
  - [问题1描述]
  - [问题2描述]
- 潜在风险：
  - [风险1]
  - [风险2]

## 数据流分析
[分析数据在相关文件间的流动，如：用户输入 -> 组件处理 -> API调用 -> 响应处理]

## 调用关系分析
[分析函数/方法调用关系，如：loginEvent -> userAPI.login -> API响应处理]

## 异常处理分析
- 错误处理逻辑是否完整？
- 是否有未捕获的异常？
- 是否有错误信息丢失？
- 是否有适当的重试机制？

## 边界条件分析
- 输入验证是否完整？
- 空值/undefined处理是否到位？
- 异常网络情况处理？
- 并发场景处理？

## 可疑代码段汇总
| 位置 | 问题描述 | 严重性 | 可能影响 |
|------|----------|--------|----------|
| [文件:行号] | [问题描述] | [高/中/低] | [影响范围] |
| [文件:行号] | [问题描述] | [高/中/低] | [影响范围] |

## 初步结论
[基于代码分析的初步判断，如：可能由于userAPI对象未正确初始化导致login属性访问失败]
```

## 执行逻辑
1. 根据问题识别报告中的"相关代码文件"信息，定位文件
2. 分析每个相关文件的代码逻辑
3. 检查错误处理、边界条件、数据流
4. 标记所有可疑代码段
5. 输出完整分析报告

## 依赖关系
- 依赖：bug-identification（必须有结构化问题报告）

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

## 示例

**输入：**
bug-identification输出的报告中包含：
- 错误日志：TypeError: Cannot read property 'login' of undefined
- 相关代码文件：src/views/Login/index.vue, src/api/user.js

**输出：**
```markdown
# 代码分析报告

## 分析目标
分析登录功能的API调用逻辑，定位TypeError: Cannot read property 'login' of undefined的原因

## 相关文件分析

### 文件1: src/views/Login/index.vue
- 文件类型：Vue组件
- 关键代码段：
  - 50: const response = await userAPI.login({
  - 51:     password: loginForm.value.userID,
  - 52:     user_name: loginForm.value.userName,
  - 53:     nick_name: loginForm.value.userName,
  - 54:     head_url: 'http://'
  - 55: })
- 问题点分析：
  - 第50行调用userAPI.login，但userAPI可能未正确初始化
  - 未检查userAPI是否为undefined
- 潜在风险：
  - userAPI对象可能在异步加载时未初始化完成
  - 导入路径错误导致userAPI为undefined

### 文件2: src/api/user.js
- 文件类型：JS模块
- 关键代码段：
  - 1: import axios from '@/utils/axios.js'
  - 2: 
  - 3: const userAPI = {
  - 4:     login: async (data) => {
  - 5:         const response = await axios.post('/api/login', data)
  - 6:         return response.data
  - 7:     }
  - 8: }
  - 9: 
  - 10: export default userAPI
- 问题点分析：
  - 代码看起来正常，导出正确
  - 但可能在index.vue中导入路径错误
- 潜在风险：
  - 导入路径错误：import userAPI from '@/api/user.js' vs import userAPI from '@/api/user'

## 数据流分析
用户输入（用户名/密码） -> Login组件 -> userAPI.login -> axios.post -> API响应 -> 组件处理响应

## 调用关系分析
loginEvent -> userAPI.login -> axios.post -> API响应处理 -> setCatchData

## 异常处理分析
- Login组件中：有validate()检查，但无try-catch处理API调用异常
- userAPI模块中：无异常处理，直接返回响应
- 缺少全局错误处理机制

## 边界条件分析
- 输入验证：用户名和密码有required校验
- 空值处理：未检查loginForm.value.userID是否为undefined
- 异常网络情况：无重试机制
- 并发场景：无防止重复点击机制

## 可疑代码段汇总
| 位置 | 问题描述 | 严重性 | 可能影响 |
|------|----------|--------|----------|
| src/views/Login/index.vue:50 | 调用userAPI.login前未检查对象是否存在 | 高 | 导致TypeError: Cannot read property 'login' of undefined |
| src/views/Login/index.vue:28 | 导入userAPI的路径为 '@/utils/utils'，可能错误 | 中 | 可能导致userAPI为undefined |
| src/views/Login/index.vue:57 | 未处理API调用失败情况 | 中 | 用户无法获得明确的失败反馈 |

## 初步结论
TypeError: Cannot read property 'login' of undefined 最可能原因是：
1. userAPI对象在Login组件中未正确导入（路径错误）
2. userAPI对象在异步加载时未初始化完成
3. 导入路径错误：可能应该使用 '@/api/user.js' 而不是 '@/utils/utils'

建议检查：
1. src/views/Login/index.vue 第28行的导入语句
2. 是否存在异步初始化问题
3. userAPI模块是否正确导出
```

## 注意事项
- 保持客观，不猜测未证实的细节
- 优先分析已知相关文件，不扩展到无关文件
- 代码复杂时，标记而非强行解释

## 原子skill位置
./.claude/skills/bug-solver/atomic-skills/code-analysis/SKILL.md