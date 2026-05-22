---
name: project-context-reader
description: 读取项目上下文文件，支持从scan-object-info获取或手动提供，不自动扫描任何项目文件。在需求评估后执行。
---

# Project Context Reader 原子 Skill

## 概述
读取项目上下文文件 `./.claude/project-context.json`，该文件由 scan-object-info skill 生成或由用户手动提供。本 skill **不自动扫描任何项目文件**，完全依赖外部上下文输入。

## 核心能力
- 读取 project-context.json 文件
- 验证上下文数据完整性
- 支持默认配置（用户选择跳过时）
- 识别前端框架、UI库、目录结构
- 提取代码规范配置
- 为需求文档生成提供项目上下文

## 输入
前一个 skill（requirement-evaluation）的输出结果

## 输出
项目上下文数据，包含以下内容：

```json
{
  "context_source": "scan-object-info | manual | default",
  "context_available": true,
  "project_context": {
    "frontend_framework": "vue3",
    "ui_library": {
      "name": "element-plus",
      "version": "2.2.31",
      "components": ["el-form", "el-input", "el-button", "el-table"]
    },
    "project_structure": {
      "components_dir": "src/components",
      "views_dir": "src/views",
      "apis_dir": "src/api",
      "utils_dir": "src/utils"
    },
    "code_style": {
      "has_style_guide": true,
      "style_guide_path": "/CODE_STYLE.md",
      "indent": "2sp",
      "quotes": "single"
    }
  },
  "warnings": []
}
```

## 执行逻辑

### 场景1：project-context.json 存在
1. 读取文件：`./.claude/project-context.json`
2. 验证必需字段：
   - `frontend_framework`
   - `ui_library.name`
   - `project_structure.components_dir`
3. 补充默认值（如缺失）：
   - `project_structure.utils_dir` 默认 "src/utils"
   - `code_style.indent` 默认 "2sp"
   - `code_style.quotes` 默认 "single"
4. 输出上下文数据
5. 记录上下文来源

### 场景2：project-context.json 不存在
1. 检测文件不存在
2. 暂停执行，询问用户：
   ```
   未检测到项目上下文文件，请选择：
   1. 执行 scan-object-info skill 扫描项目（推荐）
   2. 手动上传 project-context.json 文件
   3. 跳过，使用默认配置
   ```
3. 根据用户选择：
   - **选项1**：等待用户执行 scan-object-info，然后重新执行本skill
   - **选项2**：等待用户上传文件，然后重新执行本skill
   - **选项3**：使用默认配置继续
4. 输出上下文数据
5. 记录上下文来源

### 默认配置格式
```json
{
  "frontend_framework": "unknown",
  "ui_library": {
    "name": "unknown",
    "version": "latest",
    "components": []
  },
  "project_structure": {
    "components_dir": "src/components",
    "views_dir": "src/views",
    "apis_dir": "src/api",
    "utils_dir": "src/utils"
  },
  "code_style": {
    "has_style_guide": false,
    "style_guide_path": null,
    "indent": "2sp",
    "quotes": "single"
  }
}
```

## 依赖关系
- 依赖 requirement-evaluation（前置skill）
- 不依赖 scan-object-info（但可由用户手动执行）

## 完成标准
1. 已检测 project-context.json 文件存在性
2. 已读取或获取项目上下文数据
3. 已验证必需字段完整性
4. 已记录上下文来源
5. 输出完整的JSON格式数据
6. 如有问题已记录警告

## 错误处理
- **文件不存在**：暂停并询问用户选择处理方式
- **文件格式错误**：提示"上下文文件格式错误，请检查JSON格式"
- **必需字段缺失**：使用默认值补充，并记录警告
- **用户选择跳过**：使用默认配置，记录来源为 "default"

## 示例

### 示例1：文件存在
**输入**：`./.claude/project-context.json` 存在

**输出**：
```json
{
  "context_source": "scan-object-info",
  "context_available": true,
  "project_context": {
    "frontend_framework": "vue3",
    "ui_library": {
      "name": "element-plus",
      "version": "2.2.31",
      "components": ["el-form", "el-input", "el-button", "el-table"]
    },
    "project_structure": {
      "components_dir": "src/components",
      "views_dir": "src/views",
      "apis_dir": "src/api",
      "utils_dir": "src/utils"
    },
    "code_style": {
      "has_style_guide": true,
      "style_guide_path": "/CODE_STYLE.md",
      "indent": "2sp",
      "quotes": "single"
    }
  },
  "warnings": []
}
```

### 示例2：文件不存在，用户选择跳过
**输入**：`./.claude/project-context.json` 不存在，用户选择跳过

**输出**：
```json
{
  "context_source": "default",
  "context_available": false,
  "project_context": {
    "frontend_framework": "unknown",
    "ui_library": { "name": "unknown", "version": "latest", "components": [] },
    "project_structure": { "components_dir": "src/components", "views_dir": "src/views", "apis_dir": "src/api", "utils_dir": "src/utils" },
    "code_style": { "has_style_guide": false, "style_guide_path": null, "indent": "2sp", "quotes": "single" }
  },
  "warnings": ["使用默认配置，建议执行 scan-object-info 获取准确项目上下文"]
}
```

## 与 scan-object-info 的协作

### scan-object-info 职责
- 扫描项目文件（package.json、src/目录等）
- 检测技术栈、UI库、目录结构
- 生成 project-context.json

### project-context-reader 职责
- 读取 project-context.json
- 验证数据完整性
- 提供上下文给需求文档生成
- **不扫描任何项目文件**

## 注意事项
- **不自动执行 scan-object-info**，仅提示用户
- 不验证技术栈合理性，仅读取数据
- 不扫描任何项目文件
- 如缺失必需字段，使用默认值补充
- 所有上下文数据来自外部输入

## 版本
v1.1 - 改进版：增强数据完整性验证，记录更详细的 warnings