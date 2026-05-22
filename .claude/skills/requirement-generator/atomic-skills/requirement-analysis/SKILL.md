---
name: requirement-analysis
description: 分析需求类型，判断是否为新建代码、是否需要新增API、是否涉及权限控制。在模块分解后自动执行。
---

# Requirement Analysis 原子Skill

## 概述
分析需求的类型和本质特征，判断是新建功能还是修改现有代码，是否需要新增API接口，是否涉及权限控制，为后续设计提供技术决策依据。

## 核心能力
- 判断代码操作类型：新建 vs 修改
- 判断是否需要新增API接口
- 判断是否涉及权限控制
- 判断是否需要状态管理
- 识别关键约束

## 输入
requirement-decomposition输出的模块分解结果

## 输出
需求分析结果，包含以下内容：

```json
{
  "code_action": "new",  // "new" 或 "modify"
  "requires_new_api": true,  // 是否需要新增API
  "has_auth": true,  // 是否涉及权限控制
  "auth_level": "user",  // "user" / "admin" / "guest" / "none"
  "requires_state_management": false,  // 是否需要Vuex/Pinia等状态管理
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
| 无明确动词，但有功能描述 | `new`（默认） |

### 2. 是否需要新增API（requires_new_api）
| 判断依据 | 判断结果 |
|----------|----------|
| 需求涉及：用户、数据、保存、提交、后端、接口 | `true` |
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
| 模块类型推断 | "用户管理需要数据验证" |
| 技术栈推断 | "使用Element Plus，需符合其规范" |

## 执行逻辑
1. 接收模块分解结果
2. 根据模块类型和功能关键词判断 code_action
3. 根据功能模块类型和关键词判断 requires_new_api
4. 根据关键词和模块类型判断 has_auth 和 auth_level
5. 根据模块间依赖和数据流判断 requires_state_management
6. 从需求文本中提取约束条件
7. 输出分析报告

## 依赖关系
- 依赖：requirement-decomposition

## 完成标准
1. ✅ 正确判断 code_action（new/modify）
2. ✅ 正确判断 requires_new_api（true/false）
3. ✅ 正确判断 has_auth 和 auth_level
4. ✅ 正确判断 requires_state_management（true/false）
5. ✅ 提取至少1条约束条件
6. ✅ 输出完整的JSON格式数据

## 错误处理
- **判断模糊**：优先保守判断（如：不确定是否修改 → 判断为new）
- **冲突需求**：记录警告，如"需求既要求修改又要求新建，优先判断为modify"
- **缺少信息**：使用默认值（如：auth_level 默认为 "none"）

## 示例

**输入**：
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
        "estimated_complexity": "medium",
        "estimated_lines": 300
      },
      {
        "name": "用户管理",
        "description": "用户的增删改查功能",
        "type": "crud",
        "features": ["用户列表", "用户详情", "编辑用户", "删除用户"],
        "dependencies": ["用户登录"],
        "priority": "high",
        "ignore": false,
        "estimated_complexity": "high",
        "estimated_lines": 600
      }
    ],
    "ignored_modules": [],
    "total_modules": 2,
    "dependency_graph": {
      "用户登录": [],
      "用户管理": ["用户登录"]
    }
  }
}
```

**处理过程**：
1. code_action：两个模块都是"实现"，判断为 `new`
2. requires_new_api：两个模块都涉及数据交互，判断为 `true`
3. has_auth：模块类型为 auth，判断为 `true`，auth_level 为 `user`
4. requires_state_management：用户登录后信息需要全局使用，判断为 `true`
5. constraints：需求未明确，但根据上下文补充："必须使用TypeScript"

**输出**：
```json
{
  "code_action": "new",
  "requires_new_api": true,
  "has_auth": true,
  "auth_level": "user",
  "requires_state_management": true,
  "constraints": [
    "必须使用TypeScript"
  ],
  "analysis": {
    "code_action_reason": "需求描述为'实现用户登录'和'用户管理'，无任何修改现有功能的描述，故判断为新建",
    "api_reason": "需求涉及'用户登录'和'用户管理'，需要后端API交互，故判断为需要新增API",
    "auth_reason": "登录和用户管理功能涉及身份验证和权限控制，故判断为涉及权限控制",
    "state_management_reason": "用户登录后需要在多个页面共享用户信息，故判断为需要状态管理",
    "constraints_reason": "需求中未提及约束，但根据模块类型和上下文补充默认约束'
  }
}
```

## 注意事项
- 不分析具体代码，仅基于需求语义
- 所有判断必须有理由支持
- 保守判断优先，避免误判
- 不假设任何技术栈，只基于需求描述

## 原子skill位置
./.claude/skills/requirement-generator/atomic-skills/requirement-analysis/SKILL.md