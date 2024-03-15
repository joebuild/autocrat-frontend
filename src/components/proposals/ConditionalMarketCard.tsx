import { useWallet } from '@solana/wallet-adapter-react'
import { AmmWrapper, ProposalWrapper, SwapPreview, getATA } from '@themetadao/autocrat-sdk'
import BN from 'bn.js'
import React, { FunctionComponent, useEffect, useRef, useState } from 'react'
import useAmmClientStore from 'stores/useAmmClient'
import useAutocratClientStore from 'stores/useAutocratClient'
import { toFormattedNumber } from 'utils/numberFormat'
import { TxButton } from 'components/TxButton'

interface IProps {
    proposal: ProposalWrapper,
    amm: AmmWrapper
    isPassMarket: boolean
}

export const ConditionalMarketCard: FunctionComponent<IProps> = ({
    proposal,
    amm,
    isPassMarket,
    ...props
}) => {
    const { publicKey, connected } = useWallet()

    const { client: autocratClient } = useAutocratClientStore()
    const { client: ammClient } = useAmmClientStore()

    const ltwap = amm.account.ltwapLatest.toNumber() / 10 ** amm.account.ltwapDecimals

    const baseTokenUnits = amm.account.baseAmount.toNumber() / 10 ** amm.account.baseMintDecimals
    const quoteTokenUnits = amm.account.quoteAmount.toNumber() / 10 ** amm.account.quoteMintDecimals

    const price = quoteTokenUnits / baseTokenUnits

    const [isBuyBase, setIsBuyBase] = useState(true)

    const handleToggleBuySell = () => {
        setIsBuyBase(x => !x)
    }

    const [inputUnits, setInputUnits] = useState(0)
    const [swapSummary, setSwapSummary] = useState(undefined as SwapPreview)

    useEffect(() => {
        ; (async () => {
            if (connected && amm && ammClient) {
                try {
                    let inputAmount = isBuyBase ? inputUnits * 10 ** amm.account.quoteMintDecimals : inputUnits * 10 ** amm.account.baseMintDecimals
                    setSwapSummary(await ammClient.getSwapPreview(amm.account, new BN(inputAmount), isBuyBase))
                } catch (e) { }
            }
        })()
    }, [amm, connected, ammClient, inputUnits, isBuyBase])

    const [condMetaWalletBalanceUnits, setCondMetaWalletBalanceUnits] = useState(0)
    const [condUsdcWalletBalanceUnits, setCondUsdcWalletBalanceUnits] = useState(0)

    useEffect(() => {
        ; (async () => {
            if (connected && autocratClient) {
                let condMetaATA = getATA(amm.account.baseMint, autocratClient.provider.publicKey)[0]
                let condMetaBalance = await autocratClient.provider.connection.getTokenAccountBalance(condMetaATA)
                setCondMetaWalletBalanceUnits(condMetaBalance.value.uiAmount)

                let condUsdcATA = getATA(amm.account.quoteMint, autocratClient.provider.publicKey)[0]
                let condUsdcBalance = await autocratClient.provider.connection.getTokenAccountBalance(condUsdcATA)
                setCondUsdcWalletBalanceUnits(condUsdcBalance.value.uiAmount)
            }
        })()
    }, [amm, connected, autocratClient])

    const [ammPosition, setAmmPosition] = useState(undefined)
    const [ownershipFraction, setOwnershipFraction] = useState(0)

    useEffect(() => {
        ; (async () => {
            if (connected && ammClient) {
                try {
                    let position = await ammClient.getUserPositionForAmm(amm.publicKey)
                    setAmmPosition(position)

                    let ownership = position.account.ownership.toNumber()
                    let totalOwnership = amm.account.totalOwnership.toNumber()

                    setOwnershipFraction(ownership / totalOwnership)
                } catch (e) { }
            }
        })()
    }, [amm, connected, ammClient])

    const [withdrawFraction, setWithdrawFraction] = useState(0)

    const handleUpdateWithdrawFraction = (percent: number) => {
        setWithdrawFraction(percent / 100)
    }

    return (
        <div className="w-full p-4 mb-10 rounded-lg card bg-secondary">
            <div className="flex flex-col justify-center">
                <div className="text-xl font-bold text-center">{isPassMarket ? "Pass" : "Fail"} Market</div>
                <div className="text-lg text-center">Avg. Price: ${toFormattedNumber(ltwap)}</div>
                <br />

                <div className="text-lg text-center">Current Price: ${toFormattedNumber(price)}</div>
                <br />

                <div className="text-lg text-center">{isPassMarket ? "pMETA" : "fMETA"} Liquidity: {toFormattedNumber(baseTokenUnits)}</div>
                <div className="text-lg text-center">{isPassMarket ? "pUSDC" : "fUSDC"} Liquidity: {toFormattedNumber(quoteTokenUnits)}</div>

                <div className="flex flex-col w-full px-6">
                    <div className="divider divider-info"></div>
                </div>

                <div className="text-center text-md">Trade</div>

                <div className="flex flex-row justify-center">
                    <div className="flex flex-col justify-center w-60">
                        <div className="">
                            <label className="py-3 my-0 cursor-pointer label">
                                <span className="label-text">{isBuyBase ? "Buy" : "Sell"} {isPassMarket ? "pMETA" : "fMETA"}</span>
                                <input type="checkbox" className={isBuyBase ? "toggle toggle-success" : "toggle bg-error"} checked={isBuyBase} onChange={() => handleToggleBuySell()} />
                            </label>
                        </div>

                        <label className="w-full max-w-xs mb-2 form-control">
                            <div className="pt-0 label">
                                <span className="label-text">{isBuyBase ? (isPassMarket ? "pUSDC" : "fUSDC") : (isPassMarket ? "pMETA" : "fMETA")}</span>
                            </div>
                            <input type="text" placeholder="0.00" className="w-full max-w-xs input input-sm input-bordered" data-1p-ignore data-bwignore data-lpignore="true" data-form-type="other"
                                onChange={(x) => setInputUnits(Number(x.target.value))}
                            />
                            <div className="label">
                                <span className="label-text-alt">Balance:</span>
                                <span className="label-text-alt">{isBuyBase ? condUsdcWalletBalanceUnits : condMetaWalletBalanceUnits}</span>
                            </div>
                            <div className="py-0 my-0 label">
                                <span className="label-text-alt">Price Impact:</span>
                                <span className="label-text-alt">{toFormattedNumber(swapSummary ? swapSummary.priceImpact * 100 : 0)}%</span>
                            </div>
                            <div className="py-0 my-0 label">
                                <span className="label-text-alt">Avg. Swap Price:</span>
                                <span className="label-text-alt">{toFormattedNumber(swapSummary ? (swapSummary.avgSwapPrice || 0) : 0)}</span>
                            </div>
                            <div className="py-0 my-0 label">
                                <span className="label-text-alt">Post Swap Price:</span>
                                <span className="label-text-alt">{toFormattedNumber(swapSummary ? swapSummary.finalPrice : 0)}</span>
                            </div>
                        </label>

                        < TxButton
                            buttonLabel="Swap"
                            handleCall={async () =>
                                await autocratClient.provider.connection.requestAirdrop(
                                    autocratClient.provider.publicKey,
                                    100 * 10 ** 9 // 100 SOL should do it
                                )
                            }
                        />
                    </div>
                </div>

                <div className="flex flex-col w-full px-6">
                    <div className="divider divider-info"></div>
                </div>

                <div className="mb-2 text-center text-md">Liquidity Provision</div>

                <div className="flex flex-row justify-center">
                    <div className="flex flex-col justify-center w-60">
                        <label className="w-full max-w-xs form-control">
                            <div className="label">
                                <span className="label-text">{isPassMarket ? "pMETA" : "fMETA"}</span>
                            </div>
                            <input type="text" placeholder="0.00" className="w-full max-w-xs input input-sm input-bordered" data-1p-ignore data-bwignore data-lpignore="true" data-form-type="other" />
                            <div className="label">
                                <span className="label-text-alt">Balance:</span>
                                <span className="label-text-alt">{condMetaWalletBalanceUnits}</span>
                            </div>
                        </label>
                        <label className="w-full max-w-xs form-control ">
                            <div className="label">
                                <span className="label-text">{isPassMarket ? "pUSDC" : "fUSDC"}</span>
                            </div>
                            <input type="text" placeholder="0.00" className="w-full max-w-xs input input-sm input-bordered" data-1p-ignore data-bwignore data-lpignore="true" data-form-type="other" />
                            <div className="label">
                                <span className="label-text-alt">Balance:</span>
                                <span className="label-text-alt">{condUsdcWalletBalanceUnits}</span>
                            </div>
                        </label>

                        < TxButton
                            buttonLabel="Provide Liquidity"
                            handleCall={async () => {
                                let ixh = await autocratClient.addLiquidityCpi(
                                    proposal.publicKey,
                                    amm.publicKey,
                                    new BN(0),
                                    new BN(0),
                                    new BN(0),
                                    new BN(0)
                                )
                                return await ixh.rpc()
                            }}
                        />
                    </div>
                </div>

                {ammPosition &&
                    < div className="flex flex-col w-full px-6">
                        <div className="divider divider-info"></div>
                    </div>
                }

                {ammPosition &&
                    <div className="mb-2 text-center text-md">LP Position</div>
                }

                {ammPosition &&
                    <div className="flex flex-row justify-center">
                        <div className="flex flex-col justify-center w-60">
                            <label className="w-full max-w-xs form-control">
                                <div className="label">
                                    <span className="label-text-alt">Conditional Value:</span>
                                    <span className="label-text-alt">${toFormattedNumber(ownershipFraction * quoteTokenUnits + ownershipFraction * baseTokenUnits * price)}</span>
                                </div>
                                <div className="py-0 my-0 label">
                                    <span className="label-text-alt">{isPassMarket ? "pMETA" : "fMETA"}</span>
                                    <span className="label-text-alt">{ownershipFraction * baseTokenUnits}</span>
                                </div>
                                <div className="py-0 my-0 label">
                                    <span className="label-text-alt">{isPassMarket ? "pUSDC" : "fUSDC"}</span>
                                    <span className="label-text-alt">{ownershipFraction * quoteTokenUnits}</span>
                                </div>
                            </label>

                            <div className="mb-2">
                                <div className="label">
                                    <span className="label-text-alt">Withdraw Percent:</span>
                                    <span className="label-text-alt">{toFormattedNumber(withdrawFraction * 100)}%</span>
                                </div>
                                <input type="range" min={0} max="100" value={withdrawFraction * 100} className="mb-2 range range-sm" onChange={(x) => handleUpdateWithdrawFraction(Number(x.target.value))} />
                                <div className="py-0 my-0 label">
                                    <span className="label-text-alt">{isPassMarket ? "pMETA" : "fMETA"} to withdraw:</span>
                                    <span className="label-text-alt">{toFormattedNumber(ownershipFraction * baseTokenUnits * withdrawFraction)}</span>
                                </div>
                                <div className="py-0 my-0 label">
                                    <span className="label-text-alt">{isPassMarket ? "pUSDC" : "fUSDC"} to withdraw:</span>
                                    <span className="label-text-alt">{toFormattedNumber(ownershipFraction * quoteTokenUnits * withdrawFraction)}</span>
                                </div>
                            </div>

                            < TxButton
                                buttonLabel="Withdraw"
                                handleCall={async () => {
                                    let withdrawBps = Math.round(withdrawFraction * 100 * 100)
                                    let ixh = await autocratClient.removeLiquidityCpi(
                                        proposal.publicKey,
                                        amm.publicKey,
                                        new BN(withdrawBps)
                                    )
                                    return await ixh.rpc()
                                }}
                            />
                        </div>
                    </div>
                }
            </div>
        </div >
    )
}