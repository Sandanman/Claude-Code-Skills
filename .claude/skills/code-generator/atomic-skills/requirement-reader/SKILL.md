---
name: requirement-reader
description: 读取和解析标准化的需求文档（requirements.json），智能识别需求复杂度，简单需求直接处理，复杂需求建议先执行requirement-generator。作为code-generator的第一个原子skill执行。
---

# Requirement Reader 原子Skill

## 概述
读取和解析标准化的需求文档（`requirements.json`），该文件由 requirement-generator skill 生成。**智能识别需求复杂度**：简单需求直接处理，复杂需求建议先执行 requirement-generator 标准化。确保 input 的一致性和完整性。

## 核心能力
- 检测 `requirements.json` 文件存在性
- 解析标准化的JSON需求文档
- 验证需求文档结构完整性
- 提取所有关键信息（模块、流程、UI组件、API规格、测试用例、质量评估）
- 继承 project-context 项目上下文
- 兼容自由文本输入（fallback 机制）

## 输入
用户提供的需求（可以是requirements.json文件路径，或直接文本描述）

## 输出
结构化的需求数据，包含以下内容：

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
        "ui_library": {
          "name": "element-plus",
          "version": "2.2.31",
          "components": ["el-form", "el-input", "el-button"]
        },
        "project_structure": {
          "components_dir": "src/components",
          "views_dir": "src/views",
          "apis_dir": "src/api"
        },
        "code_style": {
          "has_style_guide": true,
          "style_guide_path": "/CODE_STYLE.md",
          "indent": "2sp",
          "quotes": "single"
        }
      }
    },
    "modules": [...],
    "flow": {...},
    "ui_components": [...],
    "api_spec": {...},
    "test_cases": [...],
    "quality": {
      "score": 95,
      "issues": [],
      "recommendations": []
    }
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
  "fallback_reason": null
}
```

## 执行逻辑

### 场景1：检测到 requirements.json（推荐）
1. 在当前目录和上级目录查找 `requirements.json`
2. 验证文件格式和必需字段
3. 解析JSON内容
4. 提取所有需求信息
5. 标记 `input_type` 为 `requirements_json`
6. 输出完整数据结构

### 场景2：未找到 requirements.json（fallback）
1. 检测文件不存在
2. 分析用户提供的需求文本：
   - 计算描述长度
   - 识别功能点数量
   - 检测关键词（系统、管理、模块等）
3. 判断需求复杂度：
   - **简单需求**（< 50字，1个功能点，无系统/管理等关键词）：
     - 标记为"简单需求"
     - 调用 requirement-analysis 进行快速分析
   - **复杂需求**（> 100字，≥2个功能点，含系统/管理等关键词）：
     - 标记为"复杂需求"
     - 提示用户：
       ```
       这是一个复杂需求，是否需要先执行 requirement-generator 生成标准化文档？
       1. 是 - 执行 requirement-generator 生成 requirements.json
       2. 否 - 直接分析需求（推荐用于临时开发）
       ```
     - 根据用户选择：
       - **选项1**：等待用户执行 requirement-generator
       - **选项2**：调用 requirement-analysis 进行快速分析
4. 标记 `input_type` 和 `fallback_reason`

### 场景3：用户提供文件路径
1. 验证文件路径有效性
2. 读取并解析JSON
3. 验证结构（参考场景1）
4. 输出结果

## 依赖关系
- 无依赖（首个原子skill，或fallback时调用 requirement-analysis）
- 在 fallback 模式下，依赖 requirement-analysis（文本解析）

## 完成标准
1. ✅ 已检测 requirements.json 文件存在性
2. ✅ 已解析需求数据（标准JSON或自由文本）
3. ✅ 已验证关键字段完整性
4. ✅ 已识别需求类型（单模块/多模块）
5. ✅ 已继承项目上下文（如果存在）
6. ✅ 输出统一的结构化需求数据

## 错误处理
- **文件不存在**：进入fallback流程
- **JSON格式错误**：提示用户检查文件格式
- **必需字段缺失**：列出缺失字段，提示用户补充
- **需求质量低**：继承 requirements.json 中的 quality 评估，记录警告

## 与 requirement-generator 的协作

### requirement-generator 的输出
```
./
├── requirements.json  (标准需求文档)
└── requirements.md    (人类可读文档)
```

### requirement-reader 的输入
```json
{
  "version": "1.0",
  "generated_at": "...",
  "source": "user_text",
  "project_context_used": true,
  "requirement": { ... },
  "project_context": { ... },
  "modules": [...],
  "flow": {...},
  "ui_components": [...],
  "api_spec": {...},
  "test_cases": [...],
  "quality": { ... }
}
```

### 数据流转
```
requirement-generator → requirements.json
↓
code-generator → requirement-reader（读取）
↓
提取 project_context → 传递给 tech-stack-detection
提取 api_spec → 传递给 code-design
提取 ui_components → 传递给 code-design
提取 modules → 传递给 requirement-analysis 模块划分
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
- `project_context`（如果缺失，使用默认配置）
- `flow`（如果缺失，不执行 flow-based 设计）
- `test_cases`（如果缺失，生成基础测试用例）
- `quality`（如果缺失，设为 80 分并生成警告）

### 字段类型校验
- `modules`：数组，每个元素包含 `name`, `type`, `description`, `priority`
- `ui_components`：数组，每个元素包含 `type`, `purpose`, `fields`, `buttons`
- `api_spec.endpoints`：数组，每个元素包含 `method`, `path`, `request`, `response`, `auth_required`
- `quality.score`：数字，范围 0-100

## Fallback 到文本解析

如果 requirements.json 不存在，自动调用 requirement-analysis 处理自由文本：

```json
{
  "input_type": "free_text",
  "fallback_reason": "requirements.json not found",
  "normalized_requirement": {
    "type": "single_module",
    "modules_count": 1,
    "estimated_files": 2,
    "has_ui_spec": false,
    "has_api_spec": false,
    "quality_score": null,
    "needs_clarification": true
  }
}
```

此时 `requirement-analysis` 的输出会被包装为统一格式。

## 优势
- **标准化**：统一起点，减少歧义
- **完整性**：继承所有前期分析成果
- **复用性**：模块、API、UI信息可直接用于生成
- **质量保证**：继承需求质量评估
- **可追溯**：保留原始需求文档的所有元数据

## 注意事项
- 优先读取 requirements.json，不重复造轮子
- 如果 requirements.json 存在但项目上下文缺失，提示用户执行 scan-object-info
- 验证所有字段，拒绝不完整的数据
- 记录日志和警告供后续步骤使用

## 原子skill位置
./.claude/skills/code-generator/atomic-skills/requirement-reader/SKILL.md
