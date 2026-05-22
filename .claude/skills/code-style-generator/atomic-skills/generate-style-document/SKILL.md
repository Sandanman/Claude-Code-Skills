---
name: generate-style-document
description: 整合所有规则和用户确认，生成最终的个人代码习惯文档 CODE_STYLE.md
reasoner_instructions: |
  MERGE all rules by priority (user > config > inferred). GENERATE CODE_STYLE.md in project root.
  INCLUDE code examples and summary table. OUTPUT file path and rule statistics.
---

# generate-style-document

## 任务定义

你是原子技能 `generate-style-document`，只负责整合所有规则，生成最终的代码习惯文档。

## 输入参数

从前面的任务获取：
- `configRules`：从配置文件检测到的规则
- `inferredRules`：从代码推断的规则
- `confirmedRules`：用户确认的规则
- `ruleSources`：每条规则的来源标签
- `probeCode`：最终的探测代码片段（用于文档示例）
- `userModifications`：用户修改记录
- `userAnswers`：用户补充问答记录

## 文档模板结构

### 1. 标题和引言

```markdown
# 代码习惯规范

个人编码习惯总结，适用于前端开发（Vue/JS/CSS）。

---

## 基础格式

### 缩进
- **{indent_size}个空格**

...
```

### 2. 规则组织

按照以下顺序组织：

- 基础格式
  - 缩进
  - 引号
  - 分号
  - 大括号风格（K&R / Allman）
  - 关键字后空格规则
  - 行长度限制
  - 尾逗号
  - 文件末尾换行符
- JavaScript
  - 变量声明原则（const优先）
  - 箭头函数风格
  - 命名风格（camelCase）
  - 注释风格
- Vue / React（根据项目是否存在）
- CSS
  - 命名风格（kebab-case）
  - 单位偏好（px/rem）
- 调试代码
  - console.log处理规则

### 3. 代码示例

使用探测代码片段作为示例，并根据修改后的规则调整：

- HTML探究片段
- CSS探究片段
- JavaScript探究片段
- Vue探究片段（如果存在Vue文件）
- React探究片段（如果存在React文件）

### 4. 总结表格

```markdown
| 项目 | 规范 |
|------|------|
| 缩进 | {indent_size}个空格 |
| 引号 | {html_attribute_quotes} for HTML, {quotes} for JS |
| ... | ... |
```

## 规则优先级

按优先级应用规则（高优先级覆盖低优先级）：

1. **用户确认**：明确确认的规则（最高优先级）
2. **用户修改**：用户手动修改探测代码的规则
3. **配置文件**：从配置文件检测到的规则
4. **代码推断**：从代码扫描推断的规则（最低优先级）

## 执行规则

1. **合并规则**：按优先级合并所有规则
2. **消除冲突**：如果同一规则有多个值，优先选择高优先级
3. **填充模板**：将规则填充到文档模板中
4. **生成示例**：调整探测代码示例，使其符合最终规则
5. **生成表格**：创建总结表格

### 处理用户修改示例

**原始探测代码**：
```javascript
const name = 'single quote'
const age = "double quote"
const hasSemicolon = true;
```

**用户修改**：将双引号改为单引号，添加分号

**调整后示例**：
```javascript
const name = 'single quote'
const age = 'double quote'  // 用户确认使用单引号
const hasSemicolon = true   // 用户确认使用分号
```

---

## 输出格式

生成的文档格式：

```markdown
# 代码习惯规范

[完整文档内容]

---
*生成时间：[YYYY-MM-DD HH:mm:ss]*
*规则来源：配置文件[3]，代码推断[12]，用户确认[5]*
```

## 强约束

- 必须整合所有来源的规则
- 优先级：用户确认 > 用户修改 > 配置文件 > 代码推断
- 代码示例必须与最终规则完全一致
- 生成的文档必须是有效的Markdown格式
- 必须在文档末尾标注生成时间和规则来源统计

## 输出文件

生成文件：`CODE_STYLE.md`
位置：项目根目录

如果文件已存在，覆盖原有文件。

## 示例输出片段

```markdown
### 文件末尾
- **保留换行符**

---

### 注释风格
- **简洁注释**

```javascript
// 获取用户信息
const getUserInfo = () => { }
```

---

## 总结

| 项目 | 规范 | 来源 |
|------|------|------|
| 缩进 | 4个空格 | 配置文件 |
| 引号 | 单引号 | 用户确认 |
| 分号 | 不使用 | 代码推断 |
...
```
