# 全局技能注册表（原子技能详情）

> 主技能索引请查看 `skills_register.md`。

version: 1.5
说明：
1. 原子技能仅供对应主技能读取，用于生成 `task_skill.md`
2. 所有原子技能需在本文件注册，未注册技能不允许被主技能选择和执行
3. 新增、删除或修改原子技能时，同步更新本文件

---

## 0. orchestrator 原子技能

```yaml
atomic_skills:
  - name: intent-recognition
    core_ability: 将用户输入转化为结构化意图，识别领域、操作、目标、约束、复杂度和置信度
    depend: 无
    status: 启用
  - name: skill-matcher
    core_ability: 根据结构化意图匹配主 Skill，处理单匹配、多匹配和无匹配 fallback
    depend: intent-recognition
    status: 启用
  - name: task-generator
    core_ability: 构建依赖 DAG、检测循环依赖、执行拓扑排序、识别并行层并生成任务文件
    depend: intent-recognition, skill-matcher
    status: 启用
  - name: execution-controller
    core_ability: 按依赖和并行层执行原子 Skill，持久化状态、共享上下文和错误日志
    depend: task-generator
    status: 启用
  - name: result-validator
    core_ability: 校验完成标准、量化结果偏差并执行有限反思循环
    depend: execution-controller
    status: 启用
  - name: task-archiver
    core_ability: 移动任务文件、更新月度索引、记录执行摘要并验证归档结果
    depend: result-validator
    status: 启用
```

---

```yaml
atomic_skills:
  - name: requirement-reader
    core_ability: 读取需求文档（requirements.json 或文本），判断输入类型和复杂度
    depend: 无
    status: 启用
  - name: requirement-analysis
    core_ability: 解析需求文档或用户描述，提取功能点、输入输出、边界条件，识别单模块/多模块需求
    depend: requirement-reader（fallback模式）
    status: 启用
  - name: tech-stack-detection
    core_ability: 自动检测项目技术栈（框架、语言、构建工具等），检查是否存在CODE_STYLE.md
    depend: requirement-reader 或 requirement-analysis
    status: 启用
  - name: code-design
    core_ability: 根据需求分析和技术栈检测结果，设计代码结构、数据模型和接口
    depend: tech-stack-detection, requirement-reader
    status: 启用
  - name: code-generation
    core_ability: 根据设计文档和CODE_STYLE.md规范，生成具体代码文件
    depend: code-design
    status: 启用
  - name: module-integration
    core_ability: 整合多模块需求生成的代码，解决模块间依赖关系，统一共享资源
    depend: code-generation
    status: 启用
  - name: code-validation
    core_ability: 验证生成的代码语法正确性、规范符合性和功能完整性
    depend: code-generation 或 module-integration
    status: 启用
  - name: documentation-update
    core_ability: 为生成的代码添加完整注释，确保所有组件、函数、类型都有清晰的文档说明
    depend: code-validation
    status: 启用
  - name: multi-scenario-adapter
    core_ability: 根据需求类型（简单/复杂/多模块）自动适配执行流程，智能选择代码生成模式
    depend: requirement-reader
    status: 启用
```

---

## 2. code-optimizer 原子技能


```yaml
atomic_skills:
  - name: quality-and-perf-analysis
    core_ability: 并行执行代码质量静态分析和性能数据收集，统一输出质量报告和性能基线
    depend: 无
    status: 启用
  - name: redundancy-check
    core_ability: 深度检测代码冗余（重复代码、死代码和冗余导入），输出 severity 分级和 fix-suggestion
    depend: 无
    status: 启用
    parallel_with: quality-and-perf-analysis
  - name: pattern-and-benchmark-recognition
    core_ability: 识别可优化代码模式并生成性能基准测试用例
    depend: quality-and-perf-analysis, redundancy-check
    status: 启用
  - name: optimization-proposal
    core_ability: 基于模式识别和基准测试生成优化方案，包含 diff 格式代码修改
    depend: pattern-and-benchmark-recognition
    status: 启用
  - name: code-optimization
    core_ability: 应用优化方案（代码重构和构建配置优化），生成回滚脚本
    depend: optimization-proposal
    status: 启用
  - name: optimization-verification
    core_ability: 验证优化效果（质量和性能双维度），生成 Before/After 对比报告和 PASS/FAIL 判定
    depend: code-optimization
    status: 启用
  - name: documentation-update
    core_ability: 更新相关文档，确保文档与代码保持同步
    depend: optimization-verification
    status: 启用
```

---


