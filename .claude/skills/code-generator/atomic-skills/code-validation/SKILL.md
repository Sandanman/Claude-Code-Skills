---
name: code-validation
description: 验证生成的代码语法、规范、功能完整性。优先验证 requirements.json 中的 test_cases，并继承 quality 评估。在 code-generation 或 module-integration 之后执行。
---

# Code Validation 原子Skill v1.2

## 概述

验证生成的代码文件，确保语法正确、符合项目规范、功能完整。**优先验证 requirements.json 中的测试用例**，并继承需求质量评估结果。无严重错误时，代码可直接用于开发环境。

## 核心能力

- 语法验证（ESLint/Prettier）
- 代码规范检查（CODE_STYLE.md）
- 类型检查（TypeScript）
- 功能完整性检查
- 导入依赖验证
- 注释完整性检查
- 测试用例验证（从 requirements.json 继承）
- 质量评估继承（从 requirements.json）

## 输入

- **code-generation 输出**：生成代码文件
- **module-integration 输出**：整合后的代码文件（场景3多模块）
- **requirement-reader 输出**：包含 test_cases、quality（如有）
- **multi-scenario-adapter 输出**：包含场景类型

## 输出

代码验证报告：

```markdown
# 代码验证报告 v1.2

## 验证概览
- **验证时间**：2026-04-08 20:00:50
- **场景类型**：场景1-标准输入/场景2-简单需求/场景3-复杂需求
- **需求类型**：[单模块/多模块]
- **验证文件**：[文件数量]个
- **验证状态**：[通过/失败]

## 语法验证

### ESLint 检查
- **规则集**：项目配置的 ESLint 规则
- **问题数量**：[X]个
- **严重问题**：[0]个
- **警告**：[X]个
- **建议**：[X]个

### Prettier 格式检查
- **格式问题**：[X]个
- **自动修复**：✅ 已修复

### TypeScript 类型检查（如适用）
- **类型错误**：[0]个
- **类型警告**：[0]个

## 代码规范检查

### CODE_STYLE.md 遵循情况
| 规范项 | 是否遵循 | 说明 |
|--------|----------|------|
| 缩进 | ✅ 是 | 2空格缩进 |
| 引号 | ✅ 是 | 单引号为主 |
| 分号 | ✅ 是 | 不使用分号 |
| 命名 | ✅ 是 | 组件 PascalCase，变量 camelCase |
| Vue组件 | ✅ 是 | 使用 <script setup> 语法 |
| 箭头函数 | ✅ 是 | 优先使用 |
| 注释 | ✅ 是 | 所有组件/函数都有完整注释 |

## 功能完整性检查

### Vue组件验证
| 组件 | 问题 | 状态 |
|------|------|------|
| Login.vue | 无 | ✅ 正常 |
| MeetingCard.vue | 无 | ✅ 正常 |

### 函数验证
| 函数 | 问题 | 状态 |
|------|------|------|
| formatDate | 参数类型检查 | ✅ 正常 |
| login | 参数验证 | ✅ 正常 |

### API调用验证
| API | 问题 | 状态 |
|------|------|------|
| createMeeting | 参数类型 | ✅ 正常 |
| getMeetings | 错误处理 | ✅ 正常 |

### 导入依赖验证
| 文件 | 问题 | 状态 |
|------|------|------|
| Login.vue | 导入 userAPI | ✅ 正常 |
| MeetingCard.vue | 导入 formatDate | ✅ 正常 |

## 依赖关系验证
| 依赖 | 问题 | 状态 |
|------|------|------|
| vue | 已安装 | ✅ 正常 |
| element-plus | 已安装 | ✅ 正常 |
| pinia | 已安装 | ✅ 正常 |
| axios | 已安装 | ✅ 正常 |

## 问题汇总

| 问题类型 | 数量 | 严重性 | 处理建议 |
|----------|------|--------|----------|
| 无 | 0 | 无 | 无 |

## 验证结论
**通过**：所有代码文件语法正确，符合项目规范，功能完整，无严重错误，可以安全使用。

## 测试用例验证（来自 requirements.json）

### 测试用例1：正常登录
- **描述**：正常登录
- **步骤**：输入用户名 → 输入密码 → 点击登录
- **预期**：跳转首页
- **验证结果**：✅ 通过

### 测试用例2：用户名为空
- **描述**：用户名为空
- **步骤**：用户名为空 → 输入密码 → 点击登录
- **预期**：提示"用户名不能为空"
- **验证结果**：✅ 通过

## 需求质量评估（来自 requirements.json）

### 质量评分
- **来源**：requirements.json
- **评分**：95/100
- **状态**：良好

### 改进建议
1. 建议添加"记住我"功能
2. 建议增加表单验证提示

## 下一步建议
- 执行 documentation-update 添加完整注释
- 运行测试确保功能正常
- 提交代码到版本控制系统
```

