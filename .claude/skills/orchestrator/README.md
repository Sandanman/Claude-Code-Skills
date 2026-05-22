# Orchestrator Skill v1.2 - 使用指南

## 目录

- [快速开始](#快速开始)
- [架构概览](#架构概览)
- [文件说明](#文件说明)
- [执行流程](#执行流程)
- [自定义配置](#自定义配置)
- [用户交互](#用户交互)
- [故障排查](#故障排查)
- [维护指南](#维护指南)

---

## 快速开始

### 触发条件
当用户输入任何与代码开发相关的需求时，Orchestrator 自动被触发：

```
用户："优化 MeetingCard 组件的性能"
用户："修复登录按钮点击无反应的问题"
用户："帮我实现一个用户登录功能"
用户："扫描项目使用的技术栈"
```

### 执行前准备
1. **确认 skills_register.md 存在且包含所有主skill**
2. **确认 tasks/current/ 和 tasks/history/ 目录存在**
3. **（可选）提供 .claude/project_context.json 作为项目上下文**

### 查看帮助
```
用户：help orchestrator
用户：orchestrator 使用说明
```

---

## 架构概览

```
用户输入
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  Orchestrator (Reasoner - 唯一总控)                  │
│                                                     │
│  步骤1：意图识别与目标推理                          │
│    ├─ LLM驱动意图分析                               │
│    ├─ 上下文感知（读取 project_context.json）        │
│    └─ 置信度评估 (< 0.6 时提示用户确认)             │
│                                                     │
│  步骤2：历史意图检索                                │
│    ├─ 特征提取 + Jaccard相似度                      │
│    ├─ 召回 Top3-5 历史任务                          │
│    └─ 相似度 ≥ 0.85 → 输出历史结果                  │
│                                                     │
│  步骤3：主skill匹配                                 │
│    ├─ 读取 skills_register.md                       │
│    ├─ 关键词+领域+操作 匹配分数计算                 │
│    └─ 无匹配→记录missing | 多匹配→用户选 | 唯一→用  │
│                                                     │
│  步骤4：任务生成                                    │
│    ├─ 主skill读取自身原子skill列表                   │
│    ├─ DAG构建 + 拓扑排序 + 并行层识别               │
│    └─ 生成 tasks/current/task_skill.md              │
│                                                     │
│  步骤5：执行控制（流式输出）                        │
│    ├─ TokenTracker 初始化                           │
│    ├─ 按并行层执行原子skill                         │
│    ├─ 实时流式输出（🚀⚡✅❌📋）                     │
│    └─ 错误影响评估（暂停/继续）                     │
│                                                     │
│  步骤6：任务恢复（可选）                            │
│    ├─ 从断点继续执行                                 │
│    └─ 动态调整执行计划                               │
│                                                     │
│  步骤7：结果校验与反思                              │
│    ├─ 逐一校验完成标准                               │
│    ├─ 偏差量化（≥0.2触发反思）                      │
│    └─ 最多3次反思重规划                              │
│                                                     │
│  步骤8：结果输出                                    │
│    ├─ 整合各原子skill结果                           │
│    ├─ Token消耗汇总                                 │
│    └─ 反思日志（如有）                              │
│                                                     │
│  步骤9：任务归档                                    │
│    ├─ 移动文件到 history/YYYY-MM/                   │
│    ├─ 更新月度索引                                   │
│    └─ 可固化文档提示                                 │
└─────────────────────────────────────────────────────┘
    │
    ▼
主skill（协同执行）
    │
    ▼
原子skill序列 → 结果汇总 → 归档
```

---

## 文件说明

### 核心文件（必读）

| 文件 | 大小 | 作用 | 优先级 |
|------|------|------|--------|
| **SKILL.md** | ~15K | 核心技能定义，完整执行流程 | ⭐⭐⭐⭐⭐ |
| **README.md** | ~5K | 本文件，使用指南 | ⭐⭐⭐⭐⭐ |
| **skills_register.md** | ~4K | 所有主skill和原子skill注册表 | ⭐⭐⭐⭐ |
| **config.md** | ~8K | 所有配置参数（16个配置块） | ⭐⭐⭐ |

### 实现文档（按需查阅）

| 文件 | 大小 | 作用 | 使用场景 |
|------|------|------|----------|
| **algorithms.md** | ~15K | 9个核心算法伪代码 | 理解匹配/排序/校验逻辑 |
| **technical_implementation.md** | ~20K | 11个技术实现模块 | 编写底层代码 |
| **user_interaction.md** | ~10K | 6个决策点的交互模板 | 定制用户提示 |

### 运行时文件（自动管理）

| 文件 | 大小 | 作用 | 管理方式 |
|------|------|------|----------|
| **missing_skills.md** | ~1K | 缺失技能记录 | 自动追加 |
| **tasks/current/task_skill.md** | ~50K | 当前任务状态 | 自动创建/更新 |
| **tasks/history/YYYY-MM/月度任务索引.md** | ~20K | 历史任务索引 | 自动更新 |

---

## 执行流程

### 完整流程图

```
用户输入
    │
    ▼
意图识别（LLM驱动）
    │ is_simple? → 是 → 直接执行 → 【end】
    │
    ▼ (复杂目标)
历史检索
    │ 相似度 ≥ 0.85? → 是 → 输出历史结果 → 【end】
    │
    ▼
检查未完成任务
    │ 存在? → 用户选择：继续/新建
    │
    ▼
匹配主skill
    │ 无匹配 → missing_skills.md → 自主执行 → 【end】
    │ 多匹配 → 用户选择
    │ 唯一匹配 → 继续
    │
    ▼
协同生成 task_skill.md
    │ DAG + 拓扑排序 + 并行层识别
    │
    ▼
🚀 任务开始（流式输出）
    │
    ▼
执行原子skill序列
    │ ⚡ skill开始 → ✅/❌ → Token追踪
    │ 重试? → 是 → 影响大? → 暂停/继续
    │
    ▼
校验完成标准
    │ 偏差 ≥ 0.2? → 💭 反思重规划（≤3次）
    │
    ▼
📋 结果输出
    │
    ▼
归档 → 更新索引 → 【end】
```

### 简单任务示例

用户："生成 CODE_STYLE.md"

```
意图识别 → is_simple=True → 判定为简单目标
    ↓
直接执行 code-style-generator 主skill
    ↓
code-style-generator 执行 5 个原子skill
    ↓
输出 CODE_STYLE.md → 归档 → 【end】
```

### 复杂任务示例

用户："优化 src/components 下的所有组件性能，减少重复代码"

```
意图识别 → is_simple=False, complexity_score=7, 多skill组合
    ↓
历史检索 → 无相似任务
    ↓
匹配主skill → code-optimizer + code-redundancy-checker（多skill组合）
    ↓
协同生成 task_skill.md → 11个原子skill（6+3+2）
    ↓
🚀 任务开始 | code-optimizer + code-redundancy-checker | 共11个技能
    ↓
执行并行层（duplicate-code-detection 和 code-quality-analysis 可并行）
    ↓
... 逐步执行 ...
    ↓
📋 任务完成 | 成功率: 100% | 耗时: 3分22秒
    ↓
归档 → 更新月度索引 → 【end】
```

---

## 自定义配置

### 修改匹配阈值

编辑 `config.md` 第1节：
```python
SIMILARITY_CONFIG = {
    "历史任务相似度阈值": 0.85,  # 从0.85调整为0.80
    "主skill匹配最低分数": 0.4,  # 从0.4调整为0.35
}
```

### 修改Token预算

编辑 `config.md` 第0.6节：
```python
TOKEN_TRACKING_CONFIG = {
    "task_budget": 200000,  # 从200000调整为300000
    "warning_threshold": 0.8,  # 80%预警
    "input_cost_per_1k": 3.0,
    "output_cost_per_1k": 15.0,
}
```

### 修改流式输出

编辑 `config.md` 第0.5节：
```python
STREAM_CONFIG = {
    "show_progress_bar": True,
    "color_output": True,     # 设为False可禁用彩色输出
    "show_skill_desc": True,
}
```

### 添加新的主skill

1. 在 `skills_register.md` 的【一】主技能列表中添加条目
2. 在【二】原子技能列表中添加原子skill
3. 实现主skill的 SKILL.md
4. 实现所有原子skill的 SKILL.md

---

## 用户交互

### 交互时机

| 时机 | 自动/手动 | 说明 |
|------|----------|------|
| 置信度 < 0.6 | 自动提示 | 意图不确定，需用户确认 |
| 多skill匹配 | 自动提示 | 显示Top3供选择 |
| 高影响错误 | 自动提示 | 暂停任务，用户决策 |
| 计划需调整 | 自动提示 | 用户确认调整方案 |
| 3次反思失败 | 自动提示 | 用户选择后续行动 |
| 可固化文档 | 自动提示 | 用户选择是否迁移 |

### 无用户响应

各决策点的超时默认行为（见 `user_interaction.md`）：

| 决策点 | 超时 | 默认行为 |
|--------|------|---------|
| D1 未完成任务 | 5分钟 | 开始新任务 |
| D2 多skill匹配 | 30秒 | 选择最高分 |
| D3 错误处理 | 3分钟 | 重试 |
| D4 计划调整 | 2分钟 | 接受调整 |
| D5 反思失败 | 5分钟 | 输出当前结果 |
| D6 文档固化 | 1分钟 | 仅索引 |

---

## 故障排查

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 意图识别失败 | LLM调用超时 | 检查 model 配置，fallback 自动生效 |
| skill匹配失败 | skills_register.md 格式错误 | 检查 YAML 格式 |
| task_skill.md 写入失败 | 文件锁未释放 | 检查 .lock 文件是否残留 |
| 归档失败 | 目录权限不足 | 检查 tasks/history/ 目录权限 |
| Token超预算 | 任务过大 | 增加 task_budget 或拆分任务 |

---

## 维护指南

### 日常维护

1. **添加新主skill**：更新 `skills_register.md`，创建对应目录和 SKILL.md
2. **添加新原子skill**：在对应主skill目录下创建 atomic-skills 子目录
3. **调整参数**：修改 `config.md` 对应配置块
4. **优化交互**：修改 `user_interaction.md` 对应模板

### 定期维护

1. **清理过期任务**（>180天）：自动归档到 tar.gz
2. **补充缺失skill**：处理 `missing_skills.md` 中的记录
3. **更新技能列表**：移除已弃用的skill，添加新skill

### 版本更新

1. 修改 `SKILL.md` 顶部的版本历史
2. 更新 `README.md` 的变更说明
3. 同步更新 `skills_register.md`（如有新增skill）

---

**版本**: 1.2
**最后更新**: 2026-05-21
**维护者**: 项目团队