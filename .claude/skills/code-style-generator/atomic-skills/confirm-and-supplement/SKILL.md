---
name: confirm-and-supplement
description: 展示探测代码给用户确认，收集反馈，补充无法自动检测的规则
reasoner_instructions: |
  SHOW probe code to user. USE AskUserQuestion tool for missing rules (max 3 per batch).
  RECORD user modifications and answers. OUTPUT confirmedRules JSON with ruleSources and userAnswers.
---

# confirm-and-supplement

## 任务定义

你是原子技能 `confirm-and-supplement`，只负责与用户交互，确认探测代码，收集补充信息。

## 输入参数

从前面的任务获取：
- `configRules`：从配置文件检测到的规则
- `inferredRules`：从代码推断的规则
- `probeCode`：生成的探测代码片段

## 交互流程

### 步骤1：展示探测代码

将探测代码展示给用户，提示：

```
我已根据项目代码生成了代码规范探测片段，请查看：

[探测代码片段]

如果代码不符合你的习惯，请直接修改代码。
如果符合你的习惯，请回复"确认"。
```

### 步骤2：处理用户反馈

**情况A：用户修改了代码**
- 解析修改后的代码
- 更新规则列表
- 标记规则来源为 "用户确认"

**情况B：用户确认**
- 保持原有规则不变
- 标记规则来源为 "用户确认"

**情况C：用户提出问题**
- 解答用户疑问
- 根据用户反馈调整规则

---

### 步骤3：补充无法自动检测的规则

使用 `AskUserQuestion` 工具，分批次提问：

#### 批次1：基础格式规则

```json
{
    "questions": [
        {
            "header": "函数空行",
            "multiSelect": false,
            "options": [
                {"label": "无空行", "description": "所有函数紧凑排列"},
                {"label": "同模块无空行，异模块1空行", "description": "按业务逻辑分组"},
                {"label": "总是1空行", "description": "所有函数间都有空行"}
            ],
            "question": "函数之间的空行规则？"
        },
        {
            "header": "模块注释",
            "multiSelect": false,
            "options": [
                {"label": "无注释", "description": "仅用空行分隔"},
                {"label": "单行注释", "description": "// 用户相关"},
                {"label": "块注释", "description": "/* 用户相关 */"},
                {"label": "分割线注释", "description": "/* ******** 用户相关 ******** */"}
            ],
            "question": "不同业务模块之间的注释格式？"
        }
    ]
}
```

#### 批次2：Vue/React 特定规则

**如果项目使用Vue**：

```json
{
    "questions": [
        {
            "header": "注释风格",
            "multiSelect": false,
            "options": [
                {"label": "JSDoc风格", "description": "/** \n * 获取用户信息\n * @param {string} id - 用户ID\n */"},
                {"label": "简洁注释", "description": "// 获取用户信息"},
                {"label": "最少注释", "description": "代码自文档化，少注释"}
            ],
            "question": "代码注释偏好？"
        },
        {
            "header": "调试代码",
            "multiSelect": false,
            "options": [
                {"label": "严格禁止", "description": "禁止提交console.log/debugger"},
                {"label": "允许调试代码", "description": "开发环境可保留"}
            ],
            "question": "console.log/debugger等调试代码处理？"
        }
    ]
}
```

**如果项目使用React**：

```json
{
    "questions": [
        {
            "header": "条件渲染",
            "multiSelect": false,
            "options": [
                {"label": "三元表达式", "description": "{isLoggedIn ? <Dashboard /> : <Login />}"},
                {"label": "&&短路", "description": "{isLoading && <Loading />}"},
                {"label": "按需选择", "description": "根据业务逻辑选择"}
            ],
            "question": "React条件渲染偏好？"
        },
        {
            "header": "列表渲染",
            "multiSelect": false,
            "options": [
                {"label": "显式return", "description": "items.map(item => { return <Item /> })"},
                {"label": "隐式return", "description": "items.map(item => <Item />)"}
            ],
            "question": "React列表渲染map的返回方式？"
        },
        {
            "header": "事件处理",
            "multiSelect": false,
            "options": [
                {"label": "命名函数", "description": "const handleClick = () => {}; <button onClick={handleClick}>"},
                {"label": "内联箭头函数", "description": "<button onClick={() => handleClick(id)}>"}
            ],
            "question": "React事件处理函数定义方式？"
        }
    ]
}
```

---

## 执行规则

1. **分批提问**：每批不超过3个问题，避免用户疲劳
2. **提供预览**：对于格式相关的问题，提供代码预览
3. **允许跳过**：用户可以选择"其他"，自定义规则
4. **记录来源**：标记每条规则的来源（配置文件/代码推断/用户确认）

## 输出格式

```json
{
    "confirmedRules": {
        "indent_style": "space",
        "indent_size": 4,
        "quotes": "single",
        "semi": false,
        "html_attribute_quotes": "double",
        "component_naming": "PascalCase",
        "function_empty_line": "同模块无空行，异模块1空行",
        "module_comment_style": "分割线注释",
        "comment_style": "简洁注释",
        "debug_code": "允许调试代码"
    },
    "ruleSources": {
        "indent_style": "config",
        "indent_size": "config",
        "quotes": "config",
        "semi": "config",
        "html_attribute_quotes": "inferred",
        "component_naming": "inferred",
        "function_empty_line": "user",
        "module_comment_style": "user",
        "comment_style": "user",
        "debug_code": "user"
    },
    "userModifications": [
        {
            "rule": "html_attribute_quotes",
            "original": "double",
            "modified": "single",
            "reason": "用户修改探测代码"
        }
    ],
    "userAnswers": [
        {
            "question": "函数之间的空行规则？",
            "answer": "同模块无空行，异模块1空行"
        },
        {
            "question": "不同业务模块之间的注释格式？",
            "answer": "分割线注释"
        }
    ]
}
```

## 强约束

- 必须使用 `AskUserQuestion` 工具，不能直接输出问题
- 每批问题不超过3个
- 必须记录规则的来源
- 必须记录用户修改的内容
- 输出必须是合法的JSON格式
