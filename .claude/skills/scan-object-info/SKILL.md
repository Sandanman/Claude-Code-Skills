---
name: scan-object-info
description: 智能扫描并分析前端项目的各种技术信息（框架、UI库、状态管理、请求方案、配置文件、项目结构、路由方案、环境变量等），根据用户需求选择性调用相关原子技能并输出结构化结果。改进版新增智能技能选择、并行执行支持、confidence scores、project-summary 和 suggested follow-up actions。
---

# scan-object-info（改进版 v1.1）

## 任务定义

你是主技能 `scan_object_info`，负责理解用户的扫描需求并调度相应的原子技能来完成信息的提取和分析。

## 改进点（v1.0 -> v1.1）

1. **新增智能技能选择逻辑**：基于用户意图的关键词分析和依赖图优化，自动选择最小必要技能集
2. **新增并行执行支持**：根据依赖关系图，自动识别可并行执行的技能组合
3. **新增 confidence scores**：每个检测结果标注置信度（high/medium/low）
4. **新增 project-summary**：全面扫描后自动生成项目摘要（含技术栈特征、技术债务提示）
5. **改进错误处理**：缺失文件时提供明确的错误信息和降级策略
6. **新增 suggested follow-up actions**：根据扫描结果推荐后续操作

## 工作流程

### 1. 理解用户意图

分析用户输入，识别需要提取的信息类型（使用**关键词分析 + 意图推断**）：

| 意图类型 | 关键词 | 需要的原子技能 |
|---------|--------|--------------|
| 全面分析 | 全面、完整、所有、分析 | 全部9个原子技能 |
| 技术栈 | 技术栈、框架、用什么 | scan_package_json + detect_framework + detect_ui_library + detect_state_manage |
| 打包配置 | 打包、构建、vite、webpack | scan_config_files + scan_package_json |
| UI技术 | UI库、样式、组件库 | detect_ui_library + scan_config_files |
| 路由 | 路由、router | detect_router_solution |
| 环境变量 | 环境变量、.env、配置 | scan_env_variables |
| 状态管理 | 状态、store、redux、pinia | detect_state_manage |
| 请求方案 | 请求、api、axios、fetch | detect_request_scheme |
| 项目结构 | 结构、目录、入口 | scan_project_structure + scan_package_json |

### 2. 智能技能选择（**新增 v1.1**）

```
意图分析 → 关键词匹配 → 最小技能集 → 依赖图分析 → 执行计划（串行/并行）
```

**技能依赖图**：
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

### 3. 并行执行支持（**新增 v1.1**）

识别无依赖或依赖已满足的技能，自动并行执行：

```
并行组1：scan_package_json, scan_project_structure, scan_config_files
并行组2：detect_framework（依赖 scan_package_json + scan_project_structure）
并行组3：detect_ui_library（依赖 scan_config_files）
并行组4：detect_router_solution（依赖 detect_framework）
并行组5：detect_state_manage, detect_request_scheme（依赖 scan_package_json + scan_project_structure）
```

### 4. 执行顺序

当需要调用多个原子技能时，按以下顺序执行以确保信息依赖关系：

```
1. scan_package_json  (基础依赖信息，其他技能可能需要)
2. scan_project_structure + scan_config_files  (可并行)
3. detect_framework  (基于 1 & 2)
4. detect_ui_library  (基于 1 & 3)
5. detect_state_manage + detect_request_scheme  (基于 1 & 2，可并行)
6. detect_router_solution  (基于 1 & 4)
7. scan_env_variables  (基于 1 & 3 & 4)
```

### 5. 整合输出

收集所有原子技能的输出，按照逻辑分组整理，输出结构化结果（含 confidence scores 和 project-summary）。

### 6. 生成 Project Summary（**新增 v1.1**）

全面扫描后自动生成：
- 技术栈特征一句话总结
- 检测到的关键技术（框架、UI库、状态管理、请求方案）
- 技术债务提示（如：未使用 TS、未配置 eslint、依赖版本过旧等）
- **Suggested Follow-up Actions**（推荐后续操作）

## 输出格式

按照信息类型分组输出，每组包含 confidence scores：

```markdown
# 项目扫描结果 v1.1

## 项目摘要（**新增**）
[一句话总结：Vue3 + TypeScript + Element Plus + Pinia + Axios + Vue Router]

## 1. 项目基本信息
[来自 scan_package_json 的输出]

## 2. 项目结构
[来自 scan_project_structure 的输出]

## 3. 配置文件
[来自 scan_config_files 的输出]

## 4. 框架与技术栈
[来自 detect_framework 的输出，含 confidence scores]

## 5. UI 库与样式方案
[来自 detect_ui_library 的输出，含 confidence scores]

## 6. 状态管理方案
[来自 detect_state_manage 的输出，含 confidence scores]

## 7. 网络请求方案
[来自 detect_request_scheme 的输出，含 confidence scores]

## 8. 路由方案
[来自 detect_router_solution 的输出，含 confidence scores]

## 9. 环境变量
[来自 scan_env_variables 的输出]

## 技术债务提示（**新增**）
- 项目未使用 TypeScript，建议迁移
- pinia 版本过旧，建议升级
- 缺少 ESLint 配置

## 建议后续操作（**新增**）
1. 执行 `requirement-generator` 生成需求文档
2. 执行 `code-style-generator` 生成代码规范
3. 执行 `code-redundancy-checker` 检查代码冗余
```

