---
name: tech-stack-detection
description: 检测项目技术栈（框架、语言、构建工具等），优先从 requirements.json 或 project_context.json 读取，仅在缺失时扫描项目文件。在 multi-scenario-adapter 和 requirement-reader/requirement-analysis 之后执行。
---

# Tech Stack Detection 原子Skill v1.2

## 概述

检测项目使用的技术栈和代码规范。**v1.2 改进：优先从 requirements.json 或 project_context.json 读取**，仅在缺失或不完整时扫描项目文件。避免重复工作，与 requirement-generator 协同。

## 核心能力

- 优先读取 requirements.json 的 project_context
- 优先读取 project_context.json（v1.2 新增）
- 验证技术栈数据完整性
- 补充缺失的技术栈信息（必要时扫描项目）
- 检测项目框架（Vue/React/Angular等）
- 检测编程语言（JavaScript/TypeScript）
- 检测构建工具（Vite/Webpack/Rollup等）
- 检测包管理器（npm/yarn/pnpm）
- 检测 CODE_STYLE.md 是否存在

## 输入

- **multi-scenario-adapter 输出**：包含场景类型
- **requirement-reader 输出**：包含 project_context（如果有）
- **requirement-analysis 输出**：包含需求分析报告（仅场景2/3）

## 输出

技术栈检测报告：

```markdown
# 技术栈检测报告 v1.2

## 检测概览
- **检测时间**：2026-04-08 20:00:10
- **项目根目录**：<项目根路径>
- **数据来源**：requirements_json | project_context_json | project_scan
- **检测状态**：完成

## 框架检测

### 主要框架
- **框架类型**：Vue/React/Angular等
- **框架版本**：<版本号>
- **API风格**：Composition API（Vue3）/ Options API（Vue2）/ Hooks（React）
- **状态管理**：Pinia/Vuex/Redux/Zustand等

### 辅助库
- **UI组件库**：Element Plus
- **路由**：Vue Router 4
- **HTTP库**：axios

## 语言检测

### 编程语言
- **主要语言**：JavaScript/TypeScript
- **TypeScript支持**：是/否
- **模块系统**：ES Modules

## 构建工具检测

### 构建配置
- **构建工具**：Vite 5.0.0
- **配置文件**：vite.config.js
- **开发服务器端口**：5173

## 包管理器检测

### 包信息
- **包管理器**：npm/yarn/pnpm
- **包文件**：package.json
- **lock文件**：package-lock.json

## 代码规范检测

### CODE_STYLE.md 状态
- **是否存在**：✅ 是 / ⚠️ 否
- **文件路径**：/CODE_STYLE.md
- **规范版本**：1.0

### CODE_STYLE.md 规范摘要
```markdown
- 命名规范：组件使用PascalCase，变量使用camelCase
- 缩进：2空格
- 引号：单引号为主
- 分号：不使用分号
- Vue组件：使用<script setup>语法
- 函数风格：优先使用箭头函数
```

## 技术栈总结

| 类型 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue | 3.3.4 |
| 语言 | JavaScript | ES2020+ |
| 构建 | Vite | 5.0.0 |
| UI库 | Element Plus | latest |
| 路由 | Vue Router | 4.x |
| 状态 | Pinia | latest |
| HTTP | axios | latest |

## 代码生成建议

### 推荐技术栈
- **组件风格**：使用 `<script setup>` 语法
- **状态管理**：使用 Pinia stores
- **路由管理**：使用 Vue Router
- **API调用**：使用 axios 封装
- **UI组件**：使用 Element Plus

### 代码风格建议
- 遵循 CODE_STYLE.md 规范
- 使用 2空格缩进
- 使用单引号
- 不使用分号
- 组件命名使用 PascalCase
- 变量命名使用 camelCase
```

## 执行逻辑

### 优先级读取策略（v1.2 改进）

```
1. 检查 requirements.json 是否有 project_context
   → 有：使用 project_context，标记来源为 "requirements_json"
   → 无：继续
   
2. 检查项目根目录是否有 project_context.json
   → 有：使用 project_context.json，标记来源为 "project_context_json"
   → 无：继续
   
3. 扫描项目文件
   → 读取 package.json
   → 检测 vite.config.js / webpack.config.js
   → 检测 src/ 目录结构
   → 检查 CODE_STYLE.md
   → 检测 ESLint/Prettier 配置
   → 标记来源为 "project_scan"
```

### 场景1：标准输入（requirements.json 有 project_context）

1. 从 requirement-reader 读取 project_context
2. 验证 project_context 完整性
3. 提取所有技术栈信息
4. 验证 CODE_STYLE.md 状态
5. 输出技术栈报告
6. 标记来源：`requirements_json`

### 场景2：project_context.json 存在

1. 读取 project_context.json
2. 验证数据完整性
3. 补充缺失字段（扫描项目文件）
4. 输出技术栈报告
5. 标记来源：`project_context_json`

### 场景3：扫描项目文件

1. 读取 package.json
2. 检测构建工具配置文件
3. 检测框架和库
4. 检测代码规范配置
5. 输出技术栈报告
6. 标记来源：`project_scan`

## 依赖关系

- **依赖**：multi-scenario-adapter、requirement-reader
- **被依赖**：code-design、code-generation

## 完成标准

1. ✅ 检测出主要框架和版本
2. ✅ 检测出编程语言
3. ✅ 检测出构建工具
4. ✅ 明确 CODE_STYLE.md 状态（存在/不存在）
5. ✅ 提供代码生成建议
6. ✅ 输出完整检测报告（markdown）
7. ✅ 标记数据来源（requirements_json/project_context_json/project_scan）

## 错误处理

- **package.json 不存在**：提示用户"未找到 package.json，无法检测技术栈"
- **CODE_STYLE.md 不存在**：在报告中明确提示并建议创建
- **技术栈无法识别**：提示用户手动指定技术栈

## 特殊处理：CODE_STYLE.md 不存在的情况

如果未找到 CODE_STYLE.md，在报告中添加：

```markdown
## 警告和提示

### CODE_STYLE.md 不存在 ⚠️
项目中未找到 CODE_STYLE.md 文件，建议创建以统一代码风格。

**是否需要帮助您生成 CODE_STYLE.md？**
可以运行 `/code-style-generator` skill 自动检测项目代码规范并生成 CODE_STYLE.md 文件。

### 临时方案
将使用以下通用规范生成代码：
- 缩进：2空格
- 引号：单引号
- 分号：不使用分号
- 命名：组件 PascalCase，变量 camelCase
```

## v1.2 改进点

1. **新增 project_context.json 支持**：不依赖 requirements.json 也能获取技术栈
2. **明确标记数据来源**：区分 requirements_json、project_context_json、project_scan
3. **优化读取优先级**：避免不必要的文件扫描
4. **统一输出格式**：所有来源都输出为统一的技术栈报告

## 注意事项

- 必须准确检测框架版本，影响代码生成方式
- CODE_STYLE.md 的存在与否直接影响代码风格
- 优先读取已有配置，不依赖假设
- project_context.json 由 scan-object-info 生成，优先使用

## 原子skill位置

`.claude/skills/code-generator/atomic-skills/tech-stack-detection/SKILL.md`