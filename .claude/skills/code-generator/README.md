# Code Generator v1.3（τ 增强版） - 快速使用指南

## 概述

Code Generator 是一个智能代码生成主skill，根据需求文档或需求描述自动生成符合项目规范的代码。**v1.3 新增 τ 增强体系**，通过 Task Folding 压缩冗余链路、Skill Stacking 减少重复解析、Pattern Mining 复用成熟生成模式。

**τ 节省约 30%。**

## 快速开始

### 触发方式

当用户需要根据需求开发代码、实现功能模块或编写函数时自动触发：

- "根据需求写代码"
- "实现这个功能"
- "生成代码"
- "写一个函数/组件/模块"
- "按照需求文档开发"
- "帮我实现"

### 基本使用

```bash
# 用户输入需求
帮我实现一个用户登录组件，包含用户名、密码输入框和登录按钮

# 系统自动执行（τ-Controller 预算分配 → multi-scenario-adapter → 智能路由）
code-generator skill → τ-Controller（预算分配）→ 分析需求 → 检测技术栈
→ 生成代码 → Pattern Mining（归档生成模式）
```

---

## 文件结构

```
.claude/skills/code-generator/
├── SKILL.md                              # 主skill定义（v1.3 τ 增强版）
├── README.md                             # 快速使用指南
└── atomic-skills/                        # 原子skill目录
    ├── multi-scenario-adapter/          # 多场景适配器 [核心·不折叠]
    │   └── SKILL.md
    ├── requirement-reader/               # 需求读取 [核心·不折叠]
    │   └── SKILL.md
    ├── requirement-analysis/             # 需求分析 [可折叠]
    │   └── SKILL.md
    ├── tech-stack-detection/             # 技术栈检测 [核心·可折叠]
    │   └── SKILL.md
    ├── code-design/                      # 代码设计 [核心·可折叠]
    │   └── SKILL.md
    ├── code-generation/                  # 代码生成 [核心·可折叠]
    │   └── SKILL.md
    ├── module-integration/              # 模块整合 [可折叠]
    │   └── SKILL.md
    ├── code-validation/                 # 代码验证 [核心·可折叠]
    │   └── SKILL.md
    └── documentation-update/            # 文档更新 [可折叠]
        └── SKILL.md
```

---

## τ 增强版特性

### τ 分项预算

| 复杂度 | 总预算 | 适用场景 |
|--------|--------|----------|
| simple（场景2，单功能） | 2500 token | 单组件、单函数生成 |
| moderate（场景1/3） | 8000 token | 标准输入或单模块复杂需求 |
| complex（场景3，多模块） | 15000 token | 多模块系统级生成 |

### 3场景 τ 权重分配

| 步骤 | 场景1（标准） | 场景2（简单） | 场景3（复杂） |
|------|--------------|--------------|--------------|
| multi-scenario-adapter | 8% | 8% | 5% |
| requirement-reader | 5% | 5% | 5% |
| requirement-analysis | 0% | 15% | 15% |
| tech-stack-detection | 15% | 18% | 15% |
| code-design | 20% | 20% | 18% |
| code-generation | 30% | 22% | 22% |
| module-integration | 0% | 0% | 10% |
| code-validation | 12% | 7% | 5% |
| documentation-update | 10% | 5% | 5% |
| **总步骤数** | **7** | **7** | **9** |

### Task Folding（任务折叠）

**可折叠组**：

| 折叠组 | 包含技能 | 折叠条件 | τ 节省 |
|--------|---------|---------|--------|
| Group A | requirement-analysis + tech-stack-detection | 简单需求（描述 < 50字） | 25% |
| Group B | code-design + code-generation | simple 或 τ_remaining < 40% | 15% |
| Group C | module-integration + code-validation | 场景3 且模块数 ≤ 3 | 20% |
| Group D | code-validation + documentation-update | 任何场景，τ_remaining < 20% | 30% |

**禁止折叠**：multi-scenario-adapter、requirement-reader、code-generation（核心生成步骤）。

### Skill Stacking（技能栈叠）

通过 `task_skill.md` 共享上下文，9个原子 skill 之间通过 TSV（垂直互联）传递数据：

| 原子 skill | 从上下文读取 | 输出到上下文 |
|-----------|------------|-------------|
| multi-scenario-adapter | - | `scenario_decision` |
| requirement-reader | - | `requirements_data` |
| requirement-analysis | `requirements_data` | `analyzed_requirements` |
| tech-stack-detection | `requirements_data` + `project_context` | `tech_stack` |
| code-design | `tech_stack` + 需求数据 | `code_spec` |
| code-generation | `code_spec` + `tech_stack` | `generated_code` |
| module-integration | `generated_code` + `code_spec` | `integrated_project` |
| code-validation | `generated_code`/`integrated_project` + `tech_stack` | `validation_result` |
| documentation-update | `validation_result` + `generated_code` | `final_artifacts` |

命中率目标 ≥ 65%。

