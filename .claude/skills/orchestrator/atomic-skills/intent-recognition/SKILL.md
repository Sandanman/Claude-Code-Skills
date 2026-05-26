---
name: intent-recognition
description: 意图识别与分析 — 解析用户原始输入，提取结构化意图（domain, action, target, keywords, constraints, complexity, confidence），为后续主skill匹配和任务生成提供基础输入
---

# Intent Recognition 原子Skill

## 概述

意图识别与分析是整个 Orchestrator 调度链路的第一环，通过 LLM 分析用户输入，提取结构化的意图信息，为主skill匹配和任务生成提供标准化输入。当用户输入到达时，此skill优先执行，输出包含领域标签、操作类型、目标实体、关键词、约束条件、成功标准和复杂度评估的完整意图结构。

## 核心能力

- 自然语言意图解析：将用户模糊描述转化为结构化意图
- 领域分类（domain）：frontend / backend / database / fullstack / devops / security / testing / refactoring / debugging / architecture / documentation / analysis / general
- 操作分类（action）：fix / create / optimize / refactor / analyze / document / test / deploy / review / maintain / integrate / configure
- 目标实体提取：识别操作对象类型（file / component / api / function / module / page / feature / system）
- 关键词提取：为后续skill匹配提供权重词
- 约束条件识别：识别时间、性能、兼容性等约束
- 复杂度评估：多维度评分（1-10），判断是否需要复杂编排
- 置信度评估：domain / action / complexity 三个维度的置信分，overall >= 0.6 才认为识别成功
- 智能 fallback：LLM 不可用或解析失败时，自动降级到规则算法

## 输入

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_input | string | 是 | 用户原始输入文本（任意长度，推荐 < 2000 字符） |
| project_context | object | 否 | 来自 `.claude/project_context.json` 的项目上下文 |
| skills_register | object | 否 | 主skill注册表，用于理解可用的skill类型 |

## 输出

结构化的意图 JSON 对象：

```json
{
  "intent_id": "INT_20260522_7a3f",
  "domain": "frontend",
  "action": "create",
  "target": {
    "type": "component",
    "name": "MeetingCard",
    "path": "src/components/Meeting"
  },
  "constraints": ["响应式布局", "支持暗色模式"],
  "keywords": ["会议卡片", "Vue组件", "列表展示"],
  "success_criteria": "创建可复用的 MeetingCard 组件，支持数据展示和基本交互",
  "original_input": "需要创建一个会议卡片组件...",
  "complexity_assessment": {
    "is_simple": false,
    "complexity_score": 5,
    "reasoning": "涉及组件创建和样式适配，需要状态管理",
    "requires_multiple_steps": true,
    "needs_state": true,
    "requires_multiple_skills": false,
    "involves_multiple_files": true,
    "has_branching": false
  },
  "confidence": {
    "overall": 0.85,
    "domain_confidence": 0.9,
    "action_confidence": 0.9,
    "complexity_confidence": 0.75,
    "uncertain_aspects": ["不确定是否需要路由集成"]
  },
  "recognition_method": "llm"
}
```

## 执行逻辑

1. **加载项目上下文**：读取 `.claude/project_context.json`（如存在），注入到 LLM 提示词中作为背景知识
2. **加载主skill列表**：读取 `skills_register.md` 中的主skill列表，帮助 LLM 理解可用领域
3. **构造 LLM 提示词**：将 user_input 和项目上下文组装为结构化 prompt，使用 config.md 中的模型参数调用 LLM
4. **解析 JSON 响应**：提取 LLM 返回的意图 JSON，验证必需字段完整性
5. **置信度校验**：如果 overall confidence < 0.6，提示用户确认意图，不盲目继续
6. **复杂度分流**：complexity_score <= 3 → 简单意图，直接生成单步任务；complexity_score > 3 → 进入主skill匹配流程
7. **Fallback 降级**：LLM 调用失败或 JSON 解析失败时，切换到规则算法（关键词匹配 + 启发式推断），recognition_method 标记为 `rule_based_fallback`

