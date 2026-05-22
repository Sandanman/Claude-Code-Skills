---
name: code-style-generator
description: 自动检测项目代码规范，生成个人代码习惯文档 CODE_STYLE.md。改进版新增 TypeScript 配置检测、Vue3 Composition API / React Hooks 专项规则、edge case 探测代码和用户反馈优化。
reasoner_instructions: |
  EXECUTE FULL CODE-STYLE-GENERATOR WORKFLOW: detect config rules → scan code patterns → generate probe code (with edge cases) → confirm with user → generate CODE_STYLE.md.
  IMPROVED v1.1: Add TypeScript config detection, framework-specific rules (Vue3 Composition API, React Hooks), better edge case probe code, improved user feedback.
  DO NOT SKIP ANY STEP.
---

# Code Style Generator（代码风格生成器）改进版 v1.1

## 适用场景

用户输入以下类似描述时触发：
- "生成我的代码习惯文档"
- "创建代码风格规范文档"
- "生成 CODE_STYLE.md"
- "检测项目代码规范"

## 改进点（v1.0 -> v1.1）

1. **新增 TypeScript 配置检测**：检测 tsconfig.json 中的 strict/null-checking/moduleResolution 等规则
2. **新增 Vue3 Composition API 专项规则**：`<script setup>`、ref/reactive、computed、watch、composables 命名
3. **新增 React Hooks 专项规则**：useState 泛型、useCallback/useMemo 使用、自定义 hooks 规范
4. **改进 generate-probe-code**：增加 edge case 探测代码（TypeScript 泛型、Vue3 Composition API、React Hooks）
5. **改进 confirm-and-supplement**：优化用户反馈收集，增加 TypeScript 和框架特定问题

## 任务步骤

此主 skill 将生成以下原子任务：

### 步骤1：检测配置文件规范
- **原子 skill**：`detect-config-rules`
- **新增**：读取 tsconfig.json，提取 TypeScript 特有规则

### 步骤2：扫描代码推断规范
- **原子 skill**：`scan-code-patterns`
- **依赖**：步骤1
- **新增**：推断 Vue3 Composition API 规则、React Hooks 规则、TypeScript strict 规则

### 步骤3：生成探测代码片段
- **原子 skill**：`generate-probe-code`
- **依赖**：步骤1、步骤2
- **新增**：TypeScript edge cases、Vue3 Composition API 示例、React Hooks 示例

### 步骤4：用户确认与补充
- **原子 skill**：`confirm-and-supplement`
- **依赖**：步骤3
- **新增**：TypeScript 相关问题、框架特定问题

### 步骤5：生成代码习惯文档
- **原子 skill**：`generate-style-document`
- **依赖**：步骤4
- **新增**：TypeScript 规范章节、Vue3 章节、React Hooks 章节

## 输出结果

所有任务完成后，生成：
- **代码习惯文档**：`CODE_STYLE.md`（项目根目录）

## 执行顺序

```
detect-config-rules → scan-code-patterns
                            ↓
                  generate-probe-code (含 edge cases)
                            ↓
                  confirm-and-supplement (优化反馈收集)
                            ↓
                  generate-style-document
```

## 自动检测规范项（扩展版）

### 配置文件规则
- 缩进（空格/Tab，数量）
- 引号（单引号/双引号）
- 分号（使用/不使用）
- 行长度限制
- 尾逗号（保留/不保留）
- 文件末尾换行符
- **TypeScript 配置**：strict、noImplicitAny、strictNullChecks、esModuleInterop

### 代码推断规则
- HTML/Vue/React 属性引号
- 大括号风格（K&R / Allman）
- 空格规则（if/for/while括号）
- const/let 使用偏好
- 箭头函数风格
- 命名规范（变量、组件、CSS类名）
- **Vue3 Composition API**：ref/reactive/computed/composables 命名规范
- **React Hooks**：useState 泛型、useCallback 规范、自定义 hooks 命名

### 框架特定规则（新增）
- **Vue3**：`script setup` / Options API、composables 目录和命名、`defineProps` 用法
- **React**：Hooks 规范、Props 类型定义、FC vs 函数组件

### 需要用户确认的规则
- 函数空行规则（同模块/异模块）
- 业务模块分割注释格式
- 条件渲染偏好（三元 / &&）
- 列表渲染返回方式
- 注释风格（JSDoc / 简洁）
- 调试代码保留规则
- **TypeScript**：类型导出策略、泛型约束偏好
- **Vue3**：composables 抽离时机、ref vs reactive 选择
- **React**：useEffect 依赖数组风格、状态 co-locate 策略