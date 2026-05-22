---
name: improvement-suggestion
description: 基于模式识别报告，为每个可优化模式生成具体的重构建议和优化方案，提供多个选择供用户决策。在模式识别后执行
---

# Improvement Suggestion 原子Skill

## 概述
基于模式识别报告，为每个可优化模式生成具体的重构建议和优化方案，提供多个选择供用户决策。

## 核心能力
- 为每个优化模式生成**三个优化方案**：激进、保守、折中
- 提供具体的代码修改建议（使用diff格式）
- 评估每个方案的优缺点
- 说明预期收益和潜在风险
- 推荐最佳实践方案

## 输入
pattern-recognition输出的模式识别报告

## 输出
详细的改进建议报告，包含以下内容：

```markdown
# 改进建议报告

## 分析目标
基于模式识别报告，为src/components/MeetingCard.vue中的5个优化模式生成具体的重构方案

## 模式概览
- **总模式数**：5个
- **推荐方案总数**：15个（每个模式3个方案）
- **优化总范围**：约130行代码

## 每个模式的优化方案

### 模式1：低效算法 - 重复日期格式化

#### 方案1：激进优化（推荐）
- **类型**：重构
- **修改内容**：
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
- **修改文件**：src/components/MeetingCard.vue
- **修改行号**：新增10-15行，删除45-48行、89-92行
- **影响范围**：仅影响当前组件
- **兼容性**：向后兼容，功能完全一致
- **风险评估**：低
- **预期收益**：
  - 性能提升：减少重复计算，提升5-10%
  - 代码复用：提取为共享计算属性
  - 可维护性：单一职责，易于测试

#### 方案2：保守优化
- **类型**：局部优化
- **修改内容**：
  ```diff
  --- a/src/components/MeetingCard.vue
  +++ b/src/components/MeetingCard.vue
  @@ -45,1 +45,1 @@
  -const formattedStartTime = formatDate(meeting.startTime)
  +const formattedStartTime = new Date(meeting.startTime).toLocaleString('zh-CN')
  @@ -89,1 +89,1 @@
  -const formattedEndTime = formatDate(meeting.endTime)
  +const formattedEndTime = new Date(meeting.endTime).toLocaleString('zh-CN')
  ```
- **修改文件**：src/components/MeetingCard.vue
- **修改行号**：45、89
- **影响范围**：仅影响当前组件
- **兼容性**：向后兼容
- **风险评估**：低
- **预期收益**：
  - 性能提升：使用内置方法，减少函数调用
  - 代码简化：减少自定义函数
- **缺点**：
  - 格式可能不完全一致（时区、语言）
  - 无法复用，其他地方仍需重复

#### 方案3：折中优化
- **类型**：函数提取
- **修改内容**：
  ```diff
  --- a/src/components/MeetingCard.vue
  +++ b/src/components/MeetingCard.vue
  @@ -1,10 +1,13 @@
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    meeting: Object
  })
  
  +function formatDate(timestamp) {
  +  const date = new Date(timestamp)
  +  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
  +}
  
  const formattedStartTime = formatDate(props.meeting.startTime)
  const formattedEndTime = formatDate(props.meeting.endTime)
  
  const handleJoinMeeting = async (...) => { ... }
  </script>
  ```
- **修改文件**：src/components/MeetingCard.vue
- **修改行号**：新增10-14行，删除45-48行、89-92行
- **影响范围**：仅影响当前组件
- **兼容性**：向后兼容
- **风险评估**：低
- **预期收益**：
  - 代码复用：提取为函数
  - 避免重复计算
  - 便于调试
- **缺点**：
  - 仍为普通函数，无缓存机制
  - 每次渲染仍会调用

## 方案对比

| 评估维度 | 激进优化 | 保守优化 | 折中优化 |
|----------|----------|----------|----------|
| 复杂度 | 中 | 低 | 低 |
| 风险 | 低 | 低 | 低 |
| 性能收益 | 高 | 中 | 中 |
| 可维护性 | 高 | 低 | 中 |
| 实施难度 | 简单 | 简单 | 简单 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 推荐方案
推荐方案1：激进优化（使用computed计算属性）

**理由**：
1. **最佳性能**：Vue的computed具有缓存机制，仅在依赖变化时重新计算
2. **最佳可维护性**：代码清晰，职责单一
3. **符合Vue最佳实践**：使用响应式系统处理派生状态
4. **长期收益**：为其他类似优化提供模板

## 下一步建议
1. 优先应用激进优化方案
2. 验证优化后的性能和功能
3. 考虑将formatDate函数提取到utils中，供其他组件复用

---

### 模式2：大函数模式 - handleJoinMeeting过长

#### 方案1：激进优化（推荐）
[略，完整内容见原始文件]

（内容较长，遵循同样的格式提供三个方案）

## 总结建议

基于所有模式的综合分析，推荐采用以下优化策略：

### 优先级1（立即执行）
1. 使用激进方案1优化日期格式化
2. 使用激进方案2拆分大函数
3. 使用激进方案3修复XSS风险

### 优先级2（可选）
1. 折中优化嵌套条件
2. 折中优化参数列表

### 整体预期收益
- 性能提升：27-40%
- 圈复杂度降低：从18.5降至12.3（↓33.5%）
- 重复代码率：从8.2%降至2.1%（↓74.4%）
- 安全风险：XSS风险完全消除
- 可维护性：函数平均行数从48降至15

## 数据来源
- 输入：pattern-recognition报告
- 生成时间：2026-04-08 19:05:00
- 生成版本：1.0
```

## 执行逻辑
1. 接收 pattern-recognition 输出的模式识别报告
2. 对每个识别的模式生成三个优化方案（激进、保守、折中）
3. 使用 diff 格式展示具体代码修改
4. 评估每个方案的优缺点
5. 推荐最佳方案并说明理由
6. 总结整体优化预期收益

## 依赖关系
- 依赖：pattern-recognition（必须有完整的模式识别报告）

## 完成标准
1. ✅ 为每个模式提供至少3个优化方案
2. ✅ 每个方案包含具体的代码修改（diff格式）
3. ✅ 包含修改文件、行号、影响范围、风险评估
4. ✅ 提供方案对比表格（评估维度）
5. ✅ 明确推荐方案并说明理由
6. ✅ 输出完整格式化的报告（markdown）

## 注意事项
- 激进方案应是performance/maintability最优解
- 保守方案应是最小改动、风险最低
- 折中方案应平衡各项指标
- 所有方案都必须保证功能正确性

## 原子skill位置
./.claude/skills/code-optimizer/atomic-skills/improvement-suggestion/SKILL.md