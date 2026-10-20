---
name: skill-matcher
description: 根据结构化意图匹配主 Skill，处理单匹配、多匹配和无匹配场景
impl_status: design_spec
---

# Skill Matcher 原子 Skill

## 1. 核心定位

读取结构化意图和主 Skill 注册表，输出候选 Skill、匹配分数、选择结果和选择理由。

## 2. 匹配规则

综合比较以下信息：

- `domain`
- `action`
- `target`
- `keywords`
- 主 Skill 的触发关键词
- 主 Skill 的能力描述
- 目标类型和约束

基础评分应保持稳定，并支持多 Skill 组合。

## 3. 分支处理

- 单匹配：选择唯一候选。
- 多匹配：输出候选列表、分数和推荐项，必要时等待用户选择。
- 无匹配：记录到 `missing_skills.md`，尝试自主执行；无法执行时明确说明原因。

确定主 Skill 后，必须读取其 `SKILL.md`，不得修改注册表中的路径和依赖关系。

## 4. 输出契约

```json
{
  "candidates": [
    {
      "name": "skill-name",
      "score": 0.0,
      "reason": "匹配理由",
      "matched_keywords": ["用户关键词"]
    }
  ],
  "selected_skill": "skill-name",
  "matched_keywords": ["用户关键词"],
  "selection_reason": "选择理由",
  "fallback": false
}
```

## 5. 完成标准

- 匹配结果与意图和注册表内容一致。
- 多匹配场景保留候选及分数。
- 无匹配场景记录 fallback 信息。
- 选定 Skill 的路径可被后续任务生成阶段读取。
