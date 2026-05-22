---
name: code-optimizer
description: 系统化地优化代码，基于代码质量分析和性能分析识别改进点，提供可执行的优化方案，并应用修改以提升代码质量、性能和可维护性。当用户请求代码优化时自动触发
---

# Code Optimizer 主Skill

## 概述
本主skill用于系统化地优化代码，基于代码质量分析和性能分析识别改进点，提供可执行的优化方案，并应用修改以提升代码质量、性能和可维护性。

## 核心理念
- 数据驱动的质量分析与性能分析
- 渐进式的优化方案（提供多个选项）
- 确保功能正确性优先
- 保持代码可编译/可运行
- 文档与代码同步更新

## 核心能力
- 静态代码质量分析
- 性能瓶颈识别与分析
- 代码模式识别与优化建议
- 自动化代码重构
- 优化效果验证
- 文档维护

## 执行流程（7步管道）

```
┌─────────────────────┐
│  1. code-quality-   │ ← 无依赖
│      analysis       │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  2. pattern-        │ ← 依赖 code-quality-analysis
│      recognition    │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  3. performance-    │ ← 依赖 code-quality-analysis
│      analysis       │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  4. improvement-   │ ← 依赖 pattern-recognition
│      suggestion     │   AND performance-analysis
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  5. code-           │ ← 依赖 improvement-suggestion
│      refactoring    │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  6. optimization-   │ ← 依赖 code-refactoring
│      verification   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  7. documentation-  │ ← 依赖 optimization-verification
│      update         │
└─────────────────────┘
```

## 原子skill依赖关系
- **code-quality-analysis**: 无依赖
- **pattern-recognition**: 依赖 code-quality-analysis
- **performance-analysis**: 依赖 code-quality-analysis
- **improvement-suggestion**: 依赖 pattern-recognition AND performance-analysis（两个都完成才能执行）
- **code-refactoring**: 依赖 improvement-suggestion
- **optimization-verification**: 依赖 code-refactoring
- **documentation-update**: 依赖 optimization-verification

## 主skill完成标准（7项）
1. 代码质量分析完成，问题清单完整（包含复杂度、重复代码、代码异味、安全漏洞）
2. 性能分析完成，瓶颈定位准确（包含渲染性能、执行效率、内存占用）
3. 优化方案明确，至少提供3个可选策略（优/良/保底）
4. 修改后的代码已生成且功能正确，通过编译/运行测试
5. 优化效果已验证（性能提升、复杂度降低、质量指标改善）
6. 相关文档已更新（注释、README、API文档）
7. 所有原子skill日志完整记录

## 重试规则
- 每个原子skill失败后可重试 **3次**
- code-refactoring 失败会影响后续执行，暂停任务等待用户确认
- optimization-verification 发现修复不完整时，可返回 code-refactoring 阶段重新优化（最多循环 **2次**）

## 针对不同代码类型的处理

### Vue/React 组件
- 检查组件拆分合理性
- 验证计算属性和缓存优化
- 优化渲染性能和响应式依赖
- 分析虚拟DOM重渲染次数

### JavaScript/TypeScript
- 减少循环嵌套复杂度
- 消除重复逻辑
- 优化算法时间复杂度
- 改进类型安全性

### 配置文件
- 简化冗余配置
- 统一配置格式
- 移除未使用的配置项

## 质量指标体系

### 代码质量指标
- **圈复杂度**：目标 < 15
- **重复代码率**：目标 < 5%
- **代码行数**：函数 < 50行，文件 < 300行
- **认知复杂度**：目标 < 10
- **测试覆盖率**：保持或提升

### 性能指标
- **渲染时间**：组件渲染时间降低 >= 20%
- **内存占用**：内存占用降低 >= 10%
- **计算复杂度**：关键函数时间复杂度降低
- **重渲染次数**：组件重渲染次数减少 >= 15%
- **bundle大小**：如有打包优化，体积减少 >= 5%

## 使用示例
用户输入："优化 src/components/MeetingCard.vue，减少复杂度，提高渲染性能"

