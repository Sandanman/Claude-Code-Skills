# scan-object-info 解读报告

> 解读日期：2026-06-05
> Skill 版本：v1.2
> 分析者：Claude Code Skill Analyzer
> 报告生成时间：2026-06-05 15:06:46

---

## 1. 功能说明

### 1.1 核心功能

智能扫描前端项目的技术栈信息（框架、UI库、状态管理、请求方案、路由方案等），基于华为韬定律的 K1-K4 四项优化实现 τ 节省 33%，是整个 Skill 系统的**感知入口**——其他 Skill 通过它读取的上下文来决定如何工作。

### 1.2 解决问题

| 问题 | 无 Skill | scan-object-info |
|------|---------|----------------|
| 需要手动查看配置文件 | 逐个打开 package.json、vite.config、.env | 自动扫描 + 结构化输出 |
| 重复检测相同项目 | 每次都重新全量扫描 | Pattern Mining 命中后跳过重复扫描（τ×0.3）|
| 各 Skill 重复读相同文件 | orchestrator-pro、code-optimizer 各读各的 | Skill Stacking 共享上下文，一次读取多方复用 |
| 技术栈识别不准确 | 人工判断，主观误差 | 置信度标注（high/medium/low）|

### 1.3 触发条件

- 项目分析、技术栈检测、框架识别
- 环境变量配置扫描
- 请求方案 / 路由方案检测
- 样式方案（Tailwind/CSS Modules/SCSS）检测
- 新项目初始化前的基础信息获取
- **下游 Skill（code-optimizer、code-generator 等）自动调用获取上下文**

### 1.4 核心能力

| 能力 | 原子技能 | τ | 并行组 | 角色 |
|------|---------|---|--------|------|
| 项目模式匹配（快速判断）| pattern-matcher | 150 | 0（预处理）| 入口 |
| package.json 解析 | scan-package-json | 200 | 1（并行）| 基础 |
| 目录结构扫描 | scan-project-structure | 300 | 1（并行）| 基础 |
| 配置+环境变量扫描 | scan-config-context | 400 | 1（并行）| 基础 |
| 框架+UI库+状态管理检测 | detect-tech-stack | 600 | 2（并行）| 核心 |
| 请求方案+路由检测 | detect-net-router | 500 | 2（并行）| 核心 |
| 共享上下文写入 | skill-stack-context | 50 | 任意（最后）| 强制 |

**τ 预算阈值**：simple=5000 / moderate=15000 / complex=50000
**预警**：80% warning / 95% critical / 100% abort

---

## 2. 执行流程

### 2.1 执行管道（并行优化）

```
pattern-matcher（预处理，τ=150）
   │
   ├─ [命中成熟模式] → 跳过并行组1+2，直接复用 → skill-stack-context（τ=50）
   │
   └─ [未命中模式]
       ├─ 并行组1（依赖预处理结果）
       │   scan-package-json（τ=200）
       │   scan-project-structure（τ=300）
       │   scan-config-context（τ=400）
       │   并行耗时 ≈ max(200,300,400) = 400
       ├─ 并行组2（依赖组1输出）
       │   detect-tech-stack（τ=600）
       │   detect-net-router（τ=500）
       │   并行耗时 ≈ max(600,500) = 600
       └─ skill-stack-context（汇总写入，τ=50）
```

### 2.2 原子技能依赖关系

| 原子技能 | τ | 依赖 | 并行组 |
|---------|---|------|--------|
| pattern-matcher | 150 | 无（预处理）| 0 |
| scan-package-json | 200 | pattern-matcher | 1 |
| scan-project-structure | 300 | pattern-matcher | 1 |
| scan-config-context | 400 | pattern-matcher | 1 |
| detect-tech-stack | 600 | 并行组1 | 2 |
| detect-net-router | 500 | 并行组1 | 2 |
| skill-stack-context | 50 | 所有技能后（强制）| 任意 |

**τ 估算**：全量执行 2200 / 命中成熟模式 200（节省 91%）

### 2.3 τ 控制机制

| K | 机制 |
|---|------|
| K1 Task Folding | 9→7 技能合并，τ_exec 节省 |
| K2 Skill Stacking | 命中率 < 50% 警告，skill-stack-context 强制执行 |
| K3 Co-Design | τ_remaining < 30% 时强制规则路径 |
| K4 Pattern Mining | 成熟模式 τ 折扣 70%，增量扫描 |

---

## 3. 最终输出结果

### 3.1 产物类型

| 产物 | 格式 | 说明 |
|------|------|------|
| 项目摘要 | Markdown | 综合 detect-tech-stack + config + net-router |
| τ 执行报告 | Markdown | 消耗、预算、节省量、命中率 |
| 技术栈详情 | Markdown（带置信度）| 框架/UI库/状态管理/TS/渲染模式 |
| 配置文件清单 | Markdown | 文件名、用途、关键配置项 |
| 环境变量清单 | Markdown | 键名、用途、是否敏感 |
| 共享上下文 | task_skill.md | Skill Stacking 通道，下游复用 |

### 3.2 智能裁剪（按需调用）

| 用户意图 | 触发技能 | 输出范围 |
|---------|---------|---------|
| 技术栈分析 | pattern + package + detect-tech | 1+4 |
| 路由检测 | pattern + package + detect-net | 1+5 |
| 环境变量 | scan-config-context | 3 |
| 全面分析 | 全部 7 个技能 | 完整报告 |

### 3.3 输出位置

