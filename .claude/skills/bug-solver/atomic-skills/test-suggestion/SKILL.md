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
测试建议文档：

```markdown
# 测试建议报告

## 测试目标
为登录功能的修复编写测试，防止类似问题再次发生

## 测试类型
- [x] 单元测试
- [x] 集成测试
- [ ] E2E测试

## 单元测试建议

### 测试场景1：验证用户输入正确凭据后登录成功
```js
it('should login successfully with valid credentials', async () => {
  const mockResponse = { code: 0, data: { user_id: '123' } }
  jest.spyOn(userAPI, 'login').mockResolvedValue(mockResponse)
  // 测试代码...
  expect(userAPI.login).toHaveBeenCalled()
})
```

### 测试场景2：验证userAPI模块正确导入
```js
test('userAPI should have login method', () => {
  expect(userAPI).toBeDefined()
  expect(typeof userAPI.login).toBe('function')
})
```

### 测试场景3：验证API调用失败的正确处理
```js
it('should show error message when API fails', async () => {
  jest.spyOn(userAPI, 'login').mockRejectedValue({ code: 1 })
  // 测试代码...
  expect(wrapper.find('.el-message--error').exists()).toBe(true)
})
```

## 测试检查清单
- [ ] 正常登录流程测试
- [ ] 错误处理测试
- [ ] 导入路径验证测试
- [ ] 网络异常场景测试

## 总结建议
1. 为Login组件添加完整的单元测试覆盖
2. 在CI/CD中集成测试
3. 对类似功能建立测试规范
```

## 执行逻辑
1. 根据验证报告中的bug类型设计测试场景
2. 针对关键场景提供单元测试代码示例
3. 提供集成测试和E2E测试建议
4. 输出完整的测试建议文档

## 依赖关系
- 依赖：fix-verification（必须有完整的验证报告）
- 被依赖：无（最后一个原子skill）

## 完成标准
1. 提供至少3个单元测试场景
2. 每个场景包含测试用例、步骤、预期结果和代码示例
3. 提供集成测试建议
4. 提供测试覆盖率目标
5. 输出完整的测试建议文档

## 注意事项
- 测试用例必须覆盖修复前后的差异点
- 测试代码必须符合项目规范
- 优先为本次修复提供回归测试案例
- 测试覆盖率建议应合理可行

## 原子skill位置
./.claude/skills/bug-solver/atomic-skills/test-suggestion/SKILL.md