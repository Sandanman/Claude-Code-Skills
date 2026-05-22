---
name: code-generator
description: 根据需求文档或需求描述自动生成符合项目规范的代码。简单需求直接处理，复杂需求优先使用 requirement-generator 标准化。v1.2 新增 multi-scenario-adapter 智能适配执行流程。当用户需要根据需求开发代码、实现功能模块或编写函数时自动触发。
---

# Code Generator 主Skill v1.2

## 概述
本主skill根据需求文档、功能模块描述或用户需求，自动生成符合项目规范的可开发代码，支持多种输入形式并自动适配项目技术栈。**v1.2 核心改进：新增 multi-scenario-adapter 智能适配器，根据需求类型自动选择最优执行路径。**

## 版本历史
- v1.2 (2026-05-21): 新增 multi-scenario-adapter 原子skill，4场景智能路由，改进 tech-stack-detection 从 project_context.json 读取
- v1.0: 初始版本，8个原子skill，3场景处理

---

## 使用场景划分（4场景）

### 场景0：需求复杂度识别（由 multi-scenario-adapter 执行）

```
用户输入 → multi-scenario-adapter → 判断场景 → 选择执行路径
```

**判断规则**：

| 维度 | 标准输入 | 简单需求 | 复杂需求 | 多模块 |
|------|----------|----------|----------|--------|
| 输入来源 | requirements.json | 自由文本 | 自由文本 | 自由文本 |
| 描述长度 | 不限 | < 50字 | > 100字 | 不限 |
| 功能点数 | 已标准化 | 1个 | ≥ 2个 | ≥ 3个 |
| 模块数 | 已有定义 | 无模块 | 可能多模块 | ≥ 3个 |
| 关键词 | 无 | 写、实现、修改 | 系统、管理、模块、包含以下 | 模块、功能点 |
| 复杂度 | 低 | 很低 | 中高 | 高 |
| 推荐路径 | 场景1 | 场景2 | 场景3 | 场景3 |

**multi-scenario-adapter 决策逻辑**：
```
1. 检查是否有 requirements.json
   → 有 → 场景1（标准输入）
   → 无 → 继续分析
   
2. 分析需求文本
   → 描述 < 50字，功能点 1个 → 场景2（简单需求）
   → 描述 > 100字，功能点 ≥ 2个 → 场景3（复杂需求）
   → 模块数 ≥ 3个 → 场景3（多模块需求）
```

### 场景1：标准输入模式（优先，从 requirements.json）

```
requirement-reader → multi-scenario-adapter → tech-stack-detection → code-design →
code-generation → module-integration（仅多模块）→ code-validation → documentation-update
```

**适用情况**：
- 已有 requirements.json（由 requirement-generator 生成）
- 需求已标准化，包含完整的模块、API、UI规格
- project_context 已包含在 requirements.json 中
- 复杂需求已完成标准化

**特点**：
- multi-scenario-adapter 识别为"标准输入"，跳过 requirement-analysis
- tech-stack-detection 优先读取 project_context.json，仅验证补充
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
- 描述简短（< 50字）

**特点**：
- multi-scenario-adapter 识别为"简单需求"，简化分析流程
- requirement-reader 检测无 requirements.json
- requirement-analysis 快速分析单一功能点
- tech-stack-detection 扫描项目文件获取技术栈
- 跳过 module-integration（单模块）

### 场景3：复杂需求模式（自由文本，多模块）

```
requirement-reader（检测无requirements.json）→ requirement-analysis → tech-stack-detection →
code-design → code-generation → module-integration → code-validation → documentation-update
```

**适用情况**：
- 复杂需求（多个功能点、系统级）
- 用户选择不执行 requirement-generator
- 需要重新分析需求
- 多模块之间有关联

**特点**：
- multi-scenario-adapter 识别为"复杂需求"或"多模块"
- requirement-analysis 分析多个功能点和模块关系
- tech-stack-detection 需要扫描项目文件
- code-design 需要重新设计API和UI
- **必须执行 module-integration 整合多模块**

---

