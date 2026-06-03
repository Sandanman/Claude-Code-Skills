---
name: task-archiver
description: 任务归档（τ 增强版）— 增加 Pattern 模式存储
---

# Task Archiver 原子 Skill（τ 增强版）

## 版本历史
- v1.0 (2026-06-02): 基于 v1.2 增强，增加 Pattern Mining 模式存储

---

## 1. 核心定位

继承 v1.2 task-archiver 的完整逻辑（按月归档、更新索引），增加：
- **Pattern 模式存储**：任务完成后将执行模式存入模式库
- **成熟度更新**：根据使用次数更新模式成熟度

---

## 2. Pattern 存储增强

```python
def archive_with_pattern(task_skill_md: str,
                          pattern_miner: PatternMiner,
                          validation_report: dict,
                          intent: dict) -> dict:
    """
    τ 增强版归档：归档任务 + 存储模式
    """
    # Step 1: 任务归档（继承 v1.2）
    archive_result = archive_task(task_skill_md, validation_report)

    # Step 2: Pattern 模式存储（新增）
    # 从 task_skill.md 提取 pattern 特征
    pattern_features = pattern_miner.extract_pattern_features(
        intent=intent,
        skill_results=load_skill_results(task_skill_md)
    )

    # 判断是否值得存储（新模式或已有模式的验证）
    should_store = (
        validation_report.get("all_passed")
        and pattern_features.get("skill_sequence")
        and len(pattern_features["skill_sequence"]) >= 2
    )

    if should_store:
        pattern_result = pattern_miner.store_pattern(
            features=pattern_features,
            intent=intent,
            tau_metadata=load_tau_metadata(task_skill_md)
        )
        archive_result["pattern_storage"] = pattern_result
    else:
        archive_result["pattern_storage"] = {"stored": False, "reason": "未达存储标准"}

    return archive_result
```

---

## 3. 模式存储格式

```markdown
# Pattern: {pattern_id}
## {pattern_name}

**类别**: {category}
**成熟度**: {maturity}
**验证次数**: {usage_count}
**τ 折扣**: {tau_discount:.0%}
**最后使用**: {timestamp}
**使用次数**: {total_uses}

## 触发条件
- domain: {domain}
- action: {action}
- target_type: {target_type}
- complexity_band: {complexity_band}

## 执行步骤
{skill_sequence}

## τ 收益
- 模式复用节省: {tau_discount:.0%}
- 估算节省: ~{estimated_savings} τ

## 验证记录
- {timestamp}: 验证成功，τ 消耗 {tau_consumed}（vs 预算 {tau_budget}）
```

---

## 4. 继承自 v1.2 的完整逻辑

v1.2 的所有功能（原子移动、月度索引、可固化文档检测）完全保留。

---

## 5. 原子 Skill 位置

`.claude/skills/orchestrator-pro/atomic-skills/task-archiver/SKILL.md`