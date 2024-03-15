import { Proposal } from '@themetadao/autocrat-sdk'
import create, { State } from 'zustand'

interface ConditionalAmmsStore extends State {
    conditionalAmms: Map<string, Proposal>
    setConditionalAmms: (k: any, v: any) => void
}

const useConditionalAmms = create<ConditionalAmmsStore>((set, _get) => ({
    conditionalAmms: new Map(),
    setConditionalAmms: (key, value) =>
        set((state) => ({
            conditionalAmms: new Map(state.conditionalAmms).set(key, value),
        })),
}))

export default useConditionalAmms
