# 配置参数与限制

本文档定义 Orchestrator Reasoner 的所有配置参数和系统限制。

---

## 0. LLM意图识别配置（新增）

```python
LLM_INTENT_CONFIG = {
    # 启用/禁用LLM意图识别
    "enabled": True,              # True=优先LLM, False=强制规则算法

    # LLM模型配置
    "model": "claude-sonnet-4-20250514",  # 可选: claude-3-5-sonnet, claude-3-opus 等
    "max_tokens": 2048,          # 最大输出token数
    "temperature": 0.3,           # 温度参数（低=更确定性，高=更创造性）

    # 置信度阈值
    "confidence_threshold": 0.6,  # 低于此值时提示用户确认意图

    # 重试配置
    "max_retries": 2,             # LLM调用失败重试次数
    "timeout_seconds": 30,       # 单次调用超时

    # Prompt配置
    "include_main_skills_in_prompt": True,  # 是否在Prompt中包含已注册技能列表
    "include_project_context": True,        # 是否在Prompt中包含项目上下文
    "max_context_length": 2000,   # 项目上下文最大字符数
}
```

**说明**：
- `enabled=True` 时，主方案使用 LLM 识别，规则算法作为 fallback
- `enabled=False` 时，强制使用规则算法（适用于 LLM 不可用或调试场景）

---

## 0.5 流式输出配置（新增）

```python
STREAM_CONFIG = {
    # 启用/禁用流式输出
    "enabled": True,              # True=启用流式输出, False=禁用（静默模式）

    # 输出内容配置
    "show_progress_bar": True,    # 显示进度条（▓▓▓▓░░░░ 50%）
    "show_time_estimate": True,    # 显示预计剩余时间
    "show_confidence": True,        # 显示意图识别置信度
    "show_complexity": True,        # 显示复杂度标签

    # 输出格式配置
    "color_output": True,          # 彩色终端输出（可禁用为纯文本）
    "show_skill_desc": True,       # 显示技能描述
    "show_result_summary": True,    # 显示技能结果摘要（截断至80字符）
    "show_duration": True,          # 显示每个技能耗时

    # 进度输出详细程度
    "verbose_levels": {
        "task_start": True,        # 显示任务开始
        "skill_start": True,       # 显示每个技能开始
        "skill_success": True,      # 显示每个技能成功
        "skill_fail": True,        # 显示每个技能失败
        "validation": True,        # 显示校验进度
        "reflection": True,         # 显示反思重规划
        "task_summary": True,       # 显示任务总结
    },

    # 日志写入配置
    "write_to_task_file": True,    # 同时写入 task_skill.md 执行日记
    "log_format": "text",          # 日志格式: text | json
}
```

**说明**：
- `enabled=False` 时，所有流式输出被静默，任务执行过程不产生任何输出
- `color_output=False` 时，所有输出为纯文本，适用于日志文件
- `write_to_task_file=True` 时，流式输出同时追加写入 `task_skill.md` 的执行日记

**使用场景**：
| 场景 | enabled | color_output | write_to_task_file |
|------|---------|-------------|-------------------|
| 正常执行（完整输出）| True | True | True |
| CI/自动化环境（纯日志）| True | False | True |
| 调试模式（仅终端）| True | True | False |
| 静默模式（无输出）| False | - | False |
- `confidence_threshold=0.6` 时，置信度低于 60% 会提示用户确认意图

**支持的主技能列表（用于LLM上下文）**：

当 `include_main_skills_in_prompt=True` 时，以下技能列表会作为上下文传给LLM：

| name | desc | match_keywords |
|------|------|----------------|
| code-style-generator | 自动检测项目代码规范 | 生成代码习惯文档, 检测代码规范, CODE_STYLE |
| bug-solver | 系统化解决bug | 解决bug, 修复错误, 调试问题, debug |
| code-optimizer | 系统化优化代码 | 优化代码, 重构, 性能优化, 提高代码质量 |
| code-generator | 根据需求自动生成代码 | 根据需求写代码, 实现功能, 生成代码 |
| scan-object-info | 智能扫描前端项目技术信息 | 扫描项目, 分析项目, 技术栈, 项目结构 |
| requirement-generator | 需求转化为标准需求文档 | 需求分析, 需求文档, 功能规格 |

