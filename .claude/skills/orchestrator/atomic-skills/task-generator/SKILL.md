---
name: task-generator
description: 任务Skill生成 — 根据意图和匹配的主skill，构建原子skill依赖DAG，生成可执行的task_skill.md文档，包含并行层识别和执行顺序
---

# Task Generator 原子Skill

## 概述

任务生成是 Orchestrator 编排链路的第三环，接收结构化意图和匹配的主skill，为其生成完整的原子skill执行计划。此skill读取主skill对应的原子skill列表，构建有向无环图（DAG）描述依赖关系，执行 Kahn 拓扑排序确定串行执行顺序，并识别出可并行执行的原子skill层（parallel layers）。最终输出标准化的 `task_skill.md` 文件，放置于 `tasks/current/` 目录。

## 核心能力

- DAG 构建：从原子skill的依赖声明构建有向无环图
- 循环依赖检测：在拓扑排序前检测图中的环，防止死锁
- Kahn 拓扑排序：基于入度计算，获取合法的串行执行顺序
- 并行层识别：识别出同一层内无依赖的原子skill，支持并行执行优化
- Task文件生成：生成包含任务信息、原子skill表、执行顺序、完成标准、执行日记模板的完整文档
- 主skill协同：与主skill协同确定哪些原子skill需要执行及其顺序

## 输入

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| intent | object | 是 | intent-recognition 输出的结构化意图 |
| matched_main_skill | string / array | 是 | skill-matcher 输出的选中主skill名称 |
| atomic_skills_list | array | 是 | 主skill对应的原子skill定义列表（含 name, description, depends_on 等） |
| parallel_layers | array | 否 | 已计算的并行层（如由 orchestrator 直接传入可跳过计算） |

## 输出

`tasks/current/task_skill_{intent_id}.md` 文件，内容包含：

```markdown
# Task Skill - {task_id}

## 任务基础信息
- **task_id**: TASK_{timestamp}_{random4}
- **intent_id**: {intent_id}
- **intent_summary**: {意图摘要}
- **main_skill**: {匹配的技能名称}
- **complexity_score**: {复杂度分}
- **status**: pending
- **created_at**: {timestamp}
- **estimated_duration**: {预估时长}分钟

## 意图详情
- domain: {领域}
- action: {操作}
- target: {目标}
- constraints: {约束列表}
- success_criteria: {成功标准}

## 原子Skill执行计划

### 执行顺序（串行拓扑排序）
1. skill-1-name
2. skill-2-name
3. skill-3-name

### 并行层结构
| 层 | 原子Skill | 依赖 | 状态 |
|----|-----------|------|------|
| 1  | skill-A   | 无   | pending |
| 1  | skill-B   | 无   | pending |
| 2  | skill-C   | skill-A | pending |
| 3  | skill-D   | skill-C | pending |

### 原子Skill详情表
| # | 原子Skill | 描述 | 依赖 | 完成标准 |
|---|-----------|------|------|---------|
| 1 | skill-A   | xxx  | 无   | xxx     |
| 2 | skill-B   | xxx  | 无   | xxx     |
| 3 | skill-C   | xxx  | skill-A | xxx   |
| 4 | skill-D   | xxx  | skill-C | xxx   |

## 主Skill完成标准
- [ ] 标准1：xxx
- [ ] 标准2：xxx

## 执行日记
> 每行格式：`{timestamp} | {skill_name} | {status} | {duration}ms | {summary}`

## 结果汇总
> 任务完成后填写
- 结果等级：完成 / 部分完成 / 失败
- 关键成果：...
- 失败信息：...
- 反思日志：...
- Token消耗：...

## 任务状态快照
- current_layer: 0
- current_skill_index: 0
- started_at: null
- completed_at: null
- total_duration_ms: null
```

## 执行逻辑

1. **构建 DAG**：
   ```python
   def build_dependency_graph(atomic_skills):
       graph = {s.name: [] for s in atomic_skills}   # 邻接表：key依赖谁
       in_degree = {s.name: 0 for s in atomic_skills}
       for s in atomic_skills:
           if s.depend_on and s.depend_on != "无":
               for dep in s.depend_on.split(", "):
                   graph[dep].append(s.name)
                   in_degree[s.name] += 1
       return graph, in_degree
   ```

