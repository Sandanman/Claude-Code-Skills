# Orchestrator Skill - 智能调度总控

## 版本历史
- v1.2 (2026-05-21): 全面重构，引入上下文感知、智能路由、并行执行增强

---

## 1. 核心定位

**Orchestrator** 是整个 skill 系统的唯一总控 Reasoner，所有任务都通过它驱动：

```
用户输入 → Orchestrator (Reasoner) → 匹配主Skill → 执行原子Skill序列 → 归档结果
```

**三大核心职责**：
1. **意图理解**：LLM驱动的意图识别，支持上下文感知和置信度评估
2. **技能编排**：智能匹配主skill + 协同生成执行计划，支持并行执行
3. **全程管控**：流式执行、错误恢复、结果校验、任务归档

**不涉及的职责**：
- 不执行具体代码（由原子skill执行）
- 不直接读取项目文件（由原子skill读取）
- 不管理用户会话状态（由session层管理）

---

## 2. 关键改进（v1.2 相比 v1.0）

### 2.1 意图识别增强
- **上下文感知**：自动读取 `.claude/project_context.json` 作为背景
- **多轮推断**：支持跨会话上下文继承（从 `tasks/history/` 提取用户偏好）
- **置信度分级**：简单/模糊/复杂三级，低于阈值时主动询问
- **智能fallback**：LLM不可用时平滑降级到规则算法，不丢失功能

### 2.2 技能匹配增强
- **动态权重**：根据意图特征动态调整关键词/domain/action的匹配权重
- **多skill组合**：自动识别需要多主skill组合的场景（如 bug-solver + code-optimizer）
- **skill互斥检测**：检测不合理组合并提示用户
- **缺失skill自动记录**：未匹配到skill时记录到 `missing_skills.md`

### 2.3 任务生成增强
- **并行层识别**：自动识别无依赖的原子skill，支持并行执行
- **资源预算**：预估token消耗和执行时长，超限时预警
- **动态调整**：执行中检测到计划不合理时，自主微调（仅限同类型补充/顺序调整）
- **断点恢复**：任务中断后，从 `tasks/current/task_skill.md` 的精确位置恢复

### 2.4 执行控制增强
- **流式输出**：每个原子skill开始/完成时实时输出，用户无需等待全部完成
- **Token追踪**：每次LLM调用后记录token消耗，80%预警、95%严重警告、100%终止
- **错误影响评估**：5维度评分，自动判断是暂停还是继续执行
- **重试策略**：单个原子skill最多3次重试，3次反思后仍不达标则放弃

### 2.5 结果校验增强
- **双重校验**：既验证各原子skill的完成标准，也验证整体目标达成度
- **偏差量化**：偏差≥0.2时触发反思，<0.1为优秀，0.1~0.2为合格
- **反思记录**：反思日志控制在300字内，仅记录关键问题和可落地方向
- **结果分级**：根据成功率输出"完成"/"部分完成"/"失败"

### 2.6 归档增强
- **自动归档**：所有原子skill执行完毕后自动归档（无论成功/失败）
- **月度索引**：自动维护 `tasks/history/YYYY-MM/月度任务索引.md`
- **可固化检测**：识别可复用的文档，提示用户手动迁移
- **历史检索**：仅检索月度索引文件（不遍历全量历史），Top3-5召回

---

## 3. 执行流程（9步）

### 步骤1：意图识别与目标推理

**输入**：用户原始输入文本

**处理**：
1. 读取 `.claude/project_context.json`（如存在）作为上下文背景
2. 读取 `skills_register.md` 中的主skill列表作为匹配候选
3. 调用 LLM 进行意图分析（使用 config.md 中的模型参数）
4. 解析结构化意图JSON（intent_id, domain, action, target, keywords, success_criteria, complexity_assessment, confidence）
5. 置信度 < 0.6 时，提示用户确认意图
6. 复杂度 score ≤ 3 → 简单目标，直接执行单个原子skill → **【end】**
7. 复杂度 score > 3 → 复杂目标，进入步骤2