---

## 1. 相似度与匹配配置

```python
SIMILARITY_CONFIG = {
    "历史任务相似度阈值": 0.85,
    "历史任务召回数量": "3-5",
    "主skill匹配最低分数": 0.4,
    "多skill匹配差距阈值": 0.1,
}

SIMILARITY_WEIGHTS = {
    "domain": 0.25,
    "action": 0.20,
    "keywords": 0.30,  # 最重要
    "target_type": 0.15,
    "tech_stack": 0.10,
}
```

---

## 2. 重试与反思配置

```python
RETRY_CONFIG = {
    "单个原子skill重试次数": 3,
    "反思重规划最大次数": 3,
    "主skill完成重试次数": 3,
    "文件操作重试次数": 3,
}

REFLECTION_CONFIG = {
    "目标偏差阈值": 0.2,
    "优秀偏差范围": "< 0.1",
    "合格偏差范围": "0.1 - 0.2",
    "反思日志最大长度": 300,  # 字
}
```

---

## 3. 超时配置

```python
TIMEOUT_CONFIG = {
    "原子skill执行": 30,        # 秒
    "原子skill重试总时长": 120, # 秒 (3次重试累计)
    "用户响应等待": 300,       # 秒 (5分钟)
    "任务总执行时长": 14400,    # 秒 (4小时)
    "输出生成": 300,           # 秒 (5分钟)
    "文件锁等待": 30,          # 秒
    "文件锁超时": 30,          # 秒
}
```

---

## 4. 任务规模限制

```python
TASK_LIMITS = {
    "最大原子skill数量": 20,
    "单个原子skill输出大小": 10 * 1024 * 1024,  # 10MB
    "任务上下文总大小": 50 * 1024 * 1024,       # 50MB
    "并行执行最大数量": 2,
    "每次反思补充技能数": 3,
}
```

---

## 5. 文件与存储配置

```python
FILE_CONFIG = {
    "历史任务保留天数": 180,          # 6个月
    "月度索引最大记录数": 100,
    "历史归档压缩格式": "tar.gz",
    "任务文件路径": "{root}/tasks/current/task_skill.md",
    "历史任务路径": "{root}/tasks/history/{YYYY-MM}/",
    "结果文件路径": "{root}/tasks/current/result_{task_id}.md",
}
```

---

## 6. 复杂度评分配置

```python
COMPLEXITY_WEIGHTS = {
    "步骤数量": 1.0,
    "状态依赖": 1.2,
    "技能组合": 1.1,
    "文件数量": 0.8,
    "决策分支": 0.9,
}

COMPLEXITY_THRESHOLDS = {
    "复杂目标判定": 3.0,  # 加权平均分数
    "多skill组合触发": 7.0,
}
```

---

## 7. 状态同步配置

```python
SYNC_CONFIG = {
    "锁文件后缀": ".lock",
    "锁内容格式": "{pid}_{timestamp}",
    "备份文件后缀": ".bak",
    "临时文件后缀": ".tmp",
    "锁检查频率": 2,  # 秒
    "锁最大等待次数": 15,
}
```

---

## 8. 用户交互配置

```python
USER_INTERACTION_CONFIG = {
    "确认提示类型": {
        "D1": "未完成任务选择",
        "D2": "多skill匹配",
        "D3": "错误处理",
        "D4": "反思重规划",
        "D5": "反思失败",
        "D6": "文档固化",
    },
    "提示显示行数": 50,
    "候选项显示数量": 3,
}

DEFAULT_BEHAVIORS = {
    "D1_超时": "开始新任务",
    "D2_超时": "选择匹配度最高",
    "D3_超时": "重试",
    "D4_超时": "继续",
    "D5_超时": "输出当前结果",
    "D6_超时": "仅索引",
}
```

---

## 9. 资源检查配置

```python
RESOURCE_CONFIG = {
    "最小可用磁盘空间": 100 * 1024 * 1024,  # 100MB
    "最小可用内存": 512 * 1024 * 1024,       # 512MB
    "单skill输出阈值": 10 * 1024 * 1024,     # 10MB
}
```

---

## 10. 归档策略配置

```python
ARCHIVE_CONFIG = {
    "归档触发条件": [
        "所有原子skill执行完毕",
        "结果输出完成",
    ],
    "归档失败重试次数": 3,
    "归档时间基准": "任务完成时间",
    "压缩归档条件": "超过180天",
}
```