```yaml
atomic_skills:
  - name: bug-triage
    core_ability: 对用户报告的bug进行分类，判断优先级和类型（前端/后端/配置/逻辑），决定后续处理策略
    depend: 无
    status: 启用
  - name: bug-identification
    core_ability: 收集和整理用户提供的bug信息，创建结构化的问题描述文档，为后续分析提供基础
    depend: bug-triage
    status: 启用
  - name: code-analysis
    core_ability: 基于问题识别阶段的报告，分析相关代码文件，识别潜在的代码问题、异常处理、边界条件等
    depend: bug-identification
    status: 启用
  - name: root-cause-analysis
    core_ability: 基于代码分析报告和错误日志，定位bug的根本原因，明确导致问题的代码行和逻辑缺陷
    depend: code-analysis
    status: 启用
  - name: fix-generation
    core_ability: 根据根因定位报告，设计并生成具体的代码修复方案，提供可执行的修改建议
    depend: root-cause-analysis
    status: 启用
  - name: fix-verification
    core_ability: 验证修复方案是否真正解决了问题，并检查是否引入了新的问题
    depend: fix-generation
    status: 启用
  - name: test-suggestion
    core_ability: 基于修复验证结果，为修复的bug建议测试用例，覆盖正常路径和异常场景，防止问题再次发生
    depend: fix-verification
    status: 启用
```

---

## 5. code-style-generator 原子技能

```yaml
atomic_skills:
  - name: detect-config-rules
    core_ability: 检测项目配置文件，提取代码格式化规则（缩进、引号、分号等）
    depend: 无
    status: 启用
  - name: scan-code-patterns
    core_ability: 扫描项目代码文件，推断命名规范、引号习惯、组件风格等
    depend: detect-config-rules
    status: 启用
  - name: generate-probe-code
    core_ability: 生成覆盖所有规则的精简代码片段，供用户确认
    depend: detect-config-rules, scan-code-patterns
    status: 启用
  - name: confirm-and-supplement
    core_ability: 展示探测代码，收集用户反馈，补充无法自动检测的规则
    depend: generate-probe-code
    status: 启用
  - name: generate-style-document
    core_ability: 整合所有信息，生成最终的 CODE_STYLE.md 文件
    depend: confirm-and-supplement
    status: 启用
```

---


```yaml
atomic_skills:
  - name: pattern-matcher
    depend: 无
    status: 启用
    parallel_group: 0
  - name: scan-package-json
    core_ability: 解析 package.json，提取项目基础信息、依赖、脚本等
    depend: 无
    status: 启用
    parallel_group: 1
  - name: scan-project-structure
    core_ability: 扫描项目目录结构、入口文件、核心文件夹
    depend: 无
    status: 启用
    parallel_group: 1
  - name: scan-config-context
    depend: scan-package-json
    status: 启用
    parallel_group: 1
  - name: detect-tech-stack
    depend: scan-package-json, scan-project-structure, scan-config-context
    status: 启用
    parallel_group: 2
  - name: detect-net-router
    depend: scan-package-json, scan-project-structure, detect-tech-stack
    status: 启用
    parallel_group: 2
  - name: skill-stack-context
    core_ability: 将所有原子技能的执行结果写入 task_skill.md 共享上下文，供下游技能复用
    depend: 所有前置技能
    status: 启用

# 并行执行计划（v1.2 优化）
# 并行组1（无依赖）：scan-package-json + scan-project-structure + scan-config-context
# 并行组2（依赖组1）：detect-tech-stack + detect-net-router
# 串行（最后）：skill-stack-context
```

---

## 7. requirement-generator 原子技能

```yaml
atomic_skills:
  - name: requirement-input-processor
    core_ability: 处理多模态需求输入（文本、图片、文档），提取核心信息
    depend: 无
    status: 启用
  - name: requirement-decomposition
    core_ability: 将复杂需求拆解为功能模块，识别模块边界和依赖关系
    depend: requirement-input-processor
    status: 启用
  - name: requirement-analysis
    core_ability: 分析需求类型（新建/修改）、API需求、权限需求
    depend: requirement-decomposition
    status: 启用
  - name: function-flow-designer
    core_ability: 识别功能流程类型（CRUD、线性、状态机等），设计流程节点和流转
    depend: requirement-analysis
    status: 启用
  - name: ui-component-identifier
    core_ability: 识别所需的UI组件类型（form、button、table等）
    depend: function-flow-designer
    status: 启用
  - name: api-spec-designer
    core_ability: 设计REST API接口规格（method、path、request、response、auth）
    depend: requirement-analysis
    status: 启用
  - name: test-case-generator
    core_ability: 生成测试用例，覆盖正常路径和异常场景
    depend: requirement-analysis, ui-component-identifier
    status: 启用
  - name: requirement-evaluation
    core_ability: 评估需求质量，给出综合评分和优化建议
    depend: requirement-decomposition, api-spec-designer, test-case-generator
    status: 启用
  - name: project-context-reader
    core_ability: 读取项目上下文（来自 scan-object-info 或用户上传的 project_context.json）
    depend: requirement-evaluation
    status: 启用
  - name: requirement-documentation
    core_ability: 生成 requirements.json 和 requirements.md 标准文档
    depend: 所有前置技能
    status: 启用
```