## 核心理念
- **智能路由**：multi-scenario-adapter 自动选择最优执行路径
- **标准化输入优先**：优先读取 requirements.json，复用 requirement-generator 成果
- **需求驱动的代码生成**
- **自动适配项目技术栈和代码规范**
- **支持单模块和多模块需求**
- **动态调整执行流程**
- **输出高质量带注释代码**

---

## 核心能力
- 需求理解和分析
- 技术栈自动检测（优先从 project_context.json）
- 场景智能适配（multi-scenario-adapter）
- 代码结构设计
- 自动代码生成
- 模块间整合
- 代码质量验证

---

## 执行流程

### 完整流程（含 multi-scenario-adapter）

```
用户输入
    ↓
[multi-scenario-adapter] ← NEW v1.2
    ↓（判断场景）
    ├─ 场景1：标准输入 → requirement-reader → tech-stack-detection → code-design → code-generation → code-validation → documentation-update
    ├─ 场景2：简单需求 → requirement-reader → requirement-analysis → tech-stack-detection → code-design → code-generation → code-validation → documentation-update
    └─ 场景3：复杂/多模块 → requirement-reader → requirement-analysis → tech-stack-detection → code-design → code-generation → module-integration → code-validation → documentation-update
```

### 流程对比

| 步骤 | 场景1（标准） | 场景2（简单） | 场景3（复杂） |
|------|--------------|--------------|--------------|
| multi-scenario-adapter | 执行（判断标准输入） | 执行（判断简单需求） | 执行（判断复杂/多模块） |
| requirement-reader | 执行 | 执行 | 执行 |
| requirement-analysis | 跳过 | 执行 | 执行 |
| tech-stack-detection | 执行（优先project_context） | 执行（扫描项目） | 执行（扫描项目） |
| code-design | 执行（复用api_spec/ui） | 执行（重新设计） | 执行（重新设计） |
| code-generation | 执行 | 执行 | 执行 |
| module-integration | 可选（多模块时执行） | 跳过 | 必须执行 |
| code-validation | 执行 | 执行 | 执行 |
| documentation-update | 执行 | 执行 | 执行 |

---

## 原子skill依赖关系（v1.2）

| 原子skill | 依赖 | 说明 |
|-----------|------|------|
| multi-scenario-adapter | 无 | 首个执行，决定后续路径 |
| requirement-reader | 无 | 读取需求文档 |
| requirement-analysis | requirement-reader（fallback模式） | 仅自由文本输入时执行 |
| tech-stack-detection | requirement-reader 或 requirement-analysis | 优先使用 project_context.json |
| code-design | tech-stack-detection, requirement-reader | 优先使用 api_spec 和 ui_components |
| code-generation | code-design | 生成代码文件 |
| module-integration | code-generation | 仅多模块需求执行 |
| code-validation | code-generation 或 module-integration | 验证代码 |
| documentation-update | code-validation | 添加注释 |

---

## 技术栈自动检测（v1.2 改进）

### 优先读取顺序
1. **requirements.json 的 project_context**（最高优先级）
2. **项目根目录的 project_context.json**（次优先级）
3. **扫描项目文件**（兜底）

### project_context.json 结构
```json
{
  "frontend_framework": "vue3",
  "ui_library": {
    "name": "element-plus",
    "version": "2.2.31",
    "components": ["el-form", "el-input", "el-button"]
  },
  "project_structure": {
    "components_dir": "src/components",
    "views_dir": "src/views",
    "apis_dir": "src/api"
  },
  "code_style": {
    "has_style_guide": true,
    "style_guide_path": "./CODE_STYLE.md",
    "indent": "2sp",
    "quotes": "single"
  }
}
```

### 检测内容
- **框架**：Vue 2/3、React、Angular、Svelte
- **语言**：JavaScript、TypeScript
- **构建工具**：Vite、Webpack、Rollup
- **代码规范**：检查 CODE_STYLE.md、.eslintrc、.prettierrc 等
- **包管理器**：package.json（npm/yarn/pnpm）
- **UI库**：Element Plus、Ant Design、Vuetify 等

---

## 主skill完成标准（v1.2，9项）

