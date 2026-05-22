---
name: documentation-update
description: 为生成的代码添加完整注释，确保所有组件、函数、类型都有清晰的文档说明。在代码验证通过后自动执行。继承requirements.json中的质量评估和建议。
---

# Documentation Update 原子Skill

## 概述
为生成的代码文件添加完整、详细的注释，确保所有组件、函数、类型、API都有清晰的文档说明。**继承 requirements.json 中的质量评估和改进建议**，提高代码可读性和可维护性。

## 核心能力
- 添加组件注释
- 添加函数注释
- 添加类型注释
- 添加API注释
- 添加使用示例
- 添加参数和返回值说明
- 继承 quality.recommendations 作为注释建议
- 记录 quality.score 作为代码质量参考

## 输入
- code-validation 输出的验证通过的代码文件
- requirement-reader 输出的需求数据（包含 quality）

## 输出
带完整注释的代码文件，包含以下内容：

### 注释完整性报告

```markdown
# 注释更新报告

## 更新概览
- **更新时间**：2026-04-08 20:01:00
- **更新文件**：[X]个
- **注释类型**：组件、函数、类型、API
- **更新状态**：完成

## 注释规范

### Vue组件注释格式
```vue
<!-- 
  组件名称
  组件功能描述
  
  Props:
  - propName: 类型 - 描述
  
  Emits:
  - eventName: 描述
  
  使用示例：
  <ComponentName :prop="value" />
-->
```

### 函数注释格式
```js
/**
 * 函数名称
 * 功能描述
 * 
 * @param {类型} paramName - 参数描述
 * @returns {类型} 返回值描述
 * 
 * @example
 * const result = functionName(param)
 */
```

### 类型注释格式
```ts
/**
 * 类型名称
 * 类型描述
 */
export interface TypeName {
  /** 字段描述 */
  fieldName: string
}
```

## 更新的文件列表

### 文件1：src/views/Login.vue
- **注释类型**：组件注释
- **注释内容**：
  ```vue
  <!-- 
    Login 组件
    用户登录页面，处理用户登录流程
    
    Props:
    - 无
    
    Emits:
    - 无
    
    使用示例：
    <Login />
  -->
  ```
- **更新状态**：✅ 完成

### 文件2：src/utils/formatDate.ts
- **注释类型**：函数注释
- **注释内容**：
  ```ts
  /**
   * 格式化日期
   * 将ISO格式的日期字符串转换为 'YYYY-MM-DD HH:mm' 格式
   * 
   * @param {string} timestamp - ISO格式的日期字符串（如 '2026-04-08T10:30:00Z'）
   * @returns {string} 格式化后的字符串（如 '2026-04-08 10:30'）
   * 
   * @example
   * formatDate('2026-04-08T10:30:00Z') // '2026-04-08 10:30'
   */
  export function formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
  }
  ```
- **更新状态**：✅ 完成

### 文件3：src/types/meeting.ts
- **注释类型**：类型注释
- **注释内容**：
  ```ts
  /**
   * 会议类型
   * 会议的完整信息
   */
  export interface Meeting {
    /** 会议ID */
    id: string;
    /** 会议标题 */
    title: string;
    /** 开始时间（ISO格式） */
    startTime: string;
    /** 结束时间（ISO格式） */
    endTime: string;
    /** 是否需要密码 */
    hasPassword: boolean;
    /** 会议状态 */
    status: 'pending' | 'ongoing' | 'completed';
  }
  ```
- **更新状态**：✅ 完成

### 文件4：src/api/meeting.ts
- **注释类型**：API注释
- **注释内容**：
  ```ts
  /**
   * 会议API封装
   * 统一管理所有会议相关的API调用
   */
  import axios from 'axios';
  
  /**
   * 创建会议
   * 创建新的会议
   * 
   * @param {MeetingParams} params - 会议参数
   * @returns {Promise<Meeting>} 创建成功的会议对象
   * 
   * @example
   * const meeting = await createMeeting({
   *   title: '项目会议',
   *   startTime: '2026-04-08T10:00:00Z',
   *   endTime: '2026-04-08T11:00:00Z',
   *   hasPassword: false
   * });
   */
  export const createMeeting = (params: MeetingParams) => api.post('/meetings', params);
  ```
- **更新状态**：✅ 完成

## 注释统计

| 文件类型 | 文件数量 | 注释类型 | 注释数量 |
|----------|----------|----------|----------|
| Vue组件 | 2 | 组件注释 | 2 |
| JavaScript/TypeScript | 3 | 函数注释 | 5 |
| TypeScript | 1 | 类型注释 | 2 |
| API | 1 | API注释 | 5 |
| **总计** | **7** | - | **14** |

## 注释质量检查

| 检查项 | 状态 |
|--------|------|
| 所有组件都有注释 | ✅ 是 |
| 所有函数都有注释 | ✅ 是 |
| 所有类型都有注释 | ✅ 是 |
| 注释清晰易懂 | ✅ 是 |
| 包含使用示例 | ✅ 是 |
| 参数说明完整 | ✅ 是 |
| 返回值说明完整 | ✅ 是 |

## 注释规范遵循

| 规范项 | 是否遵循 |
|--------|----------|
| JSDoc 格式 | ✅ 是 |
| Vue组件注释格式 | ✅ 是 |
| TypeScript 注释格式 | ✅ 是 |
| 包含使用示例 | ✅ 是 |

## 结论
所有生成的代码文件都已添加完整注释，注释清晰、规范，符合项目标准。

## 下一步建议
- 代码已准备就绪，可以提交到版本控制系统
- 可以开始测试代码功能

## 注意事项
- 注释必须真实反映代码功能
- 使用示例必须可运行
- 参数和返回值说明必须准确
- 注释语言与代码主体语言一致
- 继承 requirements.json 中的 quality.recommendations，作为未来改进建议记录到注释中
- 记录 quality.score 供后续质量跟踪使用

## 与 requirement-generator 的协同

### 质量评估继承
requirements.json 中的 `quality` 字段包含需求质量评估和改进建议：

```json
{
  "quality": {
    "score": 95,
    "issues": [],
    "recommendations": [
      "建议添加'记住我'功能",
      "建议增加表单验证提示"
    ]
  }
}
```

在注释更新报告中，继承这些信息：

```markdown
## 需求质量评估

### 质量评分
- **来源**：requirements.json
- **评分**：95/100

### 改进建议（来自 requirement-generator）
1. 建议添加'记住我'功能
2. 建议增加表单验证提示

### 后续优化方向
以上建议可作为功能迭代的参考，提升用户体验。
```

这些信息会被记录在注释更新报告中，供开发团队参考。

## 原子skill位置
./.claude/skills/code-generator/atomic-skills/documentation-update/SKILL.md