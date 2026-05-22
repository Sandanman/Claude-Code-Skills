---
name: improvement-suggestion
description: 基于模式识别报告和性能分析报告，为每个可优化问题生成具体的重构建议和优化方案，提供多个选择供用户决策。在模式识别和性能分析都完成后执行
---

# Improvement Suggestion 原子Skill

## 概述
基于模式识别报告和性能分析报告，为每个可优化问题生成具体的重构建议和优化方案，提供多个选择供用户决策。

## 核心能力
- 同时基于代码质量维度（pattern-recognition）和性能维度（performance-analysis）生成建议
- 为每个优化问题生成**三个优化方案**：激进、保守、折中
- 提供具体的代码修改建议（使用diff格式）
- 评估每个方案的优缺点
- 说明预期收益和潜在风险
- 推荐最佳实践方案

## 输入
1. pattern-recognition输出的模式识别报告
2. performance-analysis输出的性能瓶颈报告

**重要**：必须同时收到两个报告后才执行本skill。

## 输出
详细的改进建议报告：

```markdown
# 改进建议报告

## 分析目标
基于模式识别 + 性能分析双维度，为src/components/MeetingCard.vue中的优化问题生成重构方案

## 问题概览
- **模式问题总数**：5个（来自pattern-recognition）
- **性能瓶颈总数**：4个（来自performance-analysis）
- **推荐方案总数**：每个问题3个方案

## 每个问题的优化方案

### 问题1：低效算法 - 重复日期格式化

#### 方案1：激进优化（推荐）
- **类型**：重构
- **维度**：性能提升 + 代码质量
- **修改内容**：
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
- **修改行号**：新增10-15行，删除45-48行、89-92行
- **风险评估**：低
- **预期收益**：
  - 性能提升：减少重复计算，渲染时间降低5-10%
  - 代码质量：消除重复逻辑，符合Vue最佳实践

#### 方案2：保守优化
- **类型**：局部优化
- **维度**：最小改动
- **修改内容**：
  ```diff
  -const formattedStartTime = formatDate(meeting.startTime)
  +const formattedStartTime = new Date(meeting.startTime).toLocaleString('zh-CN')
  ```
- **风险评估**：低
- **预期收益**：格式可能不完全一致（时区、语言）

#### 方案3：折中优化
- **类型**：函数提取
- **维度**：平衡
- **修改内容**：提取formatDate为独立函数，保持调用方式不变
- **风险评估**：低
- **预期收益**：代码复用，但无缓存机制

---

### 问题2：大函数模式 - handleJoinMeeting过长

#### 方案1：激进优化（推荐）
- **类型**：重构 - 函数拆分
- **维度**：可维护性 + 可测试性
- **修改内容**：
  ```diff
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
  -// 原来48行的handleJoinMeeting拆分为调用上述函数的简洁版本
  -const handleJoinMeeting = async (...) => {
  -  // 48行代码...
  -}
  +const handleJoinMeeting = async (meetingId, password, isAudioOnly, isVideoOn, userId, userName) => {
  +  if (!validateParams(meetingId, userId)) return
  +  if (!await checkMeetingPermission(userId, meetingId)) return
  +  // ... 后续简洁逻辑
  +}
  ```
- **风险评估**：中（涉及逻辑变更，需要充分测试）
- **预期收益**：
  - 圈复杂度：从22降至8
  - 可测试性：每个小函数独立可测
  - 可维护性：职责单一，易于理解

---

## 综合优化收益评估

| 维度 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| 圈复杂度 | 18.5 | 11.2 | -39.5% |
| 认知复杂度 | 12.3 | 7.8 | -36.6% |
| 重复代码率 | 8.2% | 1.5% | -81.7% |
| 渲染时间 | 45.2ms | 32.1ms | -29.0% |
| 内存占用 | 1.8MB | 1.55MB | -13.9% |

## 推荐整体方案
1. 优先应用激进优化方案处理高优先级问题
2. 验证优化后的性能和功能
3. 考虑将工具函数提取到utils中复用

## 数据来源
- 输入：pattern-recognition报告 + performance-analysis报告
- 生成时间：2026-05-21 10:05:00
- 生成版本：1.2
```

## 执行逻辑
1. 确认同时收到pattern-recognition和performance-analysis的报告
2. 合并两个报告中的问题列表（可能存在重叠）
3. 对每个问题生成三个优化方案（激进、保守、折中）
4. 每个方案同时考虑代码质量和性能两个维度
5. 使用diff格式展示具体代码修改
6. 评估每个方案的优缺点
7. 推荐最佳方案并说明理由
8. 汇总整体优化预期收益

## 依赖关系
- 依赖：pattern-recognition（必须先完成）AND performance-analysis（必须先完成）
- 被依赖：code-refactoring

**重要**：本skill同时依赖两个前置skill。两个前置skill可以并行执行，但都完成后才能开始本skill。

## 完成标准
1. 为每个问题提供至少3个优化方案
2. 每个方案包含具体的代码修改（diff格式）
3. 包含修改文件、行号、影响范围、风险评估
4. 提供方案对比表格（评估维度）
5. 明确推荐方案并说明理由
6. 输出完整格式化的报告（markdown）

## 错误处理
- **缺少pattern-recognition报告**：等待直到收到，提示"等待pattern-recognition完成"
- **缺少performance-analysis报告**：等待直到收到，提示"等待performance-analysis完成"
- **两个报告都缺少**：报错并退出

## 注意事项
- 激进方案应是性能和质量最优解
- 保守方案应是最小改动、风险最低
- 折中方案应平衡各项指标
- 所有方案都必须保证功能正确性
- 同时参考代码质量和性能两个维度

## 原子skill位置
./.claude/skills/code-optimizer/atomic-skills/improvement-suggestion/SKILL.md