# Bug Solver v1.3（τ 增强版）

系统化地解决应用程序中的bug，通过7个原子skill协同工作，从bug分类到修复验证，完整记录和追溯整个debug过程。

**v1.3 整合韬定律（τ-Law）体系，τ 节省约 30%。**

## 快速开始

### 触发方式
当用户报告错误、异常行为或提供bug信息时自动触发：

```
用户: "登录页面点击登录按钮没有反应，控制台显示TypeError: Cannot read property 'login' of undefined"
```

### 执行命令
Claude Code 将按以下7步管道自动执行：

```
τ-Control（预算分配）→ bug-triage → bug-identification
  → code-analysis → root-cause-analysis → fix-generation
  → fix-verification → test-suggestion（τ 不足时跳过）
→ Pattern Mining（归档 + 模式复用）→ τ-Report（效率评分）
```

---

## 文件结构

```
bug-solver/
├── SKILL.md                         # 主skill定义（v1.3 τ 增强版）
├── README.md                        # 本文件
└── atomic-skills/
    ├── bug-triage/                  # 分类bug类型和优先级 [核心·不折叠]
    │   └── SKILL.md
    ├── bug-identification/          # 收集bug信息 [可折叠]
    │   └── SKILL.md
    ├── code-analysis/              # 分析相关代码 [可折叠]
    │   └── SKILL.md
    ├── root-cause-analysis/         # 定位根本原因 [可折叠]
    │   └── SKILL.md
    ├── fix-generation/             # 生成修复方案 [核心·不折叠]
    │   └── SKILL.md
    ├── fix-verification/           # 验证修复效果 [核心·不折叠]
    │   └── SKILL.md
    └── test-suggestion/            # 建议测试用例 [可跳过]
        └── SKILL.md
```

---

## τ 增强版特性

### τ 分项预算

| 复杂度 | 总预算 | 适用场景 |
|--------|--------|----------|
| simple（low） | 3000 token | 单文件错误，错误信息完整 |
| moderate（medium） | 8000 token | 多文件问题，需分析依赖 |
| complex（high） | 15000 token | 系统级问题，需多轮分析 |

### 7步 τ 权重分配

| 步骤 | simple | moderate | complex |
|------|--------|----------|---------|
| bug-triage | 15% | 12% | 10% |
| bug-identification | 15% | 15% | 15% |
| code-analysis | 20% | 18% | 20% |
| root-cause-analysis | 20% | 20% | 20% |
| fix-generation | 20% | 18% | 20% |
| fix-verification | 10% | 12% | 10% |
| test-suggestion | 0%（跳过） | 5% | 5% |

### Task Folding（任务折叠）

**可折叠组**：

| 折叠组 | 包含技能 | 折叠条件 | τ 节省 |
|--------|---------|---------|--------|
| Group A | bug-triage + bug-identification | simple 且错误信息完整 | 20% |
| Group B | code-analysis + root-cause-analysis | moderate 且文件 < 3 | 15% |
| Group C | bug-identification + code-analysis | moderate 且有文件路径 | 25% |

**禁止折叠**：bug-triage、fix-generation、fix-verification 为核心步骤（不折叠）。

### Skill Stacking（技能栈叠）

通过 `task_skill.md` 共享上下文，7个原子 skill 之间通过 TSV（垂直互联）传递数据：

| 原子 skill | 从上下文读取 | 输出到上下文 |
|-----------|------------|-------------|
| bug-triage | - | `triage_result` |
| bug-identification | `triage_result` | `bug_report` |
| code-analysis | `bug_report` | `analysis_result` |
| root-cause-analysis | `analysis_result` | `root_cause` |
| fix-generation | `root_cause` | `fix_plan` |
| fix-verification | `fix_plan` | `verification_result` |
| test-suggestion | `verification_result` | `test_cases` |

命中率目标 ≥ 60%。

### Co-Design（协同设计）

Model × Rules × Skills 三层责任分配：
- **bug-triage**、**fix-verification**：规则主导（bug-type-rules、验证规则库）
- **code-analysis**、**root-cause-analysis**：技能 + 模型协同
- **fix-generation**：模型主导 + diff 生成辅助
- **test-suggestion**：模型生成 + 测试模板规则

### Pattern Mining（模式复用）

内置修复模式库（`.claude/skills/patterns/bug-fix-patterns/`）：

| 模式 ID | 模式名称 | 触发条件 | 成熟度 | τ 折扣 |
|---------|---------|---------|--------|--------|
| pattern-bf-001 | 前端 undefined 修复 | TypeError + undefined + Vue/React | 成熟 | 70% |
| pattern-bf-002 | 后端 API 500 修复 | 500 + API + stack trace | 成熟 | 70% |
| pattern-bf-003 | 配置缺失修复 | Error + not found + config | 成长 | 40% |
| pattern-bf-004 | 逻辑错误修复 | 逻辑判断 + 预期不符 | 试验 | 10% |

匹配成功（相似度 ≥ 0.6）时复用模式，τ 节省 40%~70%。

---

## Bug分类系统

