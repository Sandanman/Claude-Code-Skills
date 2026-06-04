---
name: requirement-documentation
description: 整合所有原子skill的输出，生成标准化的机器可读requirements.json（含 τ 分解 + pattern 匹配）和人类可读requirements.md（含 quality score + τ 可视化）。作为最后一个原子skill执行。v1.2 整合韬理论。
---

# Requirement Documentation 原子 Skill（v1.2 - 韬理论增强版）

## 概述
整合所有前置原子 skill 的输出，生成标准化的需求文档。**v1.2 输出包含 τ 分解报告和 pattern 模式匹配结果。**

## τ 预算
- simple：500 token
- moderate：800 token
- complex：1500 token

## 核心能力
- 整合所有前置原子skill的输出数据
- 生成符合规范的 requirements.json（含 7维度 quality.score + τ 分解 + pattern 匹配，v1.2）
- 生成结构化的 requirements.md 文档（含 quality score 可视化 + τ 分解可视化，v1.2）
- 自动填充项目上下文
- 生成时间戳和版本信息

## 核心能力
- 整合所有原子skill的输出数据
- 生成符合规范的 requirements.json（含 5 维度 quality.score）
- 生成结构化的 requirements.md 文档（含 quality score 可视化）
- 自动填充项目上下文
- 生成时间戳和版本信息

## 输入
所有前置原子skill的输出结果（v1.2）：
- requirement-input-processor（含 code_snippet_analysis / api_spec_analysis）
- requirement-analysis（含 decomposition 折叠合并）
- design-designer（原 function-flow-designer + ui-component-identifier 折叠合并）
- api-spec-designer（含 reuse_existing）
- test-case-generator
- requirement-evaluation（含 7 维度 quality.score + feasibility/urgency）
- project-context-reader

## 输出
两个文件（v1.2 新增 τ 分解 + pattern 匹配）：

### 1. requirements.json（机器可读，v1.2）

```json
{
  "version": "1.2",
  "generated_at": "2026-06-03T10:00:00Z",
  "source": "user_text | uploaded_document | ui_design_image | code_snippet | api_spec | mixed",
  "tau": {
    "complexity": "moderate",
    "total_budget": 6600,
    "total_consumed": 5840,
    "remaining": 760,
    "budget_utilization": 0.885,
    "folding_applied": false,
    "breakdown": {
      "input": 480, "analysis": 920, "design": 1380,
      "api": 890, "test": 740, "evaluation": 560,
      "context": 380, "doc": 490
    },
    "folding_notes": []
  },
  "pattern": {
    "matched_patterns": [
      { "name": "auth-login-standard", "maturity": "mature", "frequency": 12, "tau_discount": 0.7, "similarity": 0.92 }
    ],
    "reuse_rate": 0.75,
    "tau_saved": 1200
  },
  "project_context_used": true,
  "requirement": {
    "raw_text": "用户原始需求",
    "summary": "需求摘要",
    "code_action": "new",
    "requires_new_api": true,
    "has_auth": true
  },
  "project_context": {
    "source": "scan-object-info | manual | default",
    "data": {
      "frontend_framework": "vue3",
      "ui_library": { "name": "element-plus", "version": "2.2.31", "components": ["el-form", "el-input", "el-button", "el-table"] },
      "project_structure": { "components_dir": "src/components", "views_dir": "src/views", "apis_dir": "src/api" },
      "code_style": { "has_style_guide": true, "style_guide_path": "/CODE_STYLE.md", "indent": "2sp", "quotes": "single" }
    }
  },
  "modules": [ ... ],
  "flow": { ... },
  "ui_components": [ ... ],
  "api_spec": { ... },
  "test_cases": [ ... ],
  "quality": {
    "overall_score": 95,
    "completeness_score": 98,
    "consistency_score": 95,
    "testability_score": 92,
    "security_score": 100,
    "feasibility_score": 88,
    "urgency_score": 72,
    "issues": [],
    "recommendations": ["建议添加'记住我'功能"]
  }
}
```

### 2. requirements.md（人类可读，v1.2 含 τ + pattern 可视化）

