# 全局技能注册表（Reasoner与主skill协同依据）
version: 1.3
说明：
1.  读写权限：主技能列表仅给Reasoner读取，各主技能对应的原子技能仅给对应主skill读取；
2.  所有主skill、原子skill需在此注册，未注册技能不允许被选择、执行；
3.  Reasoner匹配主skill、主skill筛选原子skill时，均需对照此表校验；
4.  新增/删除/修改技能时，同步更新此表，确保与实际技能一致。

--------------------------------------------------
# 【一】主技能列表 —— 仅给Reasoner读取（适配步骤3：主skill匹配）
--------------------------------------------------

- name: code-style-generator
  desc: 自动检测项目代码规范，生成个人代码习惯文档 CODE_STYLE.md
  path: ./.claude/skills/code-style-generator/SKILL.md
  core_ability: 检测配置文件、扫描代码推断规范、生成代码风格文档
  match_keywords: 生成代码习惯文档, 创建代码风格规范, 生成CODE_STYLE, 检测代码规范, 代码规范文档
  status: 启用


- name: bug-solver
  desc: 系统化地解决应用程序中的bug，通过6个原子skill协同工作，从问题识别到修复验证，完整记录和追溯整个debug过程
  path: ./.claude/skills/bug-solver/SKILL.md
  core_ability: 系统化的问题诊断流程, 代码级的根因定位, 安全的修复方案生成, 修复效果的验证, 测试用例建议
  match_keywords: 解决bug, 修复错误, 调试问题, 定位问题, debug, bug修复, 错误分析
  status: 启用


- name: code-optimizer
  desc: 系统化地优化代码，基于代码质量分析识别改进点，提供可执行的优化方案，并应用修改以提升代码质量、性能和可维护性
  path: ./.claude/skills/code-optimizer/SKILL.md
  core_ability: 静态代码质量分析, 代码模式识别与优化建议, 自动化代码重构, 优化效果验证, 文档维护
  match_keywords: 优化代码, 重构代码, 更好的实现方式, 性能优化, 提高代码质量, 改进这个函数, 简化这段代码, 消除代码重复
  status: 启用


- name: code-generator
  desc: 根据需求文档或需求描述自动生成符合项目规范的代码，支持多种输入形式并自动适配项目技术栈
  path: ./.claude/skills/code-generator/SKILL.md
  core_ability: 需求理解和分析, 技术栈自动检测, 代码结构设计, 自动代码生成, 模块间整合, 代码质量验证, 文档更新
  match_keywords: 根据需求写代码, 实现这个功能, 生成代码, 写一个函数, 实现这个模块, 按照需求文档开发, 帮我实现
  status: 启用


- name: scan-object-info
  desc: 智能扫描并分析前端项目的各种技术信息（框架、UI库、状态管理、请求方案、配置文件、项目结构、路由方案、环境变量等），根据用户需求选择性调用相关原子技能并输出结构化结果
  path: ./.claude/skills/scan-object-info/SKILL.md
  core_ability: 智能意图识别, 精准技能选择, 依赖关系分析, 结构化输出, 错误处理, 技术栈全面扫描
  match_keywords: 扫描项目, 分析项目, 项目信息, 技术栈, 项目结构, 配置文件, 依赖分析, 框架识别, UI库, 状态管理, 请求方案, 路由方案, 环境变量
  status: 启用


--------------------------------------------------
# 【二】各主技能对应的原子技能 —— 仅给对应主Skill读取（适配步骤4：同步筛选）
--------------------------------------------------

## code-style-generator 的原子技能
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


## bug-solver 的原子技能
atomic_skills:
  - name: bug-identification
    core_ability: 收集和整理用户提供的bug信息，创建结构化的问题描述文档，为后续分析提供基础
    depend: 无
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


## code-optimizer 的原子技能
atomic_skills:
  - name: code-quality-analysis
    core_ability: 对目标代码进行静态分析，系统化地评估代码质量，识别问题点，为后续优化提供数据基础
    depend: 无
    status: 启用
  - name: pattern-recognition
    core_ability: 基于代码质量分析报告，识别具体的可优化模式，定位代码中的反模式和低效实现
    depend: code-quality-analysis
    status: 启用
  - name: improvement-suggestion
    core_ability: 为每个优化模式生成具体的重构建议和优化方案，提供多个选择供用户决策
    depend: pattern-recognition
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


## code-generator 的原子技能
atomic_skills:
  - name: requirement-analysis
    core_ability: 解析需求文档或用户描述，提取功能点、输入输出、边界条件，识别是单模块还是多模块需求
    depend: 无
    status: 启用
  - name: tech-stack-detection
    core_ability: 自动检测项目技术栈（框架、语言、构建工具等），检查是否存在CODE_STYLE.md文件
    depend: requirement-analysis
    status: 启用
  - name: code-design
    core_ability: 根据需求分析和技术栈检测结果，设计代码结构、数据模型和接口
    depend: tech-stack-detection
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


## scan-object-info 的原子技能
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
    core_ability: 识别前端框架、TS 使用、渲染模式 (CSR/SSR/SSG)
    depend: scan_package_json, scan_project_structure, scan_config_files
    status: 启用
  - name: detect_ui_library
    core_ability: 识别 UI 组件库、样式方案、原子 CSS
    depend: scan_package_json, scan_config_files
    status: 启用
  - name: detect_state_manage
    core_ability: 识别状态管理库（Redux、Pinia、Zustand 等）
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