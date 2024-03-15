import create, { State } from 'zustand'
import { AutocratClient } from '@themetadao/autocrat-sdk'

interface AutocratClientStore extends State {
    client: AutocratClient
    setClient: (c: any) => void
}

const useAutocratClientStore = create<AutocratClientStore>((set, _get) => ({
    client: undefined,
    setClient: (client) =>
        set((state) => ({
            client: client,
        })),
}))

export default useAutocratClientStore