**LLM意图分析系统提示词模板**：
```
你是一个专业的 AI 代码助手意图分析专家。对用户的自然语言输入进行深度分析，提取结构化的意图信息。

【领域分类】domain（选择一个最匹配的）：
- frontend：Vue/React/Angular组件、页面、样式、UI交互
- backend：Node.js/Python/Java后端API、服务端逻辑
- database：数据库设计、SQL、ORM、数据模型
- fullstack：前后端联动、涉及多个技术栈
- devops：部署、CI/CD、容器化、环境配置
- security：安全相关（认证、授权、加密、防护）
- testing：测试用例、单元测试、E2E测试
- refactoring：代码重构、性能优化、消除重复
- debugging：问题诊断、bug修复、错误分析
- architecture：系统设计、技术选型、架构决策
- documentation：文档编写、注释、README
- analysis：代码分析、项目扫描、技术调研
- general：不属于上述任何领域的通用问题

【操作分类】action（选择一个最匹配的）：
- fix：修复bug、解决问题、调试错误
- create：新建功能、创建文件、实现需求
- optimize：优化性能、提升效率、重构代码
- refactor：重构代码结构、改善可维护性
- analyze：分析代码、项目诊断、技术调研
- document：编写文档、添加注释
- test：编写测试、验证功能
- deploy：部署、发布、环境配置
- review：代码审查、安全审查
- maintain：日常维护、版本更新
- integrate：集成第三方服务、API对接
- configure：配置管理、环境变量、项目设置

【复杂度判断】：
- is_simple=true：单步操作、无需保存状态、仅涉及≤2个文件、无分支逻辑
- is_simple=false：多步骤、需要状态、多文件、有分支决策

【输出格式】：
{
  "intent_id": "INT_时间戳_随机4位",
  "domain": "领域标签",
  "action": "操作类型",
  "target": {"type": "file|component|api|function|module|page|feature|system", "name": "名称", "path": "路径"},
  "constraints": ["约束1", "约束2"],
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "success_criteria": "成功标准（一句话，可验证）",
  "original_input": "原始输入（最多200字符）",
  "complexity_assessment": {
    "is_simple": true/false,
    "complexity_score": 1-10,
    "reasoning": "判断理由（50字内）",
    "requires_multiple_steps": true/false,
    "needs_state": true/false,
    "requires_multiple_skills": true/false,
    "involves_multiple_files": true/false,
    "has_branching": true/false
  },
  "confidence": {
    "overall": 0.0-1.0,
    "domain_confidence": 0.0-1.0,
    "action_confidence": 0.0-1.0,
    "complexity_confidence": 0.0-1.0,
    "uncertain_aspects": ["不确定方面1", "不确定方面2"]
  }
}
```

**fallback机制**：LLM调用失败或JSON解析失败时，自动切换到规则算法：
```python
def rule_based_intent_recognition(user_input):
    intent = {
        "intent_id": f"INT_{timestamp}_{random4}",
        "domain": detect_domain(user_input),       # 基于关键词匹配
        "action": extract_action(user_input),       # 基于关键词匹配
        "target": extract_target(user_input),
        "constraints": extract_constraints(user_input),
        "keywords": extract_keywords(user_input),
        "success_criteria": generate_success_criteria(user_input),
        "original_input": user_input[:200],
        "complexity_score": calculate_complexity(user_input),  # 维度加权
        "complexity_assessment": {"is_simple": False, ...},
        "confidence": {"overall": 0.5, ...},
        "recognition_method": "rule_based_fallback"
    }
    return intent
```

**复杂度评分维度**：
| 维度 | 简单(1分) | 复杂(3分) | 权重 |
|------|-----------|-----------|------|
| 步骤数量 | 单步操作 | 多步操作 | 1.0 |
| 状态依赖 | 无状态 | 需保存状态 | 1.2 |
| 技能组合 | 单skill | 多skill协同 | 1.1 |
| 文件数量 | ≤2个 | >2个 | 0.8 |
| 决策点 | 无分支 | 多分支决策 | 0.9 |

---

### 步骤2：历史意图检索

**处理**：
1. 对意图做特征提取：domain + action + keywords + target_type + tech_stack
2. 读取当前月份的月度索引 `tasks/history/YYYY-MM/月度任务索引.md`
3. 计算与历史意图的相似度（Jaccard for keywords + exact match for domain/action）
4. 召回 Top3-5 最相似任务

**相似度计算**：
```python
def calculate_similarity(intent_a, intent_b):
    domain_sim = 1.0 if intent_a.domain == intent_b.domain else 0.0
    action_sim = 1.0 if intent_a.action == intent_b.action else 0.0
    keyword_sim = len(set(intent_a.keywords) & set(intent_b.keywords)) / \
                  len(set(intent_a.keywords) | set(intent_b.keywords)) if (intent_a.keywords and intent_b.keywords) else 0.0
    target_sim = 1.0 if intent_a.target.type == intent_b.target.type else 0.0

    similarity = (
        0.25 * domain_sim +
        0.20 * action_sim +
        0.30 * keyword_sim +
        0.15 * target_sim
    )
    return similarity  # 0.0 ~ 1.0
```

