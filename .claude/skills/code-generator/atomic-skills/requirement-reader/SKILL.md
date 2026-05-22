---
name: requirement-reader
description: 读取和解析标准化的需求文档（requirements.json），智能识别需求复杂度，简单需求直接处理，复杂需求建议先执行 requirement-generator。作为 code-generator 的第二个原子skill执行（在 multi-scenario-adapter 之后）。
---

# Requirement Reader 原子Skill v1.2

## 概述

读取和解析标准化的需求文档（`requirements.json`），该文件由 requirement-generator skill 生成。**智能识别需求复杂度**：简单需求直接处理，复杂需求建议先执行 requirement-generator 标准化。确保 input 的一致性和完整性。

## 核心能力

- 检测 `requirements.json` 文件存在性
- 解析标准化的JSON需求文档
- 验证需求文档结构完整性
- 提取所有关键信息（模块、流程、UI组件、API规格、测试用例、质量评估）
- 继承 project_context.json 项目上下文（优先）
- 兼容自由文本输入（fallback 机制）

## 输入

- **multi-scenario-adapter 输出**：包含场景类型判断结果
- **用户需求**：可以是 requirements.json 文件路径，或直接文本描述

## 输出

结构化的需求数据：

```json
{
  "input_type": "requirements_json | free_text",
  "requirements_json": {
    "version": "1.0",
    "generated_at": "2026-04-09T15:00:00Z",
    "source": "user_text",
    "project_context_used": true,
    "requirement": {
      "raw_text": "用户原始需求",
      "summary": "需求摘要",
      "code_action": "new",
      "requires_new_api": true,
      "has_auth": true
    },
    "project_context": {
      "source": "scan-object-info",
      "data": {
        "frontend_framework": "vue3",
        "ui_library": { "name": "element-plus", "version": "2.2.31" },
        "project_structure": {
          "components_dir": "src/components",
          "views_dir": "src/views",
          "apis_dir": "src/api"
        },
        "code_style": { "has_style_guide": true, "indent": "2sp", "quotes": "single" }
      }
    },
    "modules": [...],
    "flow": {...},
    "ui_components": [...],
    "api_spec": {...},
    "test_cases": [...],
    "quality": { "score": 95, "issues": [], "recommendations": [] }
  },
  "normalized_requirement": {
    "type": "single_module | multi_module",
    "modules_count": 1,
    "estimated_files": 3,
    "has_ui_spec": true,
    "has_api_spec": true,
    "quality_score": 95,
    "needs_clarification": false
  },
  "fallback_reason": null,
  "source": "project_context_json | requirements_json | free_text"
}
```

## 执行逻辑

### 场景1：检测到 requirements.json（推荐）

1. 在当前目录和上级目录查找 `requirements.json`
2. 验证文件格式和必需字段
3. 解析JSON内容
4. 提取所有需求信息
5. 标记 `input_type` 为 `requirements_json`
6. 标记 `source` 为 `requirements_json`
7. 输出完整数据结构

### 场景2：未找到 requirements.json（fallback）

1. 检测文件不存在
2. 分析用户提供的需求文本
3. 判断需求复杂度（由 multi-scenario-adapter 决定处理方式）
4. 根据复杂度选择：
   - **简单需求**：快速解析，调用 requirement-analysis
   - **复杂需求**：提示用户是否需要标准化
5. 标记 `input_type` 和 `fallback_reason`

### 场景3：用户提供文件路径

1. 验证文件路径有效性
2. 读取并解析JSON
3. 验证结构（参考场景1）
4. 输出结果

### 场景4：从 project_context.json 读取（v1.2 改进）

1. 检测 requirements.json 不存在
2. 查找项目根目录的 `project_context.json`
3. 读取项目上下文信息
4. 标记 `source` 为 `project_context_json`
5. 补充技术栈信息供后续使用

## 依赖关系

- **依赖**：multi-scenario-adapter（提供场景类型）
- **被依赖**：requirement-analysis、tech-stack-detection、code-design

## 完成标准

1. ✅ 已检测 requirements.json 文件存在性
2. ✅ 已解析需求数据（标准JSON或自由文本）
3. ✅ 已验证关键字段完整性
4. ✅ 已识别需求类型（单模块/多模块）
5. ✅ 已继承项目上下文（如果存在）
6. ✅ 已标记数据来源（requirements_json/project_context_json/free_text）
7. ✅ 输出统一的结构化需求数据

## 错误处理

- **文件不存在**：进入fallback流程
- **JSON格式错误**：提示用户检查文件格式
- **必需字段缺失**：列出缺失字段，提示用户补充
- **需求质量低**：继承 requirements.json 中的 quality 评估，记录警告

## 与 requirement-generator 的协作

### 数据流转

```
requirement-generator → requirements.json
    ↓
code-generator → requirement-reader（读取）
    ↓
提取 project_context → 传递给 tech-stack-detection
提取 api_spec → 传递给 code-design
提取 ui_components → 传递给 code-design
提取 modules → 传递给 module-integration
提取 test_cases → 传递给 code-validation
提取 quality → 传递给 documentation-update
```

## 标准化需求文档（requirements.json）结构验证

### 必需字段

- `version`
- `generated_at`
- `requirement.summary`
- `requirement.code_action`
- `modules`（至少1个）
- `api_spec.endpoints`（如果 `requires_new_api` 为 true）
- `ui_components`（至少1个）

### 可选字段（有默认值）

- `project_context`（如果缺失，尝试读取 project_context.json）
- `flow`（如果缺失，不执行 flow-based 设计）
- `test_cases`（如果缺失，生成基础测试用例）
- `quality`（如果缺失，设为 80 分并生成警告）

## v1.2 改进点

1. **优先读取 project_context.json**：不依赖 requirements.json 也能获取技术栈信息
2. **标记数据来源**：明确区分 requirements_json、project_context_json、free_text
3. **改进 fallback 逻辑**：根据 multi-scenario-adapter 的场景类型调整处理方式
4. **统一输出格式**：所有来源的数据都输出为统一结构

## 注意事项

- 优先读取 requirements.json，不重复造轮子
- 如果 requirements.json 存在但项目上下文缺失，尝试读取 project_context.json
- 验证所有字段，拒绝不完整的数据
- 记录日志和警告供后续步骤使用

## 原子skill位置

`.claude/skills/code-generator/atomic-skills/requirement-reader/SKILL.md`