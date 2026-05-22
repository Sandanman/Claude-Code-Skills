---
name: requirement-input-processor
description: 解析用户提供的需求输入，支持文本、图片、文档等多种形式，提取功能关键词和约束条件。在需求收集阶段自动执行。
---

# Requirement Input Processor 原子Skill

## 概述
解析用户提供的需求输入，支持文本、图片（UI设计图）、文档（Word/PDF）等多种形式，提取功能关键词、边界条件和约束条件，为后续需求分解提供原始数据。

## 核心能力
- 解析自然语言文本需求
- 识别图片中的UI元素（如有图片）
- 解析文档内容（Word/PDF）
- 提取功能关键词
- 识别约束条件（技术栈、性能、安全等）
- 判断需求复杂度（简单/中等/复杂）

## 输入
用户原始需求（文本、图片文件、文档文件）

## 输出
原始需求处理结果，包含以下内容：

```json
{
  "raw_input": "实现用户登录功能，包含用户名、密码输入，登录按钮，成功后跳转首页。使用Vue 3和Element Plus。",
  "input_type": "text",
  "has_ui_design": false,
  "ui_design_url": null,
  "extracted_features": [
    "登录",
    "用户名",
    "密码",
    "按钮",
    "跳转首页",
    "Vue 3",
    "Element Plus"
  ],
  "constraints": [
    "技术栈：Vue 3 + Element Plus",
    "需要表单验证",
    "需要页面跳转"
  ],
  "complexity": "simple",
  "estimated_modules": 1,
  "keywords": {
    "actions": ["登录"],
    "elements": ["用户名", "密码", "按钮"],
    "behaviors": ["跳转"],
    "tech_stack": ["Vue 3", "Element Plus"]
  }
}
```

## 支持的文件类型

| 类型 | 扩展名 | 处理方式 |
|------|--------|----------|
| 纯文本 | .txt, .md | 直接读取内容 |
| Word文档 | .docx | 解析文本内容（忽略格式） |
| PDF文档 | .pdf | 提取文本（OCR不支持） |
| 图片 | .png, .jpg, .jpeg, .gif | 如果有说明文字，提取说明；图片本身不处理 |
| 代码文件 | .js, .vue, .tsx | 提取注释和代码结构 |

## 执行逻辑
1. 接收用户输入的多模态数据
2. 识别输入类型（文本/图片/文档）
3. 提取文本内容（如果是图片，使用用户提供的说明文字）
4. 使用关键词匹配提取功能点
5. 识别约束条件（技术栈、UI库、性能要求等）
6. 判断需求复杂度（基于功能点数量、模块预估）
7. 输出结构化原始需求数据

## 依赖关系
- 无依赖（首个原子skill）

## 完成标准
1. ✅ 已识别输入类型和原始内容
2. ✅ 提取至少3个功能关键词
3. ✅ 识别技术栈约束（如"使用Vue 3"）
4. ✅ 识别UI库约束（如"使用Element Plus"）
5. ✅ 判断需求复杂度（simple/medium/complex）
6. ✅ 输出完整的JSON格式数据

## 错误处理
- **输入为空**：报错并等待用户重新输入
- **文件格式不支持**：提示用户"不支持的文件类型，请提供文本、图片或文档"
- **图片无说明**：提示"检测到图片但无说明文字，请补充描述"
- **需求过于模糊**：输出警告，建议用户补充更多细节

## 示例

**输入**：
```
用户文本："实现用户登录功能，包含用户名、密码输入，登录按钮，成功后跳转首页。使用Vue 3和Element Plus。"
```

**处理过程**：
1. 输入类型：text
2. 提取关键词：
   - 功能：登录
   - 元素：用户名、密码、按钮
   - 行为：跳转
   - 技术栈：Vue 3, Element Plus
3. 约束：使用Vue 3和Element Plus
4. 复杂度：simple（1个功能模块）

**输出**：
```json
{
  "raw_input": "实现用户登录功能，包含用户名、密码输入，登录按钮，成功后跳转首页。使用Vue 3和Element Plus。",
  "input_type": "text",
  "has_ui_design": false,
  "ui_design_url": null,
  "extracted_features": [
    "登录",
    "用户名",
    "密码",
    "按钮",
    "跳转首页",
    "Vue 3",
    "Element Plus"
  ],
  "constraints": [
    "技术栈：Vue 3 + Element Plus",
    "需要表单验证",
    "需要页面跳转"
  ],
  "complexity": "simple",
  "estimated_modules": 1,
  "keywords": {
    "actions": ["登录"],
    "elements": ["用户名", "密码", "按钮"],
    "behaviors": ["跳转"],
    "tech_stack": ["Vue 3", "Element Plus"]
  }
}
```

## 关键词映射库
| 类别 | 关键词 | 映射到 |
|------|--------|--------|
| 操作动作 | 登录、注册、创建、编辑、删除、提交、保存 | actions |
| UI元素 | 表格、表单、按钮、输入框、选择器、弹窗 | elements |
| 交互行为 | 跳转、显示、隐藏、刷新、加载、验证 | behaviors |
| 技术栈 | Vue、React、Angular、Element、Antd | tech_stack |
| 权限词 | 管理员、权限、登录用户、游客 | auth_level |

## 复杂度判断规则
| 复杂度 | 功能点数量 | 预估模块数 | 判断依据 |
|--------|------------|------------|----------|
| simple | 1-3个 | 1个 | 单一功能，如登录 |
| medium | 4-8个 | 2-3个 | 如用户管理（登录+注册+权限） |
| complex | 9个以上 | 4个+ | 多模块系统，如电商平台 |

## 注意事项
- 不验证需求合理性，仅提取信息
- 不扫描任何项目文件
- 所有提取基于关键词匹配和语义分析
- 如果信息不足，会记录警告供后续使用

## 原子skill位置
./.claude/skills/requirement-generator/atomic-skills/requirement-input-processor/SKILL.md