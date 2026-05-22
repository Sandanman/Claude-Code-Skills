# 全局技能注册表 v1.2（Reasoner与主skill协同依据）

version: 1.2
说明：
1. 主技能列表仅给Reasoner读取，各主skill对应的原子技能仅给对应主skill读取；
2. 所有主skill、原子skill需在此注册，未注册技能不允许被选择、执行；
3. Reasoner匹配主skill、主skill筛选原子skill时，均需对照此表校验；
4. 新增/删除/修改技能时，同步更新此表，确保与实际技能一致。

---

## 【一】主技能列表 —— 仅给Reasoner读取

### code-style-generator
```yaml
- name: code-style-generator
  desc: 自动检测项目代码规范，生成个人代码习惯文档 CODE_STYLE.md
  path: .claude/skills/code-style-generator/SKILL.md
  core_ability: 检测配置文件、扫描代码推断规范、生成代码风格文档
  match_keywords: 生成代码习惯文档, 创建代码风格规范, 生成CODE_STYLE, 检测代码规范, 代码规范文档
  status: 启用
```

### bug-solver（改进：+bug-triage）
```yaml
- name: bug-solver
  desc: 系统化地解决应用程序中的bug，通过7个原子skill协同工作，从问题识别到修复验证，完整记录和追溯整个debug过程
  path: .claude/skills/bug-solver/SKILL.md
  core_ability: 问题分类、诊断流程、根因定位、安全修复、修复验证、测试建议
  match_keywords: 解决bug, 修复错误, 调试问题, 定位问题, debug, bug修复, 错误分析
  status: 启用
```

### code-optimizer（改进：+performance-analysis）
```yaml
- name: code-optimizer
  desc: 系统化地优化代码，基于代码质量分析识别改进点，提供可执行的优化方案，并应用修改以提升代码质量、性能和可维护性
  path: .claude/skills/code-optimizer/SKILL.md
  core_ability: 静态代码质量分析、代码模式识别与优化建议、自动化代码重构、优化效果验证、文档维护
  match_keywords: 优化代码, 重构代码, 更好的实现方式, 性能优化, 提高代码质量, 改进这个函数, 简化这段代码, 消除代码重复
  status: 启用
```

### code-redundancy-checker
```yaml
- name: code-redundancy-checker
  desc: 独立检测代码冗余，识别重复代码、死代码、冗余导入等，为代码优化提供精准的冗余清单
  path: .claude/skills/code-redundancy-checker/SKILL.md
  core_ability: 文件内重复代码检测、跨文件重复代码检测、死代码检测、冗余导入检测、冗余报告生成
  match_keywords: 检查代码冗余, 检测重复代码, 找出死代码, 清理未使用代码, 冗余导入, 代码重复率
  status: 启用
```

### code-generator（改进：+multi-scenario-adapter）
```yaml
- name: code-generator
  desc: 根据需求文档或需求描述自动生成符合项目规范的代码，支持多种输入形式并自动适配项目技术栈
  path: .claude/skills/code-generator/SKILL.md
  core_ability: 需求理解和分析、技术栈自动检测、代码结构设计、自动代码生成、模块间整合、代码质量验证、文档更新
  match_keywords: 根据需求写代码, 实现这个功能, 生成代码, 写一个函数, 实现这个模块, 按照需求文档开发, 帮我实现
  status: 启用
```

### scan-object-info
```yaml
- name: scan-object-info
  desc: 智能扫描并分析前端项目的各种技术信息（框架、UI库、状态管理、请求方案、配置文件、项目结构、路由方案、环境变量等），根据用户需求选择性调用相关原子技能并输出结构化结果
  path: .claude/skills/scan-object-info/SKILL.md
  core_ability: 智能意图识别、精准技能选择、依赖关系分析、结构化输出、错误处理、技术栈全面扫描
  match_keywords: 扫描项目, 分析项目, 项目信息, 技术栈, 项目结构, 配置文件, 依赖分析, 框架识别, UI库, 状态管理, 请求方案, 路由方案, 环境变量
  status: 启用
```

### requirement-generator
```yaml
- name: requirement-generator
  desc: 将用户自然语言需求转化为标准化、可执行的机器需求文档（requirements.json），支持多模态输入，依赖外部项目上下文，不扫描任何项目文件
  path: .claude/skills/requirement-generator/SKILL.md
  core_ability: 多模态需求输入、需求模块化分解、7种通用前端流程识别、REST API规格设计、测试用例生成、需求质量评估
  match_keywords: 需求分析, 需求文档, 功能规格, 将需求标准化, 需求转化为规格
  status: 启用
```

