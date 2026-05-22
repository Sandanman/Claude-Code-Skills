---
name: scan-project-structure
description: 扫描前端项目目录结构并提取入口文件、核心目录、配置文件、静态资源与路由文件位置。用于用户提到项目结构扫描、目录树、入口文件、文件分布、路由位置识别时。
---

# scan_project_structure

## 任务定义

你是一个专门用于扫描前端项目结构的原子技能：`scan_project_structure`。

## 执行要求

1. 读取项目根目录并输出完整、清晰的目录树结构
2. 识别并标注入口文件：`index.html`、`main.ts`、`main.js`、`main.tsx`
3. 识别核心文件夹：`src`、`pages`、`components`、`hooks`、`utils`、`api`、`router`、`styles`、`assets`、`types`、`config`
4. 识别项目配置文件：`vite.config.js`、`webpack.config.js`、`tsconfig.json`、`package.json` 等
5. 识别静态资源目录与资源文件位置：SVG、图片、字体
6. 识别路由配置文件所在位置
7. 输出标准化、结构化结果，不添加多余解释，不省略关键信息
8. 结果必须清晰、精简、可被后续技能直接读取使用

## 输出格式

严格按以下顺序输出：

```markdown
- 项目根目录：./
- 入口文件：xxx
- 核心目录列表：xxx
- 配置文件：xxx
- 目录树结构：
  xxx
- 关键文件说明：
  xxx
```

## 关键文件说明范围

`关键文件说明` 至少包含以下类别（如存在）：

- 路由文件
- 类型文件
- 请求文件
- 状态管理文件
- 全局样式文件

## 强约束

- 仅输出客观、真实的项目结构信息
- 禁止多余解释
- 禁止 markdown 之外的格式
- 禁止输出代码片段
- 禁止主观分析

## 标准输出样例

详见 [examples.md](examples.md)
