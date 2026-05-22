---
name: module-integration
description: 整合多模块需求生成的代码，解决模块间依赖关系，统一共享资源，确保整个系统逻辑一致。在多模块需求的代码生成后自动执行。
---

# Module Integration 原子Skill

## 概述
整合多模块需求生成的多个代码文件，解决模块间的依赖关系，统一共享资源，确保整个系统逻辑一致、结构清晰、无冲突。

## 核心能力
- 整合模块间依赖关系
- 统一共享类型定义
- 统一API封装
- 统一工具函数
- 配置路由和状态管理
- 消除重复代码
- 确保数据流正确

## 输入
code-generation输出的生成代码文件和生成清单

## 输出
整合后的代码文件和整合报告，包含以下内容：

```markdown
# 模块整合报告

## 整合概览
- **整合时间**：2026-04-08 20:00:40
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
  - src/views/meeting/Detail.vue: 定义了 Meeting 类型，包含 status 和 password 字段
- **影响**：类型不一致，可能导致运行时错误

### 问题3：分散的API调用
- **发现**：每个模块直接使用 axios 调用API，没有统一封装
- **位置**：
  - src/views/meeting/Create.vue: 直接使用 axios.post('/api/meetings', ...)
  - src/views/meeting/List.vue: 直接使用 axios.get('/api/meetings')
  - src/views/meeting/Detail.vue: 直接使用 axios.get('/api/meetings/:id')
- **影响**：API调用方式不一致，难以维护

### 问题4：缺少路由配置
- **发现**：模块间跳转没有统一路由配置
- **位置**：各模块直接使用 window.location.href 或 router.push 不规范
- **影响**：路由管理混乱，无法实现懒加载

### 问题5：状态管理缺失
- **发现**：没有使用全局状态管理，数据无法在模块间共享
- **影响**：用户从列表进入详情后，无法获取完整数据

## 整合解决方案

### 方案1：统一共享类型定义
- **旧结构**：每个模块单独定义
- **新结构**：创建共享类型文件
- **文件**：src/types/meeting.ts
- **内容**：
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
- **旧结构**：每个模块直接使用 axios
- **新结构**：创建共享API封装
- **文件**：src/api/meeting.ts
- **内容**：
  ```ts
  /**
   * 会议API封装
   * 统一管理所有会议相关的API调用
   */
  import axios from 'axios';
  
  // 创建 axios 实例
  const api = axios.create({
    baseURL: '/api',
    timeout: 10000
  });
  
  /**
   * 创建会议
   * @param params 会议参数
   * @returns 创建成功的会议对象
   */
  export const createMeeting = (params: MeetingParams) => api.post('/meetings', params);
  
  /**
   * 获取会议列表
   * @returns 会议列表
   */
  export const getMeetings = () => api.get('/meetings');
  
  /**
   * 获取会议详情
   * @param id 会议ID
   * @returns 会议详情
   */
  export const getMeeting = (id: string) => api.get(`/meetings/${id}`);
  
  /**
   * 更新会议
   * @param id 会议ID
   * @param params 更新参数
   * @returns 更新后的会议对象
   */
  export const updateMeeting = (id: string, params: MeetingParams) => api.put(`/meetings/${id}`, params);
  
  /**
   * 删除会议
   * @param id 会议ID
   * @returns 删除成功标志
   */
  export const deleteMeeting = (id: string) => api.delete(`/meetings/${id}`);
  ```

### 方案3：统一工具函数
- **旧结构**：重复定义 formatDate 函数
- **新结构**：创建共享工具函数
- **文件**：src/utils/date.ts
- **内容**：
  ```ts
  /**
   * 格式化日期
   * 将ISO格式的日期字符串转换为 'YYYY-MM-DD HH:mm' 格式
   * @param timestamp ISO格式的日期字符串
   * @returns 格式化后的字符串
   * 
   * @example
   * formatDate('2026-04-08T10:30:00Z') // '2026-04-08 10:30'
   */
  export function formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
  }
  ```

### 方案4：统一路由配置
- **旧结构**：每个模块独立配置路由
- **新结构**：创建统一路由文件
- **文件**：src/router/meeting.ts
- **内容**：
  ```ts
  /**
   * 会议模块路由配置
   * 统一管理所有会议相关页面的路由
   */
  import { createRouter, createWebHistory } from 'vue-router';
  import CreateMeeting from '@/views/meeting/Create.vue';
  import ListMeeting from '@/views/meeting/List.vue';
  import DetailMeeting from '@/views/meeting/Detail.vue';
  
  const routes = [
    {
      path: '/meeting/create',
      name: 'meeting-create',
      component: CreateMeeting
    },
    {
      path: '/meeting/list',
      name: 'meeting-list',
      component: ListMeeting
    },
    {
      path: '/meeting/detail/:id',
      name: 'meeting-detail',
      component: DetailMeeting,
      props: true
    }
  ];
  
  const router = createRouter({
    history: createWebHistory(),
    routes
  });
  
  export default router;
  ```

### 方案5：统一状态管理
- **旧结构**：没有使用全局状态管理
- **新结构**：创建Pinia store
- **文件**：src/stores/meeting.ts
- **内容**：
  ```ts
  /**
   * 会议状态管理
   * 使用Pinia管理会议数据，供多个模块共享
   */
  import { defineStore } from 'pinia';
  import { getMeetings } from '@/api/meeting';
  import { Meeting } from '@/types/meeting';
  
  export const useMeetingStore = defineStore('meeting', {
    state: () => ({
      meetings: [] as Meeting[],
      currentMeeting: null as Meeting | null
    }),
    actions: {
      /**
       * 加载会议列表
       */
      async loadMeetings() {
        const response = await getMeetings();
        this.meetings = response.data;
      },
      
      /**
       * 设置当前会议
       * @param meeting 会议对象
       */
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
| src/views/meeting/Create.vue | 删除了 formatDate 函数，导入 src/utils/date.ts |
| src/views/meeting/List.vue | 删除了 formatDate 函数，导入 src/utils/date.ts |
| src/views/meeting/Detail.vue | 删除了 formatDate 函数，导入 src/utils/date.ts |
| src/views/meeting/Create.vue | 删除了 axios.post，导入 createMeeting 函数 |
| src/views/meeting/List.vue | 删除了 axios.get，导入 getMeetings 函数 |
| src/views/meeting/Detail.vue | 删除了 axios.get，导入 getMeeting 函数 |
| src/router/index.ts | 导入 src/router/meeting.ts 并添加到路由中 |
| src/main.js | 导入 Pinia 并使用 useMeetingStore |

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
- 验证生成代码的语法正确性
- 运行测试确保功能正常
- 检查是否符合项目规范

## 注意事项
- 整合必须在代码生成后执行
- 保持原有功能不变，只做结构优化
- 所有共享资源必须有完整注释
- 优先使用项目已有模式

## 原子skill位置
./.claude/skills/code-generator/atomic-skills/module-integration/SKILL.md