# Code Structure Analyzer 主 Skill v1.0（韬定律增强版）

> 本 skill 读取项目中某个页面、业务模块或流程的代码，分析整体流程、逻辑、关键节点、重要变量和依赖关系，在同目录下生成以分析对象命名的 md 文档。

## 版本历史

- **v1.1** (2026-06-09): 新增 D5 决策点「子元素逻辑询问」
  - 步骤 1.5：自动检测本地子元素引用，询问用户展开深度
  - 新增 `子元素引用` 章节（条件渲染）
  - 文档模板增加 child_logic_section 占位符
- **v1.0** (2026-06-06): 初始版本，整合韬定律（τ 控制、Task Folding、Skill Stacking、Pattern Mining）
  - 基于 code-structure-analyzer 模板创建

---

## 核心能力

- 代码结构扫描（支持 Vue/React/Node.js 等主流框架）
- 流程逻辑分析（同步/异步流程、事件流、数据流）
- 关键节点识别（入口点、分支点、循环点、异常处理）
- 变量/依赖提取（状态变量、API 调用、组件引用、外部依赖）
- 依赖关系图生成（文件级、模块级依赖）
- 自动生成结构化文档（.md 格式）

---

## 韬定律整合

| 关键技术 | Agent 映射 | 实现位置 |
|---------|-----------|---------|
| K1 Task Folding | 合并代码扫描 + 依赖分析 | 步骤 2/3 并行执行 |
| K2 Skill Stacking | 复用 scan-object-info 上下文 | 步骤 1 上下文读取 |
| K3 Co-Design | Model 分析流程 + Rules 规范输出格式 | 各步骤显式分工 |
| K4 Pattern Mining | 复用已有分析模式 | 步骤 4 模式匹配 |

---

## 输入/输出规范

### 输入

| 参数 | 类型 | 说明 |
|------|------|------|
| target_path | string | 待分析的代码路径（文件或目录） |
| options.depth | string | 分析深度：shallow/moderate/deep |
| options.include_patterns | string[] | 包含的文件模式（可选） |
| options.exclude_patterns | string[] | 排除的文件模式（可选） |

### 输出

在 `target_path` 所在目录下生成 `{分析对象名称}.md`，包含：
- 代码概览（文件数量、代码行数、技术栈）
- 文件结构树
- 执行流程（ASCII 流程图）
- 关键节点分析表
- 重要变量清单
- 依赖关系图
- 模块边界说明

---

## 使用场景

| 场景 | 输入示例 | 输出示例 |
|------|---------|---------|
| 单文件分析 | `src/views/UserList.vue` | `src/views/UserList.md` |
| 模块分析 | `src/store/modules/auth` | `src/store/modules/auth.md` |
| 流程分析 | `src/api/auth.ts` | `src/api/auth.md` |
| 整个项目 | `src/` | `src.md` |

---

## 执行流程（5 步，τ 增强）

### 步骤 1：代码读取与上下文感知

**输入**：target_path

**处理**：

```python
# Skill Stacking：尝试复用 scan-object-info 的上下文
# 如果存在 tasks/current/task_skill.md，读取其中的技术栈信息
if has_shared_context("scan-object-info"):
    tech_stack = read_from_shared_context("scan-object-info", "tech_stack")
    project_type = read_from_shared_context("scan-object-info", "project_type")
else:
    tech_stack = detect_tech_stack_from_path(target_path)
    project_type = infer_project_type(target_path)

# τ 预算分配
tau_budget = TAU_BUDGETS["moderate"]  # 默认 moderate

# 读取目标文件
files = collect_files(
    target_path,
    include_patterns=options.get("include_patterns", ["*.vue", "*.ts", "*.js", "*.tsx", "*.jsx"]),
    exclude_patterns=options.get("exclude_patterns", ["*.spec.ts", "*.test.ts", "node_modules"])
)
```

