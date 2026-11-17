#!/usr/bin/env node
// 只读校验脚本：校验 page-layout.json（及可选 page-layout.md）的结构、ID 与引用，不修改任何文件
// 用法：node validate-layout.mjs --json <page-layout.json> [--md <page-layout.md>] [--mode draft|final] [--base <基线 page-layout.json>]
import { readFileSync } from 'node:fs'

const PENDING_MARK = '[待确认]'
const ASYNC_STATE_TYPES = ['loading', 'empty', 'error']
const METHOD_DATA_MODES = ['api', 'mock']
const METHOD_TRIGGER_TYPES = ['lifecycle', 'interaction']
// 交互必填的完整性字段（final 校验，不适用时写 not_applicable 并说明原因）
const INTERACTION_REQUIRED_FIELDS = ['precondition', 'failure_feedback', 'loading_behavior', 'duplicate_guard']
// 组件来源及其必填附加字段（见 SKILL.md 阶段 4 组件来源判定）
const COMPONENT_SOURCES = {
    project_common: ['component_path'],
    ui_library: [],
    new_shared: ['reuse_reason'],
    page_local: ['reuse_reason']
}
const INCREMENTAL_SCENARIOS = ['incremental_add', 'incremental_modify']
const CHANGE_TYPES = ['add', 'modify', 'remove']
const CHANGE_LOG_CHAPTER = '## 变更记录'
// 基线对比范围：只比较这些顶层数组中带 id 的对象
const BASE_COMPARE_KEYS = ['components', 'interactions', 'methods', 'overlays', 'states']
const CHAPTERS = [
    '# 页面布局设计文档',
    '## 页面概览',
    '## 项目技术栈与规范',
    '## 页面布局树',
    '## 区域与组件明细',
    '## 交互与流程',
    '## 方法与数据（API / Mock）',
    '## 弹窗、抽屉与确认框',
    '## 页面状态',
    '## 响应式行为',
    '## 视觉规范',
    '## 页面代码生成约束',
    '## 待确认项与建议',
    '## 校验结果'
]

const errors = []
const warnings = []
const addError = (rule, id, message) => errors.push({ rule, id: id || '', message })
const addWarning = (rule, id, message) => warnings.push({ rule, id: id || '', message })

const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const asArray = (value) => (Array.isArray(value) ? value : [])
const isFilled = (value) => {
    if (typeof value === 'string') return value.trim() !== ''
    if (Array.isArray(value)) return value.length > 0
    if (value && typeof value === 'object') return Object.keys(value).length > 0
    return value !== undefined && value !== null
}

const parseArgs = (argv) => {
    const args = { json: '', md: '', mode: 'draft', base: '' }
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--json') args.json = argv[++i] || ''
        else if (argv[i] === '--md') args.md = argv[++i] || ''
        else if (argv[i] === '--mode') args.mode = argv[++i] || ''
        else if (argv[i] === '--base') args.base = argv[++i] || ''
    }
    return args
}

const readText = (filePath, rule) => {
    try {
        return readFileSync(filePath, 'utf8')
    } catch (error) {
        addError(rule, filePath, `无法读取文件：${error.message}`)
        return null
    }
}

const collectSuggested = (node, found) => {
    if (Array.isArray(node)) {
        node.forEach((item) => collectSuggested(item, found))
    } else if (node && typeof node === 'object') {
        if (node.confirm_status === 'suggested') found.push(node.id || '(无 id)')
        Object.values(node).forEach((value) => collectSuggested(value, found))
    }
}

const countPending = (node) => {
    if (Array.isArray(node)) return node.reduce((sum, item) => sum + countPending(item), 0)
    if (node && typeof node === 'object') {
        const self = node.confirm_status === 'pending' ? 1 : 0
        return Object.values(node).reduce((sum, value) => sum + countPending(value), self)
    }
    return 0
}

// 对象签名：嵌套的带 id 对象折叠为引用，layout 的 children 忽略，使每个对象只对自身字段负责
const signature = (obj) => JSON.stringify(obj, (key, value) => {
    if (key === 'children') return undefined
    if (key !== '' && value && typeof value === 'object' && !Array.isArray(value) && typeof value.id === 'string') return { __ref: value.id }
    return value
})