执行流程：
1. code-quality-analysis 分析 Vue 组件，识别复杂度指标
2. pattern-recognition 提取模式（低效计算、冗余监听、大组件）
3. performance-analysis 分析性能瓶颈（渲染性能、计算效率）
4. improvement-suggestion 基于质量+性能双维度提供拆分、缓存、虚拟化等多种方案
5. code-refactoring 应用选中方案，生成优化代码
6. optimization-verification 验证渲染性能、功能正确性
7. documentation-update 更新组件注释和使用说明

## 触发关键词
- "优化代码"
- "重构这段代码"
- "更好的实现方式"
- "性能优化"
- "提高代码质量"
- "改进这个函数"
- "简化这段代码"
- "消除代码重复"
- "优化性能"
- "代码重构"
- "提升渲染性能"
- "减少卡顿"

## 注意事项
- 始终优先保证功能正确性，其次才是优化
- 提供多个优化方案让用户选择（激进/保守/折中）
- 优化后必须验证功能完整性
- 更新文档以反映代码变更
- 保留原始代码备份以便回滚
- performance-analysis 与 pattern-recognition 可并行执行（都依赖 code-quality-analysis）

## 文件系统位置
- 主skill路径：./.claude/skills/code-optimizer/SKILL.md
- 原子skill路径：./.claude/skills/code-optimizer/atomic-skills/下各子目录

## 支持的文件类型
- Vue/React 组件 (.vue, .jsx, .tsx)
- JavaScript/TypeScript (.js, .ts)
- 配置文件（.js, .ts, .json, .config.js）
- 工具函数模块

## 递归处理
如果目标文件/目录包含子模块：
- 会分析所有相关文件
- 可能拆分大文件为多个小文件
- 保持模块化设计原则

## 输出产物
- 优化后的代码（覆盖原文件或生成新版本）
- 质量分析报告 + 性能分析报告
- 优化对比（diff格式）
- 验证报告
- 更新后的文档

## 版权和许可证
优化过程中尊重原始许可证，不改变代码许可证类型。

---

## 原子skill详细定义

### 1. code-quality-analysis
**能力**：静态分析代码，识别质量指标  
**输入**：目标代码文件路径  
**输出**：质量报告（复杂度、重复率、异味数量、安全风险）  
**完成标准**：至少识别出5个质量点，按优先级排序

### 2. pattern-recognition
**能力**：识别可优化的代码模式  
**输入**：质量分析报告  
**输出**：模式列表（ inefficient algorithm, redundant logic, bad practice）  
**完成标准**：识别至少3种模式，每个模式有具体位置

### 3. performance-analysis
**能力**：分析性能瓶颈和渲染问题  
**输入**：质量分析报告 + 目标代码  
**输出**：性能瓶颈报告（渲染性能、执行效率、内存问题）  
**完成标准**：识别至少3个性能瓶颈，包含具体代码位置和优化建议

### 4. improvement-suggestion
**能力**：提供具体的重构建议和优化方案  
**输入**：模式识别报告 + 性能分析报告  
**输出**：建议文档（至少3个方案：激进、保守、折中）  
**完成标准**：每个方案包含具体修改步骤和预期收益

### 5. code-refactoring
**能力**：应用优化方案，修改代码  
**输入**：选择的优化方案  
**输出**：修改后的代码（diff格式）  
**完成标准**：代码可编译/运行，无语法错误

### 6. optimization-verification
**能力**：验证优化效果和功能正确性  
**输入**：修改后的代码  
**输出**：验证报告（性能对比、功能测试结果）  
**完成标准**：至少2项质量指标改善 + 至少2项性能指标改善，功能测试100%通过

### 7. documentation-update
**能力**：更新相关文档以反映代码变更  
**输入**：优化后的代码和变更说明  
**输出**：文档更新清单  
**完成标准**：所有公共API、组件、重要函数都更新了文档

---

版本：1.2（改进版）
主skill名称：code-optimizer
状态：启用