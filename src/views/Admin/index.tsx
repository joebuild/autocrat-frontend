import { FC, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Keypair, PublicKey } from '@solana/web3.js'
import { TxButton } from 'components/TxButton'
import useAutocratClientStore from 'stores/useAutocratClient'
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccount, createMint, mintTo } from '@solana/spl-token'
import { getATA, getDaoAddr, getProposalAddr, getProposalVaultAddr, sleep } from '@themetadao/autocrat-sdk'
import BN from 'bn.js'
import { MEMO_PROGRAM_ID } from "@solana/spl-memo";

interface IState {

}

export const AdminView: FC = ({ }) => {
    const { connected, publicKey } = useWallet()
    const { client: autocratClient } = useAutocratClientStore()

    const mockMetaMint = useRef(PublicKey.default);
    const mockUsdcMint = useRef(PublicKey.default);

    return (
        <div className="w-screen min-h-full px-2 pb-10 overflow-x-hidden">
            <h1 className="mb-6 font-black text-center">Admin</h1>

            {connected &&
                autocratClient &&
                < section>
                    <h2 className="font-black text-left">Local Testing</h2>

                    < TxButton
                        buttonLabel="1. Airdrop SOL"
                        handleCall={async () =>
                            await autocratClient.provider.connection.requestAirdrop(
                                autocratClient.provider.publicKey,
                                100 * 10 ** 9 // 100 SOL should do it
                            )
                        }
                    />

                    <br />

                    < TxButton
                        buttonLabel="2. Create Mock META Mint (and then mint tokens)"
                        handleCall={async () => {
                            let mintPayer = Keypair.generate()
                            let mintAuth = Keypair.generate()

                            console.log("Requesting SOL airdrop for mint payer..")

                            await autocratClient.provider.connection.requestAirdrop(
                                mintPayer.publicKey,
                                1 * 10 ** 9
                            )

                            await sleep(1000)

                            console.log("Creating mint..")

                            let mint = await createMint(
                                autocratClient.provider.connection,
                                mintPayer,
                                mintAuth.publicKey,
                                mintAuth.publicKey,
                                9,
                                mintAuth,
                                {},
                                TOKEN_PROGRAM_ID
                            );

                            console.log("Mint:", mint.toBase58())
                            mockMetaMint.current = mint

                            await sleep(1000)

                            console.log("Creating user ATA..")

                            const userATA = await createAssociatedTokenAccount(
                                autocratClient.provider.connection,
                                mintPayer,
                                mint,
                                autocratClient.provider.wallet.publicKey
                            );

                            await sleep(1000)

                            console.log("Minting tokens to user")

                            return await mintTo(
                                autocratClient.provider.connection,
                                mintPayer,
                                mint,
                                userATA,
                                mintAuth,
                                10 ** 15
                            );
                        }}
                    />

                    <br />

                    < TxButton
                        buttonLabel="3. Create Mock USDC Mint (and then mint tokens)"
                        handleCall={async () => {
                            let mintPayer = Keypair.generate()
                            let mintAuth = Keypair.generate()

                            console.log("Requesting SOL airdrop for mint payer..")

                            await autocratClient.provider.connection.requestAirdrop(
                                mintPayer.publicKey,
                                1 * 10 ** 9
                            )

                            await sleep(1000)

                            console.log("Creating mint..")

                            let mint = await createMint(
                                autocratClient.provider.connection,
                                mintPayer,
                                mintAuth.publicKey,
                                mintAuth.publicKey,
                                6,
                                mintAuth,
                                {},
                                TOKEN_PROGRAM_ID
                            );

                            console.log("Mint:", mint.toBase58())
                            mockUsdcMint.current = mint

                            await sleep(1000)

                            console.log("Creating user ATA..")

                            const userATA = await createAssociatedTokenAccount(
                                autocratClient.provider.connection,
                                mintPayer,
                                mint,
                                autocratClient.provider.wallet.publicKey
                            );

                            await sleep(1000)

                            console.log("Minting tokens to user")

                            return await mintTo(
                                autocratClient.provider.connection,
                                mintPayer,
                                mint,
                                userATA,
                                mintAuth,
                                10 ** 15
                            );
                        }}
                    />

                    <br />

                    < TxButton
                        buttonLabel="4. Initialize DAO"
                        handleCall={async () => {
                            console.log(mockMetaMint.current.toBase58())
                            console.log(mockUsdcMint.current.toBase58())

                            return (await autocratClient.initializeDao(mockMetaMint.current, mockUsdcMint.current)).rpc()
                        }}
                    />

                    <br />

                    < TxButton
                        buttonLabel="5. Create and Submit Proposal (all steps)"
                        handleCall={async () => {
                            const daoAddr = getDaoAddr(autocratClient.program.programId)[0]
                            let daoAccount = await autocratClient.program.account.dao.fetch(daoAddr)

                            const priorityFee = 10_000

                            const proposalNumber = daoAccount.proposalCount.toNumber()

                            const proposalUrl = "url-for-my-cool-proposal"

                            const passMarketInitialPrice = 1030
                            const failMarketInitialPrice = 1000

                            // ==== calculate LP deposit amounts
                            const minUsdcLiquidity = daoAccount.ammInitialQuoteLiquidityAmount.toNumber() / 10 ** 6

                            const cMetaForPassMarket = (minUsdcLiquidity / passMarketInitialPrice) * 10 ** 9
                            const cMetaForFailMarket = (minUsdcLiquidity / failMarketInitialPrice) * 10 ** 9

                            const cMetaToMint = Math.max(cMetaForPassMarket, cMetaForFailMarket)

                            console.log("Creating proposal..")

                            let dao = await autocratClient.program.account.dao.fetch(daoAddr)

                            let proposalAddr = getProposalAddr(autocratClient.program.programId, proposalNumber)[0]
                            let proposalVaultAddr = getProposalVaultAddr(autocratClient.program.programId, proposalAddr)[0]

                            console.log('proposer: ', autocratClient.provider.publicKey.toBase58())
                            console.log('dao: ', daoAddr.toBase58())
                            console.log('proposal: ', proposalAddr.toBase58())
                            console.log('proposal vault: ', proposalVaultAddr.toBase58())
                            console.log('metaMint: ', dao.metaMint.toBase58())
                            console.log('usdcMint: ', dao.usdcMint.toBase58())
                            console.log('metaProposerAta: ', getATA(dao.metaMint, autocratClient.provider.publicKey)[0].toBase58())
                            console.log('usdcProposerAta: ', getATA(dao.usdcMint, autocratClient.provider.publicKey)[0].toBase58())
                            console.log('metaVaultAta: ', getATA(dao.metaMint, proposalVaultAddr)[0].toBase58())
                            console.log('usdcVaultAta: ', getATA(dao.usdcMint, proposalVaultAddr)[0].toBase58())

                            // ==== create proposal
                            let createPropIxh = await autocratClient.createProposal(
                                proposalNumber,
                                proposalUrl,
                                new BN(cMetaToMint),
                                daoAccount.ammInitialQuoteLiquidityAmount,
                            )
                            await createPropIxh
                                .setPriorityFee(priorityFee)
                                .rpc();

                            // ==== create proposal instruction account
                            const memoText =
                                "I, glorious autocrat of the divine Meta-DAO, " +
                                "hereby endorse this endeavor to elevate the futarchy domain. " +
                                "Recognize that my utterance echoes not the voice of a mortal but resonates as the proclamation of an omniscient market." +
                                "Onward, futards, with the swiftness of the divine!";

                            const memoInstruction = {
                                programId: new PublicKey(MEMO_PROGRAM_ID),
                                data: Buffer.from(memoText),
                                accounts: [],
                            };

                            console.log("Creating proposal instructions..")

                            let createPropIxIxh = await autocratClient.createProposalInstructions(proposalNumber, [memoInstruction]);
                            await createPropIxIxh
                                .setPriorityFee(priorityFee)
                                .rpc();

                            console.log("Creating pass market..")

                            // ==== create pass market
                            let createPassMarketIxh = await autocratClient.createProposalMarketSide(
                                proposalNumber,
                                true,
                                new BN(cMetaForPassMarket),
                                daoAccount.ammInitialQuoteLiquidityAmount,
                            )
                            await createPassMarketIxh
                                .setPriorityFee(priorityFee)
                                .setComputeUnits(400_000)
                                .rpc();

                            console.log("Creating fail market..")

                            // ==== create fail market
                            let createFailMarketIxh = await autocratClient.createProposalMarketSide(
                                proposalNumber,
                                false,
                                new BN(cMetaForFailMarket),
                                daoAccount.ammInitialQuoteLiquidityAmount,
                            )
                            await createFailMarketIxh
                                .setPriorityFee(priorityFee)
                                .setComputeUnits(400_000)
                                .rpc();


                            await sleep(1000)

                            console.log("Submitting proposal..")

                            let proposalAccount = await autocratClient.program.account.proposal.fetch(proposalAddr)

                            console.log("Pass market AMM", proposalAccount.passMarketAmm.toBase58())
                            console.log("Fail market AMM", proposalAccount.failMarketAmm.toBase58())

                            // ==== submit proposal
                            let submitProposalIxh = await autocratClient.submitProposal(
                                proposalNumber,
                            );
                            return await submitProposalIxh
                                .setPriorityFee(priorityFee)
                                .setComputeUnits(400_000)
                                .rpc();
                        }}
                    />
                </section>
            }


        </div>
    )
}
