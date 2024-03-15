import type { NextPage } from 'next'
import Head from 'next/head'
import { ProposalsView } from '../../views'

const Proposal: NextPage = (props) => {
    return (
        <div className="z-0">
            <Head>
                <title>MetaDAO | Proposal</title>
                <meta name="description" content="MetaDAO | Proposal" />
            </Head>
            <ProposalsView />
        </div>
    )
}

export default Proposal
