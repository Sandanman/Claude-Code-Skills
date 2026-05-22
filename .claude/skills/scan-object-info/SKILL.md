---
name: scan-object-info
description: 智能扫描并分析前端项目的各种技术信息（框架、UI库、状态管理、请求方案、配置文件、项目结构、路由方案、环境变量等），根据用户需求选择性调用相关原子技能并输出结构化结果。
---

# scan_object_info

## 任务定义

你是主技能 `scan_object_info`，负责理解用户的扫描需求并调度相应的原子技能来完成信息的提取和分析。

## 工作流程

### 1. 理解用户意图

分析用户输入，识别需要提取的信息类型：
- **项目基本信息**：package.json 分析 → `scan_package_json`
- **构建配置**：打包工具、配置文件 → `scan_config_files`
- **UI 技术栈**：UI 库、样式方案 → `detect_ui_library`
- **框架信息**：前端框架、TS、渲染模式 → `detect_framework`
- **状态管理**：状态库识别 → `detect_state_manage`
- **请求方案**：请求库、封装结构 → `detect_request_scheme`
- **项目结构**：目录结构、入口文件 → `scan_project_structure`
- **路由方案**：路由实现方式 → `detect_router_solution`
- **环境变量**：环境配置文件分析 → `scan_env_variables`
- **全面扫描**：所有信息 → 调用全部原子技能

### 2. 选择原子技能

根据用户意图，选择最小必要的原子技能集合，避免冗余。

**示例映射关系**：

| 用户需求 | 需要的原子技能 |
|---------|--------------|
| "了解项目打包工具和使用的UI库" | `scan_config_files` + `detect_ui_library` |
| "分析项目使用的前端框架" | `detect_framework` |
| "查看项目的状态管理方案" | `detect_state_manage` |
| "扫描项目结构和依赖" | `scan_package_json` + `scan_project_structure` |
| "分析项目的技术栈" | `scan_package_json` + `detect_framework` + `detect_ui_library` + `detect_state_manage` + `detect_request_scheme` |
| "查看所有配置信息" | `scan_config_files` + `scan_package_json` + `scan_env_variables` |
| "了解项目的路由方案" | `detect_router_solution` |
| "分析环境变量配置" | `scan_env_variables` |
| "全面分析项目" | 全部原子技能 |

### 3. 执行顺序

当需要调用多个原子技能时，按以下顺序执行以确保信息依赖关系：

```
1. scan_package_json  (基础依赖信息，其他技能可能需要)
2. scan_project_structure  (项目结构信息)
3. scan_config_files  (配置信息)
4. detect_framework  (基于 1 & 2 & 3)
5. detect_ui_library  (基于 1 & 3)
6. detect_state_manage  (基于 1 & 2)
7. detect_request_scheme  (基于 1 & 2)
8. detect_router_solution  (基于 1 & 4)
9. scan_env_variables  (基于 1 & 3 & 4)
```

### 4. 整合输出

收集所有原子技能的输出，按照逻辑分组整理，输出结构化结果。

## 输出格式

按照信息类型分组输出，每组包含相关的原子技能结果：

```markdown
# 项目扫描结果

## 1. 项目基本信息
[来自 scan_package_json 的输出]

## 2. 项目结构
[来自 scan_project_structure 的输出]

## 3. 配置文件
[来自 scan_config_files 的输出]

## 4. 框架与技术栈
[来自 detect_framework 的输出]

## 5. UI 库与样式方案
[来自 detect_ui_library 的输出]

## 6. 状态管理方案
[来自 detect_state_manage 的输出]

## 7. 网络请求方案
[来自 detect_request_scheme 的输出]

## 8. 路由方案
[来自 detect_router_solution 的输出]

## 9. 环境变量
[来自 scan_env_variables 的输出]

## 总结
[简要总结技术栈特征]
```

**注意**：只输出被调用的原子技能对应的部分，未调用的部分不显示。

## 强约束

1. **精准选择**：只调用必要的原子技能，不进行冗余扫描
2. **信息复用**：避免重复读取相同的文件信息
3. **结构化输出**：保持输出格式清晰、可读、易解析
4. **客观准确**：基于实际文件内容，不做猜测或推断
5. **错误处理**：如果某个原子技能执行失败，明确说明并继续执行其他技能

## 智能化选择优化

### 优先级规则

1. **基础优先**：`scan_package_json` 总是第一个执行，提供依赖信息给其他技能
2. **结构优先**：`scan_project_structure` 在 `detect_framework` 之前执行，提供目录结构信息
3. **配置优先**：`scan_config_files` 在 `detect_ui_library` 和 `scan_env_variables` 之前执行，提供构建工具信息
4. **框架依赖**：`detect_framework` 必须在 `detect_router_solution` 和 `scan_env_variables` 之前执行
5. **最小集合**：如果用户需求明确，选择最少的技能组合

### 依赖关系图

```
scan_package_json
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

### 自动补全逻辑

- 当用户提及 "路由" 时，自动添加 `detect_router_solution`
- 当用户提及 "环境变量"、".env"、"配置" 时，自动添加 `scan_env_variables`
- 当用户提及 "全面分析" 时，自动添加所有技能
- 当用户未指定需求时，默认选择：`scan_package_json` + `scan_project_structure` + `scan_config_files` + `detect_framework`

## 示例对话

**用户**: "了解项目打包工具和使用的UI库"

**执行流程**:
1. 识别需求：打包工具 + UI 库
2. 选择技能：`scan_config_files` + `detect_ui_library`
3. 执行并整合结果

**用户**: "全面分析这个前端项目"

**执行流程**:
1. 识别需求：全面扫描
2. 选择技能：全部原子技能
3. 按顺序执行并整合结果

**用户**: "项目用了什么路由方案？"

**执行流程**:
1. 识别需求：路由方案
2. 选择技能：`detect_router_solution`
3. 执行并输出结果

**用户**: "检查环境变量配置"

**执行流程**:
1. 识别需求：环境变量
2. 选择技能：`scan_env_variables`
3. 执行并输出结果