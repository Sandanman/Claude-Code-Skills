# Bug Solver

`bug-solver` 是 Bug 原子 Skill 编排器，根据用户目标、Bug 优先级和已有上下文，选择标准修复模式或场景组合模式。

## 快速开始

### 触发方式

当用户报告错误、异常行为或提供 Bug 信息时触发：

```text
用户：登录页面点击登录按钮没有反应，控制台显示 TypeError
```

### 模式选择

```text
用户目标和已有上下文
        ↓
识别编排模式
   ┌────┴────┐
标准修复模式  场景组合模式
   ↓          ↓
完整修复链   依赖闭包组合
```

## 标准修复模式

适用于需要完成从问题识别到修复验证的完整 Bug 修复任务：

```text
bug-triage
  → bug-identification
  → code-analysis
  → root-cause-analysis
  → fix-generation
  → 应用代码修改
  → fix-verification（包含修改完成校验）
  → test-suggestion（按需）
```

## 场景组合模式

适用于只需完成部分目标，或已有可信阶段产物的任务。组合必须满足依赖关系，不得无依据跳过前置阶段。

| 用户目标 | 最小组合 | 结束条件 |
| -------- | -------- | -------- |
| 分类和定级 | `bug-triage` | 输出类型、优先级和策略 |
| 整理问题 | `bug-triage → bug-identification` | 输出结构化问题报告 |
| 分析代码 | 延伸至 `code-analysis` | 输出代码分析报告 |
| 定位根因 | 延伸至 `root-cause-analysis` | 输出根因和证据链 |
| 生成方案 | 延伸至 `fix-generation` | 输出推荐方案、备选方案和 diff |
| 验证修改 | `fix-verification` | 提供修复方案、已应用修改和验证证据 |
| 生成测试建议 | `test-suggestion` | 提供完整验证报告 |

已有阶段产物可以替代对应前置 Skill，但必须能够确认来源、时间和适用范围。无法确认时，应重新执行对应阶段。

## 文件结构

```text
bug-solver/
├── SKILL.md
├── README.md
└── atomic-skills/
    ├── bug-triage/SKILL.md
    ├── bug-identification/SKILL.md
    ├── code-analysis/SKILL.md
    ├── root-cause-analysis/SKILL.md
    ├── fix-generation/SKILL.md
    ├── fix-verification/SKILL.md
    └── test-suggestion/SKILL.md
```

## 修改完成校验

在标准修复模式中，`fix-verification` 必须检查：

1. 修复方案中的目标文件是否已实际修改。
2. 实际 diff 是否与修复方案一致。
3. 原始复现步骤是否不再触发问题。
4. 是否检查了相关功能、边界条件和错误路径。
5. 是否存在可追溯的测试、构建、运行或人工复核证据。
6. 是否明确记录 `passed`、`failed`、`partial` 或 `not_applied` 状态。

方案生成但代码尚未应用时，不得判定为修复成功。

## 输出产物

- 编排模式：`orchestration_mode`
- 已选原子 Skill：`selected_skills`
- 编排状态：`orchestration_status`
- Bug 分类报告：`triage_result`
- 结构化问题报告：`bug_report`
- 代码分析报告：`analysis_result`
- 根因定位报告：`root_cause`
- 修复方案文档：`fix_plan`
- 修复验证报告：`verification_result`
- 修改完成校验：`modification_validation`
- 测试建议文档：`test_cases`

## 完成规则

- 场景组合模式：所选组合中的所有步骤完成后即可结束。
- 标准修复模式：完成修复链，且修改完成校验状态为 `passed`、`failed` 或 `partial`，不得隐瞒阻塞项。
- 执行 `test-suggestion` 时，输出至少三个相关测试场景。
- 跳过 `test-suggestion` 时，必须记录跳过原因。
- 低优先级 Bug 如果用户只要求记录或分类，可以在前置目标完成后结束，不得自行生成修复。

## 使用示例

### 仅分类

```text
用户：只判断这个 Bug 的类型和优先级。
```

执行：`bug-triage`，输出分类报告后结束。

### 只分析根因

```text
用户：帮我定位这个 Bug 的根因，不要修改代码。
```

执行：`bug-triage → bug-identification → code-analysis → root-cause-analysis`，输出根因报告后结束。

### 完整修复

```text
用户：修复登录异常，并确认修改已经生效。
```

执行标准修复模式，并在 `fix-verification` 中完成修改范围、diff、原问题和验证证据校验。

## 注意事项

1. `bug-triage` 是默认入口；已有可信分类结果时可以复用。
2. 不得跳过缺失的依赖产物。
3. `fix-generation` 只负责生成方案，不代表代码已经修改。
4. `fix-verification` 必须确认修改已应用，不能仅凭方案判定成功。
5. 所有未执行步骤、失败步骤和阻塞项都必须记录。

## 版本信息

- 主 Skill 名称：`bug-solver`
- 原子 Skill 数量：7
- 状态：启用
- 最后更新：2026-10-20
