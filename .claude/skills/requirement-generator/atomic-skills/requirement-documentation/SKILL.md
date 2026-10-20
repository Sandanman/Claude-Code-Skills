---
name: requirement-documentation
---

## 概述

## 核心能力
- 整合所有前置原子skill的输出数据
- 自动填充项目上下文
- 生成时间戳和版本信息

## 核心能力
- 整合所有原子skill的输出数据
- 生成符合规范的 requirements.json（含 5 维度 quality.score）
- 生成结构化的 requirements.md 文档（含 quality score 可视化）
- 自动填充项目上下文
- 生成时间戳和版本信息

## 输入
所有前置原子skill的输出结果：
- requirement-input-processor（含 code_snippet_analysis / api_spec_analysis）
- api-spec-designer（含 reuse_existing）
- test-case-generator
- requirement-evaluation（含 7 维度 quality.score + feasibility/urgency）
- project-context-reader

## 输出

### 1. requirements.json（机器可读，v1.2）

```json
{
  "version": "1.2",
  "generated_at": "2026-06-03T10:00:00Z",
  "source": "user_text | uploaded_document | ui_design_image | code_snippet | api_spec | mixed",
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
    "matched_patterns": [
    ],
    "reuse_rate": 0.75,
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

```markdown
# 需求规格说明书

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
```

## 1. 需求概述
[需求描述]

## 2. 需求分析
- **来源**：user_text / code_snippet / api_spec
- **代码操作**：新建 / 修改
- **是否需API**：是 / 否
- **是否含权限控制**：是 / 否

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
- 质量评估：7 维度评估（completeness/consistency/testability/security/feasibility/urgency）
```

## 执行逻辑

### 1. 数据收集
- 验证所有必需数据都已存在

### 2. requirements.json 生成
- 构建JSON结构
- 填充来自各原子skill的数据
- **生成 pattern 模式匹配结果**
- 生成时间戳和版本信息
- 验证JSON格式

### 3. requirements.md 生成
- 按照固定模板构建Markdown文档
- **新增 pattern 匹配结果说明**
- 保留 quality score 可视化（7维度，v1.2 扩展）
- 填充各章节内容
- 格式化代码块和表格
- 验证文档完整性

### 4. 输出
- 写入当前目录的 requirements.json 文件
- 写入当前目录的 requirements.md 文件

## 依赖关系
- 依赖所有前置原子 skill

## 完成标准
1. 所有前置原子skill已完成（8个，v1.2）
4. 两个文件内容与所有前置输出一致
5. 时间戳和版本信息已正确填充
6. 文件已保存到当前目录

## 错误处理
- **前置数据缺失**：报告缺失项，停止生成
- **JSON格式错误**：重新构建并验证
- **Markdown格式错误**：检查模板和填充内容
- **文件写入失败**：报告错误，尝试写入临时文件

## 文件位置
- requirements.json：./requirements.json
- requirements.md：./requirements.md

## 版本
