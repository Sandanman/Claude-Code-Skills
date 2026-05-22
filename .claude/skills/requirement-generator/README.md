# Requirement Generator Skill 使用指南

## 快速开始

当您需要将模糊的自然语言需求转化为标准化的、可执行的机器需求文档时，requirement-generator 会自动分析、拆解、评估需求，并输出 JSON 和 Markdown 双文档。

### 使用方式
```
用户输入需求 → orchestrator识别意图 → requirement-generator接管任务 →
执行分析流程 → 输出 requirements.json + requirements.md
```

### 示例输入

**示例1：简单功能需求**
```
实现一个日期格式化工具，输入ISO格式的日期字符串，输出 'YYYY-MM-DD HH:mm' 格式
```

**示例2：中等复杂度需求**
```
实现会议管理系统，包含会议创建、会议列表展示、查看详情、编辑会议、删除会议功能
```

**示例3：复杂系统需求**
```
实现一个用户管理系统，包含：
1. 用户注册（用户名、邮箱、密码）
2. 用户登录（用户名、密码、记住我）
3. 权限管理（管理员、普通用户）
4. 个人中心（修改密码、修改头像）
```

## 执行流程详解

### 1. requirement-input-processor（需求输入处理器）
- 支持多种输入：文本、图片（UI设计图）、文档（Word/PDF）
- 提取关键词、功能点、约束条件
- 输出原始需求摘要

### 2. requirement-decomposition（需求分解）
- 将需求分解为独立功能模块
- 识别模块边界
- 标记可忽略模块（用户指定"暂不实现"）
- 输出模块化清单

### 3. requirement-analysis（需求分析）
- 判断代码操作类型：新建 vs 修改
- 判断是否需要新增API
- 判断是否涉及权限控制
- 输出技术分析报告

### 4. function-flow-designer（功能流程设计）
- 自动识别7种通用前端流程：
  - CRUD流程（数据管理）
  - 线性流程（多步操作）
  - 状态机流程（审批/工作流）
  - 向导流程（多步骤注册）
  - 单页工具（转换/计算）
  - 弹窗流程（快速操作）
  - 循环流程（重复操作）
- 输出流程节点、状态转换、权限控制

### 5. ui-component-identifier（UI组件识别）
- 识别通用UI组件类型（form、button、table等）
- **不绑定具体组件库**，输出语义类型
- 由 project-context 决定具体实现（Antd/Element/自定义）
- 输出组件清单、字段、按钮

### 6. api-spec-designer（API规格设计）
- 设计 REST API 接口
- 定义请求参数、响应格式、状态码
- 识别认证需求
- 输出 API 规格文档

### 7. test-case-generator（测试用例生成）
- 为每个模块生成测试场景
- 覆盖正常路径、异常场景、边界条件
- 输出测试用例清单

### 8. requirement-evaluation（需求评估）
- 评估需求完整性、一致性、可测试性
- 检测需求缺陷（遗漏、矛盾）
- 提供改进建议
- 输出质量评分报告

### 9. project-context-reader（项目上下文读取）
- 读取 `./.claude/project-context.json`
- 如果文件不存在，询问用户：
  - 选择执行 scan-object-info skill
  - 选择手动上传 project-context.json
  - 选择跳过（使用默认配置）
- **不自动扫描任何项目文件**
- 输出项目上下文数据

### 10. requirement-documentation（需求文档生成）
- 整合所有信息
- 输出 `requirements.json`（机器可读）
- 输出 `requirements.md`（人类可读）

## 项目上下文读取流程

### 场景1：已有 project-context.json
```
用户执行：scan-object-info
生成：./.claude/project-context.json
↓
用户执行：requirement-generator
自动读取：./.claude/project-context.json
↓
整合到 requirements.json
```

### 场景2：无 project-context.json
```
用户执行：requirement-generator
↓
检测：./.claude/project-context.json 不存在
↓
询问用户：
  1. 执行 scan-object-info skill 扫描项目（推荐）
  2. 手动上传 project-context.json
  3. 跳过，使用默认配置
↓
用户选择后继续执行
```

