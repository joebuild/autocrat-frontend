import { useWallet } from '@solana/wallet-adapter-react'
import { AmmPositionWrapper, AmmWrapper, ProposalWrapper, SwapPreview, getATA } from '@themetadao/autocrat-sdk'
import BN from 'bn.js'
import React, { FunctionComponent, useEffect, useRef } from 'react'
import useAmmClientStore from 'stores/useAmmClient'
import useAutocratClientStore from 'stores/useAutocratClient'
import { toFormattedNumber } from 'utils/numberFormat'
import { TxButton } from 'components/TxButton'
import useState from 'react-usestateref'

interface IProps {
    proposal: ProposalWrapper,
    amm: AmmWrapper
    isPassMarket: boolean
}

interface IState {
    swapSummary: SwapPreview
    condMetaWalletBalanceUnits: number
    condUsdcWalletBalanceUnits: number
    ammPosition: AmmPositionWrapper
    ownershipFraction: number
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

    const [stateValue, setStateValue, stateValueRef] = useState<IState>({
        swapSummary: undefined,
        condMetaWalletBalanceUnits: 0,
        condUsdcWalletBalanceUnits: 0,
        ammPosition: undefined,
        ownershipFraction: 0,
    })

    const [isBuyBase, setIsBuyBase, isBuyBaseRef] = useState(true)
    const [inputUnits, setInputUnits, inputUnitsRef] = useState(0)
    const [withdrawFraction, setWithdrawFraction, withdrawFractionRef] = useState(0)

    const handleToggleBuySell = () => {
        console.log("handleToggleBuySell")
        setIsBuyBase(x => !x)
    }

    const handleUpdateInputUnits = (newInputUnits: number) => {
        console.log("handleUpdateInputUnits")
        setInputUnits(newInputUnits)
    }

    const handleUpdateWithdrawFraction = (percent: number) => {
        console.log("handleUpdateWithdrawFraction")
        setWithdrawFraction(percent / 100)
    }

    useEffect(() => {
        ; (async () => {
            if (connected && amm && ammClient) {
                console.log("updating swapSummary")

                try {
                    let inputAmount = isBuyBase ? inputUnits * 10 ** amm.account.quoteMintDecimals : inputUnits * 10 ** amm.account.baseMintDecimals

                    setStateValue((val) => ({
                        ...val,
                        swapSummary: ammClient.getSwapPreview(amm.account, new BN(inputAmount), isBuyBase)
                    }))
                } catch (e) { }
            }
        })()
    }, [amm, connected, ammClient, isBuyBase, inputUnits])

    useEffect(() => {
        ; (async () => {
            if (connected && autocratClient) {
                console.log("updating balances")

                let condMetaATA = getATA(amm.account.baseMint, autocratClient.provider.publicKey)[0]
                let condMetaBalance = await autocratClient.provider.connection.getTokenAccountBalance(condMetaATA)

                let condUsdcATA = getATA(amm.account.quoteMint, autocratClient.provider.publicKey)[0]
                let condUsdcBalance = await autocratClient.provider.connection.getTokenAccountBalance(condUsdcATA)

                setStateValue((val) => ({
                    ...val,
                    condMetaWalletBalanceUnits: condMetaBalance.value.uiAmount,
                    condUsdcWalletBalanceUnits: condUsdcBalance.value.uiAmount
                }))
            }
        })()
    }, [amm, connected, autocratClient])

