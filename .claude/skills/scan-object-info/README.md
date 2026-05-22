# scan-object-info - 智能项目扫描技能

一个用于扫描和分析前端项目技术信息的主技能，通过调度多个原子技能来完成各种项目信息的提取和整理。

## 功能特性

🎯 **智能识别**：根据用户需求自动选择合适的原子技能，避免不必要的扫描

📦 **全面覆盖**：支持扫描项目的以下信息：
- 项目基本信息（package.json 分析）
- 项目结构与目录树
- 配置文件（构建工具、代码规范、环境配置等）
- 前端框架与渲染模式
- UI 组件库与样式方案
- 状态管理方案
- 网络请求方案
- 路由方案
- 环境变量配置

🔧 **灵活组合**：可以组合使用不同的原子技能来满足特定需求

📊 **结构化输出**：输出清晰、易读、可解析的结构化结果

🚀 **智能优化**：自动识别依赖关系，优化执行顺序，避免重复读取文件

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

| 原子技能 | 功能描述 | 典型使用场景 | 适用场景 | 前置条件 |
|---------|---------|-------------|---------|---------|
| `scan_package_json` | 解析 package.json，提取项目基础信息、依赖、脚本等 | 了解项目依赖、版本、启动命令 | 需要了解项目依赖信息、版本管理、启动脚本 | 项目根目录必须存在 package.json |
| `scan_project_structure` | 扫描项目目录结构、入口文件、核心文件夹 | 查看项目组织结构、文件分布 | 需要了解项目目录组织、入口文件位置 | 项目必须有清晰的项目结构 |
| `scan_config_files` | 扫描构建、代码规范、环境等配置文件 | 了解构建工具、lint 配置 | 需要了解项目构建配置、代码规范配置 | 项目需要包含配置文件（可选） |
| `detect_framework` | 识别前端框架、TS 使用、渲染模式 (CSR/SSR/SSG) | 判断项目使用的框架 | 需要确认框架类型、TS 使用情况、渲染模式 | 需要 scan_package_json 和 scan_project_structure 的信息 |
| `detect_ui_library` | 识别 UI 组件库、样式方案、原子 CSS | 了解 UI 技术栈 | 需要了解项目使用的 UI 库和样式方案 | 需要 scan_package_json 和 scan_config_files 的信息 |
| `detect_state_manage` | 识别状态管理库（Redux、Pinia、Zustand 等） | 分析状态管理方案 | 需要了解项目状态管理方案 | 需要 scan_package_json 和 scan_project_structure 的信息 |
| `detect_request_scheme` | 识别请求库和请求封装结构 | 了解 API 请求方案 | 需要了解项目的网络请求实现方式 | 需要 scan_package_json 和 scan_project_structure 的信息 |
| `detect_router_solution` | 识别路由方案、版本、配置和文件位置 | 分析路由实现方式 | 需要了解项目的路由架构、添加新路由时确认路由方案 | 项目必须包含路由功能，需要 detect_framework 提供框架信息 |
| `scan_env_variables` | 扫描环境变量文件、键名、用途和环境区分 | 分析环境配置、部署前确认环境变量 | 需要了解项目如何管理环境配置、部署项目时确认环境变量 | 项目必须使用环境变量配置，需要 detect_framework 或 scan_config_files 提供框架信息 |

## 工作原理

1. **意图识别**：分析用户输入，理解需要提取的信息类型
2. **技能选择**：根据需求选择最小必要的原子技能集合
3. **依赖分析**：识别技能之间的依赖关系，确定执行顺序
4. **顺序执行**：按依赖关系顺序调用原子技能
5. **结果整合**：将各原子技能的输出整合成结构化报告
6. **错误处理**：某个技能执行失败时，提示用户并继续执行其他技能

## 技能依赖关系

```
scan_package_json (基础)
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

## 智能选择逻辑

### 自动识别关键词

- **路由相关**：路由、router、route → 自动添加 `detect_router_solution`
- **环境变量**：环境变量、.env、配置 → 自动添加 `scan_env_variables`
- **全面分析**：全面、完整、所有 → 自动添加所有技能
- **未指定需求**：默认选择 `scan_package_json` + `scan_project_structure` + `scan_config_files` + `detect_framework`

### 执行优先级

1. **基础优先**：`scan_package_json` 总是第一个执行
2. **结构优先**：`scan_project_structure` 在框架检测之前执行
3. **配置优先**：`scan_config_files` 在 UI 库和环境变量检测之前执行
4. **框架依赖**：`detect_framework` 在路由和环境变量检测之前执行

## 输出示例

```markdown
# 项目扫描结果

