---
name: scan-object-info/pattern-matcher
---

# pattern-matcher（scan-object-info 原子技能）

## 版本历史

---

## 1. 核心定位

---

## 2. 模式库结构

```
.claude/skills/scan-object-info/patterns/
│   └── pattern.md
│   └── pattern.md
│   └── pattern.md
│   └── pattern.md
    └── pattern.md
```

---

## 3. 匹配流程

### 步骤 1：提取项目特征

从 `package.json` 提取主框架 + 包名特征：
```python
def extract_project_features(package_json: dict) -> dict:
    dependencies = package_json.get("dependencies", {})
    dev_dependencies = package_json.get("devDependencies", {})
    all_deps = {**dependencies, **dev_dependencies}

    features = {
        "framework": detect_framework(all_deps),       # vue, react, next, nuxt
        "ui_library": detect_ui_library(all_deps),     # element-plus, antd, vuetify
        "build_tool": detect_build_tool(all_deps),     # vite, webpack, tsup
        "state_mgmt": detect_state_mgmt(all_deps),     # pinia, redux, zustand
        "routing": detect_routing(all_deps),            # vue-router, react-router
    }
    return features
```

### 步骤 2：与模式库匹配

```python
def match_pattern(features: dict, pattern_library: list) -> dict:
    results = []
    for pattern in pattern_library:
        similarity = calculate_jaccard_similarity(
            features, pattern["required_features"]
        )
        results.append({"pattern": pattern, "similarity": similarity})

    results.sort(key=lambda x: x["similarity"], reverse=True)
    best = results[0]

    if best["similarity"] >= 0.6:
        return {"matched": True, "pattern": best["pattern"], "similarity": best["similarity"]}
    elif best["similarity"] >= 0.4:
        return {"matched": True, "pattern": best["pattern"], "similarity": best["similarity"], "partial": True}
    else:
        return {"matched": False, "similarity": best["similarity"]}
```

### 步骤 3：确定执行路径

|---------|-----------|--------|---------|

---

## 4. 模式文件格式（pattern.md）

```markdown
# 项目模式：Vue3 + Element Plus

## 基本信息
- 模式名称：vue3-element-plus
- 模式状态：已验证
- 创建时间：2026-05-01

## 必需特征
```python
required_features = {
    "framework": ["vue"],
    "ui_library": ["element-plus"],
    "build_tool": ["vite"],
}
```

## 跳过规则
- 仅扫描 package.json + 项目结构，不重复检测已确认的框架/UI库

## 典型项目结构
```
src/
├── components/     # 组件目录
├── views/          # 页面目录
├── router/         # Vue Router 配置
├── stores/         # Pinia 状态管理
└── api/            # API 请求封装
```

## 置信度调整
- 命中模式时，detect-tech-stack 输出置信度基础分 +0.2
- 模式覆盖范围外的检测结果，置信度 -0.1
```

---

## 7. 输出格式

```markdown
## 项目模式匹配结果

- 匹配状态：命中成熟模式 / 命中成长模式 / 无匹配
- 模式名称：[模式名称]

### 跳过的步骤（如命中模式）

### 建议后续操作
1. [基于模式的优化建议]
```

---

## 8. 强约束

1. **预处理优先**：pattern-matcher 必须在其他原子技能之前执行
2. **命中即跳过**：成熟模式命中后，对应原子技能直接标记为"已跳过"
3. **无副作用**：匹配失败时不影响后续技能执行，继续正常扫描流程
4. **置信度叠加**：命中模式时，置信度基础分 +0.2

---

**版本**: 1.2
**最后更新**: 2026-06-03
**维护者**: 项目团队