### performance-optimizer（新增）
```yaml
- name: performance-optimizer
  desc: 专注于前端性能优化，通过性能分析、基准测试生成和优化验证，系统化地提升应用性能（首屏加载、渲染性能、资源体积等）
  path: .claude/skills/performance-optimizer/SKILL.md
  core_ability: 性能数据分析、基准测试生成、优化方案设计、优化方案应用、优化效果验证
  match_keywords: 性能优化, 首屏加载优化, 渲染性能, 资源体积, 加载速度优化, Web Vitals, Lighthouse
  status: 启用
```

### security-scanner（新增）
```yaml
- name: security-scanner
  desc: 系统化地扫描前端项目中的安全漏洞，包括XSS、CSRF、依赖漏洞、敏感信息泄露等，提供修复建议
  path: .claude/skills/security-scanner/SKILL.md
  core_ability: 漏洞扫描、依赖安全检查、敏感信息检测、安全报告生成、修复建议
  match_keywords: 安全扫描, 安全漏洞, XSS, CSRF, 依赖安全, 敏感信息检测, 安全审计
  status: 启用
```

### test-generator（新增）
```yaml
- name: test-generator
  desc: 根据现有代码或需求自动生成测试用例，覆盖单元测试、集成测试和E2E测试，支持主流测试框架（Vitest、Jest、Playwright）
  path: .claude/skills/test-generator/SKILL.md
  core_ability: 测试用例设计、测试代码生成、测试框架适配、测试覆盖分析
  match_keywords: 生成测试, 测试用例, 单元测试, 集成测试, E2E测试, 添加测试, 测试覆盖
  status: 启用
```

### doc-generator（新增）
```yaml
- name: doc-generator
  desc: 自动生成代码文档，包括API文档、README、组件文档、变更日志等，支持多种格式（Markdown、API文档、TypeDoc、JSDoc）
  path: .claude/skills/doc-generator/SKILL.md
  core_ability: API文档生成、README生成、组件文档生成、变更日志生成、文档格式转换
  match_keywords: 生成文档, API文档, README, 组件文档, 变更日志, 文档更新, 生成注释
  status: 启用
```

### git-helper（新增）
```yaml
- name: git-helper
  desc: 辅助Git操作，包括分支管理、提交规范、冲突解决、版本Tag管理，支持conventional commits规范
  path: .claude/skills/git-helper/SKILL.md
  core_ability: 分支管理、提交规范检查、冲突分析、版本管理、Git历史分析
  match_keywords: Git操作, 分支管理, 提交规范, 解决冲突, 版本Tag, conventional commits
  status: 启用
```

### deploy-helper（新增）
```yaml
- name: deploy-helper
  desc: 辅助部署操作，支持Docker配置、CI/CD流水线生成、环境配置、部署脚本生成，适配主流平台（Vercel、Netlify、Docker）
  path: .claude/skills/deploy-helper/SKILL.md
  core_ability: Docker配置生成、CI/CD流水线生成、环境配置、部署脚本生成、部署验证
  match_keywords: 部署, Docker, CI/CD, 环境配置, 部署脚本, Vercel, Netlify, 自动化部署
  status: 启用
```

---

## 【二】各主技能对应的原子技能 —— 仅给对应主skill读取

### code-style-generator 原子技能
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

### bug-solver 原子技能（v1.2 改进：+bug-triage）
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

### code-optimizer 原子技能（v1.2 改进：+performance-analysis）
```yaml
atomic_skills:
  - name: code-quality-analysis
    core_ability: 对目标代码进行静态分析，系统化地评估代码质量，识别问题点，为后续优化提供数据基础
    depend: 无
    status: 启用
  - name: pattern-recognition
    core_ability: 基于代码质量分析报告，识别具体的可优化模式，定位代码中的反模式和低效实现
    depend: code-quality-analysis
    status: 启用
  - name: performance-analysis
    core_ability: 专门分析代码性能问题，识别性能热点、渲染瓶颈、计算复杂度问题，提供性能优化方向
    depend: code-quality-analysis
    status: 启用
  - name: improvement-suggestion
    core_ability: 为每个优化模式生成具体的重构建议和优化方案，提供多个选择供用户决策
    depend: pattern-recognition, performance-analysis
    status: 启用
  - name: code-refactoring
    core_ability: 根据改进建议报告中选择的优化方案，实际修改代码，生成新的代码版本
    depend: improvement-suggestion
    status: 启用
  - name: optimization-verification
    core_ability: 验证代码重构后的优化效果，确保功能正确性，评估性能提升和质量指标改善情况
    depend: code-refactoring
    status: 启用
  - name: documentation-update
    core_ability: 根据代码优化结果，更新相关文档（注释、README、API文档），确保文档与代码保持同步
    depend: optimization-verification
    status: 启用
```

