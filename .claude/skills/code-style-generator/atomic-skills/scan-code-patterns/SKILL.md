---
name: scan-code-patterns
description: K1任务折叠已合并至 detect-config-rules → detect-and-scan。本文件已废弃，仅作向后兼容存根。v1.2 原 scan-code-patterns + detect-config-rules 合并为 detect-and-scan。
---

# scan-code-patterns（已废弃 → 合并入 detect-and-scan）

> **v1.2 变更**：原 `scan-code-patterns` 和 `detect-config-rules` 已合并为 `detect-and-scan` atomic skill。
> 所有功能现已整合到 `atomic-skills/detect-config-rules/SKILL.md` 中。

## 合并说明

| 原原子skill | 合并后 | 说明 |
|------------|--------|------|
| detect-config-rules | detect-and-scan | 配置检测 + 代码推断一体化 |
| scan-code-patterns | detect-and-scan | 已整合入 detect-config-rules |

## K1 任务折叠效果
- 执行步骤：5步 → 3步
- τ 消耗：减少约 40%
- 无功能损失，所有规则检测能力保留

## 新执行流程（v1.2）

```
detect-and-scan（原 detect-config-rules + scan-code-patterns）
         ↓
generate-and-confirm（原 generate-probe-code + confirm-and-supplement）
         ↓
generate-style-document
```

如需查看新 atomic skill 定义，请查看：
- `atomic-skills/detect-config-rules/SKILL.md`（detect-and-scan）
- `atomic-skills/generate-probe-code/SKILL.md`（generate-and-confirm）

## 版本
v1.2 - K1任务折叠：scan-code-patterns 已合并入 detect-and-scan，不再作为独立 atomic skill。