### project-context.json 格式
```json
{
  "frontend_framework": "vue3 | react18 | angular15 | svelte4 | vanilla",
  "ui_library": {
    "name": "element-plus | antd | mui | naiv-ui | custom",
    "version": "2.2.31",
    "components": ["el-form", "el-input", "el-button", "el-table"]
  },
  "project_structure": {
    "components_dir": "src/components",
    "views_dir": "src/views",
    "apis_dir": "src/api",
    "utils_dir": "src/utils"
  },
  "code_style": {
    "has_style_guide": true,
    "style_guide_path": "/CODE_STYLE.md",
    "indent": "2sp | 4sp",
    "quotes": "single | double"
  }
}
```

## 输出产物

### 1. requirements.json
- 机器可读的标准格式
- 可直接被 code-generator 使用
- 包含完整的需求规格和项目上下文

### 2. requirements.md
- 人类可读的详细文档
- 包含10个章节：
  1. 需求概述
  2. 需求分析
  3. 模块分解
  4. 功能流程
  5. UI组件设计
  6. API接口设计
  7. 测试用例
  8. 需求质量评估
  9. 项目上下文
  10. 生成信息

## 与 scan-object-info 的协作

### scan-object-info 的职责
- 扫描项目文件
- 检测技术栈、UI库、目录结构
- 生成 project-context.json

### requirement-generator 的职责
- 读取 project-context.json
- 分析需求语义
- 生成需求文档

### 使用顺序
```
方式1（推荐）：
scan-object-info → requirement-generator → code-generator

方式2（无项目）：
手动提供 project-context.json → requirement-generator → code-generator
```

## 7种通用流程识别示例

| 流程类型 | 关键词 | 示例需求 |
|----------|--------|----------|
| CRUD流程 | 新建、列表、详情、编辑、删除 | "实现会议管理系统，可创建、查看、编辑、删除会议" |
| 线性流程 | 第一步、然后、接着、最后 | "支付流程：选择商品 → 填写信息 → 确认订单 → 支付" |
| 状态机流程 | 审批、通过、拒绝、待处理 | "请假审批：提交 → 待审批 → 审批中 → 通过/拒绝" |
| 向导流程 | 向导、步骤、下一步 | "注册向导：基本信息 → 完善资料 → 验证邮箱 → 完成" |
| 单页工具 | 工具、转换、计算 | "日期格式化工具：输入ISO日期 → 转换 → 输出格式化结果" |
| 弹窗流程 | 弹窗、弹出、对话框 | "快速编辑弹窗：点击编辑按钮 → 弹出对话框 → 保存" |
| 循环流程 | 重新、再次、多次操作 | "投票系统：选择候选人 → 确认投票 → 可重新投票" |

## 常见问题

**Q: 如果我没有 project-context.json 怎么办？**
A: requirement-generator 会提示您选择：执行 scan-object-info 或手动上传。

**Q: 是否必须先执行 scan-object-info？**
A: 不是必须，但推荐。如果项目上下文简单，也可以手动提供。

**Q: 输出的 requirements.json 可以修改吗？**
A: 可以，您可以在确认阶段修改任何内容。

**Q: 这个 skill 适用于哪些项目？**
A: 适用于90%以上前端项目（Vue/React/Angular/Svelte + 任意UI库）。

**Q: 如何处理UI设计图？**
A: 上传图片后，requirement-input-processor 会提取UI组件信息。

**Q: 生成的需求文档质量如何保证？**
A: requirement-evaluation 会评估完整性、一致性，并提供改进建议。

**Q: 如果需求不完整会怎样？**
A: 会标记问题并建议补充，用户确认后方可继续。

## 技术支持

如有问题或建议，请查看 `.claude/skills/orchestrator/README.md` 或联系项目维护者。