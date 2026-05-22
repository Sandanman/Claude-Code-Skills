# Code Optimizer

系统化地优化代码，基于代码质量分析和性能分析识别改进点，提供可执行的优化方案，并应用修改以提升代码质量、性能和可维护性。

## 快速开始

### 触发方式
当用户请求代码优化时自动触发：

```
用户: "优化 src/components/MeetingCard.vue，减少复杂度，提高渲染性能"
```

### 执行命令
Claude Code 将按以下7步管道自动执行：

```
code-quality-analysis → pattern-recognition → performance-analysis
    → improvement-suggestion → code-refactoring
    → optimization-verification → documentation-update
```

---

## 文件结构

```
code-optimizer/
├── SKILL.md                         # 主skill定义（入口）
├── README.md                        # 本文件
└── atomic-skills/
    ├── code-quality-analysis/      # 静态代码质量分析
    │   └── SKILL.md
    ├── pattern-recognition/        # 识别可优化代码模式
    │   └── SKILL.md
    ├── performance-analysis/       # 分析性能瓶颈 [NEW]
    │   └── SKILL.md
    ├── improvement-suggestion/      # 生成优化建议
    │   └── SKILL.md
    ├── code-refactoring/           # 应用代码修改
    │   └── SKILL.md
    ├── optimization-verification/   # 验证优化效果
    │   └── SKILL.md
    └── documentation-update/        # 更新文档
        └── SKILL.md
```

---

## 质量指标体系

### 代码质量指标
| 指标 | 当前值 | 目标值 | 状态 |
|------|--------|--------|------|
| 圈复杂度 | - | < 15 | - |
| 认知复杂度 | - | < 10 | - |
| 重复代码率 | - | < 5% | - |
| 代码行数（函数） | - | < 50行 | - |
| 代码行数（文件） | - | < 300行 | - |
| 异味数量 | - | < 5 | - |

### 性能指标
| 指标 | 目标改善 |
|------|----------|
| 渲染时间 | 降低 >= 20% |
| 内存占用 | 降低 >= 10% |
| 重渲染次数 | 减少 >= 15% |
| 计算复杂度 | 关键函数优化 |
| bundle大小 | 减少 >= 5%（如有）|

---

## 优化方案分级

每个优化问题提供3个方案供选择：

| 方案 | 特点 | 适用场景 |
|------|------|----------|
| 激进优化 | 性能最优，可能有破坏性改动 | 需要极致性能、对测试覆盖有信心时 |
| 折中优化 | 平衡性能和稳定性 | 大多数场景首选 |
| 保守优化 | 最小改动、风险最低 | 需要快速修复、暂时无法大规模重构时 |

---

## 使用示例

### 输入
```
优化 src/components/MeetingCard.vue，减少复杂度，提高渲染性能
```

### 执行流程

**Step 1: code-quality-analysis**
- 分析 MeetingCard.vue 的复杂度指标
- 检测重复代码、代码异味、安全风险
- 输出：质量分析报告（5个以上质量点）

**Step 2: pattern-recognition**
- 识别可优化模式（大函数、重复逻辑、嵌套过深）
- 定位具体代码行和影响范围
- 输出：模式识别报告（3种以上模式）

**Step 3: performance-analysis**
- 分析渲染性能瓶颈（重渲染、DOM操作）
- 检测计算效率问题（重复计算、大列表）
- 识别内存泄漏风险（事件监听、定时器）
- 输出：性能瓶颈报告（3个以上瓶颈）

**Step 4: improvement-suggestion**
- 基于模式识别 + 性能分析双维度
- 为每个问题生成3个优化方案（激进/折中/保守）
- 输出：优化建议报告（含diff代码修改）

**Step 5: code-refactoring**
- 应用用户选择的优化方案
- 生成修改后的代码（保留备份）
- 输出：重构后的代码 + diff对比

**Step 6: optimization-verification**
- 验证功能正确性（单元测试、集成测试）
- 对比性能指标（渲染时间、内存占用）
- 确认质量指标改善（圈复杂度、重复率）
- 输出：验证报告（全部指标达标）

**Step 7: documentation-update**
- 更新组件注释和JSDoc
- 更新README使用说明
- 更新API文档（如有）
- 输出：文档更新清单

### 输出产物
- 优化后的代码文件
- 质量分析报告 + 性能分析报告
- 代码diff对比
- 验证报告
- 更新后的文档

---

## 注意事项

1. **功能优先**：始终优先保证功能正确性，其次才是优化
2. **多方案选择**：提供多个优化方案，让用户根据实际情况选择
3. **性能+质量双维度**：improvement-suggestion 同时参考 pattern-recognition 和 performance-analysis 的结果
4. **并行执行**：pattern-recognition 和 performance-analysis 可并行执行（都依赖 code-quality-analysis）
5. **备份回滚**：优化前自动备份原始代码，支持回滚
6. **增量优化**：支持分步优化，每次只优化部分问题