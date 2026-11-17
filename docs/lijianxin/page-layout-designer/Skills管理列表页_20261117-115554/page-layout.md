# 页面布局设计文档

## 页面概览

| 项 | 内容 |
|----|------|
| 文档 ID | page-layout-skills-list-20261117-115554 |
| 页面名称 | Skills管理列表页 |
| 路由 | [待确认] |
| 版本 | 1.0 |
| 场景 | from_requirement |
| 提问模式 | draft_first |
| 复杂度 | simple |
| 生成时间 | 2026-11-17 12:59:16 |
| 任务 ID | 20261117-002 |
| 需求来源 | docs/lijianxin/requirement-generator/requirements_Skills管理列表页.json |

- 页面目标：展示 Skill 列表，支持按名称/描述搜索、按分类筛选、新建、详情、编辑、删除和分页。
- 目标用户：[待确认]
- 入口：[待确认]
- 权限：not_applicable，原型未体现权限控制。
- 数据来源：全部交互使用 mock；需求 api_spec 为空，未指定接口；mock 数据取自需求 sample_data 6 条，仅在方法内返回。
- 设备：[待确认]
- 纳入模块：M-05 工具栏、M-06 Skill 列表、M-07 行操作、M-08 空状态、M-09 分页。
- 排除模块：M-01 顶部产品栏、M-02 工作台头部、M-03 左侧导航、M-04 面包屑栏。

## 项目技术栈与规范

| 项 | 内容 | 状态 |
|----|------|------|
| 框架 | React，版本 [待确认]；语言 [待确认] | confirmed |
| 组件风格 | 函数组件 + Hooks，生命周期用 useEffect(…, [])（需 React >= 16.8，[待确认]） | confirmed |
| UI 库 | antd 3.*，精确版本 [待确认]；来源：用户指定（user_confirmed） | confirmed |
| 引入方式 | [待确认] | — |
| 样式方案 | [待确认] | — |
| 项目约定 | [待确认]：目标前端项目的目录、代码规范、公共组件清单未提供 | — |
| 上下文来源 | manual（项目内无 .claude/project-context.json） | — |

证据：ev.001 技术栈 React + Antd 3.* 由用户在任务初始化时指定；ev.002 整页草案由用户确认，分页选「真实分页」，删除确认选 Popconfirm 并确认其规格。

## 页面布局树

```text
layout.page（上—中—下，vertical）
├── layout.toolbar（工具栏 M-05，左右）
│   ├── layout.toolbar.filters（筛选区）
│   └── layout.toolbar.actions（操作区）
├── layout.table（Skill 列表区 M-06/M-07/M-08）
└── layout.pagination（分页区 M-09，左右）
    ├── layout.pagination.total（总数与页码文案）
    └── layout.pagination.controls（每页条数与翻页）
```

| 布局 ID | 名称 | 父级 | 布局类型 | 方向 | 尺寸 | 顺序 | 响应式 |
|---------|------|------|---------|------|------|------|--------|
| layout.page | 页面根容器 | — | 上—中—下 | vertical | — | — | — |
| layout.toolbar | 工具栏（M-05） | layout.page | 左右 | horizontal | 自适应高度，两端对齐 | 1 | <768：搜索框、分类下拉、新建按钮换行堆叠 |
| layout.toolbar.filters | 筛选区 | layout.toolbar | 流式 | horizontal | 自适应 | 1 | <768：搜索框与下拉各占一行 |
| layout.toolbar.actions | 操作区 | layout.toolbar | 流式 | horizontal | 自适应，靠右 | 2 | <768：独占一行 |
| layout.table | Skill 列表区（M-06/M-07/M-08） | layout.page | 单区域 | vertical | 撑满剩余宽度 | 2 | <768：Table 设置 scroll.x 横向滚动 |
| layout.pagination | 分页区（M-09） | layout.page | 左右 | horizontal | 自适应高度，两端对齐 | 3 | <768：左右两组内容换行 |
| layout.pagination.total | 总数与页码文案 | layout.pagination | 流式 | horizontal | 自适应，靠左 | 1 | <768：独占一行 |
| layout.pagination.controls | 每页条数与翻页 | layout.pagination | 流式 | horizontal | 自适应，靠右 | 2 | <768：独占一行 |

