---
name: code-refactoring
description: 根据改进建议报告中选择的优化方案，实际修改代码，生成新的代码版本，确保功能正确性和代码可编译性。在改进建议确定后执行
---

# Code Refactoring 原子Skill

## 概述
根据改进建议报告中选择的优化方案，实际修改代码，生成新的代码版本，确保功能正确性和代码可编译性。

## 核心能力
- 应用具体的代码修改建议
- 生成 diff 格式的代码变更对比
- 保留原始代码备份
- 确保语法正确性
- 支持多种文件类型

## 输入
improvement-suggestion输出的改进建议报告，包含用户选择的优化方案

## 输出
代码重构报告，包含以下内容：

```markdown
# 代码重构报告

## 执行目标
应用激进优化方案，重构src/components/MeetingCard.vue

## 选择的优化方案
- **模式1：低效算法** → 激进优化（使用computed计算属性）
- **模式2：大函数模式** → 激进优化（拆分为多个小函数）
- **模式3：XSS风险** → 激进优化（替换v-html为插值表达式）

## 修改内容

### 修改1：低效算法 - 日期格式化优化

**文件**：src/components/MeetingCard.vue
**行号**：新增10-15行，删除45-48行、89-92行

```diff
--- a/src/components/MeetingCard.vue
+++ b/src/components/MeetingCard.vue
@@ -1,10 +1,12 @@
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  meeting: Object
})

+const formatDate = (timestamp) => {
+  const date = new Date(timestamp)
+  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
+}
+
const formattedStartTime = computed(() => formatDate(props.meeting.startTime))
const formattedEndTime = computed(() => formatDate(props.meeting.endTime))

const handleJoinMeeting = async (...) => { ... }
</script>
```

### 修改2：大函数模式 - handleJoinMeeting拆分

**文件**：src/components/MeetingCard.vue
**行号**：新增25-60行，修改62-90行

```diff
--- a/src/components/MeetingCard.vue
+++ b/src/components/MeetingCard.vue
@@ -1,10 +1,12 @@
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import userAPI from '@/api/user.js'

const router = useRouter()

+const validateParams = (meetingId, userId) => {
+  if (!meetingId || !userId) {
+    ElMessage.error('参数缺失')
+    return false
+  }
+  return true
+}
+
+const checkMeetingPermission = async (userId, meetingId) => {
+  try {
+    const hasPermission = await userAPI.checkPermission(userId, meetingId)
+    if (!hasPermission) {
+      ElMessage.error('没有权限加入会议')
+      return false
+    }
+    return true
+  } catch (error) {
+    ElMessage.error('权限检查失败')
+    return false
+  }
+}
+
+const joinMeetingAPI = async (meetingId, password, isAudioOnly, isVideoOn) => {
+  try {
+    const response = await userAPI.joinMeeting({
+      meetingId,
+      password,
+      isAudioOnly,
+      isVideoOn
+    })
+    return response
+  } catch (error) {
+    ElMessage.error('加入会议失败')
+    throw error
+  }
+}
+
+const updateMeetingStatus = (meetingData) => {
+  meetingStore.updateStatus(meetingData)
+}
+
+const navigateToHome = () => {
+  router.push({ name: 'home' })
+}
+
const handleJoinMeeting = async (meetingId, password, isAudioOnly, isVideoOn, userId, userName) => {
  // 参数验证
-  if (!meetingId || !userId) {
-    ElMessage.error('参数缺失')
-    return
-  }
+  if (!validateParams(meetingId, userId)) return

  // 权限检查
-  const hasPermission = await checkPermission(userId, meetingId)
-  if (!hasPermission) {
-    ElMessage.error('没有权限加入会议')
-    return
-  }
+  if (!await checkMeetingPermission(userId, meetingId)) return

  // 网络请求
-  try {
-    const response = await joinMeetingAPI({
-      meetingId,
-      password,
-      isAudioOnly,
-      isVideoOn
-    })
-    if (response && response.code === 0) {
-      setCatchData(response)
-      ElMessage({
-        message: '加入会议成功',
-        type: 'success',
-        duration: 500,
-        onClose: () => {
-          router.push({ name: 'home' })
-        }
-      })
-    } else {
-      ElMessage.error(response.message || '加入会议失败')
-    }
-  } catch (error) {
-    ElMessage.error('网络错误')
-  }
+  const response = await joinMeetingAPI(meetingId, password, isAudioOnly, isVideoOn)
+  if (response && response.code === 0) {
+    updateMeetingStatus(response.data)
+    ElMessage({
+      message: '加入会议成功',
+      type: 'success',
+      duration: 500,
+      onClose: () => {
+        navigateToHome()
+      }
+    })
+  } else {
+    ElMessage.error(response.message || '加入会议失败')
+  }
}

const setCatchData = (response) => { ... }

</script>
```

### 修改3：XSS风险 - v-html替换

**文件**：src/components/MeetingCard.vue
**行号**：145

```diff
--- a/src/components/MeetingCard.vue
+++ b/src/components/MeetingCard.vue
@@ -145,1 +145,1 @@
-<div v-html="meeting.description"></div>
+<div>{{ meeting.description }}</div>
```

## 原始代码备份
- **备份路径**：src/components/MeetingCard.vue.bak
- **备份时间**：2026-04-08 19:05:00
- **备份内容**：原始代码已保存，可随时恢复

## 代码验证
- **语法检查**：通过（ESLint无错误）
- **编译测试**：通过（Vite构建成功）
- **功能测试**：
  - 日期格式化正常
  - 会议加入功能正常
  - XSS风险已消除

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

## 注意事项
- 所有修改都基于用户选择的方案
- 保留了原始代码备份，可随时回滚
- 修改确保了语法正确性
- 没有引入新依赖

## 原子skill位置
./.claude/skills/code-optimizer/atomic-skills/code-refactoring/SKILL.md