    useEffect(() => {
        ; (async () => {
            if (connected && ammClient) {
                console.log("updating amm position and ownership")

                try {
                    let position = await ammClient.getUserPositionForAmm(amm.publicKey)

                    let ownership = position.account.ownership.toNumber()
                    let totalOwnership = amm.account.totalOwnership.toNumber()

                    setStateValue((val) => ({
                        ...val,
                        ammPosition: position,
                        ownershipFraction: ownership / totalOwnership
                    }))
                } catch (e) { }
            }
        })()
    }, [amm, connected, ammClient])

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
                                onChange={(x) => handleUpdateInputUnits(Number(x.target.value))}
                            />
                            <div className="label">
                                <span className="label-text-alt">Balance:</span>
                                <span className="label-text-alt">{isBuyBase ? stateValue.condUsdcWalletBalanceUnits : stateValue.condMetaWalletBalanceUnits}</span>
                            </div>
                            <div className="py-0 my-0 label">
                                <span className="label-text-alt">Price Impact:</span>
                                <span className="label-text-alt">{toFormattedNumber(stateValue.swapSummary ? stateValue.swapSummary.priceImpact * 100 : 0)}%</span>
                            </div>
                            <div className="py-0 my-0 label">
                                <span className="label-text-alt">Avg. Swap Price:</span>
                                <span className="label-text-alt">{toFormattedNumber(stateValue.swapSummary ? (stateValue.swapSummary.avgSwapPrice || 0) : 0)}</span>
                            </div>
                            <div className="py-0 my-0 label">
                                <span className="label-text-alt">Est. Post Swap Price:</span>
                                <span className="label-text-alt">{toFormattedNumber(stateValue.swapSummary ? stateValue.swapSummary.finalPrice : 0)}</span>
                            </div>
                        </label>

                        < TxButton
                            buttonLabel="Swap"
                            handleCall={async () => {
                                console.log("Swap Summary:")
                                console.log(JSON.stringify(stateValueRef.current.swapSummary))

                                let ixh = await autocratClient.swapCpi(
                                    proposal.publicKey,
                                    amm.publicKey,
                                    isBuyBaseRef.current,
                                    stateValueRef.current.swapSummary.inputAmount,
                                    stateValueRef.current.swapSummary.outputAmount.mul(new BN(99)).div(new BN(100)) // 1% slippage tolerance
                                )
                                return await ixh.rpc()
                            }}
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
                                <span className="label-text-alt">{stateValue.condMetaWalletBalanceUnits}</span>
                            </div>
                        </label>
                        <label className="w-full max-w-xs form-control ">
                            <div className="label">
                                <span className="label-text">{isPassMarket ? "pUSDC" : "fUSDC"}</span>
                            </div>
                            <input type="text" placeholder="0.00" className="w-full max-w-xs input input-sm input-bordered" data-1p-ignore data-bwignore data-lpignore="true" data-form-type="other" />
                            <div className="label">
                                <span className="label-text-alt">Balance:</span>
                                <span className="label-text-alt">{stateValue.condUsdcWalletBalanceUnits}</span>
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

                {stateValue.ammPosition &&
                    < div className="flex flex-col w-full px-6">
                        <div className="divider divider-info"></div>
                    </div>
                }

                {stateValue.ammPosition &&
                    <div className="mb-2 text-center text-md">LP Position</div>
                }

                {stateValue.ammPosition &&
                    <div className="flex flex-row justify-center">
                        <div className="flex flex-col justify-center w-60">
                            <label className="w-full max-w-xs form-control">
                                <div className="label">
                                    <span className="label-text-alt">Conditional Value:</span>
                                    <span className="label-text-alt">${toFormattedNumber(stateValue.ownershipFraction * quoteTokenUnits + stateValue.ownershipFraction * baseTokenUnits * price)}</span>
                                </div>
                                <div className="py-0 my-0 label">
                                    <span className="label-text-alt">{isPassMarket ? "pMETA" : "fMETA"}</span>
                                    <span className="label-text-alt">{stateValue.ownershipFraction * baseTokenUnits}</span>
                                </div>
                                <div className="py-0 my-0 label">
                                    <span className="label-text-alt">{isPassMarket ? "pUSDC" : "fUSDC"}</span>
                                    <span className="label-text-alt">{stateValue.ownershipFraction * quoteTokenUnits}</span>
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
                                    <span className="label-text-alt">{toFormattedNumber(stateValue.ownershipFraction * baseTokenUnits * withdrawFraction)}</span>
                                </div>
                                <div className="py-0 my-0 label">
                                    <span className="label-text-alt">{isPassMarket ? "pUSDC" : "fUSDC"} to withdraw:</span>
                                    <span className="label-text-alt">{toFormattedNumber(stateValue.ownershipFraction * quoteTokenUnits * withdrawFraction)}</span>
                                </div>
                            </div>

                            < TxButton
                                buttonLabel="Withdraw"
                                handleCall={async () => {
                                    let withdrawBps = Math.round(withdrawFractionRef.current * 100 * 100)
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