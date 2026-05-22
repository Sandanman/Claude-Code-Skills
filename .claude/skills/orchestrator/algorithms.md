# 核心算法实现

本文档详细说明 Orchestrator Reasoner 的核心算法实现。

---

## 1. 意图识别算法

### 1.1 复杂度评分

通过以下维度评分，总分 ≥ 3 判定为复杂目标：

| 维度 | 简单(1分) | 复杂(3分) | 权重 |
|------|-----------|-----------|------|
| 步骤数量 | 单步操作 | 多步操作 | 1.0 |
| 状态依赖 | 无状态 | 需保存状态 | 1.2 |
| 技能组合 | 单skill | 多skill协同 | 1.1 |
| 文件数量 | ≤2个文件 | >2个文件 | 0.8 |
| 决策点 | 无分支 | 多分支决策 | 0.9 |

**判断规则**：
```python
def calculate_complexity(intent):
    scores = []
    scores.append(1 if intent.is_single_step else 3)
    scores.append(1 if not intent.needs_state else 3)
    scores.append(1 if intent.single_skill else 3)
    scores.append(1 if intent.file_count <= 2 else 3)
    scores.append(1 if not intent.has_branches else 3)

    total = sum(s * w for s, w in zip(scores, [1.0, 1.2, 1.1, 0.8, 0.9]))
    return total / 5  # 归一化
```

### 1.2 意图压缩算法

**输出格式**（JSON结构）：
```json
{
  "intent_id": "INT_{timestamp}_{random4}",
  "domain": "frontend|backend|database|...",
  "action": "fix|create|optimize|refactor|analyze",
  "target": {
    "type": "file|component|api|function",
    "name": "具体名称",
    "path": "文件路径（可选）"
  },
  "constraints": ["技术栈约束", "兼容性要求"],
  "keywords": ["关键词1", "关键词2"],
  "success_criteria": "成功标准描述",
  "original_input": "用户原始输入（前100字符）",
  "complexity_score": 4
}
```

**压缩步骤**：
1. 提取核心动词作为 action
2. 识别目标对象类型和名称
3. 提取关键词列表（最多10个）
4. 总结成功标准（1-2句话）
5. 计算复杂度分数
6. 生成唯一 intent_id

---

### 1.3 复杂度评分（旧规则算法 - LLM不可用时的fallback）

> ⚠️ **注意**：以下规则算法仅作为 LLM 意图识别不可用时的 fallback 方案。正常情况下应由 LLM 进行意图识别（见 1.5 节）。

通过以下维度评分，总分 ≥ 3 判定为复杂目标：

| 维度 | 简单(1分) | 复杂(3分) | 权重 |
|------|-----------|-----------|------|
| 步骤数量 | 单步操作 | 多步操作 | 1.0 |
| 状态依赖 | 无状态 | 需保存状态 | 1.2 |
| 技能组合 | 单skill | 多skill协同 | 1.1 |
| 文件数量 | ≤2个文件 | >2个文件 | 0.8 |
| 决策点 | 无分支 | 多分支决策 | 0.9 |

**判断规则**：
```python
def calculate_complexity(intent):
    scores = []
    scores.append(1 if intent.is_single_step else 3)
    scores.append(1 if not intent.needs_state else 3)
    scores.append(1 if intent.single_skill else 3)
    scores.append(1 if intent.file_count <= 2 else 3)
    scores.append(1 if not intent.has_branches else 3)

    total = sum(s * w for s, w in zip(scores, [1.0, 1.2, 1.1, 0.8, 0.9]))
    return total / 5  # 归一化
```

### 1.4 意图压缩（旧规则算法 - LLM不可用时的fallback）

> ⚠️ **注意**：以下规则算法仅作为 LLM 意图识别不可用时的 fallback 方案。

**输出格式**（JSON结构）：
```json
{
  "intent_id": "INT_{timestamp}_{random4}",
  "domain": "frontend|backend|database|...",
  "action": "fix|create|optimize|refactor|analyze",
  "target": {
    "type": "file|component|api|function",
    "name": "具体名称",
    "path": "文件路径（可选）"
  },
  "constraints": ["技术栈约束", "兼容性要求"],
  "keywords": ["关键词1", "关键词2"],
  "success_criteria": "成功标准描述",
  "original_input": "用户原始输入（前100字符）",
  "complexity_score": 4
}
```

