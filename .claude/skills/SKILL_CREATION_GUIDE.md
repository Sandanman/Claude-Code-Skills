# Skill 创建指南 v1.2

> 本指南是 Skill 系统的**可操作手册**，配套 `README.md` 的 5 步概述，提供完整的创建流程、模板和规范。
>
> **前置阅读**：`README.md` 第 1-3 节（版本信息、目录结构、技能统计）

---

## 1. Skill 系统架构速览

```
orchestrator-pro（Reasoner，唯一入口）
    ├── 意图识别 → 匹配主 Skill
    └── 调度主 Skill 执行
            │
            ├── <主 Skill A>
            │       └── atomic-skills/ → skill-1 → skill-2 → skill-3
            ├── <主 Skill B>
            │       └── atomic-skills/ → skill-1 → skill-2
            └── ...
```

### 三个关键注册点

| 文件 | 位置 | 作用 | 更新时机 |
|------|------|------|---------|
| `skills_register.md` | `orchestrator/` | 主 Skill 索引（15个主 Skill 的入口信息） | 新增/修改主 Skill 时 |
| `atomic_skills_register.md` | `orchestrator/` | 各主 Skill 的原子技能详情 + 依赖关系 | 新增/修改原子 Skill 时 |
| `settings.json` | `.claude/` | Slash Command 注册 | 新增支持 `/cmd` 调用的 Skill 时 |

---

## 2. 创建前：判断要创建哪种 Skill

```
用户请求
    ├── "帮我生成代码" / "写一个函数"        → code-generator
    ├── "优化这段代码" / "重构"              → code-optimizer
    ├── "找出重复代码" / "死代码"            → code-redundancy-checker
    ├── "报错了 / 有 Bug"                   → bug-solver
    ├── "扫描项目技术栈"                    → scan-object-info
    ├── "需求文档 / 需求标准化"              → requirement-generator
    ├── "性能问题 / 首屏慢"                  → performance-optimizer
    ├── "安全漏洞扫描"                      → security-scanner
    ├── "生成测试用例"                      → test-generator
    ├── "生成文档 / README"                 → doc-generator
    ├── "Git 操作"                          → git-assistant
    ├── "Docker / CI/CD 部署"               → deploy-helper
    │
    └── 现有 Skill 无法覆盖                  → 【新建主 Skill】
```

**判断原则**：
- 现有 Skill 能覆盖 → 在现有 Skill 下新增/增强原子技能
- 现有 Skill 无法覆盖 → 新建主 Skill（按本指南流程）

---

## 3. 创建流程（5 步）

### 步骤 1：确定 Skill 定位

**新建主 Skill** 需要回答：

1. **Skill 名称**（英文 slug，kebab-case）：用于目录名、注册表、命令
2. **描述**（一句话）：用于注册表和 Orchestrator 匹配
3. **触发关键词**：用户说什么时触发此 Skill
4. **是否需要原子技能**：简单 Skill 可无原子技能，复杂 Skill 需要 3-9 个原子技能

### 步骤 2：创建目录和文件结构

**标准主 Skill 目录结构**：

```
.claude/skills/<skill-name>/
├── SKILL.md              # 必选，核心定义文件
├── README.md             # 可选，使用说明
└── atomic-skills/        # 可选，原子技能目录
    ├── atomic-skill-1/SKILL.md
    ├── atomic-skill-2/SKILL.md
    └── ...
```

**示例：新建 `my-skill`**

```bash
mkdir -p .claude/skills/my-skill/atomic-skills/atomic-skill-1
touch .claude/skills/my-skill/SKILL.md
touch .claude/skills/my-skill/atomic-skills/atomic-skill-1/SKILL.md
```

### 步骤 3：编写 SKILL.md

详见第 4 节「SKILL.md 编写规范」。

### 步骤 4：注册到注册表

#### 4.1 主 Skill 注册（`orchestrator/skills_register.md`）

在 `## 主技能索引` 的 YAML 块中添加：

```yaml
- name: my-skill
  desc: 一句话描述本 Skill 的核心功能
  path: .claude/skills/my-skill/SKILL.md
  core_ability: 核心能力描述（用顿号分隔）
  match_keywords: [关键词1, 关键词2, 关键词3]
  status: 启用
  is_reasoner: false  # 主 Skill 固定 false
  # 以下可选
  tau_role: step4     # τ 增强版可选，标注在 τ 链路中的角色
  note: 附加说明
```

