---
name: skill-matcher
description: 主Skill匹配 — 基于结构化意图，对注册主skill进行关键词/domain/action 加权评分，输出最佳匹配或提示用户选择
---

# Skill Matcher 原子Skill

## 概述

主skill匹配是将结构化意图与注册主skill进行智能匹配的环节。通过加权评分机制（关键词匹配 50%、domain匹配 30%、action匹配 20%），计算每个主skill与当前意图的匹配度，输出最佳匹配结果。处理三种情况：无匹配（记录到 missing_skills.md）、唯一匹配（直接使用）、多匹配（提示用户选择）。此skill在意图识别之后、任务生成之前执行。

## 核心能力

- 加权评分匹配：keyword_score(50%) + domain_score(30%) + action_score(20%)
- 动态权重调整：根据意图特征可微调各维度权重
- 多匹配检测：识别需要多主skill组合的复杂场景（complexity_score >= 7.0 或多领域意图）
- 互斥检测：检测不合理的skill组合（如同类skill重叠）
- 缺失记录：未匹配到skill时记录到 `missing_skills.md`
- 匹配类型判定：no_match / unique / multiple / combo

## 输入

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| intent | object | 是 | intent-recognition 输出的结构化意图 JSON |
| skills_register | object | 是 | 主skill注册表，含 name, description, match_keywords, core_abilities 等 |

## 输出

```json
{
  "match_type": "unique",
  "matches": [
    {
      "skill_name": "code-generator",
      "match_score": 0.82,
      "score_breakdown": {
        "keyword_score": 0.5,
        "domain_score": 0.3,
        "action_score": 0.02
      },
      "matched_keywords": ["会议卡片", "Vue组件"],
      "matched_domains": ["frontend"],
      "matched_actions": ["create"]
    }
  ],
  "combo_reason": null,
  "needs_user_selection": false,
  "selected_skill": "code-generator"
}
```

**多匹配输出**：
```json
{
  "match_type": "multiple",
  "matches": [
    {"skill_name": "code-generator", "match_score": 0.82, ...},
    {"skill_name": "bug-solver", "match_score": 0.65, ...}
  ],
  "needs_user_selection": true,
  "top_skill": "code-generator"
}
```

**多skill组合输出**：
```json
{
  "match_type": "combo",
  "matches": [
    {"skill_name": "code-generator", "match_score": 0.80, "priority": 1},
    {"skill_name": "code-optimizer", "match_score": 0.75, "priority": 2}
  ],
  "combo_reason": "complexity_score=8，需要创建并优化会议卡片组件",
  "needs_user_selection": false,
  "selected_skill": ["code-generator", "code-optimizer"]
}
```

## 执行逻辑

1. **加载注册表**：读取 `skills_register.md` 获取所有主skill及其元数据（name, match_keywords, core_abilities, compatible_skills）
2. **遍历评分**：对每个主skill计算加权匹配分：
   ```python
   def calculate_match_score(intent, skill):
       # 关键词匹配：意图关键词与skill关键词的重叠度（满分0.5）
       keyword_score = sum(
           0.5 for kw in intent.keywords
           if kw in skill.match_keywords
       )
       # 归一化到 [0, 0.5]
       max_kw_score = len(intent.keywords) * 0.5
       keyword_score = keyword_score / max_kw_score * 0.5 if max_kw_score > 0 else 0

       # domain匹配：意图domain在skill核心能力中（满分0.3）
       domain_score = 0.3 if intent.domain in skill.core_abilities else 0.0

       # action匹配：意图action在skill匹配关键词中（满分0.2）
       action_score = 0.2 if intent.action in skill.match_keywords else 0.0

       total_score = keyword_score + domain_score + action_score
       return total_score  # 满分 1.0
   ```
3. **过滤**：保留 score >= 0.4 的skill，过滤低分候选项
4. **排序**：按 score 降序排列
5. **匹配类型判定**：
   - 无匹配：所有 score < 0.4 → 记录到 missing_skills.md，尝试自主执行
   - 唯一匹配：1个 >= 0.4 → 直接使用该skill
   - 多匹配：>= 2个 >= 0.4 → 提示用户选择（展示Top3，最高分为默认选项）
6. **多skill组合检测**（复杂度 >= 7.0 或多domain意图）：
   - 识别兼容skill组合（如 code-generator + code-optimizer）
   - 排除互斥skill（如两个同类create类skill）
   - 按优先级排序，协同生成统一的 task_skill.md
7. **返回结果**：包含 match_type、匹配列表、选中skill

## 依赖关系

- **被依赖**：task-generator（依赖匹配结果确定使用哪个主skill）
- **依赖**：intent-recognition（输入来自意图识别的结果）

## 完成标准

1. 所有注册主skill均已评分
2. 过滤后的匹配列表包含 score >= 0.4 的有效候选项（或明确输出 no_match）
3. match_type 明确（no_match / unique / multiple / combo 之一）
4. selected_skill 非空（no_match 情况除外）
5. score_breakdown 包含三个维度的分项得分
6. 多匹配时需用户选择但暂不阻塞（返回 choices 供 UI 呈现）

## 错误处理

- **skills_register.md 不存在**：返回 no_match，记录 missing_skills
- **评分计算异常**：跳过该skill继续评分，记录错误日志
- **所有skill得分过低**：返回 no_match，不强制匹配
- **多skill组合但无兼容skill**：退回为 unique，使用得分最高者

## 示例

**输入**：
```json
{
  "intent": {
    "domain": "frontend",
    "action": "create",
    "keywords": ["会议卡片", "Vue组件", "列表"],
    "complexity_score": 5
  },
  "skills_register": {
    "skills": [
      {"name": "code-generator", "match_keywords": ["创建", "生成", "组件"], "core_abilities": ["frontend", "fullstack"]},
      {"name": "bug-solver", "match_keywords": ["bug", "修复", "错误"], "core_abilities": ["debugging", "frontend", "backend"]},
      {"name": "code-optimizer", "match_keywords": ["优化", "性能", "重构"], "core_abilities": ["refactoring", "frontend", "backend"]}
    ]
  }
}
```

**输出**：
```json
{
  "match_type": "unique",
  "matches": [
    {
      "skill_name": "code-generator",
      "match_score": 0.67,
      "score_breakdown": {
        "keyword_score": 0.17,
        "domain_score": 0.3,
        "action_score": 0.2
      },
      "matched_keywords": ["会议卡片", "创建"],
      "matched_domains": ["frontend"],
      "matched_actions": ["create"]
    }
  ],
  "needs_user_selection": false,
  "selected_skill": "code-generator"
}
```

## 注意事项

- 关键词匹配的归一化很重要，避免因关键词数量差异导致分数偏差
- 多skill组合时，仅在 complexity_score >= 7.0 或明确多领域时才触发
- selected_skill 和 matches 需同时返回，前者用于流程继续，后者用于展示和调试
- 每次匹配结果应追加到 `orchestrator/skill_match_log.md` 供后续分析

## 原子skill位置

./.claude/skills/atomic-skills/skill-matcher/SKILL.md