**压缩步骤**：
1. 提取核心动词作为 action
2. 识别目标对象类型和名称
3. 提取关键词列表（最多10个）
4. 总结成功标准（1-2句话）
5. 计算复杂度分数
6. 生成唯一 intent_id

---

## 1.5 LLM意图识别（新 - 主要方案）

> ✅ **推荐**：以下 LLM 驱动的意图识别为主方案，能够处理模糊、多义、隐含的用户输入，比规则匹配更准确。规则算法（1.3/1.4节）仅作为 LLM 不可用时的 fallback。

### 1.5.1 LLM意图识别流程

```
用户原始输入
    ↓
构造意图分析Prompt（系统提示词 + 用户输入）
    ↓
调用 LLM（使用 config.md 中的配置参数）
    ↓
解析 LLM 返回的 JSON
    ↓
验证JSON格式（intent_id、domain、action等字段）
    ↓ 验证失败
fallback: 使用规则算法（1.3/1.4节）生成意图
    ↓ 验证成功
返回结构化意图（与规则算法格式完全兼容）
```

### 1.5.2 意图分析系统提示词

```python
INTENT_SYSTEM_PROMPT = """
你是一个专业的 AI 代码助手意图分析专家。你的任务是对用户的自然语言输入进行深度分析，提取结构化的意图信息。

【分析原则】
1. 深入理解用户的真实需求，而不仅仅是表面文字
2. 对于模糊的输入，基于上下文做出合理推断
3. 识别隐含的需求和潜在的问题
4. 区分简单任务和复杂任务

【简单任务判断标准】- 满足以下 ALL 条件才算简单：
  ✅ 单个操作即可完成（无需分解为多个步骤）
  ✅ 不需要保存中间状态供后续使用
  ✅ 仅涉及一个原子技能（见下方技能列表）
  ✅ 不涉及复杂决策或多分支逻辑
  ✅ 修改/创建文件数量 ≤ 2 个

【复杂任务特征】- 满足以下 ANY 条件即为复杂：
  ❌ 需要多步骤执行
  ❌ 需要保存状态供后续步骤使用
  ❌ 需要多个技能协同完成
  ❌ 涉及多文件操作（> 2个）
  ❌ 包含条件判断或分支逻辑
  ❌ 涉及多个领域（前端+后端+数据库等）

【领域分类】domain（选择一个最匹配的）
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

【操作分类】action（选择一个最匹配的）
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

【约束提取】
从用户输入中识别并提取：
- 技术栈约束（"必须用 Vue3"、"不能用 jQuery"）
- 兼容性要求（"兼容 IE11"、"移动端适配"）
- 性能要求（"支持1000并发"、"首屏<2s"）
- 其他约束（"不能引入新依赖"、"保持现有风格"）

【关键词提取】
提取最能代表任务本质的关键词（最多10个），用于后续技能匹配和历史检索。

【成功标准】
明确描述任务完成后的可验证标准，描述应该是具体可测量的。
"""
```

### 1.5.3 意图分析用户输入模板

