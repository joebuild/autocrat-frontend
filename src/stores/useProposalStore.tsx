import { Proposal, ProposalWrapper } from '@themetadao/autocrat-sdk'
import create, { State } from 'zustand'

interface ProposalStore extends State {
    proposals: Map<number, ProposalWrapper>
    setProposals: (k: any, v: any) => void
}

const useProposalStore = create<ProposalStore>((set, _get) => ({
    proposals: new Map(),
    setProposals: (key, value) =>
        set((state) => ({
            proposals: new Map(state.proposals).set(key, value),
        })),
}))

export default useProposalStore