## 区域与组件明细

### layout.toolbar.filters 筛选区

**c.search 搜索框**
- 类型 input；来源 ui_library；组件 Input；需求 F-01
- placeholder：[待确认]（U-01：原型无 placeholder）
- 行为：按名称、描述关键字过滤，忽略大小写

**c.category 分类下拉**
- 类型 select；来源 ui_library；组件 Select；需求 F-02
- 选项：全部分类、文档、语言、视觉、数据、检索、其他
- 默认值：全部分类

### layout.toolbar.actions 操作区

**c.create + 新建 Skill**
- 类型 button；来源 ui_library；组件 Button（primary）；需求 F-03
- 文案：+ 新建 Skill

### layout.table Skill 列表区

**c.table Skill 列表**
- 类型 table；来源 ui_library；组件 Table；async: true；需求 F-04~F-10；rowKey = id；整行可点击
- 列定义：

| key | 标题 | 样式 |
|-----|------|------|
| id | Skill ID | Menlo 等宽，11px，#006bff |
| name | Skill 名称 | 加粗 |
| desc | 描述 | #535760 |
| category | 分类 | 纯文本 |
| source | 来源 | 纯文本，取值 Markdown 或 ZIP 包 |
| created_at | 创建时间 | #9ba7ba，12px |
| actions | 操作 | class col-actions |

- 备注：无状态列（R-09）；status 字段不展示；列表分页由前端按 pageSize 切片

**c.rowActions 行操作：详情 / 编辑 / 删除**
- 类型 link-group；来源 page_local；复用理由：仅在本页操作列出现一次，与本页行数据强绑定；需求 F-11~F-13

| key | 文案 | 样式 |
|-----|------|------|
| detail | 详情 | `<a>`，#006bff，12px，右间距 12px |
| edit | 编辑 | `<a>`，#006bff，12px，右间距 12px |
| delete | 删除 | `<a>`，#e53935，12px，包裹 Popconfirm |

**c.empty 空状态**
- 类型 empty；来源 ui_library；组件 Table locale.emptyText；需求 F-16
- 文案：暂无 Skill，点击「+ 新建 Skill」创建
- 样式：居中，内边距 40px，#9ba7ba；文案不做可点击链接

### layout.pagination.total 总数与页码文案

**c.total 总数文案**
- 类型 text；来源 ui_library；组件 Pagination showTotal；需求 F-17
- 文案：共 {N} 个；N 取过滤后条数

**c.pageIndicator 页码文案**
- 类型 text；来源 page_local；复用理由：Antd 3 Pagination 无原生「第 x/y 页」，仅本页出现一次；需求 F-22
- 文案：第 {当前页}/{总页数} 页

### layout.pagination.controls 每页条数与翻页

**c.pagination 分页控件**
- 类型 pagination；来源 ui_library；组件 Pagination；需求 F-18~F-21
- showSizeChanger: true；pageSizeOptions: 10 / 20 / 50；条数文案 {n} 条/页；上一页 ‹，下一页 ›
- 备注：‹、› 用 itemRender 渲染；默认每页条数 10

### layout.page 页面级

**c.toast 全局提示**
- 类型 message；来源 ui_library；组件 message；需求 F-15
- 删除成功：message.success「已删除」，2 秒消失；删除失败：message.error「删除失败」[待确认]

## 交互与流程

### i.search 搜索框输入
- 来源 c.search，事件 onChange，目标 c.table，方法 m.handleSearch；需求 R-01, R-02, FLOW-02
- 前置条件：无
- 步骤：1) 关键词转小写；2) 与 name、desc 的小写形式做 includes，任一命中保留，不匹配 ID、分类、来源；3) 与当前分类条件叠加；4) 页码重置为 1
- 成功反馈：列表、总数、页码文案随结果更新，无额外提示
- 失败反馈：not_applicable，纯前端过滤，无失败路径
- loading：not_applicable，同步过滤
- 重复触发保护：not_applicable，无副作用，可重复触发
- 权限：not_applicable
- 成功后：与分类条件叠加；过滤为 0 条时显示 c.empty，总数「共 0 个」

