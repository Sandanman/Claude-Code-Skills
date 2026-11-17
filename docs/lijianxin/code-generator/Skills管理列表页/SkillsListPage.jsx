import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Input, Select, Button, Table, Pagination, Popconfirm, message } from 'antd'
import './SkillsListPage.less'

const { Option } = Select

const CATEGORY_ALL = ''
const CATEGORIES = ['文档', '语言', '视觉', '数据', '检索', '其他']
const PAGE_SIZE_OPTIONS = ['10', '20', '50']
const DEFAULT_PAGE_SIZE = 10
const MESSAGE_DURATION = 2
const TABLE_SCROLL_X = 900
const EDIT_PATH = 'airun-skills-edit.html'
const DETAIL_PATH = 'airun-skills-detail.html'

/**
 * 按关键字与分类过滤（R-01 ~ R-03）
 * 关键字转小写后与名称、描述的小写形式做包含匹配，不匹配 ID、分类、来源；
 * 分类非空时要求严格相等。
 */
const filterSkills = (list, keyword, category) => {
    const kw = keyword.toLowerCase()
    return list.filter(item => {
        const hit = item.name.toLowerCase().includes(kw) || item.desc.toLowerCase().includes(kw)
        if (!hit) {
            return false
        }
        return category === CATEGORY_ALL || item.category === category
    })
}

const getTotalPages = (total, pageSize) => Math.max(1, Math.ceil(total / pageSize))

const defaultNavigate = path => {
    window.location.href = path
}

/**
 * Skills 管理列表页（M-05 ~ M-09）
 * @param {Object} props
 * @param {(path: string) => void} [props.onNavigate] 页面跳转回调，参数为目标地址；未传入时直接修改 window.location.href
 */
