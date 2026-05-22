---
name: test-case-generator
description: 为每个功能模块生成基本测试用例，覆盖正常路径、异常场景、边界条件。在需求分析后自动执行。
---

# Test Case Generator 原子Skill

## 概述
为需求中的每个功能模块生成测试用例，覆盖正常流程、异常场景和边界条件，为后续开发提供测试基础。

## 核心能力
- 生成正常路径测试用例
- 生成异常场景测试用例
- 生成边界条件测试用例
- 生成权限控制测试用例
- 不依赖具体测试框架，输出通用描述

## 输入
requirement-analysis输出的需求分析
ui-component-identifier输出的UI组件清单

## 输出
测试用例集合，包含以下内容：

```json
{
  "test_cases": [
    {
      "id": "TC-001",
      "module": "用户登录",
      "type": "normal",
      "priority": "P1",
      "title": "正常登录",
      "preconditions": "用户已注册，账号密码正确",
      "steps": [
        "1. 访问 /login 页面",
        "2. 输入用户名：testuser",
        "3. 输入密码：123456",
        "4. 点击登录按钮"
      ],
      "expected": [
        "调用 POST /api/login",
        "收到200响应",
        "跳转到 /home 页面",
        "localStorage保存token"
      ],
      "validation_points": [
        "API请求参数正确",
        "响应token不为空",
        "路由跳转正确"
      ]
    },
    {
      "id": "TC-002",
      "module": "用户登录",
      "type": "exception",
      "priority": "P1",
      "title": "用户名为空",
      "preconditions": "无",
      "steps": [
        "1. 访问 /login 页面",
        "2. 不输入用户名",
        "3. 输入密码：123456",
        "4. 点击登录按钮"
      ],
      "expected": [
        "表单验证提示'用户名不能为空'",
        "不调用API",
        "页面停留在登录页"
      ],
      "validation_points": [
        "前端验证生效",
        "无网络请求"
      ]
    }
  ],
  "test_summary": {
    "total": 2,
    "normal": 1,
    "exception": 1,
    "boundary": 0,
    "auth": 0,
    "priority_p1": 2,
    "coverage": "基本功能覆盖"
  }
}
```

## 测试用例类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `normal` | 正常流程 | 正确输入→正常提交 |
| `exception` | 异常处理 | 网络错误、服务器错误 |
| `boundary` | 边界条件 | 密码最大长度、空值 |
| `auth` | 权限控制 | 未登录访问受保护页面 |
| `negative` | 负向用例 | 非法输入、恶意数据 |

## 测试用例生成规则

### 1. Normal（正常流程）
- 必填字段都输入有效值
- 输入符合业务规则
- 预期：成功完成业务操作

### 2. Exception（异常场景）
- 网络超时、服务器500、API返回错误
- 预期：显示错误提示，不崩溃

### 3. Boundary（边界条件）
- 必填字段为空
- 长度边界（0字符、最大长度）
- 数值边界（0、负数）
- 预期：验证提示

### 4. Auth（权限控制）
- 无token访问需要认证的API
- 普通用户访问管理员功能
- 预期：返回401/403

## 优先级定义
- **P1**：核心功能，必须测试
- **P2**：重要功能，需要测试
- **P3**：增强功能，可选测试

## 执行逻辑
1. 接收 UI 组件清单和需求分析
2. 为每个模块生成测试用例
3. 覆盖：normal、exception、boundary、auth
4. 分配优先级
5. 格式化为标准JSON
6. 输出测试用例集合

## 依赖关系
- 依赖：ui-component-identifier + requirement-analysis

## 完成标准
1. ✅ 每个模块至少1个normal测试用例
2. ✅ 每个必填字段有boundary测试用例
3. ✅ 如果涉及API调用，有exception测试用例
4. ✅ 如果涉及权限，有auth测试用例
5. ✅ 所有测试用例步骤清晰、可执行
6. ✅ 输出完整的JSON格式数据

## 错误处理
- **模块无功能点**：跳过该模块
- **无法生成测试**：标记为"待补充"

## 示例

**模块**："用户登录"
**UI组件**：form（username、password）+ button

**生成测试用例**：
1. TC-001 正常登录
2. TC-002 用户名为空
3. TC-003 密码为空
4. TC-004 网络错误

**输出**：如上JSON示例

## 注意事项
- 测试用例必须具体、可执行
- 步骤要明确，不能模糊
- 预期结果要可验证
- 不依赖具体测试框架（Jest/Vitest）

## 原子skill位置
./.claude/skills/requirement-generator/atomic-skills/test-case-generator/SKILL.md
