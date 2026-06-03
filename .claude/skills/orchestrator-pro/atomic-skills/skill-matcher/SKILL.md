---
name: skill-matcher
description: 技能匹配（τ 增强版）— 增加 Co-Design 贡献度标注和 τ 效率评分
---

# Skill Matcher 原子 Skill（τ 增强版）

## 版本历史
- v1.0 (2026-06-02): 基于 v1.2 增强，增加 Co-Design 显式化和 τ 效率维度

---

## 1. 核心定位

继承 v1.2 skill-matcher 的完整逻辑，增强点：
- **Co-Design 贡献度标注**：显式化 model/rules/skills 三层决策
- **τ 效率评分维度**：在匹配评分中增加 τ 效率因子

---

## 2. τ 增强的匹配评分

```python
def calculate_match_score_with_tau(intent: dict,
                                    skill: dict,
                                    pattern_discount: float = 0.0) -> float:
    """
    τ 增强版匹配评分：原评分 × τ 效率因子
    τ_efficiency_factor = 1 - pattern_discount × 0.1
    即模式折扣越高，匹配评分适当加权（鼓励复用已验证模式）
    """
    # 基础评分（v1.2）
    base_score = calculate_match_score(intent, skill)

    # τ 效率因子：pattern 复用时略微加权
    tau_factor = 1.0 + pattern_discount * 0.1

    return base_score * tau_factor
```

---

## 3. Co-Design 贡献度

```python
co_design_contribution = {
    "model": 0.5,   # LLM 判断意图与 skill 能力匹配度
    "rules": 0.3,  # 关键词/领域/操作 规则匹配
    "skills": 0.2,  # Skill 注册表提供基础数据
}
```

---

## 4. 继承自 v1.2 的完整逻辑

所有 v1.2 的匹配逻辑（加权评分、多 skill 组合、fallback）完全保留，仅增加上述 τ 增强点。

**原子 Skill 位置**: `.claude/skills/orchestrator-pro/atomic-skills/skill-matcher/SKILL.md`