**τ 记录**：
```python
tau_controller.record_step(step="read", duration_ms=elapsed_ms, tokens=llm_tokens)
co_design["read"] = {"model": 0.3, "rules": 0.5, "skills": 0.2}
```

---

### 步骤 1.5：子元素引用询问（D5 决策点）

**触发条件**：发现存在本地子元素引用（import 本项目内的非第三方文件）

**处理**：

```python
# 提取本地子元素引用（排除 node_modules 和第三方库）
child_refs = extract_local_imports(files)

# 本地引用示例：
# import { useAuth } from '@/composables/useAuth'    → 本地 composable
# import UserCard from './UserCard.vue'             → 本地组件
# import { formatDate } from '@/utils/date'          → 本地工具函数

if len(child_refs) == 0:
    child_action = "skip"  # 无本地引用，直接跳过
else:
    # 询问用户（τ 预算充足时自动展开，否则 prompt）
    if tau_controller.is_budget_sufficient(budget=3000):
        # τ 充足：自动选择"读取签名+核心逻辑"，并通知用户
        child_action = "read_signatures"
        tau_controller.notify_user(f"τ 预算充足，自动展开 {len(child_refs)} 个子元素逻辑")
    else:
        child_action = ask_user(
            f"检测到 {len(child_refs)} 个本地子元素引用，是否展开读取其逻辑？",
            options=[
                {"label": "仅列出引用（默认，快速）", "value": "list_only"},
                {"label": "读取签名+核心逻辑（推荐）", "value": "read_signatures"},
                {"label": "深度读取全部逻辑", "value": "deep_read"},
            ]
        )

# 执行读取（根据用户选择）
if child_action == "list_only":
    child_logic = None  # 仅保留引用列表，不读取内容
elif child_action == "read_signatures":
    child_logic = read_child_signatures(child_refs, max_depth=3)
    # 输出格式：{ ref_path: { name, signature, purpose, location } }
elif child_action == "deep_read":
    child_logic = deep_read_children(child_refs, max_depth=5)
    # 输出格式：{ ref_path: { name, signature, purpose, location, logic_summary, key_variables } }
```

**child_refs 提取规则**：

```python
def extract_local_imports(files: list) -> list:
    """
    提取本地（非第三方）import 引用
    排除：node_modules、npm 包名（如 vue、lodash、@ant-design/...）
    保留：本项目相对路径（./、../）和路径别名（@/、~@/）
    """
    local_patterns = [
        r"from\s+['\"](?!.*node_modules)(?!.*\w+[-]\w+)(?!.*@\w+)[\./].*['\"]",
        r"from\s+['\"][@][\/].*['\"]",
    ]
    # 过滤逻辑：
    # 1. 不含 node_modules → 排除 npm 包
    # 2. 以 ./、../ 开头 → 本地相对路径
    # 3. 以 @/ 开头 → 路径别名
    # 4. 包名不含连字符/下划线（排除 @ant-design/、lodash 等）
    return matched_imports
```

**τ 记录**：
```python
tau_controller.record_step(step="child_ask", duration_ms=elapsed_ms, tokens=llm_tokens)
co_design["child_ask"] = {"model": 0.2, "rules": 0.6, "skills": 0.2}
```

---

### 步骤 2：代码结构解析与 Task Folding

**处理**：

```python
# Task Folding：合并代码扫描 + 依赖分析（并行执行）
# 避免串行扫描两次文件系统

def parse_code_structure_parallel(files: list):
    # 轨道 A：代码结构扫描（文件、函数、组件）
    # 轨道 B：依赖关系解析（import/export/require）
    # 两轨并行，合并输出

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=2) as executor:
        future_structure = executor.submit(scan_code_structure, files)
        future_dependencies = executor.submit(scan_dependencies, files)

        structure_result = future_structure.result()
        dependency_result = future_dependencies.result()

    return merge_results(structure_result, dependency_result)
```

**代码结构提取**：

