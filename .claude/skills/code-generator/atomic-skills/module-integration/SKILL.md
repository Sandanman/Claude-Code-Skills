---
name: module-integration
description: 整合多模块需求生成的代码，解决模块间依赖关系，统一共享资源，确保整个系统逻辑一致。仅在多模块需求的 code-generation 之后执行（场景3且多模块时必须执行）。
---

# Module Integration 原子Skill v1.2

## 概述

整合多模块需求生成的多个代码文件，解决模块间的依赖关系，统一共享资源，确保整个系统逻辑一致、结构清晰、无冲突。

**v1.2 改进**：明确仅在场景3且多模块需求时必须执行，单模块需求跳过此步骤。

## 核心能力

- 整合模块间依赖关系
- 统一共享类型定义
- 统一API封装
- 统一工具函数
- 配置路由和状态管理
- 消除重复代码
- 确保数据流正确

## 输入

- **multi-scenario-adapter 输出**：包含场景类型（场景3多模块）
- **code-generation 输出**：包含生成代码文件和生成清单
- **code-design 输出**：包含设计文档（模块关系、共享资源）

## 输出

整合报告和更新后的代码文件：

```markdown
# 模块整合报告 v1.2

## 整合概览
- **整合时间**：2026-04-08 20:00:40
- **场景类型**：场景3-复杂需求
- **需求类型**：多模块
- **参与模块**：[模块1, 模块2, 模块3]
- **整合状态**：完成

## 整合前问题分析

### 问题1：重复代码
- **发现**：在多个模块中重复定义了相同的工具函数和类型
- **位置**：
  - src/views/meeting/Create.vue: 重复定义了 formatDate 函数
  - src/views/meeting/List.vue: 重复定义了 formatDate 函数
  - src/views/meeting/Detail.vue: 重复定义了 formatDate 函数
- **影响**：维护成本高，容易不一致

### 问题2：不一致的类型定义
- **发现**：不同模块定义了相同的 Meeting 类型，但字段不一致
- **位置**：
  - src/views/meeting/Create.vue: 定义了 Meeting 类型，缺少 status 字段
  - src/views/meeting/List.vue: 定义了 Meeting 类型，包含 status 字段
- **影响**：类型不一致，可能导致运行时错误

### 问题3：分散的API调用
- **发现**：每个模块直接使用 axios 调用API，没有统一封装
- **影响**：API调用方式不一致，难以维护

### 问题4：缺少路由配置
- **发现**：模块间跳转没有统一路由配置
- **影响**：路由管理混乱，无法实现懒加载

### 问题5：状态管理缺失
- **发现**：没有使用全局状态管理，数据无法在模块间共享
- **影响**：用户从列表进入详情后，无法获取完整数据

## 整合解决方案

### 方案1：统一共享类型定义
- **旧结构**：每个模块单独定义
- **新结构**：创建共享类型文件
- **文件**：src/types/meeting.ts

```ts
/**
 * 会议类型
 * 会议的完整信息
 */
export interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  hasPassword: boolean;
  status: 'pending' | 'ongoing' | 'completed';
}

/**
 * 创建会议的参数类型
 */
export interface MeetingParams {
  title: string;
  startTime: string;
  endTime: string;
  hasPassword: boolean;
}
```

### 方案2：统一API封装
- **文件**：src/api/meeting.ts

```ts
/**
 * 会议API封装
 * 统一管理所有会议相关的API调用
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

export const createMeeting = (params: MeetingParams) => api.post('/meetings', params);
export const getMeetings = () => api.get('/meetings');
export const getMeeting = (id: string) => api.get(`/meetings/${id}`);
export const updateMeeting = (id: string, params: MeetingParams) => api.put(`/meetings/${id}`, params);
export const deleteMeeting = (id: string) => api.delete(`/meetings/${id}`);
```

### 方案3：统一工具函数
- **文件**：src/utils/date.ts

```ts
/**
 * 格式化日期
 * 将ISO格式的日期字符串转换为 'YYYY-MM-DD HH:mm' 格式
 */