---

## 11. 输出格式配置

```python
OUTPUT_CONFIG = {
    "执行日志摘要最大条目": 10,
    "原子skill列表格式": "markdown表格",
    "结果文档结构": {
        "任务概览": True,
        "执行摘要": True,
        "关键成果": True,
        "执行日志": True,
        "失败信息": True,
        "反思日志": True,
        "建议": True,
    },
}
```

---

## 12. 错误分类配置

```python
ERROR_CATEGORIES = {
    "输入错误": {
        "处理": "检查输入数据源，重新生成输入",
        "重试价值": "高",
        "需用户介入": True,
    },
    "代码逻辑错误": {
        "处理": "记录错误栈，跳过该skill",
        "重试价值": "低",
        "需用户介入": True,
    },
    "资源访问失败": {
        "处理": "等待后重试（网络恢复）",
        "重试价值": "高",
        "需用户介入": False,
    },
    "超时": {
        "处理": "增加超时时间，拆分任务",
        "重试价值": "中",
        "需用户介入": False,
    },
    "权限不足": {
        "处理": "提示用户授权或切换权限",
        "重试价值": "无",
        "需用户介入": True,
    },
}
```

---

## 13. 系统路径配置

```python
PATH_CONFIG = {
    "skills_registry": ".skills/orchestrator/skills_register.md",
    "missing_skills": ".skills/orchestrator/missing_skills.md",
    "task_template": ".skills/tasks/templates/task_skill_template.md",
    "monthly_index_template": ".skills/tasks/templates/月度任务索引模版.md",
    "current_tasks": ".skills/tasks/current/",
    "history_tasks": ".skills/tasks/history/",
    "archive_dir": ".skills/tasks/archive/",
}
```

---

## 14. 任务ID生成配置

```python
ID_CONFIG = {
    "格式": "YYYYMMDDHHMMSS_{random6}",
    "时间戳格式": "%Y%m%d%H%M%S",
    "时区": "Asia/Shanghai",  # UTC+8
    "随机数范围": (100000, 999999),
}
```

---

## 15. 状态定义

```python
TASK_STATUS = {
    "待执行": "pending",
    "执行中": "running",
    "暂停": "paused",
    "已完成": "completed",
    "失败": "failed",
    "部分完成": "partially_completed",
}

SKILL_STATUS = {
    "待执行": "pending",
    "执行中": "running",
    "已完成": "completed",
    "失败": "failed",
    "失败（不影响后续）": "failed_non_blocking",
    "已跳过": "skipped",
}
```

---

**版本**: 1.0
**最后更新**: 2026-04-07

---

## 0.6 Token 消耗追踪配置（新增）

```python
TOKEN_TRACKING_CONFIG = {
    # 预算配置
    "session_budget": 1000000,         # 会话级总预算（token）
    "task_budget": 200000,             # 任务级预算（token）

    # 预警阈值
    "warning_threshold": 0.8,         # 80% 时预警，95% 时严重警告

    # 成本费率（美元/百万token，当前为 Anthropic Claude Sonnet 4 参考费率）
    "input_cost_per_1k": 3.0,          # $3.00 / 1M input tokens
    "output_cost_per_1k": 15.0,       # $15.00 / 1M output tokens

    # 输出配置
    "show_in_stream": True,            # 在流式输出中显示 token 统计
    "show_per_skill": True,            # 显示每个技能的 token 消耗
    "show_cost_estimate": True,       # 显示预估成本

    # 记录配置
    "write_to_task_file": True,        # 写入 task_skill.md 执行日记
    "log_format": "text",              # text | json
}
```

**费率参考**（不同模型定价不同）：

| 模型 | 输入 ($/1M) | 输出 ($/1M) | 配置示例 |
|------|-----------|------------|---------|
| claude-sonnet-4-20250514 | $3.00 | $15.00 | 基准配置 |
| claude-3-5-sonnet-latest | $3.00 | $15.00 | 同上 |
| claude-3-opus-latest | $15.00 | $75.00 | input_cost_per_1k=15.0 |
| claude-3-haiku-latest | $0.25 | $1.25 | input_cost_per_1k=0.25 |