### i.category 分类选择
- 来源 c.category，事件 onChange，目标 c.table，方法 m.handleCategory；需求 R-03, FLOW-02
- 前置条件：无
- 步骤：1) 选中值非空（非「全部分类」）时，Skill 分类须与选中值严格相等，否则排除；2) 与搜索条件叠加；3) 页码重置为 1
- 成功反馈：列表、总数、页码文案随结果更新，无额外提示
- 失败反馈：not_applicable，纯前端过滤
- loading：not_applicable
- 重复触发保护：not_applicable
- 权限：not_applicable
- 成功后：与搜索条件叠加；过滤为 0 条时显示 c.empty

### i.create 新建 Skill
- 来源 c.create，事件 onClick，跳转 airun-skills-edit.html；需求 FLOW-03
- 无方法原因：纯页面跳转，不涉及数据，直接调用路由跳转
- 前置条件：无
- 步骤：跳转 airun-skills-edit.html，不带参数
- 成功反馈：页面跳转，无提示
- 失败反馈：not_applicable，同步跳转
- loading：not_applicable
- 重复触发保护：not_applicable
- 权限：not_applicable
- 成功后：离开本页

### i.rowClick 点击数据行
- 来源 c.table，事件 onRow.onClick，跳转 airun-skills-detail.html?id={id}；需求 R-04, FLOW-04
- 无方法原因：纯页面跳转，不涉及数据
- 前置条件：点击位置不在操作列
- 步骤：跳转 airun-skills-detail.html?id=<id>
- 成功反馈：页面跳转，无提示
- 失败反馈：not_applicable
- loading：not_applicable
- 重复触发保护：not_applicable
- 权限：not_applicable
- 成功后：离开本页

### i.actionCell 点击操作列容器
- 来源 c.rowActions，事件 onClick（操作列容器）；需求 R-04
- 无方法原因：仅阻止事件冒泡，不涉及数据
- 前置条件：点击位置在操作列内
- 步骤：event.stopPropagation()，不触发整行点击
- 成功反馈：无反馈，页面不跳转
- 失败反馈：not_applicable
- loading：not_applicable
- 重复触发保护：not_applicable
- 权限：not_applicable
- 成功后：页面无变化

### i.detail 点击「详情」
- 来源 c.rowActions，事件 onClick（详情），跳转 airun-skills-detail.html?id={id}；需求 F-11, FLOW-04
- 无方法原因：纯页面跳转，不涉及数据
- 前置条件：无
- 步骤：1) 阻止冒泡；2) 跳转 airun-skills-detail.html?id=<id>
- 成功反馈：页面跳转，无提示
- 失败反馈：not_applicable
- loading：not_applicable
- 重复触发保护：not_applicable
- 权限：not_applicable
- 成功后：离开本页

### i.edit 点击「编辑」
- 来源 c.rowActions，事件 onClick（编辑），跳转 airun-skills-edit.html?id={id}；需求 F-12, FLOW-05
- 无方法原因：纯页面跳转，不涉及数据
- 前置条件：无
- 步骤：1) 阻止冒泡；2) 跳转 airun-skills-edit.html?id=<id>
- 成功反馈：页面跳转，无提示
- 失败反馈：not_applicable
- loading：not_applicable
- 重复触发保护：not_applicable
- 权限：not_applicable
- 成功后：离开本页

### i.delete 点击「删除」
- 来源 c.rowActions，事件 onClick（删除），目标 ov.deleteConfirm；需求 F-13, F-14, FLOW-01
- 无方法原因：仅打开 Popconfirm，删除逻辑由确认按钮交互 i.deleteConfirm 的方法 m.deleteSkill 执行
- 前置条件：无
- 步骤：1) 阻止冒泡；2) 在该行「删除」处弹出 Popconfirm
- 成功反馈：弹出 Popconfirm
- 失败反馈：not_applicable，仅打开气泡
- loading：not_applicable
- 重复触发保护：not_applicable，同一时间仅一个 Popconfirm 处于打开状态
- 权限：not_applicable
- 成功后：Popconfirm 打开，列表不变