```python
INTENT_USER_TEMPLATE = """
【用户输入】
{user_input}

【已注册的主技能列表】（用于判断涉及领域和匹配技能）
主技能列表：{main_skills_list}
（如果用户意图与某个主技能高度相关，domain 应选择该技能对应领域）

【项目上下文】（如果有）
{project_context}
（如果存在项目上下文，需要结合上下文理解用户意图）

请分析上述用户输入，输出以下格式的 JSON（纯JSON，不要有其他内容）：

{{
  "intent_id": "INT_时间戳_四位随机数",
  "domain": "领域标签（从上面列表中选择，或推断一个新的通用领域）",
  "action": "主要操作类型（从上面列表中选择最匹配的）",
  "target": {{
    "type": "file|component|api|function|module|page|feature|system|other",
    "name": "具体名称或描述",
    "path": "文件路径或目录（如果有，可为空字符串）"
  }},
  "constraints": ["约束1", "约束2"],
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "success_criteria": "成功标准描述（一句话，具体可验证）",
  "original_input": "用户原始输入（完整保留，最多截取前200字符）",
  "complexity_assessment": {{
    "is_simple": true或false,
    "complexity_score": 1到10的数字,
    "reasoning": "复杂度判断的理由（50字以内）",
    "requires_multiple_steps": true或false,
    "needs_state": true或false,
    "requires_multiple_skills": true或false,
    "involves_multiple_files": true或false,
    "has_branching": true或false,
    "estimated_skills": ["可能需要的技能名称"]
  }},
  "confidence": {{
    "overall": 0.0到1.0之间的置信度,
    "domain_confidence": 0.0到1.0,
    "action_confidence": 0.0到1.0,
    "complexity_confidence": 0.0到1.0,
    "uncertain_aspects": ["描述不确定的方面"]
  }}
}}

注意：
1. 仅输出 JSON，不要有 ```json 或其他格式标记
2. 如果用户输入非常模糊，基于上下文做出合理推断
3. complexity_score：1-3为简单，4-6为一般复杂，7-10为非常复杂
4. confidence 反映分析结果的可靠性，低于 0.6 时需要提示用户确认
"""
```

### 1.5.4 LLM意图识别代码实现

```python
import re
import json
import time
import random

def llm_intent_recognition(user_input: str,
                            main_skills_list: list = None,
                            project_context: str = None) -> dict:
    """
    LLM驱动的意图识别函数

    Args:
        user_input: 用户原始输入
        main_skills_list: 已注册的主技能列表（用于上下文）
        project_context: 项目上下文信息（可选）

    Returns:
        dict: 结构化意图对象（与规则算法格式兼容）

    流程:
        1. 构造Prompt（系统提示词 + 用户输入）
        2. 调用LLM
        3. 解析JSON响应
        4. 验证格式
        5. 通过验证 → 返回结果
        6. 验证失败 → fallback到规则算法
    """
    from config import LLM_INTENT_CONFIG

    # Step 1: 构造Prompt
    skills_text = ""
    if main_skills_list:
        skills_text = "\n".join([
            f"- {s['name']}: {s['desc']}"
            for s in main_skills_list
        ])
    else:
        skills_text = "（无可用技能列表）"

    context_text = project_context if project_context else "（无项目上下文）"

    user_prompt = INTENT_USER_TEMPLATE.format(
        user_input=user_input,
        main_skills_list=skills_text,
        project_context=context_text
    )

    # Step 2: 调用LLM
    try:
        from anthropic import Anthropic
        client = Anthropic()

        response = client.messages.create(
            model=LLM_INTENT_CONFIG["model"],
            max_tokens=LLM_INTENT_CONFIG["max_tokens"],
            system=INTENT_SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": user_prompt
            }],
            temperature=LLM_INTENT_CONFIG["temperature"]
        )

        raw_response = response.content[0].text.strip()

    except Exception as e:
        print(f"[意图识别] LLM调用失败: {e}，使用规则算法 fallback")
        return rule_based_intent_recognition(user_input)

    # Step 3: 解析JSON
    # 尝试从响应中提取JSON（处理响应中可能包含的额外文本）
    json_match = re.search(
        r'\{[\s\S]*\}',
        raw_response,
        re.MULTILINE
    )

    if not json_match:
        print(f"[意图识别] LLM响应无法解析为JSON，使用规则算法 fallback")
        return rule_based_intent_recognition(user_input)

    try:
        intent_data = json.loads(json_match.group())
    except json.JSONDecodeError as e:
        print(f"[意图识别] JSON解析失败: {e}，使用规则算法 fallback")
        return rule_based_intent_recognition(user_input)

    # Step 4: 验证必需字段
    required_fields = [
        "intent_id", "domain", "action", "target",
        "constraints", "keywords", "success_criteria",
        "original_input", "complexity_assessment", "confidence"
    ]

    missing_fields = [f for f in required_fields if f not in intent_data]

    if missing_fields:
        print(f"[意图识别] 缺少字段: {missing_fields}，使用规则算法 fallback")
        return rule_based_intent_recognition(user_input)

    # Step 5: 补充和标准化
    # 确保 intent_id 格式正确
    if not intent_data["intent_id"].startswith("INT_"):
        timestamp = time.strftime("%Y%m%d%H%M%S")
        random_id = random.randint(1000, 9999)
        intent_data["intent_id"] = f"INT_{timestamp}_{random_id}"

    # 确保 target 是字典
    if isinstance(intent_data["target"], str):
        intent_data["target"] = {
            "type": "unknown",
            "name": intent_data["target"],
            "path": ""
        }

    # 提取复杂度分数（兼容新旧格式）
    complexity = intent_data.get("complexity_assessment", {})
    if isinstance(complexity, dict):
        intent_data["complexity_score"] = complexity.get("complexity_score", 3)
        intent_data["complexity_reasoning"] = complexity.get("reasoning", "")
    else:
        intent_data["complexity_score"] = int(complexity)
        intent_data["complexity_reasoning"] = ""

    # Step 6: 检查置信度，生成警告
    confidence = intent_data.get("confidence", {})
    overall_confidence = confidence.get("overall", 1.0)

    if overall_confidence < LLM_INTENT_CONFIG["confidence_threshold"]:
        uncertain = confidence.get("uncertain_aspects", [])
        print(f"[意图识别] ⚠️ 置信度较低 ({overall_confidence:.2f})，不确定方面: {uncertain}")
        print(f"[意图识别] 建议向用户确认意图")

    # Step 7: 添加元数据
    intent_data["recognition_method"] = "llm"
    intent_data["llm_model"] = LLM_INTENT_CONFIG["model"]
    intent_data["recognition_timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")

    return intent_data


def rule_based_intent_recognition(user_input: str) -> dict:
    """
    规则算法意图识别（LLM不可用时的fallback）
    保留原有的规则解析逻辑，但输出格式与LLM版本兼容
    """
    # 原有规则算法逻辑...
    # （见 1.3 和 1.4 节的实现）

    timestamp = time.strftime("%Y%m%d%H%M%S")
    random_id = random.randint(1000, 9999)

    intent = {
        "intent_id": f"INT_{timestamp}_{random_id}",
        "domain": detect_domain(user_input),
        "action": extract_action(user_input),
        "target": extract_target(user_input),
        "constraints": extract_constraints(user_input),
        "keywords": extract_keywords(user_input),
        "success_criteria": generate_success_criteria(user_input),
        "original_input": user_input[:200],
        "complexity_score": calculate_complexity(user_input),
        "complexity_reasoning": "由规则算法生成（LLM不可用）",
        "recognition_method": "rule_based_fallback",
        "recognition_timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    return intent


def detect_domain(user_input: str) -> str:
    """基于关键词识别领域"""
    domain_keywords = {
        "frontend": ["vue", "react", "组件", "页面", "样式", "css", "html", "前端"],
        "backend": ["api", "接口", "后端", "数据库", "server", "node"],
        "database": ["sql", "mongodb", "数据库", "表结构", "query"],
        "security": ["安全", "认证", "授权", "登录", "权限", "加密"],
        "testing": ["测试", "test", "单元测试", "e2e"],
        "refactoring": ["重构", "优化", "简化", "重写"],
        "debugging": ["bug", "错误", "修复", "问题", "调试"]
    }

    user_input_lower = user_input.lower()
    for domain, keywords in domain_keywords.items():
        if any(kw.lower() in user_input_lower for kw in keywords):
            return domain
    return "general"


def extract_action(user_input: str) -> str:
    """基于关键词识别操作类型"""
    action_keywords = {
        "fix": ["修复", "解决", "bug", "错误", "问题"],
        "create": ["新建", "创建", "实现", "添加"],
        "optimize": ["优化", "改进", "提升", "性能"],
        "refactor": ["重构", "重写", "简化"],
        "analyze": ["分析", "扫描", "诊断", "检查"],
        "document": ["文档", "注释", "说明"],
        "test": ["测试", "验证"],
        "deploy": ["部署", "发布", "上线"]
    }

    user_input_lower = user_input.lower()
    for action, keywords in action_keywords.items():
        if any(kw.lower() in user_input_lower for kw in keywords):
            return action
    return "create"


def extract_target(user_input: str) -> dict:
    """提取目标对象"""
    # 简化的目标提取逻辑
    return {
        "type": "unknown",
        "name": user_input[:50],
        "path": ""
    }


def extract_constraints(user_input: str) -> list:
    """提取约束条件"""
    constraints = []
    constraint_keywords = ["必须", "不能", "需要", "要求", "只能"]
    for kw in constraint_keywords:
        if kw in user_input:
            constraints.append(kw + user_input.split(kw)[1].split("，")[0].split("。")[0])
    return constraints[:5]


def extract_keywords(user_input: str) -> list:
    """提取关键词"""
    stop_words = {"的", "是", "在", "和", "了", "我", "你", "他", "她", "它"}
    words = [w for w in user_input if len(w) > 1 and w not in stop_words]
    return list(set(words))[:10]


def generate_success_criteria(user_input: str) -> str:
    """生成成功标准"""
    return f"完成用户描述的需求：{user_input[:50]}..."


def calculate_complexity(user_input: str) -> int:
    """
    简化版复杂度评分（fallback专用）
    返回 1-10 的分数
    """
    score = 3  # 默认中等复杂度

    # 多步骤指示
    step_indicators = ["然后", "接着", "最后", "其次", "第一", "第二", "第三"]
    if any(ind in user_input for ind in step_indicators):
        score += 2

    # 多文件指示
    file_indicators = ["多个", "几个", "不同的", "多个文件"]
    if any(ind in user_input for ind in file_indicators):
        score += 1

    # 复杂描述
    if len(user_input) > 100:
        score += 1

    return min(max(score, 1), 10)  # 限制在1-10范围
```

### 1.5.5 LLM意图识别使用流程

```python
def recognize_intent(user_input: str,
                    use_llm: bool = True,
                    main_skills_list: list = None,
                    project_context: str = None) -> dict:
    """
    统一的意图识别入口函数

    Args:
        user_input: 用户原始输入
        use_llm: 是否优先使用LLM（False时强制使用规则算法）
        main_skills_list: 已注册的主技能列表
        project_context: 项目上下文

    Returns:
        dict: 结构化意图对象
    """
    from config import LLM_INTENT_CONFIG

    # 如果显式禁用LLM，直接使用规则算法
    if not use_llm:
        print("[意图识别] LLM已被禁用，使用规则算法")
        return rule_based_intent_recognition(user_input)

    # 如果配置要求优先使用规则算法
    if not LLM_INTENT_CONFIG.get("enabled", True):
        print("[意图识别] LLM意图识别未启用，使用规则算法")
        return rule_based_intent_recognition(user_input)

    # 检查是否需要强制使用规则算法
    # （简单查询、帮助请求等场景）
    simple_patterns = [
        r"^help$", r"^帮助$", r"^怎么用", r"^如何使用",
        r"^what.*skill", r"^有哪些.*技能"
    ]
    for pattern in simple_patterns:
        if re.match(pattern, user_input.lower().strip()):
            print("[意图识别] 检测到简单查询，使用规则算法")
            return rule_based_intent_recognition(user_input)

    # 使用LLM进行意图识别
    print("[意图识别] 使用LLM进行意图分析...")
    return llm_intent_recognition(
        user_input=user_input,
        main_skills_list=main_skills_list,
        project_context=project_context
    )
```

### 1.5.6 与现有流程集成

意图识别在 Orchestrator 中的完整集成流程：

```python
# Orchestrator 执行入口
def orchestrator_main(user_input: str):
    """
    Orchestrator 主执行流程
    """
    # ========== 步骤1：意图识别与目标推理 ==========
    # 读取已注册的主技能列表（用于LLM上下文）
    main_skills = load_main_skills()

    # 读取项目上下文（如果存在）
    project_context = load_project_context()

    # 统一意图识别入口
    # use_llm=True 启用LLM识别（主方案）
    # use_llm=False 强制规则算法
    intent = recognize_intent(
        user_input=user_input,
        use_llm=True,  # ✅ 新增：LLM意图识别
        main_skills_list=main_skills,
        project_context=project_context
    )

    # 根据复杂度判断执行路径
    if intent["complexity_assessment"]["is_simple"]:
        # 简单目标：直接执行单个原子技能
        print(f"[意图识别] 判定为简单目标，直接执行")
        direct_execute(intent)
        return

    # 复杂目标：进入完整执行流程
    print(f"[意图识别] 判定为复杂目标，进入任务编排流程")
    print(f"  - 领域: {intent['domain']}")
    print(f"  - 操作: {intent['action']}")
    print(f"  - 复杂度: {intent['complexity_score']}/10")
    if intent.get("confidence", {}).get("overall", 1.0) < 0.6:
        print(f"  ⚠️ 置信度较低: {intent['confidence']['overall']:.2f}")
        print(f"  ⚠️ 不确定方面: {intent['confidence'].get('uncertain_aspects', [])}")

    # ========== 后续步骤（略）==========
    # 步骤2：历史意图检索
    # 步骤3：主skill匹配
    # ... (其余流程不变)
```

### 1.5.7 置信度低时的用户确认机制

当 LLM 意图识别的置信度低于阈值（默认0.6）时，应向用户确认：

```python
def prompt_intent_confirmation(intent: dict) -> str:
    """
    当置信度低时，向用户确认意图

    Args:
        intent: LLM识别出的意图

    Returns:
        str: 用户确认后的意图（确认/修改/忽略）
    """
    confidence = intent.get("confidence", {})
    uncertain = confidence.get("uncertain_aspects", [])

    confirmation_prompt = f"""
