---
name: multi-scenario-adapter
description: 智能适配器，根据需求类型（标准输入/简单需求/复杂需求/多模块）自动适配执行流程，决定后续使用哪些原子skill。作为 code-generator 的第一个原子skill执行，是 v1.2 新增的核心组件。
---

# Multi-Scenario Adapter 原子Skill v1.2（NEW）

## 概述

智能适配器，根据需求类型自动适配执行流程，决定后续使用哪些原子skill。**这是 v1.2 新增的核心组件**，负责智能路由，确保不同复杂度的需求都能得到最优处理。

## 核心能力

- 检测 requirements.json 是否存在
- 分析需求文本复杂度
- 识别单模块/多模块需求
- 选择最优执行路径
- 决定是否需要 requirement-analysis
- 决定是否需要 module-integration
- 输出明确的场景类型和执行计划

## 输入

- **用户需求**：可以是 requirements.json 文件路径，或直接文本描述

## 输出

场景决策报告：

```json
{
  "scenario_type": "scenario_1 | scenario_2 | scenario_3",
  "scenario_name": "标准输入 | 简单需求 | 复杂/多模块需求",
  "input_source": "requirements_json | project_context_json | free_text",
  "execution_plan": {
    "skip_requirement_analysis": true,
    "skip_module_integration": true,
    "tech_stack_source": "requirements_json | project_context_json | project_scan",
    "execution_path": ["requirement-reader", "tech-stack-detection", "code-design", ...]
  },
  "complexity_assessment": {
    "description_length": 45,
    "functionality_points": 1,
    "module_count": 1,
    "complexity_score": 2,
    "is_multi_module": false
  },
  "recommendations": [
    "检测到 requirements.json，建议使用标准输入模式"
  ],
  "decision_reason": "检测到 requirements.json 存在且 project_context 完整，适配为场景1-标准输入"
}
```

## 场景决策流程

```
用户输入
    ↓
[Step 1] 检测 requirements.json 是否存在
    ↓
    ├─ 存在 → 读取 project_context
    │        ↓
    │        ├─ project_context 完整 → 场景1（标准输入）
    │        └─ project_context 不完整 → 场景1 + 补充 project_scan
    │
    └─ 不存在 → [Step 2] 分析需求文本
                ↓
                ├─ 描述 < 50字，功能点 = 1 → 场景2（简单需求）
                └─ 描述 ≥ 50字，功能点 ≥ 2 → 场景3（复杂/多模块需求）
```

## 执行逻辑

### Step 1：检测输入来源

1. 检测当前目录和上级目录是否有 `requirements.json`
2. 检测项目根目录是否有 `project_context.json`
3. 分析用户输入是文件路径还是文本描述

### Step 2：判断场景类型

**场景1：标准输入（优先级最高）**

触发条件：
- requirements.json 存在

执行计划：
```json
{
  "skip_requirement_analysis": true,
  "skip_module_integration": "conditional",
  "tech_stack_source": "requirements_json",
  "execution_path": [
    "requirement-reader",
    "tech-stack-detection",
    "code-design",
    "code-generation",
    "module-integration (if multi-module)",
    "code-validation",
    "documentation-update"
  ]
}
```

**场景2：简单需求**

触发条件：
- requirements.json 不存在
- 描述长度 < 50字
- 功能点 = 1
- 无多模块特征

执行计划：
```json
{
  "skip_requirement_analysis": false,
  "skip_module_integration": true,
  "tech_stack_source": "project_scan",
  "execution_path": [
    "requirement-reader",
    "requirement-analysis",
    "tech-stack-detection",
    "code-design",
    "code-generation",
    "code-validation",
    "documentation-update"
  ]
}
```

**场景3：复杂/多模块需求**

触发条件：
- requirements.json 不存在
- 描述长度 ≥ 50字
- 功能点 ≥ 2
- 或多模块特征明显

执行计划：
```json
{
  "skip_requirement_analysis": false,
  "skip_module_integration": false,
  "tech_stack_source": "project_scan",
  "execution_path": [
    "requirement-reader",
    "requirement-analysis",
    "tech-stack-detection",
    "code-design",
    "code-generation",
    "module-integration",
    "code-validation",
    "documentation-update"
  ]
}
```

### Step 3：输出场景决策报告

1. 生成场景类型
2. 生成执行计划
3. 生成复杂度评估
4. 生成建议

## 复杂度评估算法

```python
def assess_complexity(requirement_text):
    complexity_score = 0

    # 描述长度评分
    if len(requirement_text) < 50:
        complexity_score += 1
    elif len(requirement_text) < 100:
        complexity_score += 2
    else:
        complexity_score += 3

    # 功能点评分
    functionality_points = count_functionality_points(requirement_text)
    if functionality_points == 1:
        complexity_score += 1
    elif functionality_points == 2:
        complexity_score += 2
    else:
        complexity_score += 3

    # 关键词评分
    complex_keywords = ['系统', '管理', '模块', '包含以下', '多个', '复杂']
    if any(keyword in requirement_text for keyword in complex_keywords):
        complexity_score += 2

    # 多模块特征评分
    module_keywords = ['模块1', '模块2', '创建模块', '列表模块', '详情模块']
    module_count = count_keywords(requirement_text, module_keywords)
    if module_count >= 3:
        complexity_score += 3
    elif module_count >= 2:
        complexity_score += 2

    return {
        "complexity_score": complexity_score,
        "functionality_points": functionality_points,
        "module_count": module_count,
        "is_multi_module": module_count >= 2
    }
```

