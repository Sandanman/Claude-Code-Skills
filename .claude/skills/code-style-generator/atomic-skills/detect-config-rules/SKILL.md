---
name: detect-config-rules
description: 检测项目配置文件，提取代码格式化规则（含 TypeScript tsconfig.json 配置）。改进版新增 tsconfig.json 读取，提取 strict/null-checking/moduleResolution 等 TS 特有规则。
reasoner_instructions: |
  READ config files (.editorconfig, .prettierrc, eslint.config.js, tsconfig.json).
  EXTRACT formatting rules (indent, quotes, semi, etc) AND TypeScript config rules (strict, noImplicitAny, etc).
  OUTPUT JSON with configRules (base + tsconfig), configFiles, detectedCount.
  MARK missing rules as null.
---

# detect-config-rules（改进版 v1.1）

## 任务定义

你是原子技能 `detect-config-rules`，只负责读取项目的配置文件，提取代码格式化规则和 TypeScript 配置规则。

## 检测文件列表

优先级从高到低：

1. **.editorconfig** - 编辑器配置
2. **.prettierrc** / **.prettierrc.json** - Prettier配置
3. **eslint.config.js** / **.eslintrc.js** - ESLint配置
4. **tsconfig.json** - TypeScript 配置（**新增 v1.1**）
5. **package.json** - 可能包含prettier/tsconfig配置

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

### TypeScript 配置规则（**新增 v1.1**）

| 字段名 | tsconfig.json 中的键 | 可能的值 | 默认值 |
|--------|---------------------|---------|--------|
| ts_strict | strict | true / false | null |
| ts_noImplicitAny | noImplicitAny | true / false | null |
| ts_strictNullChecks | strictNullChecks | true / false | null |
| ts_esModuleInterop | esModuleInterop | true / false | null |
| ts_allowSyntheticDefaultImports | allowSyntheticDefaultImports | true / false | null |
| ts_jsx | jsx | "react-jsx" / "react" / "preserve" / null | null |
| ts_moduleResolution | moduleResolution | "node" / "bundler" / "node16" | null |
| ts_target | target | "ES2020" / "ESNext" 等 | null |

## 执行规则

1. **优先级处理**：多个配置文件中存在相同规则时，按优先级选择
2. **未配置规则**：配置文件中未找到的规则，标记为 `null`，稍后从代码推断
3. **特殊值处理**：
   - Prettier的 `singleQuote: true` 对应 `quotes: single`
   - ESLint的 `quotes: ['error', 'single']` 对应 `quotes: single`
   - tsconfig 的 `strict: true` 意味着所有 strict* 规则为 true

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
        "space_before_function_paren": null,
        "ts_strict": true,
        "ts_noImplicitAny": true,
        "ts_strictNullChecks": true,
        "ts_esModuleInterop": true,
        "ts_allowSyntheticDefaultImports": true,
        "ts_jsx": "react-jsx",
        "ts_moduleResolution": "bundler",
        "ts_target": "ES2020"
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
        },
        {
            "file": "tsconfig.json",
            "exists": true,
            "rules": {
                "strict": true,
                "noImplicitAny": true,
                "strictNullChecks": true,
                "target": "ES2020"
            }
        }
    ],
    "detectedCount": 12,
    "inferredCount": 2,
    "tsConfigDetected": true
}
```

## 强约束

- 只读取配置文件，不修改任何文件
- 未找到的配置项必须标记为 `null`
- 必须记录检测到规则的配置文件路径
- 输出必须是合法的JSON格式
- 如果配置文件不存在，输出 `exists: false`
- 必须检测 tsconfig.json 并提取 TS 特有规则（**新增 v1.1**）

## 版本
v1.1 - 改进版：新增 TypeScript 配置（tsconfig.json）检测，提取 strict、noImplicitAny、strictNullChecks 等 TS 特有规则