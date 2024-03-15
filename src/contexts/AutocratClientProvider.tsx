import React, { FC, ReactNode, useEffect, useState } from 'react'
import {
    useAnchorWallet,
    useConnection,
    useWallet,
} from '@solana/wallet-adapter-react'
import useAutocratClientStore from '../stores/useAutocratClient'
import { AnchorProvider } from '@coral-xyz/anchor'
import { AutocratClient } from '@themetadao/autocrat-sdk'
import { PublicKey } from '@solana/web3.js'

export const AutocratClientProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const wallet = useAnchorWallet()
    const { publicKey, connected } = useWallet()
    const { connection } = useConnection()

    const { setClient } = useAutocratClientStore()

    useEffect(() => {
        ; (async () => {
            if (connected) {
                const provider = new AnchorProvider(
                    connection,
                    wallet,
                    AnchorProvider.defaultOptions()
                )
                let autocratClient = await AutocratClient.createClient({ provider })
                setClient(autocratClient)
            }
        })()
    }, [wallet, publicKey, connected])

    return <>{children}</>
}
