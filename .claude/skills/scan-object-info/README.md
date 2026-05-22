# scan-object-info（改进版 v1.1）

一个用于扫描和分析前端项目技术信息的主技能，通过调度多个原子技能来完成各种项目信息的提取和整理。**改进版新增智能技能选择、并行执行支持、confidence scores、project-summary 和 suggested follow-up actions。**

## 功能特性

🎯 **智能识别**：根据用户需求自动选择合适的原子技能（关键词分析 + 依赖图优化），避免不必要的扫描

⚡ **并行执行**：自动识别可并行执行的技能组合，减少执行时间

📊 **置信度标注**：每个检测结果标注 confidence score（high/medium/low）

📋 **项目摘要**：全面扫描后自动生成 project-summary（技术栈总结 + 技术债务提示 + 建议后续操作）

🔧 **灵活组合**：可以组合使用不同的原子技能来满足特定需求

📊 **结构化输出**：输出清晰、易读、可解析的结构化结果

🚀 **智能优化**：自动识别依赖关系，优化执行顺序，避免重复读取文件

## 改进点（v1.0 -> v1.1）

1. **智能技能选择逻辑**：基于关键词分析和意图推断，自动选择最小必要技能集
2. **并行执行支持**：根据依赖图自动识别可并行执行的技能组合
3. **置信度标注**：每个检测结果标注 high/medium/low 置信度
4. **Project Summary**：全面扫描后生成技术栈总结、技术债务提示和建议后续操作
5. **错误处理改进**：缺失文件时提供降级策略和恢复建议
6. **Suggested Follow-up Actions**：根据扫描结果推荐后续可执行的操作

## 使用场景

### 1. 快速了解项目技术栈
```
"分析一下这个项目用了什么技术"
```

### 2. 扫描打包工具和 UI 库
```
"了解项目打包工具和使用的UI库"
```

### 3. 查看项目结构
```
"看看这个项目的目录结构"
```

### 4. 分析状态管理方案
```
"项目用什么做状态管理？"
```

### 5. 检查路由配置
```
"项目用了什么路由方案？"
```

### 6. 分析环境变量
```
"检查环境变量配置"
```

### 7. 全面项目分析
```
"全面分析这个前端项目的技术方案"
```

## 原子技能列表

| 原子技能 | 功能描述 | 典型使用场景 | 前置条件 | confidence 支持 |
|---------|---------|-------------|---------|--------------|
| `scan_package_json` | 解析 package.json，提取项目基础信息、依赖、脚本等 | 了解项目依赖、版本、启动命令 | 项目根目录必须存在 package.json | ✅ |
| `scan_project_structure` | 扫描项目目录结构、入口文件、核心文件夹 | 查看项目组织结构、文件分布 | 项目必须有清晰的项目结构 | ✅ |
| `scan_config_files` | 扫描构建、代码规范、环境等配置文件 | 了解构建工具、lint 配置 | 项目需要包含配置文件（可选） | ✅ |
| `detect_framework` | 识别前端框架、TS 使用、渲染模式 (CSR/SSR/SSG) | 判断项目使用的框架 | 需要 scan_package_json 和 scan_project_structure 的信息 | ✅ |
| `detect_ui_library` | 识别 UI 组件库、样式方案、原子 CSS | 了解 UI 技术栈 | 需要 scan_package_json 和 scan_config_files 的信息 | ✅ |
| `detect_state_manage` | 识别状态管理库（Redux、Pinia、Zustand 等） | 分析状态管理方案 | 需要 scan_package_json 和 scan_project_structure 的信息 | ✅ |
| `detect_request_scheme` | 识别请求库和请求封装结构 | 了解 API 请求方案 | 需要 scan_package_json 和 scan_project_structure 的信息 | ✅ |
| `detect_router_solution` | 识别路由方案、版本、配置和文件位置 | 分析路由实现方式 | 项目必须包含路由功能，需要 detect_framework 提供框架信息 | ✅ |
| `scan_env_variables` | 扫描环境变量文件、键名、用途和环境区分 | 分析环境配置、部署前确认环境变量 | 项目必须使用环境变量配置，需要 detect_framework 或 scan_config_files 提供框架信息 | ✅ |

## 工作原理

1. **意图识别**：分析用户输入，理解需要提取的信息类型（关键词分析）
2. **技能选择**：根据需求选择最小必要的原子技能集合（智能优化）
3. **依赖分析**：识别技能之间的依赖关系，确定执行顺序（支持并行）
4. **并行执行**：无依赖或依赖已满足的技能自动并行执行
5. **串行执行**：有依赖的技能按依赖顺序执行
6. **结果整合**：将各原子技能的输出整合成结构化报告（含 confidence scores）
7. **Project Summary**：全面扫描后生成技术栈总结和后续建议
8. **错误处理**：某个技能执行失败时，提供降级策略并继续执行其他技能

## 技能依赖关系

