import { useWallet } from '@solana/wallet-adapter-react'
import { AmmWrapper, ProposalWrapper, getATA } from '@themetadao/autocrat-sdk'
import BN from 'bn.js'
import React, { FunctionComponent, useEffect, useRef, useState } from 'react'
import useAmmClientStore from 'stores/useAmmClient'
import useAutocratClientStore from 'stores/useAutocratClient'
import { toFormattedNumber } from 'utils/numberFormat'
import { TxButton } from 'components/TxButton'
import { Button } from 'components/ui/button'
import { AccountMeta } from '@solana/web3.js'

interface IProps {
    proposal: ProposalWrapper,
}

export const ProposalHeaderCard: FunctionComponent<IProps> = ({
    proposal,
    ...props
}) => {
    const { publicKey, connected } = useWallet()

    const { client: autocratClient } = useAutocratClientStore()

    const metaWalletBalanceAmount = useRef(new BN(0))
    const usdcWalletBalanceAmount = useRef(new BN(0))

    const metaWalletBalanceUnits = useRef(0)
    const usdcWalletBalanceUnits = useRef(0)

    const isFinalized = Object.keys(proposal.account.state)[0] != "pending"

    const conditionalMetaToMintUnits = useRef(0)
    const conditionalUsdcToMintUnits = useRef(0)

    useEffect(() => {
        ; (async () => {
            if (connected && autocratClient) {
                let metaATA = getATA(proposal.account.metaMint, autocratClient.provider.publicKey)[0]
                let metaBalance = await autocratClient.provider.connection.getTokenAccountBalance(metaATA)

                metaWalletBalanceAmount.current = new BN(metaBalance.value.amount)
                metaWalletBalanceUnits.current = metaBalance.value.uiAmount

                let usdcATA = getATA(proposal.account.usdcMint, autocratClient.provider.publicKey)[0]
                let usdcBalance = await autocratClient.provider.connection.getTokenAccountBalance(usdcATA)

                usdcWalletBalanceAmount.current = new BN(usdcBalance.value.amount)
                usdcWalletBalanceUnits.current = usdcBalance.value.uiAmount
            }
        })()
    }, [proposal, connected, autocratClient])

    const [accountsToFinalize, setAccountsToFinalize] = useState([] as AccountMeta[])

    useEffect(() => {
        ; (async () => {
            if (connected && autocratClient) {
                let proposalInstructions = await autocratClient.getProposalInstructionsByNumber(proposal.account.number.toNumber())
                let accounts = proposalInstructions.instructions.flatMap(i => i.accounts)
                setAccountsToFinalize(accounts)
            }
        })()
    }, [proposal, connected, autocratClient])

    return (
        <div className="w-full p-4 mb-4 rounded-lg card bg-secondary">
            <div className="flex flex-row justify-evenly">
                <div className="flex flex-col gap-3">
                    <Button
                        variant="default"
                        className=""
                    >
                        <a
                            target="_blank"
                            href={proposal.account.descriptionUrl}
                        >
                            Proposal URL
                        </a>
                    </Button>

                    < TxButton
                        buttonLabel="Finalize"
                        handleCall={async () => {
                            let ixh = await autocratClient.finalizeProposal(proposal.account.number.toNumber(), accountsToFinalize)
                            return await ixh.rpc()
                        }}
                    />

                    < TxButton
                        buttonLabel="Redeem Conditional Tokens"
                        disabled={!isFinalized}
                        handleCall={async () => {
                            let ixh = await autocratClient.redeemConditionalTokens(proposal.publicKey)
                            return await ixh.rpc()
                        }}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="w-full max-w-xs form-control ">
                        <div className="label">
                            <span className="label-text">Mint Conditional META</span>
                        </div>
                        <input type="text" placeholder="0.00" className="w-full max-w-xs input input-sm input-bordered" data-1p-ignore data-bwignore data-lpignore="true" data-form-type="other"
                            onChange={(x) => conditionalMetaToMintUnits.current = Number(x.target.value)}
                        />
                        <div className="label">
                            <span className="label-text-alt">META Balance:</span>
                            <span className="label-text-alt">{metaWalletBalanceUnits.current}</span>
                        </div>
                    </label>
                    < TxButton
                        buttonLabel="Mint Conditional META"
                        handleCall={async () => {
                            let metaAmount = new BN(Math.floor(conditionalMetaToMintUnits.current * 10 ** 9))
                            let ixh = await autocratClient.mintConditionalTokens(proposal.publicKey, metaAmount, new BN(0))
                            return await ixh.rpc()
                        }}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="w-full max-w-xs form-control ">
                        <div className="label">
                            <span className="label-text">Mint Conditional USDC</span>
                        </div>
                        <input type="text" placeholder="0.00" className="w-full max-w-xs input input-sm input-bordered" data-1p-ignore data-bwignore data-lpignore="true" data-form-type="other"
                            onChange={(x) => conditionalUsdcToMintUnits.current = Number(x.target.value)}
                        />
                        <div className="label">
                            <span className="label-text-alt">USDC Balance:</span>
                            <span className="label-text-alt">{usdcWalletBalanceUnits.current}</span>
                        </div>
                    </label>
                    < TxButton
                        buttonLabel="Mint Conditional USDC"
                        handleCall={async () => {
                            let usdcAmount = new BN(Math.floor(conditionalUsdcToMintUnits.current * 10 ** 6))
                            let ixh = await autocratClient.mintConditionalTokens(proposal.publicKey, new BN(0), usdcAmount)
                            return await ixh.rpc()
                        }}
                    />
                </div>
            </div>
        </div >
    )
}