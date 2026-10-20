# Doc Generator

## 定位

根据明确的文档目标，选择最小必要的原子 Skill 生成或转换文档。它只处理已确认的输入范围，不默认执行完整项目扫描，也不把静态分析结果当作运行时事实。

## 原子 Skill

| 原子 Skill | 用途 | 默认输出 |
|---|---|---|
| `api-doc-extraction` | 提取可静态识别的 API 信息 | `docs/api.md` 或 `docs/openapi.json` |
| `component-doc-generation` | 生成 Vue/React 组件文档 | `docs/components/` |
| `changelog-generation` | 从 Git 历史生成变更日志 | `CHANGELOG.md` |
| `doc-format-conversion` | 转换或合并已有文档 | 用户指定路径 |

API、组件和 CHANGELOG 可按需并行；格式转换只在输入文件或前置产物明确后执行。用户只要求其中一项时，不执行其他原子 Skill。

## 输出与安全

写入前展示文件路径、格式和覆盖/追加策略。已有文档不自动覆盖；敏感值不写入文档。每份输出记录执行范围、证据来源、跳过项和无法静态确认项。结果状态为 `passed`、`partial`、`failed` 或 `cancelled`。

## 示例

```text
生成 API 文档                 → api-doc-extraction
为 src/components 生成文档   → component-doc-generation
根据 v1.2.0..HEAD 生成日志    → changelog-generation
把 docs/api.md 转成 HTML     → doc-format-conversion
```
