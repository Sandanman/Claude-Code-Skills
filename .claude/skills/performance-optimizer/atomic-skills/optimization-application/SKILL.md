---
name: optimization-application
description: 应用性能优化策略，生成优化后的代码，在完成优化策略设计后触发
---

# Optimization Application

## 概述

Optimization Application 负责将 optimization-strategy-design 设计的优化方案实际应用到项目代码中。这包括修改构建配置（Vite/Webpack）、重构组件代码、实施资源优化、生成优化补丁。应用过程全程记录变更，确保优化效果可回溯、可撤销。

## 核心能力

- **构建配置优化**: 修改 Vite/Webpack 配置，实施代码分割、Tree-shaking、压缩配置
- **路由懒加载**: 将同步 import 改为动态 import，实现路由级代码分割
- **组件懒加载**: 使用 `defineAsyncComponent` 实现组件延迟加载
- **资源优化**: 图片压缩、WebP转换、字体子集化、资源内联/外链决策
- **缓存策略配置**: 配置 HTTP Cache-Control、生成 Service Worker
- **依赖按需引入**: 将全量引入改为按需引入（Element Plus、Lodash 等）

## 输入

- **OptimizationStrategyReport**: 优化策略报告，包含所有待应用的优化方案
- **ProjectContext**: 项目源码结构和文件路径映射
- **ApplyConfig**: 应用配置（是否自动写入文件、是否创建备份、是否生成 PR）

## 输出

- **AppliedChanges**: 已应用的代码变更列表（diff格式）
- **OptimizedFiles**: 优化后的文件清单
- **RollbackScript**: 回滚脚本，用于撤销优化变更
- **ImplementationLog**: 实施日志，记录每个策略的应用过程

**输出示例格式**:
```json
{
  "appliedStrategies": 6,
  "modifiedFiles": [
    {
      "path": "vite.config.ts",
      "action": "modified",
      "changes": "添加了 build.targets、terserOptions 配置"
    },
    {
      "path": "src/router/index.ts",
      "action": "modified",
      "changes": "将静态 import 改为动态 import"
    },
    {
      "path": "src/views/Dashboard.vue",
      "action": "modified",
      "changes": "添加了骨架屏组件"
    }
  ],
  "rollbackAvailable": true,
  "rollbackScript": "rollback.sh"
}
```

## 执行逻辑

1. **策略排序**: 按依赖顺序排列优化策略，依次应用
2. **代码修改**: 读取原文件、应用变更、写入新文件（同时保留原文件备份）
3. **配置更新**: 更新 Vite/Webpack 构建配置
4. **依赖调整**: 如果涉及依赖变更（添加/移除npm包），更新 package.json
5. **变更记录**: 生成完整的变更 diff 日志
6. **回滚脚本**: 生成回滚脚本，可一键撤销所有变更
7. **验证检查**: 应用后快速检查语法是否正确

## 依赖关系

- 依赖: optimization-strategy-design
- 被依赖: optimization-verification

## 完成标准

1. 所有标记为 "高优先级" 的优化策略已应用
2. 每个文件修改前都有备份（.bak 扩展名）
3. 生成的回滚脚本可成功撤销所有变更
4. 项目 `npm run build` 仍能成功构建（无构建错误）
5. 生成 `applied-changes-report.json` 记录所有变更