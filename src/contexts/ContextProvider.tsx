import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
    ConnectionProvider,
    WalletProvider,
} from '@solana/wallet-adapter-react'
import { FC, ReactNode, useMemo } from 'react'
import { AutocratClientProvider } from './AutocratClientProvider'
import {
    WalletModal,
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { AutocratDataProvider } from './AutocratDataProvider'
import { AmmClientProvider } from './AmmClientProvider'

const RPC_ENDPOINT = "http://localhost:8899"

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const wallets = useMemo(
        () => [
            new SolflareWalletAdapter(),
            new PhantomWalletAdapter(),
        ],
        []
    )

    return (
        <ConnectionProvider
            endpoint={RPC_ENDPOINT}
            config={{ commitment: 'confirmed' }}
        >
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <>
            <WalletContextProvider>
                <AmmClientProvider>
                    <AutocratClientProvider>

                        <AutocratDataProvider>
                            {children}
                        </AutocratDataProvider>
                    </AutocratClientProvider>
                </AmmClientProvider>
            </WalletContextProvider>
        </>
    )
}