🤔 我对您的意图理解有一定不确定性（置信度: {confidence.get('overall', 0):.0%}），请确认：

【我的理解】
- 领域: {intent['domain']}
- 操作: {intent['action']}
- 目标: {intent['target']['name']}
- 复杂度: {'简单' if intent['complexity_assessment']['is_simple'] else '复杂'}

【不确定的方面】
{chr(10).join(f"  - {a}" for a in uncertain) if uncertain else "  无"}

【请选择】
A. 确认 - 我的理解正确，开始执行
B. 修改 - 需要调整以上内容
C. 忽略 - 直接执行我的原始需求
"""

    # 等待用户响应...
    # (使用 user_interaction.md 中的确认机制)
```

---

## 2. 历史意图检索算法

### 2.1 特征提取

**特征向量**：
```python
feature_vector = {
    "domain": String,           # 领域标签
    "action": String,           # 操作类型
    "target_type": String,      # 目标类型
    "keywords": Array[String],  # 关键词列表（权重高）
    "tech_stack": Array[String],# 技术栈
    "complexity": Number        # 复杂度分数
}
```

**特征权重**：
- domain: 0.25
- action: 0.20
- keywords: 0.30（最重要）
- target_type: 0.15
- tech_stack: 0.10

### 2.2 相似度计算

**相似度计算公式**：
```python
def calculate_similarity(intent_a, intent_b):
    # 各维度相似度
    domain_sim = 1 if intent_a.domain == intent_b.domain else 0
    action_sim = 1 if intent_a.action == intent_b.action else 0

    # Jaccard相似度
    keywords_a = set(intent_a.keywords)
    keywords_b = set(intent_b.keywords)
    keyword_sim = len(keywords_a & keywords_b) / len(keywords_a | keywords_b)

    target_sim = 1 if intent_a.target_type == intent_b.target_type else 0

    tech_a = set(intent_a.tech_stack)
    tech_b = set(intent_b.tech_stack)
    tech_sim = len(tech_a & tech_b) / len(tech_a | tech_b) if (tech_a | tech_b) else 0

    # 加权求和
    similarity = (
        0.25 * domain_sim +
        0.20 * action_sim +
        0.30 * keyword_sim +
        0.15 * target_sim +
        0.10 * tech_sim
    )

    return similarity
```

**召回策略**：
- 从月度索引中召回 Top 3-5
- 相似度排序：按 similarity 降序
- 阈值判断：similarity ≥ 0.85 认为高度相似
- Top1 ≥ 0.85：直接使用历史结果
- 0.70 ≤ similarity < 0.85：作为参考案例展示

---

## 3. 主skill匹配算法

### 3.1 匹配分数计算

```python
def calculate_match_score(intent, skill):
    match_score = 0

    # 1. 关键词精确匹配（权重0.5）
    for keyword in intent.keywords:
        if keyword in skill.match_keywords:
            match_score += 0.5

    # 2. 领域匹配（权重0.3）
    if intent.domain in skill.core_ability:
        match_score += 0.3

    # 3. 操作类型匹配（权重0.2）
    if intent.action in skill.match_keywords:
        match_score += 0.2

    # 归一化到 [0, 1]
    max_score = 0.5 * len(intent.keywords) + 0.3 + 0.2
    return match_score / max_score if max_score > 0 else 0
```

### 3.2 匹配结果判定

```python
def match_main_skill(intent, skills_register):
    candidates = []

    for skill in skills_register:
        if skill.status != "启用":
            continue

        score = calculate_match_score(intent, skill)
        if score >= 0.4:
            candidates.append({
                "skill": skill,
                "score": score
            })

    # 按分数排序
    candidates.sort(key=lambda x: x["score"], reverse=True)

    if len(candidates) == 0:
        return None, "no_match"
    elif len(candidates) == 1:
        return candidates[0]["skill"], "unique"
    else:
        return candidates[:3], "multiple"  # 返回Top 3
```

---

## 4. 依赖关系分析算法

### 4.1 DAG构建与循环检测

```python
def build_dependency_graph(atomic_skills):
    """
    构建依赖图并检测循环依赖
    """
    graph = {skill.name: [] for skill in atomic_skills}
    in_degree = {skill.name: 0 for skill in atomic_skills}

    for skill in atomic_skills:
        if skill.depend and skill.depend != "无":
            dependencies = skill.depend.split(", ")
            for dep in dependencies:
                if dep in graph:
                    graph[dep].append(skill.name)
                    in_degree[skill.name] += 1

    # 检测循环依赖（DFS）
    visited = set()
    rec_stack = set()

    def has_cycle(node):
        visited.add(node)
        rec_stack.add(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                if has_cycle(neighbor):
                    return True
            elif neighbor in rec_stack:
                return True

        rec_stack.remove(node)
        return False

    for node in graph:
        if node not in visited:
            if has_cycle(node):
                return None, "检测到循环依赖"

    return graph, in_degree
```

### 4.2 拓扑排序（Kahn算法）

```python
def topological_sort(graph, in_degree):
    """
    拓扑排序，返回执行顺序
    """
    from collections import deque

    queue = deque([node for node in in_degree if in_degree[node] == 0])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node)

        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(result) != len(in_degree):
        return None  # 存在循环依赖

    return result
```

### 4.3 并行执行识别

```python
def identify_parallel_skills(sorted_skills, dependencies):
    """
    识别可并行执行的原子skill
    """
    layers = []
    assigned = set()

    for skill in sorted_skills:
        if skill in assigned:
            continue

        # 找出所有依赖已完成的skill
        parallel_group = []
        for s in sorted_skills:
            if s in assigned:
                continue

            deps = dependencies.get(s, [])
            if all(d in assigned for d in deps):
                parallel_group.append(s)

        if parallel_group:
            layers.append(parallel_group)
            assigned.update(parallel_group)

    return layers
```

---

## 5. 完成标准验证算法

### 5.1 验证类型

```python
VERIFICATION_TYPES = {
    "文件存在": lambda path: os.path.exists(path),
    "代码功能": lambda spec: run_tests(spec),
    "质量指标": lambda metrics: check_metrics(metrics),
    "用户确认": lambda checklist: user_confirm(checklist),
}

def verify_completion(skill, task_context):
    """
    验证原子skill是否完成
    """
    criteria = skill.completion_criteria
    results = []

    for criterion in criteria:
        vtype = criterion.type

        if vtype == "文件存在":
            result = VERIFICATION_TYPES["文件存在"](criterion.path)
            results.append({
                "criterion": criterion.description,
                "passed": result,
                "details": f"路径: {criterion.path}"
            })

        elif vtype == "代码功能":
            result = VERIFICATION_TYPES["代码功能"](criterion.test_spec)
            results.append({
                "criterion": criterion.description,
                "passed": result.all_passed,
                "details": f"通过{result.passed_count}/{result.total_count}项测试"
            })

        elif vtype == "质量指标":
            result = VERIFICATION_TYPES["质量指标"](criterion.metrics)
            passed = all(
                getattr(result, m.name) >= m.threshold
                for m in criterion.metrics
            )
            results.append({
                "criterion": criterion.description,
                "passed": passed,
                "details": str(result)
            })

        elif vtype == "用户确认":
            result = VERIFICATION_TYPES["用户确认"](criterion.check_list)
            results.append({
                "criterion": criterion.description,
                "passed": result.confirmed,
                "details": "用户确认"
            })

    passed_count = sum(r["passed"] for r in results)
    return {
        "all_passed": passed_count == len(results),
        "passed_count": passed_count,
        "total_count": len(results),
        "details": results
    }
```

---

## 6. 目标偏差评估算法

### 6.1 量化指标计算

```python
def calculate_deviation(goal, result):
    """
    计算目标偏差值
    """
    deviations = []

    for standard in goal.standards:
        if standard.is_quantifiable:
            expected = standard.target_value
            actual = result.get(standard.metric_name)

            if expected > 0:
                deviation = abs(actual - expected) / expected
            else:
                deviation = 1.0 if actual != 0 else 0.0

            deviations.append({
                "metric": standard.name,
                "expected": expected,
                "actual": actual,
                "deviation": deviation,
                "weight": standard.weight
            })

    # 加权平均
    total_weight = sum(d["weight"] for d in deviations)
    weighted_deviation = sum(
        d["deviation"] * d["weight"]
        for d in deviations
    ) / total_weight if total_weight > 0 else 0

    return {
        "overall_deviation": weighted_deviation,
        "details": deviations,
        "trigger_reflection": weighted_deviation >= 0.2
    }
```

### 6.2 偏差等级

```
偏差值 < 0.1: 优秀
0.1 ≤ 偏差值 < 0.2: 合格
偏差值 ≥ 0.2: 触发反思
```

---

## 7. 错误影响判断算法

### 7.1 影响评分模型

```python
def assess_error_impact(failed_skill, task_context):
    """
    评估错误影响
    """
    impact_score = 0

    # 1. 依赖关系影响（权重3）
    dependent_skills = find_dependent_skills(failed_skill, task_context)
    if dependent_skills:
        impact_score += 3

    # 2. 核心功能影响（权重2）
    if failed_skill.is_core:
        impact_score += 2

    # 3. 数据一致性影响（权重2）
    if failed_skill.modifies_shared_data:
        impact_score += 2

    # 4. 可恢复性（权重-1）
    if failed_skill.output_reproducible:
        impact_score -= 1

    # 5. 用户指定重要性（权重2）
    if failed_skill.user_required:
        impact_score += 2

    # 判断影响等级
    if impact_score >= 5:
        level = "严重影响"
        action = "暂停任务"
    elif impact_score >= 3:
        level = "中等影响"
        action = "提示用户选择"
    else:
        level = "轻微影响"
        action = "记录并继续"

    return {
        "score": impact_score,
        "level": level,
        "action": action,
        "dependent_skills": dependent_skills
    }
```

---

## 8. 反思重规划算法

### 8.1 反思触发条件

```python
def should_trigger_reflection(verification_result, deviation_result):
    """
    判断是否触发反思
    """
    return (
        not verification_result["all_passed"] or
        deviation_result["trigger_reflection"]
    )
```

### 8.2 反思分类

```python
def classify_reflection_issue(task_context):
    """
    分类反思问题
    """
    issues = []

    # 1. 执行顺序问题
    if detect_suboptimal_order(task_context):
        issues.append({
            "type": "execution_order",
            "description": "执行顺序非最优",
            "solution": "调整原子skill执行顺序"
        })

    # 2. 技能匹配问题
    if detect_skill_mismatch(task_context):
        issues.append({
            "type": "skill_selection",
            "description": "存在更合适的原子skill未被使用",
            "solution": "替换或补充原子skill"
        })

    # 3. 标准设定问题
    if detect_unrealistic_standards(task_context):
        issues.append({
            "type": "standard_setting",
            "description": "完成标准过于严格",
            "solution": "优化完成标准（不降低最终目标）"
        })

    return issues
```

### 8.3 重规划限制

**允许的调整**：
- 微调原子技能顺序（不违反依赖）
- 补充同类型原子技能（最多3个）
- 删除冗余原子技能
- 优化完成标准（不降低最终目标）

**禁止的调整**：
- 替换主skill
- 新增未注册技能
- 删除已完成的skill记录
- 降低最终目标

---

**版本**: 1.0
**最后更新**: 2026-04-07