export function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
}
```

### 方案4：统一路由配置
- **文件**：src/router/meeting.ts

```ts
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/meeting/create', name: 'meeting-create', component: () => import('@/views/meeting/Create.vue') },
  { path: '/meeting/list', name: 'meeting-list', component: () => import('@/views/meeting/List.vue') },
  { path: '/meeting/detail/:id', name: 'meeting-detail', component: () => import('@/views/meeting/Detail.vue'), props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

### 方案5：统一状态管理
- **文件**：src/stores/meeting.ts

```ts
import { defineStore } from 'pinia';
import { getMeetings } from '@/api/meeting';
import type { Meeting } from '@/types/meeting';

export const useMeetingStore = defineStore('meeting', {
  state: () => ({
    meetings: [] as Meeting[],
    currentMeeting: null as Meeting | null
  }),
  actions: {
    async loadMeetings() {
      const response = await getMeetings();
      this.meetings = response.data;
    },
    setCurrentMeeting(meeting: Meeting) {
      this.currentMeeting = meeting;
    }
  }
});
```

## 整合结果

### 修改的文件
| 文件 | 修改内容 |
|------|----------|
| src/views/meeting/Create.vue | 导入共享类型和API |
| src/views/meeting/List.vue | 导入共享类型和API |
| src/views/meeting/Detail.vue | 导入共享类型和API |
| src/router/index.ts | 导入并注册会议路由 |

### 创建的文件
| 文件 | 说明 |
|------|------|
| src/types/meeting.ts | 共享类型定义 |
| src/api/meeting.ts | 共享API封装 |
| src/utils/date.ts | 共享工具函数 |
| src/router/meeting.ts | 会议模块路由配置 |
| src/stores/meeting.ts | 会议状态管理 |

## 整合后优势

| 维度 | 整合前 | 整合后 |
|------|--------|--------|
| 代码重复 | 高（3处） | 低（0处） |
| 类型一致性 | 不一致 | 一致 |
| API调用 | 不统一 | 统一 |
| 路由管理 | 混乱 | 统一 |
| 状态管理 | 缺失 | 有Pinia |
| 可维护性 | 低 | 高 |
| 可扩展性 | 低 | 高 |

## 验证结果
- ✅ 所有模块导入正确的共享资源
- ✅ 类型定义一致，无类型错误
- ✅ API调用通过共享函数进行
- ✅ 路由配置完整，支持懒加载
- ✅ 状态管理正常，数据可共享
- ✅ 无循环依赖

## 下一步建议
- 执行 code-validation 验证代码正确性
- 测试模块间跳转和数据传递
- 检查是否符合项目规范
```

## 执行逻辑

### 步骤1：检测执行条件

1. 读取 multi-scenario-adapter 的场景类型
2. 如果是"场景1单模块"或"场景2简单需求"：跳过此skill
3. 如果是"场景3多模块"：继续执行

### 步骤2：分析生成代码

1. 读取 code-generation 输出的所有文件
2. 识别重复定义的类型、函数、API
3. 识别不一致的导入和引用
4. 识别缺失的路由和状态管理

### 步骤3：制定整合方案

1. 设计统一的类型定义文件
2. 设计统一的API封装文件
3. 设计统一的工具函数文件
4. 设计路由配置
5. 设计状态管理

### 步骤4：执行整合

1. 创建共享资源文件
2. 修改各模块的导入语句
3. 删除重复的定义
4. 配置路由
5. 配置状态管理

### 步骤5：输出整合报告

1. 列出所有问题和解决方案
2. 列出修改和新建的文件
3. 统计整合前后的变化
4. 验证整合结果

## 依赖关系

- **依赖**：multi-scenario-adapter、code-generation、code-design
- **被依赖**：code-validation

## 完成标准

1. ✅ 所有模块导入正确的共享资源
2. ✅ 类型定义统一，无重复
3. ✅ API调用通过共享函数进行
4. ✅ 路由配置完整，支持懒加载
5. ✅ 状态管理正常，数据可共享
6. ✅ 无循环依赖
7. ✅ 输出完整整合报告

## 错误处理

- **循环依赖**：识别并解决循环导入
- **类型冲突**：统一类型定义，删除冲突
- **路由冲突**：检查路由名称是否重复
- **模块数量不足**：跳过整合（单模块）

## v1.2 改进点

1. **明确执行条件**：仅场景3多模块时执行
2. **简化单模块处理**：场景1/2跳过此步骤
3. **改进整合流程**：先分析再制定方案最后执行
4. **完善验证结果**：确保整合后无问题

## 注意事项

- 整合必须在 code-generation 后执行
- 保持原有功能不变，只做结构优化
- 所有共享资源必须有完整注释
- 优先使用项目已有模式
- 避免引入新的依赖

## 原子skill位置

`.claude/skills/code-generator/atomic-skills/module-integration/SKILL.md`