## 依赖关系

- **依赖**：无（首个执行的原子skill）
- **被依赖**：requirement-reader、requirement-analysis、tech-stack-detection、code-design、code-generation、module-integration、code-validation、documentation-update

## 完成标准

1. ✅ 已检测 requirements.json 是否存在
2. ✅ 已检测 project_context.json 是否存在
3. ✅ 已分析需求文本复杂度
4. ✅ 已判断单模块/多模块
5. ✅ 已生成执行计划
6. ✅ 已输出场景决策报告

## 错误处理

- **输入为空**：提示用户输入需求
- **输入无法解析**：提示用户检查输入格式
- **文件路径无效**：fallback 到文本解析

## 输出示例

### 示例1：标准输入

**输入**：
```
用户：帮我实现登录功能（已有 requirements.json）
检测：requirements.json 存在
```

**输出**：
```json
{
  "scenario_type": "scenario_1",
  "scenario_name": "标准输入",
  "input_source": "requirements_json",
  "execution_plan": {
    "skip_requirement_analysis": true,
    "skip_module_integration": "conditional",
    "tech_stack_source": "requirements_json",
    "execution_path": ["requirement-reader", "tech-stack-detection", "code-design", "code-generation", "code-validation", "documentation-update"]
  },
  "complexity_assessment": {
    "description_length": 0,
    "functionality_points": 0,
    "module_count": 1,
    "complexity_score": 0,
    "is_multi_module": false
  },
  "recommendations": [
    "检测到 requirements.json，建议使用标准输入模式",
    "跳过 requirement-analysis，直接复用已有分析成果"
  ],
  "decision_reason": "requirements.json 存在，包含完整的 project_context、api_spec 和 ui_components，适配为场景1-标准输入"
}
```

### 示例2：简单需求

**输入**：
```
用户："写一个函数，将 ISO 时间格式化为 YYYY-MM-DD HH:mm"
检测：无 requirements.json，描述长度 30字，功能点 1个
```

**输出**：
```json
{
  "scenario_type": "scenario_2",
  "scenario_name": "简单需求",
  "input_source": "free_text",
  "execution_plan": {
    "skip_requirement_analysis": false,
    "skip_module_integration": true,
    "tech_stack_source": "project_scan",
    "execution_path": ["requirement-reader", "requirement-analysis", "tech-stack-detection", "code-design", "code-generation", "code-validation", "documentation-update"]
  },
  "complexity_assessment": {
    "description_length": 30,
    "functionality_points": 1,
    "module_count": 1,
    "complexity_score": 2,
    "is_multi_module": false
  },
  "recommendations": [
    "检测为简单需求，跳过 module-integration",
    "建议使用快速分析流程"
  ],
  "decision_reason": "需求描述简短（30字），功能点单一（1个），适配为场景2-简单需求"
}
```

### 示例3：复杂/多模块需求

**输入**：
```
用户："实现会议管理系统，包含三个模块：1.会议创建 2.会议列表 3.会议详情"
检测：无 requirements.json，描述长度 45字，功能点 3个，模块数 3个
```

**输出**：
```json
{
  "scenario_type": "scenario_3",
  "scenario_name": "复杂/多模块需求",
  "input_source": "free_text",
  "execution_plan": {
    "skip_requirement_analysis": false,
    "skip_module_integration": false,
    "tech_stack_source": "project_scan",
    "execution_path": ["requirement-reader", "requirement-analysis", "tech-stack-detection", "code-design", "code-generation", "module-integration", "code-validation", "documentation-update"]
  },
  "complexity_assessment": {
    "description_length": 45,
    "functionality_points": 3,
    "module_count": 3,
    "complexity_score": 8,
    "is_multi_module": true
  },
  "recommendations": [
    "检测为多模块需求，必须执行 module-integration",
    "建议先执行 requirement-generator 生成标准化文档（可选）"
  ],
  "decision_reason": "需求包含3个模块，功能点3个，复杂度较高，适配为场景3-复杂/多模块需求"
}
```

## v1.2 核心改进

1. **新增组件**：作为 code-generator 的首个原子skill，智能决定后续流程
2. **4场景路由**：标准输入、简单需求、复杂需求、多模块需求各有最优路径
3. **优先级检测**：优先检测 requirements.json 和 project_context.json
4. **执行计划生成**：明确哪些skill需要执行，哪些需要跳过
5. **复杂度评估**：量化评估需求复杂度，辅助决策

## 与其他skill的协作

```
multi-scenario-adapter（决策）
    ↓
├─ 场景1 → requirement-reader → tech-stack-detection → ... → documentation-update
├─ 场景2 → requirement-reader → requirement-analysis → tech-stack-detection → ... → documentation-update
└─ 场景3 → requirement-reader → requirement-analysis → tech-stack-detection → ... → module-integration → ... → documentation-update
```

## 注意事项

- 首个执行的原子skill，无需依赖其他skill
- 输出结果影响整个执行流程
- 决策必须准确，否则后续流程会出错
- 记录决策原因，便于追踪和优化

## 原子skill位置

`.claude/skills/code-generator/atomic-skills/multi-scenario-adapter/SKILL.md`