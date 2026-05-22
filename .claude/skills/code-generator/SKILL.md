---
name: code-generator
description: 根据需求文档或需求描述自动生成符合项目规范的代码。简单需求直接处理，复杂需求优先使用requirement-generator标准化。当用户需要根据需求开发代码、实现功能模块或编写函数时自动触发。
---

# Code Generator 主Skill

## 概述
本主skill根据需求文档、功能模块描述或用户需求，自动生成符合项目规范的可开发代码，支持多种输入形式并自动适配项目技术栈。

## 使用场景划分

### 简单需求（直接处理，无需 requirement-generator）
**定义**：单一功能、实现明确、可直接编码的需求

**示例**：
- "写一个函数，将ISO字符串格式化为YYYY-MM-DD格式"
- "写一个flex布局的盒子，水平居中"
- "修改这个布局，从垂直改为水平排列"
- "写一个工具函数，判断两个数组是否相等"
- "实现一个简单的用户登录组件，包含用户名密码输入框"

**特点**：
- 单一功能点
- 实现需求明确
- 无需复杂分析
- 可直接生成代码

### 复杂需求（优先使用 requirement-generator）
**定义**：多模块、系统功能、需要详细分析的需求

**示例**：
- "实现一个用户管理系统，包含登录、注册、权限管理三个模块"
- "实现一个会议管理系统，支持创建、列表、详情、编辑、删除功能"
- "开发一个包含状态机的工作流系统，支持审批流程"
- "实现一个向导流程，包含多个步骤和条件跳转"

**特点**：
- 多个功能模块
- 复杂的业务逻辑
- 需要模块间协调
- 需要 API 设计

## 触发机制

### 自动识别需求复杂度
```
用户输入需求 → 分析需求复杂度 → 判断处理路径
```

**简单需求特征**：
- 单个动词（写、实现、修改）
- 单一对象（函数、组件、布局）
- 简短描述（少于50字）
- 无模块、系统、管理类词汇

**复杂需求特征**：
- 包含"系统"、"管理"、"模块"等词汇
- 包含多个功能点（如"包含以下功能：1... 2... 3..."）
- 长描述（超过100字）
- 需要多文件或复杂逻辑

### 处理流程

#### 简单需求流程
```
简单需求 → requirement-reader（检测无requirements.json）→ 
requirement-analysis → tech-stack-detection → code-design → 
code-generation → code-validation → documentation-update
```

#### 复杂需求流程
```
复杂需求 → 询问用户是否需要标准化 →
选项1：是 → 执行 requirement-generator → code-generator（读取requirements.json）
选项2：否 → 直接执行 code-generator（自由文本模式）
```

## 核心理念
- 标准化输入优先：优先读取 requirements.json，复用 requirement-generator 成果
- 需求驱动的代码生成
- 自动适配项目技术栈和代码规范
- 支持单模块和多模块需求
- 动态调整执行流程
- 输出高质量带注释代码

## 核心能力
- 需求理解和分析
- 技术栈自动检测
- 代码结构设计
- 自动代码生成
- 模块间整合
- 代码质量验证

## 执行流程

### 场景0：需求复杂度识别（入口）
```
用户输入 → 复杂度分析 → 决策路径
```

**判断规则**：

| 维度 | 简单需求 | 复杂需求 |
|------|----------|----------|
| 描述长度 | < 50字 | > 100字 |
| 功能点数 | 1个 | ≥ 2个 |
| 模块数 | 无模块概念 | ≥ 2个模块 |
| 关键词 | 写、实现、修改、调整 | 系统、管理、模块、包含以下 |
| 复杂度 | 单功能/单组件 | 多模块/系统级 |
| 推荐路径 | 直接处理 | 先执行 requirement-generator |

**处理策略**：
1. **简单需求**：直接执行 code-generator（自由文本模式）
2. **复杂需求**：
   - 询问用户："这是一个复杂需求，是否需要先执行 requirement-generator 生成标准化文档？"
   - 用户选择"是"：执行 requirement-generator → code-generator
   - 用户选择"否"：直接执行 code-generator（自由文本模式）