---

## 8. performance-optimizer 原子技能


```yaml
atomic_skills:
  # 以下已合并（仅作历史记录）:
  - name: performance-data-collection  → 合并入 quality-and-perf-analysis
  - name: performance-analysis          → 合并入 quality-and-perf-analysis
  - name: benchmark-generation          → 合并入 pattern-and-benchmark-recognition
  - name: optimization-strategy-design  → 合并入 optimization-proposal
  - name: optimization-application      → 合并入 code-optimization
  - name: optimization-verification    → 合并入 optimization-verification
```

---

## 9. security-scanner 原子技能

```yaml
atomic_skills:
  - name: vulnerability-scan
    core_ability: 扫描XSS、CSRF、注入等常见Web安全漏洞
    depend: 无
    status: 启用
  - name: dependency-security-check
    core_ability: 检查依赖包的安全漏洞（npm audit）
    depend: 无
    status: 启用
  - name: sensitive-info-detection
    core_ability: 检测敏感信息泄露（API密钥、密码、token硬编码）
    depend: 无
    status: 启用
  - name: security-report
    core_ability: 汇总安全扫描结果，生成安全报告
    depend: vulnerability-scan, dependency-security-check, sensitive-info-detection
    status: 启用
```

---

## 10. test-generator 原子技能

```yaml
atomic_skills:
  - name: test-case-design
    core_ability: 设计测试用例，覆盖正常路径、边界条件、异常场景
    depend: 无
    status: 启用
  - name: test-framework-detection
    core_ability: 检测项目使用的测试框架（Vitest、Jest、Playwright）
    depend: 无
    status: 启用
  - name: test-code-generation
    core_ability: 根据测试用例设计生成测试代码
    depend: test-case-design, test-framework-detection
    status: 启用
  - name: test-verification
    core_ability: 验证测试代码的正确性，确保测试可运行
    depend: test-code-generation
    status: 启用
```

---

## 11. doc-generator 原子技能

```yaml
atomic_skills:
  - name: api-doc-extraction
    core_ability: 从代码中提取API定义（endpoint、参数、返回值）
    depend: 无
    status: 启用
  - name: component-doc-generation
    core_ability: 生成组件文档（props、events、slots、usage）
    depend: 无
    status: 启用
  - name: changelog-generation
    core_ability: 生成变更日志（基于git commit和PR）
    depend: 无
    status: 启用
  - name: doc-format-conversion
    core_ability: 文档格式转换（Markdown ↔ HTML ↔ PDF）
    depend: api-doc-extraction 或 component-doc-generation
    status: 启用
```

---


```yaml
atomic_skills:
  - name: intent-router
    core_ability: 分析用户 Git 意图（commit/branch/conflict/version/stash/history），路由到最少的必要原子技能
    depend: 无
    status: 启用
  - name: commit-generation
    core_ability: 生成符合 Conventional Commits 规范的提交信息，支持批量规范检查和修正建议
    depend: intent-router
    status: 启用
  - name: branch-management
    core_ability: 分支 CRUD 操作 + 分支健康分析（过期/长期/命名规范/合并建议）
    depend: intent-router
    status: 启用
  - name: conflict-resolution
    core_ability: 分析 Git 冲突类型，提供 ours/theirs 详细分析和分步解决指南
    depend: intent-router
    status: 启用
  - name: history-analysis
    core_ability: 分析 Git 历史（git log、blame、shortlog 排名、变更频率）
    depend: intent-router
    status: 启用
  - name: stash-management
    core_ability: Stash 操作（save/pop/list/drop/apply），stash 健康分析
    depend: intent-router
    status: 启用
  - name: version-management
    core_ability: Tag 管理、CHANGELOG 生成、semver 版本建议
    depend: intent-router
    status: 启用
  - name: cloud-map-sync
    core_ability: 将提交前的代码改动摘要同步到项目云图
    depend: commit-generation
    status: 启用
```

---

## 13. deploy-helper 原子技能

