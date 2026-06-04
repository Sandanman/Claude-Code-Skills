---
name: fix-generation
description: 根据根因定位报告，设计并生成具体的代码修复方案，提供可执行的修改建议。在根因定位后执行。v1.3 整合韬定律（τ 控制、技能栈叠）。
---

# Fix Generation 原子Skill v1.3（τ 增强版）

## 版本历史
- v1.3 (2026-06-04): 整合韬定律，添加 Skill Stacking 上下文键、τ-weight 标注
- v1.0（初始版本）

## 概述
根据根因定位报告，设计并生成具体的代码修复方案，提供可执行的修改建议。

## 核心能力
- 根据根因设计修复方案
- 生成具体的代码修改补丁
- 考虑向后兼容性
- 提供修复说明
- 输出修复方案文档

## 输入
root-cause-analysis输出的根因定位报告

## 输出
修复方案文档：

```markdown
# 修复方案

## 修复目标
解决登录功能中"TypeError: Cannot read property 'login' of undefined"的错误

## 修复方案

### 方案1：（推荐）修正导入路径
- **类型**：代码修改
- **修改内容**：
  ```diff
  --- a/src/views/Login/index.vue
  +++ b/src/views/Login/index.vue
  @@ -25,7 +25,7 @@
   import { session, storage } from '@/utils/utils'
  -import userAPI from '@/utils/utils'
  +import userAPI from '@/api/user.js'
  ```
- **修改行号**：第28行
- **风险评估**：低
- **理由**：直接解决根本原因

### 方案2：添加防御性检查
- **类型**：代码修改
- **修改内容**：在调用userAPI.login前添加存在性检查
- **风险评估**：中
- **理由**：作为备选方案，增加容错性

## 推荐方案
方案1（修正导入路径）- 理由：直接解决根本原因，代码简洁

## 修复实施步骤
1. 打开src/views/Login/index.vue
2. 找到第28行
3. 修改导入路径
4. 保存并重启开发服务器
5. 验证修复效果
```

## 执行逻辑
1. 根据根因定位报告中的建议修复方向设计修复方案
2. 生成具体的代码修改补丁（使用diff格式）
3. 提供至少两个方案：推荐方案和备选方案
4. 评估每个方案的优缺点
5. 输出完整的修复方案文档

## 依赖关系
- 依赖：root-cause-analysis（必须有完整的根因定位报告）
- 被依赖：fix-verification

## 完成标准
1. 提供至少两个修复方案（推荐+备选）
2. 每个方案包含具体的代码修改补丁（diff格式）
3. 包含修改文件和行号
4. 包含影响范围、兼容性、风险评估
5. 明确推荐方案并说明理由
6. 提供修复验证建议和回滚方案
7. 输出完整的修复方案文档

## 错误处理
- 如果修复方案复杂，提供多个备选方案
- 如果修改涉及多个文件，分别列出每个文件的修改
- 如果修复可能导致副作用，明确指出

## 注意事项
- 修复方案必须基于根因，不能解决表面现象
- 优先推荐直接修复根本原因的方案
- 提供备选方案以应对特殊情况
- 所有代码修改必须使用diff格式

## 原子skill位置
./.claude/skills/bug-solver/atomic-skills/fix-generation/SKILL.md

---

## Skill Stacking & τ-Weight（v1.3）

### τ-Weight
从 bug-solver 主 SKILL.md 的 7步 τ 分配表继承。
| 复杂度 | τ-Weight |
|--------|----------|
| simple | 20% |
| moderate | 18% |
| complex | 20% |

### Skill Stacking 上下文键
| 键名 | 类型 | 说明 |
|------|------|------|
| `root_cause` | required_keys | 从 task_skill.md 读取，根因 + 证据链 |
| `fix_plan` | output_keys | 修复方案列表 + 推荐方案 + diff |

### 执行日记写入（必须）
本 atomic skill 执行完成后，必须将 output_keys 写入 `task_skill.md` 的技能输出区域，供下游 skill 通过 Skill Stacking TSV 读取。

### 折叠标记
[核心·不折叠] - fix-generation 是核心修复步骤，禁止折叠，必须独立执行。