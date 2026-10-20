# git-assistant 解读报告

> 解读日期：2026-06-05
> Skill 版本：v1.2
> 分析者：Claude Code Skill Analyzer

---

## 1. 功能说明

### 1.1 核心功能

用自然语言驱动 Git 操作，用流程优化理念（资源量）选择最小、最必要的原子技能组合，在保证正确性的前提下最大化执行效率。不是简单的命令封装，而是**意图理解 → 技能路由 → 执行 → 验证 → 执行报告**的完整管道。

### 1.2 解决问题

| 问题 | 无 Skill | git-assistant |
|------|---------|--------------|
| 需要记忆命令 | 查文档/Google | 直接说自然语言 |
| commit message 不规范 | 手动写易出错 | 自动生成+验证+评分 |
| 处理成本不可控 | 全量调用 | 最小组合节省 50-70% |

### 1.3 触发条件

任一关键词即触发（即使没说"git"）：

```
提交 | commit | 分支 | branch | 冲突 | conflict | stash
历史 | history | blame | tag | 版本 | merge | rebase
规范检查 | conventional commits | 分支健康 | 过期分支 | semver
```

### 1.4 核心能力

| 能力 | 原子技能 | 资源估算 | is_core |
|------|---------|--------|---------|
| 意图识别与路由 | intent-router | 300 | ✓ |
| Commit 生成+规范验证 | commit-generation | 1400 | ✓ |
| 分支 CRUD+健康分析 | branch-management | 600/900 | — |
| 冲突检测与解决 | conflict-resolution | 1500 | ✓ |
| Stash 操作 | stash-management | 500 | — |
| 历史分析（blame/log）| history-analysis | 1200 | — |
| 版本管理+CHANGELOG | version-management | 700 | ✓ |

---

## 2. 执行流程

### 2.1 5 步管道

```
用户自然语言 → 意图识别与路由 → Git 上下文扫描 → 原子技能执行 → 结果整合验证 → 操作执行+执行报告
   Step1          Step2           Step3          Step4         Step5
   资源量=300          资源量=200           资源量=动态         资源量=100         剩余
```

### 2.2 原子技能依赖关系

```
intent-router（资源量=300, 必选） ← 唯一入口
    ├── commit-generation（资源量=1400）
    ├── branch-management（资源量=600/900）
    ├── conflict-resolution（资源量=1500）
    ├── stash-management（资源量=500）
    ├── history-analysis（资源量=1200）
    └── version-management（资源量=700）
```
所有原子技能依赖 intent-router，彼此无横向依赖。

---

## 3. 最终输出结果

| 输出类型 | 格式 | 说明 |
|---------|------|------|
| Git 命令 | Shell 命令 | 供用户确认后执行 |
| Commit Message | Conventional Commits 字符串 | 自动生成+自检+评分 |
| 分支健康报告 | Markdown 表格 | 过期/长期分支列表 |
| 冲突分析 | 文本+颜色标注 | ours/theirs 对比 |
| CHANGELOG | Markdown | 版本变更记录 |
| 资源量 分解报告 | Markdown | 各步骤消耗明细，输出给用户看 |

**输出位置**：对话内直接输出 + `task_skill.md` 持久化（共享上下文 共享）

---

## 4. 架构设计与思维方式

### 4.1 架构模式

**意图驱动架构（星型拓扑）**

```
                    intent-router（中心）
                    /  |  \  |  \  \
           commit branch conflict stash history version
```

- 意图即路由键，8 大意图类型直接映射到对应技能
- 选择星型而非流水线的原因：不同意图的技能组合完全不同，流水线会产生大量无效调用

### 4.2 设计原则

| 原则 | 体现 |
|------|------|
| 最小组合 | 只调用户意图明确的技能，不全量调用 |
| 单一职责 | 每个原子技能只做一件事 |
| 安全优先 | 破坏性操作强制用户确认 |
| 资源量 可观测性 | 每步有记录，输出分解报告 |
| 错误包容 | 模糊意图默认最可能选项，不中断 |

### 4.3 思维方式推断

- **意图优先于命令**：用户想"保存工作"而非"git add + commit"，AI 理解意图而非执行命令
- **收敛式演进**：v1.2 合并 git-helper，删除独立目录，功能增多但复杂度不增

---

## 5. 这样做的好处

1. **自然语言驱动**：不需要记忆命令语法，降低 Git 使用门槛
2. **处理成本节省 50-70%**：典型提交场景从 7 技能/资源量=5800 → 2 技能/资源量=1700
3. **Commit 规范化**：自动生成符合 Conventional Commits 的 message，含质量评分
4. **共享上下文 复用**：git-context 可被 orchestrator 等下游 Skill 复用，避免重复执行
5. **协同 orchestrator**：作为 Skill 系统的一部分，可被统一调度和监控
6. **可观测性强**：资源量 分解报告让 AI 的工作透明可见

---

## 6. 优缺点分析

### 6.1 优点
- 8 大意图类型覆盖绝大多数场景，多语言关键词支持
- 破坏性操作强制确认，安全性高
- 与 orchestrator 深度集成

### 6.2 缺点/限制
- 冲突解决只能分析ours/theirs，无法完全自动合并
- 多意图场景路由可能不准确
- 不处理代码内容（其他 Skill 职责）

### 6.3 适用场景
- 日常提交、分支、冲突、stash 等 Git 操作
- 生成规范 Commit Message
- CHANGELOG 生成和 semver 版本建议
- 分支健康分析
- 提交规范检查

### 6.4 不适用场景
- 纯代码修改类任务（用 code-generator / code-optimizer）
- 大规模批量 Git 操作
- 需要理解代码逻辑的决策

---

## 7. 使用建议

| 类别 | 建议 |
|------|------|
| 最佳实践 | 先描述意图再说细节；复杂操作分开说避免多意图误判；定期查看 执行报告了解操作模式 |
| 注意事项 | commit message 的 body 建议手动调整；模糊意图默认走 commit-generation；资源量 达 100% 只终止不回滚 |
| 扩展方向 | Interactive 确认模式、批量操作、语义化 CHANGELOG、Git Hooks 集成 |

---

*报告生成时间：2026-06-05 14:58:52*