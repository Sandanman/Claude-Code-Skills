# Code Style Generator 使用示例

## 示例1：Vue3 + TypeScript 项目

### 用户输入

```text
生成我的代码习惯文档
```

### 检测结果

> 以下结果仅为展示格式，实际内容必须来自项目扫描。

```text
配置文件：
- .editorconfig：存在
- .prettierrc.json：存在
- eslint.config.js：存在
- tsconfig.json：存在

框架类型：Vue3
TypeScript strict：true
TypeScript strictNullChecks：true

扫描文件：
- src/utils/utils.ts
- src/views/Home/index.vue
- src/components/MeetingCard.vue
- src/composables/useMeeting.ts

推断规则：
- html_attribute_quotes：double
- component_naming：PascalCase
- js_variable_naming：camelCase
- vue_script_style：script-setup
- composables_naming：camelCase
```

### 探测代码确认

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

interface Props {
    title: string
}

const props = defineProps<Props>()
</script>
```

系统应通过 `AskUserQuestion` 询问无法从配置和代码可靠推断的规则，例如：

```text
1. ref 与 reactive 的选择偏好？
2. composables 的抽离时机？
3. defineProps 的使用风格？
```

### 文档生成结果

```text
CODE_STYLE.md 已生成。
规则来源：配置文件、代码推断、用户确认。
未确认规则：无。
校验状态：passed。
```

## 示例2：仅执行规范检测

### 用户输入

```text
只检查项目配置和代码规范，不生成 CODE_STYLE.md。
```

### 执行路径

```text
detect-and-scan
```

### 输出

```json
{
  "status": "passed",
  "frameworkDetected": "vue3",
  "configRules": {},
  "inferredRules": {},
  "scannedFiles": [],
  "confidence": {}
}
```

实际输出中的规则、文件列表和置信度必须由扫描结果填充，不得使用示例值替代。

## 示例3：已有检测结果时继续生成

### 已有输入

```yaml
detection_result:
  source: "项目扫描任务"
  scope: "project_root"
  frameworkDetected: "react"
  configRules: {}
  inferredRules: {}
  scannedFiles: []
  confidence: {}
```

### 执行路径

```text
generate-and-confirm
  → generate-style-document
```

只有在 `detection_result` 的来源、范围和完整性经过确认后，才能跳过 `detect-and-scan`。

## 示例4：文档已存在

如果项目根目录已经存在 `CODE_STYLE.md`，系统必须先询问：

```text
检测到已有 CODE_STYLE.md，请选择：
1. 覆盖
2. 合并
3. 另存为新文件
4. 取消
```

用户选择前不得覆盖原文档。选择取消时，任务状态应为 `partial` 或 `failed`，不能报告为成功。
