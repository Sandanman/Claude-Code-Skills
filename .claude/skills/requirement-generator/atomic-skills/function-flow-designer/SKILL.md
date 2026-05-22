---
name: function-flow-designer
description: 识别需求的功能流程类型（CRUD/线性/状态机等），定义流程节点、状态转换和权限控制。在需求分析后自动执行。改进版新增 sub-flow detection 和 cross-flow reference。
---

# Function Flow Designer 原子 Skill（改进版 v1.1）

## 概述
识别用户需求的功能流程类型（CRUD、线性、状态机等），定义完整的功能流程节点、状态转换和权限控制，**新增 sub-flow detection（子流程检测）和 cross-flow reference（跨流程引用）**，为UI设计和路由配置提供蓝图。

## 核心能力
- 识别7种通用前端流程类型 + **sub-flow（新增 v1.1）**
- 定义流程节点（页面/操作）
- 定义状态转换关系
- 定义权限控制规则
- **sub-flow detection**：检测嵌套在主流程中的子流程（**新增 v1.1**）
- **cross-flow reference**：检测跨流程的数据引用（**新增 v1.1**）
- 生成流程图描述（文本）

## 输入
requirement-analysis 输出的需求分析结果
requirement-decomposition 输出的模块分解结果

## 输出
功能流程设计结果，包含以下内容：

```json
{
  "flow_type": "CRUD",
  "primary_flow": {
    "nodes": [
      {
        "name": "登录页",
        "page": "/login",
        "action": "create",
        "next": "首页",
        "permissions": ["所有用户"],
        "description": "用户输入用户名和密码进行登录"
      }
    ],
    "transitions": ["登录页 → 首页"]
  },
  "sub_flows": [
    {
      "name": "表单验证子流程",
      "parent_node": "登录页",
      "type": "validation",
      "nodes": ["输入校验", "显示错误", "清除错误"]
    }
  ],
  "cross_flow_references": [],
  "permissions": ["登录页：所有用户", "首页：登录用户"],
  "has_multi_state": false,
  "flow_description": "用户首先访问登录页，输入用户名和密码后提交。系统验证成功后跳转到首页。登录页无权限限制，首页仅登录用户可访问。"
}
```

## 7种通用流程类型 + sub-flow detection（**新增 v1.1**）

| 流程类型 | 特征 | 适用场景 | 节点数 | 示例 |
|----------|------|----------|--------|------|
| **CRUD** | 增、删、改、查 | 数据管理 | 4-6个 | 用户管理、订单管理、会议管理 |
| **线性流程** | 多步顺序操作 | 表单/支付 | 3-5个 | 注册流程、结账流程、申请流程 |
| **状态机** | 状态转换 | 审批/工作流 | 3-8个 | 请假审批、订单状态、工单处理 |
| **向导流程** | 多步骤表单 | 多步注册 | 3-5个 | 用户注册向导、配置向导 |
| **单页工具** | 输入→处理→输出 | 工具类 | 1个 | 日期格式化、文件转换、计算器 |
| **弹窗流程** | 弹窗操作 | 快速操作 | 1-2个 | 快速编辑、确认删除、消息提醒 |
| **循环流程** | 可重复操作 | 评分/投票 | 2-3个 | 投票系统、重复提交、多次修改 |
| **sub-flow（子流程）** | **嵌套在主流程中** | **表单验证/确认/搜索** | **1-3个** | **登录页内嵌表单验证子流程** |

## Sub-flow Detection（**新增 v1.1**）

常见子流程类型：
- **validation**：表单验证（空值校验、格式校验）
- **confirmation**：确认操作（确认删除、确认提交）
- **search**：搜索/筛选（关键词搜索、筛选条件）
- **pagination**：分页（加载更多、跳转页码）
- **error_handling**：错误处理（网络错误、超时处理）

## Cross-flow Reference（**新增 v1.1**）

跨流程引用场景：
- 主流程"订单创建"引用子流程"地址选择"
- 主流程"用户管理"引用子流程"搜索/筛选"
- 主流程"会议创建"引用子流程"时间选择"

## 流程类型识别逻辑