### 按类型分类
| 类型 | 说明 | 典型症状 |
|------|------|----------|
| frontend | 前端问题 | 页面不显示、控制台错误、样式异常 |
| backend | 后端问题 | API 500错误、数据库异常 |
| config | 配置问题 | 环境变量缺失、配置文件错误 |
| logic | 逻辑问题 | 业务逻辑不符预期 |

### 按优先级分类（τ 影响）
| 优先级 | 说明 | τ 预算倍数 | 可跳过步骤 |
|--------|------|----------|-----------|
| critical | 系统崩溃、数据丢失、安全漏洞 | 2.0x | 禁止跳过 |
| high | 核心功能完全不可用 | 1.5x | 禁止跳过核心步骤 |
| medium | 功能部分受损，有替代方案 | 1.0x | test-suggestion 可跳过 |
| low | 体验问题，不影响核心功能 | 0.5x | bug-identification + test-suggestion 可折叠 |

### 处理策略
| 策略 | 适用场景 | 说明 |
|------|----------|------|
| 立即修复 | critical/high优先级 | 快速定位根因，应用修复 |
| 计划修复 | medium优先级 | 按标准流程处理 |
| 记录跟踪 | low优先级 | 记录但暂不处理 |

---

## 使用示例

### 输入
```
登录页面点击登录按钮没有反应，控制台显示TypeError: Cannot read property 'login' of undefined
```

### v1.3 执行流程

**Step 0: τ-Control（自动）**
- 判断复杂度：moderate → 总预算 8000
- 分配各步骤预算

**Step 1: bug-triage**
- 分析错误信息，提取关键词
- 判断bug类型：frontend（前端错误）
- 判断优先级：high（核心功能不可用）
- 制定处理策略：立即修复
- 输出：bug分类报告 → 写入 `triage_result`

**Step 2: bug-identification**（可折叠进 code-analysis）
- 读取 `triage_result`（Skill Stacking 命中）
- 收集错误信息（TypeError、位置）
- 整理复现步骤（打开页面、输入信息、点击按钮）
- 整理期望行为 vs 实际行为
- 输出：结构化问题报告 → 写入 `bug_report`

**Pattern Matching（自动）：**
- 匹配 pattern-bf-001（前端 undefined 修复，成熟模式）
- 相似度 0.75 → τ 折扣 70%，跳过 code-analysis + root-cause-analysis

**Step 5: fix-generation**
- 读取 `root_cause`（从 pattern 复用）
- 设计修复方案（修正导入路径）
- 生成diff格式代码修改
- 输出：修复方案文档 → 写入 `fix_plan`

**Step 6: fix-verification**
- 读取 `fix_plan`
- 执行功能验证
- 确认修复成功
- 输出：修复验证报告

**Step 7: test-suggestion**（τ 不足，跳过）

**τ-Report（自动）：**
- τ 效率评分 = (0.9 × 0.7) / 7.6 = 0.0828 → **合格**
- Pattern Mining 归档：本次修复记录为 pattern-bf-001 新增验证案例

### 输出产物
- Bug分类报告（`triage_result`）
- 结构化问题报告（`bug_report`）
- 代码分析报告（`analysis_result`）
- 根因定位报告（`root_cause`）
- 修复方案文档（含diff，`fix_plan`）
- 修复验证报告（`verification_result`）
- 测试建议文档（`test_cases`，τ 不足时跳过）
- **τ 分解报告（v1.3 新增）**：各步骤 τ 消耗占比 + 效率评分 + 历史对比

---

## τ 效率评分

```
τ_efficiency_score = (完成质量分 × τ 折扣) / τ_actual_consumed

评分标准：
- 优秀（≥ 0.8）：τ 节省且质量高
- 合格（0.5 ~ 0.8）：τ 正常消耗
- 不合格（< 0.5）：τ 超支或质量低
```

---

## 注意事项

1. **Bug分类优先**：bug-triage是第一个步骤，分类结果决定后续处理策略
2. **证据链支撑**：根因分析必须有完整的证据链支持
3. **双方案推荐**：修复方案至少提供推荐方案和备选方案
4. **验证必须执行**：fix-verification是必须步骤，不能跳过
5. **测试防止回退**：test-suggestion提供回归测试用例，防止问题再次发生
6. **τ 超出时**：优先折叠 test-suggestion，禁止折叠 fix-generation/fix-verification
7. **Pattern Matching**：匹配成功后可跳过部分分析步骤，但必须保留根因确认
8. **Skill Stacking**：命中率 < 50% 时应输出优化建议

---

## 版本信息

- **版本**：1.3（τ 增强版）
- **发布日期**：2026-06-04
- **原子skill数量**：7个
- **整合韬定律**：K1 Task Folding、K2 Skill Stacking、K3 Co-Design、K4 Pattern Mining
- **τ 节省目标**：约 30%（通过 Pattern Mining + Task Folding）
- **主要改进**：
  - 整合韬定律，τ 控制、Task Folding、Skill Stacking、Co-Design、Pattern Mining
  - τ 分项预算分配（simple/moderate/complex 三档）
  - Task Folding 任务折叠（3个可折叠组）
  - Skill Stacking 上下文共享（7个 skill 的 required/output keys）
  - Co-Design Model×Rules×Skills 责任分配
  - Pattern Mining 修复模式库（成熟模式 τ 折扣 70%）
  - τ 效率评分（优秀/合格/不合格）