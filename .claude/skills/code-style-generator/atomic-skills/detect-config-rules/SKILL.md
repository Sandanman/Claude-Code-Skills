---
name: detect-config-rules
description: 检测项目配置文件，提取代码格式化规则（缩进、引号、分号等）
reasoner_instructions: |
  READ config files (.editorconfig, .prettierrc, eslint.config.js, package.json).
  EXTRACT formatting rules (indent, quotes, semi, etc).
  OUTPUT JSON with configRules, configFiles, detectedCount.
  MARK missing rules as null.
---

# detect-config-rules

## 任务定义

你是原子技能 `detect-config-rules`，只负责读取项目的配置文件，提取代码格式化规则。

## 检测文件列表

优先级从高到低：

1. **.editorconfig** - 编辑器配置
2. **.prettierrc** / **.prettierrc.json** - Prettier配置
3. **eslint.config.js** / **.eslintrc.js** - ESLint配置
4. **package.json** - 可能包含prettier配置

## 提取字段

### 基础格式化规则

| 字段名 | 配置文件中的键 | 可能的值 | 默认值 |
|--------|---------------|---------|--------|
| indent_style | indent_style | space / tab | space |
| indent_size | indent_size / tabWidth | 数字 | 4 |
| quotes | singleQuote / quotes | single / double | single |
| semi | semi | true / false | false |
| print_width | printWidth / max_line_length | 数字 | null（不限制） |
| trailing_comma | trailingComma | none / es5 / all | none |
| end_of_line | end_of_line | lf / crlf | lf |
| insert_final_newline | insert_final_newline | true / false | true |

### 括号和空格规则

| 字段名 | 配置文件中的键 | 可能的值 | 默认值 |
|--------|---------------|---------|--------|
| brace_style | brace_style | 1tbs / allman / stroustrup | 1tbs (K&R) |
| space_before_function_paren | spaceBeforeFunctionParen | always / never | always |

## 执行规则

1. **优先级处理**：多个配置文件中存在相同规则时，按优先级选择
2. **未配置规则**：配置文件中未找到的规则，标记为 `null`，稍后从代码推断
3. **特殊值处理**：
   - Prettier的 `singleQuote: true` 对应 `quotes: single`
   - ESLint的 `quotes: ['error', 'single']` 对应 `quotes: single`

## 输出格式

严格按以下JSON结构输出：

```json
{
    "configRules": {
        "indent_style": "space",
        "indent_size": 4,
        "quotes": "single",
        "semi": false,
        "print_width": null,
        "trailing_comma": "none",
        "end_of_line": "lf",
        "insert_final_newline": true,
        "brace_style": "1tbs",
        "space_before_function_paren": null
    },
    "configFiles": [
        {
            "file": ".editorconfig",
            "exists": true,
            "rules": { ... }
        },
        {
            "file": ".prettierrc.json",
            "exists": true,
            "rules": { ... }
        }
    ],
    "detectedCount": 8,
    "inferredCount": 2
}
```

## 强约束

- 只读取配置文件，不修改任何文件
- 未找到的配置项必须标记为 `null`
- 必须记录检测到规则的配置文件路径
- 输出必须是合法的JSON格式
- 如果配置文件不存在，输出 `exists: false`

## 示例输入输出

### 输入

项目根目录包含以下文件：
- `.editorconfig`
- `.prettierrc.json`

### 输出

```json
{
    "configRules": {
        "indent_style": "space",
        "indent_size": 4,
        "quotes": "single",
        "semi": false,
        "print_width": null,
        "trailing_comma": "none",
        "end_of_line": "lf",
        "insert_final_newline": true,
        "brace_style": null,
        "space_before_function_paren": null
    },
    "configFiles": [
        {
            "file": ".editorconfig",
            "exists": true,
            "rules": {
                "indent_style": "space",
                "indent_size": 4,
                "end_of_line": "lf",
                "insert_final_newline": true
            }
        },
        {
            "file": ".prettierrc.json",
            "exists": true,
            "rules": {
                "semi": false,
                "singleQuote": true,
                "tabWidth": 4,
                "trailingComma": "none"
            }
        }
    ],
    "detectedCount": 8,
    "inferredCount": 2
}
```