### 场景1：标准输入模式（优先，从 requirements.json）
```
requirement-reader → tech-stack-detection → code-design →
code-generation → module-integration（多模块）→ code-validation → documentation-update
```

**适用情况**：
- 已有 requirements.json（由 requirement-generator 生成）
- 需求已标准化，包含完整的模块、API、UI规格
- 项目上下文已包含在文档中
- 复杂需求已完成标准化

**特点**：
- 跳过 requirement-analysis（已在 requirement-generator 完成）
- tech-stack-detection 优先读取 project_context，仅验证补充
- code-design 直接使用 api_spec 和 ui_components
- 继承需求质量评估（quality.score）

### 场景2：简单需求模式（自由文本，直接处理）
```
requirement-reader（检测无requirements.json）→ requirement-analysis → tech-stack-detection →
code-design → code-generation → code-validation → documentation-update
```

**适用情况**：
- 简单需求（单功能、单组件）
- 用户直接输入代码需求
- 无需复杂分析

**特点**：
- requirement-reader 检测无 requirements.json
- requirement-analysis 快速分析单一功能点
- tech-stack-detection 扫描项目文件获取技术栈
- code-design 简化设计流程
- 跳过 module-integration（单模块）

### 场景3：复杂需求模式（自由文本，用户选择直接处理）
```
requirement-reader（检测无requirements.json）→ requirement-analysis → tech-stack-detection →
code-design → code-generation → module-integration（多模块）→ code-validation → documentation-update
```

**适用情况**：
- 复杂需求但用户选择不标准化
- 用户提供详细的需求描述
- 需要重新分析需求

**特点**：
- requirement-reader 进入 fallback 模式，调用 requirement-analysis
- requirement-analysis 分析多个功能点
- tech-stack-detection 需要扫描项目文件
- code-design 需要重新设计API和UI

### 自动识别机制
requirement-reader 阶段会识别：
- 如果有 requirements.json → 标记为"标准输入"
- 如果无 requirements.json → 分析需求复杂度
  - 简单需求 → 标记为"简单需求"，快速处理
  - 复杂需求 → 提示用户是否需要标准化

## 原子skill依赖关系
- requirement-reader：无依赖（首个原子skill，或fallback时调用 requirement-analysis）
- requirement-analysis：**仅自由文本输入时执行**，依赖 requirement-reader（fallback模式）
- tech-stack-detection：依赖 requirement-reader（优先）或 requirement-analysis
- code-design：依赖 tech-stack-detection 和 requirement-reader（用于读取 api_spec 和 ui_components）
- code-generation：依赖 code-design
- module-integration：依赖 code-generation（**仅在多模块需求时执行**）
- code-validation：依赖 code-generation（单模块）或 module-integration（多模块）
- documentation-update：依赖 code-validation 和 requirement-reader（用于读取 quality 评估）

## 主skill完成标准
1. ✅ 需求已读取（requirements.json 或 文本分析）
2. ✅ 技术栈已检测（优先使用 requirements.json 中的 project_context）
3. ✅ 代码设计基于 requirements.json 的 api_spec 和 ui_components（如存在）
4. ✅ 生成代码语法正确、格式规范
5. ✅ 模块间整合完成（仅多模块需求）
6. ✅ 代码通过验证，满足 requirements.json 中的 test_cases（如存在）
7. ✅ 所有代码文件已添加完整注释，并继承 quality.recommendations
8. ✅ 所有原子skill日志完整记录
9. ✅ 生成了符合 requirement-generator 标准的代码

## 重试规则
- 每个原子skill失败后可重试 **3次**
- code-generation 失败会影响后续，暂停任务等待用户确认
- code-validation 发现问题可返回 code-design 重新设计（最多循环 **2次**）
- module-integration 失败可返回 code-generation 调整（最多循环 **2次**）

## 支持的输入形式

