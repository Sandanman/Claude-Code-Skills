---
name: code-optimization
description: 应用优化方案，生成优化后代码（diff 格式），包含回滚脚本。Task Folding 合并了 code-refactoring（代码重构）和 optimization-application（策略应用），统一执行代码级和构建配置级修改。
version: 2.0
merged_from:
  - code-refactoring (from code-optimizer)
  - optimization-application (from performance-optimizer)
tau_layer: generation
---

# Code Optimization 原子Skill

> Task Folding 合并了 `code-refactoring` 和 `optimization-application`，统一执行代码级和构建配置级修改。

## 概述
根据 `optimization-proposal` 输出的优化方案，统一执行代码重构和构建配置优化，生成优化后的代码，确保功能正确性和构建可用性。

## 核心能力
**代码级修改（来自 code-refactoring）**：
- 应用具体的代码修改建议（diff 格式）
- 保留原始代码备份（.bak 文件）
- 确保语法正确性，支持多种文件类型（Vue/React/TS）

**构建配置修改（来自 optimization-application）**：
- 构建配置优化（Vite/Webpack：代码分割、Tree-shaking、压缩配置）
- 路由懒加载（静态 import → 动态 import）
- 组件懒加载（defineAsyncComponent）
- 依赖按需引入（全量引入 → 按需引入）
- 资源优化配置（图片压缩、WebP、字体子集化）
- 生成回滚脚本（一键撤销所有变更）

## 输入
`optimization-proposal` 输出的优化方案文档，包含：
- 用户选择的优化方案（激进/保守/折中）
- 代码修改 diff
- 构建配置变更清单
- 预期改善指标

## 输出
代码重构报告：

```markdown
# 代码重构报告

## 执行目标
应用激进优化方案，重构src/components/MeetingCard.vue

## 选择的优化方案
- 问题1（重复日期格式化）→ 激进优化（使用computed计算属性）
- 问题2（大函数模式）→ 激进优化（拆分为多个小函数）
- 问题3（XSS风险）→ 激进优化（替换v-html为插值表达式）

## 修改内容

### 修改1：重复日期格式化优化

**文件**：src/components/MeetingCard.vue
**行号**：新增10-15行，删除45-48行、89-92行

```diff
--- a/src/components/MeetingCard.vue
+++ b/src/components/MeetingCard.vue
@@ -1,10 +1,12 @@
<script setup>
-import { ref } from 'vue'
+import { ref, computed } from 'vue'

const props = defineProps({
  meeting: Object
})

+const formatDate = (timestamp) => {
+  const date = new Date(timestamp)
+  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
+}
+
+const formattedStartTime = computed(() => formatDate(props.meeting.startTime))
+const formattedEndTime = computed(() => formatDate(props.meeting.endTime))
```

### 修改2：handleJoinMeeting拆分

**文件**：src/components/MeetingCard.vue
**行号**：新增25-60行

```diff
+const validateParams = (meetingId, userId) => {
+  if (!meetingId || !userId) {
+    ElMessage.error('参数缺失')
+    return false
+  }
+  return true
+}
+
+const handleJoinMeeting = async (...) => {
+  if (!validateParams(meetingId, userId)) return
+  // ... 简化后的逻辑
+}
```

### 修改3：XSS风险修复

```diff
-<div v-html="meeting.description"></div>
+<div>{{ meeting.description }}</div>
```

## 原始代码备份
- **备份路径**：src/components/MeetingCard.vue.bak
- **备份时间**：2026-05-21 10:05:00
- **备份内容**：原始代码已保存，可随时恢复

## 代码验证
- **语法检查**：通过（无ESLint错误）
- **编译测试**：通过（Vite构建成功）
- **功能测试**：日期格式化正常、会议加入功能正常

## 代码变更统计
| 指标 | 变化 |
|------|------|
| 新增行数 | 55 |
| 删除行数 | 48 |
| 修改行数 | 28 |
| 总变更行数 | 131 |
| 文件数 | 1 |

## 推荐下一步
1. 运行测试用例验证功能完整性
2. 使用optimization-verification验证性能提升
3. 更新相关文档
```

## 执行逻辑
1. 接收improvement-suggestion的改进建议报告
2. 确认用户选择的优化方案
3. 读取原始代码文件
4. 按照diff格式应用每个修改
5. 创建备份文件
6. 写入修改后的代码
7. 验证语法正确性
8. 输出完整的重构报告

## 依赖关系
- 依赖：`optimization-proposal`（必须有完整的优化方案文档）
- 被依赖：`optimization-verification`

## 完成标准
1. 所有选择的优化方案都已应用
2. 每个修改包含完整的diff格式
3. 原始代码已备份
4. 代码语法正确（无语法错误）
5. 输出完整的代码重构报告

## 错误处理
- **用户未选择方案**：暂停等待用户选择
- **代码修改冲突**：标记冲突点，提示用户手动解决
- **语法错误**：报错并列出错误位置，等待修正后重试

## 注意事项
- 所有修改都基于用户选择的方案
- 保留了原始代码备份，可随时回滚
- 修改确保了语法正确性
- 没有引入新依赖

## 原子skill位置
`.claude/skills/code-optimizer/atomic-skills/code-optimization/SKILL.md`