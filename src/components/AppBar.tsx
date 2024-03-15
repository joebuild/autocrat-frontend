import { useWallet } from '@solana/wallet-adapter-react'
import { cn } from 'lib/utils'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { truncatePubkey } from '../utils'
import Popover from './ui/popover'

const menuItems = [
    {
        label: 'Home',
        href: '/',
        type: 'public',
    },
    {
        label: 'Proposals',
        href: '/proposals',
        type: 'public',
    },
    {
        label: 'Create Proposal',
        href: '/create-proposal',
        type: 'public',
    },
    {
        label: 'Admin',
        href: '/admin',
        type: 'public',
    },
    // {
    //     label: 'Admin',
    //     href: '/admin',
    //     type: 'admin',
    // },
]

const WalletMultiButtonDynamic = dynamic(
    async () =>
        (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
)

export const socialLinks = (
    <>
        <Link
            className="z-20 flex items-center justify-center w-10 h-10 transition-all duration-200 ease-in-out rounded-full hover:opacity-80 shrink-0"
            target="_blank"
            href=""
        >
            <Image src="/ui-icons/open-book.svg" alt="x" width={24} height={24} />
        </Link>
        <Link
            className="z-20 flex items-center justify-center w-10 h-10 transition-all duration-200 ease-in-out rounded-full hover:opacity-80 shrink-0"
            target="_blank"
            href=""
        >
            <Image src="/ui-icons/discord.svg" alt="x" width={24} height={24} />
        </Link>
        <Link
            className="z-20 flex items-center justify-center w-10 h-10 transition-all duration-200 ease-in-out rounded-full hover:opacity-80 shrink-0"
            target="_blank"
            href=""
        >
            <Image src="/ui-icons/x.svg" alt="x" width={24} height={24} />
        </Link>
    </>
)

export const AppBar: React.FC = () => {
    const { pathname } = useRouter()
    const { connected, connecting, publicKey, disconnect } = useWallet()

    return (
        <div className="p-2 flex dark relative !z-30 !font-semibold">
            <div className="w-full">
                <div className="flex flex-row items-center justify-between w-full h-16 gap-2 px-4">
                    <Link href="/">
                        <div className="relative flex flex-row items-center justify-center">
                            <div className="w-10 mr-2 rounded-full">
                                <img src="/images/meta.png" />
                            </div>
                            <div className="text-xl font-bold select-none">
                                MetaDAO
                            </div>
                        </div>
                    </Link>

                    <div className="fixed bottom-0 left-0 right-0 z-50 items-center justify-center w-full gap-4 p-4 overflow-x-scroll md:z-10 grow md:overflow-x-visible md:shadow-none bg-background md:bg-transparent md:relative border-slate-400 ">
                        <div className="flex items-center justify-center gap-8 pr-4 mx-auto font-medium rounded-md w-fit md:py-4 md:relative border-slate-400 ">
                            {menuItems.map((item, index) => {
                                if (item.type === 'public') {
                                    return (
                                        <Link
                                            className={cn(
                                                `flex-nowrap link no-underline font-medium whitespace-nowrap`,
                                                pathname !== item.href &&
                                                'text-foreground'
                                            )}
                                            href={item.href}
                                            key={index}
                                        >
                                            {item.label}
                                        </Link>
                                    )
                                }
                            })}
                            <Popover
                                className="lg:hidden"
                                trigger={
                                    <button className="z-20 flex items-center justify-center w-10 h-10 transition-all duration-200 ease-in-out rounded-full lg:translate-x-16 lg:hidden hover:opacity-80 shrink-0 hover:bg-secondary-focus">
                                        <Image
                                            src="/ui-icons/dots-horizontal.svg"
                                            className=""
                                            alt="x"
                                            width={24}
                                            height={24}
                                        />
                                    </button>
                                }
                            >
                                <div className="flex gap-2">{socialLinks}</div>
                            </Popover>
                        </div>
                    </div>
                    <div className="lg:flex absolute z-20 right-36 top-1/2 translate-y-[-50%] gap-3 hidden">
                        {socialLinks}
                    </div>
                    <div className="flex items-center justify-end shrink-0 gap-3 basis-[166px]">
                        <WalletMultiButtonDynamic className="text-sm hover:bg-opacity-80">
                            {connected
                                ? truncatePubkey(publicKey.toBase58())
                                : connecting
                                    ? 'Connecting'
                                    : 'Connect'}
                        </WalletMultiButtonDynamic>
                    </div>
                </div>
            </div>
        </div>
    )
}
