import React, { FC, ReactNode, useEffect, useState } from 'react'
import {
    useAnchorWallet,
    useConnection,
    useWallet,
} from '@solana/wallet-adapter-react'
import useAmmClientStore from '../stores/useAmmClient'
import { AnchorProvider } from '@coral-xyz/anchor'
import { AmmClient } from '@themetadao/autocrat-sdk'
import { PublicKey } from '@solana/web3.js'

export const AmmClientProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const wallet = useAnchorWallet()
    const { publicKey, connected } = useWallet()
    const { connection } = useConnection()

    const { setClient } = useAmmClientStore()

    useEffect(() => {
        ; (async () => {
            if (connected) {
                const provider = new AnchorProvider(
                    connection,
                    wallet,
                    AnchorProvider.defaultOptions()
                )
                let ammClient = await AmmClient.createClient({ provider })
                setClient(ammClient)
            }
        })()
    }, [wallet, publicKey, connected])

    return <>{children}</>
}
