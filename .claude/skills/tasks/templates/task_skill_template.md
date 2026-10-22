# 任务基础信息
任务ID：{自动生成，格式：YYYYMMDDHHMMSS_随机6位数字}
用户意图：{Reasoner传入的明确意图}
最终目标：{Reasoner与主skill确认的核心目标}
归属主skill：{所选主skill名称}
创建时间：{YYYY-MM-DD HH:MM:SS}
状态版本：2
执行路径：fast / durable
风险等级：low / medium / high / unknown
校验级别：L0 / L1 / L2
执行模式：serial_by_default
升级原因：无 / {从 fast 升级到 durable 的原因}
当前状态：待执行/执行中/待恢复/暂停/已完成/失败
归档路径：未归档（Durable 执行完毕后自动更新为 tasks/history/YYYY-MM/）

# 子任务（原子skill）列表
| 原子skill名称 | 所属主skill | 状态（待执行/执行中/待恢复/已完成/失败） | 依赖子任务（无则填“无”） | 重试次数（0-3） | 执行日志 | 完成标准 |
|--------------|-------------|-------------------------------------------|--------------------------|----------------|----------|----------|
| {原子skill1} | {对应主skill} | 待执行 | {依赖的原子skill名称，无则填“无”} | 0 | | {该原子skill的完成标准} |
| {原子skill2} | {对应主skill} | 待执行 | {依赖的原子skill名称，无则填“无”} | 0 | | {该原子skill的完成标准} |

# 主skill完成标准
1. {标准1}
2. {标准2}

# 执行计划
计划层：{parallel_layers，仅表示计划可并行分组}
实际执行模式：serial_by_default

# 执行日志（实时更新）
## 系统日志（Reasoner写入）
{YYYY-MM-DD HH:MM:SS}：任务创建，确认执行路径和原子skill顺序
{YYYY-MM-DD HH:MM:SS}：开始执行原子skill[{原子skill名称}]
{YYYY-MM-DD HH:MM:SS}：原子skill[{原子skill名称}]执行{成功/失败}，重试次数{X}
{YYYY-MM-DD HH:MM:SS}：{fast路径升级为durable / 恢复 / 反思}，原因：{具体原因}

## 错误日志（Reasoner/主skill写入）
{YYYY-MM-DD HH:MM:SS}：原子skill[{原子skill名称}]执行失败，原因：{具体原因}，影响等级：{low/medium/high}

# 共享上下文
<!-- atomic-skill: {原子skill名称} -->
{核心输出}
<!-- /atomic-skill: {原子skill名称} -->

# 最终结果汇总
结果内容：{汇总结果}
是否符合目标：{是/否/部分}
偏差值：{具体数值或“不适用”}
校验结果：{passed/failed/partial}
失败标准：{未通过项，无则填“无”}
风险备注：{风险说明，无则填“无”}
反思次数：{0-3}
下一步：{归档/恢复/人工处理/无}

# 归档说明
归档时间：{Durable 执行完毕后自动填写YYYY-MM-DD HH:MM:SS}
归档路径：{tasks/history/YYYY-MM/task_skill_{任务ID}.md}
是否可固化：{是/否，提示用户手动迁移至项目目录}