**注意**：只输出被调用的原子技能对应的部分，未调用的部分不显示。

## 置信度标注（**新增 v1.1**）

每个检测结果标注 confidence score：
- **high**：基于明确的文件内容和配置，置信度 > 90%
- **medium**：基于间接证据或部分匹配，置信度 60-90%
- **low**：基于推测或弱信号，置信度 < 60%

示例：
```markdown
- 框架：`Vue3` (confidence: high)
  - 依据：`package.json` 中检测到 `vue@^3.5.0`
- 样式方案：`SCSS` (confidence: medium)
  - 依据：`package.json` 中存在 `sass` 依赖，但未检测到 scss 文件
```

## 错误处理（改进版）

当某个原子技能执行失败时，主技能会：
1. 明确提示用户哪个技能执行失败
2. 继续执行其他技能（降级策略）
3. 在最终输出中标记失败的部分和原因
4. 提供错误恢复建议

错误示例：
```markdown
## 4. UI 库与样式方案
⚠️ 该部分扫描失败：未找到 package.json 文件（降级：使用未知配置）

建议后续操作：
1. 请确保项目根目录存在 package.json
2. 或手动提供项目信息
```

## 强约束

1. **精准选择**：只调用必要的原子技能，不进行冗余扫描
2. **并行优化**：自动识别可并行执行的技能，减少执行时间
3. **信息复用**：避免重复读取相同的文件信息
4. **结构化输出**：保持输出格式清晰、可读、易解析
5. **置信度标注**：每个检测结果标注 confidence score
6. **project-summary**：全面扫描后必须生成项目摘要
7. **客观准确**：基于实际文件内容，不做猜测或推断
8. **错误处理**：单个技能失败不影响整体执行，提供降级策略和 suggested follow-up actions

## 智能化选择优化

### 优先级规则（改进版）

1. **基础优先**：`scan_package_json` 总是第一个执行，提供依赖信息给其他技能
2. **结构优先**：`scan_project_structure` 在 `detect_framework` 之前执行
3. **配置优先**：`scan_config_files` 在 `detect_ui_library` 和 `scan_env_variables` 之前执行
4. **框架依赖**：`detect_framework` 必须在 `detect_router_solution` 和 `scan_env_variables` 之前执行
5. **最小集合**：如果用户需求明确，选择最少的技能组合
6. **并行优先**：无依赖或依赖已满足的技能自动并行执行

### 自动补全逻辑

- 当用户提及 "路由" 时，自动添加 `detect_router_solution`
- 当用户提及 "环境变量"、".env"、"配置" 时，自动添加 `scan_env_variables`
- 当用户提及 "全面分析" 时，自动添加所有技能
- 当用户未指定需求时，默认选择：`scan_package_json` + `scan_project_structure` + `scan_config_files` + `detect_framework`
- **当用户提及多个意图时，自动合并最小技能集（新增 v1.1）**

## 示例对话

**用户**: "了解项目打包工具和使用的UI库"

**执行流程**:
1. 意图分析：打包工具 + UI库
2. 关键词匹配：打包 → scan_config_files；UI库 → detect_ui_library
3. 智能选择：scan_package_json（基础）+ scan_config_files + detect_ui_library
4. 依赖分析：detect_ui_library 依赖 scan_config_files → 串行执行
5. 执行并整合结果

**用户**: "全面分析这个前端项目"

**执行流程**:
1. 意图分析：全面扫描
2. 智能选择：全部9个原子技能
3. 执行计划：
   - 并行组1：scan_package_json + scan_project_structure + scan_config_files
   - 串行：detect_framework（依赖1）
   - 并行组2：detect_ui_library + detect_state_manage + detect_request_scheme（依赖满足）
   - 串行：detect_router_solution（依赖 detect_framework）
   - 串行：scan_env_variables（依赖 detect_framework）
4. 整合结果 + 生成 project-summary + suggested follow-up actions

**用户**: "项目用了什么路由方案？"

**执行流程**:
1. 意图分析：路由方案
2. 智能选择：scan_package_json（基础）+ detect_router_solution
3. 执行并输出结果 + confidence score

## 版本
v1.1 - 改进版：新增智能技能选择、并行执行支持、confidence scores、project-summary、suggested follow-up actions、改进的错误处理