```
scan_package_json (基础，always first)
    │
    ├───→ scan_project_structure
    │       │
    │       ├───→ detect_framework
    │       │       │
    │       │       ├───→ detect_router_solution
    │       │       └───→ scan_env_variables
    │       │
    │       └───→ detect_state_manage
    │
    ├───→ scan_config_files
    │       │
    │       ├───→ detect_ui_library
    │       └───→ scan_env_variables
    │
    └───→ detect_request_scheme
```

## 并行执行示例（**新增 v1.1**）

全面分析的执行计划：
```
并行组1（无依赖）：scan_package_json + scan_project_structure + scan_config_files
并行组2（依赖满足）：detect_framework（等组1）+ detect_request_scheme（等组1）
并行组3（依赖满足）：detect_ui_library + detect_state_manage（等组1+2）
串行：detect_router_solution（等 detect_framework）
串行：scan_env_variables（等 detect_framework）
```

## 输出示例（改进版）

```markdown
# 项目扫描结果 v1.1

## 项目摘要
这是一个使用 Vue3 + TypeScript 的单页面应用，采用 CSR 渲染模式，使用 Element Plus 作为 UI 组件库，Pinia 进行状态管理，Vue Router 处理路由，Axios 处理网络请求，使用 Sass/SCSS 作为样式预处理器。

## 1. 项目基本信息
- 文件：`package.json`
- 项目名称：my-vue-app
- 项目版本：1.0.0
- scripts：
  - dev：vite
  - build：vite build
  - preview：vite preview
- 关键依赖：
  - 主框架：`vue@^3.4.0` (confidence: high)
  - UI 库：`element-plus@^2.5.0` (confidence: high)
  - 状态管理：`pinia@^2.1.0` (confidence: high)
  - 请求库：`axios@^1.6.0` (confidence: high)
- 包管理器：pnpm
- 项目类型：浏览器

## 2. 框架与技术栈
- 框架：`Vue3` (confidence: high)
  - 依据：`package.json` 中检测到 `vue@^3.5.0`
- 框架版本：`^3.5.0`
- 是否使用 TS：`是` (confidence: high)
  - 依据：存在 `tsconfig.json`，入口文件为 `.ts`
- 渲染模式：`CSR` (confidence: high)

## 3. UI 库与样式方案
- UI 库：
  - `element-plus@^2.5.0` (confidence: high)
- 样式方案：`Sass/SCSS`、`CSS Modules` (confidence: medium)
- 原子 CSS：`否`
- 关键配置特征：
  - `src/styles/variables.scss`：主题变量

## 4. 状态管理方案
- 方案：`Pinia@^2.1.0` (confidence: high)
  - 使用方式：`defineStore + 响应式状态`

## 5. 路由方案
- 路由方案：`vue-router@^4.2.0` (confidence: high)
- 路由类型：`配置式路由`
- 路由文件位置：`src/router/index.ts`

## 6. 环境变量
- 环境文件清单：
  - `.env`：存在
  - `.env.development`：存在
  - `.env.production`：存在
- 环境变量键名：
  - `VITE_API_BASE_URL`
  - `VITE_APP_TITLE`
- 前缀规范：`VITE_*`

## 技术债务提示（**新增 v1.1**）
- ⚠️ pinia 版本 `^2.1.0` 低于最新版本，建议升级
- ⚠️ 项目未配置 ESLint，建议添加代码规范检查
- ℹ️ Vue3 使用 Options API，建议迁移到 Composition API

## 建议后续操作（**新增 v1.1**）
1. 📝 执行 `requirement-generator` 生成需求文档
2. 📋 执行 `code-style-generator` 生成代码规范
3. 🔍 执行 `code-redundancy-checker` 检查代码冗余
4. ⚡ 执行 `scan-object-info` 定期检查依赖更新
```

## 设计原则

- **精准性**：只调用必要的原子技能，避免冗余扫描
- **并行性**：自动识别可并行执行的技能，减少执行时间
- **可组合性**：原子技能可以独立使用或组合使用
- **可扩展性**：易于添加新的原子技能
- **结构化**：输出格式统一、清晰、可解析
- **智能化**：自动识别依赖关系，优化执行顺序
- **容错性**：单个技能失败不影响整体执行，提供降级策略
- **置信度**：每个检测结果标注 confidence score

## 与其他技能的配合

- 与 `code-generator` 配合：在生成代码前了解项目技术栈
- 与 `code-optimizer` 配合：在优化代码前了解项目结构和规范
- 与 `requirement-generator` 配合：在分析需求时了解项目背景
- 与 `bug-solver` 配合：在调试时快速了解项目技术栈
- 与 `code-style-generator` 配合：生成项目专属的代码规范（**新增 v1.1**）
- 与 `code-redundancy-checker` 配合：检查项目代码冗余（**新增 v1.1**）

## 版本

- v1.1 - 改进版：新增智能技能选择、并行执行支持、confidence scores、project-summary、suggested follow-up actions
- v1.0 - 初始版本