### code-redundancy-checker 原子技能
```yaml
atomic_skills:
  - name: duplicate-code-detection
    core_ability: 检测文件内和跨文件的重复代码
    depend: 无
    status: 启用
  - name: unused-code-detection
    core_ability: 检测死代码（未使用的export、函数、变量、import）
    depend: 无
    status: 启用
  - name: redundancy-report
    core_ability: 汇总检测结果，生成可操作的冗余报告
    depend: duplicate-code-detection, unused-code-detection
    status: 启用
```

### code-generator 原子技能（v1.2 改进：+multi-scenario-adapter）
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

### scan-object-info 原子技能
```yaml
atomic_skills:
  - name: scan_package_json
    core_ability: 解析 package.json，提取项目基础信息、依赖、脚本等
    depend: 无
    status: 启用
  - name: scan_project_structure
    core_ability: 扫描项目目录结构、入口文件、核心文件夹
    depend: scan_package_json
    status: 启用
  - name: scan_config_files
    core_ability: 扫描构建、代码规范、环境等配置文件
    depend: scan_package_json
    status: 启用
  - name: detect_framework
    core_ability: 识别前端框架、TS使用、渲染模式（CSR/SSR/SSG）
    depend: scan_package_json, scan_project_structure, scan_config_files
    status: 启用
  - name: detect_ui_library
    core_ability: 识别UI组件库、样式方案、原子CSS
    depend: scan_package_json, scan_config_files
    status: 启用
  - name: detect_state_manage
    core_ability: 识别状态管理库（Redux、Pinia、Zustand等）
    depend: scan_package_json, scan_project_structure
    status: 启用
  - name: detect_request_scheme
    core_ability: 识别请求库和请求封装结构
    depend: scan_package_json, scan_project_structure
    status: 启用
  - name: detect_router_solution
    core_ability: 识别路由方案、版本、配置和文件位置
    depend: scan_package_json, detect_framework
    status: 启用
  - name: scan_env_variables
    core_ability: 扫描环境变量文件、键名、用途和环境区分
    depend: scan_package_json, scan_config_files, detect_framework
    status: 启用
```

### requirement-generator 原子技能
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
    depend: 所有前置skill
    status: 启用
```

### performance-optimizer 原子技能（新增）
```yaml
atomic_skills:
  - name: performance-data-collection
    core_ability: 收集性能数据（Lighthouse、Chrome DevTools指标、Web Vitals）
    depend: 无
    status: 启用
  - name: performance-analysis
    core_ability: 分析性能数据，识别性能瓶颈（加载、渲染、资源体积）
    depend: performance-data-collection
    status: 启用
  - name: benchmark-generation
    core_ability: 生成性能基准测试用例，量化优化前后的性能差异
    depend: performance-analysis
    status: 启用
  - name: optimization-strategy-design
    core_ability: 设计性能优化策略（代码分割、懒加载、缓存、压缩等）
    depend: performance-analysis, benchmark-generation
    status: 启用
  - name: optimization-application
    core_ability: 应用性能优化策略，生成优化后的代码
    depend: optimization-strategy-design
    status: 启用
  - name: optimization-verification
    core_ability: 验证优化效果，对比优化前后的性能指标
    depend: optimization-application
    status: 启用
```

### security-scanner 原子技能（新增）
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

### test-generator 原子技能（新增）
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

### doc-generator 原子技能（新增）
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

### git-helper 原子技能（新增）
```yaml
atomic_skills:
  - name: branch-analysis
    core_ability: 分析当前分支状态，识别分支策略是否合理
    depend: 无
    status: 启用
  - name: commit规范检查
    core_ability: 检查提交信息是否符合 conventional commits 规范
    depend: 无
    status: 启用
  - name: conflict-analysis
    core_ability: 分析Git冲突，给出解决建议
    depend: branch-analysis
    status: 启用
  - name: version-management
    core_ability: 管理版本Tag，生成 changelog
    depend: commit规范检查
    status: 启用
```

### deploy-helper 原子技能（新增）
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