### Co-Design（协同设计）

Model × Rules × Skills 三层责任分配：
- **requirement-reader**：技能主导（requirements.json 解析）
- **tech-stack-detection**：技能 + 规则主导（文件模式库）
- **code-design**：模型主导 + CODE_STYLE.md 规则检查
- **code-generation**：模型主导 + security-rules 检查
- **code-validation**：Linter 辅助 + 模型评估

### Pattern Mining（模式复用）

内置生成模式库（`.claude/skills/patterns/code-gen-patterns/`）：

| 模式 ID | 模式名称 | 触发条件 | 成熟度 | τ 折扣 |
|---------|---------|---------|--------|--------|
| pattern-cg-001 | Vue3 组件生成 | Vue3 + 单组件 + Element Plus | 成熟 | 70% |
| pattern-cg-002 | React Hook 组件 | React + 函数组件 + useState | 成熟 | 70% |
| pattern-cg-003 | API Handler 生成 | REST API + Express/Koa | 成长 | 40% |
| pattern-cg-004 | TypeScript 类型定义 | TypeScript + 接口定义 | 成长 | 40% |
| pattern-cg-005 | Vue3 列表页生成 | Vue3 + 列表 + 分页 + Element Plus | 试验 | 10% |

匹配成功（相似度 ≥ 0.6）时复用模式，τ 节省 40%~70%。

---

## 4种处理场景

### 场景1：标准输入模式（优先）

**触发条件**：存在 `requirements.json`（由 requirement-generator 生成）

**执行路径**：
```
τ-Control（预算分配）→ multi-scenario-adapter → requirement-reader →
tech-stack-detection → code-design → code-generation →
code-validation → documentation-update
```

**特点**：
- 跳过 requirement-analysis（已在 requirement-generator 完成）
- 技术栈优先从 requirements.json 的 project_context 读取
- 直接复用 api_spec 和 ui_components

### 场景2：简单需求模式

**触发条件**：无 requirements.json，且需求简单（< 50字，单功能点）

**执行路径（含 Task Folding）**：
```
τ-Control → multi-scenario-adapter → requirement-reader →
[折叠 Group A] requirement-analysis + tech-stack-detection →
[折叠 Group B] code-design + code-generation →
[折叠 Group D] code-validation + documentation-update
```

**特点**：
- 快速处理单功能需求（7步 → 5步）
- 跳过 module-integration（单模块）
- Task Folding 自动压缩冗余链路，τ 节省约 35%

**示例**：
- "写一个函数，将 ISO 时间字符串格式化为 YYYY-MM-DD"
- "实现一个 flex 布局的盒子，水平居中"
- "写一个工具函数判断两个数组是否相等"

### 场景3：复杂/多模块需求模式

**触发条件**：无 requirements.json，且需求复杂（> 100字，多功能点或多模块）

**执行路径**：
```
τ-Control → multi-scenario-adapter → requirement-reader →
requirement-analysis → tech-stack-detection → code-design →
code-generation → module-integration → code-validation → documentation-update
```

**特点**：
- 必须执行 requirement-analysis 分析多个功能点
- 必须执行 module-integration 整合多模块
- 可选 Task Folding：Group C（module-integration + code-validation）

**示例**：
- "实现一个会议管理系统，包含创建、列表、详情三个模块"
- "实现用户管理系统，支持登录、注册、权限管理"

### 场景4：复杂需求询问标准化

**触发条件**：检测到复杂需求，询问用户是否需要标准化

**执行路径**：
```
检测复杂需求 → 询问用户
    ├─ 选择"是" → 执行 requirement-generator → code-generator（场景1）
    └─ 选择"否" → code-generator（场景3）
```

---

## τ 效率评分

```
τ_efficiency_score = (完成质量分 × τ 折扣) / (τ_actual / 基准值)

评分标准：
- 优秀（≥ 0.8）：τ 节省且质量高
- 合格（0.5 ~ 0.8）：τ 正常消耗
- 不合格（< 0.5）：τ 超支或质量低
```

---

## 示例用法

### 示例1：简单需求（τ 增强流程）

**用户输入**：
```
帮我实现一个 MeetingCard 组件，显示会议标题、时间、状态，提供加入按钮
```

**v1.3 执行流程（Task Folding）**：
1. τ-Control 分配预算：simple → 总预算 2500
2. multi-scenario-adapter 识别为"简单需求"（场景2）
3. Task Folding 评估：触发 Group A + B + D 折叠
4. 折叠后执行（5步）：
   - requirement-reader → [折叠 Group A] requirement-analysis + tech-stack-detection
   - [折叠 Group B] code-design + code-generation
   - [折叠 Group D] code-validation + documentation-update
5. Pattern Mining：匹配 pattern-cg-001（Vue3 组件，成熟），τ 折扣 70%

**τ 节省**：Group A 25% + Group B 15% + Group D 30% + Pattern 70% ≈ **实际节省 ~45%**

