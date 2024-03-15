import { cn } from 'lib/utils'
import React from 'react'

type Props = {
    className?: string
    value: string
}

const Tag = (props: Props) => {
    return (
        <div
            className={cn(
                'flex justify-center w-fit select-none items-center py-1 px-2 rounded-md outline outline-1 outline-primary text-xs md:text-sm uppercase font-semibold',
                props.className
            )}
        >
            <span className="font-normal text-inherit">{props.value}</span>
        </div>
    )
}

export default Tag
