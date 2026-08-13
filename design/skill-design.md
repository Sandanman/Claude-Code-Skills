Skills架构思路

1、设计原则：
只有一个Reasoner调度器：理解用户意图，去匹配自己的主skill，主skill读取Reasoner传入的意图匹配组合自己的原子skill和执行顺序，生成任务skill，任务skill中记录当前任务的信息，执行完毕后依据日期归档。并可以依据任务skill从中断的子任务继续执行。


2、文件系统设计

.skills/
|    orchestrator/
|    | - SKILL.md
|    | - README.md
|    | - skills_register.md
|    | - missing_skills.md
|    | - …
| - 主skill/
|    | - SKILL.md
|    | - README.md
|    | - atomic-skills/
|    | - | - 原子skill1
|    | - | - 原子skill2
|    | - | - …
| - tasks/
|    | - current/
|    |    | - task_skill.md
|    | - history/
|    |    | - 2026-04/
|    |    |    | - 月度任务索引.md
|    |    |    | - task_20260401_01_project_analyze.md
|    |    |    | - task_20260401_02_update_versions.md
|    |    |    | - task_20260402_01_get_ui.md
|    |    |    | - …
|    |    | - 2026-03/
|    |    | - …
|    | - templates/
|    |    | - task_skill_template.md
|    |    | - 月度任务索引模版.md


3、执行流程
（1）意图识别与目标推理：Reasoner调度器（.skills/orchestrator/SKILL.md）解析用户输入，明确最终目标，自主判断目标复杂度——简单目标（无需多原子技能、无需保存状态）直接自主输出结果【end】；复杂目标则压缩生成明确意图，自主判断需要多步执行，进入下一步。
（2）历史意图检索：
（2.1）Reasoner调度器对明确意图做特征提取，检索历史任务索引（不遍历全量历史文件），召回Top3~5最相关历史任务，判断相似度是否≥阈值（如0.85）；
（2.2）有高度相似且已完成的历史记录，则检索.skills/tasks/history/下的对应任务，并输出结果/结论，当前任务结束。【end】
（2.3）没有高度相似历史记录，则判断在.skills/tasks/current下是否有与意图相关的未完成的任务？
（2.3.1）有相关任务，提示给用户选择是继续执行第（6）步？还是开始新任务第（3）步？
（2.3.2）没有相关任务，则进行第（3）步。
（3）Reasoner调度器（.skills/orchestrator/SKILL.md）根据意图和目标，自主规划所需能力，读取.skills/orchestrator/skills_register.md下已注册的主skill，自主匹配所需主skill（支持单主skill或多主skill组合），判断匹配合理性：
（3.1）没有匹配的主skill或匹配不符合需求，记录到完善列表（.skills/orchestrator/missing_skills.md），并自主执行，最终自主输出结果。【end】
（3.2）有多个符合需求的主skill，由用户选择使用哪个，选择后，将意图和目标传入所选主skill，进行第（4）步。
（3.3）有唯一符合需求的主skill，将意图和目标传入该主skill，进行第（4）步。
（4）主skill接收用户意图和目标，只读取.skills/orchestrator/skills_register.md下已注册的主skill所属的原子skill，Reasoner调度器同步参与原子skill的选择、逻辑和依赖关系分析，确定执行顺序（并行执行的原子skill需遵循状态同步规则，同一时间仅允许一个原子skill写入task_skill.md，避免读写冲突），主skill依据任务skill模版（.skills/tasks/templates/task_skill_template.md）生成任务skill（task_skill.md，固定名称）到.skills/tasks/current/下。task_skill.md包含任务的所有状态、执行日记、原子skill完成的标准、主skill完成的标准等信息，并最终将原子skill的执行结果进行汇总、输出。
（5）Reasoner调度器全程掌控执行流程，按照task_skill.md的顺序执行原子skill，实时更新task_skill.md下子任务的状态，并且后续当子任务状态变更时均需要更新，不符合完成的标准或出错的原子skill，可重试3次。原子skill出错是否影响后续执行？
（5.1）影响，暂停任务，将错误抛出给用户确认，根据用户确认信息继续操作第（6）步；Reasoner调度器同步分析错误原因（仅聚焦当前原子技能失败原因，不追溯无关步骤），准备后续重规划，且仅为后续反思提供依据，不额外占用执行资源。
（5.2）不影响，将错误信息记录到task_skill.md的该原子skill的执行日志中，供用户查看，Reasoner调度器继续推进后续执行。
（6）Reasoner调度器读取当前task_skill.md任务状态和历史上下文，从未完成的原子任务继续执行，执行过程中若发现原计划不合理（如原子skill匹配错误、顺序不当），自主调整执行计划（仅允许微调原子技能顺序、补充同类型原子技能，不允许替换主skill或新增未注册技能），直到所有原子任务均完成。
（7）当所有原子skill执行完毕时，Reasoner调度器依据task_skill.md中的完成标准进行一一校验，同时自主评估结果是否符合最终目标（仅当结果与目标偏差≥0.2阈值时触发反思）。不符合标准的进行重试，最多进行3次；若重试后仍不达标，Reasoner调度器分析原因，尝试补充原子skill或调整执行顺序（不允许新增主skill），再次校验，反思重规划最多触发3次，若3次后仍不达标，不再继续反思，直接进入步骤（8）。
（8）无论是否有重试，重试结果如何，均整合各原子skill的结果，输出到结果文档。如果有重试失败的信息，将失败信息记录到结果文档中；Reasoner调度器同步记录反思日志（仅记录关键问题、可落地优化方向，不记录冗余思考过程，控制日志体量）。
（9）任务归档
（9.1）将task_skill.md根据当前年月YYYY-MM移入到历史文件夹（tasks/history/[YYYY-MM]）下，如果没有当前月份的文件夹[YYYY-MM]则直接新建，有当前月份文件夹则直接移入。
（9.2）更新历史文件夹（tasks/history/[YYYY-MM]）下的月份索引文件，如果有则直接写入更新，如果没有则依据.skills/tasks/templates/月度任务索引模版.md模版新建当月任务索引后写入。
（9.3）特殊可固化的文档，提示用户可手动移至项目目录下。【end】