```python
def scan_code_structure(files: list) -> dict:
    """
    扫描代码结构，提取：
    - 文件列表和大小
    - 函数/方法定义（含参数、返回值）
    - 组件定义（Vue component、React component）
    - 类定义（TypeScript class）
    - 常量/枚举定义
    """
    results = []
    for file in files:
        if file.lang in ["vue", "typescript", "javascript"]:
            parsed = parse_code_file(file)
            results.append(parsed)
    return results

def parse_code_file(file: File) -> dict:
    """根据文件类型选择解析策略"""
    parsers = {
        "vue": parse_vue_component,
        "typescript": parse_ts_file,
        "javascript": parse_js_file,
        "tsx": parse_react_component,
        "jsx": parse_react_component,
    }
    parser = parsers.get(file.extension, parse_generic)
    return parser(file)
```

**依赖关系提取**：

```python
def scan_dependencies(files: list) -> dict:
    """
    扫描依赖关系，提取：
    - 文件级 import/export
    - npm 依赖（package.json）
    - 环境变量使用
    - API 端点引用
    """
    deps = {"files": {}, "npm": set(), "env": set(), "apis": set()}
    for file in files:
        imports = extract_imports(file.content)
        deps["files"][file.path] = imports

        # npm 依赖
        if file.extension in [".ts", ".js"]:
            npm_deps = extract_npm_packages(imports)
            deps["npm"].update(npm_deps)

        # 环境变量
        env_vars = extract_env_usage(file.content)
        deps["env"].update(env_vars)

        # API 调用
        apis = extract_api_calls(file.content)
        deps["apis"].update(apis)

    return deps
```

**τ 记录**：
```python
tau_controller.record_step(step="parse", duration_ms=elapsed_ms, tokens=llm_tokens)
co_design["parse"] = {"model": 0.6, "rules": 0.2, "skills": 0.2}
```

---

### 步骤 3：流程逻辑分析与关键节点识别

**处理**：

```python
# 流程分析：识别执行流程的关键节点
def analyze_flow_logic(structure: dict, dependencies: dict) -> dict:
    """
    分析流程逻辑，输出：
    - 执行流程图（ASCII）
    - 关键节点列表
    - 流程类型判断（CRUD/状态机/事件驱动/数据流）
    """

    # 识别入口点（无入边的文件或被其他文件 import 的文件）
    entry_points = identify_entry_points(dependencies)

    # 识别关键节点（出边最多的节点）
    critical_nodes = identify_critical_nodes(dependencies)

    # 判断流程类型
    flow_type = classify_flow_type(structure, entry_points)

    # 生成 ASCII 流程图
    flow_diagram = generate_flow_diagram(
        entry_points=entry_points,
        critical_nodes=critical_nodes,
        dependencies=dependencies
    )

    return {
        "entry_points": entry_points,
        "critical_nodes": critical_nodes,
        "flow_type": flow_type,
        "flow_diagram": flow_diagram,
    }
```

**关键节点类型**：

| 节点类型 | 识别规则 | 说明 |
|---------|---------|------|
| 入口点 | 无入边依赖，或 main/export 默认导出 | 用户触发的起点 |
| 分支点 | if/switch/try-catch/条件渲染 | 逻辑分叉 |
| 循环点 | for/while/map/forEach/reduce | 重复执行 |
| 汇聚点 | 多个路径的终点 | 流程汇合 |
| API 调用点 | await/then/async function | 异步交互 |
| 状态变更点 | ref/reactive/setState/store dispatch | 数据变化 |
| 边界点 | props/emits/definePropsdefineEmits | 模块边界 |

**变量提取规则**：

