import React, { useMemo, Fragment } from 'react'

export default ({ children, deps = [], wrap = Fragment }) => {
    // 转换参数为大写开头
    const Wrap = wrap
    // 这里由于React 的限制，必须要返回单一节点，因此做了一层包装。
    // 包装节点可自定义传入一个组件类型

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const comp = useMemo(children, deps)
    return <Wrap>{comp}</Wrap>
}