1. ✅ **需求已读取**：requirements.json 或文本分析完成
2. ✅ **场景已适配**：multi-scenario-adapter 正确判断场景类型
3. ✅ **技术栈已检测**：优先使用 project_context.json 中的技术栈信息
4. ✅ **代码设计完成**：基于 requirements.json 的 api_spec 和 ui_components（如存在）
5. ✅ **生成代码语法正确**：所有文件语法正确、格式规范
6. ✅ **模块间整合完成**：多模块需求已完成整合（场景3）
7. ✅ **代码通过验证**：满足 requirements.json 中的 test_cases（如存在）
8. ✅ **所有代码文件已添加完整注释**：继承 quality.recommendations
9. ✅ **执行日志完整**：所有原子skill日志完整记录

---

## 重试规则（v1.2）

- 每个原子skill失败后可重试 **3次**
- multi-scenario-adapter 失败：提示用户手动选择场景
- code-generation 失败：暂停任务等待用户确认
- code-validation 发现问题可返回 code-design 重新设计（最多循环 **2次**）
- module-integration 失败可返回 code-generation 调整（最多循环 **2次**）

---

## 支持的输入形式

| 输入类型 | 示例 | 处理方式 |
|----------|------|----------|
| requirements.json | 由 requirement-generator 生成的标准化文档 | 直接读取，复用所有分析成果 |
| project_context.json | 由 scan-object-info 生成的项目上下文 | 优先传递给 tech-stack-detection |
| 整体需求 | "实现一个用户登录功能..." | 调用 requirement-analysis 分析 |
| 功能模块 | "实现 MeetingCard 组件..." | 单个模块处理 |
| 方法实现 | "写一个函数，将 ISO 时间格式化为..." | 单函数生成 |

---

## 输出产物

- ✅ **带注释的代码文件**（自动创建或修改文件）
- ✅ **完整执行日志**（记录所有步骤和决策）
- ✅ **场景决策报告**（由 multi-scenario-adapter 生成）
- ✅ **验证报告**（由 code-validation 生成）

---

## 多模块需求处理

### 模块识别（由 multi-scenario-adapter + requirement-analysis 执行）

multi-scenario-adapter 会识别：
- 模块边界（如：登录、注册、权限属于不同模块）
- 模块间依赖关系（如：权限模块依赖登录模块）
- 共享组件/工具（如：通用按钮、日期格式化函数）
- 从 requirements.json 中继承 modules 定义

### 模块整合（由 module-integration 执行）

module-integration 会：
- 整理所有模块的导入导出关系
- 统一共享数据类型和接口（优先使用 requirements.json 中的 types）
- 配置路由关联（如需要）
- 消除重复的工具函数
- 生成整合后的项目结构
- 确保数据流正确性
- 优先使用 requirements.json 中的 api_spec 设计共享API
- 优先使用 requirements.json 中的 ui_components 设计组件

---

## 与 requirement-generator 的协作

### 协作流程
```
用户提出复杂需求
    ↓
code-generator 检测为复杂需求
    ↓
询问用户是否需要标准化
    ↓
选项1：是 → 执行 requirement-generator → code-generator（读取 requirements.json）
选项2：否 → code-generator 自由文本模式
```

### 数据流转
```
requirement-generator → requirements.json
    ↓
code-generator → requirement-reader（读取）
    ↓
提取 project_context → 传递给 tech-stack-detection
提取 api_spec → 传递给 code-design
提取 ui_components → 传递给 code-design
提取 modules → 传递给 requirement-analysis 或 module-integration
提取 test_cases → 传递给 code-validation
提取 quality → 传递给 documentation-update
```

---

## 注意事项

- 自动读取项目中的 CODE_STYLE.md，没有则提示用户创建
- multi-scenario-adapter 会优先检测 project_context.json 优化技术栈检测
- 生成的代码会尽量符合项目现有规范
- 多模块需求会自动处理模块间关系
- 会尽量复用现有工具函数，避免重复
- 代码生成前会进行设计验证

---

## 文件系统位置

- 主skill路径：`.claude/skills/code-generator/SKILL.md`
- 原子skill路径：`.claude/skills/code-generator/atomic-skills/`下各子目录

---

## 版本和状态

- **版本**：1.2
- **主skill名称**：code-generator
- **原子skill数量**：9个（新增 multi-scenario-adapter）
- **状态**：启用
- **最后更新**：2026-05-21