**判断**：
- similarity ≥ 0.85（高度相似）：读取历史任务的 `task_skill.md`，输出结果/结论 → **【end】**
- 无高度相似：进入步骤3

**未完成任务检查**：
- 检查 `tasks/current/task_skill.md` 是否存在
- 存在且意图相关：提示用户选择"继续执行"还是"开始新任务"
- 不存在：进入步骤3

---

### 步骤3：主skill匹配

**处理**：
1. 读取 `skills_register.md` 中的主skill列表
2. 计算每个skill的匹配分数：
```python
def calculate_match_score(intent, skill):
    keyword_score = sum(0.5 for kw in intent.keywords if kw in skill.match_keywords)
    domain_score = 0.3 if intent.domain in skill.core_ability else 0.0
    action_score = 0.2 if intent.action in skill.match_keywords else 0.0
    total_score = (keyword_score + domain_score + action_score)
    max_score = len(intent.keywords) * 0.5 + 0.3 + 0.2
    return total_score / max_score if max_score > 0 else 0.0
```

**判断**：
- 无匹配（所有 score < 0.4）：记录到 `missing_skills.md`，尝试自主执行 → **【end】**
- 唯一匹配（1个 ≥ 0.4）：使用该主skill
- 多匹配（≥2个 ≥ 0.4）：提示用户选择（显示Top3，匹配度最高的作为默认）

**多skill组合**：
- 当复杂度 score ≥ 7.0 或意图需要多领域时，自动识别多skill组合
- 组合需满足：主skill之间有协作关系（如 bug-solver + code-optimizer）
- 组合后，主skill按优先级排序，协同生成统一的 task_skill.md

---

### 步骤4：任务生成（与主skill协同）

**主skill职责**：
1. 读取自身对应的原子skill列表（从 `skills_register.md` 中读取）
2. 与Reasoner协同确定：哪些原子skill需要执行、顺序如何、哪些可并行
3. 生成 `task_skill.md`，包含：
   - 任务基础信息（ID、意图、目标、主skill、状态）
   - 原子skill列表（含状态、依赖、完成标准）
   - 主skill完成标准
   - 执行日记模板
   - 结果汇总区域

**依赖关系分析**：
```python
def build_dependency_graph(atomic_skills):
    # 构建DAG，检测循环依赖
    graph = {s.name: [] for s in atomic_skills}
    in_degree = {s.name: 0 for s in atomic_skills}
    for s in atomic_skills:
        if s.depend and s.depend != "无":
            for dep in s.depend.split(", "):
                graph[dep].append(s.name)
                in_degree[s.name] += 1
    return graph, in_degree

def topological_sort(graph, in_degree):
    # Kahn算法拓扑排序，返回执行顺序
    from collections import deque
    queue = deque([n for n in in_degree if in_degree[n] == 0])
    result = []
    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    return result  # [] 表示存在循环依赖

def identify_parallel_layers(sorted_skills, graph):
    # 识别可并行执行的层
    # 同一层内的skill无依赖关系，可并行执行（但同时只能有一个写入task_skill.md）
    layers = []
    assigned = set()
    remaining = set(sorted_skills)
    while remaining:
        # 找出所有依赖已满足的skill
        parallel = [s for s in remaining
                    if all(dep in assigned for dep in get_dependencies(s, graph))]
        if not parallel:
            break
        layers.append(parallel)
        assigned.update(parallel)
        remaining -= set(parallel)
    return layers
```

**task_skill.md 文件位置**：`.claude/skills/tasks/current/task_skill.md`

---

### 步骤5：执行流程控制（流式输出）

**初始化**：
```python
token_tracker = TokenTracker(task_budget=200000)
token_tracker.start_task(task_id)
stream = StreamOutput(enabled=True, task_file="tasks/current/task_skill.md")
stream.task_start(task_id, main_skill, total_skills, intent_summary, complexity_score, confidence)
```

