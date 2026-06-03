---
name: git-assistant
description: |
  智能 Git 操作助手。当用户提到以下任何场景时必须触发：
  - 提交代码：提交、commit、提交代码、生成 commit、commit message
  - 分支操作：创建分支、切换分支、删除分支、分支命名、merge、rebase
  - Git 历史：history、commit 历史、blame、谁改的、git log、分析变更
  - 冲突解决：冲突、conflict、解决冲突、merge 冲突、rebase 冲突
  - Stash 操作：stash、暂存、临时保存、恢复 stash
  - 版本标签：tag、标签、版本、release、打标签
  - 其他 Git 操作：git命令、git 操作、git status
  即使用户没有明确说"git"，只要提到以上关键词或场景，立即使用此技能。
---

# Git Assistant Skill - 智能 Git 操作助手

## 版本历史
- v1.0 (2026-06-02): 初始实现，基于华为韬定律 τ 优化技能选择组合

---

## 1. 核心定位

**Git Assistant** 是智能 Git 操作助手，核心价值：

1. **意图理解**：分析用户自然语言输入，确定要执行什么 Git 操作
2. **τ 优化选择**：根据韬定律（性能 ∝ 1/τ）选择最少、最必要的原子技能组合
3. **协同 orchestrator-pro**：接受 τ-Controller 调度，输出 τ 分解报告

**一句话**：帮用户用自然语言做 Git 操作，用韬定律找到最快路径。

**不涉及的职责**：
- 不直接执行 git 命令（由原子 skill 执行，命令供用户确认）
- 不管理仓库配置（由 git-helper 负责）
- 不做代码分析（由其他 skill 负责）

---

## 2. 关键改进（v1.0 相比 git-helper）

### 2.1 τ 优化的技能选择
- **最小组合原则**：只选用户意图所需的技能，不调用多余的
- **预算感知**：根据 τ 预算动态调整技能组合
- **效果**：相比全量调用（7 个技能），典型请求节省 50%~70% τ

### 2.2 意图识别增强
- **关键词模式匹配**：6 大意图类型 × 多语言关键词库
- **模糊意图解析**：支持"帮我提交代码"这类简短输入
- **上下文感知**：结合 git status 自动补充上下文

### 2.3 原子技能专业化
- **commit-generation**：Conventional Commits 规范自动推断
- **conflict-resolution**：冲突类型检测 + 三种解决策略
- **history-analysis**：git blame + 作者统计 + 变更频率

---

## 3. 执行流程（5 步）

### 步骤 1：Git 意图识别与路由

**输入**：用户自然语言（如 "帮我分析一下最近谁改了这个文件"）

**处理**：
1. 提取意图关键词（domain/action/keywords）
2. 查询 git status 获取当前状态
3. 调用 `intent-router` 选择原子技能组合

**τ 记录**：
```python
tau_controller.record_step("intent", duration_ms, tokens)
co_design["intent"] = {
    "model": 0.8,   # LLM 主导意图理解
    "rules": 0.1,   # 关键词规则辅助
    "skills": 0.1,  # git status 上下文
}
```

**输出**：
```json
{
  "intent": {
    "action": "analyze",
    "keywords": ["history", "blame", "文件"],
    "git_context": {"branch": "feat/new-ui", "changes": 5}
  },
  "selected_skills": [
    {"name": "intent-router", "tau_estimate": 300},
    {"name": "history-analysis", "tau_estimate": 1200}
  ],
  "tau_total_estimate": 1500,
  "tau_budget": 3000,
  "tau_safe": true
}
```

### 步骤 2：Git 上下文扫描

**处理**：
1. 执行 `git status --porcelain` 获取当前状态
2. 执行 `git branch --show-current` 获取分支信息
3. 执行 `git diff --staged --stat` 获取暂存变更
4. 收集上下文供后续原子 skill 使用

```python
git_status = execute_git("git status --porcelain")
git_branch = execute_git("git branch --show-current")
git_diff = execute_git("git diff --staged --stat")

# Skill Stacking 命中率追踪
stack_tracker.record_read("git-context", "status", hit=True)
```