2. **循环依赖检测**：
   ```python
   def detect_cycles(graph, all_nodes):
       visited = set()
       rec_stack = set()
       for node in all_nodes:
           if detect_cycle_util(node, graph, visited, rec_stack):
               return True
       return False
   # 存在环：抛出错误，不生成task_skill.md
   ```

3. **Kahn 拓扑排序**（获取串行执行顺序）：
   ```python
   def topological_sort(graph, in_degree):
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
       if len(result) != len(graph):
           return []  # 存在循环依赖
       return result
   ```

4. **并行层识别**（identify_parallel_layers）：
   ```python
   def identify_parallel_layers(sorted_skills, graph):
       # 反向图：从谁被依赖的角度
       reverse_graph = {n: [] for n in graph}
       for dep, targets in graph.items():
           for t in targets:
               reverse_graph[t].append(dep)

       layers = []
       assigned = set()
       remaining = set(sorted_skills)
       while remaining:
           # 找出所有依赖已满足的skill（被分配的skill中没有依赖指向它的）
           parallel = [
               s for s in remaining
               if all(dep in assigned for dep in reverse_graph[s])
           ]
           if not parallel:
               break
           layers.append(parallel)
           assigned.update(parallel)
           remaining -= set(parallel)
       return layers
   ```

5. **生成 task_skill.md**：将上述所有信息填入标准模板，输出到 `tasks/current/task_skill_{intent_id}.md`

6. **文件锁保护**：写入前创建临时文件，写入后原子重命名，避免并发冲突

## 依赖关系

- **被依赖**：execution-controller, result-validator（依赖生成的 task_skill.md）
- **依赖**：intent-recognition, skill-matcher（输入来自前两个skill）

## 完成标准

1. task_skill.md 文件已创建在 `tasks/current/` 目录
2. 文件包含 task_id、意图信息、主skill、原子skill表、完成标准、执行日记模板、结果汇总区域
3. 所有原子skill均有依赖描述和完成标准
4. 并行层结构已识别，每层的 skill 列表非空
5. 执行顺序（拓扑排序结果）与并行层结构一致
6. 循环依赖检测通过（存在环时拒绝生成并报错）
7. 主skill完成标准已从意图的 success_criteria 转化而来

## 错误处理

- **循环依赖存在**：抛出错误，输出哪些skill形成了环，不生成 task_skill.md，提示用户检查依赖声明
- **原子skill列表为空**：生成纯占位 task_skill.md，标注为无需执行
- **写入文件失败**（权限/磁盘空间）：抛出 PauseException，暂停整个任务
- **缺失依赖指向的skill**：忽略无法解析的依赖，在日志中记录警告

## 示例

**输入**：
```json
{
  "intent_id": "INT_20260522_a1b2",
  "matched_main_skill": "code-generator",
  "atomic_skills_list": [
    {"name": "需求解析", "depends_on": "无", "desc": "解析需求文档"},
    {"name": "代码生成", "depends_on": "需求解析", "desc": "生成代码文件"},
    {"name": "代码审查", "depends_on": "无", "desc": "审查生成代码"},
    {"name": "测试生成", "depends_on": "代码生成", "desc": "生成单元测试"}
  ]
}
```

**DAG**：
```
需求解析 ──> 代码生成 ──> 测试生成
代码审查（独立）
```

**并行层**：
```
Layer 1: [需求解析, 代码审查]  可并行
Layer 2: [代码生成]           等待需求解析
Layer 3: [测试生成]           等待代码生成
```

**task_skill.md 输出路径**：`tasks/current/task_skill_INT_20260522_a1b2.md`

## 注意事项

- 依赖关系的声明应尽量简单，避免过度嵌套（建议最多3层）
- 并行层识别时，同一层的skill共享 task_skill.md 的写入锁，应串行写入
- task_skill.md 的 status 字段是流程状态的唯一来源，执行控制器严格依赖此字段
- 生成的 task_skill.md 应尽量保持幂等，相同输入应产生相同文件

## 原子skill位置

./.claude/skills/atomic-skills/task-generator/SKILL.md