- **对话输出**：结构化 Markdown 报告
- **持久化**：`tasks/current/task_skill.md`（Skill Stacking 共享上下文）

---

## 4. 架构设计与思维方式

### 4.1 架构模式

**预处理 + 双并行组 + 强制汇总**

```
预处理（pattern-matcher）→ 并行组1（基础扫描）→ 并行组2（深度检测）→ skill-stack-context（强制）
```

选择此架构的原因：
- pattern-matcher（τ=150）是零成本预检，命中直接跳过两组并行扫描，节省 91% τ
- 两层并行：组1输出是组2前置条件，组1内部三技能彼此独立可并行
- skill-stack-context 强制末级保证下游 Skill 一定能读到上下文

### 4.2 设计原则

| 原则 | 体现 |
|------|------|
| 渐进式深度 | pattern-matcher 快速预判，命中跳过，未命中才深入 |
| K2 强制写入 | FORBIDDEN 规则禁止跳过 skill-stack-context |
| 置信度标注 | 每个结果必须标注 high/medium/low |
| 按需裁剪 | 智能裁剪表支持只执行必要的技能 |
| 输出精简 | 禁止冗余描述（强约束第 7 条）|

### 4.3 τ 增强设计（四维全面整合）

| K | 设计 | 具体机制 |
|---|------|---------|
| **K1 Task Folding** | 9→7 技能合并 | detect_framework+UI+state → detect-tech-stack；scan_config+env → scan-config-context |
| **K2 Skill Stacking** | 共享上下文强制写入 | skill-stack-context τ=50，FORBIDDEN 禁止跳过，< 50% 命中率触发警告 |
| **K3 Co-Design** | 规则+LLM 决策矩阵 | 8个环节的 Model/Rules 分配比例明确，τ<30% 强制规则路径 |
| **K4 Pattern Mining** | 5 种项目类型模式库 | 成熟模式 τ 折扣 70%，命中后跳过重复扫描，增量更新 |

**Pattern Library**（5 种模式）：

| 模式 | τ 折扣 | 成熟度 |
|------|--------|--------|
| vue3-element-plus | τ×0.3 | 成熟 |
| react-antd | τ×0.3 | 成熟 |
| vite-vue3 | τ×0.3 | 成熟 |
| next-app-router | τ×0.6 | 成长 |
| nuxt3 | τ×0.6 | 成长 |

### 4.4 思维方式推断

**① 感知即基础设施**：scan-object-info 的本质不是"给用户看的报告"，而是**下游 Skill 的感知层**。主要价值通过 `task_skill.md` 传递给 code-optimizer、code-generator。

**② 最小成本获取最多信息**：pattern-matcher（τ=150）是架构精髓——零成本预判，命中跳过全量扫描，未命中才走完整流程。"快速失败"思想的量化实现。

**③ 置信度即透明度**：不隐藏不确定性，每个结果标注 high/medium/low，让下游 Skill 按置信度决策。

**④ 强制胜于自愿**：K2 Skill Stacking 通过 FORBIDDEN 规则强制上下文写入，用规则堵住"开发者会偷懒跳过"的漏洞。

---

## 5. 这样做的好处

1. **τ 节省量化**：命中模式节省 91%（2200→200），全量执行节省 33%
2. **Pattern Mining 快速通道**：已知项目跳过 5 个技能，直接复用上下文
3. **Skill Stacking 消除重复读取**：package.json 只需读取一次，被 5 个原子技能共享
4. **下游 Skill 复用**：code-optimizer 等无需重新扫描，直接读取上下文
5. **置信度透明**：high/medium/low 让下游 Skill 按置信度决策
6. **智能裁剪实用**：用户只问路由就只输出路由，τ 节省

---

## 6. 优缺点分析

### 6.1 优点
- K1-K4 四维 τ 优化全面落地，有具体折叠规则、折扣机制、决策矩阵
- Pattern Library 可热扩展：新增模式只需在 `patterns/` 下添加 `pattern.md`
- 智能裁剪实用：按需调用，实际 τ 消耗远低于理论值
- K2 强制机制完善：FORBIDDEN 规则确保上下文写入不遗漏
- 置信度体系完整：high/medium/low 覆盖所有检测结果

### 6.2 缺点/限制
- Pattern Library 仅覆盖 5 种前端模式，Node.js、后端、小众框架未覆盖
- 并行组 1→2 依赖关系隐式，实现需严格遵守
- skill-stack-context 每次强制执行（τ 预算紧张时也执行）
- 未命中模式时全量执行仍较慢（τ=2200）

### 6.3 适用场景
- 新项目接入 Skill 系统时的初始化扫描
- code-optimizer、code-generator 等下游 Skill 执行前的上下文获取
- 技术栈审计、依赖合规检查
- pattern-matcher 独立使用快速判断项目类型

### 6.4 不适用场景
- 非常见框架项目（Pattern Library 未覆盖，可能低置信度）
- 需要实时检测代码逻辑的场景（只扫描配置文件，不分析源码）
- 离线环境

---

## 7. 使用建议

| 类别 | 建议 |
|------|------|
| 最佳实践 | 新项目先跑 pattern-matcher 快速判断；全量扫描前确认 τ 预算充足；定期扩展 Pattern Library |
| 注意事项 | K2 强制写入不可跳过；低置信度结果需人工确认；并行组 1→2 顺序不可颠倒 |
| 扩展方向 | Pattern Library 扩展到 Node.js/后端；pattern-matcher 支持自定义正则；增量扫描支持（只检测变化文件）|

---

*报告生成时间：2026-06-05 15:06:46*