#### 4.2 原子技能注册（`orchestrator/atomic_skills_register.md`）

在对应主技能章节下添加：

```yaml
## N. my-skill 原子技能

```yaml
atomic_skills:
  - name: atomic-skill-1
    core_ability: 原子技能能力描述
    depend: 无  # 或具体依赖的原子技能名
    status: 启用
    # τ 增强版可选字段：
    parallel_group: 0  # 并行组编号，组内可并行
    tau: 300           # τ 预算（token 量纲）
```
```

### 步骤 5：验证注册

运行以下检查：

```bash
# 1. 确认文件存在
ls .claude/skills/<skill-name>/SKILL.md

# 2. 确认注册表更新
grep -n "name: my-skill" .claude/skills/orchestrator/skills_register.md
grep -n "my-skill" .claude/skills/orchestrator/atomic_skills_register.md

# 3. 验证 YAML 格式正确（无缩进错误）
# 检查 skills_register.md 中新增条目的缩进是否为 2 空格
# 检查 atomic_skills_register.md 中 atomic_skills 的缩进结构
```

---

## 4. SKILL.md 编写规范

### 4.1 文件格式（必须按顺序）

```markdown
---
name: <skill-name>
description: <一句话描述，触发条件和核心功能>
---

# <主 Skill 名称> 主Skill v<版本>

## 概述
<2-3 句话描述本 Skill 的定位和核心价值>

## 核心能力
<用无序列表列出 4-6 项核心能力>

## 版本历史
- v<版本> (<日期>): <变更说明>
- v<上一版本> (<日期>): <上一版本说明>

---

## 使用场景（可选，如有多种场景）
<描述不同的使用场景和各自的适用条件>

## 执行流程
<ASCII 图示原子技能的执行管道，标注依赖关系>
<示例>：
  atomic-skill-1 → atomic-skill-2 → atomic-skill-3
        ↓
     atomic-skill-2b（并行）

## 原子skill依赖关系
<每个原子技能的依赖说明，参考 bug-solver 的格式>

## 主skill完成标准（N项）
1. <标准1>
2. <标准2>
3. <标准N>

## 详细设计（按需添加）
<可选，复杂 Skill 的详细逻辑说明>
```

### 4.2 frontmatter 格式

```yaml
---
name: skill-name           # 必须：英文 slug，kebab-case，全局唯一
description: 一句话描述   # 必须：用于注册表和 Orchestrator 意图匹配
---
```

**name 命名规则**：
- 主 Skill：`kebab-case`（如 `code-generator`、`bug-solver`）
- 原子技能：`kebab-case`，建议带上主 Skill 前缀（如 `bug-triage`、`scan-package-json`）
- 避免：数字开头、大写字母、特殊字符

### 4.3 原子技能 SKILL.md 格式

```markdown
---
name: <atomic-skill-name>
description: <一句话描述>
---

# <Atomic Skill 名称>

## 概述
<原子技能的具体职责>

## 输入
<期望从上游接收的数据（来自 task_skill.md 或参数）>

## 输出
<本技能执行后的输出（写入 task_skill.md）>

## 核心逻辑
<详细的执行逻辑说明，参考现有原子技能>

## 异常处理
<可能出现的异常及处理方式>

## 完成标准
<本原子技能的完成判定条件>
```

### 4.4 示例：完整的 SKILL.md

参考以下现有 Skill 的结构：
- **简单 Skill（无原子技能）**：`scan-object-info` — 结构清晰，τ 增强字段完整
- **中等复杂度（3 个原子技能）**：`code-redundancy-checker` — 依赖关系简单
- **高复杂度（7+ 个原子技能）**：`bug-solver`、`code-generator` — 完整流程图和完成标准

**推荐按复杂度参考对应文件**：

| 复杂度 | 参考文件 | 原子技能数 |
|--------|---------|-----------|
| 低（无原子技能） | `scan-object-info/SKILL.md` | 7（含并行设计）|
| 中（3-5 个原子技能）| `code-redundancy-checker/SKILL.md` | 3 |
| 高（6+ 个原子技能）| `bug-solver/SKILL.md` | 7 |
| 最高（多场景路由）| `code-generator/SKILL.md` | 9（含场景路由）|

---

## 5. τ 增强规范（可选，τ 增强版 Skill 使用）