### i.deleteConfirm 确认删除
- 来源 ov.deleteConfirm.ok，事件 onConfirm，目标 c.table，方法 m.deleteSkill；需求 R-05, R-06, FLOW-01
- 前置条件：Popconfirm 已打开
- 步骤：1) 调用 deleteSkill(id)；2) 成功后从 skills state 移除该条；3) 按当前筛选与分页重新渲染；4) message.success「已删除」，2 秒后消失
- 成功反馈：message.success「已删除」，2 秒后消失
- 失败反馈：message.error「删除失败」[待确认]；列表保持不变，Popconfirm 关闭，用户可再次点击删除重试
- loading：确定按钮显示 loading，期间取消按钮与对应行删除链接不可再触发
- 重复触发保护：确定按钮 loading 期间禁用，防止重复提交
- 权限：not_applicable
- 成功后：该条从列表移除，保持当前搜索与分类条件；当前页被删空且页码 > 1 时回到上一页；总数更新

### i.deleteCancel 取消删除
- 来源 ov.deleteConfirm.cancel，事件 onCancel，目标 ov.deleteConfirm；需求 FLOW-01
- 无方法原因：仅关闭 Popconfirm，无数据变化
- 前置条件：Popconfirm 已打开
- 步骤：关闭 Popconfirm
- 成功反馈：Popconfirm 关闭，无提示
- 失败反馈：not_applicable
- loading：not_applicable
- 重复触发保护：not_applicable
- 权限：not_applicable
- 成功后：列表无任何变化

### i.pageChange 翻页
- 来源 c.pagination，事件 onChange（页码 / ‹ / ›），目标 c.table，方法 m.changePage；需求 F-19~F-21
- 前置条件：目标页在 1..总页数 范围内
- 步骤：1) 更新当前页；2) 按 pageSize 对过滤结果切片并渲染
- 成功反馈：表格显示该页数据，「第 x/y 页」更新
- 失败反馈：not_applicable
- loading：not_applicable
- 重复触发保护：not_applicable
- 权限：not_applicable
- 成功后：保持当前搜索与分类条件

### i.pageSize 切换每页条数
- 来源 c.pagination，事件 onShowSizeChange，目标 c.table，方法 m.changePageSize；需求 F-18
- 前置条件：无
- 步骤：1) 更新每页条数（10 / 20 / 50）；2) 页码回到 1；3) 重新切片渲染
- 成功反馈：表格与「第 x/y 页」更新
- 失败反馈：not_applicable
- loading：not_applicable
- 重复触发保护：not_applicable
- 权限：not_applicable
- 成功后：保持当前搜索与分类条件

### 业务规则

| ID | 规则 | 来源 |
|----|------|------|
| br.001 | 搜索时关键词转小写，与名称、描述的小写形式做包含匹配，任一命中即保留 | R-01 |
| br.002 | 搜索匹配字段只有名称和描述，不匹配 ID、分类、来源 | R-02 |
| br.003 | 分类选中值非空时，Skill 分类与选中值严格相等，否则排除 | R-03 |
| br.004 | 点击数据行进入详情；操作列阻止冒泡 | R-04 |
| br.005 | 删除确认后从数据中移除并重新渲染，弹出「已删除」提示，2000 毫秒后消失 | R-05 |
| br.006 | 删除仅作用于页面内数据，不调用接口 | R-06 |
| br.007 | 总数文案中的数字随过滤后的条数更新 | R-07 |
| br.008 | 无数据时表格显示一行跨 7 列的空状态文案 | R-08 |
| br.009 | 表格仅 7 列，状态字段（active / archived）不显示 | R-09 |
| br.010 | 分页按真实分页实现：按 pageSize 切片，页码、每页条数、「第 x/y 页」联动（偏离原型无切片逻辑，用户确认） | user_confirmed |
| br.011 | 删除确认使用 Antd Popconfirm，替代原型的浏览器原生 confirm（用户确认） | user_confirmed |

## 方法与数据（API / Mock）

本页全部方法 data_mode = mock，mock_scope = in_method；mock 数据只写在方法内，不发起任何接口请求。

