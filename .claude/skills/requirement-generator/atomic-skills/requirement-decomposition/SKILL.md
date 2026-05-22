---
name: requirement-decomposition
description: 将原始需求分解为独立功能模块，识别模块边界和依赖关系，标记可忽略的模块。在需求输入处理完成后自动执行。
---

# Requirement Decomposition 原子 Skill

## 概述
将 requirement-input-processor 输出的原始需求分解为独立的功能模块，识别模块边界、依赖关系和优先级，为后续逐个分析提供清晰的模块清单。

## 核心能力
- 语义聚类分析（将相关功能点归为同一模块）
- 模块边界识别（区分独立功能）
- 识别模块依赖关系（A模块依赖B模块）
- 识别可忽略模块（用户指定"暂不实现"或优先级低）
- 预估模块数量和工作量

## 输入
requirement-input-processor 输出的原始需求数据（含 code_snippet_analysis 和 api_spec_analysis 时）

## 输出
模块分解结果，包含以下内容：

```json
{
  "decomposition": {
    "modules": [
      {
        "name": "用户登录",
        "description": "用户通过用户名和密码登录系统",
        "type": "auth",
        "features": [
          "用户名输入",
          "密码输入",
          "登录按钮",
          "跳转首页"
        ],
        "dependencies": [],
        "priority": "high",
        "ignore": false,
        "estimated_complexity": "low",
        "estimated_lines": 150,
        "source": "user_text"
      }
    ],
    "ignored_modules": [],
    "total_modules": 1,
    "dependency_graph": {
      "用户登录": []
    },
    "entry_points": ["/login"]
  }
}
```

## 模块类型分类

| 类型 | 说明 | 示例 |
|------|------|------|
| `auth` | 认证授权模块 | 登录、注册、权限管理 |
| `crud` | 数据管理模块 | 用户管理、订单管理、会议管理 |
| `tool` | 工具类模块 | 日期格式化、文件转换、计算器 |
| `visualization` | 可视化模块 | 图表、仪表盘、数据大屏 |
| `workflow` | 工作流模块 | 审批流程、订单状态追踪 |
| `wizard` | 向导流程 | 多步骤表单、结账向导 |
| `realtime` | 实时交互 | 聊天、协作、通知 |
| `static` | 静态展示 | 关于页面、帮助中心 |
| `layout` | 布局组件 | 导航栏、侧边栏、页脚 |

## 模块识别算法

### 步骤1：功能点聚类
- 将 `requirement-input-processor` 提取的功能点分组
- 使用语义相似度匹配（余弦相似度）
- 合并语义相近的功能点到同一模块

### 步骤2：模块命名
- 根据功能点集合生成模块名称
- 命名规则：动词+名词（如"用户登录"、"会议创建"）

### 步骤3：依赖识别
- 识别模块间的依赖关系
- 关键词："基于...的"、"在...基础上"、"先...后..."
- 输出依赖图

### 步骤4：优先级评估
- 高：核心功能，影响产品可用性
- 中：重要功能，影响用户体验
- 低：增强功能，可后续实现

### 步骤5：复杂度评估
- low：1个表单/页面，<200行
- medium：2-3个页面/组件，200-500行
- high：4个+页面/组件，500+行

## 执行逻辑
1. 接收原始需求数据（含 code_snippet_analysis / api_spec_analysis 时优先处理）
2. 提取所有功能点
3. 使用聚类算法将功能点分组
4. 为每个组生成模块名称和描述
5. 识别模块间依赖关系
6. 评估每个模块的优先级和复杂度
7. 标记用户指定的忽略模块
8. 输出模块清单和依赖图

## 依赖关系
- 依赖：requirement-input-processor

## 完成标准
1. 至少识别出1个功能模块
2. 每个模块都有明确的名称、描述、类型
3. 识别模块间的依赖关系
4. 标注模块优先级（高/中/低）
5. 评估模块复杂度（low/medium/high）
6. 标记可忽略模块（如有）
7. 输出完整的JSON格式数据

## 错误处理
- **功能点不足**：如果功能点少于3个，创建单模块
- **模块边界模糊**：使用通用分类（auth/crud/tool）
- **依赖冲突**：记录警告，不建立循环依赖
- **无明确依赖**：标记为无依赖（独立模块）

## 示例

**输入**：用户需求"实现用户管理系统，包含登录、注册、用户列表、用户详情、编辑用户信息、删除用户。"

**输出**：
```json
{
  "decomposition": {
    "modules": [
      {
        "name": "用户认证",
        "description": "用户登录和注册功能",
        "type": "auth",
        "features": ["登录", "注册"],
        "dependencies": [],
        "priority": "high",
        "ignore": false,
        "estimated_complexity": "medium",
        "estimated_lines": 300,
        "source": "user_text"
      },
      {
        "name": "用户管理",
        "description": "用户的增删改查功能",
        "type": "crud",
        "features": ["用户列表", "用户详情", "编辑用户", "删除用户"],
        "dependencies": ["用户认证"],
        "priority": "high",
        "ignore": false,
        "estimated_complexity": "high",
        "estimated_lines": 600,
        "source": "user_text"
      }
    ],
    "ignored_modules": [],
    "total_modules": 2,
    "dependency_graph": {
      "用户认证": [],
      "用户管理": ["用户认证"]
    },
    "entry_points": ["/login", "/register", "/users", "/users/:id"]
  }
}
```

## 注意事项
- 依赖关系必须准确，影响后续生成
- 忽略的模块不能影响核心流程
- 复杂度评估用于指导资源分配
- 所有判断基于语义分析，不扫描项目
- 当 input_type 为 code_snippet 时，模块分解应考虑复用现有代码

## 版本
v1.1 - 改进版：增强与 code_snippet_analysis / api_spec_analysis 的整合