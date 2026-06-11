# 韬定律 AI Agent 系统设计 — 总索引

> 本文件夹为 `tao-theory-design.md` 的拆分版，保留完整设计规范，内容按主题分散到各文件中。

## 模块关系图

```
00-theory.md（芯片理论 + 映射框架）
    ├──▶ 01-tau-formula.md（三指标 + τ 公式）
    │        │
    │        └──▶ 02-k1-k4.md（K1-K4 技术规范）
    │        │        │
    │        │        └──▶ 03-rules.md（Rules 约束体系）
    │        │
    │        └──▶ 04-skill-design.md（新增 Skill 规范）
    │                 │
    │                 └──▶ 05-integration.md（融合方案 + 实施状态）
```

## 文件索引

| 文件 | 内容 | 何时阅读 |
|------|------|---------|
| 00-theory.md | 华为芯片理论 + K1-K4 通俗类比 + 映射框架 | 理解原理 |
| 01-tau-formula.md | τ 公式 + 三指标体系 + 三档预算配置 | 配置 τ 预算 |
| 02-k1-k4.md | K1-K4 完整技术规范 | 理解 Task Folding、Skill Stacking、Co-Design、Pattern Mining |
| 03-rules.md | .mdc 规则体系完整内容 | 查阅约束规则 |
| 04-skill-design.md | 新增 Skill 必填字段 + SKILL.md 模板 + 注册流程 | 新增 Skill |
| 05-integration.md | 融合架构图 + 实施状态 + 实施优先级 | 理解与 orchestrator-pro 的集成 |

## 快速参考

**要新增一个 Skill？**
→ 使用 `/skill-creator`（官方 Skill 创建工具，自动遵循本规范体系），手动创建流程见 `SKILL_CREATION_GUIDE.md`（本文件夹操作手册）

**要理解 τ 体系？**
→ 读 `01-tau-formula.md`（τ 公式 + 三指标），引用 `00-theory.md`（理论基础）

**要理解 K1-K4 技术？**
→ 读 `00-theory.md`（通俗类比），深入读 `02-k1-k4.md`（技术细节），引用 `03-rules.md`（具体约束）

**要查阅规则？**
→ 读 `03-rules.md`