### m.fetchSkills fetchSkills
- 触发：lifecycle，useEffect(() => { fetchSkills() }, [])（组件挂载）；目标 c.table
- 参数：无
- 返回：Promise<{ list: Skill[], total: number }>
- 状态变更：loading: true → false；skills = list；失败时 error = true
- 异常：抛出或 reject 时 loading 置 false，进入 error 状态，显示错误文案与重试
- mock 返回：方法内返回需求 sample_data 6 条 { id, name, desc, category, source, status, created_at }，如 { id: 'sk-pdf', name: 'pdf-extractor', desc: 'PDF 文本/表格抽取', category: '文档', source: 'Markdown', status: 'active', created_at: '2026-04-12 10:22:11' }；其余 5 条见需求 JSON sample_data（sk-excel、sk-trans、sk-img、sk-sql、sk-web）

### m.handleSearch handleSearch
- 触发：interaction i.search；目标 c.table
- 参数：keyword: string（搜索关键词）
- 返回：void
- 状态变更：keyword = keyword；page = 1
- 异常：无
- mock 返回：void；过滤结果由 skills、keyword、category 在渲染时派生，方法内不新增业务数据
- mock 逻辑：keyword.toLowerCase() 与 name、desc 的小写形式做 includes，任一命中保留（R-01、R-02）

### m.handleCategory handleCategory
- 触发：interaction i.category；目标 c.table
- 参数：category: string（选中分类，「全部分类」对应空值）
- 返回：void
- 状态变更：category = category；page = 1
- 异常：无
- mock 返回：void；过滤结果在渲染时派生，方法内不新增业务数据
- mock 逻辑：category 非空时，Skill.category === category 才保留（R-03）

### m.changePage changePage
- 触发：interaction i.pageChange；目标 c.table
- 参数：page: number（目标页码）
- 返回：void
- 状态变更：page = page
- 异常：page 超出 1..总页数 时忽略
- mock 返回：void；当前页数据在渲染时按 (page-1)*pageSize 切片派生
- mock 逻辑：对过滤结果按 pageSize 切片

### m.changePageSize changePageSize
- 触发：interaction i.pageSize；目标 c.table
- 参数：current: number（当前页，Antd 回调参数）；size: number（每页条数，取值 10 / 20 / 50）
- 返回：void
- 状态变更：pageSize = size；page = 1
- 异常：无
- mock 返回：void；当前页数据在渲染时按新 pageSize 切片派生
- mock 逻辑：对过滤结果按新 pageSize 切片

### m.deleteSkill deleteSkill
- 触发：interaction i.deleteConfirm；目标 c.table；需求 R-05, R-06
- 参数：id: string（待删除 Skill 的 ID）
- 返回：Promise<{ success: boolean }>
- 状态变更：成功后从 skills 中移除该 id；page 越界时回到上一页；deleting = true → false（确定按钮 loading）
- 异常：id 不存在时返回 { success: false }，界面提示「删除失败」[待确认]
- mock 返回：方法内返回 { success: true }；不发起任何接口请求（R-06）

## 弹窗、抽屉与确认框

### ov.deleteConfirm 删除确认气泡
- 类型 popconfirm；组件 Popconfirm；触发交互 i.delete；需求 F-14
- 标题：确认删除该 Skill？删除后无法恢复
- placement：[待确认]；点击外部是否关闭：[待确认]
- 备注：替代需求 F-14 的浏览器原生 confirm；该偏离已由用户确认

| 按钮 ID | 文案 | 类型 | 关联交互 |
|---------|------|------|---------|
| ov.deleteConfirm.ok | 确定 | okType = danger | i.deleteConfirm |
| ov.deleteConfirm.cancel | 取消 | 默认 | i.deleteCancel |

## 页面状态

作用对象 c.table：

| 状态 ID | 类型 | 适用性 | 触发 | 展示 / 说明 |
|---------|------|--------|------|------------|
| st.table.loading | loading | applicable | fetchSkills 执行期间 | Table loading 旋转器；禁用搜索、分类、分页和行操作 |
| st.table.empty | empty | applicable | 过滤结果为 0 条，或数据被删空 | 暂无 Skill，点击「+ 新建 Skill」创建（F-16）；总数「共 0 个」 |
| st.table.error | error | applicable | fetchSkills 失败 | 加载失败，请重试；「重试」按钮重新调用 fetchSkills；不展示数据行 |
| st.table.disabled | disabled | not_applicable | — | 原型无禁用场景；仅删除确认 loading 期间按钮禁用，已在 i.deleteConfirm 中定义 |
| st.table.readonly | readonly | not_applicable | — | 原型无只读场景 |
| st.table.permission | permission | not_applicable | — | 原型无权限控制 |

