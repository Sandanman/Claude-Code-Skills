---
name: test-suggestion
description: 基于修复验证结果，为修复的bug建议测试用例，覆盖正常路径和异常场景，防止问题再次发生。在修复验证后执行
---

# Test Suggestion 原子Skill

## 概述
基于修复验证结果，为修复的bug建议测试用例，覆盖正常路径和异常场景，防止问题再次发生。

## 核心能力
- 设计单元测试用例
- 设计集成测试场景
- 覆盖正常路径和异常场景
- 提供测试代码示例

## 输入
fix-verification输出的验证报告

## 输出
测试建议文档，包含以下内容：

```markdown
# 测试建议报告

## 测试目标
[明确测试目标，如：为登录功能的修复编写测试，防止类似问题再次发生]

## 测试类型
- [x] 单元测试（Unit Test）
- [x] 集成测试（Integration Test）
- [ ] E2E测试（End-to-End Test）
- [ ] 回归测试（Regression Test）

## 单元测试建议

### 测试场景1：[正常登录场景]
- **测试用例**：验证用户输入正确凭据后登录成功
- **前置条件**：用户凭证有效，API服务正常
- **测试步骤**：
  1. 模拟用户输入用户名和密码
  2. 调用loginEvent函数
  3. 等待API响应
- **预期结果**：
  - 调用userAPI.login方法
  - 成功接收返回数据
  - 跳转到首页
- **测试代码示例** vitamin(Vue Test Utils):
  ```js
  import { mount } from '@vue/test-utils'
  import Login from '@/views/Login/index.vue'
  import userAPI from '@/api/user.js'

  describe('Login.vue', () => {
    it('should login successfully with valid credentials', async () => {
      const wrapper = mount(Login)
      const mockResponse = { code: 0, data: { user_id: '123' } }
      jest.spyOn(userAPI, 'login').mockResolvedValue(mockResponse)

      await wrapper.find('input[placeholder="用户名"]').setValue('testuser')
      await wrapper.find('input[placeholder="密码"]').setValue('password123')
      await wrapper.find('.login-btn').trigger('click')

      expect(userAPI.login).toHaveBeenCalledWith({
        password: 'password123',
        user_name: 'testuser',
        nick_name: 'testuser',
        head_url: 'http://'
      })
    })
  })
  ```

### 测试场景2：[导入路径验证]
- **测试用例**：验证userAPI模块正确导入
- **前置条件**：用户访问登录页面
- **测试步骤**：
  1. 挂载Login组件
  2. 检查模块导入
- **预期结果**：
  - userAPI对象已正确初始化
  - userAPI.login是函数类型
- **测试代码示例**：
  ```js
  import userAPI from '@/api/user.js'

  test('userAPI should have login method', () => {
    expect(userAPI).toBeDefined()
    expect(typeof userAPI.login).toBe('function')
  })
  ```

### 测试场景3：[错误处理场景]
- **测试用例**：验证API调用失败的正确处理
- **前置条件**：用户输入正确凭据，但API返回错误
- **测试步骤**：
  1. 模拟API返回错误
  2. 调用loginEvent
  3. 观察错误提示
- **预期结果**：
  - 显示错误消息
  - 不跳转页面
- **测试代码示例**：
  ```js
  it('should show error message when API fails', async () => {
    const wrapper = mount(Login)
    const mockResponse = { code: 1, message: 'Invalid credentials' }
    jest.spyOn(userAPI, 'login').mockRejectedValue(mockResponse)

    await wrapper.find('input[placeholder="用户名"]').setValue('wronguser')
    await wrapper.find('input[placeholder="密码"]').setValue('wrongpass')
    await wrapper.find('.login-btn').trigger('click')

    expect(wrapper.find('.el-message--error').exists()).toBe(true)
  })
  ```

## 集成测试建议

### 测试场景1：完整的登录流程
- **测试用例**：从打开登录页面到成功登录的完整流程
- **涵盖功能**：路由跳转、API调用、登录状态管理、本地存储
- **测试步骤**：
  1. 访问登录页面路由
  2. 输入用户名和密码
  3. 提交表单
  4. 验证跳转
  5. 验证登录状态
- **预期结果**：整个流程无中断，登录成功

### 测试场景2：模块导入验证
- **测试用例**：验证所有依赖模块正确导入
- **测试步骤**：
  1. 启动应用
  2. 访问登录页面
  3. 检查浏览器控制台
- **预期结果**：无模块未找到错误

## 回归测试建议
创建针对本次修复的回归测试用例，包含：
- 导入路径的正确性检查
- userAPI对象初始化检查
- 登录功能端到端测试

## 测试覆盖率目标
- 单元测试覆盖率：≥80%
- 集成测试覆盖核心流程：≥90%
- 关键路径测试：100%

## 测试执行步骤
1. 在Login组件中添加上述测试用例
2. 运行测试套件
3. 确保所有测试通过
4. 将测试用例加入CI/CD流水线

## 测试检查清单
- [ ] 正常登录流程测试
- [ ] 错误处理测试
- [ ] 导入路径验证测试
- [ ] 空值/undefined处理测试
- [ ] 网络异常场景测试
- [ ] 重复点击防止测试

## 推荐的测试工具
- 单元测试：Vitest + Vue Test Utils
- E2E测试：Playwright（项目中已有配置）
- Mock数据：Jest.mock

## 总结建议
1. 为Login组件添加完整的单元测试覆盖
2. 在CI/CD中集成测试，确保每次提交都运行测试
3. 对类似的重要功能模块，建立类似的测试规范
4. 定期运行E2E测试，确保关键业务流程正常
```

## 执行逻辑
1. 根据验证报告中的bug类型设计测试场景
2. 针对关键场景提供单元测试代码示例
3. 提供集成测试和E2E测试建议
4. 输出完整的测试建议文档

## 特殊规则
- 单元测试必须包含：正常路径、异常路径、边界条件
- 测试代码示例必须可运行
- 针对本次修复的回归测试必须包含

## 依赖关系
- 依赖：fix-verification（必须有完整的验证报告）

## 完成标准
1. 提供至少3个单元测试场景
2. 每个场景包含测试用例、步骤、预期结果和代码示例
3. 提供集成测试建议
4. 提供测试覆盖率目标
5. 输出完整的测试建议文档

## 示例

**输入：**
fix-verification输出的验证报告中包含：
- 修复方案：修正导入路径，将`import userAPI from '@/utils/utils'`改为`import userAPI from '@/api/user.js'`
- 验证结论：修复成功，登录功能恢复正常

**输出：**（如上所示，完整的测试建议文档）

## 注意事项
- 测试用例必须覆盖修复前后的差异点
- 测试代码必须符合项目规范（使用Vitest/Vue Test Utils）
- 优先为本次修复提供回归测试案例
- 测试覆盖率建议应合理可行

## 原子skill位置
./.claude/skills/bug-solver/atomic-skills/test-suggestion/SKILL.md