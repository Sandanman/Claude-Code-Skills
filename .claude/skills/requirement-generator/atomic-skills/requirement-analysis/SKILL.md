---
name: requirement-analysis
description: 分析需求类型，判断是否为新建代码、是否需要新增API、是否涉及权限控制。在模块分解后自动执行。
---

# Requirement Analysis 原子 Skill

## 概述
分析需求的类型和本质特征，判断是新建功能还是修改现有代码，是否需要新增API接口，是否涉及权限控制，为后续设计提供技术决策依据。

## 核心能力
- 判断代码操作类型：新建 vs 修改
- 判断是否需要新增API接口
- 判断是否涉及权限控制
- 判断是否需要状态管理
- 识别关键约束

## 输入
requirement-decomposition 输出的模块分解结果
requirement-input-processor 输出的 input_type

## 输出
需求分析结果，包含以下内容：

```json
{
  "code_action": "new",
  "requires_new_api": true,
  "has_auth": true,
  "auth_level": "user",
  "requires_state_management": false,
  "constraints": [
    "必须使用TypeScript",
    "必须遵循项目代码规范"
  ],
  "analysis": {
    "code_action_reason": "需求描述为'实现用户登录'，无任何修改现有功能的描述，故判断为新建",
    "api_reason": "需求涉及'用户登录'和'用户管理'，需要后端API交互，故判断为需要新增API",
    "auth_reason": "登录和用户管理功能涉及身份验证和权限控制，故判断为涉及权限控制",
    "state_management_reason": "模块间无状态共享，仅页面跳转，故判断为不需要状态管理",
    "constraints_reason": "需求中未提及约束，但根据上下文补充默认约束"
  }
}
```

## 判断逻辑

### 1. 代码操作类型（code_action）
| 判断依据 | 判断结果 |
|----------|----------|
| 需求关键词："实现"、"添加"、"创建"、"开发" | `new` |
| 需求关键词："修改"、"优化"、"重构"、"升级"、"修复" | `modify` |
| input_type 为 `code_snippet` 且提到"在现有代码基础上" | `modify` |
| 无明确动词，但有功能描述 | `new`（默认） |

### 2. 是否需要新增API（requires_new_api）
| 判断依据 | 判断结果 |
|----------|----------|
| 需求涉及：用户、数据、保存、提交、后端、接口 | `true` |
| api_spec_analysis 检测到新端点 | `true` |
| 需求仅涉及前端交互、展示、工具 | `false` |
| 模块类型为：crud、auth、workflow、realtime | `true` |
| 模块类型为：tool、static、visualization | `false`（除非明确要求） |

### 3. 是否涉及权限控制（has_auth）
| 判断依据 | 判断结果 |
|----------|----------|
| 需求关键词：登录、注册、权限、角色、管理员、用户、认证、鉴权 | `true` |
| 模块类型为：auth | `true` |
| 模块类型为：crud 且有"编辑"、"删除"、"管理" | `true` |
| 模块类型为：workflow 且有"审批"、"提交" | `true` |
| 其他情况 | `false` |

### 4. 权限级别（auth_level）
| 情况 | 值 |
|------|----|
| 有登录/注册 | `user` |
| 有管理员、超级用户、后台 | `admin` |
| 有游客、访客 | `guest` |
| 无权限概念 | `none` |

### 5. 是否需要状态管理（requires_state_management）
| 判断依据 | 判断结果 |
|----------|----------|
| 模块间有共享数据（如登录后全局用户信息） | `true` |
| 多个页面共享同一数据（如购物车） | `true` |
| 模块独立，仅页面跳转 | `false` |
| 需求涉及实时数据、通知 | `true` |

### 6. 约束提取（constraints）
| 来源 | 约束示例 |
|------|----------|
| 需求文本中明确提到 | "必须使用TypeScript"、"使用Vue 3" |
| api_spec_analysis 中检测到的认证需求 | "JWT token 认证" |
| 模块类型推断 | "用户管理需要数据验证" |
| 技术栈推断 | "使用Element Plus，需符合其规范" |

## 执行逻辑
1. 接收模块分解结果和 input_type
2. 根据 input_type 判断 code_action（如 code_snippet → modify）
3. 根据功能模块类型和关键词判断 requires_new_api
4. 根据 api_spec_analysis 判断是否需要新增 API（**增强 v1.1**）
5. 根据关键词和模块类型判断 has_auth 和 auth_level
6. 根据模块间依赖和数据流判断 requires_state_management
7. 从需求文本中提取约束条件
8. 输出分析报告

## 依赖关系
- 依赖：requirement-decomposition

## 完成标准
1. 正确判断 code_action（new/modify）
2. 正确判断 requires_new_api（true/false）
3. 正确判断 has_auth 和 auth_level
4. 正确判断 requires_state_management（true/false）
5. 提取至少1条约束条件
6. 输出完整的JSON格式数据

## 错误处理
- **判断模糊**：优先保守判断（如：不确定是否修改 → 判断为new）
- **冲突需求**：记录警告，如"需求既要求修改又要求新建，优先判断为modify"
- **缺少信息**：使用默认值（如：auth_level 默认为 "none"）

## 示例

**输入**：
```json
{
  "input_type": "code_snippet",
  "decomposition": {
    "modules": [
      {
        "name": "用户登录",
        "type": "auth",
        "features": ["登录页面", "调用现有login API", "存储token"]
      }
    ]
  },
  "api_spec_analysis": {
    "new_endpoints": [],
    "detected_api_calls": [{"function": "login", "params": ["username", "password"]}]
  }
}
```

**输出**：
```json
{
  "code_action": "modify",
  "requires_new_api": false,
  "has_auth": true,
  "auth_level": "user",
  "requires_state_management": true,
  "constraints": ["复用现有 login API", "JWT token 认证"],
  "analysis": {
    "code_action_reason": "input_type 为 code_snippet，需求为在现有代码基础上新增登录页面，故判断为 modify",
    "api_reason": "api_spec_analysis 检测到调用现有 login API，未检测到新端点，故判断为不需要新增 API",
    "auth_reason": "登录功能涉及身份验证，故判断为涉及权限控制",
    "state_management_reason": "需要存储 token 供后续请求使用，故判断为需要状态管理",
    "constraints_reason": "从 api_spec_analysis 中提取 JWT token 认证需求"
  }
}
```

## 注意事项
- 不分析具体代码，仅基于需求语义
- 所有判断必须有理由支持
- 保守判断优先，避免误判
- 当 input_type 为 code_snippet 时，优先判断为 modify（**新增 v1.1**）

## 版本
v1.1 - 改进版：增强与 code_snippet_analysis / api_spec_analysis 的整合，优先判断为 modify