# scan-object-info（韬定律优化版 v1.2）

智能扫描并分析前端项目技术信息的主技能，基于华为韬定律 K1-K4 优化技能结构，大幅降低 τ（执行延迟）。

## 核心优化（v1.1 → v1.2）

| 优化维度 | 原版 | 优化版 | τ 节省 |
|---------|------|--------|-------|
| 技能数量 | 9个原子技能 | 7个合并技能 | - |
| detect_framework+ui+state | τ=1500（分开） | τ=600（合并） | 60% |
| scan_config+env | τ=700（分开） | τ=400（合并） | 43% |
| detect_request+router | τ=800（分开） | τ=500（合并） | 38% |
| **总 τ** | **~3300** | **~2200** | **33%** |

## K1：Task Folding — 技能折叠合并

```
原9技能                            → 新7技能（τ节省33%）
detect_framework                   → detect_tech_stack（τ=600）
+ detect_ui_library
+ detect_state_manage

scan_config_files                  → scan_config_context（τ=400）
+ scan_env_variables

detect_request_scheme             → detect_net_router（τ=500）
+ detect_router_solution

scan_package_json（保留，τ=200）
scan_project_structure（保留，τ=300）
pattern-matcher（新增，τ=150）
skill-stack-context（内置，τ=50）
```

## K2：Skill Stacking — 上下文共享

所有技能输出写入 `task_skill.md` 共享上下文（TSV通道），下游技能优先读取共享上下文，避免重复读取文件。

## K3：Co-Design — 规则与LLM协同

规则处理确定性检测（覆盖90%场景），LLM处理边缘情况和上下文推断。简单任务规则优先，复杂任务模型主控。

## K4：Pattern Mining — 模式复用

项目类型模式库，命中成熟模式（相似度≥0.6）直接复用上下文，跳过重复扫描。

```
.claude/skills/scan-object-info/patterns/
├── vue3-element-plus/     # 成熟 τ×0.3
├── react-antd/           # 成熟 τ×0.3
├── vite-vue3/            # 成熟 τ×0.3
├── next-app-router/      # 成长 τ×0.6
└── nuxt3/               # 成长 τ×0.6
```

## τ 估算表（v1.2）

| 原子技能 | τ | 并行组 | 说明 |
|---------|---|--------|------|
| pattern-matcher | 150 | 0（预处理）| 项目模式匹配，命中则跳过后续扫描 |
| scan-package-json | 200 | 1（并行）| 解析 package.json |
| scan-project-structure | 300 | 1（并行）| 扫描目录结构 |
| scan-config-context | 400 | 1（并行）| 配置文件+环境变量 |
| detect-tech-stack | 600 | 2（并行）| 框架+UI库+状态管理 |
| detect-net-router | 500 | 2（并行）| 请求方案+路由方案 |
| skill-stack-context | 50 | 任意（最后）| 更新共享上下文 |

**总 τ（完整扫描）**：~2200（K1前约3300，节省33%）
**τ 预算阈值**：simple=5000 / moderate=15000 / complex=50000

## 原子技能（v1.2）

| 技能 | 合并来源 | 输出内容 |
|-----|---------|---------|
| `scan-package-json` | — | 项目名称、版本、scripts、关键依赖 |
| `scan-project-structure` | — | 入口文件、核心目录、文件分布 |
| `detect-tech-stack` | detect_framework + detect_ui_library + detect_state_manage | 框架、UI库、状态管理、TS、渲染模式 |
| `scan-config-context` | scan_config_files + scan_env_variables | 配置文件、环境变量、样式方案 |
| `detect-net-router` | detect_request_scheme + detect_router_solution | 请求方案、路由方案、路由文件 |
| `pattern-matcher` | 新增 | 项目类型模式匹配（K4优化） |
| `skill-stack-context` | 内置 | 共享上下文写入（K2 TSV） |

## 执行计划（并行优化）

```
预处理：pattern-matcher（τ=150）
并行组1（无依赖）：scan-package-json + scan-project-structure + scan-config-context
并行组2（依赖组1）：detect-tech-stack + detect-net-router
串行：skill-stack-context（更新共享上下文）
```

## 功能特性

**智能识别**：根据用户需求自动选择最小必要技能集
**并行执行**：无依赖技能自动并行，减少执行时间
**置信度标注**：每个检测结果标注 confidence score（high/medium/low）
**项目摘要**：全面扫描后自动生成技术栈总结和技术债务提示
**Skill Stacking**：共享上下文避免重复读取，τ 额外节省
**Pattern Mining**：命中模式直接复用，跳过冗余扫描

## 使用场景

| 用户请求 | 触发技能 | τ 消耗 |
|---------|---------|-------|
| 技术栈分析 | pattern-matcher + scan-package-json + detect-tech-stack | ~950 |
| 环境变量 | scan-config-context | ~400 |
| 路由方案 | scan-package-json + detect-net-router | ~700 |
| 全面分析 | 全部7技能 | ~2200 |

## 完整输出示例

```markdown
# 项目扫描结果 v1.2（韬定律优化版）

## τ 执行报告
- τ 总消耗：2200（预算：5000）
- τ 节省：pattern-matcher 命中 vue3-element-plus 模式（-400）

## 1. 项目基本信息（scan-package-json，τ=200）
- 项目名称：my-vue-app
- 主框架：vue@^3.5.0
...

## 2. 项目结构（scan-project-structure，τ=300）
...

## 3. 配置文件（scan-config-context，τ=400）
...

## 4. 技术栈（detect-tech-stack，τ=600）
...

## 5. 网络与路由（detect-net-router，τ=500）
...

## 技术债务提示
...

## 建议后续操作
...
```

## 版本

- v1.2（2026-06-03）韬定律优化版：K1 Task Folding（9→7技能，τ节省33%）、K2 Skill Stacking（共享上下文）、K3 Co-Design（规则/LLM决策矩阵）、K4 Pattern Mining（模式库）
- v1.1 改进版：新增 confidence scores、project-summary、suggested follow-up actions
- v1.0 初始版本

## 与其他技能配合

- 与 `code-generator` 配合：生成代码前了解项目技术栈
- 与 `code-optimizer` 配合：优化前了解项目结构和规范
- 与 `code-style-generator` 配合：生成项目专属代码规范
- 与 `performance-optimizer` 配合：性能优化前了解项目特征