## 1. 项目基本信息
- 文件：`package.json`
- 项目名称：my-vue-app
- 项目版本：1.0.0
- scripts：
  - dev：vite
  - build：vite build
  - preview：vite preview
- 关键依赖：
  - 主框架：`vue@^3.4.0`
  - UI 库：`element-plus@^2.5.0`
  - 状态管理：`pinia@^2.1.0`
  - 请求库：`axios@^1.6.0`
- 包管理器：pnpm
- 项目类型：浏览器

## 2. 框架与技术栈
- 框架：Vue3
- 框架版本：^3.4.0
- 是否使用 TS：是
- 渲染模式：CSR

## 3. UI 库与样式方案
- UI 库：
  - `element-plus@^2.5.0`
- 样式方案：`Sass/SCSS`、`CSS Modules`
- 原子 CSS：否
- 关键配置特征：
  - `src/styles/variables.scss`：主题变量

## 4. 路由方案
- 路由方案：`vue-router@^4.2.0`
- 路由类型：配置式路由
- 路由文件位置：
  - `src/router/index.ts`
- 关键配置特征：
  - `src/router/index.ts`：routes/history

## 5. 环境变量
- 环境文件清单：
  - `.env`：存在
  - `.env.development`：存在
  - `.env.production`：存在
- 环境变量键名：
  - `VITE_API_BASE_URL`
  - `VITE_APP_TITLE`
- 环境变量用途：
  - `VITE_API_BASE_URL`：API 接口地址
  - `VITE_APP_TITLE`：应用标题
- 环境区分：
  - `VITE_API_BASE_URL`：development/production
  - `VITE_APP_TITLE`：通用
- 前缀规范：
  - `VITE_*`：Vite 标准前缀

## 总结
这是一个使用 Vue3 + TypeScript 的单页面应用，采用 CSR 渲染模式，使用 Element Plus 作为 UI 组件库，Pinia 进行状态管理，Vue Router 处理路由，Axios 处理网络请求，使用 Sass/SCSS 作为样式预处理器。项目使用 Vite 作为构建工具，环境变量通过 VITE_ 前缀规范管理。
```

## 设计原则

- **精准性**：只调用必要的原子技能，避免冗余扫描
- **可组合性**：原子技能可以独立使用或组合使用
- **可扩展性**：易于添加新的原子技能
- **结构化**：输出格式统一、清晰、可解析
- **智能化**：自动识别依赖关系，优化执行顺序
- **容错性**：单个技能失败不影响整体执行

## 错误处理

当某个原子技能执行失败时，主技能会：
1. 明确提示用户哪个技能执行失败
2. 继续执行其他技能
3. 在最终输出中标记失败的部分

错误示例：
```markdown
## 4. UI 库与样式方案
⚠️ 该部分扫描失败：未找到 package.json 文件
```

## 与其他技能的配合

- 与 `code-generator` 配合：在生成代码前了解项目技术栈
- 与 `code-optimizer` 配合：在优化代码前了解项目结构和规范
- 与 `requirement-generator` 配合：在分析需求时了解项目背景
- 与 `bug-solver` 配合：在调试时快速了解项目技术栈

## 贡献与维护

如需添加新的原子技能：
1. 在 `atomic-skills/` 目录下创建新的子文件夹
2. 按照现有原子技能的格式编写 `SKILL.md`，必须包含：
   - 任务定义
   - 识别范围
   - 输入依据
   - 输出字段
   - 判定规则
   - 输出格式
   - 强约束
   - 适用场景
   - 前置条件
3. 更新本主技能的 `SKILL.md` 以包含新技能的描述、使用场景和依赖关系
4. 更新 README.md 的原子技能列表和依赖关系图

## 注意事项

- 输出为 Markdown 格式，多次输出时相同内容按最新结果覆盖
- 环境变量值会被原样输出，注意安全性
- 路由文件位置会根据框架类型自动识别
- 项目类型识别基于 package.json 和入口文件