```markdown
# 需求规格说明书

## τ 分解报告（**新增 v1.2**）

| 步骤 | τ 预算 | τ 消耗 | 状态 |
|------|--------|--------|------|
| input | 500 | 480 | ✅ 88% |
| analysis | 1000 | 920 | ✅ 92% |
| design | 1500 | 1380 | ✅ 92% |
| api | 1000 | 890 | ✅ 89% |
| test | 800 | 740 | ✅ 92% |
| evaluation | 600 | 560 | ✅ 93% |
| context | 400 | 380 | ✅ 95% |
| doc | 800 | 490 | ✅ 61% |
| **总计** | **6600** | **5840** | **88%** |

```
总预算  █████████████████████  6600
已消耗  ██████████████████    5840   88%  ✅
剩余    ██                    760    12%
```

**τ 折叠**：未触发（预算充足）
**τ 节省**：1200（来自模式复用，成熟模式 auth-login-standard τ 折扣70%）

## 1. 需求概述
[需求描述]

## 2. 需求分析
- **来源**：user_text / code_snippet / api_spec
- **代码操作**：新建 / 修改
- **是否需API**：是 / 否
- **是否含权限控制**：是 / 否
- **模式匹配**：auth-login-standard（相似度 92%，成熟模式 τ 折扣70%）**（新增 v1.2）**

## 3. 模块分解
| 模块名称 | 类型 | 描述 | 优先级 |
|----------|------|------|--------|
| 用户登录 | auth | 用户通过用户名和密码登录系统 | 高 |

## 4. 功能流程
- **流程类型**：CRUD
- **节点**：登录页（/login）：创建 → 跳转到首页
- **子流程**：表单验证子流程（嵌入登录页）
- **流转**：登录页 → 首页
- **权限**：所有用户

## 5. UI组件设计
- **组件类型**：form
- **用途**：用户登录表单
- **字段**：username (text, 必填，含 inline 验证)
- **按钮**：登录（primary, submit）

## 6. API接口设计
- **接口**：POST /api/login
- **请求**：`{"username": "string", "password": "string"}`
- **响应**：`{"code": 0, "data": {"token": "string"}}`
- **认证**：无

## 7. 测试用例
| 测试场景 | 类型 | 优先级 | 输入 | 预期结果 |
|----------|------|--------|------|----------|
| 正常登录 | normal | P1 | 用户名：test，密码：123456 | 成功跳转首页 |
| 用户名为空 | boundary | P2 | 用户名：空 | 提示"用户名不能为空" |

## 8. 需求质量评估（7维度 **新增 v1.2**）

| 维度 | 评分 | 状态 |
|------|------|------|
| 综合评分 | 95/100 | 优秀 |
| 完整性 | 98/100 | 优秀 |
| 一致性 | 95/100 | 良好 |
| 可测试性 | 92/100 | 良好 |
| 安全性 | 100/100 | 优秀 |
| 可行性 | 88/100 | 良好 | **（新增 v1.2）**
| 紧急度 | 72/100 | 中等 | **（新增 v1.2）**

### 可视化

```
综合评分  ████████████████████  95/100  ✅ 优秀
完整性   ████████████████████  98/100  ✅ 优秀
一致性   ███████████████████  95/100  ✅ 良好
可测试性 ██████████████████  92/100  ✅ 良好
安全性   ████████████████████ 100/100  ✅ 优秀
可行性   ██████████████████  88/100  ✅ 良好   ← 新增 v1.2
紧急度   ████████████████     72/100  ✅ 中等   ← 新增 v1.2
```

## 9. 项目上下文
- **来源**：scan-object-info
- **框架**：Vue 3
- **UI库**：Element Plus 2.2.31
- **目录结构**：src/components, src/views, src/api
- **代码规范**：2空格缩进，单引号

## 10. 生成信息
- 生成时间：2026-06-03 10:00:00
- 生成工具：requirement-generator v1.2（韬理论增强版）
- 质量评估：7 维度评估（completeness/consistency/testability/security/feasibility/urgency）
- τ 总消耗：5840/6600（88%）
- 模式复用：auth-login-standard（相似度92%，τ节省1200）
```

## 执行逻辑（v1.2）

### 1. 数据收集
- **K2栈叠**：优先从共享上下文 `task_skill.md` 读取所有前置skill输出
- 验证所有必需数据都已存在

### 2. requirements.json 生成
- 构建JSON结构
- 填充来自各原子skill的数据
- **生成 τ 分解报告（v1.2 新增）**
- **生成 pattern 模式匹配结果（v1.2 新增）**
- 生成时间戳和版本信息（v1.2）
- 验证JSON格式

### 3. requirements.md 生成
- 按照固定模板构建Markdown文档
- **新增 τ 分解可视化（ASCII bar chart）（v1.2 新增）**
- **新增 pattern 匹配结果说明（v1.2 新增）**
- 保留 quality score 可视化（7维度，v1.2 扩展）
- 填充各章节内容
- 格式化代码块和表格
- 验证文档完整性

### 4. 输出
- 写入当前目录的 requirements.json 文件
- 写入当前目录的 requirements.md 文件
- 记录生成日志（含 τ 消耗统计）

## 依赖关系（v1.2）
- 依赖所有前置原子skill（8个，v1.2 折叠后）
- **K2栈叠**：优先从共享上下文读取上游skill输出

## 完成标准（v1.2）
1. 所有前置原子skill已完成（8个，v1.2）
2. requirements.json 已生成且格式正确（包含 7 维度 quality.score + τ + pattern）
3. requirements.md 已生成且格式正确（包含 7 维度 quality score 可视化 + τ 分解可视化）
4. 两个文件内容与所有前置输出一致
5. 时间戳和版本信息已正确填充（v1.2）
6. 文件已保存到当前目录

## 错误处理
- **前置数据缺失**：报告缺失项，停止生成
- **JSON格式错误**：重新构建并验证
- **Markdown格式错误**：检查模板和填充内容
- **文件写入失败**：报告错误，尝试写入临时文件

## 注意事项（v1.2）
- 严格遵循输出格式规范
- 不修改或添加任何原子skill的输出内容
- 仅整合，不分析
- 不生成新的需求信息
- 不依赖项目文件
- requirements.md 必须包含：
  - **τ 分解可视化（v1.2 新增）**
  - **7 维度 quality score 可视化（v1.2 扩展）**
  - **pattern 匹配结果说明（v1.2 新增）**

## 文件位置
- requirements.json：./requirements.json
- requirements.md：./requirements.md

## 版本
v1.2 - 韬理论增强版：新增 τ 分解报告、pattern 模式匹配、7 维度 quality.score、requirements.md 新增 τ 可视化，K2 技能栈叠