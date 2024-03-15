import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { TabsContent } from '@radix-ui/react-tabs'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import { ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import useProposalStore from 'stores/useProposalStore'
import useConditionalAmmsStore from 'stores/useConditionalAmmsStore'
import { Button } from 'components/ui/button'
import { ConditionalMarketCard } from 'components/proposals/ConditionalMarketCard'
import { ProposalHeaderCard } from 'components/proposals/ProposalHeaderCard'

interface State {

}

const Page = () => {
    const router = useRouter()
    const { id } = router.query

    const { publicKey } = useWallet()

    const { proposals } = useProposalStore()
    const { conditionalAmms } = useConditionalAmmsStore()

    const [proposal, setProposal] = useState(undefined)

    const [passMarketAmm, setPassMarketAmm] = useState(undefined)
    const [failMarketAmm, setFailMarketAmm] = useState(undefined)

    useEffect(() => {
        if (proposals && id) {
            setProposal(proposals.get(+id))
        }
    }, [id, proposals])

    useEffect(() => {
        if (conditionalAmms && proposal && id) {
            setPassMarketAmm(conditionalAmms.get(proposal.account.passMarketAmm.toBase58()))
            setFailMarketAmm(conditionalAmms.get(proposal.account.failMarketAmm.toBase58()))
        }
    }, [id, proposal, conditionalAmms])

    return (
        <section className="container mx-auto">
            <h1 className="mb-4 font-black text-center capitalize">Proposal #{id} - {proposal && Object.keys(proposal.account.state)[0]}</h1>
            {proposal && <ProposalHeaderCard proposal={proposal} />}
            {passMarketAmm && failMarketAmm &&
                <div className="flex flex-row gap-4 space-between">
                    <ConditionalMarketCard proposal={proposal} amm={passMarketAmm} isPassMarket={true} />
                    <ConditionalMarketCard proposal={proposal} amm={failMarketAmm} isPassMarket={false} />
                </div>
            }
        </section >
    )
}

export default Page
