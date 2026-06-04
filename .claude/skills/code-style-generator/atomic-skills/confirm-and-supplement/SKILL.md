---
name: confirm-and-supplement
description: K1任务折叠已合并至 generate-probe-code → generate-and-confirm。本文件已废弃，仅作向后兼容存根。v1.2 原 confirm-and-supplement + generate-probe-code 合并为 generate-and-confirm。
---

# confirm-and-supplement（已废弃 → 合并入 generate-and-confirm）

> **v1.2 变更**：原 `confirm-and-supplement` 和 `generate-probe-code` 已合并为 `generate-and-confirm` atomic skill。
> 所有功能现已整合到 `atomic-skills/generate-probe-code/SKILL.md` 中。

## 合并说明

| 原原子skill | 合并后 | 说明 |
|------------|--------|------|
| generate-probe-code | generate-and-confirm | 探测代码生成 + 用户确认一体化 |
| confirm-and-supplement | generate-and-confirm | 已整合入 generate-probe-code |

## K1 任务折叠效果
- 执行步骤：5步 → 3步
- τ 消耗：减少约 40%
- 用户交互流程保持不变（展示 → 修改 → 提问 → 确认）

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
v1.2 - K1任务折叠：confirm-and-supplement 已合并入 generate-and-confirm，不再作为独立 atomic skill。