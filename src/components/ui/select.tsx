import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, Plus, X, icons } from 'lucide-react'
import * as React from 'react'

import { cn } from 'lib/utils'
import { PlusCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { set } from 'date-fns'

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
        icon?: 'down' | 'clear' | 'plus'
    }
>(({ className, children, placeholder, ...props }, ref) => {
    return (
        <SelectPrimitive.Trigger
            ref={ref}
            icon={props.icon}
            className={cn(
                'flex h-10 w-max items-center hover:opacity-80 justify-between rounded-lg bg-secondary px-4 py-2 text-sm focus:outline-none  placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        >
            {/* todo: clean this up it's kind of gross */}
            {props.icon === 'plus' && (
                <SelectPrimitive.Icon asChild>
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                </SelectPrimitive.Icon>
            )}
            {children}
            <SelectPrimitive.Icon asChild>
                {props.icon !== 'plus' &&
                    (!placeholder ? (
                        <ChevronDown className="h-5 w-5 ml-2 opacity-50" />
                    ) : (
                        <XCircleIcon className="h-5 w-5 ml-2" />
                    ))}
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                'relative z-50 min-w-[8rem] shadow-2xl max-h-64 dark overflow-hidden rounded-lg bg-secondary text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                position === 'popper' &&
                    'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
                className
            )}
            position={position}
            {...props}
        >
            <SelectPrimitive.Viewport
                className={cn(
                    'p-1',
                    position === 'popper' &&
                        'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
                )}
            >
                {children}
            </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn('py-1.5 pl-8 pr-2 text-sm dark font-semibold', className)}
        {...props}
    />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            'relative flex w-full cursor-default select-none dark items-center rounded-sm py-1.5 px-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            className
        )}
        {...props}
    >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
            </SelectPrimitive.ItemIndicator>
        </span>

        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn('-mx-1 my-1 h-px bg-muted', className)}
        {...props}
    />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

interface Props {
    className?: string
    placeholder: string
    onChange?: (value: string) => void
    options: {
        value: string
        node: React.ReactNode
    }[]
    icon?: 'down' | 'clear' | 'plus'
    value: string
    disabled?: boolean
}

const Component: React.FC<Props> = ({
    disabled,
    options,
    placeholder,
    className,
    icon = 'down',
    value,
    onChange,
}) => {
    const [open, setOpen] = React.useState(false)

    const handleOpenChange = (open: boolean) => {
        if (value) {
            setOpen(false)
            onChange('')
            return
        }
        setOpen(open)
    }

    return (
        <Select
            value={value}
            disabled={disabled}
            onValueChange={onChange}
            open={open}
            onOpenChange={handleOpenChange}
        >
            <SelectTrigger
                className={className}
                icon={icon}
                placeholder={value}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option, i) => {
                    return (
                        <SelectItem key={option.value} value={option.value}>
                            {option.node}
                        </SelectItem>
                    )
                })}
            </SelectContent>
        </Select>
    )
}

export default Component
