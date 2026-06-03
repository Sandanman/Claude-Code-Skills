---
name: scan-object-info/skill-stack-context
description: 共享上下文写入 — 将所有原子技能的执行结果写入 task_skill.md 共享上下文，供下游技能复用，命中率 ≥ 50% 时 τ 收益
---

# skill-stack-context（scan-object-info 原子技能）

## 版本历史
- v1.2 (2026-06-03): 新增，作为 scan-object-info v1.2 K2 Skill Stacking 核心组件

---

## 1. 核心定位

**共享上下文写入器**，作为 scan-object-info 的最后一步（τ=50），将所有原子技能的执行结果统一写入 `task_skill.md` 共享上下文区域，供下游技能复用。

核心价值：
- **TSV 通道**：上游技能输出通过 task_skill.md 传递给下游，避免重复解析
- **命中率追踪**：统计共享上下文命中率，< 50% 触发警告
- **τ 收益量化**：命中率 ≥ 50% 时，估算 τ 节省量

---

## 2. 共享上下文格式

所有 scan-object-info 原子技能执行完毕后，统一写入以下格式：

```markdown
## scan-object-info 执行上下文

### 项目基础信息
- 项目名称：{name from package.json}
- 项目类型：{browser/node}
- 包管理器：{npm/yarn/pnpm/bun}
- 主框架：{framework}@{version}

### 技术栈上下文（detect-tech-stack 输出）
- 框架：{framework}@{version} (confidence: {high/medium/low})
- 框架版本：{version}
- TypeScript：是/否 (confidence: {high/medium/low})
- 渲染模式：CSR/SSR/SSG/ISR (confidence: {high/medium/low})
- UI库：{ui_library}@{version} (confidence: {high/medium/low})
- 状态管理：{state_mgmt}@{version} (confidence: {high/medium/low})

### 配置上下文（scan-config-context 输出）
- 配置文件清单：[文件名, 用途, 关键配置项]
- 环境变量清单：[键名, 用途, 是否敏感]
- 样式方案：{style_solution} (confidence: {high/medium/low})

### 网络与路由上下文（detect-net-router 输出）
- 请求方案：{request_scheme} (confidence: {high/medium/low})
- 请求封装：{request_wrapper}
- 路由方案：{router_solution} (confidence: {high/medium/low})
- 路由类型：配置式/声明式
- 关键文件：{router_file}

### τ 执行记录
- pattern-matcher：✓ τ={actual}（模式：{pattern_name}）
- scan-package-json：✓ τ={actual}
- scan-project-structure：✓ τ={actual}
- detect-tech-stack：✓ τ={actual}
- scan-config-context：✓/跳过 τ={actual}
- detect-net-router：✓ τ={actual}
- **总计**：τ={total}（预算：{budget}）

### 置信度汇总
- 高置信度：{high_confidence_items}
- 中置信度：{medium_confidence_items}
- 低置信度：{low_confidence_items}（建议手动确认）
```

---

## 3. 命中率计算

```python
def calculate_hit_rate(context_stats: dict) -> float:
    total_reads = context_stats["total_context_read_attempts"]
    hits = context_stats["context_hits"]
    return hits / total_reads if total_reads > 0 else 0.0

def assess_stack_efficiency():
    # 统计各技能从共享上下文读取的命中率
    # 命中率 < 50% 时触发警告
    # τ 收益 = (1 - hit_rate) × reparse_cost
    pass
```

---

## 4. TSV 直传规则

```
stack-001: 上游技能的输出必须写入 task_skill.md 共享上下文
stack-002: 下游技能优先从共享上下文读取，避免重新读取文件
stack-003: 共享上下文命中率 < 50% 时触发堆叠效率警告
stack-004: skill-stack-context 每次扫描后更新共享上下文（τ=50）
```

---

## 5. τ 消耗

| 步骤 | τ 值 |
|------|------|
| 汇总各技能输出 | 20 |
| 写入 task_skill.md | 20 |
| 命中率统计 | 10 |
| **合计** | **50** |

---

## 6. 与 orchestrator 的交互

skill-stack-context 写入的上下文由 orchestrator 在任务生成阶段读取，供下游主 skill 复用：

```
scan-object-info 执行
    → skill-stack-context 写入共享上下文（task_skill.md）
    → orchestrator 读取上下文，传递给 code-generator / requirement-generator 等
    → 下游技能从 task_skill.md 读取，无需重新扫描项目文件
```

---

## 7. 强约束

1. **最后执行**：skill-stack-context 必须在所有其他原子技能之后执行
2. **必须写入**：即使部分技能失败，已成功的技能结果仍需写入共享上下文
3. **格式统一**：所有输出必须遵循统一的共享上下文格式
4. **命中率追踪**：记录下游技能读取共享上下文的次数，供下次执行参考

---

**版本**: 1.2
**最后更新**: 2026-06-03
**维护者**: 项目团队