// 收集文档中所有带 id 的对象（布局节点、组件、交互、方法、overlay 及按钮、状态）
const collectObjects = (doc) => {
    const map = new Map()
    const walkLayoutNode = (node) => {
        if (!node || typeof node !== 'object') return
        if (typeof node.id === 'string') map.set(node.id, node)
        asArray(node.children).forEach(walkLayoutNode)
    }
    asArray(asObject(doc.layout).children).forEach(walkLayoutNode)
    BASE_COMPARE_KEYS.forEach((key) => {
        asArray(doc[key]).forEach((item) => {
            if (item && typeof item === 'object' && typeof item.id === 'string') map.set(item.id, item)
            asArray(asObject(item).buttons).forEach((button) => {
                if (button && typeof button === 'object' && typeof button.id === 'string') map.set(button.id, button)
            })
        })
    })
    return map
}

// 增量场景：校验 change_log 结构，并在提供基线时核对基线对象的删除与改动都已记录
const validateChangeLog = (doc, args, isFinal, currentObjects) => {
    const metadata = asObject(doc.metadata)
    const isIncremental = INCREMENTAL_SCENARIOS.includes(metadata.scenario)
    const changeLog = asArray(doc.change_log).map(asObject)
    if (isIncremental) {
        if (!isFilled(metadata.base_document_id)) addError('base_document_id_missing', 'metadata', '增量场景缺少 metadata.base_document_id')
        if (!isFilled(metadata.base_version)) addError('base_version_missing', 'metadata', '增量场景缺少 metadata.base_version')
        if (isFinal && changeLog.length === 0) addError('change_log_empty', 'change_log', '增量场景的 change_log 不能为空')
    }
    const changeIds = new Set()
    const loggedTargets = new Map()
    changeLog.forEach((item, index) => {
        const where = item.id || `change_log[${index}]`
        if (typeof item.id !== 'string' || item.id === '') addError('change_id_missing', where, 'change_log 条目缺少 id')
        else if (changeIds.has(item.id)) addError('change_id_duplicate', item.id, `change_log id 重复：${item.id}`)
        else changeIds.add(item.id)
        if (!CHANGE_TYPES.includes(item.type)) addError('change_type', where, `change_log type 取值非法：${item.type}（add | modify | remove）`)
        if (!isFilled(item.summary)) addError('change_summary', where, 'change_log 条目缺少 summary')
        const targets = asArray(item.target_ids)
        if (targets.length === 0) addError('change_targets', where, 'change_log 条目缺少 target_ids')
        if (item.type === 'modify' && (!isFilled(item.before) || !isFilled(item.after))) addError('change_before_after', where, 'modify 类型必须填写 before 和 after')
        targets.forEach((id) => {
            loggedTargets.set(id, item.type)
            const exists = currentObjects.has(id)
            if (item.type === 'remove' && exists) addError('change_remove_exists', where, `${id} 记为 remove，但仍存在于文档中`)
            if ((item.type === 'add' || item.type === 'modify') && !exists) addError('change_target_missing', where, `${id} 记为 ${item.type}，但文档中不存在`)
        })
    })
    if (!args.base) return
    const baseText = readText(args.base, 'base_read')
    if (baseText === null) return
    let base = null
    try {
        base = JSON.parse(baseText)
    } catch (error) {
        addError('base_parse', args.base, `基线 JSON 解析失败：${error.message}`)
        return
    }
    const baseMetadata = asObject(base.metadata)
    if (isIncremental) {
        if (metadata.base_document_id !== baseMetadata.document_id) addError('base_document_mismatch', 'metadata', `base_document_id 应为 ${baseMetadata.document_id}，实际为 ${metadata.base_document_id}`)
        if (metadata.base_version !== baseMetadata.version) addError('base_version_mismatch', 'metadata', `base_version 应为 ${baseMetadata.version}，实际为 ${metadata.base_version}`)
        if (metadata.version === baseMetadata.version) addError('version_not_bumped', 'metadata', `version 未递增，仍为 ${metadata.version}`)
    }
    const baseObjects = collectObjects(base)
    baseObjects.forEach((baseItem, id) => {
        const current = currentObjects.get(id)
        if (!current) {
            if (loggedTargets.get(id) !== 'remove') addError('base_removed_unlogged', id, `基线对象 ${id} 已不存在，但 change_log 没有对应的 remove 记录`)
        } else if (signature(current) !== signature(baseItem) && !['modify', 'add'].includes(loggedTargets.get(id))) {
            addError('base_modified_unlogged', id, `基线对象 ${id} 内容有改动，但 change_log 没有对应的 modify 记录`)
        }
    })
    loggedTargets.forEach((type, id) => {
        if (type === 'add' && baseObjects.has(id)) addError('change_add_exists_in_base', id, `${id} 记为 add，但基线中已存在`)
    })
}

