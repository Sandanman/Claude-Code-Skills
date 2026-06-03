---
name: intent-recognition
description: 意图识别（τ 增强版）— 将用户自然语言转化为结构化意图，增加 τ 测量嵌入
---

# Intent Recognition 原子 Skill（τ 增强版）

## 版本历史
- v1.0 (2026-06-02): 基于 v1.2 增强，增加 τ 测量嵌入点

---

## 1. 核心定位

继承 v1.2 intent-recognition 的完整逻辑，增强点：
- **τ 测量嵌入**：在意图识别完成后记录 τ 消耗到 τ-Controller
- **Co-Design 贡献度标注**：显式标注 model/rules/skills 三层贡献

---

## 2. 与 τ-Controller 的交互

```python
# 意图识别完成后，记录 τ 消耗
tau_controller.record_step(
    step="intent",
    duration_ms=elapsed_ms,
    tokens=llm_tokens + input_tokens
)
# 记录 Co-Design 贡献度
co_design_contributions["intent"] = {
    "model": 0.7,   # LLM 主导意图理解
    "rules": 0.2,   # 规则辅助 domain/action 分类
    "skills": 0.1,  # Skill 注册表提供上下文
}
```

---

## 3. 继承自 v1.2 的完整逻辑

### 输入/输出格式

**输入**：
```json
{
  "user_input": "string（用户原始输入）",
  "project_context": "string（可选）",
  "skills_register": "string（主 skill 列表）"
}
```

**输出**：完整保留 v1.2 的结构化 intent JSON，增加以下字段：
```json
{
  "intent_id": "INT_时间戳_随机4位",
  "domain": "...",
  "action": "...",
  "tau_tier": "simple | moderate | complex",  // v1.0 新增
  "tau_budget_allocated": {...},               // v1.0 新增：τ 预算分配
  "co_design_contribution": {                  // v1.0 新增
    "model": 0.7,
    "rules": 0.2,
    "skills": 0.1
  }
}
```

---

## 4. τ 档位判断

```python
def determine_tau_tier(complexity_score: int) -> str:
    if complexity_score <= 3:  return "simple"
    elif complexity_score <= 6: return "moderate"
    else:                       return "complex"
```

---

## 5. 原子 Skill 位置

`.claude/skills/orchestrator-pro/atomic-skills/intent-recognition/SKILL.md`