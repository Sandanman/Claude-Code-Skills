# Code Optimizer

## 定位

Code Optimizer 通过七个原子 Skill 处理代码质量、冗余、性能和可维护性优化。流程遵循“先分析、再提案、确认后修改、最后验证和更新文档”，默认不会直接写入代码。

## 文件树

```text
code-optimizer/
├── SKILL.md
├── README.md
└── atomic-skills/
    ├── quality-and-perf-analysis/SKILL.md
    ├── redundancy-check/SKILL.md
    ├── pattern-and-benchmark-recognition/SKILL.md
    ├── optimization-proposal/SKILL.md
    ├── code-optimization/SKILL.md
    ├── optimization-verification/SKILL.md
    └── documentation-update/SKILL.md
```

## 流程与 DAG

```text
quality-and-perf-analysis ─┐
                           ├─> pattern-and-benchmark-recognition
redundancy-check ──────────┘              │
                                          v
                              optimization-proposal
                                          │
                                          v
                                code-optimization
                                          │
                                          v
                              optimization-verification
                                          │
                                          v
                                documentation-update
```

前两个分析 Skill 并行执行；模式识别和基准配置在上游完成后并行；方案、应用、验证和文档按顺序执行。阶段结果写入 `.claude/skills/tasks/current/task_skill.md` 作为共享上下文，默认输出目录为 `.claude/outputs/code-optimizer/`（项目已有约定时遵循项目约定）。

## 快速开始

### 输入示例

```text
优化 src/components/MeetingCard.vue，减少重复逻辑并改善渲染性能。
请先给出方案，确认后再修改。
```

### 执行步骤

1. 读取目标范围和项目命令，建立质量、冗余和性能基线。
2. 并行识别重复代码、死代码、复杂度、代码异味、安全风险和性能瓶颈。
3. 生成包含影响范围、风险、收益和验证方式的优化方案。
4. 等待用户确认方案；确认后应用代码和必要的构建配置变更。
5. 使用相同条件执行语法、类型、构建、功能回归和性能验证。
6. 仅更新与实际变更相关的注释、README 或 API 文档。

### 输出示例

```text
分析报告：src/components/MeetingCard.vue:45-48 存在重复日期格式化，严重级别 medium。
方案：提取共享 formatter 并使用 computed 缓存，预期减少重复计算；风险为低。
请确认后应用该方案。

确认后：
- 变更：src/components/MeetingCard.vue
- 验证：npm run lint 通过；npm run build 通过；性能未实测
- 结论：PARTIAL（质量验证通过，缺少可复现性能环境）
```

## 输入和输出

输入至少包含目标文件、目录或页面路径；可选提供优化目标、测试/构建命令和性能场景。输出必须包含：

- 质量、冗余和性能分析报告
- Before 基线和基准配置
- 经确认的优化方案及实际变更清单
- 测试命令、真实结果和 Before/After 对比
- 文档更新清单及跳过原因

没有实测数据时必须写明“未实测”，不得填入示例指标。未声明的输出路径不得出现在报告中。

## 注意事项

- 功能正确性和安全性优先于指标改善。
- 默认只分析不修改；应用方案前必须获得用户确认。
- 备份和回滚仅是用户确认后的可选机制，不自动创建或执行。
- 性能工具不可用时可以降级为静态分析，但必须标记降级状态。
- 不修改 `.claude/skills/code-generator/` 或目标范围以外的目录。
- 失败阶段记录原因并暂停依赖它的下游阶段，不伪造成功结果。