**输出**：
```vue
<!-- MeetingCard.vue -->
<template>
  <div class="meeting-card">
    <h3>{{ meeting.title }}</h3>
    <div class="meeting-time">{{ formatDate(meeting.startTime) }}</div>
    <div class="meeting-status">{{ statusText }}</div>
    <el-button type="primary" @click="handleJoin">加入会议</el-button>
  </div>
</template>
```

---

### 示例2：复杂需求（需要标准化）

**用户输入**：
```
实现一个会议管理系统，包含以下功能：
1. 会议创建：创建会议、设置标题、开始时间、结束时间
2. 会议列表：展示所有会议，支持按状态筛选
3. 会议详情：显示会议详情、编辑、删除、加入会议
```

**v1.3 执行流程**：
1. τ-Control 分配预算：complex → 总预算 15000
2. multi-scenario-adapter 识别为"复杂需求/多模块"（场景3）
3. 用户选择"是" → requirement-generator 生成 requirements.json
4. code-generator 读取 requirements.json（场景1）
5. Pattern Mining：匹配 pattern-cg-005（Vue3 列表页，试验），τ 折扣 10%
6. tech-stack-detection（优先 project_context.json）
7. code-design + code-generation（可折叠 Group B）
8. module-integration + code-validation（可折叠 Group C）
9. documentation-update

**输出**：
```
src/views/meeting/Create.vue      # 会议创建
src/views/meeting/List.vue        # 会议列表
src/views/meeting/Detail.vue      # 会议详情
src/api/meeting.js               # API封装
src/types/meeting.js             # 类型定义
src/router/meeting.js            # 路由配置
src/stores/meeting.js            # 状态管理
```

---

## 技术栈检测

### 优先读取顺序

1. **requirements.json 的 project_context**（最高优先级）
2. **project_context.json**（项目根目录，由 scan-object-info 生成）
3. **扫描项目文件**（兜底）

---

## 9个原子skill

| 序号 | 名称 | τ 权重 | 可折叠 | 核心 | Task Folding 组 |
|------|------|--------|--------|------|---------------|
| 1 | multi-scenario-adapter | 5%~8% | 否 | 是 | 无 |
| 2 | requirement-reader | 5% | 否 | 是 | 无 |
| 3 | requirement-analysis | 15% | 是 | 否 | Group A |
| 4 | tech-stack-detection | 15%~18% | 是 | 是 | Group A |
| 5 | code-design | 18%~20% | 是 | 是 | Group B |
| 6 | code-generation | 22%~30% | 是 | 是 | Group B |
| 7 | module-integration | 10% | 是 | 否 | Group C |
| 8 | code-validation | 5%~12% | 是 | 是 | Group C / D |
| 9 | documentation-update | 5%~10% | 是 | 否 | Group D |

---

## 与其他skill的协作

### 依赖 requirement-generator

当检测到复杂需求时：
1. code-generator 提示用户是否执行 requirement-generator
2. 用户选择"是"后，requirement-generator 生成 requirements.json
3. code-generator 读取 requirements.json 执行场景1

### 依赖 scan-object-info

技术栈检测时：
1. 优先读取 requirements.json 的 project_context
2. 次优先读取 project_context.json（由 scan-object-info 生成）
3. 兜底扫描项目文件

---

## 注意事项

1. **优先使用 requirements.json**：存在时跳过 requirement-analysis，直接复用
2. **技术栈优先从 project_context 读取**：避免重复扫描
3. **智能场景适配**：multi-scenario-adapter 自动选择最优路径
4. **CODE_STYLE.md**：如果项目存在 CODE_STYLE.md，代码生成会严格遵循
5. **多模块整合**：多模块需求必须执行 module-integration 确保一致性
6. **τ 超出时**：优先折叠 documentation-update，禁止折叠 code-design/code-generation
7. **Pattern Matching**：匹配成功后可跳过部分设计步骤，但必须保留代码审查
8. **Skill Stacking**：命中率 < 50% 时应输出优化建议

---

## 版本信息

- **版本**：1.3（τ 增强版）
- **发布日期**：2026-06-04
- **原子skill数量**：9个
- **整合韬定律**：K1 Task Folding、K2 Skill Stacking、K3 Co-Design、K4 Pattern Mining
- **τ 节省目标**：约 30%（通过 Pattern Mining + Task Folding）
- **主要改进**：
  - 整合韬定律，τ 控制、Task Folding、Skill Stacking、Co-Design、Pattern Mining
  - τ 分项预算分配（simple/moderate/complex 三档）
  - Task Folding 任务折叠（4个可折叠组，场景2从7步压缩至5步）
  - Skill Stacking 上下文共享（9个 skill 的 required/output keys，命中率目标≥65%）
  - Co-Design Model×Rules×Skills 责任分配
  - Pattern Mining 生成模式库（成熟模式 τ 折扣 70%）
  - τ 效率评分（优秀/合格/不合格）
  - 输出产物增加 τ 分解报告