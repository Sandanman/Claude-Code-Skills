---
name: scan-object-info/pattern-matcher
description: 项目模式匹配 — 基于已知项目类型模式库，快速判断项目类型，命中成熟模式时 τ 折扣 70%，跳过重复扫描
---

# pattern-matcher（scan-object-info 原子技能）

## 版本历史
- v1.2 (2026-06-03): 新增，作为 scan-object-info v1.2 K4 Pattern Mining 预处理步骤

---

## 1. 核心定位

**模式匹配器**，作为 scan-object-info 的预处理步骤（τ=150），通过已知的项目类型模式库快速判断当前项目类型，命中成熟模式时：
- τ 折扣 70%（150 × 0.3 = 45）
- 跳过重复扫描步骤，节省后续 τ 消耗

---

## 2. 模式库结构

```
.claude/skills/scan-object-info/patterns/
├── vue3-element-plus/     # Vue3 + Element Plus 模式（成熟，τ×0.3）
│   └── pattern.md
├── react-antd/           # React + Ant Design 模式（成熟，τ×0.3）
│   └── pattern.md
├── vite-vue3/             # Vite + Vue3 通用模式（成熟，τ×0.3）
│   └── pattern.md
├── next-app-router/       # Next.js App Router 模式（成长，τ×0.6）
│   └── pattern.md
└── nuxt3/                 # Nuxt3 模式（成长，τ×0.6）
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

| 匹配结果 | similarity | τ 折扣 | 后续动作 |
|---------|-----------|--------|---------|
| 成熟模式 | ≥ 0.6 | τ × 0.3（150→45）| 命中模式，跳过 scan-config-context |
| 成长模式 | 0.4–0.6 | τ × 0.6（150→90）| 命中模式，减少扫描范围 |
| 无匹配 | < 0.4 | 无折扣 | 正常全量扫描 |

---

## 4. 模式文件格式（pattern.md）

```markdown
# 项目模式：Vue3 + Element Plus

## 基本信息
- 模式名称：vue3-element-plus
- 成熟度：成熟（出现 ≥ 5 次验证）
- τ 折扣：70%
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
- 命中成熟模式时，跳过 `scan-config-context` 原子技能（节省 τ=400）
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

## 5. τ 消耗

| 步骤 | τ 值 | 说明 |
|------|------|------|
| 特征提取 | 50 | 读取 package.json，提取特征 |
| 模式匹配 | 80 | Jaccard 相似度计算 |
| 结果写入 | 20 | 写入共享上下文 |
| **合计** | **150** | 命中成熟模式后总消耗 45 |

---

## 6. Pattern Mining 规则

```
pattern-001: 相似度 ≥ 0.6 时，命中成熟模式，τ 折扣 70%
pattern-002: 相似度 ≥ 0.4 时，命中成长模式，τ 折扣 40%
pattern-003: 无历史模式时，新建模式（τ 无折扣）
pattern-004: 命中模式后，仅扫描变化的部分（增量扫描）
```

---

## 7. 输出格式

```markdown
## 项目模式匹配结果

- 匹配状态：命中成熟模式 / 命中成长模式 / 无匹配
- 模式名称：[模式名称]
- 相似度：{similarity}
- τ 消耗：{actual_tau}（折扣：{discount}）

### 跳过的步骤（如命中模式）
- scan-config-context（τ=400，已跳过）

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