const validate = (doc, args) => {
    const isFinal = args.mode === 'final'
    const idIndex = new Map()
    const register = (kind, id, where) => {
        if (typeof id !== 'string' || id === '') {
            addError('id_missing', where, `${kind} 缺少 id`)
            return
        }
        if (idIndex.has(id)) {
            addError('id_duplicate', id, `${id} 重复（${idIndex.get(id)} / ${kind}）`)
            return
        }
        idIndex.set(id, kind)
    }
    const has = (id, kinds) => typeof id === 'string' && idIndex.has(id) && (!kinds || kinds.includes(idIndex.get(id)))

    // 布局树：children 为嵌套节点对象，一级节点的 parent_id 等于 layout.root_id
    const layout = asObject(doc.layout)
    const layoutNodes = []
    register('layout', layout.root_id, 'layout.root_id')
    const walkLayout = (node, parentId, path) => {
        if (!node || typeof node !== 'object' || Array.isArray(node)) {
            addError('layout_child_type', path, '布局子节点必须是对象')
            return
        }
        register('layout', node.id, path)
        layoutNodes.push(node)
        if (node.parent_id !== parentId) {
            addError('layout_parent', node.id, `${path}.parent_id 应为 ${parentId}，实际为 ${node.parent_id}`)
        }
        asArray(node.children).forEach((child, index) => walkLayout(child, node.id, `${path}.children[${index}]`))
    }
    asArray(layout.children).forEach((child, index) => walkLayout(child, layout.root_id, `layout.children[${index}]`))

    const components = asArray(doc.components).map(asObject)
    const interactions = asArray(doc.interactions).map(asObject)
    const overlays = asArray(doc.overlays).map(asObject)
    const methods = asArray(doc.methods).map(asObject)
    const states = asArray(doc.states).map(asObject)
    components.forEach((item, index) => register('component', item.id, `components[${index}]`))
    interactions.forEach((item, index) => register('interaction', item.id, `interactions[${index}]`))
    methods.forEach((item, index) => register('method', item.id, `methods[${index}]`))
    overlays.forEach((item, index) => {
        register('overlay', item.id, `overlays[${index}]`)
        asArray(item.buttons).map(asObject).forEach((button, buttonIndex) => register('overlay_button', button.id, `overlays[${index}].buttons[${buttonIndex}]`))
    })
    states.forEach((item, index) => register('state', item.id, `states[${index}]`))

    // 引用完整性
    components.forEach((item) => {
        if (!has(item.layout_id, ['layout'])) addError('component_layout', item.id, `组件 layout_id 指向不存在的布局节点：${item.layout_id}`)
    })
    // 组件来源：draft 只校验已填写的取值与附加字段，final 要求每个组件都填写
    components.forEach((item) => {
        if (item.source === undefined || item.source === null || item.source === '') {
            if (isFinal) addError('component_source_missing', item.id, '组件缺少 source（project_common | ui_library | new_shared | page_local）')
            return
        }
        if (!Object.hasOwn(COMPONENT_SOURCES, item.source)) {
            addError('component_source_invalid', item.id, `组件 source 取值非法：${item.source}`)
            return
        }
        COMPONENT_SOURCES[item.source].forEach((field) => {
            if (!isFilled(item[field])) addError('component_source_field', item.id, `source 为 ${item.source} 的组件缺少 ${field}`)
        })
    })
    interactions.forEach((item) => {
        if (!has(item.source_id, ['component', 'overlay', 'overlay_button'])) {
            addError('interaction_source', item.id, `交互 source_id 指向不存在的对象：${item.source_id}`)
        }
        // target_id 可能指向后续阶段才创建的 overlay，draft 模式仅警告；外部路由用 target_route，不走此检查
        if (item.target_id && !has(item.target_id)) {
            const report = isFinal ? addError : addWarning
            report('interaction_target', item.id, `交互 target_id 指向不存在的对象：${item.target_id}`)
        }
        if (item.method_id !== undefined && item.method_id !== null && item.method_id !== '' && !has(item.method_id, ['method'])) {
            addError('interaction_method', item.id, `交互 method_id 指向不存在的方法：${item.method_id}`)
        }
    })
    // 方法：data_mode 决定必填字段；mock 数据只允许在方法内返回
    methods.forEach((item) => {
        if (!METHOD_TRIGGER_TYPES.includes(item.trigger_type)) {
            addError('method_trigger_type', item.id, `方法 trigger_type 取值非法：${item.trigger_type}（lifecycle | interaction）`)
        } else if (item.trigger_type === 'interaction' && !has(item.interaction_id, ['interaction'])) {
            addError('method_interaction', item.id, `interaction 类型方法的 interaction_id 指向不存在的交互：${item.interaction_id}`)
        } else if (item.trigger_type === 'lifecycle' && !isFilled(item.lifecycle_hook)) {
            addError('method_lifecycle_hook', item.id, 'lifecycle 类型方法缺少 lifecycle_hook')
        }
        if (isFilled(item.target_id) && !has(item.target_id, ['layout', 'component', 'overlay'])) {
            addError('method_target', item.id, `方法 target_id 指向不存在的对象：${item.target_id}`)
        }
        if (!METHOD_DATA_MODES.includes(item.data_mode)) {
            addError('method_data_mode', item.id, `方法 data_mode 取值非法：${item.data_mode}（api | mock）`)
        } else if (item.data_mode === 'api' && !isFilled(item.endpoint)) {
            addError('method_api_endpoint', item.id, 'api 方法缺少 endpoint')
        } else if (item.data_mode === 'mock') {
            if (!isFilled(item.mock_return)) addError('method_mock_return', item.id, 'mock 方法缺少 mock_return')
            if (item.mock_scope !== 'in_method') addError('method_mock_scope', item.id, 'mock 方法的 mock_scope 必须为 in_method（mock 数据只在方法内返回）')
        }
    })
    overlays.forEach((item) => {
        if (!has(item.trigger_interaction_id, ['interaction'])) {
            addError('overlay_trigger', item.id, `overlay trigger_interaction_id 指向不存在的交互：${item.trigger_interaction_id}`)
        }
        asArray(item.buttons).map(asObject).forEach((button) => {
            if (!has(button.interaction_id, ['interaction'])) {
                addError('overlay_button_interaction', button.id, `overlay 按钮 interaction_id 指向不存在的交互：${button.interaction_id}`)
            }
        })
    })
    states.forEach((item) => {
        if (!has(item.target_id, ['layout', 'component', 'overlay'])) {
            addError('state_target', item.id, `状态 target_id 指向不存在的对象：${item.target_id}`)
        }
    })

    validateChangeLog(doc, args, isFinal, collectObjects(doc))

    const suggested = []
    collectSuggested(doc, suggested)
    const pendingCount = countPending(doc)
    if (!isFinal) {
        return { layoutCount: layoutNodes.length, suggestedCount: suggested.length, pendingCount }
    }

    // final 模式：完整性与一致性
    const leafNodes = layoutNodes.filter((node) => asArray(node.children).length === 0)
    leafNodes.forEach((node) => {
        const hasComponent = components.some((item) => item.layout_id === node.id)
        if (!hasComponent && !isFilled(node.content_note)) addError('leaf_empty', node.id, '叶子区域既没有组件，也没有 content_note 内容说明')
    })

    const asyncTargets = [...components, ...overlays, ...layoutNodes].filter((item) => item.async === true)
    asyncTargets.forEach((target) => {
        ASYNC_STATE_TYPES.forEach((stateType) => {
            const state = states.find((item) => item.target_id === target.id && item.state_type === stateType)
            if (!state) {
                addError('async_state_missing', target.id, `异步对象缺少 ${stateType} 状态（可定义为 not_applicable 并说明原因）`)
            } else if (state.applicability === 'not_applicable' && !isFilled(state.reason)) {
                addError('state_reason_missing', state.id, `${stateType} 标记为 not_applicable 但没有 reason`)
            }
        })
    })

    suggested.forEach((id) => addError('unconfirmed_suggested', id, '存在未确认的 suggested 内容，应转入 open_questions 并降级为 partial'))

    // 交互完整性：每个交互都要有方法（或说明无需方法），并填写前置条件、失败反馈、loading、防重复
    interactions.forEach((item) => {
        if (!isFilled(item.method_id) && !isFilled(item.no_method_reason)) {
            addError('interaction_method_missing', item.id, '交互缺少 method_id，也没有 no_method_reason')
        }
        INTERACTION_REQUIRED_FIELDS.forEach((field) => {
            if (!isFilled(item[field])) addError('interaction_field_missing', item.id, `交互缺少 ${field}（不适用时写 not_applicable 并说明原因）`)
        })
    })
    // 每个 async 组件都要有方法负责加载（生命周期或交互触发）
    components.filter((item) => item.async === true).forEach((item) => {
        if (!methods.some((method) => method.target_id === item.id)) {
            addError('async_load_method_missing', item.id, `异步组件没有任何方法（生命周期或交互）以它为 target_id 来加载数据`)
        }
    })
    if (pendingCount > 0) addWarning('pending_items', '', `存在 ${pendingCount} 个 pending 内容，最终状态应为 partial`)

    const requiredFields = [
        ['metadata.page_name', asObject(doc.metadata).page_name],
        ['project_context.framework', asObject(doc.project_context).framework],
        ['project_context.ui_library', asObject(doc.project_context).ui_library],
        ['project_context.style_system', asObject(doc.project_context).style_system],
        ['project_context.project_conventions', asObject(doc.project_context).project_conventions],
        ['responsive.breakpoints', asObject(doc.responsive).breakpoints],
        ['responsive.rules', asObject(doc.responsive).rules],
        ['visual_tokens.colors', asObject(doc.visual_tokens).colors],
        ['visual_tokens.typography', asObject(doc.visual_tokens).typography],
        ['visual_tokens.spacing', asObject(doc.visual_tokens).spacing]
    ]
    requiredFields.forEach(([field, value]) => {
        if (!isFilled(value)) addError('field_empty', field, `${field} 为空，应填写或标记 ${PENDING_MARK}`)
    })

    // Markdown 与 JSON 一致性：章节齐全且顺序正确，JSON 中每个 ID 都出现在 Markdown 中
    if (!args.md) {
        addError('md_required', 'final', 'final 模式必须通过 --md 指定 Markdown 文件')
    } else {
        const markdown = readText(args.md, 'md_read')
        if (markdown !== null) {
            if (markdown.trim() === '') addError('md_empty', args.md, 'Markdown 文件为空')
            let cursor = 0
            const isIncremental = INCREMENTAL_SCENARIOS.includes(asObject(doc.metadata).scenario)
            const chapters = isIncremental ? [...CHAPTERS.slice(0, -1), CHANGE_LOG_CHAPTER, CHAPTERS[CHAPTERS.length - 1]] : CHAPTERS
            chapters.forEach((chapter) => {
                const position = markdown.indexOf(chapter, cursor)
                if (position === -1) addError('md_chapter', chapter, `Markdown 缺少章节或章节顺序错误：${chapter}`)
                else cursor = position + chapter.length
            })
            idIndex.forEach((kind, id) => {
                if (!markdown.includes(id)) addError('md_missing_id', id, `${kind} ${id} 没有出现在 Markdown 中`)
            })
        }
    }
    return { layoutCount: layoutNodes.length, suggestedCount: suggested.length, pendingCount }
}

const main = () => {
    const args = parseArgs(process.argv.slice(2))
    if (!args.json || !['draft', 'final'].includes(args.mode)) {
        console.error('用法：node validate-layout.mjs --json <page-layout.json> [--md <page-layout.md>] [--mode draft|final] [--base <基线 page-layout.json>]')
        process.exitCode = 2
        return
    }
    let summary = {}
    const text = readText(args.json, 'json_read')
    if (text !== null) {
        let doc = null
        try {
            doc = JSON.parse(text)
        } catch (error) {
            addError('json_parse', args.json, `JSON 解析失败：${error.message}`)
        }
        if (doc !== null) summary = validate(doc, args)
    }
    const report = {
        status: errors.length === 0 ? 'passed' : 'failed',
        mode: args.mode,
        summary,
        errors,
        warnings
    }
    console.log(JSON.stringify(report, null, 4))
    process.exitCode = errors.length === 0 ? 0 : 1
}

main()