const SkillsListPage = ({ onNavigate = defaultNavigate }) => {
    const [skills, setSkills] = useState([])
    const [keyword, setKeyword] = useState('')
    const [category, setCategory] = useState(CATEGORY_ALL)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const mountedRef = useRef(true)

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    /** m.fetchSkills：加载列表，mock 数据仅在本方法内返回 */
    const fetchSkills = useCallback(async () => {
        setLoading(true)
        setError(false)
        try {
            const list = await Promise.resolve([
                { id: 'sk-pdf', name: 'pdf-extractor', desc: 'PDF 文本/表格抽取', category: '文档', source: 'Markdown', status: 'active', created_at: '2026-04-12 10:22:11' },
                { id: 'sk-excel', name: 'excel-analyzer', desc: 'Excel 公式与数据分析', category: '文档', source: 'ZIP 包', status: 'active', created_at: '2026-04-15 14:08:32' },
                { id: 'sk-trans', name: 'translator', desc: '多语种翻译', category: '语言', source: 'Markdown', status: 'active', created_at: '2026-04-20 09:15:00' },
                { id: 'sk-img', name: 'image-classifier', desc: '图片分类与目标识别', category: '视觉', source: 'ZIP 包', status: 'active', created_at: '2026-04-25 16:42:18' },
                { id: 'sk-sql', name: 'sql-runner', desc: '安全执行 SQL 查询', category: '数据', source: 'Markdown', status: 'active', created_at: '2026-05-02 11:08:50' },
                { id: 'sk-web', name: 'web-search', desc: '网页搜索 + 摘要', category: '检索', source: 'ZIP 包', status: 'archived', created_at: '2026-05-10 13:20:00' }
            ])
            if (!mountedRef.current) {
                return
            }
            setSkills(list)
        } catch (e) {
            if (!mountedRef.current) {
                return
            }
            setSkills([])
            setError(true)
        } finally {
            if (mountedRef.current) {
                setLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        fetchSkills()
    }, [fetchSkills])

    const filtered = useMemo(() => filterSkills(skills, keyword, category), [skills, keyword, category])
    const total = filtered.length
    const totalPages = getTotalPages(total, pageSize)
    const pageData = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize])

    /** m.handleSearch */
    const handleSearch = value => {
        setKeyword(value)
        setPage(1)
    }

    /** m.handleCategory */
    const handleCategory = value => {
        setCategory(value)
        setPage(1)
    }

    /** m.changePage */
    const changePage = target => {
        if (target < 1 || target > totalPages) {
            return
        }
        setPage(target)
    }

    /** m.changePageSize */
    const changePageSize = (current, size) => {
        setPageSize(size)
        setPage(1)
    }

    /** m.deleteSkill：仅作用于页面内数据，不发起接口请求（R-06） */
    const deleteSkill = async id => {
        if (!skills.some(item => item.id === id)) {
            return { success: false }
        }
        const rest = skills.filter(item => item.id !== id)
        const nextPages = getTotalPages(filterSkills(rest, keyword, category).length, pageSize)
        setSkills(rest)
        setPage(current => Math.min(current, nextPages))
        return { success: true }
    }

    /** i.deleteConfirm：Popconfirm 确认后执行删除 */
    const handleDeleteConfirm = async id => {
        setDeleting(true)
        try {
            const result = await deleteSkill(id)
            if (!mountedRef.current) {
                return
            }
            if (result.success) {
                message.success('已删除', MESSAGE_DURATION)
            } else {
                message.error('删除失败')
            }
        } catch (e) {
            message.error('删除失败')
        } finally {
            if (mountedRef.current) {
                setDeleting(false)
            }
        }
    }

    const goCreate = () => onNavigate(EDIT_PATH)
    const goDetail = id => onNavigate(`${DETAIL_PATH}?id=${encodeURIComponent(id)}`)
    const goEdit = id => onNavigate(`${EDIT_PATH}?id=${encodeURIComponent(id)}`)

    const columns = [
        {
            title: 'Skill ID',
            dataIndex: 'id',
            key: 'id',
            render: text => <code className="skills-list-page__id">{text}</code>
        },
        {
            title: 'Skill 名称',
            dataIndex: 'name',
            key: 'name',
            render: text => <strong>{text}</strong>
        },
        {
            title: '描述',
            dataIndex: 'desc',
            key: 'desc',
            render: text => <span className="skills-list-page__desc">{text}</span>
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category'
        },
        {
            title: '来源',
            dataIndex: 'source',
            key: 'source'
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            render: text => <span className="skills-list-page__time">{text}</span>
        },
        {
            title: '操作',
            key: 'actions',
            className: 'col-actions',
            // i.actionCell：操作列阻止冒泡，不触发整行点击（R-04）
            onCell: () => ({ onClick: e => e.stopPropagation() }),
            render: (_, record) => (
                <span>
                    <a className="skills-list-page__action" onClick={() => goDetail(record.id)}>详情</a>
                    <a className="skills-list-page__action" onClick={() => goEdit(record.id)}>编辑</a>
                    <Popconfirm
                        title="确认删除该 Skill？删除后无法恢复"
                        okText="确定"
                        cancelText="取消"
                        okType="danger"
                        onConfirm={() => handleDeleteConfirm(record.id)}
                    >
                        <a className={`skills-list-page__action skills-list-page__action--danger${deleting ? ' is-disabled' : ''}`}>删除</a>
                    </Popconfirm>
                </span>
            )
        }
    ]

    let emptyText = <span className="skills-list-page__empty">暂无 Skill，点击「+ 新建 Skill」创建</span>
    if (error) {
        emptyText = (
            <span className="skills-list-page__empty">
                加载失败，请重试 <Button size="small" onClick={fetchSkills}>重试</Button>
            </span>
        )
    } else if (loading) {
        emptyText = <span />
    }

    return (
        <div className="skills-list-page">
            <div className="skills-list-page__toolbar">
                <div className="skills-list-page__filters">
                    <Input
                        className="skills-list-page__search"
                        value={keyword}
                        disabled={loading}
                        onChange={e => handleSearch(e.target.value)}
                    />
                    <Select
                        className="skills-list-page__category"
                        value={category}
                        disabled={loading}
                        onChange={handleCategory}
                    >
                        <Option value={CATEGORY_ALL}>全部分类</Option>
                        {CATEGORIES.map(item => (
                            <Option key={item} value={item}>{item}</Option>
                        ))}
                    </Select>
                </div>
                <div className="skills-list-page__actions">
                    <Button type="primary" onClick={goCreate}>+ 新建 Skill</Button>
                </div>
            </div>

            <Table
                className="skills-list-page__table"
                rowKey="id"
                columns={columns}
                dataSource={pageData}
                loading={loading}
                pagination={false}
                scroll={{ x: TABLE_SCROLL_X }}
                locale={{ emptyText }}
                // R-04：点击数据行进入详情
                onRow={record => ({ onClick: () => goDetail(record.id) })}
            />

            <div className="skills-list-page__pagination">
                <div className="skills-list-page__summary">
                    <span>共 {total} 个</span>
                    <span className="skills-list-page__page-indicator">第 {page}/{totalPages} 页</span>
                </div>
                <div className={`skills-list-page__controls${loading ? ' is-disabled' : ''}`}>
                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        total={total}
                        showSizeChanger
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        locale={{ items_per_page: '条/页' }}
                        onChange={changePage}
                        onShowSizeChange={changePageSize}
                        itemRender={(current, type, originalElement) => {
                            if (type === 'prev') {
                                return <a className="ant-pagination-item-link">‹</a>
                            }
                            if (type === 'next') {
                                return <a className="ant-pagination-item-link">›</a>
                            }
                            return originalElement
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default SkillsListPage