### 步骤 3：原子技能执行（τ 优化）

**处理**：按顺序执行 intent-router 选定的原子技能

```python
for skill in selected_skills:
    skill_tau_est = skill.get("tau_estimate", 500)
    remaining = tau_controller.get_remaining("exec")

    # τ 预算检查
    if skill_tau_est > remaining:
        if not skill.get("is_core"):
            stream.skill_skip(skill["name"],
                reason=f"τ 不足（估算{skill_tau_est} > 剩余{remaining}）")
            continue
        else:
            stream.warning(f"核心技能 {skill['name']} 超 τ 预算，继续执行")

    result = execute_atomic_skill(skill)
    tau_controller.record_step("exec", elapsed_ms, 0)
```

### 步骤 4：结果整合与验证

**处理**：
1. 汇总各原子技能的输出
2. 生成统一的 Git 操作建议
3. 确认是否需要执行（有破坏性的命令需用户确认）

```python
results = {
    "intent_summary": summarize_intent(intent),
    "skill_outputs": {
        "commit-generation": {
            "message": "feat(ui): 添加 MeetingCard 组件\n\n- 新增 MeetingCard.vue\n- 支持响应式布局",
            "commands": ["git add -A", "git commit -m 'feat(ui): 添加 MeetingCard 组件'"]
        }
    },
    "requires_confirmation": True,
}
```

### 步骤 5：操作执行与 τ 报告

**处理**：用户确认后执行 Git 命令，输出 τ 分解报告

```
## τ 分解报告（git-assistant）
   总消耗: 2100 / 3000 (70.0%)
   ├─ intent:    300 (14.3%)
   ├─ context:   200  (9.5%)
   ├─ exec:     1500 (71.4%)
   └─ validate:  100  (4.8%)

   效率评分: 0.85 (优秀)  🟢
   技能组合: intent-router + commit-generation
   τ 节省: 30%（相比全量 7 个技能）
   上下文命中率: 85%
   Co-Design: Model=65% / Rules=15% / Skills=20%
```

---

## 4. 决策点汇总

| 决策点 | 触发位置 | 触发条件 | 选项数量 | 默认行为 |
|--------|---------|---------|---------|---------|
| D1 | 步骤1 | 意图模糊或多义 | 2 | 选择最可能意图 |
| D2 | 步骤3 | τ 超出预算 | 2 | 跳过非核心技能 |
| D3 | 步骤3 | 核心技能超 τ | 2 | 警告后继续 |
| D4 | 步骤4 | 命令有破坏性 | 2 | 等待用户确认 |
| D5 | 步骤5 | 多个匹配模式 | 2 | 选最高相似度 |

---

## 5. 文件系统结构

```
.gitlab/skills/git-assistant/
├── SKILL.md                              ← 本文件，总控入口
├── README.md                             ← 使用说明
├── skills_register.md                    ← 原子技能注册
└── atomic-skills/
    ├── intent-router/SKILL.md           ← 意图识别与路由（τ=300）
    ├── commit-generation/SKILL.md        ← Commit 生成（τ=800）
    ├── branch-management/SKILL.md         ← 分支管理（τ=600）
    ├── conflict-resolution/SKILL.md      ← 冲突解决（τ=1500）
    ├── stash-management/SKILL.md          ← Stash 管理（τ=500）
    └── history-analysis/SKILL.md          ← 历史分析（τ=1200）
```

---

## 6. 与其他组件的交互

```
Git Assistant (SKILL.md)
    ├── 读取 git status / git branch / git diff → Git 上下文
    ├── 写入 task_skill.md → 共享上下文（Skill Stacking）
    └── 协同 orchestrator-pro
        ├── τ-Controller 调度：记录各步骤 τ 消耗
        ├── Pattern Mining：在步骤 1 并行执行（可选）
        └── τ 分解报告：步骤 5 输出

Git Assistant → 原子 Skill（通过 SKILL.md 调用）
    ├── intent-router：入口技能，必选
    ├── commit-generation：分析变更，生成 commit message
    ├── branch-management：分支创建/切换/删除
    ├── history-analysis：git log/blame 分析
    ├── conflict-resolution：冲突检测和解决策略
    └── stash-management：stash 操作
```

