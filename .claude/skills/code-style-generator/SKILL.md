---
name: code-style-generator
description: 自动检测项目代码规范，生成个人代码习惯文档 CODE_STYLE.md
reasoner_instructions: |
  EXECUTE FULL CODE-STYLE-GENERATOR WORKFLOW: detect config rules → scan code patterns → generate probe code → confirm with user → generate CODE_STYLE.md. DO NOT SKIP ANY STEP.
---

# Code Style Generator（代码风格生成器）

## 适用场景

用户输入以下类似描述时触发：
- "生成我的代码习惯文档"
- "创建代码风格规范文档"
- "生成 CODE_STYLE.md"
- "检测项目代码规范"

## 任务步骤

此主skill将生成以下原子任务：

### 步骤1：检测配置文件规范
- **原子skill**：`detect-config-rules`
- **目标**：读取 .editorconfig, .prettierrc, eslint.config.js 等配置文件，提取格式化规则

### 步骤2：扫描代码推断规范
- **原子skill**：`scan-code-patterns`
- **依赖**：步骤1
- **目标**：扫描项目中多个代码文件，推断命名规范、引号习惯、组件风格等

### 步骤3：生成探测代码片段
- **原子skill**：`generate-probe-code`
- **依赖**：步骤1、步骤2
- **目标**：生成覆盖所有规则的精简代码片段，供用户确认

### 步骤4：用户确认与补充
- **原子skill**：`confirm-and-supplement`
- **依赖**：步骤3
- **目标**：展示探测代码，收集用户反馈，补充无法自动检测的规则

### 步骤5：生成代码习惯文档
- **原子skill**：`generate-style-document`
- **依赖**：步骤4
- **目标**：整合所有信息，生成最终的 CODE_STYLE.md 文件

## 输出结果

所有任务完成后，生成：
- **代码习惯文档**：`CODE_STYLE.md`（项目根目录）

## 执行顺序

```
detect-config-rules → scan-code-patterns
                            ↓
                  generate-probe-code
                            ↓
                  confirm-and-supplement
                            ↓
                  generate-style-document
```

## 文件结构

```
.claude/skills/code-style-generator/
├── SKILL.md                          # 主skill文档
└── atomic-skills/
    ├── detect-config-rules/
    │   └── SKILL.md
    ├── scan-code-patterns/
    │   └── SKILL.md
    ├── generate-probe-code/
    │   └── SKILL.md
    ├── confirm-and-supplement/
    │   └── SKILL.md
    └── generate-style-document/
        └── SKILL.md
```

## 自动检测规范项

### 配置文件规则
- 缩进（空格/Tab，数量）
- 引号（单引号/双引号）
- 分号（使用/不使用）
- 行长度限制
- 尾逗号（保留/不保留）
- 文件末尾换行符

### 代码推断规则
- HTML/Vue/React 属性引号
- 大括号风格（K&R / Allman）
- 空格规则（if/for/while括号）
- const/let 使用偏好
- 箭头函数风格
- 命名规范（变量、组件、CSS类名）

### 框架特定规则
- Vue：script setup / Options API
- Vue：组件文件命名（PascalCase）
- React：函数组件定义方式
- React：Hooks 导入方式
- CSS：单位偏好（px/rem）

### 需要用户确认的规则
- 函数空行规则（同模块/异模块）
- 业务模块分割注释格式
- 条件渲染偏好（三元 / &&）
- 列表渲染返回方式
- 注释风格（JSDoc / 简洁）
- 调试代码保留规则