```python
def extract_important_variables(file_content: str, file_type: str) -> dict:
    """
    提取重要变量：
    - 状态变量（ref/reactive/state/setState）
    - 计算属性（computed/computed properties）
    - 接口定义（interface/type/enum）
    - 常量（const 定义的配置型变量）
    - API 相关变量（endpoint、method、headers）
    """

    rules = {
        "vue": [r"const\s+(\w+)\s*=\s*ref\(", r"const\s+(\w+)\s*=\s*reactive\("],
        "react": [r"const\s+\[(\w+),\s*set\w+\]\s*=\s*useState", r"const\s+(\w+)\s*=\s*useRef"],
        "ts": [r"interface\s+(\w+)", r"type\s+(\w+)\s*=", r"enum\s+(\w+)"],
        "generic": [r"const\s+(\w+)\s*=\s*[^=]+(?:API|URL|ENDPOINT|CONFIG)"]
    }

    # τ 增强：使用规则匹配（低 τ），而非 LLM 分析（高 τ）
    variables = []
    for pattern in rules.get(file_type, rules["generic"]):
        matches = re.findall(pattern, file_content)
        variables.extend(matches)

    return dedupe_variables(variables)
```

**τ 记录**：
```python
tau_controller.record_step(step="analyze", duration_ms=elapsed_ms, tokens=llm_tokens)
co_design["analyze"] = {"model": 0.7, "rules": 0.1, "skills": 0.2}
```

---

### 步骤 4：文档生成

**处理**：

```python
# Pattern Mining：尝试复用已有模式
patterns = pattern_miner.search_patterns(
    intent={"domain": "analysis", "action": "code-structure"},
    pattern_library_base=".claude/skills/code-structure-analyzer/patterns/",
    threshold=0.6
)

if patterns["matched_count"] > 0:
    template = patterns["matched_patterns"][0]["template"]
    tau_discount = patterns["aggregate_discount"]
else:
    template = None
    tau_discount = 0.0

# 生成文档（传入子元素逻辑数据）
doc = generate_structure_document(
    target_path=target_path,
    structure=structure_result,
    dependencies=dependency_result,
    flow=flow_analysis,
    variables=variables,
    child_logic=child_logic,
    child_action=child_action,
    template=template
)
```

**文档模板**（默认，使用模板时 τ 折扣 70%）

```markdown
# {分析对象名称} 代码结构分析

> 生成时间：{timestamp} | 分析深度：{depth} | 技术栈：{tech_stack}

## 1. 代码概览

| 指标 | 值 |
|------|-----|
| 文件数量 | {file_count} |
| 代码行数 | {line_count} |
| 技术栈 | {tech_stack} |
| 流程类型 | {flow_type} |
| 入口文件 | {entry_file} |

## 2. 文件结构

```
{file_tree}
```

## 3. 执行流程

```
{flow_diagram}
```

### 流程说明

{flow_description}

## 4. 关键节点

| 节点 | 类型 | 位置 | 说明 |
|------|------|------|------|
{critical_nodes_table}

## 5. 重要变量

### 状态变量

| 变量名 | 类型 | 位置 | 用途 |
|--------|------|------|------|
{state_variables_table}

### 接口/类型定义

| 名称 | 类型 | 位置 | 说明 |
|------|------|------|------|
{interface_table}

## 6. 依赖关系

### NPM 依赖

{npm_dependencies}

### 模块依赖

```mermaid
{dependency_diagram}
```

### 环境变量

{env_variables}

### API 端点

{api_endpoints}

### 子元素引用（{child_action_desc}）

{child_logic_section}

> 💡 D5 决策点说明：
> - `仅列出引用`：仅展示 import 关系，不读取子元素内容
> - `读取签名+核心逻辑`：展示子元素的方法签名、用途、位置
> - `深度读取全部逻辑`：额外展示子元素的核心变量和业务逻辑摘要

## 7. 模块边界

{module_boundaries}

## 8. 总结

{summary}
```

**τ 记录**：
```python
tau_controller.record_step(step="generate", duration_ms=elapsed_ms, tokens=llm_tokens)
co_design["generate"] = {"model": 0.5, "rules": 0.3, "skills": 0.2}
```

---

### 步骤 5：文档输出与归档

**处理**：

