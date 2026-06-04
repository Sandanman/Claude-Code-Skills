---
name: code-style-generator
description: 自动检测项目代码规范，生成个人代码习惯文档 CODE_STYLE.md。v1.2 整合韬理论（τ 控制、任务折叠、技能栈叠、模式复用、协同设计），改进 TypeScript/Vue3/React 检测。
reasoner_instructions: |
  EXECUTE FULL CODE-STYLE-GENERATOR WORKFLOW: detect-and-scan → generate-and-confirm → generate-style-document.
  v1.2 基于韬理论：K1任务折叠、K2技能栈叠、K3协同设计、K4模式复用、τ预算管理。
  DO NOT SKIP ANY STEP.
---

# Code Style Generator（代码风格生成器）v1.2 韬理论增强版

## 概述

本主 skill 自动检测项目代码规范，生成个人代码习惯文档 `CODE_STYLE.md`。**v1.2 整合华为韬定律四大核心（K1任务折叠、K2技能栈叠、K3协同设计、K4模式复用），实现 τ 压缩与检测效率最大化。**

## 核心理念

### 韬理论四大映射

| 华为韬定律 | AI Agent 映射 | code-style-generator 落地 |
|-----------|--------------|---------------------------|
| **K1 逻辑折叠** | 任务折叠（Task Folding） | 5原子skill压缩为3，合并文件读取任务 |
| **K2 三维堆叠** | 技能栈叠（Skill Stacking） | 强制上下文共享，下游skill τ 减少 |
| **K3 软硬协同** | 模型×规则协同（Co-Design） | 简单文件类型检测规则接管，省τ |
| **K4 成熟制程** | 模式复用（Pattern Mining） | 已有CODE_STYLE.md直接复用，τ→0 |

### τ（时间常数）公式

```
τ_style = τ_detect_scan + τ_generate_confirm + τ_doc

性能 = f(文档质量) / τ_style
目标：τ 最小化，质量不降
```

## v1.2 改进（基于韬理论）

1. **K1 任务折叠**：5个原子skill → 压缩为3个（τ减少~40%）
   - `detect-config-rules` + `scan-code-patterns` → 合并为 `detect-and-scan`
   - `generate-probe-code` + `confirm-and-supplement` → 合并为 `generate-and-confirm`
2. **K2 技能栈叠**：所有skill输出强制写入共享上下文 `task_skill.md`，下游skill优先读取
3. **K3 协同设计**：简单文件类型检测（.vue/.tsx/.ts）由规则直接判断，不消耗模型τ
4. **K4 模式复用**：如果 `CODE_STYLE.md` 已存在，查询模式库相似度，成熟模式 τ 折扣70%
5. **τ 预算管理**：分级预算（simple/moderate/complex），超预算触发折叠或降级
6. **质量扩展**：增加 feasibility_score（技术可行性）和 pattern_matching_result（模式匹配结果）

## 核心能力
- 检测项目配置文件（.editorconfig、.prettierrc、eslint、tsconfig）
- 扫描代码推断规范（含 TypeScript、Vue3 Composition API、React Hooks）
- **K1折叠**：配置检测 + 代码扫描一体化执行
- **K3协同**：框架类型检测规则接管，不消耗模型τ
- **K4模式**：已有CODE_STYLE.md时复用模式，τ大幅降低
- 生成探测代码片段（含 edge cases）
- 用户确认与补充（分批次提问）
- 生成标准化 CODE_STYLE.md 文档（含质量报告）

## 执行流程（v1.2 - 3原子skill）

```
detect-and-scan（折叠合并 config + scan）
         ↓
generate-and-confirm（折叠合并 probe + confirm）
         ↓
generate-style-document
```

## τ 预算分级（v1.2）

| 复杂度 | 总预算 | detect-scan | generate-confirm | doc |
|--------|--------|-------------|-----------------|-----|
| simple | 3000 | 800 | 1200 | 1000 |
| moderate | 6000 | 1500 | 2500 | 2000 |
| complex | 10000 | 2500 | 4000 | 3500 |

**总τ预算**：simple=3000 / moderate=6000 / complex=10000

## 原子skill依赖关系（v1.2 - 3个）

| 原子skill | K层级 | τ预算(simple) | τ预算(moderate) | τ预算(complex) | 依赖 |
|-----------|------|--------------|----------------|----------------|------|
| detect-and-scan | K1折叠+K3协同 | 800 | 1500 | 2500 | 无 |
| generate-and-confirm | K1折叠+K3协同 | 1200 | 2500 | 4000 | detect-scan |
| generate-style-document | K2栈叠 | 1000 | 2000 | 3500 | 所有前置 |

## τ 控制规则（v1.2 新增）