**执行循环**（按并行层执行）：
```python
for layer in parallel_layers:
    # 同层内技能可并行，但这里采用串行+流式输出（避免文件锁冲突）
    for skill in layer:
        stream.skill_start(skill_name, index, total, desc=skill.desc)
        try:
            result = execute_atomic_skill(skill)
            elapsed = time.time() - start_time
            stream.skill_success(skill_name, index, total, result.get("summary"), elapsed)

            # 记录token消耗
            if hasattr(result, 'llm_usage'):
                token_tracker.record_skill_usage(
                    skill_name, result.llm_usage.input_tokens,
                    result.llm_usage.output_tokens
                )
        except Exception as e:
            will_retry = retry_count < 3
            stream.skill_fail(skill_name, str(e), will_retry, retry_count, max_retries=3)
            handle_error(skill, e)  # 见下方错误处理
```

**错误处理**：
```python
def assess_error_impact(failed_skill, task_context):
    score = 0
    score += 3 if find_dependent_skills(failed_skill) else 0
    score += 2 if failed_skill.is_core else 0
    score += 2 if failed_skill.modifies_shared_data else 0
    score -= 1 if failed_skill.output_reproducible else 0
    score += 2 if failed_skill.user_required else 0
    # ≥5：严重影响（暂停）；3-4：中等影响（提示用户）；≤2：轻微影响（记录继续）

def handle_error(skill, error):
    impact = assess_error_impact(skill)
    if impact >= 5:
        # 暂停，提示用户选择：重试/跳过/取消/人工修复
        raise PauseException(f"Skill {skill} failed with high impact: {impact}")
    else:
        # 记录错误，继续执行
        record_error(skill, error)
        continue_execution()
```

**Token追踪**（每次LLM调用后）：
```python
response = client.messages.create(...)
token_tracker.record_skill_usage(
    skill_name=skill.name,
    input_tokens=response.usage.input_tokens,
    output_tokens=response.usage.output_tokens
)
# 80%预警、95%严重警告、100%终止
```

---

### 步骤6：任务恢复

**触发**：用户请求恢复或任务中断后重新启动

**处理**：
1. 读取 `tasks/current/task_skill.md` 获取当前状态
2. 从最后一个"已完成"的原子skill之后继续
3. 检测计划合理性（如依赖关系被跳过、顺序不当）
4. **允许的调整**：微调顺序、补充同类型原子skill（最多3个）
5. **禁止的调整**：替换主skill、新增未注册技能

---

### 步骤7：结果校验与反思

**校验流程**：
```python
def verify_completion(task_skill):
    results = []
    for standard in task_skill.completion_standards:
        passed = verify_standard(standard)
        results.append({"standard": standard, "passed": passed})

    all_passed = all(r["passed"] for r in results)
    deviation = calculate_deviation(task_skill.goal, results)
    trigger_reflection = deviation >= 0.2
    return {"all_passed": all_passed, "deviation": deviation, "trigger": trigger_reflection}

def reflection_loop(task_skill, max_attempts=3):
    for attempt in range(1, max_attempts + 1):
        stream.reflection_progress(attempt, max_attempts, issue=detect_issue(task_skill))
        adjust_plan(task_skill)  # 补充同类型skill / 调整顺序
        verify_again = verify_completion(task_skill)
        if verify_again.all_passed or verify_again.deviation < 0.2:
            return True  # 反思成功
    return False  # 3次反思后仍不达标，放弃反思
```

**反思日志格式**（最多300字）：
```
反思日志：
- 关键问题：[一句话描述核心问题]
- 根因分析：[不超过50字]
- 优化方向：[不超过100字，可落地的建议]
```

---

### 步骤8：结果输出

**输出内容**：
1. 任务概览：ID、主skill、执行时长、复杂度、成功率
2. 关键成果：各原子skill的核心产出
3. 执行摘要：成功/失败数量、重试次数
4. 失败信息：重试失败的skill及原因
5. 反思日志：关键问题、优化方向（如有）
6. Token消耗：任务级总消耗、输入/输出token数、预估成本、预算使用率

**Token消耗汇总格式**：
```
💰 Token 消耗摘要（任务 {task_id}）
   总消耗: {total_tokens:,} token
   输入: {input_tokens:,} | 输出: {output_tokens:,}
   预估成本: ${cost:.4f}
   调用次数: {count} 次，平均 {avg:,} token/次
   预算使用: {pct:.1f}%
   耗时: {duration}秒
```

---

### 步骤9：任务归档

**处理**：
1. 生成归档时间戳（精确到秒）
2. 移动 `task_skill.md` 到 `tasks/history/YYYY-MM/`
3. 更新月度索引（追加新任务条目）
4. 提示可固化文档（用户选择是否移至项目目录）

---

## 4. 决策点汇总