| 输入类型 | 示例 | 处理方式 |
|----------|------|----------|
| requirements.json | 由 requirement-generator 生成的标准化文档 | 直接读取，复用所有分析成果 |
| 整体需求 | "实现一个用户登录功能，包含用户名、密码输入，登录按钮，成功后跳转首页" | 调用 requirement-analysis 分析 |
| 功能模块 | "实现 MeetingCard 组件，显示会议标题、时间、状态，提供加入按钮" | 单个模块处理 |
| 方法实现 | "写一个函数，将 ISO 时间字符串格式化为 'YYYY-MM-DD HH:mm' 格式" | 单函数生成 |
| 用户描述 | "我需要一个工具函数，能判断两个数组是否相等" | 转换为代码需求 |

## 技术栈自动检测
优先从 requirements.json 的 project_context 读取：
- **框架**：Vue 2/3、React、Angular、Svelte
- **语言**：JavaScript、TypeScript
- **构建工具**：Vite、Webpack、Rollup
- **代码规范**：检查 CODE_STYLE.md、.eslintrc、.prettierrc 等
- **包管理器**：package.json（npm/yarn/pnpm）

仅在 requirements.json 中 project_context 缺失时，才扫描项目文件检测。

## 触发关键词
- "根据需求写代码"
- "实现这个功能"
- "生成代码"
- "写一个函数/组件/模块"
- "按照需求文档开发"
- "帮我实现"

## 输出产物（精简）
- ✅ **带注释的代码文件**（自动创建或修改文件）
- ✅ **完整执行日志**（记录所有步骤和决策）

## 多模块需求处理

### 模块识别
requirement-reader 或 requirement-analysis 会自动识别：
- 模块边界（如：登录、注册、权限属于不同模块）
- 模块间依赖关系（如：权限模块依赖登录模块）
- 共享组件/工具（如：通用按钮、日期格式化函数）
- 从 requirements.json 中继承 modules 定义

### 模块整合
module-integration 会：
- 整理所有模块的导入导出关系
- 统一共享数据类型和接口（优先使用 requirements.json 中的 types）
- 配置路由关联（如需要）
- 消除重复的工具函数
- 生成整合后的项目结构
- 确保数据流正确性
- 优先使用 requirements.json 中的 api_spec 设计共享API
- 优先使用 requirements.json 中的 ui_components 设计组件

### 示例输出结构
```
输入需求："实现会议管理系统（创建、列表、详情）"

输出：
├── src/views/meeting/Create.vue     # 会议创建模块
├── src/views/meeting/List.vue      # 会议列表模块
├── src/views/meeting/Detail.vue    # 会议详情模块
├── src/router/meeting.ts           # 路由配置（整合）
├── src/types/meeting.ts            # 共享类型定义（整合）
└── src/utils/meeting-api.ts        # 共享API（整合）
```

## 注意事项
- 自动读取项目中的 CODE_STYLE.md，没有则提示用户创建
- 生成的代码会尽量符合项目现有规范
- 多模块需求会自动处理模块间关系
- 会尽量复用现有工具函数，避免重复
- 代码生成前会进行设计验证

## 文件系统位置
- 主skill路径：./.claude/skills/code-generator/SKILL.md
- 原子skill路径：./.claude/skills/code-generator/atomic-skills/下各子目录

## 支持的代码类型
- **Vue组件**（.vue）：自动生成 template/script/style
- **React组件**（.jsx/.tsx）：自动生成 JSX 和 hooks
- **JavaScript/TypeScript**（.js/.ts）：函数、类、工具方法
- **配置文件**（.config.js/.ts）：路由、状态管理、构建配置
- **API接口**（.api.js/.ts）：请求封装、数据模型

## 特殊规则
- **CODE_STYLE.md 检测**：如果项目不存在 CODE_STYLE.md，在 tech-stack-detection 阶段会提示用户
- **动态流程**：根据需求复杂度自动选择单模块/多模块流程
- **模块去重**：识别重复功能，避免生成冗余代码
- **依赖复用**：优先使用项目已有的工具库和组件

## 版本和状态
版本：1.0
主skill名称：code-generator
状态：启用