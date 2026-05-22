---
name: fix-generation
description: 根据根因定位报告，设计并生成具体的代码修复方案，提供可执行的修改建议。在根因定位后执行
---

# Fix Generation 原子Skill

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
修复方案文档，包含以下内容：

```markdown
# 修复方案

## 修复目标
[明确修复的目标，如：解决TypeError: Cannot read property 'login' of undefined]

## 修复方案
[清晰描述修复方案，分点说明]

### 方案1：[推荐方案]
- **类型**：[代码修改/配置更改/依赖更新]
- **修改内容**：
  ```diff
  --- a/src/views/Login/index.vue
  +++ b/src/views/Login/index.vue
  @@ -25,7 +25,7 @@
   import { ref } from 'vue'
   import { useRouter } from 'vue-router'
   import { ElMessage } from 'element-plus'
  -import { User, Lock } from '@element-plus/icons-vue'
  +import { User, Lock } from '@element-plus/icons-vue'
   import { session, storage } from '@/utils/utils'
  -import userAPI from '@/utils/utils'
  +import userAPI from '@/api/user.js'
   
   const router = useRouter()
   
   const loginFormRef = ref()
  ```
- **修改文件**：src/views/Login/index.vue
- **修改行号**：28
- **影响范围**：仅影响登录功能
- **兼容性**：向后兼容，不影响其他功能
- **风险评估**：低

### 方案2：[备选方案]
- **类型**：[代码修改/配置更改/依赖更新]
- **修改内容**：
  ```diff
  --- a/src/views/Login/index.vue
  +++ b/src/views/Login/index.vue
  @@ -47,11 +47,14 @@
   const loginEvent = () => {
       loginFormRef.value.validate(async (valid) => {
           if (valid) {
  -            const response = await userAPI.login({
  +            if (userAPI && typeof userAPI.login === 'function') {
  +                const response = await userAPI.login({
                   // qid: loginForm.value.userID,
                   password: loginForm.value.userID,
                   user_name: loginForm.value.userName,
                   nick_name: loginForm.value.userName,
                   head_url: 'http://'
  -            })
  +                })
  +            } else {
  +                console.error('userAPI is not properly initialized')
  +                ElMessage.error('登录服务初始化失败')
  +            }
               if (response && response.code === 0) {
                   setCatchData(response)
                   ElMessage({
  ```
- **修改文件**：src/views/Login/index.vue
- **修改行号**：48-58
- **影响范围**：仅影响登录功能
- **兼容性**：向后兼容，不影响其他功能
- **风险评估**：中（增加额外的代码路径）

## 推荐方案
[明确推荐方案并说明理由]

## 修复验证建议
[建议如何验证修复效果]

## 回滚方案
[如果修复失败，如何回滚到原始状态]

## 修复方案评估
| 评估维度 | 方案1 | 方案2 |
|----------|-------|-------|
| 复杂度 | 低 | 中 |
| 风险 | 低 | 中 |
| 可维护性 | 高 | 中 |
| 长期影响 | 好 | 中 |
| 实施难度 | 简单 | 中 |

## 修复实施步骤
1. [步骤1]
2. [步骤2]
3. [步骤3]

## 注意事项
- [任何需要注意的事项]
```

## 执行逻辑
1. 根据根因定位报告中的建议修复方向设计修复方案
2. 生成具体的代码修改补丁（使用diff格式）
3. 提供至少两个方案：推荐方案和备选方案
4. 评估每个方案的优缺点
5. 输出完整的修复方案文档

## 依赖关系
- 依赖：root-cause-analysis（必须有完整的根因定位报告）

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

## 示例

**输入：**
root-cause-analysis输出的报告中包含：
- 根本原因：由于在Login组件中错误地导入了userAPI模块（导入路径为'@/utils/utils'而非'@/api/user.js'），导致userAPI对象为undefined
- 建议的修复方向：修正导入路径；添加防御性检查

**输出：**
```markdown
# 修复方案

## 修复目标
解决登录功能中"TypeError: Cannot read property 'login' of undefined"的错误

## 修复方案

### 方案1：[推荐方案] 修正导入路径
- **类型**：代码修改
- **修改内容**：
  ```diff
  --- a/src/views/Login/index.vue
  +++ b/src/views/Login/index.vue
  @@ -25,7 +25,7 @@
   import { ref } from 'vue'
   import { useRouter } from 'vue-router'
   import { ElMessage } from 'element-plus'
   import { User, Lock } from '@element-plus/icons-vue'
   import { session, storage } from '@/utils/utils'
  -import userAPI from '@/utils/utils'
  +import userAPI from '@/api/user.js'
   
   const router = useRouter()
  ```
- **修改文件**：src/views/Login/index.vue
- **修改行号**：28
- **影响范围**：仅影响登录功能
- **兼容性**：向后兼容，不影响其他功能
- **风险评估**：低

### 方案2：[备选方案] 添加防御性检查
- **类型**：代码修改
- **修改内容**：
  ```diff
  --- a/src/views/Login/index.vue
  +++ b/src/views/Login/index.vue
  @@ -47,11 +47,14 @@
   const loginEvent = () => {
       loginFormRef.value.validate(async (valid) => {
           if (valid) {
  -            const response = await userAPI.login({
  +            if (userAPI && typeof userAPI.login === 'function') {
  +                const response = await userAPI.login({
                   // qid: loginForm.value.userID,
                   password: loginForm.value.userID,
                   user_name: loginForm.value.userName,
                   nick_name: loginForm.value.userName,
                   head_url: 'http://'
  -            })
  +                })
  +            } else {
  +                console.error('userAPI is not properly initialized')
  +                ElMessage.error('登录服务初始化失败')
  +            }
               if (response && response.code === 0) {
                   setCatchData(response)
                   ElMessage({
  ```
- **修改文件**：src/views/Login/index.vue
- **修改行号**：48-58
- **影响范围**：仅影响登录功能
- **兼容性**：向后兼容，不影响其他功能
- **风险评估**：中（增加额外的代码路径）

## 推荐方案
推荐方案1：修正导入路径。理由：
1. 直接解决根本原因，而非掩盖症状
2. 代码更简洁，维护性更好
3. 降低运行时开销
4. 符合模块化设计原则

## 修复验证建议
1. 重启开发服务器
2. 清除浏览器缓存
3. 重新打开登录页面
4. 输入有效用户名和密码
5. 点击登录按钮，验证是否正常跳转到首页
6. 检查控制台无任何错误

## 回滚方案
如果修复后出现问题，可执行以下步骤回滚：
1. 将src/views/Login/index.vue第28行从`import userAPI from '@/api/user.js'`改回`import userAPI from '@/utils/utils'`
2. 重启开发服务器

## 修复方案评估
| 评估维度 | 方案1 | 方案2 |
|----------|-------|-------|
| 复杂度 | 低 | 中 |
| 风险 | 低 | 中 |
| 可维护性 | 高 | 中 |
| 长期影响 | 好 | 中 |
| 实施难度 | 简单 | 中 |

## 修复实施步骤
1. 打开src/views/Login/index.vue文件
2. 找到第28行：`import userAPI from '@/utils/utils'`
3. 将其修改为：`import userAPI from '@/api/user.js'`
4. 保存文件
5. 重启开发服务器
6. 验证修复效果

## 注意事项
- 确保`@/api/user.js`文件存在且导出正确
- 修改后建议运行所有相关测试
- 如果项目有代码规范，确保修改符合规范
- 建议提交代码变更时添加清晰的提交信息
```

## 注意事项
- 修复方案必须基于根因，不能解决表面现象
- 优先推荐直接修复根本原因的方案
- 提供备选方案以应对特殊情况
- 所有代码修改必须使用diff格式

## 原子skill位置
./.claude/skills/bug-solver/atomic-skills/fix-generation/SKILL.md