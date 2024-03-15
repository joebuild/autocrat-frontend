import { FC, } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import useProposalStore from 'stores/useProposalStore'
import useConditionalAmmsStore from 'stores/useConditionalAmmsStore'
import { ProposalSummaryCard } from '../../components/proposals/ProposalSummaryCard'

interface IState {

}

export const ProposalsView: FC = ({ }) => {
    const { publicKey } = useWallet()

    const { proposals } = useProposalStore()
    const { conditionalAmms } = useConditionalAmmsStore()

    return (
        <div className="w-screen min-h-full px-2 pb-10 overflow-x-hidden">
            <h1 className="mb-10 font-black text-center">Proposals</h1>
            <div className="flex flex-col gap-4 mx-8">
                {Array.from(proposals.keys())
                    .filter(k => proposals.get(k).account.slotEnqueued.toNumber() > 0)
                    .sort((ak, bk) => proposals.get(ak).account.slotEnqueued.toNumber() > proposals.get(bk).account.slotEnqueued.toNumber() ? -1 : 1)
                    .map((k) => <ProposalSummaryCard proposal={proposals.get(k)} key={k} />)}
            </div>

        </div>
    )
}
