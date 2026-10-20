# Code Style Generator 使用说明

## 功能

`code-style-generator` 从项目配置和源代码中检测代码规范，经过用户确认后生成项目根目录下的 `CODE_STYLE.md`。

## 触发方式

可使用以下自然语言需求：

```text
生成我的代码习惯文档
创建代码风格规范文档
生成 CODE_STYLE.md
检测项目代码规范
```

## 执行流程

```text
detect-and-scan
  → generate-and-confirm
  → generate-style-document
```

只要求检测时可以执行 `detect-and-scan`；已有可信上游结果时，可以从对应阶段开始，但必须确认产物来源、范围和完整性。

## 有效原子 Skill

| 原子 Skill | 文件路径 | 作用 |
| --- | --- | --- |
| `detect-and-scan` | `atomic-skills/detect-config-rules/SKILL.md` | 检测配置并扫描代码 |
| `generate-and-confirm` | `atomic-skills/generate-probe-code/SKILL.md` | 生成探测代码并收集确认 |
| `generate-style-document` | `atomic-skills/generate-style-document/SKILL.md` | 生成 `CODE_STYLE.md` |

以下文件仅为兼容存根，不作为独立执行阶段：

- `atomic-skills/scan-code-patterns/SKILL.md`
- `atomic-skills/confirm-and-supplement/SKILL.md`

## 支持的规则

| 规则 | 主要来源 | 检测方式 |
| --- | --- | --- |
| 缩进、引号、分号、行长度 | `.editorconfig`、Prettier、ESLint | 直接读取 |
| TypeScript `strict`、`noImplicitAny`、`jsx` | `tsconfig.json` | 直接读取 |
| 变量、组件和 CSS 类命名 | 源代码 | 统计推断 |
| Vue3 Composition API 习惯 | `.vue` 文件 | 代码扫描和用户确认 |
| React Hooks 习惯 | `.jsx`、`.tsx` 文件 | 代码扫描和用户确认 |

## 输出和校验

默认输出：

```text
<project_root>/CODE_STYLE.md
```

生成前如果文件已经存在，必须询问覆盖、合并、另存或取消。完成后检查文件存在、内容非空、规则来源完整，且代码示例与最终规则一致。无法确认的规则必须标记为 `unknown` 或 `default`，不得使用虚构结果。

## 安全边界

- 只读取配置和源代码，不修改源代码。
- 只在用户指定的项目范围内生成文档。
- 不输出 token、密码、私钥或完整环境变量值。
- 不未经确认覆盖已有文档。

## 文件结构

```text
code-style-generator/
├── SKILL.md
├── README.md
├── EXAMPLES.md
└── atomic-skills/
    ├── detect-config-rules/SKILL.md
    ├── generate-probe-code/SKILL.md
    ├── generate-style-document/SKILL.md
    ├── scan-code-patterns/SKILL.md       # 兼容存根
    └── confirm-and-supplement/SKILL.md   # 兼容存根
```