| 决策点 | 触发位置 | 触发条件 | 选项数量 | 默认行为 |
|--------|---------|---------|---------|---------|
| D1 | 步骤2.3.1 | 发现未完成任务 | 2 | 开始新任务 |
| D2 | 步骤3 | 多skill匹配 | Top3 | 选最高分 |
| D3 | 步骤5 | 原子skill失败（高影响） | 4 | 重试 |
| D4 | 步骤6 | 执行计划需调整 | 2 | 接受调整 |
| D5 | 步骤7 | 3次反思后失败 | 3 | 输出当前结果 |
| D6 | 步骤9 | 检测到可固化文档 | 3 | 仅索引 |

详细交互模板见 `user_interaction.md`。

---

## 5. 文件系统结构

```
.claude/
├── skills/                          # v1.2 改进后的skill集合
│   ├── orchestrator/
│   │   ├── SKILL.md                     ← 本文件，总控入口
│   │   ├── README.md                    ← 使用说明
│   │   ├── algorithms.md                ← 核心算法（9个算法）
│   │   ├── config.md                    ← 配置参数（16个配置块）
│   │   ├── technical_implementation.md  ← 技术实现（11个模块）
│   │   ├── user_interaction.md          ← 用户交互（6个决策点）
│   │   ├── skills_register.md           ← 技能注册表（v1.2更新）
│   │   └── missing_skills.md            ← 缺失技能记录
│   ├── atomic-skills/                   # orchestrator的原子能力
│   │   ├── intent-recognition/
│   │   ├── skill-matcher/
│   │   ├── task-generator/
│   │   ├── execution-controller/
│   │   ├── result-validator/
│   │   └── task-archiver/
│   ├── code-generator/                  # 改进：+multi-scenario-adapter
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── atomic-skills/...
│   ├── code-optimizer/                   # 改进：+performance-analysis
│   ├── bug-solver/                       # 改进：+bug-triage
│   ├── code-redundancy-checker/
│   ├── code-style-generator/
│   ├── requirement-generator/
│   ├── scan-object-info/
│   ├── performance-optimizer/           # 新增
│   ├── security-scanner/                # 新增
│   ├── test-generator/                  # 新增
│   ├── doc-generator/                   # 新增
│   ├── git-helper/                      # 新增
│   └── deploy-helper/                   # 新增
└── skills/                              # v1.0 原始skill（保持不变）
    ├── orchestrator/...
    ├── bug-solver/...
    └── ...
```

---

## 6. 与其他组件的交互

```
Orchestrator (SKILL.md)
    ├── 读取 skills_register.md → 主skill列表
    ├── 读取 .claude/project_context.json → 项目上下文
    ├── 读取 tasks/history/YYYY-MM/月度任务索引.md → 历史检索
    ├── 读取 tasks/current/task_skill.md → 任务恢复
    ├── 写入 tasks/current/task_skill.md → 状态更新
    ├── 写入 tasks/history/YYYY-MM/task_skill_*.md → 归档
    ├── 写入 tasks/history/YYYY-MM/月度任务索引.md → 索引更新
    ├── 写入 missing_skills.md → 缺失记录
    └── 调用 主skill.SKILL.md → 协同生成task_skill
        └── 主skill.SKILL.md
            ├── 读取 atomic-skills/*/SKILL.md → 原子skill定义
            └── 写入 tasks/current/task_skill.md → 结果汇总
```

---

## 7. 关键规则（v1.2）

### 状态同步规则
- 并行层内：同一时间仅允许一个原子skill写入 `task_skill.md`
- 使用文件锁机制：`task_skill.md.lock`
- 写入使用原子操作（临时文件 → 重命名）

### Token追踪规则
- 任务开始时：`TokenTracker(task_budget=200000).start_task(task_id)`
- 每次LLM调用后：`record_skill_usage(skill_name, input_tokens, output_tokens)`
- 80% 预算：普通预警（⚠️）；95%：严重警告（🚨）；100%：终止任务

### 重试规则
- 单个原子skill：最多3次
- 反思重规划：最多3次
- 3次反思后仍不达标：放弃反思，进入结果输出

### 计划调整限制
- ✅ 允许：微调顺序、补充同类型原子skill（最多3个）
- ❌ 禁止：替换主skill、新增未注册技能

---

## 8. 版本与维护

- **版本**：1.2
- **最后更新**：2026-05-21
- **维护者**：项目团队
- **更新记录**：
  - v1.0：初始设计，9步流程，5个主skill
  - v1.2：全面重构，上下文感知，多skill组合，Token追踪增强，并行层识别，智能fallback