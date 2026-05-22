---
name: requirement-documentation
description: 整合所有原子skill的输出，生成标准化的机器可读requirements.json和人类可读requirements.md文档（含 quality score 可视化）。作为最后一个原子skill执行。
---

# Requirement Documentation 原子 Skill（改进版 v1.1）

## 概述
整合所有前置原子 skill 的输出，生成标准化的需求文档。输出两种格式：
1. **requirements.json**：机器可读的JSON格式，含多维度 quality.score
2. **requirements.md**：人类可读的Markdown格式文档，**含 quality score 可视化**

## 核心能力
- 整合所有原子skill的输出数据
- 生成符合规范的 requirements.json（含 5 维度 quality.score）
- 生成结构化的 requirements.md 文档（含 quality score 可视化）
- 自动填充项目上下文
- 生成时间戳和版本信息

## 输入
所有前置原子skill的输出结果（含 v1.1 新增字段）：
- requirement-input-processor（含 code_snippet_analysis / api_spec_analysis）
- requirement-decomposition
- requirement-analysis
- function-flow-designer（含 sub_flows / cross_flow_references）
- ui-component-identifier（含 validation 子流程）
- api-spec-designer（含 reuse_existing）
- test-case-generator
- requirement-evaluation（含 5 维度 quality.score）
- project-context-reader

## 输出
两个文件：

### 1. requirements.json（机器可读，改进版）

```json
{
  "version": "1.1",
  "generated_at": "2026-05-21T10:00:00Z",
  "source": "user_text | uploaded_document | ui_design_image | code_snippet | api_spec | mixed",
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
    "issues": [],
    "recommendations": ["建议添加'记住我'功能"]
  }
}
```

### 2. requirements.md（人类可读，改进版含 quality 可视化）

```markdown
# 需求规格说明书

## 1. 需求概述
[需求描述]

## 2. 需求分析
- **来源**：user_text / code_snippet / api_spec
- **代码操作**：新建 / 修改
- **是否需API**：是 / 否
- **是否含权限控制**：是 / 否
- **是否复用现有代码**：是 / 否（**新增 v1.1**）

## 3. 模块分解
| 模块名称 | 类型 | 描述 | 优先级 |
|----------|------|------|--------|
| 用户登录 | auth | 用户通过用户名和密码登录系统 | 高 |

## 4. 功能流程
- **流程类型**：CRUD
- **节点**：
  - 登录页（/login）：创建 → 跳转到首页
- **子流程**：
  - 表单验证子流程（嵌入登录页）（**新增 v1.1**）
- **流转**：登录页 → 首页
- **权限**：所有用户

## 5. UI组件设计
- **组件类型**：form
- **用途**：用户登录表单
- **字段**：
  - username (text, 必填，含 inline 验证)
- **按钮**：
  - 登录（primary, submit）

## 6. API接口设计
- **接口**：POST /api/login
- **请求**：
  ```json
  {"username": "string", "password": "string"}
  ```
- **响应**：
  ```json
  {"code": 0, "data": {"token": "string"}}
  ```
- **认证**：无

## 7. 测试用例
| 测试场景 | 类型 | 优先级 | 输入 | 预期结果 |
|----------|------|--------|------|----------|
| 正常登录 | normal | P1 | 用户名：test，密码：123456 | 成功跳转首页 |
| 用户名为空 | boundary | P2 | 用户名：空 | 提示"用户名不能为空" |

## 8. 需求质量评估

### 质量评分卡（**新增 v1.1**）

| 维度 | 评分 | 状态 |
|------|------|------|
| 综合评分 | 95/100 | 优秀 |
| 完整性 | 98/100 | 优秀 |
| 一致性 | 95/100 | 良好 |
| 可测试性 | 92/100 | 良好 |
| 安全性 | 100/100 | 优秀 |

### 可视化

```
综合评分  ████████████████████  95/100  ✅ 优秀
完整性   ████████████████████  98/100  ✅ 优秀
一致性   ███████████████████  95/100  ✅ 良好
可测试性 ██████████████████  92/100  ✅ 良好
安全性   ████████████████████ 100/100  ✅ 优秀
```

- **综合评分**：95/100
- **问题**：无
- **建议**：建议添加"记住我"功能

## 9. 项目上下文
- **来源**：scan-object-info
- **框架**：Vue 3
- **UI库**：Element Plus 2.2.31
- **组件**：el-form, el-input, el-button, el-table
- **目录结构**：src/components, src/views, src/api
- **代码规范**：2空格缩进，单引号

## 10. 生成信息
- 生成时间：2026-05-21 10:00:00
- 生成工具：requirement-generator v1.1
- 质量评估：5 维度评估（completeness/consistency/testability/security）
```

## 执行逻辑

### 1. 数据收集
- 收集所有前置原子skill的输出结果
- 验证所有必需数据都已存在

### 2. requirements.json 生成
- 构建JSON结构
- 填充来自各原子skill的数据
- 生成时间戳和版本信息（v1.1）
- 验证JSON格式

### 3. requirements.md 生成
- 按照固定模板构建Markdown文档
- **新增 quality score 可视化（ASCII bar chart）（新增 v1.1）**
- 填充各章节内容
- 格式化代码块和表格
- 验证文档完整性

### 4. 输出
- 写入当前目录的 requirements.json 文件
- 写入当前目录的 requirements.md 文件
- 记录生成日志

## 依赖关系
- 依赖所有前置原子skill

## 完成标准
1. 所有前置原子skill已完成
2. requirements.json 已生成且格式正确（包含 5 维度 quality.score）
3. requirements.md 已生成且格式正确（包含 quality score 可视化）
4. 两个文件内容与所有前置输出一致
5. 时间戳和版本信息已正确填充
6. 文件已保存到当前目录

## 错误处理
- **前置数据缺失**：报告缺失项，停止生成
- **JSON格式错误**：重新构建并验证
- **Markdown格式错误**：检查模板和填充内容
- **文件写入失败**：报告错误，尝试写入临时文件

## 注意事项
- 严格遵循输出格式规范
- 不修改或添加任何原子skill的输出内容
- 仅整合，不分析
- 不生成新的需求信息
- 不依赖项目文件
- requirements.md 必须包含 quality score 可视化（ASCII bar chart，**新增 v1.1**）

## 文件位置
- requirements.json：./requirements.json
- requirements.md：./requirements.md

## 版本
v1.1 - 改进版：新增 5 维度 quality.score、requirements.md 中新增 quality score 可视化、扩展版本号到 v1.1