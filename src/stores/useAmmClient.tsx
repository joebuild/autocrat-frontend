import create, { State } from 'zustand'
import { AmmClient } from '@themetadao/autocrat-sdk'

interface AmmClientStore extends State {
    client: AmmClient
    setClient: (c: any) => void
}

const useAmmClientStore = create<AmmClientStore>((set, _get) => ({
    client: undefined,
    setClient: (client) =>
        set((state) => ({
            client: client,
        })),
}))

export default useAmmClientStore
