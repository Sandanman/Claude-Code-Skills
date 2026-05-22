# Bug Solver

系统化地解决应用程序中的bug，通过7个原子skill协同工作，从bug分类到修复验证，完整记录和追溯整个debug过程。

## 快速开始

### 触发方式
当用户报告错误、异常行为或提供bug信息时自动触发：

```
用户: "登录页面点击登录按钮没有反应，控制台显示TypeError: Cannot read property 'login' of undefined"
```

### 执行命令
Claude Code 将按以下7步管道自动执行：

```
bug-triage → bug-identification → code-analysis
  → root-cause-analysis → fix-generation
  → fix-verification → test-suggestion
```

---

## 文件结构

```
bug-solver/
├── SKILL.md                         # 主skill定义（入口）
├── README.md                        # 本文件
└── atomic-skills/
    ├── bug-triage/                 # 分类bug类型和优先级 [NEW]
    │   └── SKILL.md
    ├── bug-identification/         # 收集bug信息
    │   └── SKILL.md
    ├── code-analysis/              # 分析相关代码
    │   └── SKILL.md
    ├── root-cause-analysis/        # 定位根本原因
    │   └── SKILL.md
    ├── fix-generation/             # 生成修复方案
    │   └── SKILL.md
    ├── fix-verification/           # 验证修复效果
    │   └── SKILL.md
    └── test-suggestion/             # 建议测试用例
        └── SKILL.md
```

---

## Bug分类系统

### 按类型分类
| 类型 | 说明 | 典型症状 |
|------|------|----------|
| frontend | 前端问题 | 页面不显示、控制台错误、样式异常 |
| backend | 后端问题 | API 500错误、数据库异常 |
| config | 配置问题 | 环境变量缺失、配置文件错误 |
| logic | 逻辑问题 | 业务逻辑不符预期 |

### 按优先级分类
| 优先级 | 说明 | 响应时间 | 示例 |
|--------|------|----------|------|
| critical | 系统崩溃、数据丢失、安全漏洞 | 立即 | 登录崩溃、支付失败、XSS注入 |
| high | 核心功能完全不可用 | 24小时 | 会议无法创建、用户无法注册 |
| medium | 功能部分受损，有替代方案 | 72小时 | 通知延迟、列表加载慢 |
| low | 体验问题，不影响核心功能 | 1周 | 样式偏差、轻微延迟 |

### 处理策略
| 策略 | 适用场景 | 说明 |
|------|----------|------|
| 立即修复 | critical/high优先级 | 快速定位根因，应用修复 |
| 计划修复 | medium优先级 | 按标准流程处理 |
| 记录跟踪 | low优先级 | 记录但暂不处理 |

---

## 使用示例

### 输入
```
登录页面点击登录按钮没有反应，控制台显示TypeError: Cannot read property 'login' of undefined
```

### 执行流程

**Step 1: bug-triage**
- 分析错误信息，提取关键词
- 判断bug类型：frontend（前端错误）
- 判断优先级：high（核心功能不可用）
- 制定处理策略：立即修复
- 输出：bug分类报告

**Step 2: bug-identification**
- 收集错误信息（TypeError、位置）
- 整理复现步骤（打开页面、输入信息、点击按钮）
- 整理期望行为（登录成功跳转）
- 整理实际行为（点击无反应，控制台报错）
- 输出：结构化问题报告

**Step 3: code-analysis**
- 分析相关代码文件（Login/index.vue, api/user.js）
- 定位可疑代码段
- 分析数据流和调用关系
- 输出：代码分析报告

**Step 4: root-cause-analysis**
- 整合错误日志和代码分析结果
- 构建证据链
- 确定根本原因：导入路径错误
- 输出：根因定位报告

**Step 5: fix-generation**
- 设计修复方案（修正导入路径）
- 生成diff格式代码修改
- 提供验证建议
- 输出：修复方案文档

**Step 6: fix-verification**
- 执行功能验证
- 执行代码审查
- 确认修复成功
- 输出：修复验证报告

**Step 7: test-suggestion**
- 建议单元测试用例
- 建议集成测试场景
- 建议回归测试清单
- 输出：测试建议文档

### 输出产物
- Bug分类报告
- 结构化问题报告
- 代码分析报告
- 根因定位报告
- 修复方案文档（含diff）
- 修复验证报告
- 测试建议文档

---

## 注意事项

1. **Bug分类优先**：bug-triage是第一个步骤，分类结果决定后续处理策略
2. **证据链支撑**：根因分析必须有完整的证据链支持
3. **双方案推荐**：修复方案至少提供推荐方案和备选方案
4. **验证必须执行**：fix-verification是必须步骤，不能跳过
5. **测试防止回退**：test-suggestion提供回归测试用例，防止问题再次发生