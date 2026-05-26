---
name: task-archiver
description: 任务归档与索引更新 — 将完成的task_skill.md归档至历史目录，更新月度任务索引，检测可固化文档并提示用户
---

# Task Archiver 原子Skill

## 概述

任务归档是 Orchestrator 编排链路的最后一环，在所有原子skill执行完毕且结果校验通过（或反思完成后）触发。此skill将 `tasks/current/task_skill_{id}.md` 移动到 `tasks/history/YYYY-MM/` 目录，按月份归档，并自动更新当月的任务索引文件（`月度任务索引.md`）。同时检测可固化的文档（如生成的代码规范、架构文档），提示用户选择是否迁移到项目目录。

## 核心能力

- 归档时间戳生成：精确到秒的 ISO 格式时间戳
- 目录自动创建：YYYY-MM 格式目录，不存在时自动创建
- 原子移动操作：使用临时文件名+重命名，避免移动过程中的文件损坏
- 月度索引维护：创建或追加 `tasks/history/YYYY-MM/月度任务索引.md`
- 可固化文档检测：识别代码规范、README、架构文档等可复用的生成物
- 相似度特征提取：为历史检索准备相似度计算特征向量
- 用户交互提示：对可固化文档，提示用户选择迁移/仅索引/忽略

## 输入

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| task_skill_md | string | 是 | 执行完成的 task_skill.md 文件路径 |
| validation_report | object | 是 | result-validator 输出的验证报告 |
| intent | object | 是 | 原始意图对象（用于相似度特征提取） |

## 输出

归档完成后的文件结构和更新后的索引：

**归档文件**：`tasks/history/2026-05/task_skill_TASK_20260522_abc1.md`

**月度索引**：`tasks/history/2026-05/月度任务索引.md`
```markdown
## 2026-05-22

| task_id | 归档时间 | 意图摘要 | 主Skill | 结果 | 相似度特征 | 路径 |
|---------|---------|---------|---------|------|-----------|------|
| TASK_20260522_abc1 | 2026-05-22T14:35:00+08:00 | 创建会议卡片组件 | code-generator | 完成 | frontend,create,component,Vue | ./2026-05/task_skill_TASK_20260522_abc1.md |
```

**流式输出**：
```
[ARCHIVE_START] task_id=TASK_20260522_abc1
[ARCHIVE_MOVE] tasks/current/ -> tasks/history/2026-05/
[INDEX_UPDATE] 月度索引已更新
[DOC_DETECT] 检测到可固化文档：CODE_STYLE.md（用户未选择迁移）
[ARCHIVE_COMPLETE] 归档完成，索引已更新
```

## 执行逻辑

1. **生成归档时间戳**：
   ```python
   archive_timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+08:00")
   year_month = datetime.now().strftime("%Y-%m")
   ```

2. **创建目标目录**（如不存在）：
   ```python
   target_dir = f"tasks/history/{year_month}/"
   os.makedirs(target_dir, exist_ok=True)
   ```

3. **原子移动 task_skill.md**：
   ```python
   task_id = extract_task_id(task_skill_md)
   temp_path = os.path.join(target_dir, f".tmp_{task_id}_{uuid4()}.md")
   final_path = os.path.join(target_dir, f"task_skill_{task_id}.md")
   shutil.copy2(task_skill_md, temp_path)
   os.rename(temp_path, final_path)  # 原子操作
   os.remove(task_skill_md)
   ```

4. **更新月度索引**：
   ```python
   index_file = os.path.join(target_dir, "月度任务索引.md")
   entry = build_index_entry(task_skill_md, archive_timestamp, intent, validation_report)
   if os.path.exists(index_file):
       append_to_index(index_file, entry)
   else:
       create_index_with_entry(index_file, year_month, entry)
   ```

5. **相似度特征提取**：
   ```python
   def extract_similarity_features(intent, validation_report):
       return [
           intent.domain,
           intent.action,
           intent.target.type,
           intent.target.name,
       ] + intent.keywords[:3]  # 取前3个关键词
   ```

6. **可固化文档检测**：
   ```python
   def detect_solidifiable_docs(task_skill_md):
       solidifiable_types = [
           "CODE_STYLE.md",
           "README.md",
           "ARCHITECTURE.md",
           "API_DOC.md",
           "*.config.js",
           "*.config.ts"
       ]
       # 扫描 task_skill.md 结果区域，识别可复用文档
       # 返回列表：[(doc_name, doc_path, reason)]
   ```

7. **用户提示**（对每个可固化文档）：
   ```
   检测到可固化文档：CODE_STYLE.md
   原因：在任务中生成的代码规范文档，可直接迁移到项目根目录
   选项：1) 迁移到项目目录  2) 仅索引（不迁移）  3) 忽略

   > 默认选项：仅索引
   ```

**索引条目格式**：
```markdown
## {归档日期}

| task_id | 归档时间 | 意图摘要 | 主Skill | 结果等级 | 偏差值 | 相似度特征 | 归档路径 |
|---------|---------|---------|---------|---------|-------|-----------|---------|
| TASK_xxx | 2026-05-22T14:35:00 | {intent摘要，前50字} | {主skill} | {完成/部分完成/失败} | {deviation} | {特征1,特征2,...} | ./2026-05/task_skill_xxx.md |
```

## 依赖关系

- **被依赖**：无（编排链路终点）
- **依赖**：result-validator（输入来自校验报告）

## 完成标准

1. task_skill.md 已从 `tasks/current/` 移动到 `tasks/history/YYYY-MM/`
2. YYYY-MM 目录已创建（如不存在）
3. 月度索引 `tasks/history/YYYY-MM/月度任务索引.md` 已存在并包含新条目
4. 索引条目包含：task_id, archive_time, intent_summary, main_skill, result_summary, similarity_features, archive_path
5. 原 current 目录下的 task_skill.md 文件已删除
6. 流式输出包含 ARCHIVE_COMPLETE 事件

## 错误处理

- **目标目录创建失败**（权限问题）：抛出 PauseException，暂停归档，等待用户处理
- **文件移动失败**（原文件不存在/被占用）：记录错误到日志，索引中标记归档失败，跳过移动
- **索引文件写入失败**：回滚操作，文件保持在 current 目录，提示用户手动归档
- **月度索引格式损坏**：创建新的索引文件，旧条目追加到末尾
- **可固化文档检测失败**：跳过文档检测，继续归档流程

## 示例

**归档结果**：
```
原始文件：tasks/current/task_skill_TASK_20260522_abc1.md
归档位置：tasks/history/2026-05/task_skill_TASK_20260522_abc1.md
索引位置：tasks/history/2026-05/月度任务索引.md

月度索引新增条目：
| TASK_20260522_abc1 | 2026-05-22T14:35:00 | 创建会议卡片组件... | code-generator | 完成 | 0.05 | frontend,create,component | ./2026-05/task_skill_TASK_... |
```

## 注意事项

- 文件移动使用原子操作（临时文件+重命名），避免在移动过程中内容损坏
- 月度索引只追加新条目，不修改历史条目，保证可审计性
- 相似度特征控制在10个以内，避免索引文件过大
- 可固化文档提示是可选的，不强制用户操作，默认仅索引
- 归档完成后，当前目录的临时文件（如 lock 文件）也应清理

## 原子skill位置

./.claude/skills/atomic-skills/task-archiver/SKILL.md