如需在 τ 增强体系（orchestrator-pro）中使用，需增加以下字段和配置：

### 5.1 τ 相关字段

```yaml
# skills_register.md 中
tau_role: step4           # 在 τ 链路中的步骤角色
is_core: true             # 是否为核心 Skill（核心 Skill 不可折叠）
tau_budget: 5000          # τ 预算（token 量纲），可选

# atomic_skills_register.md 中
tau: 300                  # 原子技能 τ 预算
parallel_group: 0         # 并行组（组内可并行，组间串行）
```

### 5.2 τ 链路角色定义

```yaml
tau_role:
  - controller    # 横切控制器（如 tau-controller）
  - step1         # 步骤 1 执行器（intent-recognition）
  - step3         # 步骤 3 执行器（skill-matcher）
  - step4         # 步骤 4 执行器（task-generator）
  - step5         # 步骤 5 执行器（execution-controller）
  - step7         # 步骤 7 执行器（result-validator）
  - step9         # 步骤 9 执行器（task-archiver）
  - pattern       # 模式相关（pattern-miner）
```

### 5.3 Task Folding 约束（参考 `tao-theory-design.md`）

```markdown
## Task Folding 约束
- 折叠条件：连续 3 个原子 skill 的 τ 总和 < 合并后单 skill 的 τ 时触发
- 折叠保护：is_core=true 的原子技能不可折叠
- 折叠记录：折叠操作必须记录到执行日记（含折叠原因和 τ 收益估算）
```

---

## 6. 常见问题排查

### Q1：Skill 无法被 Orchestrator 匹配

**原因**：未注册到 `skills_register.md` 或关键词不匹配

**排查**：
1. 确认 `skills_register.md` 中有对应条目
2. 确认 `match_keywords` 包含用户可能使用的关键词
3. 确认 `status` 为 `启用`（非 `废弃` 或 `停用`）

### Q2：原子技能执行顺序不对

**原因**：依赖关系配置错误

**排查**：
1. 检查 `atomic_skills_register.md` 中的 `depend` 字段
2. 确认无循环依赖（A→B→C→A）
3. 确认 `depend: 无` 的技能在最前面

### Q3：并行执行结果丢失

**原因**：并行组的技能同时写入共享上下文时发生覆盖

**排查**：
1. 并行组内的技能应只读取、不写入（或写入不同 key）
2. 检查 `parallel_group` 编号是否正确
3. 汇总技能（如 `skill-stack-context`）应在并行组之后

### Q4：YAML 格式错误

**原因**：缩进不一致（必须 2 空格）

**排查**：
```bash
# 检查缩进（必须是 2 空格）
grep -n "  " .claude/skills/orchestrator/skills_register.md | head -20
# 确认无 Tab 字符
grep -Pn "\t" .claude/skills/orchestrator/skills_register.md
```

---

## 7. 新建 Skill 清单（Checklist）

创建新的主 Skill 时，逐项检查：

```
[ ] 1. 确定 Skill 名称（kebab-case）和触发关键词
[ ] 2. 创建目录：.claude/skills/<skill-name>/
[ ] 3. 编写 SKILL.md（含 frontmatter）
[ ] 4. 设计原子技能（如需要）
[ ] 5. 在 atomic-skills/ 下创建各原子技能 SKILL.md
[ ] 6. 更新 orchestrator/skills_register.md（添加主 Skill 条目）
[ ] 7. 更新 orchestrator/atomic_skills_register.md（添加原子技能）
[ ] 8. 如需 slash command，更新 .claude/settings.json
[ ] 9. 验证 YAML 格式正确
[ ] 10. 提交 git（提交信息：feat: 新增 <skill-name> 主技能）
```

---

## 8. 参考文件索引

| 目的 | 参考文件 |
|------|---------|
| SKILL.md 标准格式 | `bug-solver/SKILL.md` |
| 多场景路由 | `code-generator/SKILL.md` |
| τ 增强原子技能 | `scan-object-info/atomic-skills/` |
| 主技能注册表示例 | `orchestrator/skills_register.md` |
| 原子技能注册表示例 | `orchestrator/atomic_skills_register.md` |
| τ 链路设计 | `orchestrator-pro/skills_register.md` |
| τ 理论设计 | `tao-theory-design.md` |
| 整体架构 | `README.md` |

---

**版本**: 1.2
**创建时间**: 2026-06-03
**维护人**: Claude Code Skills Team