### τ 折叠触发规则
- **fold-001**：τ_remaining < 30% 且 深度 > 2 时，强制折叠可选步骤
- **fold-002**：已存在 CODE_STYLE.md 时，跳过 detect-scan，直接进入 generate-confirm（K4复用）
- **fold-003**：用户明确要求的检测步骤不可折叠
- **fold-004**：超过2层折叠深度后禁止继续折叠

### τ 预警规则
- **τ-010**：τ消耗 > 80% 总预算时，触发 warning 预警
- **τ-011**：τ消耗 > 95% 总预算时，跳过所有可选步骤
- **τ-012**：τ消耗 > 100% 时，强制终止非核心步骤

### K2 技能栈叠规则
- **stack-001**：每个原子skill执行完成后，必须将输出写入共享上下文 `task_skill.md`
- **stack-002**：下游skill必须优先从共享上下文读取
- **stack-003**：共享上下文命中率 < 50% 时，触发堆叠效率警告
- **stack-004**：层间通信优先级：共享上下文 > 重新读取文件

### K3 协同设计规则
- **codesign-001**：框架类型检测（Vue/React）由规则直接判断（省模型τ）
- **codesign-002**：配置文件存在性检测由规则直接判断
- **codesign-003**：简单格式化规则（indent/semi/quotes）从配置文件直接读取，不消耗模型τ

### K4 模式复用规则
- **pattern-001**：启动时查询模式库，检测是否已有相似 CODE_STYLE.md
- **pattern-002**：相似度 >= 0.6 时复用已有模式，成熟模式 τ 折扣 70%
- **pattern-003**：复用率 = 已匹配模式数 / 总检测项数，< 30% 时触发新模式挖掘

## 重试规则（v1.2）
- 每个原子skill失败后可重试 **3次**
- generate-and-confirm 发现用户不配合时，降级为自动模式（最多2次）
- 如果 CODE_STYLE.md 已存在且质量高（similarity >= 0.8），直接复用

## 主skill完成标准（v1.2）
1. 配置文件规范已检测（含 tsconfig.json）
2. 代码规范已推断（含 Vue3/React Hooks/TS）
3. 探测代码已生成（含 edge cases）
4. 用户已确认规则（含框架特定规则）
5. CODE_STYLE.md 已生成
6. **τ 消耗报告已生成**（各步骤 τ 分解，与预算对比）
7. **模式匹配结果已记录**（matched_patterns / reuse_rate）
8. 所有原子skill日志完整记录（含 τ 消耗）

## 输出产物
1. **CODE_STYLE.md**：项目根目录下的标准化代码习惯文档
2. **τ 分解报告**：各步骤 τ 消耗与预算对比
3. **pattern 匹配结果**：模式库匹配情况

## CODE_STYLE.md 格式（v1.2）

```json
{
  "version": "1.2",
  "generated_at": "2026-06-04T10:00:00Z",
  "tau": {
    "complexity": "moderate",
    "total_budget": 6000,
    "total_consumed": 5180,
    "remaining": 820,
    "budget_utilization": 0.863,
    "folding_applied": false,
    "pattern_reused": true,
    "breakdown": {
      "detect_scan": 1380,
      "generate_confirm": 2400,
      "doc": 1400
    },
    "folding_notes": ["已存在相似CODE_STYLE.md，跳过detect-scan"]
  },
  "pattern": {
    "matched_patterns": [
      { "name": "vue3-ts-standard", "maturity": "mature", "frequency": 8, "tau_discount": 0.7, "similarity": 0.85 }
    ],
    "reuse_rate": 0.65,
    "tau_saved": 1500
  },
  "framework_detected": "vue3",
  "configRules": { ... },
  "inferredRules": { ... },
  "confirmedRules": { ... },
  "ruleSources": { ... },
  "quality": {
    "overall_score": 92,
    "completeness_score": 95,
    "consistency_score": 90,
    "feasibility_score": 88,
    "issues": [],
    "recommendations": []
  }
}
```

## 注意事项
- 所有检测基于读取文件，不修改任何源代码
- 不预设任何框架，框架类型由规则+代码推断共同决定
- CODE_STYLE.md 默认生成在项目根目录
- **K2 强制**：所有skill输出必须写入共享上下文
- τ 优先：效率可略有牺牲（≥80%），τ 超支不可接受

## 文件系统位置
- 主skill路径：./.claude/skills/code-style-generator/SKILL.md
- 原子skill路径：./.claude/skills/code-style-generator/atomic-skills/下各子目录
- 共享上下文：./.claude/skills/tasks/current/task_skill.md
- 模式库：./.claude/skills/patterns/style-patterns/（v1.2 新增）

## 版本
版本：1.2（韬理论增强版）
主skill名称：code-style-generator
状态：启用
核心改进：K1任务折叠(5→3原子skill) + K2技能栈叠 + K3协同设计 + K4模式复用 + τ预算管理