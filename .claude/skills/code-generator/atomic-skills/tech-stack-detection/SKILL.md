---
name: tech-stack-detection
description: 检测项目技术栈（框架、语言、构建工具等），优先从requirements.json读取project_context，仅在缺失时扫描项目文件。在requirement-reader或requirement-analysis后自动执行。
---

# Tech Stack Detection 原子Skill

## 概述
检测项目使用的技术栈和代码规范。**优先从 requirements.json 的 project_context 读取**，仅在缺失或不完整时扫描项目文件。避免重复工作，与 requirement-generator 协同。

## 核心能力
- 优先读取 requirements.json 中的 project_context
- 验证技术栈数据完整性
- 补充缺失的技术栈信息（必要时扫描项目）
- 检测项目框架（Vue/React/Angular等）
- 检测编程语言（JavaScript/TypeScript）
- 检测构建工具（Vite/Webpack/Rollup等）
- 检测包管理器（npm/yarn/pnpm）
- 检查 CODE_STYLE.md 是否存在

## 输入
requirement-reader输出的需求数据（包含 project_context），或 requirement-analysis 输出的需求分析报告

## 输出
技术栈检测报告，包含以下内容：

```markdown
# 技术栈检测报告

## 检测概览
- **检测时间**：2026-04-08 20:00:10
- **项目根目录**：<项目根路径>
- **检测状态**：完成

## 框架检测

### 主要框架
- **框架类型**：Vue/React/Angular等
- **框架版本**：<从 package.json 读取>
- **API风格**：Composition API（Vue3）/ Options API（Vue2）/ Hooks（React）
- **状态管理**：Pinia/Vuex/Redux/Zustand等（路径：stores/ 或 store/）

### 辅助库
- **UI组件库**：Element Plus
- **路由**：Vue Router 4
- **HTTP库**：axios

## 语言检测

### 编程语言
- **主要语言**：JavaScript
- **TypeScript支持**：否
- **模块系统**：ES Modules

### 语言配置
- **JS版本**：ES2020+
- **是否使用JSX**：否

## 构建工具检测

### 构建配置
- **构建工具**：Vite 5.0.0
- **配置文件**：vite.config.js
- **开发服务器端口**：5173

### 其他工具
- **测试框架**：Vitest
- **E2E测试**：Playwright
- **代码质量**：ESLint

## 包管理器检测

### 包信息
- **包管理器**：npm
- **包文件**：package.json
- **lock文件**：package-lock.json
- **依赖数量**：125个生产依赖

## 代码规范检测

### CODE_STYLE.md 状态
- **是否存在**：✅ 是
- **文件路径**：/CODE_STYLE.md
- **规范版本**：1.0

### CODE_STYLE.md 规范摘要
```markdown
- 命名规范：组件使用PascalCase，变量使用camelCase
- 缩进：2空格
- 引号：单引号为主，双引号仅在包含单引号时使用
- 分号：不使用分号
- Vue组件：使用<script setup>语法
- 函数风格：优先使用箭头函数
```

### 其他规范配置
- **ESLint配置**：eslint.config.ts
- **Prettier配置**：.prettierrc.json
- **EditorConfig**：.editorconfig

## 项目结构分析

### 目录结构
```
src/
├── api/         # API接口
├── assets/      # 静态资源
├── components/  # 组件
├── config/      # 配置
├── router/      # 路由
├── stores/      # 状态管理
├── utils/       # 工具函数
└── views/       # 页面视图
```

### 关键文件
- **入口文件**：src/main.js / src/main.ts / index.html
- **路由配置**：src/router/index.js / src/router/index.ts
- **API封装**：src/api/ 或 src/services/

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
| 包管理 | npm | latest |

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

## 警告和提示

### CODE_STYLE.md 存在 ✅
已检测到项目中有 CODE_STYLE.md 文件，代码生成将严格遵循此规范。

### 建议
- 继续保持代码规范一致性
- 新建文件时遵循现有目录结构
- API调用统一使用 src/api/ 目录

## 结论
项目使用 Vue 3 + JavaScript + Vite 技术栈，已配置完整的代码规范（CODE_STYLE.md），代码生成将自动适配此技术栈和规范。
```

## 执行逻辑

### 场景1：标准输入（requirements.json 存在且有 project_context）
1. 从 requirement-reader 读取 project_context
2. 验证 project_context 完整性：
   - frontend_framework（必需）
   - ui_library.name（必需）
   - project_structure.components_dir（必需）
3. 提取所有技术栈信息
4. 验证 CODE_STYLE.md 状态（从 project_context.code_style 读取）
5. 输出技术栈报告
6. 标记来源：`requirements_json`

### 场景2：自由文本输入或 project_context 缺失
1. 检测输入类型为自由文本，或 project_context 不完整
2. 扫描项目文件：
   - 读取 package.json
   - 检测 vite.config.js / webpack.config.js
   - 检测 src/ 目录结构
   - 检查 CODE_STYLE.md
   - 检测 ESLint/Prettier 配置
3. 输出技术栈报告
4. 标记来源：`project_scan`

### 场景3：混合模式（project_context 部分缺失）
1. 读取 requirements.json 中已有的 project_context
2. 补充缺失字段（扫描项目文件）
3. 输出技术栈报告
4. 标记来源：`requirements_json + project_scan`

## 依赖关系
- 依赖：requirement-reader（优先）或 requirement-analysis（fallback模式）

## 完成标准
1. ✅ 检测出主要框架和版本
2. ✅ 检测出编程语言
3. ✅ 检测出构建工具
4. ✅ 明确 CODE_STYLE.md 状态（存在/不存在）
5. ✅ 提供代码生成建议
6. ✅ 输出完整检测报告（markdown）

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

## 示例

**输入**：requirement-analysis 输出的需求分析报告（已识别为多模块需求）

**输出**：如上所示，完整的技术栈检测报告

## 注意事项
- 必须准确检测框架版本，影响代码生成方式
- CODE_STYLE.md 的存在与否直接影响代码风格
- 优先读取项目实际配置，不依赖假设

## 原子skill位置
./.claude/skills/code-generator/atomic-skills/tech-stack-detection/SKILL.md