```javascript
function identifyFlowType(modules, features, constraints) {
  // 检查关键词
  const crudKeywords = ["新建", "创建", "列表", "详情", "编辑", "修改", "删除", "更新", "查看"];
  const linearKeywords = ["第一步", "然后", "接着", "下一步", "最后", "顺序", "流程"];
  const stateKeywords = ["状态", "审批", "通过", "拒绝", "待处理", "审核", "流转"];
  const wizardKeywords = ["向导", "步骤", "引导", "分步"];
  const toolKeywords = ["工具", "转换", "计算", "格式化", "生成", "分析"];
  const popupKeywords = ["弹窗", "弹出", "对话框", "确认", "提示"];
  const loopKeywords = ["重复", "再次", "重新", "多次", "循环"];

  let score = {
    crud: 0,
    linear: 0,
    state: 0,
    wizard: 0,
    tool: 0,
    popup: 0,
    loop: 0
  };

  // 统计关键词匹配
  for (let feature of features) {
    if (crudKeywords.some(k => feature.includes(k))) score.crud++;
    if (linearKeywords.some(k => feature.includes(k))) score.linear++;
    if (stateKeywords.some(k => feature.includes(k))) score.state++;
    if (wizardKeywords.some(k => feature.includes(k))) score.wizard++;
    if (toolKeywords.some(k => feature.includes(k))) score.tool++;
    if (popupKeywords.some(k => feature.includes(k))) score.popup++;
    if (loopKeywords.some(k => feature.includes(k))) score.loop++;
  }

  // 模块类型加权
  for (let module of modules) {
    if (module.type === "crud") score.crud += 2;
    if (module.type === "auth" && module.features.length > 1) score.state += 1;
    if (module.type === "workflow") score.state += 2;
    if (module.type === "tool") score.tool += 2;
  }

  // 选择最高分
  const maxType = Object.keys(score).reduce((a, b) => score[a] > score[b] ? a : b);
  return maxType;
}
```

## 节点定义规范

每个节点包含：
- `name`：节点名称（如"登录页"）
- `page`：页面路径（如"/login"）
- `action`：操作类型（create/read/update/delete）
- `next`：下一节点名称（如"首页"）
- `permissions`：访问权限列表（如["所有用户"]）
- `description`：功能描述
- `sub_flow`：关联的子流程（如有，**新增 v1.1**）

## 权限控制设计
- 权限层级："所有用户"、"登录用户"、"管理员"、"创建者"、"访客"
- 默认规则：
  - CRUD 的"新增"：登录用户
  - CRUD 的"编辑/删除"：创建者或管理员
  - 详情页：登录用户

## 执行逻辑
1. 接收需求分析和模块分解结果
2. 使用关键词和模块类型识别流程类型
3. 为每个模块创建节点
4. **检测 sub-flow：识别嵌套在主流程中的子流程（表单验证、确认等）（新增 v1.1）**
5. **检测 cross-flow reference：识别跨流程数据引用（新增 v1.1）**
6. 定义节点间转换关系
7. 定义每个节点的权限
8. 生成流程描述文本
9. 输出完整流程设计

## 依赖关系
- 依赖：requirement-analysis + requirement-decomposition

## 完成标准
1. 正确识别流程类型（7种之一）
2. 至少定义2个节点
3. 定义节点间转换关系
4. 定义每个节点的权限
5. **检测并输出 sub-flow（新增 v1.1）**
6. **检测并输出 cross-flow reference（新增 v1.1）**
7. 输出流程描述文本
8. 输出完整的JSON格式数据

## 示例

**输入**：用户需求"实现用户登录功能，用户输入用户名和密码，系统进行表单验证，验证失败显示错误，验证成功跳转首页"

**处理**：
1. 识别流程类型：CRUD + validation sub-flow（**新增 v1.1**）
2. 创建节点：
   - 登录页：/login，action=create，next=首页，sub_flow=["表单验证"]
   - 首页：/home，action=read，next=null
3. 定义 sub_flow：
   - 表单验证子流程：输入校验 → 显示错误 / 清除错误 → 继续提交
4. 定义权限：
   - 登录页：所有用户
   - 首页：登录用户
5. 生成描述文本

**输出**：
```json
{
  "flow_type": "CRUD",
  "primary_flow": {
    "nodes": [
      {
        "name": "登录页",
        "page": "/login",
        "action": "create",
        "next": "首页",
        "permissions": ["所有用户"],
        "description": "用户输入用户名和密码进行登录",
        "sub_flow": ["表单验证"]
      }
    ],
    "transitions": ["登录页 → 首页"]
  },
  "sub_flows": [
    {
      "name": "表单验证子流程",
      "parent_node": "登录页",
      "type": "validation",
      "nodes": [
        { "name": "输入校验", "description": "检查用户名和密码是否为空" },
        { "name": "显示错误", "description": "校验失败时显示错误提示" },
        { "name": "清除错误", "description": "用户重新输入时清除错误" }
      ]
    }
  ],
  "cross_flow_references": [],
  "permissions": ["登录页：所有用户", "首页：登录用户"],
  "has_multi_state": false,
  "flow_description": "用户首先访问登录页，输入用户名和密码。系统先进行表单验证，校验失败显示错误，校验成功提交并跳转到首页。登录页无权限限制，首页仅登录用户可访问。"
}
```

## 注意事项
- 不依赖具体技术栈，输出通用流程
- 权限控制必须明确
- 流程描述应清晰可读
- 节点名称与模块名称一致
- **sub-flow 和 cross-flow reference 增强流程完整性（新增 v1.1）**

## 版本
v1.1 - 改进版：新增 sub-flow detection（子流程检测）和 cross-flow reference（跨流程引用）