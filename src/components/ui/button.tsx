import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from 'lib/utils'
import { Loader2 } from 'lucide-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'

const buttonVariants = cva(
    'inline-flex items-center justify-center flex-nowrap whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground hover:bg-primary/90',
                destructive:
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline:
                    'border border-primary bg-transparent hover:bg-accent hover:text-accent-foreground',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                accent: 'bg-accent text-accent-foreground hover:bg-accent/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 !p-0 hover:underline !h-fit',
                ui: 'text-secondary-foreground underline-offset-4 !p-0 hover:underline !h-fit hover:opacity-80',
                tag: 'text-secondary-foreground outline outline-1 outline-accent !h-fit',
            },
            size: {
                default: ' px-4 py-3',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8',
                icon: 'h-10 w-10',
                tag: 'py-1.5 px-2.5',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    loading?: string
    requiresConnection?: boolean
    disconnectedText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            requiresConnection = false,
            disconnectedText = 'Connect wallet',
            ...props
        },
        ref
    ) => {
        const { connected } = useWallet()
        const { setVisible } = useWalletModal()
        const Comp = asChild ? Slot : 'button'
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
                onClick={(e) => {
                    if (!connected && requiresConnection)
                        return setVisible(true)
                    props.onClick && props.onClick(e)
                }}
            >
                {props.loading == "true" ? (
                    <>
                        <Loader2 className="w-6 h-6 ml-2 animate-spin" />
                    </>
                ) : !connected && requiresConnection ? (
                    disconnectedText
                ) : (
                    props.children
                )}
            </Comp>
        )
    }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