---

## 7. 关键规则（v1.0）

### τ 优化规则
- **最小组合**：只调用用户意图明确要求的技能
- **核心技能保护**：`is_core=True` 的技能（如 conflict-resolution）不可跳过
- **τ 预警**：80% 预警 / 95% 严重警告 / 100% 终止

### 意图识别规则
- **关键词优先**：`提交/commit/commit message` → commit-generation
- **模糊匹配**：简短输入（如"提交"）默认选择 commit-generation
- **多意图合并**：同一请求含多个意图时，按 τ 优先级排序执行

### 原子技能 τ 估算

| 原子技能 | τ 估算 | is_core | 说明 |
|---------|--------|---------|------|
| intent-router | 300 | true | 入口技能，必选 |
| commit-generation | 800 | true | 核心功能 |
| branch-management | 600 | false | 分支操作 |
| conflict-resolution | 1500 | true | 核心功能 |
| stash-management | 500 | false | stash 操作 |
| history-analysis | 1200 | false | 历史分析 |

### 安全规则
- 有破坏性的操作（branch delete、force push 等）必须确认后才执行
- commit、stash 默认自动执行（已有变更需要保存）

---

## 8. 意图关键词库

```python
INTENT_PATTERNS = {
    "commit":   ["提交", "commit", "提交代码", "创建提交", "生成 commit",
                 "commit message", "提交信息", "写 commit", "提交改动"],
    "branch":   ["分支", "branch", "创建分支", "切换分支", "删除分支",
                 "分支命名", "分支策略", "merge", "rebase", "拉取"],
    "history":  ["历史", "history", "commit 历史", "查找", "blame",
                 "分析变更", "谁改的", "什么时候改的", "git log"],
    "conflict": ["冲突", "conflict", "解决冲突", "合并冲突", "merge conflict",
                 "rebase 冲突", "手动解决"],
    "stash":    ["stash", "暂存", "临时保存", "恢复 stash", "stash list"],
    "tag":      ["tag", "标签", "版本", "release", "发布版本", "打标签"],
}
```

### Commit Message Type 映射

| type | 说明 | 触发关键词 |
|------|------|-----------|
| feat | 新增功能 | 新增、功能、添加 |
| fix | 修复问题 | 修复、bug、问题 |
| docs | 文档更新 | 文档、readme、注释 |
| style | 代码格式 | 格式化、格式 |
| refactor | 重构代码 | 重构、优化 |
| test | 测试相关 | 测试、用例 |
| chore | 构建/工具 | 依赖、工具、配置 |

---

## 9. τ 使用示例

### 示例 1：简单提交（τ 最小）

**用户**："提交当前代码"

**τ 流程**：
```
intent (τ=300) → commit-generation (τ=800) → validate (τ=100)
总 τ = 1200（simple 档位 3000 的 40%）✅
```

### 示例 2：创建分支 + 提交（τ 中等）

**用户**："创建 feat/auth 分支，提交登录功能"

**τ 流程**：
```
intent (τ=300) → branch-management (τ=600) → commit-generation (τ=800)
总 τ = 1700（moderate 档位 3000 的 57%）✅
```

### 示例 3：冲突解决（τ 较高）

**用户**："解决当前 merge 冲突，然后提交"

**τ 流程**：
```
intent (τ=300) → conflict-resolution (τ=1500) → commit-generation (τ=800)
总 τ = 2600（complex 档位 5000 的 52%）✅
```

### 示例 4：分析历史（τ 高但不超）

**用户**："分析 src/utils/auth.ts 的变更历史"

**τ 流程**：
```
intent (τ=300) → history-analysis (τ=1200) → validate (τ=100)
总 τ = 1600（moderate 档位 3000 的 53%）✅
```

---

**版本**: 1.0
**最后更新**: 2026-06-02
**驱动框架**: orchestrator-pro (τ 增强)
**理论基础**: 华为韬定律（何庭波，2026）
