---
name: requirement-analysis
description: 整合需求分解与分析（K1任务折叠：decomposition + analysis 合并）。分析需求类型、模块分解、依赖关系、约束提取。在 input-processor 后执行。
---

# Requirement Analysis 原子 Skill（v1.2 - K1任务折叠版）

## 概述
**K1任务折叠**：本 atomic skill 整合了 `requirement-decomposition`（分解）与 `requirement-analysis`（分析），减少 τ 消耗~20%。
将原始需求分解为功能模块 + 分析需求类型与约束，为后续设计提供技术决策依据。

## τ 预算
- simple：500 token
- moderate：1000 token
- complex：1500 token

## 核心能力
- **K1折叠**：模块分解 + 需求分析一体化执行
- 判断代码操作类型：新建 vs 修改
- 判断是否需要新增API接口
- 判断是否涉及权限控制
- 判断是否需要状态管理
- 识别关键约束

## K2 技能栈叠（输入）
- **优先读取**共享上下文 `task_skill.md` 中的 requirement-input-processor 输出
- 如果共享上下文无数据，才读取直接输入

## 输出
模块分解 + 需求分析一体化结果：

```json
{
  "decomposition": {
    "modules": [
      {
        "name": "用户登录",
        "description": "用户通过用户名和密码登录系统",
        "type": "auth",
        "features": ["用户名输入", "密码输入", "登录按钮", "跳转首页"],
        "dependencies": [],
        "priority": "high",
        "ignore": false,
        "estimated_complexity": "low",
        "estimated_lines": 150,
        "source": "user_text"
      }
    ],
    "ignored_modules": [],
    "total_modules": 1,
    "dependency_graph": { "用户登录": [] },
    "entry_points": ["/login"]
  },
  "code_action": "new",
  "requires_new_api": true,
  "has_auth": true,
  "auth_level": "user",
  "requires_state_management": false,
  "constraints": ["必须使用TypeScript", "必须遵循项目代码规范"],
  "analysis": {
    "code_action_reason": "需求描述为'实现用户登录'，无任何修改现有功能的描述，故判断为新建",
    "api_reason": "需求涉及'用户登录'和'用户管理'，需要后端API交互，故判断为需要新增API",
    "auth_reason": "登录和用户管理功能涉及身份验证和权限控制，故判断为涉及权限控制",
    "state_management_reason": "模块间无状态共享，仅页面跳转，故判断为不需要状态管理",
    "constraints_reason": "需求中未提及约束，但根据上下文补充默认约束"
  }
}
```

## 模块类型分类

| 类型 | 说明 | 示例 |
|------|------|------|
| `auth` | 认证授权模块 | 登录、注册、权限管理 |
| `crud` | 数据管理模块 | 用户管理、订单管理、会议管理 |
| `tool` | 工具类模块 | 日期格式化、文件转换、计算器 |
| `visualization` | 可视化模块 | 图表、仪表盘、数据大屏 |
| `workflow` | 工作流模块 | 审批流程、订单状态追踪 |
| `wizard` | 向导流程 | 多步骤表单、结账向导 |
| `realtime` | 实时交互 | 聊天、协作、通知 |
| `static` | 静态展示 | 关于页面、帮助中心 |
| `layout` | 布局组件 | 导航栏、侧边栏、页脚 |

## 执行逻辑（K1任务折叠一体化）

### 阶段1：模块分解（折叠入本skill）
1. 从共享上下文读取 requirement-input-processor 输出
2. 使用语义聚类将功能点分组（合并相似功能）
3. 生成模块名称和描述
4. 识别模块间依赖关系，输出依赖图
5. 评估每个模块优先级和复杂度
6. 标记可忽略模块

### 阶段2：需求分析
7. 根据 input_type 判断 code_action（code_snippet → modify）
8. 根据模块类型判断 requires_new_api
9. 根据 api_spec_analysis 判断是否需要新增 API
10. 根据关键词判断 has_auth 和 auth_level
11. 根据模块间依赖判断 requires_state_management
12. 从需求文本提取约束条件

## 依赖关系（v1.2）
- **K2栈叠**：优先从共享上下文 `task_skill.md` 读取 requirement-input-processor 输出
- 不再依赖独立的 requirement-decomposition（已折叠入本skill）

## 完成标准（v1.2）
1. 完成模块分解（模块数 >= 1）
2. 正确判断 code_action（new/modify）
3. 正确判断 requires_new_api（true/false）
4. 正确判断 has_auth 和 auth_level
5. 正确判断 requires_state_management（true/false）
6. 提取至少1条约束条件
7. 输出完整的JSON格式数据（含 decomposition + analysis）

## 错误处理
- **判断模糊**：优先保守判断（如：不确定是否修改 → 判断为new）
- **冲突需求**：记录警告，如"需求既要求修改又要求新建，优先判断为modify"
- **缺少信息**：使用默认值（如：auth_level 默认为 "none"）
- **分解模糊**：使用通用分类（auth/crud/tool）

## 示例

**输入（来自共享上下文）**：
```json
{
  "input_type": "code_snippet",
  "extracted_features": ["登录页面", "调用现有login API", "存储token"],
  "api_spec_analysis": {
    "new_endpoints": [],
    "detected_api_calls": [{"function": "login", "params": ["username", "password"]}]
  }
}
```

**输出**：
```json
{
  "decomposition": {
    "modules": [
      {
        "name": "用户登录",
        "type": "auth",
        "features": ["登录页面", "调用现有login API", "存储token"],
        "dependencies": [],
        "priority": "high",
        "estimated_complexity": "low"
      }
    ],
    "total_modules": 1,
    "entry_points": ["/login"]
  },
  "code_action": "modify",
  "requires_new_api": false,
  "has_auth": true,
  "auth_level": "user",
  "requires_state_management": true,
  "constraints": ["复用现有 login API", "JWT token 认证"]
}
```

## 注意事项（v1.2）
- **K1折叠**：分解 + 分析一体化执行，τ 节省约20%
- **K2栈叠**：优先读取共享上下文，禁止重复解析
- 不分析具体代码，仅基于需求语义
- 当 input_type 为 code_snippet 时，优先判断为 modify

## 版本
v1.2 - K1任务折叠版：整合 decomposition + analysis，K2技能栈叠，τ 预算管理