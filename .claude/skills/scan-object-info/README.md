# scan-object-info（v1.2）

## 原子技能（v1.2）

| 技能 | 合并来源 | 输出内容 |
|-----|---------|---------|
| `scan-package-json` | — | 项目名称、版本、scripts、关键依赖 |
| `scan-project-structure` | — | 入口文件、核心目录、文件分布 |
| `detect-tech-stack` | detect_framework + detect_ui_library + detect_state_manage | 框架、UI库、状态管理、TS、渲染模式 |
| `scan-config-context` | scan_config_files + scan_env_variables | 配置文件、环境变量、样式方案 |
| `detect-net-router` | detect_request_scheme + detect_router_solution | 请求方案、路由方案、路由文件 |

## 执行计划（并行优化）

```
并行组1（无依赖）：scan-package-json + scan-project-structure + scan-config-context
并行组2（依赖组1）：detect-tech-stack + detect-net-router
串行：skill-stack-context（更新共享上下文）
```

## 功能特性

**智能识别**：根据用户需求自动选择最小必要技能集
**并行执行**：无依赖技能自动并行，减少执行时间
**置信度标注**：每个检测结果标注 confidence score（high/medium/low）
**项目摘要**：全面扫描后自动生成技术栈总结和技术债务提示

## 使用场景

|---------|---------|-------|
| 技术栈分析 | pattern-matcher + scan-package-json + detect-tech-stack | ~950 |
| 环境变量 | scan-config-context | ~400 |
| 路由方案 | scan-package-json + detect-net-router | ~700 |
| 全面分析 | 全部7技能 | ~2200 |

## 完整输出示例

```markdown

- 项目名称：my-vue-app
- 主框架：vue@^3.5.0
...

...

...

...

...

## 技术债务提示
...

## 建议后续操作
...
```

## 版本

- v1.1 改进版：新增 confidence scores、project-summary、suggested follow-up actions
- v1.0 初始版本

## 与其他技能配合

- 与 `code-generator` 配合：生成代码前了解项目技术栈
- 与 `code-optimizer` 配合：优化前了解项目结构和规范
- 与 `code-style-generator` 配合：生成项目专属代码规范
- 与 `performance-optimizer` 配合：性能优化前了解项目特征