## 执行逻辑

### 步骤1：读取输入

1. 接收 code-generation 或 module-integration 的输出
2. 接收 requirement-reader 的 test_cases 和 quality（如有）
3. 接收 multi-scenario-adapter 的场景类型

### 步骤2：执行验证

**场景1（标准输入，有 test_cases）**：
1. 验证每个测试用例是否可执行
2. 检查测试场景是否覆盖了所有模块
3. 检查输入数据类型是否正确
4. 检查预期结果是否明确
5. 执行常规验证（语法、规范、功能）
6. 继承 quality 评估

**场景2（简单需求）**：
1. 执行常规验证
2. 不验证测试用例（无 test_cases）
3. 不继承 quality 评估

**场景3（复杂需求）**：
1. 执行常规验证
2. 如果有 test_cases，验证测试用例
3. 如果有 quality，继承评估

### 步骤3：输出验证报告

1. 汇总所有验证结果
2. 列出所有问题和建议
3. 给出验证结论
4. 继承需求质量评估（如有）

## 与 requirement-generator 的协同

### 测试用例验证

requirements.json 中的 `test_cases` 用于验证生成代码是否满足需求：

```json
{
  "test_cases": [
    {
      "type": "normal",
      "description": "正常登录",
      "steps": ["输入用户名", "输入密码", "点击登录"],
      "expected": "跳转首页"
    },
    {
      "type": "exception",
      "description": "用户名为空",
      "steps": ["用户名为空", "输入密码", "点击登录"],
      "expected": "提示'用户名不能为空'"
    }
  ]
}
```

验证阶段检查：
- ✅ 登录组件是否有用户名输入框
- ✅ 登录组件是否有密码输入框
- ✅ 登录组件是否有登录按钮
- ✅ 登录组件是否有表单验证
- ✅ 登录成功后是否有跳转逻辑

### 质量评估继承

requirements.json 中的 `quality` 用于评估需求质量：

```json
{
  "quality": {
    "score": 95,
    "issues": [],
    "recommendations": ["建议添加'记住我'功能"]
  }
}
```

在验证报告的"问题汇总"部分，继承质量评估：
- 如果 `quality.score < 70`：记录警告"需求质量评分较低"
- 如果 `quality.issues` 不为空：将所有问题记录到"详细问题"部分
- 如果 `quality.recommendations` 不为空：在"下一步建议"中记录改进建议

## 依赖关系

- **依赖**：multi-scenario-adapter、code-generation 或 module-integration、requirement-reader
- **被依赖**：documentation-update

## 完成标准

1. ✅ 语法验证通过（无严重错误）
2. ✅ 代码规范检查通过
3. ✅ 功能完整性检查通过
4. ✅ 导入依赖验证通过
5. ✅ 测试用例验证通过（场景1，有 test_cases 时）
6. ✅ 继承 quality 评估（场景1，有 quality 时）
7. ✅ 输出完整验证报告

## 错误处理

- **严重语法错误**：报告给用户，暂停后续步骤
- **规范不符**：记录差异，标记为警告
- **功能缺失**：列出缺失的功能点
- **测试用例不通过**：标记为问题，列出原因

## 注意事项

- 优先使用项目已有的验证工具
- 不要修改代码，只验证
- 如果发现严重错误，报告给 code-generation 或 module-integration 重新生成
- 继承 requirements.json 的 quality 评估，但仅记录警告，不阻塞生成
- 测试用例验证检查功能是否满足需求，不实际运行测试

## 原子skill位置

`.claude/skills/code-generator/atomic-skills/code-validation/SKILL.md`