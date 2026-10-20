---
name: intent-recognition
description: 将用户自然语言转化为结构化任务意图，识别领域、操作、目标、约束和复杂度
impl_status: design_spec
---

# Intent Recognition 原子 Skill

## 1. 核心定位

读取用户原始请求和可用项目上下文，生成供 Skill 匹配和任务规划使用的结构化意图。

## 2. 输入

- 用户原始请求
- 项目上下文（可选）
- 主 Skill 注册表

## 3. 识别内容

- `domain`
- `action`
- `target`
- `constraints`
- `keywords`
- `success_criteria`
- `complexity_assessment`
- `confidence`

复杂度至少考虑步骤数量、状态需求、文件数量、分支数量和是否需要多个 Skill。无法确定的内容必须记录为不确定项，不得臆测。

## 4. 输出契约

```json
{
  "intent_id": "INT_时间戳_随机4位",
  "domain": "任务领域",
  "action": "目标操作",
  "target": "目标对象",
  "constraints": [],
  "keywords": [],
  "success_criteria": [],
  "complexity_assessment": {
    "complexity_score": 0,
    "reasons": []
  },
  "confidence": 0.0,
  "uncertainties": []
}
```

## 5. 完成标准

- 意图字段完整且与用户请求一致。
- 复杂度评分包含可追溯理由。
- 不确定项明确记录。
- 输出可直接供 `skill-matcher` 使用。