```yaml
atomic_skills:
  - name: dockerfile-generation
    core_ability: 生成 Dockerfile 和 docker-compose.yml
    depend: 无
    status: 启用
  - name: cicd-pipeline-generation
    core_ability: 生成 CI/CD 流水线配置（GitHub Actions、GitLab CI）
    depend: 无
    status: 启用
  - name: env-config-generation
    core_ability: 生成环境变量配置文件和部署脚本
    depend: 无
    status: 启用
  - name: deployment-verification
    core_ability: 验证部署结果（健康检查、回滚机制）
    depend: cicd-pipeline-generation 或 env-config-generation
    status: 启用
```

---



```yaml
atomic_skills:
  - name: code-read-and-context
    core_ability: 读取目标代码文件，收集文件列表和代码内容，尝试复用 scan-object-info 上下文（tech_stack/project_type）
    depend: 无
    status: 启用
    parallel_group: 0
  - name: code-structure-parse
    depend: code-read-and-context
    status: 启用
    parallel_group: 1
  - name: flow-logic-analysis
    core_ability: 分析流程逻辑，识别入口点/分支点/循环点/API调用点/状态变更点，生成 ASCII 流程图，判断流程类型（CRUD/状态机/事件驱动）
    depend: code-structure-parse
    status: 启用
    parallel_group: 2
  - name: document-generation
    depend: flow-logic-analysis
    status: 启用
    parallel_group: 2
  - name: document-output
    core_ability: 写入文档到目标目录，处理覆盖/合并/重命名确认，存储高质量模式到 pattern 库
    depend: document-generation
    status: 启用

# 并行执行计划：
```

---


> 75% 深挖需求本身，25% 合理发散。所有不确定部分必须向用户提问。Step 4.5 新增逻辑流程图（Mermaid 泳道图）。

```yaml
atomic_skills:
  - name: requirement-receive
    core_ability: 解析用户输入，提取已明确信息，标记缺失项（标注 [待确认-原因]）
    depend: 无
    status: 启用
  - name: scope-confirm
    core_ability: 向用户提问确认模块范围（角色/核心功能/数据来源/集成需求），强制交互节点
    depend: requirement-receive
    status: 启用
  - name: role-matrix-design
    core_ability: 基于确认的角色，设计完整的角色矩阵（角色/职责/权限边界/关联功能）
    depend: scope-confirm
    status: 启用
  - name: feature-tree-design
    core_ability: 基于角色和功能范围，设计完整功能树（描述/触发/主流程/分支/异常/前置/后置），标注 P1/P2/P3
    depend: role-matrix-design
    status: 启用
  - name: flow-diagram-design
    core_ability: 为每个 P1 功能绘制 Mermaid 文本流程图（多角色泳道），覆盖主流程和关键异常流程
    depend: feature-tree-design
    status: 启用
  - name: data-entity-design
    core_ability: 识别和设计数据实体（字段/类型/必填/关系），标注 [待确认-type]
    depend: feature-tree-design
    status: 启用
  - name: api-design
    core_ability: 基于功能树和数据实体，设计 API 规格（REST 风格，标注调用方和 [待确认] 参数）
    depend: data-entity-design
    status: 启用
  - name: acceptance-design
    core_ability: 为每个 P1 功能设计 Given-When-Then 验收条件（正向+异常场景，每个 P1 至少 2 个）
    depend: api-design
    status: 启用
  - name: non-functional-identify
    core_ability: 识别非功能需求（性能/安全/兼容），仅记录不深度设计
    depend: acceptance-design
    status: 启用
  - name: document-output
    core_ability: 整合所有步骤输出，生成 5 个文档文件（含业务详细描述和 Mermaid 流程图）
    depend: 所有前置技能
    status: 启用
```

---

## 14. code-redundancy-checker 原子技能


```yaml
atomic_skills:
  # 以下已合并（仅作历史记录）:
  - name: duplicate-code-detection  → 合并入 redundancy-check
  - name: unused-code-detection     → 合并入 redundancy-check
  - name: redundancy-report         → 合并入 redundancy-check
```

---

## 原子技能统计（v1.4）

> `project-planner` 已注册为主 Skill，但当前未拆分独立 `atomic-skills` 目录，因此按 0 个原子 Skill 统计。

| 主技能 | 原子技能数 |
|--------|----------|
| code-style-generator | 5 |
| scan-object-info | 7（v1.2 优化版）|
| requirement-generator | 10 |
| performance-optimizer | 0（已合并至 code-optimizer v2.0）|
| security-scanner | 4 |
| test-generator | 4 |
| doc-generator | 4 |
| deploy-helper | 4 |
| project-planner | 0（当前未拆分独立原子技能） |
| code-redundancy-checker | 0（已合并至 code-optimizer v2.0）|
| **合计** | **83（已统计的原子技能；已合并项单独列示）** |

---

**版本**: 1.4
**最后更新**: 2026-06-11
