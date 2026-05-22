---
name: code-refactoring
description: 根据改进建议报告中选择的优化方案，实际修改代码，生成新的代码版本，确保功能正确性和代码可编译性。在改进建议确定后执行
---

# Code Refactoring 原子Skill

## 概述
根据改进建议报告中选择的优化方案，实际修改代码，生成新的代码版本，确保功能正确性和代码可编译性。

## 核心能力
- 应用具体的代码修改建议
- 生成diff格式的代码变更对比
- 保留原始代码备份
- 确保语法正确性
- 支持多种文件类型

## 输入
improvement-suggestion输出的改进建议报告，包含用户选择的优化方案

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
- 依赖：improvement-suggestion（必须有完整的改进建议报告）
- 被依赖：optimization-verification

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
./.claude/skills/code-optimizer/atomic-skills/code-refactoring/SKILL.md