**LLM 调用示例提示词**：
```
你是一个专业的 AI 代码助手意图分析专家。对用户的自然语言输入进行深度分析...
[见 orchestrator/SKILL.md 步骤1完整提示词模板]
```

**Fallback 规则算法逻辑**：
```python
def rule_based_intent_recognition(user_input):
    intent = {
        "intent_id": f"INT_{timestamp}_{random4}",
        "domain": detect_domain(user_input),       # 关键词匹配 domain
        "action": extract_action(user_input),       # 关键词匹配 action
        "target": extract_target(user_input),
        "constraints": extract_constraints(user_input),
        "keywords": extract_keywords(user_input),
        "success_criteria": generate_success_criteria(user_input),
        "original_input": user_input[:200],
        "complexity_score": calculate_complexity(user_input),
        "complexity_assessment": {"is_simple": False, ...},
        "confidence": {"overall": 0.5, ...},
        "recognition_method": "rule_based_fallback"
    }
    return intent
```

**复杂度评分维度**：
| 维度 | 权重 | 简单(1分) | 复杂(3分) |
|------|------|---------|---------|
| 步骤数量 | 1.0 | 单步 | 多步 |
| 状态依赖 | 1.2 | 无状态 | 需状态 |
| 技能组合 | 1.1 | 单skill | 多skill |
| 文件数量 | 0.8 | <=2个 | >2个 |
| 决策分支 | 0.9 | 无分支 | 多分支 |

## 依赖关系

- **被依赖**：skill-matcher, task-generator（依赖 intent 的输出）
- **依赖**：无（此skill是编排链路的起始节点）

## 完成标准

1. intent_id 格式正确：`INT_{timestamp}_{random4}`
2. domain 和 action 均已识别，非 `general` 且非 `unknown`
3. keywords 至少包含 2 个有效关键词
4. success_criteria 非空且可验证
5. overall confidence >= 0.6（fallback 情况下 confidence = 0.5 允许通过但标记需确认）
6. complexity_assessment 所有字段均已填写
7. 输出为有效的 JSON 对象

## 错误处理

- **LLM 调用失败**：自动切换到 fallback 规则算法，记录 `recognition_method: rule_based_fallback`
- **JSON 解析失败**：捕获异常，切换 fallback，记录错误日志
- **confidence < 0.6**：输出提示 `请确认您的意图是否正确...`，列出识别结果供用户确认，不自动继续
- **输入为空**：返回错误并提示用户输入描述

## 示例

**输入**：
`"帮我优化一下会议的列表页面，加载太慢了"`

**输出**：
```json
{
  "intent_id": "INT_20260522_a1b2",
  "domain": "frontend",
  "action": "optimize",
  "target": {
    "type": "page",
    "name": "会议列表页",
    "path": "src/views/MeetingList"
  },
  "constraints": ["保持现有UI不变", "需兼容移动端"],
  "keywords": ["会议列表", "性能优化", "加载速度"],
  "success_criteria": "会议列表页首次加载时间从3s降至1s以内",
  "original_input": "帮我优化一下会议的列表页面，加载太慢了",
  "complexity_assessment": {
    "is_simple": false,
    "complexity_score": 6,
    "reasoning": "涉及性能分析、代码优化和结果验证，多步骤",
    "requires_multiple_steps": true,
    "needs_state": false,
    "requires_multiple_skills": true,
    "involves_multiple_files": true,
    "has_branching": false
  },
  "confidence": {
    "overall": 0.88,
    "domain_confidence": 0.95,
    "action_confidence": 0.9,
    "complexity_confidence": 0.8,
    "uncertain_aspects": ["不确定是否有API层面的优化空间"]
  },
  "recognition_method": "llm"
}
```

## 注意事项

- 意图识别的质量直接影响后续所有环节，优先保证 domain 和 action 的准确性
- 遇到模糊输入时，宁可降低 confidence 也不应强行归类
- project_context.json 中的 tech_stack 信息应作为 domain 判断的重要参考
- 所有识别结果（含 fallback）均需记录 recognition_method 字段，供后续分析优化

## 原子skill位置

./.claude/skills/atomic-skills/intent-recognition/SKILL.md