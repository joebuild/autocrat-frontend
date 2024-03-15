import { cn } from 'lib/utils'
import React from 'react'

type Props = {
    children?: React.ReactNode | React.ReactNode[]
}

const Highlight = (props: Props) => {
    return <div className="highlight">{props.children}</div>
}

export default Highlight
