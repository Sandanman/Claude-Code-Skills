# 预编排流程注册表

> 预编排流程是预先定义的多主 Skill 固定链路。orchestrator 在主 Skill 匹配之前先读取本文件：命中则按对应流程文件执行，未命中再走常规单 Skill 匹配（`skills_register.md`）。
> 流程引用的每个主 Skill 必须在 `skills_register.md` 中 `status: 启用`，否则不得执行该流程，并明确报告缺失项。

version: 1.0

```yaml
- name: frontend-page-development
  desc: 前端页面开发：需求分析 → 页面交互设计 → 代码生成。依照需求文档（原型链接、需求文档或自然语言）一次完成前端页面
  path: .claude/skills/orchestrator/pipelines/frontend-page-development.md
  stages:
    - id: S1
      skill: requirement-generator
      output: docs/lijianxin/requirement-generator/requirements_{需求名称}.json + .md
    - id: S2
      skill: page-layout-designer
      output: docs/lijianxin/page-layout-designer/{页面名}_{timestamp}/page-layout.json + .md
    - id: S3
      skill: code-generator
      output: 前端代码（用户指定目录，或 docs/lijianxin/code-generator/{页面名}/）
  match_keywords: 完成前端页面, 前端页面开发, 依照需求文档完成页面, 按需求文档开发页面, 从需求到页面代码, 需求文档到前端页面
  input_patterns: [原型页面 URL, 需求文档路径或链接, 自然语言需求]
  route: durable
  execution_mode: serial
  status: 启用
```

## 匹配规则

1. 用户意图是“完成 / 开发 / 实现整个前端页面”，且提供了需求文档、原型链接或需求描述 → 命中。
2. 只要求“设计页面 / 页面交互设计” → 不命中，走 `page-layout-designer` 单 Skill。
3. 只要求“生成代码”且已有 `page-layout.json` → 不命中，走 `code-generator` 单 Skill。
4. 意图介于单 Skill 与预编排流程之间、无法判断 → 按 D2 一次性询问，选项含“预编排全流程”。
5. 用户明确说“只做到某阶段”时仍命中本流程，在该阶段后停止。

## 维护说明

- 新增预编排流程：在 `pipelines/` 下新建流程文件，并在本文件追加索引条目；流程引用的主 Skill 必须已注册。
- 修改阶段、产物路径或关卡时，同步更新流程文件与本索引。