## 响应式行为

断点沿用 Antd 3 栅格：xs ≤576、sm ≥576、md ≥768、lg ≥992、xl ≥1200、xxl ≥1600。最大内容宽度：[待确认]。

| 规则 ID | 布局 | 条件 | 行为 |
|---------|------|------|------|
| rsp.toolbar | layout.toolbar | <768 | 搜索框、分类下拉、新建按钮换行堆叠 |
| rsp.table | layout.table | <768 | Table 设置 scroll.x，横向滚动 |
| rsp.pagination | layout.pagination | <768 | 总数与翻页控件分行排列 |

## 视觉规范

- 颜色来源：antd 3.x 默认 less 变量（精确版本 [待确认]）；本页需求给出的取值优先覆盖
- 主色 #1890ff；边框 #d9d9d9；分割线 #e8e8e8；正文 rgba(0,0,0,0.65)；标题 rgba(0,0,0,0.85)；表头背景 #fafafa；行 hover 背景 #e6f7ff
- 本页覆盖：链接 #006bff；描述文字 #535760；弱化文字 #9ba7ba；危险色 #e53935
- 字体：基础 14px；ID 列 Menlo 等宽 11px；时间列 12px；行操作 12px；名称列加粗；行高 [待确认]
- 间距：[待确认]；本页需求给出：行操作右间距 12px，空状态内边距 40px
- 圆角：4px；阴影：[待确认]；边框：1px solid #e8e8e8（表格分割线，沿用 antd 默认）；密度：[待确认]
- 组件变体：Button primary；Popconfirm 确定按钮 okType=danger；Pagination showSizeChanger

## 页面代码生成约束

- 技术栈：React 函数组件 + Hooks，生命周期用 useEffect；UI 库 antd 3.*（Input、Select、Button、Table、Pagination、Popconfirm、message）。
- 页面状态：skills、keyword、category、page（默认 1）、pageSize（默认 10）、loading、error、deleting。
- 过滤结果与当前页数据在渲染时由 skills、keyword、category、page、pageSize 派生，不单独存储。
- 全部数据使用 mock，mock 数据仅写在 methods 内（m.fetchSkills、m.deleteSkill），不写入组件模板、全局常量或其他文件；不接入任何接口。
- 删除确认使用 Popconfirm，不使用 window.confirm。
- 表格仅 7 列，不展示 status。
- 跳转目标：airun-skills-edit.html、airun-skills-detail.html?id={id}；路由实现方式依目标项目，[待确认]。
- 本页不实现：归档（恢复）、编辑页、详情页、Agent 快速创建中的 Skills 选择器（oq.007，范围外）。
- 不得为本文档未定义的行为补充功能；[待确认] 项在实现前需向用户确认。

## 待确认项与建议

| ID | 问题 | 状态 |
|----|------|------|
| oq.001 | 页面路由与入口 | pending |
| oq.002 | 搜索框 placeholder 文案（原型 U-01） | pending |
| oq.003 | React 精确版本、antd 精确版本、公共组件清单、样式方案、目标项目目录与代码规范 | pending |
| oq.004 | Popconfirm 的 placement 与点击外部是否关闭 | pending |
| oq.005 | 删除失败提示文案「删除失败」、加载失败文案「加载失败，请重试」是否沿用 | pending |
| oq.006 | 页面最大宽度、间距、阴影、密度、行高取值 | pending |
| oq.007 | 归档（恢复）、编辑页、详情页、Agent 快速创建中的 Skills 选择器不在本页范围（U-04、U-08、U-09） | out_of_scope |

## 校验结果

- 草案校验（draft）：passed，errors 0，warnings 0。
- 终稿校验（final）：见 JSON `validation` 字段（执行 validate-layout.mjs --mode final 后回写）。
