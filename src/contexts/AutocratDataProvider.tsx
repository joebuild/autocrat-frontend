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
import useProposalStore from 'stores/useProposalStore'
import useAmmClientStore from 'stores/useAmmClient'
import useConditionalAmmsStore from 'stores/useConditionalAmmsStore'

export const AutocratDataProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const wallet = useAnchorWallet()
    const { publicKey, connected } = useWallet()

    const { client: autocratClient } = useAutocratClientStore()
    const { client: ammClient } = useAmmClientStore()

    const { setProposals } = useProposalStore()
    const { setConditionalAmms } = useConditionalAmmsStore()

    useEffect(() => {
        ; (async () => {
            if (connected && autocratClient) {
                let proposals = await autocratClient.getAllProposals()
                proposals.map(p => setProposals(p.account.number.toNumber(), p))
            }
        })()
    }, [wallet, publicKey, connected, autocratClient])

    useEffect(() => {
        ; (async () => {
            if (connected && ammClient) {
                let amms = await ammClient.getAllAmms()
                amms.map(amm => setConditionalAmms(amm.publicKey.toBase58(), amm))
            }
        })()
    }, [wallet, publicKey, connected, ammClient])

    return <>{children}</>
}