```python
# 确定输出文件名
target_name = get_basename(target_path)
output_path = join(dirname(target_path), f"{target_name}.md")

# τ 增强：检查是否需要覆盖（已存在时提示用户）
if exists(output_path):
    # 提示用户：覆盖/合并/重命名
    action = prompt_user_overwrite(output_path)
    if action == "merge":
        output_path = merge_documents(existing=read_file(output_path), new=doc)
    elif action == "rename":
        output_path = get_unique_name(output_path)

# 写入文件
write_file(output_path, doc)

# τ 效率评分
tau_efficiency = tau_controller.calculate_efficiency_score(task_quality=1.0)

# Pattern 存储（如果 τ 充足且质量高，存入模式库）
if tau_efficiency > 0.7 and is_quality_acceptable(doc):
    pattern_miner.store_pattern(
        category=get_category_from_path(target_path),
        pattern={
            "domain_action": "analysis_code-structure",
            "template": extract_template(doc),
            "flow_type": flow_analysis["flow_type"],
            "tech_stack": tech_stack,
            "tau_budget": tau_controller.get_consumed(),
        }
    )

return {
    "success": True,
    "output_path": output_path,
    "tau_consumed": tau_controller.get_consumed(),
    "tau_efficiency": tau_efficiency,
}
```

---

## τ 预算配置

| 分析深度 | τ 预算 | 说明 |
|---------|--------|------|
| shallow | 3,000 | 快速扫描，适合大型模块 |
| moderate | 12,000 | 标准分析（默认），含子元素引用询问 |
| deep | 25,000 | 深度分析，含所有变量和依赖及子元素完整逻辑 |

> 注：子元素读取（步骤 1.5）τ 消耗：list_only ≈ 0 / read_signatures ≈ 2,000 / deep_read ≈ 5,000+
> τ 充足时（> 40% 剩余）自动选择 read_signatures，不足时 prompt 用户选择

---

## 关键决策点

| 决策点 | 触发条件 | 选项 | 默认 |
|--------|---------|------|------|
| D1 分析深度 | 未指定 depth | shallow/moderate/deep | moderate |
| D2 文档覆盖 | 输出文件已存在 | 覆盖/合并/重命名 | prompt |
| D3 模式复用 | 找到匹配模式（相似度 ≥ 0.6）| 使用模板/自定义 | 使用模板 |
| D4 上下文复用 | scan-object-info 上下文存在 | 复用/重新检测 | 复用 |
| D5 子元素逻辑 | 存在本地子元素引用（import 本项目非第三方文件） | 展开读取/仅列出引用/跳过 | 仅列出引用 |

---

## 文件系统结构

```
.claude/skills/code-structure-analyzer/
├── SKILL.md                         ← 本文件
├── README.md                        ← 使用说明
└── patterns/                        ← 模式库（Pattern Mining）
    ├── vue-crud-flow.md            # Vue CRUD 流程模式
    ├── react-state-flow.md         # React 状态流模式
    ├── node-api-flow.md            # Node.js API 流程模式
    └── generic-module-flow.md      # 通用模块流程模式
```

---

## 与其他 Skill 的关系

| 关系 | Skill | 交互方式 |
|------|-------|---------|
| 上游（Skill Stacking）| scan-object-info | 读取共享上下文中的 tech_stack、project_type |
| 下游 | doc-generator | 生成的结构化数据可传入 doc-generator |
| 平行 | bug-solver | 可接收 code-structure-analyzer 的分析结果 |
| 平行 | code-optimizer | 可基于结构分析结果进行优化建议 |

---

## 触发关键词

- 分析代码结构 / 代码结构分析
- 生成流程图 / 流程分析
- 提取依赖关系 / 依赖分析
- 关键节点识别 / 节点分析
- 变量提取 / 状态变量分析

---

**版本**: 1.1
**最后更新**: 2026-06-09
**理论基础**: 华为韬定律（τ-Law）K1-K4