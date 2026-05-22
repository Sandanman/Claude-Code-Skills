---
name: root-cause-analysis
description: 基于代码分析报告和错误日志，定位bug的根本原因，明确导致问题的代码行和逻辑缺陷。在代码分析后执行
---

# Root Cause Analysis 原子Skill

## 概述
基于代码分析报告和错误日志，定位bug的根本原因，明确导致问题的代码行和逻辑缺陷。

## 核心能力
- 整合错误日志与代码分析结果
- 定位具体代码行和逻辑缺陷
- 分析错误触发条件
- 确定根本原因而非表面现象
- 输出根因定位报告

## 输入
code-analysis输出的代码分析报告

## 输出
根因定位报告：

```markdown
# 根因定位报告

## 分析目标
定位登录功能中"TypeError: Cannot read property 'login' of undefined"的根本原因

## 根本原因
由于在Login组件中错误地导入了userAPI模块（导入路径为'@/utils/utils'而非'@/api/user.js'），导致userAPI对象为undefined，进而当调用userAPI.login时触发了Cannot read property 'login' of undefined错误。

## 证据链
1. **错误日志**：TypeError: Cannot read property 'login' of undefined
2. **相关代码段**：src/views/Login/index.vue:50 - const response = await userAPI.login({ ... })
3. **调用关系**：loginEvent -> userAPI.login -> 未定义对象
4. **触发条件**：当userAPI对象被错误导入为undefined时，点击登录按钮后立即触发

## 与其他可能性的对比
| 可能性 | 是否可能 | 理由 |
|--------|----------|------|
| userAPI模块未导出login方法 | 否 | code-analysis确认userAPI模块有正确的login方法定义 |
| API服务端故障 | 否 | 错误是前端TypeError，不是HTTP错误 |
| 异步加载问题 | 否 | 导入语句是静态导入，不是异步加载 |
| 导入路径错误 | 是 | 导入路径'@/utils/utils'指向了错误的模块 |
| 编译打包问题 | 否 | 其他功能正常，仅此问题 |

## 最终结论
根本原因是Login组件中userAPI模块的导入路径错误，导致userAPI对象为undefined。

## 建议的修复方向
1. 修正导入路径：将`import userAPI from '@/utils/utils'`改为`import userAPI from '@/api/user.js'`
2. 添加防御性检查：在调用userAPI.login前添加对象存在性检查
```

## 执行逻辑
1. 整合错误日志和代码分析报告
2. 构建从错误日志到代码行的证据链
3. 分析错误触发的完整条件
4. 区分根本原因与表面现象
5. 对比其他可能原因
6. 输出根因定位报告

## 依赖关系
- 依赖：code-analysis（必须有完整的代码分析报告）
- 被依赖：fix-generation

## 完成标准
1. 根本原因明确陈述（"由于...导致..."格式）
2. 至少提供4个证据支持根因
3. 包含与其他可能性的对比分析
4. 区分根本原因与表面现象
5. 输出完整的根因定位报告

## 错误处理
- 如果证据不足，标记为"需要更多信息"
- 如果存在多个可能原因，列出所有可能性并评估
- 如果无法确定根本原因，暂停并请求用户确认

## 注意事项
- 聚焦根本原因，避免表面现象
- 使用明确的"由于...导致..."格式
- 提供完整的证据链支持
- 区分根本原因与表面现象

## 原子skill位置
./.claude/skills/bug-solver/atomic-skills/root-cause-analysis/SKILL.md